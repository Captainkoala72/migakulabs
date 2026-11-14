"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { BrandMark } from "./BrandMark";
import { StatusChip } from "./StatusChip";
import { NAV, SITE } from "@/lib/site";

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <Link href="/" className="brand" aria-label={`${SITE.name} home`}>
          <BrandMark />
          <span className="brand-word">
            MiGaKu <span className="labs">LABS</span>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link"
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              <span className="code">{item.code}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="nav-right">
          <StatusChip />
          {!isActive("/forge") && (
            <Link href="/forge" className="btn btn-primary btn-sm">
              Open Forge <span className="arrow">→</span>
            </Link>
          )}
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              {open ? (
                <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" />
              ) : (
                <path d="M2 6h16M2 14h16" stroke="currentColor" strokeWidth="1.5" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div id="mobile-menu" className="mobile-menu" data-open={open}>
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? "page" : undefined}>
            {item.label}
            <span className="label">{item.code}</span>
          </Link>
        ))}
        <StatusChip />
      </div>
    </header>
  );
}
