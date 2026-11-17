import { ScenePreset } from "@/components/fx/ScenePreset";
import { TLink } from "@/components/fx/Transition";
import { SHAPE } from "@/lib/fx/scene";

export default function NotFound() {
  return (
    <div className="wrap not-found">
      {/* A specimen that never came together. */}
      <ScenePreset shape={SHAPE.GEM} x={0} y={0} scale={1.1} alpha={0.55} chaos={1} spin={0.1} />
      <span className="code" aria-hidden="true">
        404
      </span>
      <span className="label">Specimen not found</span>
      <p className="dim" style={{ maxWidth: "40ch" }}>
        Nothing is catalogued at this address. It may have moved, or it hasn&apos;t left the bench yet.
      </p>
      <div className="row-actions" style={{ justifyContent: "center" }}>
        <TLink href="/" className="btn btn-ghost">
          Lab index
        </TLink>
        <TLink href="/forge" className="btn btn-primary">
          Open Prompt Forge <span className="arrow">→</span>
        </TLink>
      </div>
    </div>
  );
}
