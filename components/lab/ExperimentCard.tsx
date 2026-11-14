import Link from "next/link";

import { STATUS_LABEL, type Experiment } from "@/lib/experiments";

export function ExperimentCard({ experiment }: { experiment: Experiment }) {
  const live = experiment.status === "live";
  return (
    <article className={`exp-card ${live ? "is-live" : ""}`}>
      <div className="row">
        <span className="label strong">{experiment.code}</span>
        <span className={`pill ${live ? "live" : ""}`}>
          <span className={`led ${live ? "signal pulse" : experiment.status === "next" ? "warn" : "off"}`} aria-hidden="true" />
          {STATUS_LABEL[experiment.status]}
        </span>
      </div>
      <h3>{experiment.name}</h3>
      <div style={{ display: "grid", gap: "var(--s-4)", alignContent: "start" }}>
        <p>{experiment.summary}</p>
        <dl className="specs">
          {experiment.specs.slice(0, 3).map((s) => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <Link href={experiment.href} className="cta stretched">
        {live ? `Open ${experiment.name}` : "Read the spec sheet"} <span className="arrow">→</span>
      </Link>
    </article>
  );
}
