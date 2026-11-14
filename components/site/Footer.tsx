import Link from "next/link";

import { EXPERIMENTS } from "@/lib/experiments";
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
              <Link key={e.slug} href={e.href}>
                {e.name}
              </Link>
            ))}
          </div>
          <div className="footer-col">
            <span className="label">Lab</span>
            <Link href="/lab">All experiments</Link>
            <Link href="/about">About the lab</Link>
            <a href={SITE.links.github} target="_blank" rel="noreferrer">
              GitHub ↗
            </a>
          </div>
        </div>

        <div className="footer-word" aria-hidden="true">
          MiGaKu Labs
        </div>
      </div>
      <div className="wrap">
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
          <span className="label">Built with Next.js · Deployed on Vercel</span>
        </div>
      </div>
    </footer>
  );
}
