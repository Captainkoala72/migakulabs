import { MODELS } from "@/lib/forge/catalog";
import type { LabStatus } from "@/lib/forge/types";
import { accessCodeEnabled, peekAllowance } from "@/lib/server/access";
import { modelReadiness } from "@/lib/server/providers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Which instruments are online and how many free runs the caller has left. No secrets. */
export async function GET(req: Request) {
  const mock = process.env.FORGE_MOCK === "1" && process.env.NODE_ENV !== "production";
  const models: LabStatus["models"] = {};
  for (const model of MODELS) {
    models[model.key] = mock ? { ready: true, search: true } : modelReadiness(model);
  }
  const allowance = await peekAllowance(req);
  const status: LabStatus = {
    models,
    access: {
      codeEnabled: accessCodeEnabled(),
      unlocked: allowance.unlocked,
      limit: allowance.limit,
      remaining: allowance.remaining,
      resetAt: allowance.resetAt,
    },
  };
  return Response.json(status, { headers: { "Cache-Control": "no-store" } });
}
