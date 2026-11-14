import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Cost protection for the public Forge.
 *
 *  - FORGE_ACCESS_CODE        Lab key that unlocks unlimited runs (send it as x-lab-key).
 *  - FORGE_FREE_RUNS_PER_HOUR Free runs per visitor per hour without a key (default 10, 0 = key required).
 *  - FORGE_DAILY_RUN_CAP      Optional ceiling on free runs per day across all visitors.
 *
 * Counts live in Upstash Redis when UPSTASH_REDIS_REST_URL/TOKEN (or Vercel's
 * KV_REST_API_URL/TOKEN) are set; otherwise in memory, which is best-effort on
 * serverless because each instance keeps its own counts.
 */

const HOUR = 3600;
const DAY = 86_400;

function env(name: string): string {
  return process.env[name]?.trim() ?? "";
}

function intEnv(name: string, fallback: number): number {
  const raw = env(name);
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export function freeRunsPerHour(): number {
  return intEnv("FORGE_FREE_RUNS_PER_HOUR", 10);
}

export function accessCodeEnabled(): boolean {
  return Boolean(env("FORGE_ACCESS_CODE"));
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

export function hasValidLabKey(req: Request): boolean {
  const code = env("FORGE_ACCESS_CODE");
  const given = req.headers.get("x-lab-key")?.trim() ?? "";
  if (!code || !given) return false;
  return timingSafeEqual(digest(code), digest(given));
}

export function clientId(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || req.headers.get("x-real-ip")?.trim() || "local";
  // Hash so raw IPs never sit in a store.
  return createHash("sha256").update(ip).digest("hex").slice(0, 24);
}

/** Rejects cross-site POSTs so other sites can't spend the lab's credits from a visitor's browser. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    const originHost = new URL(origin).host;
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    const allowed = env("FORGE_ALLOWED_ORIGINS")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => {
        try {
          return new URL(s).host;
        } catch {
          return s;
        }
      });
    return originHost === host || allowed.includes(originHost);
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Counter store                                                       */
/* ------------------------------------------------------------------ */

interface Counter {
  count: number;
  resetAt: number;
}

const memory = new Map<string, Counter>();

function redisConfig(): { url: string; token: string } | null {
  const url = env("UPSTASH_REDIS_REST_URL") || env("KV_REST_API_URL");
  const token = env("UPSTASH_REDIS_REST_TOKEN") || env("KV_REST_API_TOKEN");
  return url && token ? { url: url.replace(/\/+$/, ""), token } : null;
}

async function redis(commands: (string | number)[][]): Promise<any[] | null> {
  const config = redisConfig();
  if (!config) return null;
  try {
    const response = await fetch(`${config.url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(commands),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = await response.json();
    return Array.isArray(data) ? data.map((d: any) => d?.result) : null;
  } catch {
    return null;
  }
}

function windowStart(seconds: number, now: number): number {
  return Math.floor(now / 1000 / seconds) * seconds;
}

async function bump(key: string, seconds: number, consume: boolean): Promise<Counter> {
  const now = Date.now();
  const start = windowStart(seconds, now);
  const resetAt = (start + seconds) * 1000;
  const fullKey = `forge:${key}:${start}`;

  const results = await redis(
    consume ? [["INCR", fullKey], ["EXPIRE", fullKey, seconds + 60]] : [["GET", fullKey]]
  );
  if (results) return { count: Number(results[0] ?? 0) || 0, resetAt };

  if (memory.size > 5000) {
    for (const [k, v] of memory) if (v.resetAt <= now) memory.delete(k);
  }
  const current = memory.get(fullKey);
  const counter = current && current.resetAt > now ? current : { count: 0, resetAt };
  if (consume) {
    counter.count += 1;
    memory.set(fullKey, counter);
  }
  return counter;
}

export interface Allowance {
  allowed: boolean;
  unlocked: boolean;
  limit: number;
  remaining: number | null;
  resetAt: number | null;
  reason?: string;
}

/** Read the caller's allowance without spending a run. */
export async function peekAllowance(req: Request): Promise<Allowance> {
  if (hasValidLabKey(req)) return { allowed: true, unlocked: true, limit: 0, remaining: null, resetAt: null };
  const limit = freeRunsPerHour();
  if (limit === 0) return { allowed: false, unlocked: false, limit, remaining: 0, resetAt: null, reason: "key" };
  const counter = await bump(`ip:${clientId(req)}`, HOUR, false);
  const remaining = Math.max(0, limit - counter.count);
  return { allowed: remaining > 0, unlocked: false, limit, remaining, resetAt: counter.resetAt };
}

/** Spend one run, or explain why not. */
export async function consumeRun(req: Request): Promise<Allowance> {
  if (hasValidLabKey(req)) return { allowed: true, unlocked: true, limit: 0, remaining: null, resetAt: null };
  const limit = freeRunsPerHour();
  if (limit === 0) {
    return {
      allowed: false,
      unlocked: false,
      limit,
      remaining: 0,
      resetAt: null,
      reason: "The Forge needs a lab key right now. Enter one to run it.",
    };
  }

  const dailyCap = intEnv("FORGE_DAILY_RUN_CAP", 0);
  if (dailyCap > 0) {
    const day = await bump("global", DAY, false);
    if (day.count >= dailyCap) {
      return {
        allowed: false,
        unlocked: false,
        limit,
        remaining: 0,
        resetAt: day.resetAt,
        reason: "The lab's free runs for today are used up. Come back tomorrow, or enter a lab key.",
      };
    }
  }

  const counter = await bump(`ip:${clientId(req)}`, HOUR, true);
  if (counter.count > limit) {
    return {
      allowed: false,
      unlocked: false,
      limit,
      remaining: 0,
      resetAt: counter.resetAt,
      reason: `You've used your ${limit} free runs this hour. They refill at the top of the hour, or enter a lab key for unlimited runs.`,
    };
  }
  if (dailyCap > 0) await bump("global", DAY, true);
  return { allowed: true, unlocked: false, limit, remaining: Math.max(0, limit - counter.count), resetAt: counter.resetAt };
}
