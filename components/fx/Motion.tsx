"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { clamp, damp } from "@/lib/fx/math";
import { whenReady } from "@/lib/fx/ready";
import { onTick, pointer, scroll, view } from "@/lib/fx/ticker";

/* ------------------------------------------------------------------ */
/* Pin: a tall section whose content sticks while you scroll through   */
/* it. Progress (0..1) is written to the --p CSS variable every frame. */
/* ------------------------------------------------------------------ */

interface PinProps {
  id?: string;
  /** Scroll length in viewport heights x100 (300 = three screens). */
  length?: number;
  className?: string;
  children: ReactNode;
  onProgress?: (p: number) => void;
  label?: string;
}

export function Pin({ id, length = 300, className = "", children, onProgress, label }: PinProps) {
  const ref = useRef<HTMLElement>(null);
  const cb = useRef(onProgress);
  cb.current = onProgress;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const stick = el.firstElementChild as HTMLElement;
    let top = 0;
    let span = 1;
    let last = -1;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      top = rect.top + window.scrollY;
      span = Math.max(1, rect.height - stick.offsetHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(document.body);
    const off = onTick(() => {
      const p = clamp((scroll.y - top) / span);
      if (Math.abs(p - last) < 0.0003) return;
      last = p;
      el.style.setProperty("--p", p.toFixed(4));
      cb.current?.(p);
    });
    return () => {
      ro.disconnect();
      off();
    };
  }, []);

  return (
    <section
      id={id}
      ref={ref}
      className={`pin ${className}`}
      style={{ ["--len" as string]: length } as CSSProperties}
      aria-label={label}
    >
      <div className="pin-stick">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Magnetic: content leans toward the cursor when it gets close.       */
/* ------------------------------------------------------------------ */

export function Magnetic({ children, strength = 0.32, className = "" }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let active = false;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) * strength;
      ty = (e.clientY - (r.top + r.height / 2)) * strength;
      active = true;
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    const off = onTick((_, dt) => {
      if (!active) return;
      x = damp(x, tx, 12, dt);
      y = damp(y, ty, 12, dt);
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      if (tx === 0 && ty === 0 && Math.abs(x) < 0.05 && Math.abs(y) < 0.05) {
        active = false;
        el.style.transform = "";
      }
    });
    return () => {
      off();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [strength]);

  return (
    <span ref={ref} className={`magnetic ${className}`}>
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Tilt: a card that leans in 3D under the cursor, with a moving glare. */
/* ------------------------------------------------------------------ */

interface TiltProps {
  children: ReactNode;
  className?: string;
  max?: number;
  style?: CSSProperties;
  cursor?: string;
}

export function Tilt({ children, className = "", max = 7, style, cursor }: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty("--rx", `${((0.5 - py) * max).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${((px - 0.5) * max).toFixed(2)}deg`);
      el.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
      el.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
    };
    const onLeave = () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [max]);

  return (
    <div ref={ref} className={`tilt ${className}`} style={style} data-cursor={cursor}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Marquee: an endless band whose speed and skew follow scroll speed.  */
/* ------------------------------------------------------------------ */

export function Marquee({ children, speed = 60, reverse = false, className = "" }: { children: ReactNode; speed?: number; reverse?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = ref.current;
    if (!track) return;
    const first = track.firstElementChild as HTMLElement | null;
    if (!first) return;
    let width = first.offsetWidth;
    const ro = new ResizeObserver(() => (width = first.offsetWidth));
    ro.observe(first);
    let x = 0;
    let skew = 0;
    const dir = reverse ? 1 : -1;
    const off = onTick((_, dt) => {
      if (view.reduced || !width) return;
      const boost = clamp(Math.abs(scroll.v) / 900, 0, 5);
      x += dir * (speed + speed * boost * 2.2) * dt;
      if (x <= -width) x += width;
      if (x > 0) x -= width;
      skew = damp(skew, clamp(scroll.v / 260, -9, 9) * dir * -1, 6, dt);
      track.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0) skewX(${skew.toFixed(2)}deg)`;
    });
    return () => {
      off();
      ro.disconnect();
    };
  }, [speed, reverse]);

  return (
    <div className={`marquee ${className}`} aria-hidden="true">
      <div className="marquee-track" ref={ref}>
        <div className="marquee-group">{children}</div>
        <div className="marquee-group">{children}</div>
        <div className="marquee-group">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Counter: a number that rolls to its value.                          */
/* ------------------------------------------------------------------ */

export function Counter({ value, pad = 0, prefix = "", suffix = "" }: { value: number; pad?: number; prefix?: string; suffix?: string }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(value);
      from.current = value;
      return;
    }
    const start = from.current;
    const begin = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - begin) / 520);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(start + (value - start) * eased);
      setShown(next);
      from.current = next;
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const sign = shown < 0 ? "-" : "";
  return (
    <span ref={ref} className="num">
      {prefix}
      {sign}
      {String(Math.abs(shown)).padStart(pad, "0")}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Spotlight: children get --mx/--my so their borders can glow under   */
/* the cursor.                                                         */
/* ------------------------------------------------------------------ */

export function Spotlight({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      for (const child of el.children) {
        const r = (child as HTMLElement).getBoundingClientRect();
        (child as HTMLElement).style.setProperty("--mx", `${(e.clientX - r.left).toFixed(0)}px`);
        (child as HTMLElement).style.setProperty("--my", `${(e.clientY - r.top).toFixed(0)}px`);
      }
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    return () => el.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div ref={ref} className={`spotlight ${className}`}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* useAfterReady: run an effect once the boot sequence is done.        */
/* ------------------------------------------------------------------ */

export function useAfterReady(fn: () => void | (() => void)) {
  const saved = useRef(fn);
  saved.current = fn;
  useEffect(() => {
    let cleanup: void | (() => void);
    const off = whenReady(() => {
      cleanup = saved.current();
    });
    return () => {
      off();
      if (typeof cleanup === "function") cleanup();
    };
  }, []);
}

export { pointer };
