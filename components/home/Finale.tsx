"use client";

import { Magnetic } from "@/components/fx/Motion";
import { Reveal, Words } from "@/components/fx/Reveal";
import { TLink } from "@/components/fx/Transition";

/** Closing scene: the particles assemble into the wordmark above the call to action. */
export function Finale() {
  return (
    <section id="finale" className="finale" aria-labelledby="finale-title">
      <div className="finale-word" aria-hidden="true" />
      <div className="wrap finale-inner">
        <span className="label">End of index · the bench is open</span>
        <Words id="finale-title" className="display h-2xl" text="Bring a rough idea." accent={["rough"]} />
        <Reveal delay={200} className="finale-actions">
          <Magnetic strength={0.4}>
            <TLink href="/forge" className="orb" data-cursor="Forge">
              <span>
                Open the
                <br />
                Forge
              </span>
              <span className="arrow">→</span>
            </TLink>
          </Magnetic>
          <div className="finale-links">
            <TLink href="/lab" className="link-line">
              Browse the lab
            </TLink>
            <TLink href="/about" className="link-line">
              About the lab
            </TLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
