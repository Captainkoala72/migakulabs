import { TAU } from "./math";

/**
 * Point-cloud targets for the WebGL specimen. Every shape is a Float32Array
 * of N xyz positions; particle i in one shape morphs to particle i in the next.
 */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type V3 = [number, number, number];

function rotate(p: V3, rx: number, ry: number, rz: number): V3 {
  let [x, y, z] = p;
  let c = Math.cos(rx);
  let s = Math.sin(rx);
  [y, z] = [y * c - z * s, y * s + z * c];
  c = Math.cos(ry);
  s = Math.sin(ry);
  [x, z] = [x * c + z * s, -x * s + z * c];
  c = Math.cos(rz);
  s = Math.sin(rz);
  [x, y] = [x * c - y * s, x * s + y * c];
  return [x, y, z];
}

/** A cut gem: an icosahedron drawn by its edges, with a faint surface and an inner core. */
export function gem(n: number, radius = 1.3): Float32Array {
  const rand = mulberry32(11);
  const t = (1 + Math.sqrt(5)) / 2;
  const raw: V3[] = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ];
  const len = Math.hypot(1, t);
  const verts = raw.map(([x, y, z]) => [(x / len) * radius, (y / len) * radius, (z / len) * radius] as V3);
  const faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];
  const edgeSet = new Map<string, [number, number]>();
  for (const [a, b, c] of faces) {
    for (const [i, j] of [[a, b], [b, c], [c, a]] as const) {
      edgeSet.set(i < j ? `${i}-${j}` : `${j}-${i}`, [i, j]);
    }
  }
  const edges = [...edgeSet.values()];
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = rand();
    let p: V3;
    if (r < 0.5) {
      const [a, b] = edges[Math.floor(rand() * edges.length)];
      const k = rand();
      p = [0, 1, 2].map((d) => verts[a][d] + (verts[b][d] - verts[a][d]) * k) as V3;
    } else if (r < 0.8) {
      const [a, b, c] = faces[Math.floor(rand() * faces.length)];
      let u = rand();
      let v = rand();
      if (u + v > 1) {
        u = 1 - u;
        v = 1 - v;
      }
      p = [0, 1, 2].map((d) => verts[a][d] + (verts[b][d] - verts[a][d]) * u + (verts[c][d] - verts[a][d]) * v) as V3;
    } else {
      const [a, b] = edges[Math.floor(rand() * edges.length)];
      const k = rand();
      const q = [0, 1, 2].map((d) => (verts[a][d] + (verts[b][d] - verts[a][d]) * k) * 0.4) as V3;
      p = rotate(q, 0.6, 0.9, 0.2);
    }
    const j = 0.006;
    out[i * 3] = p[0] + (rand() - 0.5) * j;
    out[i * 3 + 1] = p[1] + (rand() - 0.5) * j;
    out[i * 3 + 2] = p[2] + (rand() - 0.5) * j;
  }
  return out;
}

