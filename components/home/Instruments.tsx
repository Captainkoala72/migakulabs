"use client";

import { useEffect } from "react";

import { Marquee } from "@/components/fx/Motion";
import { Reveal, Words } from "@/components/fx/Reveal";
import { MODELS, PROVIDERS, providerLabel } from "@/lib/forge/catalog";
import { INTENSITY } from "@/lib/forge/intensity";
import { TARGETS } from "@/lib/forge/templates";
import { setScene } from "@/lib/fx/scene";
import { sfx } from "@/lib/fx/sfx";
import { useLabStatus } from "@/lib/useLabStatus";

/** The model roster. Hovering a row agitates the orbit specimen beside it. */
export function Instruments() {
  const { status } = useLabStatus();

  useEffect(() => () => setScene({ energy: 0 }), []);

  return (
    <section id="models" className="section instruments" aria-labelledby="models-title">
      <div className="wrap inst-grid">
        <div className="inst-copy">
          <div className="section-tag">
            <span className="label signal">02</span>
            <span className="label">Instruments</span>
          </div>
          <Words
            id="models-title"
            className="display h-xl"
            text="Seven models. Five providers. One switch."
            accent={["switch"]}
          />
          <Reveal delay={120}>
            <p className="section-lede">
              Providers change monthly. The Forge treats models as swappable instruments, each with its own reasoning
              levels and live web research, so the tool outlives any single API.
            </p>
          </Reveal>
        </div>

        <Reveal as="ol" className="inst-list" delay={160}>
          {MODELS.map((m, i) => {
            const ready = status?.models[m.key]?.ready;
            return (
              <li
                key={m.key}
                onPointerEnter={() => {
                  setScene({ energy: 0.75 });
                  sfx.hover();
                }}
                onPointerLeave={() => setScene({ energy: 0 })}
              >
                <span className="label num">{String(i + 1).padStart(2, "0")}</span>
                <span className="inst-name">{m.label}</span>
                <span className="label inst-prov">{providerLabel(m.provider)}</span>
                <span className="label inst-caps">
                  {m.vision ? "Text + images" : "Text"} · {m.efforts.length} effort levels
                </span>
                <span className={`led ${status ? (ready ? "ok" : "off") : "off"}`} title={ready ? "Online" : "Offline"} />
              </li>
            );
          })}
        </Reveal>
      </div>

      <div className="bands">
        <Marquee speed={70}>
          {INTENSITY.map((s) => (
            <span className="band-word" key={s.name}>
              {s.name}
              <i className="band-dot" />
            </span>
          ))}
        </Marquee>
        <Marquee speed={46} reverse className="is-outline">
          {TARGETS.slice(1, 11).map((t) => (
            <span className="band-word" key={t.id}>
              {t.label}
              <i className="band-dot" />
            </span>
          ))}
        </Marquee>
      </div>
      <p className="sr-only">
        {MODELS.length} models from {PROVIDERS.length} providers, {TARGETS.length} task targets and {INTENSITY.length} intensity
        stops.
      </p>
    </section>
  );
}
