"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { IntensityDial } from "./IntensityDial";
import { Picker, type PickerOption } from "./Picker";
import { Segmented, Toggle } from "./controls";
import { OutputPanel, type OutputView, type Phase } from "./OutputPanel";
import { RunLog } from "./RunLog";
import { DEFAULT_MODEL, MODELS, getModel, providerLabel } from "@/lib/forge/catalog";
import { DEFAULT_INTENSITY, FORMAT_MIN_INTENSITY, INTENSITY, clampIntensity, type OutputFormat } from "@/lib/forge/intensity";
import { DEFAULT_TARGET, TARGETS, getTarget } from "@/lib/forge/templates";
import { MAX_IMAGES, MAX_TOTAL_IMAGE_BYTES, type PromptImage } from "@/lib/forge/images";
import { prepareImage } from "@/lib/forge/clientImages";
import {
  clearRuns,
  deleteRun,
  loadLabKey,
  loadPrefs,
  loadRuns,
  saveLabKey,
  savePrefs,
  saveRun,
} from "@/lib/forge/history";
import type { Run, Source, StreamEvent } from "@/lib/forge/types";
import { useLabStatus } from "@/lib/useLabStatus";

const MAX_INPUT = 30_000;

async function* readEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<StreamEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
    const frames = buffer.split(/\r?\n\r?\n/);
    buffer = done ? "" : frames.pop() ?? "";
    for (const frame of frames) {
      const data = frame
        .split(/\r?\n/)
        .filter((l) => l.startsWith("data:"))
        .map((l) => l.slice(5).trimStart())
        .join("\n");
      if (!data) continue;
      try {
        yield JSON.parse(data) as StreamEvent;
      } catch {
        /* Skip malformed frames. */
      }
    }
    if (done) break;
  }
}

function formatBytes(n: number) {
  return n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
}

