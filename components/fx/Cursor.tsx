"use client";

import { useEffect, useRef } from "react";

import { damp } from "@/lib/fx/math";
import { onTick, pointer, view } from "@/lib/fx/ticker";

/**
 * A trailing ring that follows the native cursor. It grows over interactive
 * elements and shows a label for anything marked data-cursor="Label".
 */
export function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!ring || !label) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let x = -100;
    let y = -100;
    let scale = 1;
    let targetScale = 1;
    let mode = "";

    const setMode = (next: string, text = "") => {
      if (next === mode && label.textContent === text) return;
      mode = next;
      ring.dataset.mode = next;
      label.textContent = text;
    };

    const onOver = (e: PointerEvent) => {
      const el = e.target as Element | null;
      if (!el?.closest) return;
      const labelled = el.closest<HTMLElement>("[data-cursor]");
      if (labelled) {
        targetScale = 1;
        setMode("label", labelled.dataset.cursor ?? "");
        return;
      }
      if (el.closest("textarea, input:not([type=range]), [contenteditable=true], pre")) {
        targetScale = 0.2;
        setMode("text");
        return;
      }
      if (el.closest("a, button, [role=option], [role=tab], input[type=range], summary, label[for]")) {
        targetScale = 1.9;
        setMode("link");
        return;
      }
      targetScale = 1;
      setMode("");
    };

    document.addEventListener("pointerover", onOver, { passive: true });
    const off = onTick((_, dt) => {
      if (!view.fine) return;
      x = damp(x, pointer.x, 16, dt);
      y = damp(y, pointer.y, 16, dt);
      scale = damp(scale, pointer.down ? targetScale * 0.75 : targetScale, 14, dt);
      ring.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
      ring.style.opacity = pointer.seen ? "1" : "0";
    });
    return () => {
      off();
      document.removeEventListener("pointerover", onOver);
    };
  }, []);

  return (
    <div ref={ringRef} className="cursor" aria-hidden="true">
      <span ref={labelRef} className="cursor-label" />
    </div>
  );
}
