"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Counter, Magnetic, Pin } from "@/components/fx/Motion";
import { Scramble } from "@/components/fx/Scramble";
import { TLink } from "@/components/fx/Transition";
import { diffWords, retention, wordCount } from "@/lib/forge/diff";
import { INTENSITY } from "@/lib/forge/intensity";
import { SPECIMEN_RAW, SPECIMEN_STOPS } from "@/lib/forge/specimen";
import { clamp, smoothstep } from "@/lib/fx/math";
import { sfx } from "@/lib/fx/sfx";

/** Shared with the scene driver so the specimen polishes in step with the scroll. */
export const processState = { p: 0 };

/**
 * The Forge in one scroll: the section pins, and scrolling moves the dial
 * through its five stops while the same raw prompt is re-forged at each one.
 */
export function Process() {
  const [stop, setStop] = useState(0);
  const stopRef = useRef(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const overflow = useRef(0);
  const railRef = useRef<HTMLDivElement>(null);

  const stops = useMemo(
    () =>
      SPECIMEN_STOPS.map((output) => {
        const parts = diffWords(SPECIMEN_RAW, output).filter((p) => p.kind !== "del");
        const before = wordCount(SPECIMEN_RAW);
        const after = wordCount(output);
        return {
          parts,
          after,
          delta: Math.round(((after - before) / before) * 100),
          kept: Math.round(retention(parts) * 100),
        };
      }),
    []
  );

  // How far the document has to travel inside its window at this stop.
  useEffect(() => {
    const measure = () => {
      const box = boxRef.current;
      const inner = innerRef.current;
      if (box && inner) overflow.current = Math.max(0, inner.scrollHeight - box.clientHeight + 24);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [stop]);

  const onProgress = (p: number) => {
    processState.p = p;
    // The first 6% and last 8% are held so each end reads cleanly.
    const t = clamp((p - 0.06) / 0.86);
    const next = Math.min(4, Math.floor(t * 5));
    if (next !== stopRef.current) {
      stopRef.current = next;
      setStop(next);
      sfx.detent(next);
    }
    const sub = clamp(t * 5 - next);
    // The thumb rests on a stop, then glides to the next one at the end of each beat.
    const glide = next < 4 ? smoothstep(0.72, 1, sub) : 0;
    railRef.current?.style.setProperty("--thumb", ((next + glide) / 4).toFixed(4));
    if (innerRef.current) {
      const travel = clamp((sub - 0.25) / 0.6) * overflow.current;
      innerRef.current.style.transform = `translate3d(0, ${(-travel).toFixed(1)}px, 0)`;
    }
  };

  const current = stops[stop];
  const info = INTENSITY[stop];

  return (
    <Pin id="process" length={520} className="process" onProgress={onProgress} label="How Prompt Forge works">
      <div className="wrap process-inner">
        <header className="process-head">
          <div className="section-tag">
            <span className="label signal">01</span>
            <span className="label">The Forge, in one scroll</span>
          </div>
          <p className="process-raw">
            <span className="label">Raw input</span>
            <span className="mono">“{SPECIMEN_RAW}”</span>
          </p>
        </header>

        <div className="process-body">
          <div className="process-stage">
            <span className="label">
              Stop <span className="num">{String(stop).padStart(2, "0")}</span> / 04 · length {info.lengthBudget}
            </span>
            <h2 className="process-name display">
              <Scramble text={info.name} on="change" speed={1.4} />
            </h2>
            <p className="process-summary">{info.summary}</p>
            <dl className="process-stats">
              <div>
                <dt className="label">Words</dt>
                <dd>
                  23 → <Counter value={current.after} />
                </dd>
              </div>
              <div>
                <dt className="label">Change</dt>
                <dd>
                  <Counter value={current.delta} prefix={current.delta >= 0 ? "+" : ""} suffix="%" />
                </dd>
              </div>
              <div>
                <dt className="label">Your words kept</dt>
                <dd>
                  <Counter value={current.kept} suffix="%" />
                </dd>
              </div>
            </dl>
            <div className="process-cta">
              <Magnetic>
                <TLink href="/forge" className="btn btn-primary" data-cursor="Open">
                  Try it on your own prompt <span className="arrow">→</span>
                </TLink>
              </Magnetic>
            </div>
          </div>

          <div className="process-gap" aria-hidden="true" />

          <div className="panel ticks process-doc">
            <div className="panel-head">
              <span className="label strong">cover-letter.prompt</span>
              <span className="doc-legend label">
                <i className="k" /> yours <i className="a" /> forged
              </span>
            </div>
            <div className="doc-window" ref={boxRef}>
              <div className="doc-inner" ref={innerRef}>
                <pre key={stop} className="doc-text">
                  {current.parts.map((part, i) =>
                    part.kind === "same" ? (
                      <span className="kept" key={i}>
                        {part.text}
                      </span>
                    ) : (
                      <span key={i}>{part.text}</span>
                    )
                  )}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <footer className="process-rail" aria-hidden="true">
          <span className="label strong">Polish</span>
          <div className="rail" ref={railRef}>
            <div className="rail-fill" />
            <div className="rail-thumb" />
            {INTENSITY.map((s) => (
              <span key={s.value} className="rail-stop" data-active={s.value === stop} style={{ ["--i" as string]: s.value }}>
                <i />
                <b>{s.name}</b>
              </span>
            ))}
          </div>
          <span className="label strong">Optimize</span>
        </footer>
      </div>
    </Pin>
  );
}
