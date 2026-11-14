"use client";

import { useEffect, useRef } from "react";

import { getModel } from "@/lib/forge/catalog";
import { INTENSITY } from "@/lib/forge/intensity";
import { getTarget } from "@/lib/forge/templates";
import type { Run } from "@/lib/forge/types";

interface Props {
  open: boolean;
  runs: Run[];
  onClose: () => void;
  onRestore: (run: Run) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

function ago(ts: number) {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Slide-over drawer listing past runs stored in this browser. */
export function RunLog({ open, runs, onClose, onRestore, onDelete, onClear }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="drawer"
      aria-labelledby="runlog-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="drawer-inner">
        <div className="drawer-head">
          <div>
            <span className="label">Stored in this browser only</span>
            <h2 id="runlog-title">Run log</h2>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            Close
          </button>
        </div>

        {runs.length === 0 ? (
          <p className="dim drawer-empty">Completed runs appear here so you can restore or compare them later.</p>
        ) : (
          <ul className="runs">
            {runs.map((run) => (
              <li key={run.id}>
                <button type="button" className="run-item" onClick={() => onRestore(run)}>
                  <span className="run-meta">
                    <span>{getModel(run.model)?.label ?? run.model}</span>
                    <span>{INTENSITY[run.intensity]?.name}</span>
                    <span>{getTarget(run.target)?.label ?? "Auto"}</span>
                    <span>{ago(run.createdAt)}</span>
                  </span>
                  <span className="run-snippet">{run.input.slice(0, 160)}</span>
                </button>
                <button
                  type="button"
                  className="run-delete"
                  aria-label="Delete this run"
                  onClick={() => onDelete(run.id)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        {runs.length > 0 && (
          <div className="drawer-foot">
            <button type="button" className="btn btn-quiet btn-sm" onClick={onClear}>
              Clear all runs
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
