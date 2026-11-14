"use client";

import { useCallback, useEffect, useState } from "react";

import type { LabStatus } from "@/lib/forge/types";

/** Shared across components so the nav and the Forge make one request, not two. */
let cache: LabStatus | null = null;
let inflight: Promise<LabStatus | null> | null = null;
const listeners = new Set<(s: LabStatus | null) => void>();

function labKeyHeader(): Record<string, string> {
  try {
    const key = window.localStorage.getItem("migaku.lab.key");
    return key ? { "x-lab-key": key } : {};
  } catch {
    return {};
  }
}

async function fetchStatus(): Promise<LabStatus | null> {
  try {
    const response = await fetch("/api/status", { cache: "no-store", headers: labKeyHeader() });
    if (!response.ok) return null;
    return (await response.json()) as LabStatus;
  } catch {
    return null;
  }
}

export function refreshLabStatus(): Promise<LabStatus | null> {
  inflight = fetchStatus().then((status) => {
    cache = status;
    inflight = null;
    listeners.forEach((fn) => fn(status));
    return status;
  });
  return inflight;
}

export function useLabStatus() {
  const [status, setStatus] = useState<LabStatus | null>(cache);

  useEffect(() => {
    listeners.add(setStatus);
    if (!cache && !inflight) refreshLabStatus();
    else if (cache) setStatus(cache);
    return () => {
      listeners.delete(setStatus);
    };
  }, []);

  const refresh = useCallback(() => refreshLabStatus(), []);
  return { status, refresh };
}

export function onlineCount(status: LabStatus | null): { online: number; total: number } {
  if (!status) return { online: 0, total: 0 };
  const values = Object.values(status.models);
  return { online: values.filter((m) => m.ready).length, total: values.length };
}
