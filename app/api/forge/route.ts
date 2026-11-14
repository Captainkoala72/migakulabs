import { consumeRun, sameOrigin } from "@/lib/server/access";
import { ProviderError, callModel, preflight, type ModelEvent } from "@/lib/server/providers";
import { buildSystemPrompt } from "@/lib/forge/prompts";
import { clampIntensity } from "@/lib/forge/intensity";
import { getTarget } from "@/lib/forge/templates";
import { MAX_IMAGE_BYTES, MAX_IMAGES, MAX_TOTAL_IMAGE_BYTES, type PromptImage } from "@/lib/forge/images";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MAX_INPUT_CHARS = 30_000;
const MAX_INSTRUCTION_CHARS = 8_000;

function json(message: string, status: number, headers: Record<string, string> = {}) {
  return Response.json({ message }, { status, headers });
}

function parseImages(value: unknown): { images: PromptImage[]; error?: string; status?: number } {
  if (value === undefined) return { images: [] };
  if (!Array.isArray(value) || value.length > MAX_IMAGES) {
    return { images: [], error: `Attach no more than ${MAX_IMAGES} images.`, status: 400 };
  }
  const images: PromptImage[] = [];
  let total = 0;
  for (const item of value) {
    if (!item || typeof item !== "object") return { images: [], error: "An image attachment is invalid.", status: 400 };
    const name = typeof item.name === "string" ? item.name.trim().slice(0, 120) : "";
    const dataUrl = typeof item.dataUrl === "string" ? item.dataUrl : "";
    const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl);
    if (!name || !match) return { images: [], error: "Attach a valid PNG, JPEG or WebP image.", status: 400 };
    const encoded = match[2];
    if (encoded.length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4 + 4) {
      return { images: [], error: "An image is over the 2 MB limit.", status: 413 };
    }
    const bytes = Buffer.from(encoded, "base64");
    const type = match[1];
    const validSignature =
      (type === "png" && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) ||
      (type === "jpeg" && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) ||
      (type === "webp" && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP");
    if (!bytes.length || !validSignature) {
      return { images: [], error: `${name} is not a valid ${type.toUpperCase()} image.`, status: 400 };
    }
    total += bytes.length;
    if (total > MAX_TOTAL_IMAGE_BYTES) return { images: [], error: "Images exceed the 2.5 MB combined limit.", status: 413 };
    images.push({ name, dataUrl, bytes: bytes.length });
  }
  return { images };
}

/** Local UI testing without spending credits: FORGE_MOCK=1 with `npm run dev`. */
async function* mockStream(input: string, intensity: number): AsyncGenerator<ModelEvent> {
  const lines = [
    `You are an expert assistant. (Mock run at intensity ${intensity} — set real API keys to use a model.)`,
    "",
    "TASK",
    input.trim(),
    "",
    "REQUIREMENTS",
    "- State assumptions before answering.",
    "- Keep the answer under 300 words.",
    "",
    "OUTPUT",
    "A short, well-structured response with a one-line summary first.",
  ];
  const text = lines.join("\n");
  for (let i = 0; i < text.length; i += 6) {
    await new Promise((r) => setTimeout(r, 12));
    yield { type: "delta", text: text.slice(i, i + 6) };
  }
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json("Cross-site requests aren't allowed.", 403);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json("Request body isn't valid JSON.", 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return json("Request body must be an object.", 400);

  const input = typeof body.input === "string" ? body.input.trim() : "";
  const instructions = typeof body.instructions === "string" ? body.instructions.trim() : "";
  const model = typeof body.model === "string" ? body.model : "";
  const effort = typeof body.effort === "string" ? body.effort : "";
  const webSearch = body.webSearch === true;
  const intensity = clampIntensity(body.intensity);
  const format = body.format === "natural" ? "natural" : "structured";
  const target = typeof body.target === "string" && getTarget(body.target) ? body.target : "auto";

  if (!input) return json("Write a prompt to work on first.", 400);
  if (input.length > MAX_INPUT_CHARS) {
    return json(`That's ${input.length.toLocaleString()} characters. Trim it to ${MAX_INPUT_CHARS.toLocaleString()} or fewer.`, 413);
  }
  if (instructions.length > MAX_INSTRUCTION_CHARS) {
    return json(`Keep instructions for the AI to ${MAX_INSTRUCTION_CHARS.toLocaleString()} characters or fewer.`, 413);
  }
  const parsed = parseImages(body.images);
  if (parsed.error) return json(parsed.error, parsed.status ?? 400);

  const mock = process.env.FORGE_MOCK === "1" && process.env.NODE_ENV !== "production";
  if (!mock) {
    try {
      preflight({ model, effort, images: parsed.images, webSearch });
    } catch (error) {
      if (error instanceof ProviderError) return json(error.message, error.status);
      throw error;
    }
  }

  // Spend a run only once the request is known to be valid.
  const allowance = await consumeRun(req);
  const quotaHeaders: Record<string, string> = allowance.unlocked
    ? { "X-Forge-Remaining": "unlimited" }
    : {
        "X-Forge-Limit": String(allowance.limit),
        "X-Forge-Remaining": String(allowance.remaining ?? 0),
        ...(allowance.resetAt ? { "X-Forge-Reset": String(allowance.resetAt) } : {}),
      };
  if (!allowance.allowed) return json(allowance.reason ?? "Run limit reached.", allowance.limit === 0 ? 401 : 429, quotaHeaders);

  const system = buildSystemPrompt({
    intensity,
    targetId: target,
    format,
    hasImages: parsed.images.length > 0,
    instructions,
    webSearch,
  });

  const encoder = new TextEncoder();
  const generation = new AbortController();
  const signal = AbortSignal.any([req.signal, generation.signal]);
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        if (!closed) controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };
      const timeout = setTimeout(
        () => generation.abort(new Error("The model took too long. Try a lower reasoning effort or a shorter prompt.")),
        290_000
      );
      const heartbeat = setInterval(() => {
        if (!closed) controller.enqueue(encoder.encode(": working\n\n"));
      }, 15_000);

      try {
        const events = mock
          ? mockStream(input, intensity)
          : callModel({ model, effort, system, user: input, images: parsed.images, webSearch, signal });
        for await (const event of events) send(event);
        if (!signal.aborted) send({ type: "done" });
      } catch (error: any) {
        if (signal.aborted) {
          if (!req.signal.aborted) send({ type: "error", message: signal.reason?.message ?? "The run was interrupted." });
        } else if (error?.name === "AbortError") {
          /* Visitor pressed stop or left. */
        } else if (error instanceof ProviderError) {
          send({ type: "error", message: error.message, provider: error.provider, status: error.status });
        } else {
          console.error("[forge] unexpected error", error);
          send({ type: "error", message: "The run failed before the model finished. Please retry." });
        }
      } finally {
        clearTimeout(timeout);
        clearInterval(heartbeat);
        if (!closed) {
          closed = true;
          controller.close();
        }
      }
    },
    cancel() {
      closed = true;
      generation.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      ...quotaHeaders,
    },
  });
}
