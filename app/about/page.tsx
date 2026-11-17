import type { Metadata } from "next";

import { Reveal, Words } from "@/components/fx/Reveal";
import { ScenePreset } from "@/components/fx/ScenePreset";
import { TLink } from "@/components/fx/Transition";
import { MODELS, PROVIDERS } from "@/lib/forge/catalog";
import { SHAPE } from "@/lib/fx/scene";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `What ${SITE.name} is, how it builds, and who runs it.`,
};

export default function AboutPage() {
  return (
    <div className="wrap">
      <ScenePreset
        shape={SHAPE.RING}
        x={0.5}
        y={0.08}
        scale={0.95}
        alpha={0.9}
        spin={0}
        tilt={0.5}
        roll={0.14}
        face={1}
        level={0}
        mobile={{ x: 0.3, y: 0.3, scale: 0.55, alpha: 0.35 }}
      />
      <header className="page-head">
        <div className="crumbs intro">
          <span className="label">Index</span>
          <span className="label">/</span>
          <span className="label strong">About</span>
        </div>
        <Words as="h1" className="display" text="Ship what you use." accent={["use"]} />
        <p className="lede intro" style={{ ["--d" as string]: "420ms" }}>
          {SITE.description}
        </p>
      </header>

      <div className="sheet">
        <div className="sheet-main">
          <Reveal as="section">
            <h2>What the lab is</h2>
            <div className="prose">
              <p>
                {SITE.name} is a personal workshop for AI tools. Each instrument solves a problem I run into, gets
                rebuilt until it is genuinely good, and then opens up so anyone can use it.
              </p>
              <p>
                The first instrument is <strong>Prompt Forge</strong>, because a better prompt improves every other
                AI tool you use. Next on the bench is a music maker, followed by mini games and a kit of everyday
                helpers.
              </p>
            </div>
          </Reveal>

          <Reveal as="section">
            <h2>The operator</h2>
            <div className="prose">
              <p>{SITE.operator.bio}</p>
            </div>
            <div className="row-actions">
              <a href={SITE.links.github} className="btn btn-ghost" target="_blank" rel="noreferrer">
                GitHub ↗
              </a>
              <TLink href="/forge" className="btn btn-primary">
                Try Prompt Forge <span className="arrow">→</span>
              </TLink>
            </div>
          </Reveal>

          <Reveal as="section">
            <h2>How it is built</h2>
            <ol className="check-list">
              <li>
                <span className="n">01</span>
                <span>Every model call runs on the server. API keys live in environment variables, never in the page.</span>
              </li>
              <li>
                <span className="n">02</span>
                <span>Public use is metered with a free hourly allowance per visitor, so the lab stays open without surprises.</span>
              </li>
              <li>
                <span className="n">03</span>
                <span>
                  {MODELS.length} models from {PROVIDERS.length} providers sit behind one adapter layer, so a new model is
                  a one-file change.
                </span>
              </li>
              <li>
                <span className="n">04</span>
                <span>Your run history stays in your browser. The lab doesn&apos;t keep a copy of your prompts.</span>
              </li>
              <li>
                <span className="n">05</span>
                <span>
                  The specimen behind every page is 26,000 particles drawn with hand-written WebGL shaders. No 3D
                  library, no video, no images.
                </span>
              </li>
            </ol>
          </Reveal>
        </div>

        <aside className="sheet-side">
          <Reveal className="panel ticks" delay={150}>
            <div className="panel-head">
              <span className="label strong">Colophon</span>
            </div>
            <dl className="spec-table">
              <div>
                <dt>Role</dt>
                <dd>{SITE.operator.role}</dd>
              </div>
              <div>
                <dt>Est.</dt>
                <dd>{SITE.founded}</dd>
              </div>
              <div>
                <dt>Stack</dt>
                <dd>Next.js, TypeScript, raw WebGL, Lenis</dd>
              </div>
              <div>
                <dt>Type</dt>
                <dd>Archivo (variable width) &amp; IBM Plex Mono</dd>
              </div>
              <div>
                <dt>Signal</dt>
                <dd>
                  <span className="led signal" aria-hidden="true" style={{ marginRight: 8, verticalAlign: 1 }} />
                  #FF5A1F
                </dd>
              </div>
              <div>
                <dt>Source</dt>
                <dd>
                  <a href={SITE.links.source} target="_blank" rel="noreferrer" className="link-line">
                    GitHub ↗
                  </a>
                </dd>
              </div>
            </dl>
          </Reveal>
        </aside>
      </div>
    </div>
  );
}
