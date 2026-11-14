import type { Metadata } from "next";
import Link from "next/link";

import { MODELS, PROVIDERS } from "@/lib/forge/catalog";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `What ${SITE.name} is, how it builds, and who runs it.`,
};

export default function AboutPage() {
  return (
    <div className="wrap">
      <header className="page-head">
        <div className="crumbs">
          <span className="label">Index</span>
          <span className="label">/</span>
          <span className="label strong">About</span>
        </div>
        <h1>A small lab with a simple rule: ship what you use.</h1>
        <p className="lede">{SITE.description}</p>
      </header>

      <div className="sheet">
        <div className="sheet-main">
          <section>
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
          </section>

          <section>
            <h2>The operator</h2>
            <div className="prose">
              <p>{SITE.operator.bio}</p>
            </div>
            <div style={{ display: "flex", gap: "var(--s-3)", flexWrap: "wrap", marginTop: "var(--s-5)" }}>
              <a href={SITE.links.github} className="btn btn-ghost" target="_blank" rel="noreferrer">
                GitHub ↗
              </a>
              <Link href="/forge" className="btn btn-primary">
                Try Prompt Forge <span className="arrow">→</span>
              </Link>
            </div>
          </section>

          <section>
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
            </ol>
          </section>
        </div>

        <aside className="sheet-side">
          <div className="panel ticks">
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
                <dd>Next.js, TypeScript, server-side streaming</dd>
              </div>
              <div>
                <dt>Type</dt>
                <dd>Archivo &amp; IBM Plex Mono</dd>
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
                  <a href={SITE.links.source} target="_blank" rel="noreferrer">
                    GitHub ↗
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
