"use client";

import { useSyncExternalStore } from "react";

/** Flips to true once the boot sequence has finished, so intros start together. */
let ready = false;
const subs = new Set<() => void>();

export function markReady() {
  if (ready) return;
  ready = true;
  document.documentElement.dataset.ready = "true";
  subs.forEach((fn) => fn());
}

export function isReady() {
  return ready;
}

export function whenReady(fn: () => void): () => void {
  if (ready) {
    fn();
    return () => {};
  }
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
}

function subscribe(fn: () => void) {
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
}

export function useReady(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => ready,
    () => false
  );
}
