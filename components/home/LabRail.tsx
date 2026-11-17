"use client";

import { Pin } from "@/components/fx/Motion";
import { Words } from "@/components/fx/Reveal";
import { OpenSlot, SpecimenCard } from "@/components/lab/SpecimenCard";
import { EXPERIMENTS } from "@/lib/experiments";

/** The lab as a horizontal gallery: vertical scroll slides the specimens sideways. */
export function LabRail() {
  const next = `EXP-${String(EXPERIMENTS.length + 1).padStart(3, "0")}`;
  return (
    <Pin id="lab" length={360} className="labrail" label="The lab">
      <div className="labrail-track">
        <header className="labrail-intro">
          <div className="section-tag">
            <span className="label signal">04</span>
            <span className="label">The lab</span>
          </div>
          <Words className="display h-xl" text="One live instrument. More on the bench." accent={["live"]} />
          <p className="section-lede">
            Every tool gets an experiment code, a spec sheet and a status light. Keep scrolling to walk the bench.
          </p>
          <span className="label labrail-hint">
            Scroll <span className="arrow-loop">→</span>
          </span>
        </header>
        {EXPERIMENTS.map((e) => (
          <SpecimenCard key={e.slug} experiment={e} />
        ))}
        <OpenSlot code={next} />
      </div>
      <div className="labrail-progress" aria-hidden="true">
        <i />
      </div>
    </Pin>
  );
}
