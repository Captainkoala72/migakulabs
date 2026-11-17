"use client";

import { useEffect, useRef, useState } from "react";

import { setSfx, useSfx } from "@/lib/fx/sfx";
import { onTick, pointer, scroll, view } from "@/lib/fx/ticker";

/** Instrument overlay: scroll depth ruler, cursor coordinates, local time, sound switch. */
export function Hud() {
  const markRef = useRef<HTMLSpanElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const xyRef = useRef<HTMLSpanElement>(null);
  const [time, setTime] = useState("");

  useEffect(() => {
    let lastPct = -1;
    let lastXY = "";
    const off = onTick(() => {
      const p = Math.min(1, Math.max(0, scroll.y / scroll.max));
      const pct = Math.round(p * 100);
      if (pct !== lastPct && pctRef.current) {
        lastPct = pct;
        pctRef.current.textContent = String(pct).padStart(3, "0");
        if (markRef.current) markRef.current.style.top = `${pct}%`;
      }
      if (xyRef.current && view.fine) {
        const xy = pointer.seen
          ? `X ${String(Math.round(pointer.x)).padStart(4, "0")}  Y ${String(Math.round(pointer.y)).padStart(4, "0")}`
          : "X ----  Y ----";
        if (xy !== lastXY) {
          lastXY = xy;
          xyRef.current.textContent = xy;
        }
      }
    });
    const clock = () =>
      setTime(new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
    clock();
    const id = window.setInterval(clock, 1000);
    return () => {
      off();
      window.clearInterval(id);
    };
  }, []);

  return (
    <div className="hud" aria-hidden="true">
      <div className="hud-ruler" aria-hidden="true">
        <span className="hud-pct" ref={pctRef}>
          000
        </span>
        <div className="hud-rail">
          <span className="hud-mark" ref={markRef} />
        </div>
        <span className="hud-cap">Depth</span>
      </div>
      <div className="hud-bl" aria-hidden="true">
        <span ref={xyRef}>X ---- Y ----</span>
        <span suppressHydrationWarning>{time} LCL</span>
      </div>
    </div>
  );
}

/** Interface sound switch (off by default). */
export function SoundToggle() {
  const sound = useSfx();
  return (
    <button
      type="button"
      className="sound-toggle"
      onClick={() => setSfx(!sound)}
      aria-pressed={sound}
      aria-label={sound ? "Turn interface sounds off" : "Turn interface sounds on"}
    >
      <span className={`eq ${sound ? "on" : ""}`} aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      Sound {sound ? "on" : "off"}
    </button>
  );
}
