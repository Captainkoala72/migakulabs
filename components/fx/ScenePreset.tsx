"use client";

import { useEffect } from "react";

import { clamp } from "@/lib/fx/math";
import { isReady } from "@/lib/fx/ready";
import { morphTo, setScene, type SceneTarget, type ShapeId } from "@/lib/fx/scene";
import { onTick, scroll, view } from "@/lib/fx/ticker";

type Pose = Partial<Pick<SceneTarget, "x" | "y" | "scale" | "alpha" | "chaos" | "spin" | "tilt" | "roll" | "face" | "level">>;

interface Props extends Pose {
  shape: ShapeId;
  /** Overrides applied below 860px. */
  mobile?: Pose;
}

/** Gives a page a fixed specimen pose that drifts up and fades as you scroll. */
export function ScenePreset({ shape, mobile, ...pose }: Props) {
  useEffect(() => {
    morphTo(shape);
    const off = onTick(() => {
      const p = { x: 0.5, y: 0, scale: 1, alpha: 1, chaos: 0, spin: 0.14, tilt: 0.3, roll: 0, face: 0, level: 1, ...pose };
      if (view.mobile && mobile) Object.assign(p, mobile);
      const depth = scroll.y / Math.max(1, view.h);
      p.y += depth * 0.7;
      p.alpha *= 1 - clamp(depth / 1.2) * 0.85;
      if (!isReady()) p.alpha = 0;
      setScene({ ...p, energy: 0 });
    });
    return off;
    // The pose is a static page setting.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shape]);

  return null;
}
