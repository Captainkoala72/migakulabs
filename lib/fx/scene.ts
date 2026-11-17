/**
 * Shared state for the WebGL specimen. Pages and components write targets
 * here; components/fx/Scene.tsx reads them every frame and eases toward them.
 */

export const SHAPE = { GEM: 0, RING: 1, ORBITS: 2, WAVE: 3, TEXT: 4 } as const;
export type ShapeId = (typeof SHAPE)[keyof typeof SHAPE];

export interface SceneTarget {
  /** Morph pair and blend between them. */
  from: ShapeId;
  to: ShapeId;
  mix: number;
  /** Bumped whenever the pair changes; `snap` is where mix starts for the new pair. */
  version: number;
  snap: number;
  /** How quickly the rendered mix chases the target (per second). */
  rate: number;
  /** Placement in viewport units (-1..1) and model scale. */
  x: number;
  y: number;
  scale: number;
  alpha: number;
  /** 0 = crisp and polished, 1 = raw and turbulent. */
  chaos: number;
  /** Extra agitation and signal color, used while the Forge is running. */
  energy: number;
  /**
   * Rotation: yaw speed, static tilt and roll speed. `face` (0..1) turns the
   * yaw back to the camera; `level` (0..1) straightens the roll.
   */
  spin: number;
  tilt: number;
  roll: number;
  face: number;
  level: number;
}

export const sceneTarget: SceneTarget = {
  from: SHAPE.GEM,
  to: SHAPE.GEM,
  mix: 0,
  version: 0,
  snap: 0,
  rate: 12,
  x: 0.5,
  y: 0,
  scale: 1,
  alpha: 0,
  chaos: 0.8,
  energy: 0,
  spin: 0.14,
  tilt: 0.3,
  roll: 0,
  face: 0,
  level: 1,
};

/** One-shot flash consumed by the renderer (e.g. when a run completes). */
export const scenePulse = { value: 0 };

/** The hero's "drag to polish" value, 0 (raw) to 1 (polished). */
export const heroDial = { polish: 0.1 };

type Placement = Partial<Omit<SceneTarget, "from" | "to" | "mix" | "version" | "snap" | "rate">>;

export function setScene(patch: Placement) {
  Object.assign(sceneTarget, patch);
}

/** Scroll-driven: set the exact pair and blend for this frame. */
export function setPair(from: ShapeId, to: ShapeId, mix: number) {
  if (sceneTarget.from !== from || sceneTarget.to !== to) {
    sceneTarget.from = from;
    sceneTarget.to = to;
    sceneTarget.snap = mix;
    sceneTarget.version++;
  }
  sceneTarget.mix = mix;
  sceneTarget.rate = 14;
}

/** Programmatic: animate from whatever is showing into `shape`. */
export function morphTo(shape: ShapeId) {
  const showing = sceneTarget.mix > 0.5 ? sceneTarget.to : sceneTarget.from;
  if (showing === shape) {
    setPair(shape, shape, 0);
    return;
  }
  sceneTarget.from = showing;
  sceneTarget.to = shape;
  sceneTarget.snap = 0;
  sceneTarget.mix = 1;
  sceneTarget.rate = 2.4;
  sceneTarget.version++;
}

export function pulseScene(amount = 1) {
  scenePulse.value = Math.max(scenePulse.value, amount);
}