/** A gauge: outer ring, graduated ticks, sweep arc, needle and hub. */
export function ring(n: number): Float32Array {
  const rand = mulberry32(23);
  const out = new Float32Array(n * 3);
  const needle = -0.9;
  for (let i = 0; i < n; i++) {
    const r = rand();
    let x = 0;
    let y = 0;
    let z = (rand() - 0.5) * 0.02;
    if (r < 0.3) {
      const a = rand() * TAU;
      const rr = 1.32 + (rand() - 0.5) * 0.012;
      x = Math.cos(a) * rr;
      y = Math.sin(a) * rr;
    } else if (r < 0.58) {
      const tick = Math.floor(rand() * 72);
      const a = (tick / 72) * TAU;
      const long = tick % 6 === 0;
      const rr = 1.4 + rand() * (long ? 0.24 : 0.11);
      x = Math.cos(a) * rr;
      y = Math.sin(a) * rr;
    } else if (r < 0.74) {
      const a = Math.PI * 0.75 + rand() * Math.PI * 1.5;
      const rr = 1.08 + (rand() - 0.5) * 0.05;
      x = Math.cos(a) * rr;
      y = Math.sin(a) * rr;
    } else if (r < 0.86) {
      const k = rand();
      x = Math.cos(needle) * 1.22 * k + (rand() - 0.5) * 0.012;
      y = Math.sin(needle) * 1.22 * k + (rand() - 0.5) * 0.012;
      z += 0.05;
    } else if (r < 0.92) {
      const a = rand() * TAU;
      const rr = Math.sqrt(rand()) * 0.11;
      x = Math.cos(a) * rr;
      y = Math.sin(a) * rr;
      z += 0.06;
    } else {
      const a = rand() * TAU;
      const rr = 0.55 + (rand() - 0.5) * 0.01;
      x = Math.cos(a) * rr;
      y = Math.sin(a) * rr;
    }
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
  return out;
}

/** Seven orbits around a dense core: one ring per model in the Forge. */
export function orbits(n: number, count = 7): Float32Array {
  const rand = mulberry32(37);
  const out = new Float32Array(n * 3);
  const rings = Array.from({ length: count }, (_, k) => ({
    radius: 0.72 + k * 0.14,
    rx: 0.5 + k * 0.83,
    ry: k * 1.37,
    rz: k * 0.61,
    node: rand() * TAU,
  }));
  for (let i = 0; i < n; i++) {
    const r = rand();
    let p: V3;
    if (r < 0.14) {
      const u = rand() * 2 - 1;
      const a = rand() * TAU;
      const rr = 0.27 * Math.cbrt(rand());
      const s = Math.sqrt(1 - u * u);
      p = [Math.cos(a) * s * rr, u * rr, Math.sin(a) * s * rr];
    } else {
      const ringDef = rings[Math.floor(rand() * count)];
      const isNode = rand() < 0.09;
      const a = isNode ? ringDef.node + (rand() - 0.5) * 0.07 : rand() * TAU;
      const rr = ringDef.radius + (rand() - 0.5) * (isNode ? 0.07 : 0.008);
      p = rotate([Math.cos(a) * rr, (rand() - 0.5) * (isNode ? 0.07 : 0.006), Math.sin(a) * rr], ringDef.rx, ringDef.ry, ringDef.rz);
    }
    out[i * 3] = p[0];
    out[i * 3 + 1] = p[1];
    out[i * 3 + 2] = p[2];
  }
  return out;
}

/** A flat lattice; the vertex shader makes it roll like a surface. */
export function wave(n: number): Float32Array {
  const out = new Float32Array(n * 3);
  const side = Math.floor(Math.sqrt(n));
  const span = 5.2;
  const rand = mulberry32(53);
  for (let i = 0; i < n; i++) {
    if (i < side * side) {
      const gx = i % side;
      const gz = Math.floor(i / side);
      out[i * 3] = (gx / (side - 1) - 0.5) * span * 1.5;
      out[i * 3 + 1] = 0;
      out[i * 3 + 2] = (gz / (side - 1) - 0.5) * span;
    } else {
      out[i * 3] = (rand() - 0.5) * span * 1.5;
      out[i * 3 + 1] = rand() * 1.2;
      out[i * 3 + 2] = (rand() - 0.5) * span;
    }
  }
  return out;
}

export const TEXT_WIDTH = 4.5;

/** Samples rendered text into points. Call after web fonts have loaded. */
export function text(n: number, value: string, fontFamily: string): Float32Array | null {
  const canvas = document.createElement("canvas");
  const W = 1500;
  const H = 400;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  let size = 300;
  const setFont = () => (ctx.font = `800 ${size}px ${fontFamily}`);
  setFont();
  const measured = ctx.measureText(value).width;
  if (measured > W * 0.94) {
    size = Math.floor((size * W * 0.94) / measured);
    setFont();
  }
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(value, W / 2, H / 2 + size * 0.04);
  const data = ctx.getImageData(0, 0, W, H).data;
  const pixels: number[] = [];
  let minX = W;
  let maxX = 0;
  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < W; x += 2) {
      if (data[(y * W + x) * 4 + 3] > 140) {
        pixels.push(x, y);
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
  }
  if (pixels.length < 200) return null;
  const rand = mulberry32(71);
  const out = new Float32Array(n * 3);
  const count = pixels.length / 2;
  const widthPx = Math.max(1, maxX - minX);
  const centerX = (minX + maxX) / 2;
  const unit = TEXT_WIDTH / widthPx;
  for (let i = 0; i < n; i++) {
    if (rand() < 0.94) {
      const k = Math.floor(rand() * count) * 2;
      out[i * 3] = (pixels[k] + rand() * 2 - centerX) * unit;
      out[i * 3 + 1] = -(pixels[k + 1] + rand() * 2 - H / 2) * unit;
      out[i * 3 + 2] = (rand() - 0.5) * 0.07;
    } else {
      out[i * 3] = (rand() - 0.5) * TEXT_WIDTH * 1.25;
      out[i * 3 + 1] = (rand() - 0.5) * 1.6;
      out[i * 3 + 2] = (rand() - 0.5) * 1.4;
    }
  }
  return out;
}

/** Per-particle random seeds (stagger, size, color, phase). */
export function seeds(n: number): Float32Array {
  const rand = mulberry32(97);
  const out = new Float32Array(n * 4);
  for (let i = 0; i < out.length; i++) out[i] = rand();
  return out;
}
