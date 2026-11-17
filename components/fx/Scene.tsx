"use client";

import { useEffect, useRef } from "react";

import { TAU, damp } from "@/lib/fx/math";
import { SHAPE, scenePulse, sceneTarget } from "@/lib/fx/scene";
import { gem, orbits, ring, seeds, text, wave } from "@/lib/fx/shapes";
import { onTick, pointer, view } from "@/lib/fx/ticker";

/**
 * The specimen: one fixed WebGL canvas behind the whole site. ~26k points are
 * morphed between shapes entirely in the vertex shader; JavaScript only
 * uploads two position buffers when the morph pair changes.
 */

const VERT = /* glsl */ `
precision highp float;
attribute vec3 aA;
attribute vec3 aB;
attribute vec4 aRand;
uniform mat4 uProj;
uniform mat3 uRot;
uniform vec3 uCenter;
uniform vec2 uMouse;
uniform float uScale, uMix, uTime, uChaos, uEnergy, uWaveA, uWaveB, uSize, uAlpha, uMouseF, uPulse;
varying float vAlpha;
varying float vSignal;
const float PI = 3.14159265;

vec3 flow(vec3 p, float t) {
  return vec3(
    sin(p.y * 1.7 + t * 0.9 + aRand.w * 6.283) + sin(p.z * 2.3 - t * 0.7),
    sin(p.z * 1.9 + t * 0.8 + aRand.y * 6.283) + sin(p.x * 2.1 + t * 0.6),
    sin(p.x * 1.6 - t * 0.75 + aRand.x * 6.283) + sin(p.y * 2.4 + t * 0.5)
  ) * 0.5;
}

float swell(vec3 p, float t) {
  return sin(p.x * 1.5 + t * 0.7) * cos(p.z * 1.2 - t * 0.5) * 0.24 + sin(p.z * 2.6 + t * 0.9) * 0.06;
}

void main() {
  float stagger = 0.6;
  float t = clamp(uMix * (1.0 + stagger) - aRand.x * stagger, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);

  vec3 a = aA;
  vec3 b = aB;
  a.y += uWaveA * swell(a, uTime);
  b.y += uWaveB * swell(b, uTime);
  vec3 p = mix(a, b, t);
  float transit = sin(t * PI);

  // Raw state: the form swells, sheds grit and drifts on a slow current.
  float c = uChaos;
  vec3 dir = normalize(aRand.yzw - 0.5 + 0.0001);
  float lump = sin(dot(normalize(p + 0.0001), vec3(1.3, 2.1, -1.7)) * 3.0 + uTime * 0.3);
  vec3 f = flow(p * 1.2, uTime);
  p *= 1.0 + c * 0.24 * lump + uPulse * 0.08;
  p += dir * (0.05 + 0.5 * aRand.z * aRand.z * aRand.z) * c;
  p += f * (0.2 * c + 0.42 * transit + 0.07 * uEnergy);
  p += dir * uPulse * 0.25 * aRand.y;

  vec3 v = uRot * p * uScale + uCenter;

  // The cursor pushes particles aside like a probe.
  vec2 d = v.xy - uMouse;
  float m = exp(-dot(d, d) * 2.4);
  v.xy += normalize(d + 0.00001) * m * uMouseF;
  v.z += m * uMouseF * 0.6;

  gl_Position = uProj * vec4(v, 1.0);
  float depth = -v.z;
  float size = uSize * (0.5 + aRand.y * 0.95) * (6.0 / depth);
  gl_PointSize = size * (1.0 + c * 0.7 * aRand.w + transit * 0.9 + uPulse * 0.8);

  float signalShare = 0.09 + 0.45 * uEnergy + 0.3 * uPulse;
  vSignal = step(1.0 - signalShare, fract(aRand.x * 13.7 + aRand.w * 3.1));
  vAlpha = uAlpha * smoothstep(10.5, 4.4, depth) * (0.5 + 0.5 * aRand.w) * mix(1.0, 0.62, c);
}
`;

const FRAG = /* glsl */ `
precision mediump float;
varying float vAlpha;
varying float vSignal;
uniform vec3 uInk;
uniform vec3 uSig;
void main() {
  vec2 q = gl_PointCoord - 0.5;
  float d = dot(q, q) * 4.0;
  float a = smoothstep(1.0, 0.0, d);
  a *= a;
  vec3 col = mix(uInk, uSig, vSignal);
  gl_FragColor = vec4(col, a * vAlpha * (1.0 + vSignal * 0.9));
}
`;

