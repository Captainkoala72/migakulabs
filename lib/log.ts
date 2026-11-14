/**
 * The lab log: a dated record of what shipped. Newest first.
 * Add an entry whenever something goes live or changes in a way people notice.
 */
export interface LogEntry {
  date: string;
  code: string;
  title: string;
  body: string;
}

export const LAB_LOG: LogEntry[] = [
  {
    date: "2026-11-14",
    code: "EXP-001",
    title: "Prompt Forge rev 2 goes live",
    body: "New Polish ↔ Optimize dial with five stops, 17 task targets, seven models across OpenAI, Anthropic, DeepSeek, Z.ai and Xiaomi, reference images, optional web research and a word-level change view.",
  },
  {
    date: "2026-11-14",
    code: "LAB",
    title: "MiGaKu Labs opens",
    body: "One home for every instrument. Each tool gets an experiment code, a spec sheet and a place in this log.",
  },
  {
    date: "Next",
    code: "EXP-002",
    title: "Music Maker",
    body: "A text-to-song studio built on Pixazo, designed to take prompts straight from the Forge.",
  },
];
