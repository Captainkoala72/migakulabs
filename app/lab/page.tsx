import type { Metadata } from "next";

import { Reveal, Words } from "@/components/fx/Reveal";
import { ScenePreset } from "@/components/fx/ScenePreset";
import { OpenSlot, SpecimenCard } from "@/components/lab/SpecimenCard";
import { EXPERIMENTS } from "@/lib/experiments";
import { SHAPE } from "@/lib/fx/scene";

export const metadata: Metadata = {
  title: "The Lab",
  description: "Every MiGaKu Labs experiment: what is live, what is next on the bench, and what is planned.",
};

export default function LabPage() {
  const live = EXPERIMENTS.filter((e) => e.status === "live").length;
  const nextCode = `EXP-${String(EXPERIMENTS.length + 1).padStart(3, "0")}`;
  return (
    <div className="wrap">
      <ScenePreset
        shape={SHAPE.ORBITS}
        x={0.5}
        y={0.12}
        scale={1}
        alpha={0.95}
        spin={0.2}
        tilt={0.45}
        mobile={{ x: 0.3, y: 0.3, scale: 0.6, alpha: 0.4 }}
      />
      <header className="page-head">
        <div className="crumbs intro">
          <span className="label">Index</span>
          <span className="label">/</span>
          <span className="label strong">The lab</span>
          <span className="pill">
            <span className="led ok" aria-hidden="true" /> {live} live · {EXPERIMENTS.length - live} on the bench
          </span>
        </div>
        <Words as="h1" className="display" text="Experiments, live and on the bench." accent={["live"]} />
        <p className="lede intro" style={{ ["--d" as string]: "420ms" }}>
          Each one starts as a spec sheet, gets built and tested here, and only gets a green light when it is
          genuinely useful.
        </p>
      </header>

      <Reveal className="lab-grid">
        {EXPERIMENTS.map((e) => (
          <SpecimenCard key={e.slug} experiment={e} />
        ))}
        <OpenSlot code={nextCode} />
      </Reveal>
    </div>
  );
}
