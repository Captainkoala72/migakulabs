"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny synthesized UI sounds (no audio files). Off by default; the visitor
 * turns them on from the HUD.
 */

const KEY = "migaku.sfx";
let enabled = false;
let loaded = false;
let ctx: AudioContext | null = null;
const subs = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    enabled = window.localStorage.getItem(KEY) === "1";
  } catch {
    enabled = false;
  }
}

function audio(): AudioContext | null {
  if (!enabled) return null;
  try {
    ctx ??= new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, duration: number, type: OscillatorType, gain: number, slideTo?: number, delay = 0) {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + duration);
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(gain, t + 0.006);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(amp).connect(ac.destination);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

export const sfx = {
  tick: () => tone(2100, 0.025, "square", 0.018),
  detent: (step: number) => tone(420 + step * 95, 0.07, "triangle", 0.07),
  hover: () => tone(1500, 0.02, "sine", 0.02),
  start: () => tone(180, 0.32, "sawtooth", 0.035, 720),
  done: () => {
    tone(660, 0.12, "triangle", 0.06);
    tone(990, 0.22, "triangle", 0.06, undefined, 0.09);
  },
  error: () => tone(200, 0.2, "square", 0.04, 120),
};

export function setSfx(on: boolean) {
  load();
  enabled = on;
  try {
    window.localStorage.setItem(KEY, on ? "1" : "0");
  } catch {
    /* Storage unavailable. */
  }
  if (on) tone(880, 0.09, "triangle", 0.06);
  subs.forEach((fn) => fn());
}

export function useSfx(): boolean {
  return useSyncExternalStore(
    (fn) => {
      subs.add(fn);
      return () => subs.delete(fn);
    },
    () => {
      load();
      return enabled;
    },
    () => false
  );
}
