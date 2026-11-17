import { Reveal, Words } from "@/components/fx/Reveal";

const PRINCIPLES = [
  {
    title: "Keys never touch the browser.",
    body: "Every model call runs on the server. Visitors get the tools, not the credentials, and usage is metered so the lab stays open.",
    tag: "Security",
  },
  {
    title: "Tools, not demos.",
    body: "An instrument only goes live once it is genuinely useful, with real error states, honest limits and a reason to come back.",
    tag: "Quality",
  },
  {
    title: "Model-agnostic by design.",
    body: "Providers change monthly. Models are swapped in a single file, so every tool outlives any one API.",
    tag: "Architecture",
  },
  {
    title: "Readouts over hype.",
    body: "Word counts, change views and live status lights. You can see what each instrument did, and why.",
    tag: "Transparency",
  },
];

/** Principles as cards that stack on top of each other as you scroll. */
export function Method() {
  return (
    <section id="method" className="section method" aria-labelledby="method-title">
      <div className="wrap method-grid">
        <header className="method-head">
          <div className="section-tag">
            <span className="label signal">05</span>
            <span className="label">Method</span>
          </div>
          <Words id="method-title" className="display h-xl" text="How the lab builds." accent={["builds"]} />
          <Reveal delay={120}>
            <p className="section-lede">Four rules every instrument has to pass before it gets a green light.</p>
          </Reveal>
        </header>
        <ol className="stack">
          {PRINCIPLES.map((p, i) => (
            <li key={p.title} className="stack-card" style={{ ["--i" as string]: i }}>
              <div className="stack-top">
                <span className="label strong">P-{String(i + 1).padStart(2, "0")}</span>
                <span className="label">{p.tag}</span>
              </div>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
              <span className="stack-numeral" aria-hidden="true">
                {i + 1}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
