import type { OutputFormat } from "./intensity";

export interface Source {
  title: string;
  url: string;
}

/** Events the /api/forge stream sends to the browser. */
export type StreamEvent =
  | { type: "delta"; text: string }
  | { type: "source"; source: Source }
  | { type: "status"; message: string }
  | { type: "done" }
  | { type: "error"; message: string; provider?: string; status?: number };

/** One completed run, stored in the browser's localStorage. */
export interface Run {
  id: string;
  createdAt: number;
  model: string;
  effort: string;
  intensity: number;
  format: OutputFormat;
  target: string;
  input: string;
  instructions: string;
  webSearch: boolean;
  imageNames: string[];
  sources: Source[];
  output: string;
  elapsedMs: number;
}

/** Shape of GET /api/status. Never contains secrets — only booleans and limits. */
export interface LabStatus {
  models: Record<string, { ready: boolean; search: boolean }>;
  access: {
    codeEnabled: boolean;
    unlocked: boolean;
    limit: number;
    remaining: number | null;
    resetAt: number | null;
  };
}
