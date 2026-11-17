"use client";

import { useEffect, useRef, useState } from "react";

import { Magnetic } from "@/components/fx/Motion";
import { Scramble } from "@/components/fx/Scramble";
import { TLink } from "@/components/fx/Transition";
import { damp } from "@/lib/fx/math";
import { heroDial } from "@/lib/fx/scene";
import { sfx } from "@/lib/fx/sfx";
import { onTick, pointer, scroll, scrollToTarget, view } from "@/lib/fx/ticker";

const LINES = [
  { text: "Raw ideas,", raw: true },
  { text: "polished into", raw: false },
  { text: "instruments", raw: false, dot: true },
];

const BASE_WGHT = 780;
const BASE_WDTH = 76;

/**
 * The headline is set in a variable font and animated per letter:
 *  - the first line wobbles in weight and width while the specimen is raw,
 *    and settles as you drag the dial toward "polished";
 *  - every letter swells toward the cursor.
 */
export function Hero() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [polish, setPolish] = useState(heroDial.polish);
  const lastDetent = useRef(Math.round(heroDial.polish * 10));

  useEffect(() => {
    const title = titleRef.current;
    if (!title) return;
    const letters = [...title.querySelectorAll<HTMLElement>(".hc")];
    const state = letters.map(() => ({ w: BASE_WGHT, d: BASE_WDTH, lw: 0, ld: 0 }));
    let rawAmount = 1 - heroDial.polish;

    const off = onTick((time, dt) => {
      if (view.reduced || scroll.y > view.h * 1.05) return;
      rawAmount = damp(rawAmount, 1 - heroDial.polish, 6, dt);
      const useProximity = view.fine && pointer.seen;
      const rects = useProximity ? letters.map((el) => el.getBoundingClientRect()) : null;
      const radius = Math.max(140, view.w * 0.13);

      for (let i = 0; i < letters.length; i++) {
        const el = letters[i];
        const s = state[i];
        let w = BASE_WGHT;
        let d = BASE_WDTH;
        let y = 0;
        let r = 0;

        if (el.dataset.raw) {
          const n1 = Math.sin(time * 1.25 + i * 12.9898) * 0.6 + Math.sin(time * 2.3 + i * 78.233) * 0.4;
          const n2 = Math.sin(time * 0.95 + i * 39.346) * 0.6 + Math.sin(time * 1.9 + i * 11.135) * 0.4;
          const n3 = Math.sin(time * 1.6 + i * 4.71);
          w += n1 * 300 * rawAmount - 120 * rawAmount;
          d += n2 * 26 * rawAmount + 8 * rawAmount;
          y = n3 * 0.045 * rawAmount;
          r = n2 * 3.2 * rawAmount;
        }

        if (rects) {
          const rect = rects[i];
          const dx = pointer.x - (rect.left + rect.width / 2);
          const dy = pointer.y - (rect.top + rect.height / 2);
          const g = Math.exp(-(dx * dx + dy * dy) / (radius * radius));
          w += g * 140;
          d += g * 42;
        }

        s.w = damp(s.w, Math.min(900, Math.max(240, w)), 10, dt);
        s.d = damp(s.d, Math.min(124, Math.max(62, d)), 10, dt);
        const rw = Math.round(s.w / 4) * 4;
        const rd = Math.round(s.d * 2) / 2;
        if (rw !== s.lw || rd !== s.ld) {
          s.lw = rw;
          s.ld = rd;
          el.style.fontVariationSettings = `"wght" ${rw}, "wdth" ${rd}`;
        }
        if (el.dataset.raw) el.style.transform = `translateY(${y.toFixed(3)}em) rotate(${r.toFixed(2)}deg)`;
      }
    });
    return off;
  }, []);

  const onDial = (value: number) => {
    heroDial.polish = value;
    setPolish(value);
    const detent = Math.round(value * 10);
    if (detent !== lastDetent.current) {
      lastDetent.current = detent;
      sfx.tick();
    }
  };

  const roughness = (1 - polish).toFixed(2);

  return (
    <section id="hero" className="hero" aria-label="Introduction" style={{ ["--polish" as string]: polish }}>
      <div className="wrap hero-inner">
        <div className="hero-top">
          <span className="label">
            <Scramble text="MiGaKu Labs / Index" />
          </span>
          <span className="label hero-top-right">
            <Scramble text="Independent AI lab · Est. 2026" />
          </span>
        </div>

        <h1 className="hero-title" ref={titleRef}>
          <span className="sr-only">Raw ideas, polished into instruments.</span>
          {LINES.map((line, li) => (
            <span className="hl" aria-hidden="true" key={li} style={{ ["--li" as string]: li }}>
              <span className="hl-in">
                {line.text.split(" ").map((word, wi) => (
                  <span className="hw" key={wi}>
                    {[...word].map((ch, ci) => (
                      <span className="hc" data-raw={line.raw || undefined} key={ci}>
                        {ch}
                      </span>
                    ))}
                  </span>
                ))}
                {line.dot && <span className="hdot">.</span>}
              </span>
            </span>
          ))}
        </h1>

        <div className="hero-foot">
          <p className="hero-lede intro" style={{ ["--d" as string]: "520ms" }}>
            MiGaKu Labs builds small, sharp AI tools and ships them in the open. First off the bench:{" "}
            <strong>Prompt Forge</strong>, one dial that takes your prompt from a light polish to a full rebuild,
            across seven models.
          </p>
          <div className="hero-actions intro" style={{ ["--d" as string]: "640ms" }}>
            <Magnetic>
              <TLink href="/forge" className="btn btn-primary btn-lg" data-cursor="Open">
                Open Prompt Forge <span className="arrow">→</span>
              </TLink>
            </Magnetic>
            <Magnetic>
              <button type="button" className="btn btn-ghost btn-lg" onClick={() => scrollToTarget("#process")}>
                See it work <span className="arrow down">↓</span>
              </button>
            </Magnetic>
          </div>
        </div>

        <div className="hero-callout intro" style={{ ["--d" as string]: "900ms" }} aria-hidden="true">
          <span className="callout-line" />
          <span className="label strong">Specimen 01</span>
          <span className="label">Roughness {roughness}</span>
          <span className="label">26,000 particles · WebGL</span>
        </div>

        <div className="hero-dial intro" style={{ ["--d" as string]: "780ms", ["--v" as string]: `${polish * 100}%` }}>
          <span className="label strong">Raw</span>
          <div className="hero-dial-track" data-cursor="Drag">
            <div className="hero-dial-scale" aria-hidden="true" />
            <input
              type="range"
              min={0}
              max={1000}
              value={Math.round(polish * 1000)}
              onChange={(e) => onDial(Number(e.target.value) / 1000)}
              aria-label="Polish the specimen, from raw to polished"
              aria-valuetext={`Roughness ${roughness}`}
            />
          </div>
          <span className="label strong">Polished</span>
          <span className="label hero-dial-hint">← Drag to polish the specimen →</span>
        </div>
      </div>
    </section>
  );
}
