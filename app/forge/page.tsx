import type { Metadata } from "next";

import { Scramble } from "@/components/fx/Scramble";
import { Forge } from "@/components/forge/Forge";

export const metadata: Metadata = {
  title: "Prompt Forge",
  description:
    "Turn a rough idea into a precise prompt. One dial from Polish to Optimize, 17 task targets and seven models across OpenAI, Anthropic, DeepSeek, Z.ai and Xiaomi.",
};

export default function ForgePage() {
  return (
    <div className="wrap forge-page">
      <header className="forge-head">
        <div className="crumbs intro">
          <span className="label">
            <Scramble text="EXP-001" />
          </span>
          <span className="label">/</span>
          <span className="label strong">Prompt Forge</span>
          <span className="pill live">
            <span className="led signal pulse" aria-hidden="true" /> Live
          </span>
        </div>
        <h1 className="display forge-h1" aria-label="Prompt Forge">
          <span className="hl" aria-hidden="true" style={{ ["--li" as string]: 0 }}>
            <span className="hl-in">
              Prompt Forge<span className="hdot">.</span>
            </span>
          </span>
        </h1>
        <p className="forge-lede intro" style={{ ["--d" as string]: "380ms" }}>
          Raw idea in, precision prompt out. Set the dial, pick what the prompt is for and which model forges it, then
          compare every change against your original.
        </p>
      </header>
      <Forge />
    </div>
  );
}
