/**
 * The Polish ↔ Optimize dial. Stop 0 barely touches your words; stop 4
 * rebuilds the prompt from its intent. The server-side instructions for each
 * stop live in lib/forge/prompts.ts.
 */

export interface IntensityStop {
  value: number;
  name: string;
  /** One line for the dial readout. */
  summary: string;
  /** How far the length may move, shown as a readout. */
  lengthBudget: string;
}

export const INTENSITY: IntensityStop[] = [
  {
    value: 0,
    name: "Polish",
    summary: "Line edit only. Fixes grammar, clarity and flow. Your structure and voice stay.",
    lengthBudget: "±15%",
  },
  {
    value: 1,
    name: "Refine",
    summary: "Polish plus: resolves ambiguity and contradictions, tidies order and formatting.",
    lengthBudget: "±35%",
  },
  {
    value: 2,
    name: "Balanced",
    summary: "Keeps your core and voice, adds clear structure and fills the most important gaps.",
    lengthBudget: "up to 2×",
  },
  {
    value: 3,
    name: "Enhance",
    summary: "Substantial rewrite: role, inputs, constraints and output format made explicit.",
    lengthBudget: "2–4×",
  },
  {
    value: 4,
    name: "Optimize",
    summary: "Full rebuild from intent, with a quality bar and edge-case handling.",
    lengthBudget: "as needed",
  },
];

export const DEFAULT_INTENSITY = 3;

export type OutputFormat = "structured" | "natural";

/** Format only changes the result from this stop upward. */
export const FORMAT_MIN_INTENSITY = 2;

export function clampIntensity(value: unknown): number {
  const n = typeof value === "number" ? Math.round(value) : Number.NaN;
  if (!Number.isFinite(n)) return DEFAULT_INTENSITY;
  return Math.min(4, Math.max(0, n));
}
