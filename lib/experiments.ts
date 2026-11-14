/**
 * The experiment registry. Every tool in the lab is one entry here; the home
 * page, the Lab index and each spec sheet read from this list.
 *
 * To add a new tool:
 *   1. Append an entry (next EXP code, status "planned" or "next").
 *   2. When it ships, build its page (e.g. app/music/page.tsx), set
 *      status: "live" and href to that route.
 */

export type ExperimentStatus = "live" | "next" | "planned";

export interface Experiment {
  slug: string;
  code: string;
  name: string;
  status: ExperimentStatus;
  /** Where the card links. Live tools link to their own route. */
  href: string;
  summary: string;
  /** Spec-sheet rows shown on the experiment page and home cards. */
  specs: { label: string; value: string }[];
  /** Planned capabilities, shown on spec sheets for unreleased tools. */
  roadmap?: string[];
  tags: string[];
}

export const STATUS_LABEL: Record<ExperimentStatus, string> = {
  live: "Live",
  next: "Next on the bench",
  planned: "Planned",
};

export const EXPERIMENTS: Experiment[] = [
  {
    slug: "prompt-forge",
    code: "EXP-001",
    name: "Prompt Forge",
    status: "live",
    href: "/forge",
    summary:
      "Turn a rough idea into a precise prompt. One dial moves from a light polish to a full rebuild, across seven models from five providers.",
    specs: [
      { label: "Models", value: "7 across 5 providers" },
      { label: "Targets", value: "17 task profiles" },
      { label: "Intensity", value: "5 stops, Polish → Optimize" },
      { label: "Inputs", value: "Text, directives, reference images" },
      { label: "Research", value: "Optional live web search" },
    ],
    tags: ["LLM", "Prompting", "Multi-model"],
  },
  {
    slug: "music-maker",
    code: "EXP-002",
    name: "Music Maker",
    status: "next",
    href: "/lab/music-maker",
    summary:
      "Describe a track and get a finished song. Prompt Forge-style controls for genre, mood, tempo and structure, rendered by a music generation model.",
    specs: [
      { label: "Engine", value: "Pixazo music generation" },
      { label: "Output", value: "Full tracks, downloadable audio" },
      { label: "Pairs with", value: "Prompt Forge · Music target" },
    ],
    roadmap: [
      "Text-to-song with genre, mood, tempo and vocal controls",
      "Send a Prompt Forge Music prompt straight into the studio",
      "In-browser player, waveform and download",
      "Per-visitor allowance, same as the Forge",
    ],
    tags: ["Audio", "Generative"],
  },
  {
    slug: "mini-games",
    code: "EXP-003",
    name: "Mini Games",
    status: "planned",
    href: "/lab/mini-games",
    summary:
      "Small, original browser games built for a five-minute break. Quick to load, quick to learn, with a daily twist.",
    specs: [
      { label: "Platform", value: "Browser, desktop and mobile" },
      { label: "Session", value: "Under five minutes" },
    ],
    roadmap: [
      "A daily puzzle with a shareable result",
      "Local high scores, no account needed",
      "AI-generated variations so no two days repeat",
    ],
    tags: ["Games", "Daily"],
  },
  {
    slug: "daily-kit",
    code: "EXP-004",
    name: "Daily Kit",
    status: "planned",
    href: "/lab/daily-kit",
    summary:
      "A drawer of small everyday helpers: the tools you open ten times a week, each one fast, focused and free of clutter.",
    specs: [
      { label: "Format", value: "Single-purpose utilities" },
      { label: "Principle", value: "One screen, one job" },
    ],
    roadmap: [
      "Quick AI rewrites for messages and emails",
      "Planners, converters and calculators",
      "Shortcuts that hand work off to Prompt Forge",
    ],
    tags: ["Utilities", "Productivity"],
  },
];

export function getExperiment(slug: string): Experiment | undefined {
  return EXPERIMENTS.find((e) => e.slug === slug);
}
