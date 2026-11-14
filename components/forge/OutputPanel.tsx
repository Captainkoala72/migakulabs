"use client";

import { useMemo, useState } from "react";

import { diffWords, retention, wordCount } from "@/lib/forge/diff";
import type { Source } from "@/lib/forge/types";

export type Phase = "idle" | "running" | "done" | "error";
export type OutputView = "result" | "changes" | "sources";

interface Props {
  phase: Phase;
  output: string;
  original: string;
  error: string;
  statusLine: string;
  sources: Source[];
  view: OutputView;
  onView: (view: OutputView) => void;
  elapsedMs: number;
  meta: { model: string; effort: string; intensity: string; target: string } | null;
  onReuse: () => void;
  onRetry: () => void;
}

function formatSeconds(ms: number) {
  return (ms / 1000).toFixed(1) + "s";
}

export function OutputPanel(props: Props) {
  const { phase, output, original, error, statusLine, sources, view, onView, elapsedMs, meta } = props;
  const [copied, setCopied] = useState(false);

  const canDiff = phase === "done" && Boolean(output) && Boolean(original);
  const diff = useMemo(() => (canDiff && view === "changes" ? diffWords(original, output) : null), [canDiff, view, original, output]);
  const kept = useMemo(() => (canDiff ? retention(diffWords(original, output)) : null), [canDiff, original, output]);

  const wordsIn = wordCount(original);
  const wordsOut = wordCount(output);
  const delta = wordsIn ? Math.round(((wordsOut - wordsIn) / wordsIn) * 100) : 0;

  async function copy() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* Clipboard blocked — the text is still selectable. */
    }
  }

  function download() {
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `forged-prompt-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const hasOutput = Boolean(output);

  return (
    <section className="panel ticks bench-panel bench-output" aria-labelledby="out-title">
      <div className="panel-head">
        <span className="label strong" id="out-title">
          <span className="label signal">03</span> Output
        </span>
        <div className="tabs" role="tablist" aria-label="Output views">
          <button role="tab" type="button" aria-selected={view === "result"} onClick={() => onView("result")}>
            Result
          </button>
          <button
            role="tab"
            type="button"
            aria-selected={view === "changes"}
            onClick={() => onView("changes")}
            disabled={!canDiff}
            title={canDiff ? "Word-level changes from your original" : "Available after a run finishes"}
          >
            Changes
          </button>
          <button
            role="tab"
            type="button"
            aria-selected={view === "sources"}
            onClick={() => onView("sources")}
            disabled={!sources.length}
          >
            Sources{sources.length ? ` · ${sources.length}` : ""}
          </button>
        </div>
      </div>

      <div className="out-body" aria-live="polite" aria-busy={phase === "running"}>
        {phase === "error" && (
          <div className="out-error" role="alert">
            <span className="label" style={{ color: "var(--err)" }}>
              Run failed
            </span>
            <p>{error}</p>
            <button type="button" className="btn btn-ghost btn-sm" onClick={props.onRetry}>
              Try again
            </button>
          </div>
        )}

        {!hasOutput && phase === "idle" && (
          <div className="out-empty">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
              <path d="M2 14V2h12M50 2h12v12M62 50v12H50M14 62H2V50" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="32" cy="32" r="10" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 3" />
              <circle cx="32" cy="32" r="2.5" fill="var(--signal)" />
            </svg>
            <p className="label">Awaiting specimen</p>
            <p className="dim">
              Write or paste a prompt, set the dial, then press <span className="kbd-inline">Forge</span> or{" "}
              <span className="kbd-inline">Ctrl</span> + <span className="kbd-inline">Enter</span>.
            </p>
          </div>
        )}

        {!hasOutput && phase === "running" && (
          <div className="out-working">
            <div className="scanline" aria-hidden="true" />
            <p className="label">{statusLine || "Model is reasoning…"}</p>
            <p className="dim mono num">{formatSeconds(elapsedMs)}</p>
          </div>
        )}

        {hasOutput && view === "result" && (
          <pre className="out-text" data-running={phase === "running" || undefined}>
            {output}
          </pre>
        )}

        {hasOutput && view === "changes" && diff && (
          <div className="out-diff">
            <div className="diff-legend">
              <span>
                <i className="sw add" /> Added
              </span>
              <span>
                <i className="sw del" /> Removed
              </span>
              {kept !== null && <span className="num">{Math.round(kept * 100)}% of output kept from your words</span>}
            </div>
            <pre className="out-text">
              {diff.map((part, i) =>
                part.kind === "same" ? (
                  <span key={i}>{part.text}</span>
                ) : part.kind === "add" ? (
                  <ins key={i}>{part.text}</ins>
                ) : (
                  <del key={i}>{part.text}</del>
                )
              )}
            </pre>
          </div>
        )}

        {view === "sources" && sources.length > 0 && (
          <ol className="out-sources">
            {sources.map((source, i) => (
              <li key={source.url}>
                <span className="mono dim num">{String(i + 1).padStart(2, "0")}</span>
                <a href={source.url} target="_blank" rel="noreferrer noopener">
                  {source.title}
                  <span className="dim"> · {new URL(source.url).hostname.replace(/^www\./, "")} ↗</span>
                </a>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="out-foot">
        <div className="out-readout">
          {meta ? (
            <>
              <span>
                <b>{meta.model}</b> · {meta.effort}
              </span>
              <span>{meta.intensity}</span>
              <span className="num">{formatSeconds(elapsedMs)}</span>
              {hasOutput && (
                <span className="num">
                  {wordsIn} → <b>{wordsOut}</b> words
                  {phase === "done" && wordsIn > 0 && (
                    <em className={delta >= 0 ? "up" : "down"}>
                      {" "}
                      {delta >= 0 ? "+" : ""}
                      {delta}%
                    </em>
                  )}
                </span>
              )}
              {phase === "running" && statusLine && hasOutput && <span>{statusLine}</span>}
            </>
          ) : (
            <span>No runs yet</span>
          )}
        </div>
        <div className="out-actions">
          <button type="button" className="btn btn-quiet btn-sm" onClick={props.onReuse} disabled={!hasOutput || phase === "running"}>
            Forge again from this
          </button>
          <button type="button" className="btn btn-quiet btn-sm" onClick={download} disabled={!hasOutput || phase === "running"}>
            Download
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={copy} disabled={!hasOutput}>
            {copied ? "Copied ✓" : "Copy prompt"}
          </button>
        </div>
      </div>
    </section>
  );
}