function resetLabel(ts: number | null) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function Forge() {
  const { status, refresh } = useLabStatus();

  // Inputs
  const [input, setInput] = useState("");
  const [instructions, setInstructions] = useState("");
  const [directivesOpen, setDirectivesOpen] = useState(false);
  const [images, setImages] = useState<PromptImage[]>([]);
  const [attachError, setAttachError] = useState("");
  const [dragging, setDragging] = useState(false);

  // Controls
  const [target, setTarget] = useState(DEFAULT_TARGET);
  const [intensity, setIntensity] = useState(DEFAULT_INTENSITY);
  const [format, setFormat] = useState<OutputFormat>("structured");
  const [modelKey, setModelKey] = useState(DEFAULT_MODEL);
  const [efforts, setEfforts] = useState<Record<string, string>>({});
  const [search, setSearch] = useState<Record<string, boolean>>({});

  // Run state
  const [phase, setPhase] = useState<Phase>("idle");
  const [output, setOutput] = useState("");
  const [original, setOriginal] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [statusLine, setStatusLine] = useState("");
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [view, setView] = useState<OutputView>("result");
  const [meta, setMeta] = useState<{ model: string; effort: string; intensity: string; target: string } | null>(null);

  // Storage-backed
  const [runs, setRuns] = useState<Run[]>([]);
  const [logOpen, setLogOpen] = useState(false);
  const [labKey, setLabKey] = useState("");
  const [keyDraft, setKeyDraft] = useState("");
  const [keyOpen, setKeyOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const outputRef = useRef("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const model = getModel(modelKey) ?? MODELS[0];
  const effort = model.efforts.some((e) => e.id === efforts[model.key]) ? efforts[model.key] : model.defaultEffort;
  const webSearch = Boolean(search[model.key]);
  const readiness = status?.models[model.key];
  const offline = Boolean(status) && readiness?.ready === false;
  const searchAvailable = !status || readiness?.search !== false;
  const access = status?.access;
  const outOfRuns = Boolean(access && !access.unlocked && access.remaining === 0);

  /* ---------- Hydrate from localStorage ---------- */
  useEffect(() => {
    const prefs = loadPrefs();
    if (prefs.model && getModel(prefs.model)) setModelKey(prefs.model);
    if (typeof prefs.intensity === "number") setIntensity(clampIntensity(prefs.intensity));
    if (prefs.target && getTarget(prefs.target)) setTarget(prefs.target);
    if (prefs.format === "natural" || prefs.format === "structured") setFormat(prefs.format);
    if (prefs.efforts) setEfforts(prefs.efforts);
    if (prefs.search) setSearch(prefs.search);
    setRuns(loadRuns());
    const key = loadLabKey();
    setLabKey(key);
    setKeyDraft(key);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) savePrefs({ model: modelKey, intensity, target, format, efforts, search });
  }, [hydrated, modelKey, intensity, target, format, efforts, search]);

  /* ---------- Options ---------- */
  const modelOptions: PickerOption[] = useMemo(
    () =>
      MODELS.map((m) => {
        const ready = status?.models[m.key]?.ready;
        return {
          value: m.key,
          label: m.label,
          group: providerLabel(m.provider),
          description: [m.vision ? "Images" : "Text only", m.search === "native" ? "Native search" : "Z.ai search"].join(" · "),
          meta: (
            <span className={`led ${status ? (ready ? "ok" : "off") : "off"}`} title={ready ? "Online" : "Offline"} />
          ),
        };
      }),
    [status]
  );

  const targetOptions: PickerOption[] = useMemo(
    () => TARGETS.map((t) => ({ value: t.id, label: t.label, description: t.description, glyph: t.glyph })),
    []
  );

  /* ---------- Attachments ---------- */
  const addFiles = useCallback(
    async (files: File[]) => {
      setAttachError("");
      if (!model.vision) {
        setAttachError(`${model.label} is text-only. Pick GPT-6.1, Claude Haiku 5.5 or GLM 5.3 Flash to use images.`);
        return;
      }
      const room = MAX_IMAGES - images.length;
      if (room <= 0) {
        setAttachError(`Up to ${MAX_IMAGES} images per run.`);
        return;
      }
      const next: PromptImage[] = [];
      for (const file of files.slice(0, room)) {
        try {
          next.push(await prepareImage(file));
        } catch (e: any) {
          setAttachError(e?.message ?? "Couldn't attach that image.");
        }
      }
      const total = [...images, ...next].reduce((sum, img) => sum + img.bytes, 0);
      if (total > MAX_TOTAL_IMAGE_BYTES) {
        setAttachError("Images exceed the 2.5 MB combined limit. Remove one and try again.");
        return;
      }
      if (files.length > room) setAttachError(`Only ${MAX_IMAGES} images per run — extra files were skipped.`);
      setImages((current) => [...current, ...next]);
    },
    [images, model]
  );

  /* ---------- Run ---------- */
  const stop = useCallback(() => abortRef.current?.abort(), []);

  const run = useCallback(async () => {
    if (abortRef.current) return;
    const text = input.trim();
    if (!text) {
      setPhase("error");
      setError("Write or paste a prompt first — even one rough line works.");
      inputRef.current?.focus();
      return;
    }
    if (images.length && !model.vision) {
      setPhase("error");
      setError(`${model.label} can't read images. Remove the attachments or switch to a vision model.`);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    outputRef.current = "";
    setPhase("running");
    setOutput("");
    setSources([]);
    setError("");
    setView("result");
    setStatusLine(webSearch ? "Researching and drafting…" : "Model is reasoning…");
    setOriginal(text);
    const runMeta = {
      model: model.label,
      effort: model.efforts.find((e) => e.id === effort)?.label ?? effort,
      intensity: INTENSITY[intensity].name,
      target: getTarget(target)?.label ?? "Auto",
    };
    setMeta(runMeta);

    const started = performance.now();
    setElapsed(0);
    const timer = window.setInterval(() => setElapsed(performance.now() - started), 100);
    const collected: Source[] = [];

    try {
      const response = await fetch("/api/forge", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(labKey ? { "x-lab-key": labKey } : {}) },
        body: JSON.stringify({
          input: text,
          instructions,
          model: model.key,
          effort,
          intensity,
          format,
          target,
          webSearch,
          images: images.map(({ name, dataUrl }) => ({ name, dataUrl })),
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? `The lab returned ${response.status}. Please retry.`);
      }

      let finished = false;
      for await (const event of readEvents(response.body)) {
        if (event.type === "delta") {
          outputRef.current += event.text;
          setOutput(outputRef.current);
        } else if (event.type === "source") {
          collected.push(event.source);
          setSources([...collected]);
        } else if (event.type === "status") {
          setStatusLine(event.message);
        } else if (event.type === "error") {
          throw new Error(event.message);
        } else if (event.type === "done") {
          finished = true;
        }
      }
      if (!finished) throw new Error("The connection closed before the prompt finished. Please retry.");

      const elapsedMs = performance.now() - started;
      setElapsed(elapsedMs);
      setPhase("done");
      setStatusLine("");
      const record: Run = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        model: model.key,
        effort,
        intensity,
        format,
        target,
        input: text,
        instructions,
        webSearch,
        imageNames: images.map((i) => i.name),
        sources: collected,
        output: outputRef.current,
        elapsedMs,
      };
      setRuns(saveRun(record));
    } catch (e: any) {
      if (controller.signal.aborted) {
        setPhase(outputRef.current ? "done" : "idle");
        setStatusLine("Stopped");
      } else {
        setPhase("error");
        setError(e?.message ?? "Something went wrong. Please retry.");
      }
    } finally {
      window.clearInterval(timer);
      abortRef.current = null;
      refresh();
    }
  }, [input, images, model, effort, intensity, format, target, webSearch, instructions, labKey, refresh]);

  // Ctrl/Cmd + Enter anywhere in the workbench; Escape stops a run.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        run();
      } else if (e.key === "Escape" && abortRef.current && !logOpen) {
        stop();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run, stop, logOpen]);

  useEffect(() => () => abortRef.current?.abort(), []);

  /* ---------- Run log ---------- */
  function restore(item: Run) {
    if (abortRef.current) return;
    setInput(item.input);
    setInstructions(item.instructions ?? "");
    setDirectivesOpen(Boolean(item.instructions));
    if (getModel(item.model)) setModelKey(item.model);
    setEfforts((e) => ({ ...e, [item.model]: item.effort }));
    setIntensity(clampIntensity(item.intensity));
    setFormat(item.format === "natural" ? "natural" : "structured");
    if (getTarget(item.target)) setTarget(item.target);
    setOutput(item.output);
    outputRef.current = item.output;
    setOriginal(item.input);
    setSources(item.sources ?? []);
    setElapsed(item.elapsedMs ?? 0);
    setImages([]);
    setPhase("done");
    setError("");
    setView("result");
    const m = getModel(item.model);
    setMeta({
      model: m?.label ?? item.model,
      effort: m?.efforts.find((e) => e.id === item.effort)?.label ?? item.effort,
      intensity: INTENSITY[item.intensity]?.name ?? "",
      target: getTarget(item.target)?.label ?? "Auto",
    });
    setLogOpen(false);
  }

  function reuse() {
    if (!outputRef.current) return;
    setInput(outputRef.current);
    setOutput("");
    setOriginal("");
    setPhase("idle");
    setMeta(null);
    inputRef.current?.focus();
  }

  function saveKey() {
    saveLabKey(keyDraft);
    setLabKey(keyDraft.trim());
    setKeyOpen(false);
    // Status reads the key from storage, so refresh after saving.
    setTimeout(refresh, 0);
  }

  const charCount = input.length;
  const formatActive = intensity >= FORMAT_MIN_INTENSITY;
  const runDisabled = phase !== "running" && (offline || (outOfRuns && !labKey));

  const runButton = (extraClass = "") =>
    phase === "running" ? (
      <button type="button" className={`btn btn-ghost forge-run ${extraClass}`} onClick={stop}>
        <span className="led signal pulse" aria-hidden="true" /> Stop
        <span className="kbd">Esc</span>
      </button>
    ) : (
      <button type="button" className={`btn btn-primary forge-run ${extraClass}`} onClick={run} disabled={runDisabled}>
        Forge prompt <span className="kbd">Ctrl ↵</span>
      </button>
    );

  return (
    <>
      <div className="forge-toolbar">
        <div className="quota">
          {access ? (
            access.unlocked ? (
              <span className="status-chip">
                <span className="led ok" aria-hidden="true" /> <strong>Lab key active</strong> · unlimited runs
              </span>
            ) : access.limit === 0 ? (
              <span className="status-chip">
                <span className="led warn" aria-hidden="true" /> Lab key required
              </span>
            ) : (
              <span className="status-chip">
                <span className={`led ${access.remaining ? "ok" : "warn"}`} aria-hidden="true" />
                <strong className="num">
                  {access.remaining ?? 0}/{access.limit}
                </strong>{" "}
                free runs this hour
                {access.remaining === 0 && access.resetAt ? ` · refills ${resetLabel(access.resetAt)}` : ""}
              </span>
            )
          ) : (
            <span className="status-chip">
              <span className="led off" aria-hidden="true" /> Checking allowance…
            </span>
          )}
        </div>
        <div className="toolbar-actions">
          {access?.codeEnabled && (
            <div className="keybox">
              <button
                type="button"
                className="btn btn-quiet btn-sm"
                aria-expanded={keyOpen}
                onClick={() => setKeyOpen((v) => !v)}
              >
                {labKey ? "Lab key ✓" : "Enter lab key"}
              </button>
              {keyOpen && (
                <form
                  className="keybox-pop panel ticks"
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveKey();
                  }}
                >
                  <label className="label" htmlFor="labkey">
                    Lab key
                  </label>
                  <input
                    id="labkey"
                    type="password"
                    autoComplete="off"
                    value={keyDraft}
                    onChange={(e) => setKeyDraft(e.target.value)}
                    placeholder="Unlocks unlimited runs"
                    autoFocus
                  />
                  <div className="keybox-actions">
                    {labKey && (
                      <button
                        type="button"
                        className="btn btn-quiet btn-sm"
                        onClick={() => {
                          setKeyDraft("");
                          saveLabKey("");
                          setLabKey("");
                          setKeyOpen(false);
                          setTimeout(refresh, 0);
                        }}
                      >
                        Remove
                      </button>
                    )}
                    <button type="submit" className="btn btn-primary btn-sm">
                      Save key
                    </button>
                  </div>
                  <p className="control-hint">Kept in this browser and sent only to this site.</p>
                </form>
              )}
            </div>
          )}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setLogOpen(true)}>
            Run log <span className="mono dim num">{runs.length}</span>
          </button>
        </div>
      </div>

      <div className="bench">
        {/* ---------------- Control deck ---------------- */}
        <aside className="panel ticks bench-panel deck" aria-label="Forge controls">
          <div className="panel-head">
            <span className="label strong">
              <span className="label signal">02</span> Control deck
            </span>
          </div>
          <div className="deck-body">
            <div className="control">
              <IntensityDial value={intensity} onChange={setIntensity} />
            </div>

            <Picker
              label="Target"
              value={target}
              options={targetOptions}
              onChange={setTarget}
              columns={2}
              renderValue={(o) => (
                <span className="picker-value-inner">
                  <span className="glyph">{o?.glyph}</span>
                  {o?.label}
                </span>
              )}
            />

            <div className="control">
              <Picker
                label="Model"
                value={model.key}
                options={modelOptions}
                onChange={(key) => {
                  setModelKey(key);
                  setAttachError("");
                }}
                renderValue={(o) => (
                  <span className="picker-value-inner">
                    <span className={`led ${status ? (readiness?.ready ? "ok" : "off") : "off"}`} />
                    {o?.label}
                    <span className="picker-sub">{providerLabel(model.provider)}</span>
                  </span>
                )}
              />
              <p className="control-hint">
                {offline ? (
                  <span className="warn-text">Offline — this model&apos;s API key isn&apos;t configured on the server.</span>
                ) : (
                  model.note
                )}
              </p>
            </div>

            <Segmented
              label="Reasoning effort"
              value={effort}
              options={model.efforts.map((e) => ({ value: e.id, label: e.label }))}
              onChange={(value) => setEfforts((current) => ({ ...current, [model.key]: value }))}
            />

            <Toggle
              label="Web search"
              checked={webSearch && searchAvailable}
              disabled={!searchAvailable}
              onChange={(checked) => setSearch((current) => ({ ...current, [model.key]: checked }))}
              hint={
                !searchAvailable
                  ? "Unavailable — web search for this model needs ZAI_API_KEY on the server."
                  : webSearch
                    ? "The model may search the live web to verify facts. Sources appear with the result."
                    : "Off. Turn on to let the model research before it writes."
              }
            />

            <Segmented
              label="Output format"
              value={format}
              options={[
                { value: "structured", label: "Structured" },
                { value: "natural", label: "Natural" },
              ]}
              onChange={setFormat}
              disabled={!formatActive}
              hint={
                formatActive
                  ? format === "structured"
                    ? "Headed sections and numbered rules — best for agents and complex tasks."
                    : "Plain, readable paragraphs — easy to edit by hand."
                  : "Polish and Refine keep your original format."
              }
            />

            <div className="deck-run">{runButton("is-block")}</div>
          </div>
        </aside>

        {/* ---------------- Input ---------------- */}
        <section
          className="panel ticks bench-panel bench-input"
          aria-labelledby="in-title"
          data-dragging={dragging || undefined}
          onDragOver={(e) => {
            if (e.dataTransfer.types.includes("Files")) {
              e.preventDefault();
              setDragging(true);
            }
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            addFiles([...e.dataTransfer.files].filter((f) => f.type.startsWith("image/")));
          }}
        >
          <div className="panel-head">
            <label className="label strong" id="in-title" htmlFor="raw">
              <span className="label signal">01</span> Raw prompt
            </label>
            <span className={`label num ${charCount > MAX_INPUT ? "over" : ""}`}>
              {charCount.toLocaleString()} / {MAX_INPUT.toLocaleString()}
            </span>
          </div>

          <textarea
            id="raw"
            ref={inputRef}
            className="raw"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={(e) => {
              const files = [...e.clipboardData.files].filter((f) => f.type.startsWith("image/"));
              if (files.length) {
                e.preventDefault();
                addFiles(files);
              }
            }}
            placeholder={"Paste a prompt or describe what you want, roughly.\n\ne.g. make me a logo for my coffee truck, retro vibe, orange and cream"}
            spellCheck
          />

          <div className="attach">
            <div className="attach-row">
              <button
                type="button"
                className="btn btn-quiet btn-sm"
                onClick={() => fileRef.current?.click()}
                disabled={!model.vision || images.length >= MAX_IMAGES}
                title={model.vision ? "Attach reference images" : `${model.label} is text-only`}
              >
                + Reference image
              </button>
              <span className="label">
                {images.length}/{MAX_IMAGES} {model.vision ? "· drop or paste" : "· text-only model"}
              </span>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                hidden
                onChange={(e) => {
                  addFiles([...(e.target.files ?? [])]);
                  e.target.value = "";
                }}
              />
            </div>
            {images.length > 0 && (
              <ul className="thumbs">
                {images.map((img, i) => (
                  <li key={img.name + i}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.dataUrl} alt={img.name} />
                    <span className="thumb-meta">
                      <span className="thumb-name">{img.name}</span>
                      <span className="label">{formatBytes(img.bytes)}</span>
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${img.name}`}
                      onClick={() => setImages((current) => current.filter((_, j) => j !== i))}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {attachError && <p className="control-hint warn-text">{attachError}</p>}
            {images.length > 0 && !model.vision && (
              <p className="control-hint warn-text">{model.label} can&apos;t read images — remove them or switch model.</p>
            )}
          </div>

          <div className="directives" data-open={directivesOpen}>
            <button
              type="button"
              className="directives-toggle"
              aria-expanded={directivesOpen}
              aria-controls="directives"
              onClick={() => setDirectivesOpen((v) => !v)}
            >
              <span className="label strong">Instructions for the AI</span>
              <span className="label">{instructions.trim() ? "Set" : "Optional"}</span>
              <span className="caret" aria-hidden="true">
                {directivesOpen ? "−" : "+"}
              </span>
            </button>
            {directivesOpen && (
              <div id="directives" className="directives-body">
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder={"Steer the edit without changing your prompt. e.g. Keep my casual voice · Don't add a persona · Make it work for Midjourney"}
                  rows={3}
                  maxLength={8000}
                  aria-label="Instructions for the AI"
                />
                <p className="control-hint">
                  Sent to the model as editing directions. They shape the result but are never copied into it.
                </p>
              </div>
            )}
          </div>

          <div className="in-foot">
            <span className="label">
              {INTENSITY[intensity].name} · {getTarget(target)?.label} · {model.label}
            </span>
            {runButton()}
          </div>
        </section>

        {/* ---------------- Output ---------------- */}
        <OutputPanel
          phase={phase}
          output={output}
          original={original}
          error={error}
          statusLine={statusLine}
          sources={sources}
          view={view}
          onView={setView}
          elapsedMs={elapsed}
          meta={meta}
          onReuse={reuse}
          onRetry={run}
        />
      </div>

      {outOfRuns && !labKey && (
        <p className="forge-note warn-text">
          You&apos;ve used this hour&apos;s free runs. They refill at {resetLabel(access?.resetAt ?? null) || "the top of the hour"}
          {access?.codeEnabled ? ", or enter a lab key for unlimited runs." : "."}
        </p>
      )}

      <RunLog
        open={logOpen}
        runs={runs}
        onClose={() => setLogOpen(false)}
        onRestore={restore}
        onDelete={(id) => setRuns(deleteRun(id))}
        onClear={() => {
          if (window.confirm("Clear every run stored in this browser? This can't be undone.")) setRuns(clearRuns());
        }}
      />
    </>
  );
}
