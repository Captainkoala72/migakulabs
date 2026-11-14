"use client";

import { onlineCount, useLabStatus } from "@/lib/useLabStatus";

/** Live readout of how many Forge models have keys configured on the server. */
export function StatusChip() {
  const { status } = useLabStatus();
  const { online, total } = onlineCount(status);
  const state = !status ? "off" : online === 0 ? "warn" : "ok";
  return (
    <span className="status-chip" aria-live="polite">
      <span className={`led ${state} ${state === "ok" ? "pulse" : ""}`} aria-hidden="true" />
      {status ? (
        <span>
          <strong className="num">
            {online}/{total}
          </strong>{" "}
          models online
        </span>
      ) : (
        <span>Calibrating…</span>
      )}
    </span>
  );
}
