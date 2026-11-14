import Link from "next/link";

import { SpecimenDemo } from "@/components/home/SpecimenDemo";
import { ExperimentCard } from "@/components/lab/ExperimentCard";
import { StatusChip } from "@/components/site/StatusChip";
import { MODELS, PROVIDERS, providerLabel } from "@/lib/forge/catalog";
import { INTENSITY } from "@/lib/forge/intensity";
import { TARGETS } from "@/lib/forge/templates";
import { EXPERIMENTS } from "@/lib/experiments";
import { LAB_LOG } from "@/lib/log";
import { SITE } from "@/lib/site";

const PIPELINE = [
  { title: "Raw prompt", body: "Anything from one rough line to a 30,000-character spec. Paste it as it is." },
  {
    title: "Target profile",
    body: `${TARGETS.length} profiles tune the conventions — image, video, agents, deep research, coding, music and more — or let Auto work it out.`,
  },
  { title: "Intensity dial", body: "Five stops from Polish to Optimize decide how much of your wording is allowed to change." },
  { title: "Directives & references", body: "Optional instructions for the AI and up to three reference images, kept separate from the prompt." },
  {
    title: "Model & reasoning",
    body: `${MODELS.length} models from ${PROVIDERS.length} providers, per-model reasoning effort, and optional live web research.`,
  },
  { title: "Precision prompt", body: "Streamed back with a word-level change view, sources, and a local run log." },
];

const PRINCIPLES = [
  {
    title: "Keys never touch the browser",
    body: "Every model call runs server-side. Visitors get the tools, not the credentials.",
  },
  {
    title: "Tools, not demos",
    body: "An instrument only goes live once it is genuinely useful, with real error states and honest limits.",
  },
  {
    title: "Model-agnostic by design",
    body: "Providers change monthly. The lab swaps models in one file, so the tools outlive any single API.",
  },
  {
    title: "Readouts over hype",
    body: "Word counts, change views, live status lights. You can see what each instrument did and why.",
  },
];

