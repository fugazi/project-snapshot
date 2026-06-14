# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Project Snapshot is an **Ableton Live extension** (built on the beta Ableton Extensions SDK) that walks a Live Set and emits a standalone, interactive HTML report (tracks, clips, devices/parameters, scenes, cue points, plus AI + local creative suggestions). There is a companion **Cloudflare Worker** that proxies project data to Workers AI for suggestions.

This is two independent npm projects living in one repo:
- **Root (`/`)** — the Live extension. Depends on `@ableton-extensions/sdk` and `@ableton-extensions/cli`, both **vendored as `.tgz` files in `vendor/`** (not from the npm registry).
- **`/worker`** — the Cloudflare Worker AI proxy. Separate `package.json`, deps, and deploy flow.

## Commands

### Extension (root)
```bash
npm install              # installs the vendored SDK + CLI .tgz from vendor/
npm start                # tsx build.ts && extensions-cli run  (build + launch in Live)
npm run build            # tsc --noEmit (type-check) && tsx build.ts (non-production bundle)
npm run package          # tsx build.ts --production  (minified bundle, used to build .ablx)
npx extensions-cli package -o project-snapshot.ablx   # repackage the installable .ablx
```
- Running `npm start` requires Ableton Live **Beta** with **Developer Mode** enabled, and `EXTENSION_HOST_PATH` set in `.env` to the Live Beta app/executable path. There is no way to run headless — the SDK drives the live Live process.
- **There is no test suite and no linter.** Type-checking (`tsc --noEmit`) is the only static validation, run as part of `npm run build`.

### Worker (`worker/`)
```bash
cd worker && npm install
npm run dev              # wrangler dev (local)
npm run deploy           # wrangler deploy (production)
npx wrangler secret put CF_ACCOUNT_ID   # set Cloudflare Account ID (interactive)
npx wrangler secret put CF_API_TOKEN    # set Cloudflare API token (interactive)
```

## Architecture

### Build pipeline
`build.ts` uses esbuild to bundle `src/extension.ts` → `dist/extension.js` (the path comes from `manifest.json`'s `entry` field — change the entry there, not in build.ts). Output is CJS/Node, minified only with `--production`. `npm run build` runs `tsc --noEmit` first, so type errors block the bundle. The distributable `.ablx` (checked into git via a `!*.ablx` negation in `.gitignore`) is produced by `extensions-cli package` from a production build — rebuild it whenever you ship changes.

### Runtime data flow
```
right-click in Live → showModal command → modal.ts dialog → "Generate"
   → runGeneration() withinProgressDialog
      → extractor.ts: extractSnapshot()  [walks song tree, reports progress %]
      → ai-suggestions.ts: fetchAISuggestions()  [POSTs compact payload to Worker]
      → generator.ts: generateReport() → template.ts: renderTemplate()
      → writes <storageDir>/<filename>-<timestamp>.html
```
`context.environment.storageDirectory` is where output HTML files land; it's shown in the modal and success dialog.

### extractor.ts — performance model (v2)
This file is the hot path and is deliberately written for concurrency. Keep these patterns intact when editing:
- **`batchParallel(items, fn, concurrency)`** — a hand-rolled concurrency-limited executor. Tracks run at concurrency **4** for tracks, **50** for parameters. The SDK's `param.getValue()` is an async IPC call and the dominant bottleneck, so parallelism here matters.
- Per track, **clips + devices + mixer are read in parallel** (`Promise.all`). Mixer reads volume + pan + all sends in parallel.
- **Every SDK access is wrapped in try/catch with fallbacks** (`safeGetValue`, `safeSync`). The SDK is beta and throws on edge cases (empty clips, missing mixer, etc.) — failures must degrade silently, not abort the whole snapshot.
- Progress is throttled (every 3 tracks, not per track) to avoid flooding the progress dialog.

### Two distinct suggestion systems — do not conflate them
The report has two separate "suggestions" sections sourced differently:
1. **`suggestions` (`SnapshotSuggestion[]`, "Insights / Next Steps" section)** — deterministic, generated locally in `extractor.ts` → `generateSuggestions()` from project state (empty tracks, unnamed clips, armed/muted/soloed, default 120 BPM, etc.). Always present.
2. **`aiSuggestions` (`AISuggestion[]`, "AI Creative Ideas" section)** — fetched from the Worker in `ai-suggestions.ts`. Falls back to `getLocalFallbackSuggestions()` (also in that file) if the Worker is unreachable, times out (8s), or returns invalid data.

Both are also rendered in `template.ts` in different sections (`renderInsightsSection` vs `renderAISection`).

### Worker AI flow (`worker/src/index.ts`)
The Worker does **not** use a Worker `ai` binding — it calls the Cloudflare AI REST API directly via `fetch` with `CF_API_TOKEN` (Bearer) and `CF_ACCOUNT_ID` (path). Model is the `MODEL` constant (`@cf/zai-org/glm-4.7-flash`). It requests `response_format: { type: "json_object" }` and parses the JSON. There is a **third fallback layer inside the Worker** (`getFallbackSuggestions`) that runs if the AI call fails or JSON parsing fails — so the endpoint almost always returns 200 with suggestions. CORS is wide open (`*`).

## Important conventions & gotchas

- **Imports use `.js` extensions in `.ts` source** (e.g. `import { extractSnapshot } from "./extractor.js"`). The project uses ESM (`"type": "module"`) with `moduleResolution: "bundler"`. Preserve the `.js` suffix in any new/edited imports.
- **Time signature is NOT on `song` in SDK 1.0.0-beta.** `signatureNumerator`/`signatureDenominator` live on `Scene`, so the code reads them from `song.scenes[0]` (cast `as any`) as a workaround. See `extension.ts` and `extractOverview` in `extractor.ts`. If the SDK adds these to `Song` later, both spots should be updated.
- **Worker secrets are deliberately NOT in `wrangler.toml`.** Commit `39701c7` removed `CF_ACCOUNT_ID` from `[vars]` because `vars` override secrets — keep credentials as `wrangler secret put` only.
- **The Worker URL is hardcoded** in `src/ai-suggestions.ts` (`AI_WORKER_URL`). If you deploy your own Worker, update that constant and rebuild the `.ablx`. The README documents this.
- The modals in `modal.ts` are `data:text/html;charset=utf-8,<urlencoded>` strings rendered in Live's webview (WebKit on macOS, WebView2 on Windows) — JS inside them posts back via `window.webkit.messageHandlers.live` or `window.chrome.webview`.
- The `template.ts` report is one large file (~1500 lines): a `CSS` string, a `JS` string, a `renderTemplate()` entry, and per-section `render*Section()` functions that inject data. `esc()` does HTML escaping — always use it on dynamic strings.
- UI/log strings are in **English** by convention (menus, modal labels, report text), even though the implementation plan (`IMPLEMENTATION-PLAN.md`) and worker `README.md` are in Spanish.

## Privacy contract
`ai-suggestions.ts` → `compactProjectData()` sends **only** musical characteristics (BPM, counts, scale, device names, track type/state summary — no note content, no file paths, no PII). Preserve this when changing the payload.
