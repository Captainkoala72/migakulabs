"use client";

import { useEffect, useState } from "react";

import { BrandMark } from "@/components/site/BrandMark";
import { markReady } from "@/lib/fx/ready";

const STEPS = ["Mounting specimen", "Aligning optics", "Warming the forge", "Calibrated"];

/**
 * Boot sequence shown once per browser session. A CSS failsafe hides it even
 * if JavaScript never runs, and an inline script in <head> skips it on
 * repeat visits before first paint.
 */
export function Preloader() {
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<"run" | "exit" | "gone">("run");

  useEffect(() => {
    const root = document.documentElement;
    const skip = root.dataset.skipIntro === "true" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (skip) {
      setPhase("gone");
      markReady();
      return;
    }
    try {
      window.sessionStorage.setItem("migaku.booted", "1");
    } catch {
      /* Private mode. */
    }

    const duration = 1500;
    const begin = performance.now();
    let fontsIn = false;
    document.fonts?.ready.then(() => (fontsIn = true));
    let raf = 0;
    const timers: number[] = [];
    const tick = (now: number) => {
      const t = Math.min(1, (now - begin) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      // Hold at 96 until fonts have arrived (but never longer than 3s).
      const cap = fontsIn || now - begin > 3000 ? 100 : 96;
      setCount(Math.min(cap, Math.round(eased * 100)));
      if (t >= 1 && cap === 100) {
        setPhase("exit");
        timers.push(window.setTimeout(markReady, 380));
        timers.push(window.setTimeout(() => setPhase("gone"), 1250));
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  if (phase === "gone") return null;
  const step = STEPS[Math.min(STEPS.length - 1, Math.floor((count / 100) * STEPS.length))];

  return (
    <div className="preloader" data-phase={phase} role="status" aria-label="Loading MiGaKu Labs">
      <div className="preloader-top">
        <span className="brand">
          <BrandMark />
          <span className="brand-word">
            MiGaKu <span className="labs">LABS</span>
          </span>
        </span>
        <span className="label">Boot sequence</span>
      </div>
      <div className="preloader-count" aria-hidden="true">
        {String(count).padStart(3, "0")}
      </div>
      <div className="preloader-bottom">
        <span className="label strong">{step}</span>
        <div className="preloader-bar">
          <i style={{ transform: `scaleX(${count / 100})` }} />
        </div>
        <span className="label">EXP-001 online</span>
      </div>
    </div>
  );
}
