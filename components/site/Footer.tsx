"use client";

import { TLink } from "@/components/fx/Transition";
import { EXPERIMENTS } from "@/lib/experiments";
import { scrollToTarget } from "@/lib/fx/ticker";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <p className="footer-lede">
            {SITE.name} is an independent lab for practical AI tools. Each instrument is designed, tested and used here
            before it goes live.
          </p>
          <div className="footer-col">
            <span className="label">Instruments</span>
            {EXPERIMENTS.map((e) => (
              <TLink key={e.slug} href={e.href} className="link-line">
                {e.name}
              </TLink>
            ))}
          </div>
          <div className="footer-col">
            <span className="label">Lab</span>
            <TLink href="/lab" className="link-line">
              All experiments
            </TLink>
            <TLink href="/about" className="link-line">
              About the lab
            </TLink>
            <a href={SITE.links.github} target="_blank" rel="noreferrer" className="link-line">
              GitHub ↗
            </a>
          </div>
        </div>
        <div className="footer-base">
          <span className="label">
            © {SITE.founded} {SITE.name}
          </span>
          <span className="jp-nod">
            <span className="jp" lang="ja">
              磨く
            </span>
            <span className="label">migaku — to polish, to refine</span>
          </span>
          <button type="button" className="label footer-top" onClick={() => scrollToTarget(0)}>
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  );
}