export default function Home() {
  const forge = EXPERIMENTS[0];
  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="hero">
        <div className="hero-grid-bg" aria-hidden="true" />
        <div className="wrap">
          <div className="hero-meta-top">
            <span className="label">{SITE.name} / Index</span>
            <span className="label">Independent AI lab · Est. {SITE.founded}</span>
          </div>

          <div className="grid-12 hero-body">
            <div className="hero-copy">
              <h1>
                Practical AI instruments, <span className="quiet">built in the open.</span>
              </h1>
              <p className="hero-lede">
                {SITE.name} designs, tests and ships small, sharp AI tools. First off the bench:{" "}
                <strong>Prompt Forge</strong> — turn a rough idea into a precise prompt across seven models, with one dial
                from a light polish to a full rebuild.
              </p>
              <div className="hero-actions">
                <Link href="/forge" className="btn btn-primary">
                  Open Prompt Forge <span className="arrow">→</span>
                </Link>
                <Link href="/lab" className="btn btn-ghost">
                  Browse the lab
                </Link>
              </div>
              <div className="hero-readout">
                <div>
                  <span className="label">Live instrument</span>
                  <span className="value">EXP-001 Prompt Forge</span>
                </div>
                <div>
                  <span className="label">On the bench</span>
                  <span className="value">Music Maker</span>
                </div>
                <div>
                  <span className="label">System</span>
                  <span className="value">
                    <StatusChip />
                  </span>
                </div>
              </div>
            </div>

            <div className="hero-specimen">
              <SpecimenDemo />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Readout strip ---------------- */}
      <div className="readout-strip">
        <div className="wrap">
          <ul>
            <li>
              <span className="big">
                {String(MODELS.length).padStart(2, "0")}
              </span>
              <span className="label">Models in the Forge</span>
            </li>
            <li>
              <span className="big">{String(PROVIDERS.length).padStart(2, "0")}</span>
              <span className="label">Providers</span>
            </li>
            <li>
              <span className="big">{TARGETS.length}</span>
              <span className="label">Task targets</span>
            </li>
            <li>
              <span className="big">{String(INTENSITY.length).padStart(2, "0")}</span>
              <span className="label">Intensity stops</span>
            </li>
            <li>
              <span className="big">
                00<sup>●</sup>
              </span>
              <span className="label">API keys in your browser</span>
            </li>
          </ul>
        </div>
      </div>

      {/* ---------------- EXP-001 ---------------- */}
      <section className="section" id="forge">
        <div className="wrap">
          <div className="section-head">
            <div className="index">
              <span className="label signal">01</span>
              <span className="label">Featured · EXP-001</span>
            </div>
            <div className="title-block">
              <h2>How the Forge turns a rough idea into a precise prompt.</h2>
              <p>
                Most prompt tools give you one button and hope. The Forge exposes every stage, so you decide how much
                changes, what the prompt is for, and which model does the work.
              </p>
            </div>
          </div>

          <div className="feature-grid">
            <ol className="pipeline">
              {PIPELINE.map((step, i) => (
                <li key={step.title}>
                  <span className="step">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <aside className="panel ticks spec-card" aria-label="Prompt Forge spec sheet">
              <div className="panel-head">
                <span className="label strong">Spec sheet · {forge.code}</span>
                <span className="pill live">Live</span>
              </div>
              <dl className="spec-table">
                {forge.specs.map((s) => (
                  <div key={s.label}>
                    <dt>{s.label}</dt>
                    <dd>{s.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="panel-head" style={{ borderTop: "1px solid var(--line)" }}>
                <span className="label">Instruments</span>
              </div>
              <ul className="model-list">
                {MODELS.map((m) => (
                  <li key={m.key}>
                    <span>{m.label}</span>
                    <span className="prov">{providerLabel(m.provider)}</span>
                  </li>
                ))}
              </ul>
              <div className="panel-foot">
                <Link href="/forge" className="btn btn-primary">
                  Forge a prompt <span className="arrow">→</span>
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ---------------- The lab ---------------- */}
      <section className="section" id="lab">
        <div className="wrap">
          <div className="section-head">
            <div className="index">
              <span className="label signal">02</span>
              <span className="label">The lab</span>
            </div>
            <div className="title-block">
              <h2>One live instrument. More on the bench.</h2>
              <p>
                Every tool gets an experiment code, a spec sheet and a status light. Here is what is running and what
                is being built next.
              </p>
            </div>
          </div>
          <div className="exp-grid">
            {EXPERIMENTS.map((e) => (
              <ExperimentCard key={e.slug} experiment={e} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Principles ---------------- */}
      <section className="section" id="method">
        <div className="wrap">
          <div className="section-head">
            <div className="index">
              <span className="label signal">03</span>
              <span className="label">Method</span>
            </div>
            <div className="title-block">
              <h2>How the lab builds.</h2>
            </div>
          </div>
          <ul className="principles">
            {PRINCIPLES.map((p, i) => (
              <li key={p.title}>
                <span className="label">P-{String(i + 1).padStart(2, "0")}</span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- Lab log ---------------- */}
      <section className="section" id="log">
        <div className="wrap">
          <div className="section-head">
            <div className="index">
              <span className="label signal">04</span>
              <span className="label">Lab log</span>
            </div>
            <div className="title-block">
              <h2>What shipped, and when.</h2>
            </div>
          </div>
          <ol className="log">
            {LAB_LOG.map((entry) => (
              <li key={entry.date + entry.title}>
                <time>{entry.date}</time>
                <span className="label strong">{entry.code}</span>
                <div>
                  <h3>{entry.title}</h3>
                  <p>{entry.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------- Closing band ---------------- */}
      <section className="band">
        <div className="wrap band-inner">
          <h2>Bring a rough idea. Leave with a prompt that works the first time.</h2>
          <div className="actions">
            <Link href="/forge" className="btn btn-primary">
              Open Prompt Forge <span className="arrow">→</span>
            </Link>
            <Link href="/about" className="btn btn-ghost">
              About the lab
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