const FOV = (35 * Math.PI) / 180;
const DIST = 6;
export const HALF_H = Math.tan(FOV / 2) * DIST;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("[scene] shader error", gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

export function Scene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false, depth: false, powerPreference: "high-performance" });
    if (!gl) {
      canvas.dataset.unsupported = "true";
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("[scene] link error", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const small = window.innerWidth < 860;
    const weak = (navigator.hardwareConcurrency || 8) <= 4;
    const N = small ? 11000 : weak ? 16000 : 26000;

    const shapes: Record<number, Float32Array> = {
      [SHAPE.GEM]: gem(N),
      [SHAPE.RING]: ring(N),
      [SHAPE.ORBITS]: orbits(N),
      [SHAPE.WAVE]: wave(N),
    };
    shapes[SHAPE.TEXT] = shapes[SHAPE.RING];

    const makeBuffer = (name: string, size: number, data: Float32Array, usage: number) => {
      const buffer = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, usage);
      const loc = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
      return buffer;
    };
    const bufA = makeBuffer("aA", 3, shapes[SHAPE.GEM], gl.DYNAMIC_DRAW);
    const bufB = makeBuffer("aB", 3, shapes[SHAPE.GEM], gl.DYNAMIC_DRAW);
    const bufR = makeBuffer("aRand", 4, seeds(N), gl.STATIC_DRAW);

    const U = (name: string) => gl.getUniformLocation(program, name);
    const u = {
      proj: U("uProj"), rot: U("uRot"), center: U("uCenter"), mouse: U("uMouse"), scale: U("uScale"),
      mix: U("uMix"), time: U("uTime"), chaos: U("uChaos"), energy: U("uEnergy"), waveA: U("uWaveA"),
      waveB: U("uWaveB"), size: U("uSize"), alpha: U("uAlpha"), mouseF: U("uMouseF"), pulse: U("uPulse"),
      ink: U("uInk"), sig: U("uSig"),
    };
    gl.uniform3f(u.ink, 0.93, 0.92, 0.89);
    gl.uniform3f(u.sig, 1.0, 0.36, 0.12);

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    // Additive color, untouched alpha: the canvas stays transparent and glows over the page.
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ZERO, gl.ONE);
    gl.clearColor(0, 0, 0, 0);

    let width = 0;
    let height = 0;
    const proj = new Float32Array(16);
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      width = Math.floor(window.innerWidth * dpr);
      height = Math.floor(window.innerHeight * dpr);
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      const aspect = width / height;
      const f = 1 / Math.tan(FOV / 2);
      const near = 0.1;
      const far = 60;
      proj.fill(0);
      proj[0] = f / aspect;
      proj[5] = f;
      proj[10] = (far + near) / (near - far);
      proj[11] = -1;
      proj[14] = (2 * far * near) / (near - far);
      gl.uniformMatrix4fv(u.proj, false, proj);
      gl.uniform1f(u.size, (small ? 2.3 : 2.6) * dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    // The wordmark shape needs the real font, so it is sampled once fonts are in.
    let disposed = false;
    document.fonts?.ready.then(() => {
      if (disposed) return;
      const family = getComputedStyle(document.documentElement).getPropertyValue("--font-sans").trim() || "sans-serif";
      const sampled = text(N, "MiGaKu", family);
      if (sampled) {
        shapes[SHAPE.TEXT] = sampled;
        pairFrom = -1; // re-upload without disturbing the current blend
      }
    });

    const cur = {
      mix: 0, x: sceneTarget.x, y: sceneTarget.y, scale: sceneTarget.scale, alpha: 0, chaos: sceneTarget.chaos,
      energy: 0, tilt: sceneTarget.tilt, face: sceneTarget.face, level: sceneTarget.level, yaw: 0.6, roll: 0, pulse: 0, mx: 0, my: 0, mf: 0,
    };
    let seenVersion = -1;
    let pairFrom = -1;
    let pairTo = -1;
    let clock = 0;
    const rot = new Float32Array(9);
    const wrap = (a: number) => ((((a + Math.PI) % TAU) + TAU) % TAU) - Math.PI;

    const off = onTick((_, dt) => {
      const T = sceneTarget;
      if (document.hidden) return;

      if (seenVersion !== T.version || pairFrom !== T.from || pairTo !== T.to) {
        if (seenVersion !== T.version) cur.mix = T.snap;
        seenVersion = T.version;
        pairFrom = T.from;
        pairTo = T.to;
        gl.bindBuffer(gl.ARRAY_BUFFER, bufA);
        gl.bufferData(gl.ARRAY_BUFFER, shapes[T.from], gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, bufB);
        gl.bufferData(gl.ARRAY_BUFFER, shapes[T.to], gl.DYNAMIC_DRAW);
        gl.uniform1f(u.waveA, T.from === SHAPE.WAVE ? 1 : 0);
        gl.uniform1f(u.waveB, T.to === SHAPE.WAVE ? 1 : 0);
      }

      cur.mix = damp(cur.mix, T.mix, T.rate, dt);
      cur.x = damp(cur.x, T.x, 5, dt);
      cur.y = damp(cur.y, T.y, 5, dt);
      cur.scale = damp(cur.scale, T.scale, 5, dt);
      cur.alpha = damp(cur.alpha, T.alpha, 4, dt);
      cur.chaos = damp(cur.chaos, T.chaos, 4.5, dt);
      cur.energy = damp(cur.energy, T.energy, 3.5, dt);
      cur.tilt = damp(cur.tilt, T.tilt, 4, dt);
      cur.face = damp(cur.face, T.face, 4, dt);
      cur.level = damp(cur.level, T.level, 4, dt);

      if (scenePulse.value > 0) {
        cur.pulse = Math.max(cur.pulse, scenePulse.value);
        scenePulse.value = 0;
      }
      cur.pulse = damp(cur.pulse, 0, 2.6, dt);

      if (cur.alpha < 0.004 && T.alpha < 0.004) {
        gl.clear(gl.COLOR_BUFFER_BIT);
        return;
      }

      const still = view.reduced;
      if (!still) {
        clock += dt * (1 + cur.energy * 1.6);
        cur.yaw += (T.spin + cur.energy * 0.5) * dt;
        cur.roll += T.roll * dt;
      }

      const aspect = width / height;
      const halfW = HALF_H * aspect;

      // Pointer parallax plus the probe position at the specimen's depth.
      const px = pointer.seen && view.fine ? pointer.nx : 0;
      const py = pointer.seen && view.fine ? pointer.ny : 0;
      cur.mx = damp(cur.mx, px, 6, dt);
      cur.my = damp(cur.my, py, 6, dt);
      cur.mf = damp(cur.mf, pointer.seen && view.fine && !still ? 0.34 : 0, 5, dt);

      const yaw = wrap(cur.yaw) * (1 - cur.face) + cur.mx * 0.22;
      const tilt = cur.tilt - cur.my * 0.16;
      const roll = wrap(cur.roll) * (1 - cur.level);
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      const cx = Math.cos(tilt), sx = Math.sin(tilt);
      const cz = Math.cos(roll), sz = Math.sin(roll);
      // R = Rx(tilt) * Ry(yaw) * Rz(roll), column-major.
      rot[0] = cy * cz;
      rot[1] = cx * sz + sx * sy * cz;
      rot[2] = sx * sz - cx * sy * cz;
      rot[3] = -cy * sz;
      rot[4] = cx * cz - sx * sy * sz;
      rot[5] = sx * cz + cx * sy * sz;
      rot[6] = sy;
      rot[7] = -sx * cy;
      rot[8] = cx * cy;

      gl.uniformMatrix3fv(u.rot, false, rot);
      gl.uniform3f(u.center, cur.x * halfW, cur.y * HALF_H, -DIST);
      gl.uniform2f(u.mouse, cur.mx * halfW, cur.my * HALF_H);
      gl.uniform1f(u.mouseF, cur.mf);
      gl.uniform1f(u.scale, cur.scale);
      gl.uniform1f(u.mix, cur.mix);
      gl.uniform1f(u.time, clock);
      gl.uniform1f(u.chaos, cur.chaos);
      gl.uniform1f(u.energy, cur.energy);
      gl.uniform1f(u.alpha, cur.alpha);
      gl.uniform1f(u.pulse, cur.pulse);

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.POINTS, 0, N);
    });

    return () => {
      disposed = true;
      off();
      window.removeEventListener("resize", resize);
      gl.deleteBuffer(bufA);
      gl.deleteBuffer(bufB);
      gl.deleteBuffer(bufR);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return <canvas ref={canvasRef} className="scene" aria-hidden="true" />;
}
