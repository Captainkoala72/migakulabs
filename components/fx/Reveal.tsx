"use client";

import { createElement, useEffect, useRef, type CSSProperties, type ReactNode } from "react";

import { whenReady } from "@/lib/fx/ready";

/** Marks an element as in view (once), after the boot sequence has finished. */
function useInView<T extends HTMLElement>(margin = "0px 0px -12% 0px") {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let offReady = () => {};
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          offReady = whenReady(() => (el.dataset.in = "true"));
        }
      },
      { rootMargin: margin, threshold: 0.05 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      offReady();
    };
  }, [margin]);
  return ref;
}

interface RevealProps {
  as?: string;
  className?: string;
  delay?: number;
  children: ReactNode;
  style?: CSSProperties;
  id?: string;
}

/** Fades and lifts its content into place the first time it scrolls into view. */
export function Reveal({ as = "div", className = "", delay = 0, children, style, id }: RevealProps) {
  const ref = useInView<HTMLElement>();
  return createElement(
    as,
    { ref, id, className: `reveal ${className}`, style: { ...style, ["--d" as string]: `${delay}ms` } },
    children
  );
}

interface WordsProps {
  as?: string;
  className?: string;
  text: string;
  /** Words to render in the signal color. */
  accent?: string[];
  delay?: number;
  id?: string;
}

/** Splits a heading into words that rise out of a mask, one after another. */
export function Words({ as = "h2", className = "", text, accent = [], delay = 0, id }: WordsProps) {
  const ref = useInView<HTMLElement>();
  const words = text.split(" ");
  return createElement(
    as,
    { ref, id, className: `words ${className}`, "aria-label": text, style: { ["--d" as string]: `${delay}ms` } },
    words.flatMap((word, i) => [
      <span className="w" key={i} aria-hidden="true">
        <span
          className={`wi ${accent.includes(word.replace(/[.,!?]/g, "")) ? "is-accent" : ""}`}
          style={{ ["--i" as string]: i }}
        >
          {word}
        </span>
      </span>,
      i < words.length - 1 ? " " : null,
    ])
  );
}
