"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { whenReady } from "@/lib/fx/ready";

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&/<>[]=+*";

interface Props {
  text: string;
  className?: string;
  /** "in" decodes when scrolled into view, "hover" on pointer enter, "change" whenever text changes. */
  on?: "in" | "hover" | "change";
  speed?: number;
}

/** Text that decodes from random glyphs into its final value. */
export function Scramble({ text, className, on = "in", speed = 1 }: Props) {
  const [display, setDisplay] = useState(text);
  const ref = useRef<HTMLSpanElement>(null);
  const timer = useRef(0);

  const play = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(text);
      return;
    }
    window.clearInterval(timer.current);
    let frame = 0;
    const total = Math.max(8, Math.round((text.length * 1.4 + 6) / speed));
    timer.current = window.setInterval(() => {
      frame++;
      const revealed = Math.floor((frame / total) * text.length);
      let out = text.slice(0, revealed);
      for (let i = revealed; i < text.length; i++) {
        const ch = text[i];
        out += ch === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      setDisplay(out);
      if (frame >= total) {
        window.clearInterval(timer.current);
        setDisplay(text);
      }
    }, 30);
  }, [text, speed]);

  useEffect(() => {
    if (on === "change") {
      play();
      return () => window.clearInterval(timer.current);
    }
    setDisplay(text);
    if (on !== "in") return;
    const el = ref.current;
    if (!el) return;
    let offReady = () => {};
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        offReady = whenReady(play);
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      offReady();
      window.clearInterval(timer.current);
    };
  }, [on, play, text]);

  return (
    <span
      ref={ref}
      className={className}
      aria-label={text}
      onPointerEnter={on === "hover" ? play : undefined}
    >
      <span aria-hidden="true">{display}</span>
    </span>
  );
}
