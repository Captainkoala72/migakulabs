import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { EXPERIMENTS, STATUS_LABEL, getExperiment } from "@/lib/experiments";

export function generateStaticParams() {
  return EXPERIMENTS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const experiment = getExperiment(slug);
  if (!experiment) return {};
  return { title: `${experiment.code} ${experiment.name}`, description: experiment.summary };
}

export default async function ExperimentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const experiment = getExperiment(slug);
  if (!experiment) notFound();
  // Live tools have their own route; the spec sheet is for what's still being built.
  if (experiment.status === "live" && experiment.href !== `/lab/${slug}`) redirect(experiment.href);

  return (
    <div className="wrap">
      <header className="page-head">
        <div className="crumbs">
          <Link href="/lab" className="label">
            The lab
          </Link>
          <span className="label">/</span>
          <span className="label strong">{experiment.code}</span>
          <span className="pill">
            <span className={`led ${experiment.status === "next" ? "warn" : "off"}`} aria-hidden="true" />
            {STATUS_LABEL[experiment.status]}
          </span>
        </div>
        <h1>{experiment.name}</h1>
        <p className="lede">{experiment.summary}</p>
      </header>

      <div className="sheet">
        <div className="sheet-main">
          {experiment.roadmap && (
            <section>
              <h2>Planned capabilities</h2>
              <ol className="check-list">
                {experiment.roadmap.map((item, i) => (
                  <li key={item}>
                    <span className="n">{String(i + 1).padStart(2, "0")}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
          <section>
            <h2>Status</h2>
            <div className="prose">
              <p>
                This instrument is <strong>{STATUS_LABEL[experiment.status].toLowerCase()}</strong>. It will appear in
                the lab log the day it goes live. In the meantime, Prompt Forge is open and ready.
              </p>
            </div>
            <div style={{ display: "flex", gap: "var(--s-3)", flexWrap: "wrap", marginTop: "var(--s-5)" }}>
              <Link href="/forge" className="btn btn-primary">
                Open Prompt Forge <span className="arrow">→</span>
              </Link>
              <Link href="/lab" className="btn btn-ghost">
                All experiments
              </Link>
            </div>
          </section>
        </div>

        <aside className="sheet-side">
          <div className="panel ticks">
            <div className="panel-head">
              <span className="label strong">Spec sheet · {experiment.code}</span>
            </div>
            <dl className="spec-table">
              {experiment.specs.map((s) => (
                <div key={s.label}>
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
              <div>
                <dt>Tags</dt>
                <dd>{experiment.tags.join(" · ")}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
