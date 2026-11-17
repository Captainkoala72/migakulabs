import type Lenis from "lenis";

/**
 * One requestAnimationFrame loop for the whole site. Smooth scroll, the WebGL
 * scene, the cursor and every scroll-linked animation subscribe here, so
 * there is a single source of truth for time, scroll and pointer position.
 */

type Tick = (time: number, dt: number) => void;

const subs = new Set<Tick>();
let rafId = 0;
let last = 0;
let started = false;
let lenis: Lenis | null = null;

/** Live scroll state. y is the smoothed position, v is velocity in px/s. */
export const scroll = { y: 0, v: 0, max: 1, dir: 1 };
export const view = { w: 1, h: 1, dpr: 1, mobile: false, reduced: false, fine: true };
/** Pointer in px, and normalized to -1..1 (y up). */
export const pointer = { x: -9999, y: -9999, nx: 0, ny: 0, seen: false, down: false };

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function getLenis() {
  return lenis;
}

export function scrollToTarget(target: number | string | HTMLElement, immediate = false) {
  if (lenis) lenis.scrollTo(target, { immediate, offset: 0 });
  else if (typeof target === "number") window.scrollTo({ top: target, behavior: immediate ? "auto" : "smooth" });
  else {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
  }
}

function measure() {
  view.w = window.innerWidth;
  view.h = window.innerHeight;
  view.dpr = Math.min(window.devicePixelRatio || 1, 1.75);
  view.mobile = view.w < 860;
  view.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  view.fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  scroll.max = Math.max(1, document.documentElement.scrollHeight - view.h);
}

function frame(now: number) {
  const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
  last = now;
  lenis?.raf(now);
  const y = lenis ? lenis.scroll : window.scrollY;
  const instant = (y - scroll.y) / dt;
  scroll.v += (instant - scroll.v) * Math.min(1, dt * 9);
  if (Math.abs(y - scroll.y) > 0.5) scroll.dir = y > scroll.y ? 1 : -1;
  scroll.y = y;
  const time = now / 1000;
  subs.forEach((fn) => fn(time, dt));
  rafId = requestAnimationFrame(frame);
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  measure();
  window.addEventListener("resize", measure, { passive: true });
  new ResizeObserver(measure).observe(document.body);
  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.nx = (e.clientX / view.w) * 2 - 1;
      pointer.ny = -((e.clientY / view.h) * 2 - 1);
      pointer.seen = true;
    },
    { passive: true }
  );
  window.addEventListener("pointerdown", () => (pointer.down = true), { passive: true });
  window.addEventListener("pointerup", () => (pointer.down = false), { passive: true });
  document.documentElement.addEventListener("pointerleave", () => (pointer.seen = false));
  last = performance.now();
  rafId = requestAnimationFrame(frame);

  // Development aid: advance the simulation N frames at once (useful when the
  // tab is throttled in the background). Not included in production builds.
  if (process.env.NODE_ENV !== "production") {
    (window as unknown as { __fxStep?: (frames?: number) => void }).__fxStep = (frames = 60) => {
      for (let i = 0; i < frames; i++) {
        last = performance.now() - 1000 / 60;
        cancelAnimationFrame(rafId);
        frame(performance.now());
      }
    };
  }
}

/** Subscribe to the frame loop. Returns an unsubscribe function. */
export function onTick(fn: Tick): () => void {
  start();
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
}

export function remeasure() {
  if (started) measure();
}
