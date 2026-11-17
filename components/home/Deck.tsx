"use client";

import { useEffect, useState } from "react";

import { Spotlight } from "@/components/fx/Motion";
import { Reveal, Words } from "@/components/fx/Reveal";
import { TARGETS } from "@/lib/forge/templates";

const DIRECTIVES = ["Keep my casual voice.", "Don't add a persona.", "Make it work for Midjourney.", "Verify the API names first."];

function TargetsTile() {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (held || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % TARGETS.length), 1300);
    return () => window.clearInterval(id);
  }, [held]);

  const target = TARGETS[active];
  return (
    <article className="tile tile-targets" onPointerLeave={() => setHeld(false)}>
      <header>
        <span className="label">Targets</span>
        <span className="tile-num">{TARGETS.length}</span>
      </header>
      <div className="glyphs" role="list">
        {TARGETS.map((t, i) => (
          <button
            key={t.id}
            type="button"
            role="listitem"
            className="glyph-cell"
            data-active={i === active}
            aria-label={t.label}
            onPointerEnter={() => {
              setHeld(true);
              setActive(i);
            }}
            onFocus={() => {
              setHeld(true);
              setActive(i);
            }}
          >
            {t.glyph}
          </button>
        ))}
      </div>
      <footer>
        <h3>{target.label}</h3>
        <p>{target.description}</p>
      </footer>
    </article>
  );
}

function DirectivesTile() {
  const [text, setText] = useState("");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setText(DIRECTIVES[0]);
      return;
    }
    let line = 0;
    let char = 0;
    let hold = 0;
    const id = window.setInterval(() => {
      const full = DIRECTIVES[line];
      if (char < full.length) {
        char++;
        setText(full.slice(0, char));
      } else if (hold < 26) {
        hold++;
      } else {
        hold = 0;
        char = 0;
        line = (line + 1) % DIRECTIVES.length;
        setText("");
      }
    }, 55);
    return () => window.clearInterval(id);
  }, []);

  return (
    <article className="tile tile-directives">
      <header>
        <span className="label">Instructions for the AI</span>
      </header>
      <p className="typed mono" aria-hidden="true">
        <span className="prompt-mark">›</span> {text}
        <i className="caret" />
      </p>
      <footer>
        <h3>Steer the edit, separately.</h3>
        <p>Directions shape the result but are never copied into your prompt.</p>
      </footer>
    </article>
  );
}

export function Deck() {
  return (
    <section id="deck" className="section deck" aria-labelledby="deck-title">
      <div className="wrap">
        <header className="section-head">
          <div className="section-tag">
            <span className="label signal">03</span>
            <span className="label">On the deck</span>
          </div>
          <Words id="deck-title" className="display h-xl" text="Every control, exposed." accent={["exposed"]} />
        </header>

        <Reveal>
          <Spotlight className="bento">
            <TargetsTile />
            <DirectivesTile />

            <article className="tile tile-images">
              <header>
                <span className="label">Reference images</span>
              </header>
              <div className="frames" aria-hidden="true">
                <i style={{ ["--k" as string]: -1 }}>
                  <b>REF_01</b>
                </i>
                <i style={{ ["--k" as string]: 0 }}>
                  <b>REF_02</b>
                </i>
                <i style={{ ["--k" as string]: 1 }}>
                  <b>REF_03</b>
                </i>
              </div>
              <footer>
                <h3>Show it what you mean.</h3>
                <p>Drop, paste or attach up to three images for vision models.</p>
              </footer>
            </article>

            <article className="tile tile-search">
              <header>
                <span className="label">Web research</span>
                <span className="pill live">
                  <span className="led signal pulse" /> Live
                </span>
              </header>
              <ul className="sources" aria-hidden="true">
                <li style={{ ["--k" as string]: 0 }}>
                  <span className="mono">01</span> Official documentation
                </li>
                <li style={{ ["--k" as string]: 1 }}>
                  <span className="mono">02</span> Release notes, this month
                </li>
                <li style={{ ["--k" as string]: 2 }}>
                  <span className="mono">03</span> Field guide and examples
                </li>
              </ul>
              <footer>
                <h3>Facts checked before it writes.</h3>
                <p>The model can search the live web. Sources come back with the prompt.</p>
              </footer>
            </article>

            <article className="tile tile-diff">
              <header>
                <span className="label">Change view</span>
              </header>
              <p className="diff-line mono" aria-hidden="true">
                Write a <del>good</del> <ins>warm, confident</ins> cover letter for a barista <del>job</del>{" "}
                <ins>position</ins>.
              </p>
              <footer>
                <h3>See every word it touched.</h3>
                <p>A word-level diff against your original, with how much of your wording survived.</p>
              </footer>
            </article>

            <article className="tile tile-keys">
              <header>
                <span className="label">Security</span>
              </header>
              <div className="wire" aria-hidden="true">
                <span>Browser</span>
                <i className="wire-line">
                  <b />
                </i>
                <span>Lab server</span>
                <i className="wire-line is-locked">
                  <b />
                </i>
                <span>Model</span>
              </div>
              <footer>
                <h3>
                  <span className="tile-zero">00</span> keys in your browser.
                </h3>
                <p>Every call runs server-side. Visitors get the tools, never the credentials.</p>
              </footer>
            </article>
          </Spotlight>
        </Reveal>
      </div>
    </section>
  );
}
