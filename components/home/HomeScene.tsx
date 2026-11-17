"use client";

import { useEffect } from "react";

import { HALF_H } from "@/components/fx/Scene";
import { processState } from "@/components/home/Process";
import { clamp, lerp, smoothstep } from "@/lib/fx/math";
import { isReady } from "@/lib/fx/ready";
import { SHAPE, heroDial, setPair, setScene, type ShapeId } from "@/lib/fx/scene";
import { TEXT_WIDTH } from "@/lib/fx/shapes";
import { onTick, scroll, view } from "@/lib/fx/ticker";

interface Key {
  shape: ShapeId;
  x: number;
  y: number;
  scale: number;
  alpha: number;
  chaos: number;
  spin: number;
  tilt: number;
  roll: number;
  face: number;
  level: number;
}

const ORDER = ["hero", "process", "models", "deck", "lab", "method", "log", "finale"] as const;
const PINNED = new Set(["process", "lab"]);
const NUMERIC: (keyof Omit<Key, "shape">)[] = ["x", "y", "scale", "alpha", "chaos", "spin", "tilt", "roll", "face", "level"];

/** Where the specimen sits and what it looks like in each section. */
function keyFor(id: (typeof ORDER)[number], mobile: boolean, aspect: number, finaleY: number): Key {
  const base = { chaos: 0, spin: 0.14, tilt: 0.3, roll: 0, face: 0, level: 1 };
  switch (id) {
    case "hero":
      return mobile
        ? { ...base, shape: SHAPE.GEM, x: 0.2, y: 0.56, scale: 0.5, alpha: 0.85, chaos: 1 - heroDial.polish }
        : { ...base, shape: SHAPE.GEM, x: 0.5, y: 0.05, scale: 1.1, alpha: 1, chaos: 1 - heroDial.polish };
    case "process": {
      // Polishes one stop at a time, in step with the rail.
      const t = clamp((processState.p - 0.06) / 0.86);
      const stop = Math.min(4, Math.floor(t * 5));
      const glide = stop < 4 ? smoothstep(0.72, 1, t * 5 - stop) : 0;
      const chaos = 1 - (stop + glide) / 4;
      return mobile
        ? { ...base, shape: SHAPE.GEM, x: 0.3, y: -0.3, scale: 0.48, alpha: 0.9, chaos, spin: 0.3 }
        : { ...base, shape: SHAPE.GEM, x: -0.035, y: 0.0, scale: 0.66, alpha: 1, chaos, spin: 0.3 };
    }
    case "models":
      return mobile
        ? { ...base, shape: SHAPE.ORBITS, x: 0.35, y: -0.25, scale: 0.6, alpha: 0.24, spin: 0.2, tilt: 0.45 }
        : { ...base, shape: SHAPE.ORBITS, x: 0.52, y: 0.14, scale: 1.02, alpha: 0.95, spin: 0.2, tilt: 0.45 };
    case "deck":
      return { ...base, shape: SHAPE.WAVE, x: 0, y: -0.55, scale: mobile ? 0.9 : 1.3, alpha: 0.2, spin: 0, tilt: 0.3, face: 1 };
    case "lab":
      return { ...base, shape: SHAPE.WAVE, x: 0, y: -0.5, scale: mobile ? 1 : 1.5, alpha: mobile ? 0.35 : 0.6, spin: 0, tilt: 0.34, face: 1 };
    case "method":
      return mobile
        ? { ...base, shape: SHAPE.RING, x: 0, y: 0, scale: 0.5, alpha: 0.16, spin: 0, tilt: 0.5, roll: 0.14, face: 1, level: 0 }
        : { ...base, shape: SHAPE.RING, x: -0.52, y: -0.36, scale: 0.6, alpha: 0.75, spin: 0, tilt: 0.55, roll: 0.14, face: 1, level: 0 };
    case "log":
      return mobile
        ? { ...base, shape: SHAPE.RING, x: 0, y: 0, scale: 0.5, alpha: 0.1, spin: 0, tilt: 0.5, roll: 0.14, face: 1, level: 0 }
        : { ...base, shape: SHAPE.RING, x: -0.56, y: -0.62, scale: 0.46, alpha: 0.32, spin: 0, tilt: 0.55, roll: 0.14, face: 1, level: 0 };
    case "finale": {
      // The wordmark is anchored inside the section, so it scrolls with the page like real type.
      const fit = (2 * HALF_H * aspect * (mobile ? 0.9 : 0.7)) / TEXT_WIDTH;
      return { ...base, shape: SHAPE.TEXT, x: 0, y: finaleY, scale: Math.min(1.15, fit), alpha: 1, spin: 0, tilt: 0, face: 1, level: 1 };
    }
  }
}

/**
 * Drives the WebGL specimen from scroll position on the home page: each
 * section has a pose, and the specimen morphs between poses in the gaps.
 */
export function HomeScene() {
  useEffect(() => {
    let holds: { start: number; end: number }[] = [];
    let finaleTop = 0;
    let finaleHeight = 1;

    const measure = () => {
      const vh = window.innerHeight;
      holds = ORDER.map((id) => {
        const el = document.getElementById(id);
        if (!el) return { start: 0, end: 0 };
        const rect = el.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        if (id === "finale") {
          finaleTop = top;
          finaleHeight = rect.height;
        }
        if (PINNED.has(id)) return { start: top, end: top + rect.height - vh };
        const start = top - vh * 0.25;
        const end = top + rect.height - vh * 0.8;
        return end < start ? { start: (start + end) / 2, end: (start + end) / 2 } : { start, end };
      });
      // Neighbours may not overlap: split the difference.
      for (let i = 0; i < holds.length - 1; i++) {
        if (holds[i].end > holds[i + 1].start) {
          const mid = (holds[i].end + holds[i + 1].start) / 2;
          holds[i].end = mid - 1;
          holds[i + 1].start = mid + 1;
        }
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", measure);

    const off = onTick(() => {
      if (!holds.length) return;
      const y = scroll.y;
      const aspect = view.w / view.h;
      let i = 0;
      while (i < ORDER.length - 1 && y >= holds[i + 1].start) i++;
      // Viewport-space y (-1..1) of a point 27% down the finale section.
      const anchorPx = finaleTop + finaleHeight * (view.mobile ? 0.24 : 0.27) - y;
      const finaleY = clamp(1 - (2 * anchorPx) / view.h, -1.6, 1.6);
      const a = keyFor(ORDER[i], view.mobile, aspect, finaleY);
      let t = 0;
      let b = a;
      if (i < ORDER.length - 1 && y > holds[i].end) {
        b = keyFor(ORDER[i + 1], view.mobile, aspect, finaleY);
        t = smoothstep(holds[i].end, holds[i + 1].start, y);
      }
      const out: Record<string, number> = {};
      for (const k of NUMERIC) out[k] = lerp(a[k], b[k], t);
      if (!isReady()) out.alpha = 0;
      setScene(out);
      setPair(a.shape, b.shape, a.shape === b.shape ? 0 : t);
    });

    return () => {
      off();
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return null;
}
