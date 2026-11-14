import type { Metadata } from "next";

import { Forge } from "@/components/forge/Forge";

export const metadata: Metadata = {
  title: "Prompt Forge",
  description:
    "Turn a rough idea into a precise prompt. One dial from Polish to Optimize, 17 task targets and seven models across OpenAI, Anthropic, DeepSeek, Z.ai and Xiaomi.",
};

export default function ForgePage() {
  return (
    <div className="wrap">
      <header className="forge-head">
        <div className="crumbs">
          <span className="label">EXP-001</span>
          <span className="label">/</span>
          <span className="label strong">Prompt Forge</span>
          <span className="pill live">
            <span className="led signal pulse" aria-hidden="true" /> Live
          </span>
        </div>
        <div className="forge-title">
          <h1>Prompt Forge</h1>
          <p>
            Raw idea in, precision prompt out. Set the dial, pick what the prompt is for and which model forges it,
            then compare every change against your original.
          </p>
        </div>
      </header>
      <Forge />
    </div>
  );
}
