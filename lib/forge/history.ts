import type { Run } from "./types";

const KEY = "migaku.forge.runs.v1";
const PREFS_KEY = "migaku.forge.prefs.v1";
const LAB_KEY = "migaku.lab.key";
const MAX_RUNS = 25;

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* Private mode or storage full — the Forge still works without history. */
  }
}

export function loadRuns(): Run[] {
  const raw = safeGet(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((r) => r && typeof r.output === "string") : [];
  } catch {
    return [];
  }
}

export function saveRun(run: Run): Run[] {
  const runs = [run, ...loadRuns().filter((r) => r.id !== run.id)].slice(0, MAX_RUNS);
  safeSet(KEY, JSON.stringify(runs));
  return runs;
}

export function deleteRun(id: string): Run[] {
  const runs = loadRuns().filter((r) => r.id !== id);
  safeSet(KEY, JSON.stringify(runs));
  return runs;
}

export function clearRuns(): Run[] {
  safeSet(KEY, null);
  return [];
}

export interface ForgePrefs {
  model?: string;
  intensity?: number;
  target?: string;
  format?: "structured" | "natural";
  efforts?: Record<string, string>;
  search?: Record<string, boolean>;
}

export function loadPrefs(): ForgePrefs {
  const raw = safeGet(PREFS_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function savePrefs(prefs: ForgePrefs) {
  safeSet(PREFS_KEY, JSON.stringify(prefs));
}

export function loadLabKey(): string {
  return safeGet(LAB_KEY) ?? "";
}

export function saveLabKey(value: string) {
  safeSet(LAB_KEY, value.trim() ? value.trim() : null);
}
