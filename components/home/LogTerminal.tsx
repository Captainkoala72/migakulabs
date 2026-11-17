"use client";

import { useEffect, useRef, useState } from "react";

import { Words } from "@/components/fx/Reveal";
import { LAB_LOG } from "@/lib/log";
import { whenReady } from "@/lib/fx/ready";

const LINES = LAB_LOG.map((e) => ({
  head: `[${e.date}] ${e.code.padEnd(7, " ")} ▸ ${e.title}`,
  body: e.body,
}));

/** The lab log, typed out like a terminal session when it scrolls into view. */
export function LogTerminal() {
  const ref = useRef<HTMLDivElement>(null);
  const [typed, setTyped] = useState(0);
  const total = LINES.reduce((sum, l) => sum + l.head.length + l.body.length, 0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(total);
      return;
    }
    let timer = 0;
    let offReady = () => {};
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        offReady = whenReady(() => {
          timer = window.setInterval(() => {
            setTyped((n) => {
              if (n >= total) {
                window.clearInterval(timer);
                return total;
              }
              return n + 5;
            });
          }, 18);
        });
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      offReady();
      window.clearInterval(timer);
    };
  }, [total]);

  let budget = typed;
  const take = (text: string) => {
    const out = text.slice(0, Math.max(0, budget));
    budget -= text.length;
    return out;
  };

  return (
    <section id="log" className="section logsec" aria-labelledby="log-title">
      <div className="wrap log-grid">
        <header>
          <div className="section-tag">
            <span className="label signal">06</span>
            <span className="label">Lab log</span>
          </div>
          <Words id="log-title" className="display h-xl" text="What shipped, and when." accent={["shipped"]} />
        </header>
        <div className="panel ticks terminal" ref={ref}>
          <div className="panel-head">
            <span className="term-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="label">migaku-labs — lab.log</span>
            <span className="label">tail -f</span>
          </div>
          <div className="term-body mono">
            <p className="term-cmd">
              <span className="prompt-mark">$</span> cat lab.log
            </p>
            {LINES.map((line) => {
              const head = take(line.head);
              const body = take(line.body);
              if (!head) return null;
              return (
                <div className="term-entry" key={line.head}>
                  <p className="term-head">{head}</p>
                  {body && <p className="term-text">{body}</p>}
                </div>
              );
            })}
            <p className="term-cmd">
              <span className="prompt-mark">$</span> <i className="caret" />
            </p>
          </div>
          <ol className="sr-only">
            {LAB_LOG.map((e) => (
              <li key={e.title}>
                {e.date}: {e.title}. {e.body}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
