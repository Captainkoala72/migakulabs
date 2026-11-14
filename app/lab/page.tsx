import type { Metadata } from "next";

import { ExperimentCard } from "@/components/lab/ExperimentCard";
import { EXPERIMENTS } from "@/lib/experiments";

export const metadata: Metadata = {
  title: "The Lab",
  description: "Every MiGaKu Labs experiment: what is live, what is next on the bench, and what is planned.",
};

export default function LabPage() {
  const live = EXPERIMENTS.filter((e) => e.status === "live").length;
  const nextCode = `EXP-${String(EXPERIMENTS.length + 1).padStart(3, "0")}`;
  return (
    <div className="wrap">
      <header className="page-head">
        <div className="crumbs">
          <span className="label">Index</span>
          <span className="label">/</span>
          <span className="label strong">The lab</span>
        </div>
        <h1>Experiments, live and on the bench.</h1>
        <p className="lede">
          {EXPERIMENTS.length} experiments logged, {live} live. Each one starts as a spec sheet, gets built and tested
          here, and only gets a green light when it is genuinely useful.
        </p>
      </header>

      <div className="exp-grid" style={{ marginBottom: "var(--s-9)" }}>
        {EXPERIMENTS.map((e) => (
          <ExperimentCard key={e.slug} experiment={e} />
        ))}
        <article className="exp-card slot" aria-label="Open slot">
          <span className="label">{nextCode}</span>
          <h3>Open slot</h3>
          <p>Reserved for the next idea that earns a place on the bench.</p>
        </article>
      </div>
    </div>
  );
}
