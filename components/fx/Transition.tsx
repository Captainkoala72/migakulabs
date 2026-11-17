"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react";

import { sfx } from "@/lib/fx/sfx";

/**
 * Route transitions: a five-blade shutter closes, the route changes behind
 * it, and the shutter opens on the new page.
 */

type Phase = "idle" | "closing" | "closed" | "opening";

const LABELS: Record<string, string> = {
  "/": "Index",
  "/forge": "Prompt Forge",
  "/lab": "The Lab",
  "/about": "About",
};

const CLOSE_MS = 520;
const OPEN_MS = 700;

const Ctx = createContext<(href: string) => void>(() => {});

export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [label, setLabel] = useState("");
  const phaseRef = useRef<Phase>("idle");
  const timers = useRef<number[]>([]);
  const from = useRef(pathname);

  const set = (next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  };

  const open = useCallback(() => {
    if (phaseRef.current !== "closed" && phaseRef.current !== "closing") return;
    set("opening");
    timers.current.push(window.setTimeout(() => set("idle"), OPEN_MS));
  }, []);

  const navigate = useCallback(
    (href: string) => {
      const target = href.split("#")[0] || "/";
      if (phaseRef.current !== "idle") return;
      if (target === pathname) {
        router.push(href);
        return;
      }
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(href);
        return;
      }
      from.current = pathname;
      setLabel(LABELS[target] ?? (target.startsWith("/lab/") ? "Spec sheet" : "MiGaKu Labs"));
      set("closing");
      sfx.tick();
      timers.current.push(
        window.setTimeout(() => {
          set("closed");
          router.push(href);
          // If the route never resolves, don't leave the visitor behind a closed shutter.
          timers.current.push(window.setTimeout(open, 5000));
        }, CLOSE_MS)
      );
    },
    [pathname, router, open]
  );

  // The new page has rendered: open up.
  useEffect(() => {
    if (pathname !== from.current && phaseRef.current !== "idle") {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
      const id = window.setTimeout(open, phaseRef.current === "closing" ? CLOSE_MS : 90);
      timers.current.push(id);
    }
    from.current = pathname;
  }, [pathname, open]);

  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  return (
    <Ctx.Provider value={navigate}>
      {children}
      <div className="shutter" data-phase={phase} aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <i key={i} style={{ ["--i" as string]: i }} />
        ))}
        <span className="shutter-label">
          <span className="label signal">→</span> {label}
        </span>
      </div>
    </Ctx.Provider>
  );
}

interface TLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

/** Internal link that plays the shutter transition. */
export function TLink({ href, onClick, onPointerEnter, children, ...rest }: TLinkProps) {
  const navigate = useContext(Ctx);
  const router = useRouter();
  return (
    <a
      href={href}
      {...rest}
      onPointerEnter={(e) => {
        onPointerEnter?.(e);
        router.prefetch(href);
      }}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}
