# MiGaKu Labs

An independent lab for practical AI tools. Every tool is an **experiment** with a code, a spec sheet and a status light. The first live instrument is **Prompt Forge (EXP-001)**.

- **`/`** — lab index: hero with a live Polish ↔ Optimize specimen, Forge pipeline, experiments, method, lab log
- **`/forge`** — Prompt Forge workbench
- **`/lab`** — every experiment; **`/lab/[slug]`** — spec sheets for tools still on the bench
- **`/about`** — the lab, the operator, the colophon

Built with Next.js 16 (App Router), React 19 and TypeScript. No UI framework: the design system is hand-written CSS in `app/globals.css` and `app/forge/forge.css`.

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
  forge/                 Forge, IntensityDial, Picker, OutputPanel, RunLog, controls
  home/SpecimenDemo.tsx  Static dial demo (never calls an API)
  site/                  Nav, Footer, StatusChip, BrandMark
lib/
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

**A new tool (music maker, games, …)** — add an entry to `lib/experiments.ts` (it immediately appears on the home page, `/lab` and gets a spec sheet). When it ships, build its route (e.g. `app/music/page.tsx` plus any `app/api/music/route.ts`), set `status: "live"` and `href: "/music"`, and add a line to `lib/log.ts`. `PIXAZO_API_KEY` is already reserved in `.env.example` for EXP-002.

**Copy** — the operator bio and links are in `lib/site.ts`.

## Provider notes

- **Claude Haiku 5.5** uses adaptive thinking with `output_config.effort` and the `web_search_20260318` tool (same request shape as the original Prompt Forge).
- **GPT-6.1** uses the Responses API with `reasoning.effort` (low/medium/high) and the hosted `web_search` tool.
- **MiMo** uses `https://api.xiaomimimo.com/v1/chat/completions` with model ids `mimo-v2.6-pro` / `mimo-v2.6-flash`; *Deep* sends `thinking: {type: "enabled"}`. If Xiaomi changes ids or endpoints, override with `MODEL_MIMO_V2_6_PRO`, `MODEL_MIMO_V2_6_FLASH` or `MIMO_BASE_URL` instead of editing code.
- Any model id can be overridden with `MODEL_<KEY>` (key upper-cased, non-alphanumerics → `_`).
