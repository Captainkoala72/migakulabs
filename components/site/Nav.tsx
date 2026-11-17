"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BrandMark } from "./BrandMark";
import { StatusChip } from "./StatusChip";
import { SoundToggle } from "@/components/fx/Hud";
import { Scramble } from "@/components/fx/Scramble";
import { TLink } from "@/components/fx/Transition";
import { getLenis, onTick, scroll } from "@/lib/fx/ticker";
import { NAV, SITE } from "@/lib/site";

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const openRef = useRef(false);
  openRef.current = open;

  useEffect(() => setOpen(false), [pathname]);

  // Lock scrolling behind the full-screen menu.
  useEffect(() => {
    const lenis = getLenis();
    if (open) lenis?.stop();
    else lenis?.start();
    document.documentElement.classList.toggle("menu-open", open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Slide away while reading down the page; return on any upward scroll.
  useEffect(() => {
    let hidden = false;
    let atTop = true;
    return onTick(() => {
      const el = ref.current;
      if (!el) return;
      const wantHidden = scroll.y > 320 && scroll.dir > 0 && !openRef.current;
      if (wantHidden !== hidden) {
        hidden = wantHidden;
        el.dataset.hidden = String(hidden);
      }
      const top = scroll.y < 24;
      if (top !== atTop) {
        atTop = top;
        el.dataset.top = String(top);
      }
    });
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <header className="nav" ref={ref} data-top="true" data-hidden="false">
        <div className="wrap nav-inner">
          <TLink href="/" className="brand" aria-label={`${SITE.name} home`}>
            <BrandMark />
            <span className="brand-word">
              MiGaKu <span className="labs">LABS</span>
            </span>
          </TLink>

          <nav className="nav-links" aria-label="Primary">
            {NAV.map((item) => (
              <TLink
                key={item.href}
                href={item.href}
                className="nav-link"
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                <span className="code">{item.code}</span>
                <Scramble text={item.label} on="hover" speed={1.6} />
              </TLink>
            ))}
          </nav>

          <div className="nav-right">
            <SoundToggle />
            <StatusChip />
            {!isActive("/forge") && (
              <TLink href="/forge" className="btn btn-primary btn-sm nav-cta">
                Open Forge <span className="arrow">→</span>
              </TLink>
            )}
            <button
              type="button"
              className="nav-toggle"
              aria-expanded={open}
              aria-controls="menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <span data-open={open}>
                <i />
                <i />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div id="menu" className="menu" data-open={open} aria-hidden={!open}>
        <nav aria-label="Menu">
          <TLink href="/" tabIndex={open ? 0 : -1} style={{ ["--i" as string]: 0 }}>
            <span className="label">00</span>
            <span className="menu-word">Index</span>
          </TLink>
          {NAV.map((item, i) => (
            <TLink key={item.href} href={item.href} tabIndex={open ? 0 : -1} style={{ ["--i" as string]: i + 1 }}>
              <span className="label">{item.code}</span>
              <span className="menu-word">{item.label}</span>
            </TLink>
          ))}
        </nav>
        <div className="menu-foot">
          <StatusChip />
          <span className="label">{SITE.name} · Est. {SITE.founded}</span>
        </div>
      </div>
    </>
  );
}
