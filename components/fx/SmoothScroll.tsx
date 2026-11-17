"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { getLenis, onTick, remeasure, setLenis } from "@/lib/fx/ticker";

/** Inertial scrolling for wheel input. Touch and reduced-motion keep native scrolling. */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Keep the frame loop alive even when smooth scrolling is off.
    const off = onTick(() => {});
    if (reduced) return off;
    const lenis = new Lenis({ lerp: 0.105, wheelMultiplier: 1, smoothWheel: true, syncTouch: false, autoRaf: false });
    setLenis(lenis);
    return () => {
      off();
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  // New route: start at the top and re-measure once the new page has laid out.
  useEffect(() => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
    const id = window.setTimeout(() => {
      getLenis()?.resize();
      remeasure();
    }, 120);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}
