import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { Reveal, Words } from "@/components/fx/Reveal";
import { ScenePreset } from "@/components/fx/ScenePreset";
import { TLink } from "@/components/fx/Transition";
import { EXPERIMENTS, STATUS_LABEL, getExperiment } from "@/lib/experiments";
import { SHAPE } from "@/lib/fx/scene";

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
      {/* Unreleased instruments show a specimen that is still rough. */}
      <ScenePreset
        shape={SHAPE.GEM}
        x={0.52}
        y={0.1}
        scale={0.95}
        alpha={0.95}
        chaos={experiment.status === "next" ? 0.55 : 0.9}
        spin={0.16}
        mobile={{ x: 0.35, y: 0.32, scale: 0.6, alpha: 0.45 }}
      />
      <header className="page-head">
        <div className="crumbs intro">
          <TLink href="/lab" className="label link-line">
            The lab
          </TLink>
          <span className="label">/</span>
          <span className="label strong">{experiment.code}</span>
          <span className="pill">
            <span className={`led ${experiment.status === "next" ? "warn" : "off"}`} aria-hidden="true" />
            {STATUS_LABEL[experiment.status]}
          </span>
        </div>
        <Words as="h1" className="display" text={experiment.name} />
        <p className="lede intro" style={{ ["--d" as string]: "420ms" }}>
          {experiment.summary}
        </p>
      </header>

      <div className="sheet">
        <div className="sheet-main">
          {experiment.roadmap && (
            <Reveal as="section">
              <h2>Planned capabilities</h2>
              <ol className="check-list">
                {experiment.roadmap.map((item, i) => (
                  <li key={item}>
                    <span className="n">{String(i + 1).padStart(2, "0")}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </Reveal>
          )}
          <Reveal as="section">
            <h2>Status</h2>
            <div className="prose">
              <p>
                This instrument is <strong>{STATUS_LABEL[experiment.status].toLowerCase()}</strong>. The specimen on
                this page is still rough on purpose: it sharpens as the build gets closer to release. In the
                meantime, Prompt Forge is open and ready.
              </p>
            </div>
            <div className="row-actions">
              <TLink href="/forge" className="btn btn-primary">
                Open Prompt Forge <span className="arrow">→</span>
              </TLink>
              <TLink href="/lab" className="btn btn-ghost">
                All experiments
              </TLink>
            </div>
          </Reveal>
        </div>

        <aside className="sheet-side">
          <Reveal className="panel ticks" delay={150}>
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
          </Reveal>
        </aside>
      </div>
    </div>
  );
}
