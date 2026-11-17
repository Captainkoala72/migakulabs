"use client";

import { Tilt } from "@/components/fx/Motion";
import { TLink } from "@/components/fx/Transition";
import { STATUS_LABEL, type Experiment } from "@/lib/experiments";

/** Each experiment gets a small living illustration of what it does. */
function Vis({ slug }: { slug: string }) {
  if (slug === "prompt-forge") {
    return (
      <div className="vis vis-forge" aria-hidden="true">
        <div className="vis-lines">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="vis-dial">
          <b />
        </div>
      </div>
    );
  }
  if (slug === "music-maker") {
    return (
      <div className="vis vis-music" aria-hidden="true">
        {Array.from({ length: 28 }, (_, i) => (
          <i key={i} style={{ ["--k" as string]: i }} />
        ))}
      </div>
    );
  }
  if (slug === "mini-games") {
    return (
      <div className="vis vis-game" aria-hidden="true">
        <i className="paddle left" />
        <i className="paddle right" />
        <i className="net" />
        <b className="ball" />
        <span className="score mono">04 : 03</span>
      </div>
    );
  }
  return (
    <div className="vis vis-kit" aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <i key={i} style={{ ["--k" as string]: i }} />
      ))}
    </div>
  );
}

export function SpecimenCard({ experiment }: { experiment: Experiment }) {
  const live = experiment.status === "live";
  return (
    <Tilt className={`spec ${live ? "is-live" : ""}`} max={5} cursor={live ? "Open" : "Specs"}>
      <article className="spec-in">
        <header className="spec-top">
          <span className="label strong">{experiment.code}</span>
          <span className={`pill ${live ? "live" : ""}`}>
            <span className={`led ${live ? "signal pulse" : experiment.status === "next" ? "warn" : "off"}`} aria-hidden="true" />
            {STATUS_LABEL[experiment.status]}
          </span>
        </header>
        <span className="spec-numeral" aria-hidden="true">
          {experiment.code.replace("EXP-", "")}
        </span>
        <Vis slug={experiment.slug} />
        <div className="spec-body">
          <h3>{experiment.name}</h3>
          <p>{experiment.summary}</p>
        </div>
        <footer className="spec-foot">
          <span className="label">{experiment.tags.join(" · ")}</span>
          <TLink href={experiment.href} className="spec-link stretched">
            {live ? "Open" : "Spec sheet"} <span className="arrow">→</span>
          </TLink>
        </footer>
      </article>
    </Tilt>
  );
}

export function OpenSlot({ code }: { code: string }) {
  return (
    <div className="spec is-slot">
      <article className="spec-in">
        <header className="spec-top">
          <span className="label">{code}</span>
          <span className="pill">Open slot</span>
        </header>
        <span className="slot-plus" aria-hidden="true">
          +
        </span>
        <div className="spec-body">
          <h3>Reserved</h3>
          <p>For the next idea that earns a place on the bench.</p>
        </div>
      </article>
    </div>
  );
}
