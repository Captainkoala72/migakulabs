# MiGaKu Labs

An independent lab for practical AI tools. Every tool is an **experiment** with a code, a spec sheet and a status light. The first live instrument is **Prompt Forge (EXP-001)**.

- **`/`** — a scroll-driven walk through the lab: hero with a drag-to-polish specimen, the Forge demonstrated in one pinned scroll, model roster, feature grid, horizontal experiment gallery, method, lab log, finale
- **`/forge`** — Prompt Forge workbench
- **`/lab`** — every experiment; **`/lab/[slug]`** — spec sheets for tools still on the bench
- **`/about`** — the lab, the operator, the colophon

Built with Next.js 16 (App Router), React 19 and TypeScript. No UI or animation framework: the design system is hand-written CSS (`app/globals.css`, `app/home.css`, `app/forge/forge.css`) and the motion is custom code. The only runtime dependency beyond Next/React is [Lenis](https://github.com/darkroomengineering/lenis) for inertial scrolling.

## How the motion works

| Piece | Where | What it does |
|---|---|---|
| The specimen | `components/fx/Scene.tsx`, `lib/fx/shapes.ts` | One fixed WebGL canvas behind every page. ~26,000 points (11,000 on phones) are morphed between five shapes — cut gem, model orbits, rolling lattice, gauge, the wordmark — entirely in a hand-written vertex shader. No 3D library. |
| Scene state | `lib/fx/scene.ts` | A tiny shared store. Pages write a target pose (shape, position, roughness, energy); the renderer eases toward it. |
| Scroll choreography | `components/home/HomeScene.tsx` | Each homepage section has a pose; the specimen morphs between poses in the gaps. |
| Frame loop | `lib/fx/ticker.ts` | A single `requestAnimationFrame` loop shared by smooth scroll, the canvas, the cursor and every scroll-linked animation. |
| Pinned sections | `Pin` in `components/fx/Motion.tsx` | `position: sticky` plus a `--p` CSS variable (0→1) written each frame, so most scroll animation is plain CSS `calc()`. |
| Variable type | `components/home/Hero.tsx` | Headline letters animate along Archivo's weight and width axes: they wobble while the specimen is raw and swell toward the cursor. |
| Extras | `components/fx/*` | Boot sequence, shutter route transitions, cursor ring, magnetic buttons, tilt cards, velocity marquee, text scramble, HUD, synthesized UI sounds (off by default). |

Everything respects `prefers-reduced-motion`: smooth scroll, the boot sequence, the cursor and looping animation are disabled and content is shown immediately.

## Prompt Forge

| Feature | Details |
|---|---|
| Polish ↔ Optimize dial | 5 stops: Polish (±15% length, line edit), Refine, Balanced, Enhance, Optimize (full rebuild) |
| Targets | 17 profiles: Auto · General, AI image, AI video, app coding, website vibe coding, AI agents, school & homework, deep research, marketing, data analysis, technical writing, roleplay, music & audio, creative writing, email & comms, code review & debugging, custom GPT / system prompt |
| Models | GPT-6.1 Sol, GPT-6.1 Terra, Claude Haiku 5.5, DeepSeek Flash, GLM 5.3 Flash, MiMo V2.6 Pro, MiMo V2.6 Flash |
| Reasoning effort | Per model (e.g. Claude: Medium/High/X-High/Max; MiMo: Standard/Deep) |
| Web search | Native for OpenAI and Claude; DeepSeek, GLM and MiMo call a `web_search` function answered by Z.ai search |
| Instructions for the AI | Separate optional field sent as editor guidance, never copied into the prompt |
| Reference images | Up to 3 PNG/JPEG/WebP (resized in the browser), for vision models |
| Output | Streaming result, word-level **Changes** view, sources, copy/download, "forge again from this" |
| Run log | Last 25 runs kept in the visitor's browser (localStorage) |

Keyboard: **Ctrl/Cmd + Enter** runs, **Esc** stops.

## Deploy on Vercel

1. Import the `migakulabs` repo in Vercel (framework preset: Next.js).
2. Add environment variables (Project → Settings → Environment Variables). See `.env.example`:

   | Variable | Used for |
   |---|---|
   | `OPENAI_API_KEY` | GPT-6.1 Sol / Terra |
   | `ANTHROPIC_API_KEY` | Claude Haiku 5.5 |
   | `DEEPSEEK_API_KEY` | DeepSeek Flash |
   | `ZAI_API_KEY` | GLM 5.3 Flash **and** web search for DeepSeek, GLM and MiMo |
   | `MIMO_API_KEY` | MiMo V2.6 Pro / Flash (Xiaomi pay-as-you-go key) |
   | `FORGE_ACCESS_CODE` | Your lab key — unlocks unlimited runs |
   | `FORGE_FREE_RUNS_PER_HOUR` | Free runs per visitor per hour (default 10; `0` = key required) |
   | `FORGE_DAILY_RUN_CAP` | Optional total free runs per day across everyone |
   | `UPSTASH_REDIS_REST_URL` / `_TOKEN` | Durable rate limiting (add Upstash Redis from the Vercel Marketplace) |
   | `NEXT_PUBLIC_SITE_URL` | Your production URL, for social cards |

3. Redeploy after changing variables. Models without a key show as **offline** in the UI instead of failing silently.

**Cost protection.** The Forge is public but metered: each visitor gets a free hourly allowance, the lab key bypasses it, and cross-site POSTs are rejected. Without Upstash, counts are kept in memory per serverless instance (best-effort); add Upstash for limits that hold across instances.

**Function duration.** `/api/forge` allows up to 300 s (`maxDuration`), which needs Vercel Fluid compute (on by default for new projects).

## Local development

```bash
npm install
cp .env.example .env.local   # add the keys you have
npm run dev
```

Set `FORGE_MOCK=1` in `.env.local` to test the whole UI with a fake streamed response and no API spend (ignored in production builds).

```bash
npm run typecheck
npm run build
```

## Project structure

```
app/
  page.tsx               Home (lab index)
  forge/page.tsx         Prompt Forge
  lab/                   Experiments index + spec sheets
  about/page.tsx
  api/forge/route.ts     Validates input, meters usage, streams SSE
  api/status/route.ts    Which models are online + caller's allowance (no secrets)
components/
  fx/                    Scene (WebGL), SmoothScroll, Cursor, Preloader, Transition, Hud, Reveal, Scramble, Motion
  forge/                 Forge, IntensityDial, Picker, OutputPanel, RunLog, controls
  home/                  Hero, Process, Instruments, Deck, LabRail, Method, LogTerminal, Finale, HomeScene
  lab/SpecimenCard.tsx   Experiment cards with small living illustrations
  site/                  Nav, Footer, StatusChip, BrandMark
lib/
  fx/                    ticker, scene store, shapes, sfx, math, ready
  site.ts                Name, tagline, operator bio, links
  experiments.ts         The experiment registry
  log.ts                 Lab log entries
  forge/catalog.ts       Client-safe model list (labels, efforts, capabilities)
  forge/templates.ts     The 17 targets and their guidance
  forge/intensity.ts     Dial stops
  forge/prompts.ts       System prompt assembly
  server/providers.ts    Provider adapters, streaming, tool loops (server-only)
  server/access.ts       Lab key, rate limits, origin check (server-only)
```

## Adding things

**A new model** — add it to `MODELS` in `lib/forge/catalog.ts`. If its provider is new, add an adapter to `PROVIDER_SERVERS` in `lib/server/providers.ts` (OpenAI-compatible providers only need a `body()` and headers).

**A new tool (music maker, games, …)** — add an entry to `lib/experiments.ts` (it immediately appears in the home gallery, on `/lab`, and gets a spec sheet). Give it a small illustration in `components/lab/SpecimenCard.tsx` and, on its page, a `<ScenePreset>` to pose the specimen. When it ships, build its route (e.g. `app/music/page.tsx` plus any `app/api/music/route.ts`), set `status: "live"` and `href: "/music"`, and add a line to `lib/log.ts`. `PIXAZO_API_KEY` is already reserved in `.env.example` for EXP-002.

**Copy** — the operator bio and links are in `lib/site.ts`.

## Provider notes

- **Claude Haiku 5.5** uses adaptive thinking with `output_config.effort` and the `web_search_20260318` tool (same request shape as the original Prompt Forge).
- **GPT-6.1** uses the Responses API with `reasoning.effort` (low/medium/high) and the hosted `web_search` tool.
- **MiMo** uses `https://api.xiaomimimo.com/v1/chat/completions` with model ids `mimo-v2.6-pro` / `mimo-v2.6-flash`; *Deep* sends `thinking: {type: "enabled"}`. If Xiaomi changes ids or endpoints, override with `MODEL_MIMO_V2_6_PRO`, `MODEL_MIMO_V2_6_FLASH` or `MIMO_BASE_URL` instead of editing code.
- Any model id can be overridden with `MODEL_<KEY>` (key upper-cased, non-alphanumerics → `_`).
