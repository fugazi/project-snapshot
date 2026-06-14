# AGENTS.md

## Project Overview

Project Snapshot is an Ableton Live extension (built with the Ableton Extensions SDK beta) that extracts data from a Live Set and generates a standalone interactive HTML report. It also fetches AI-powered creative suggestions via a Cloudflare Worker proxy (Workers AI). The extension is packaged as a `.ablx` file for distribution.

## Tech Stack

- **Runtime:** Node.js ≥ 24.14.1 (runs inside Ableton Live's extension host)
- **Language:** TypeScript 5.9, strict mode
- **Bundler:** esbuild 0.28 (CJS output, Node platform)
- **Package Manager:** npm (DO NOT use pnpm or yarn for the extension)
- **Ableton SDK:** `@ableton-extensions/sdk` 1.0.0-beta.0 (vendored as `.tgz`)
- **Ableton CLI:** `@ableton-extensions/cli` 1.0.0-beta.0 (vendored as `.tgz`)
- **AI Worker:** Cloudflare Workers (TypeScript), Wrangler 4.x
- **AI Model:** GLM 4.7 Flash via Cloudflare Workers AI

## Setup Commands

```bash
# Install extension dependencies
npm install

# Build (type-check + bundle)
npm run build

# Build + run in Ableton Live (requires Developer Mode)
npm start

# Production build (minified, no sourcemaps)
npm run package

# Package into .ablx installable
npx extensions-cli package -o project-snapshot.ablx
```

### Worker (AI proxy)

```bash
cd worker
npm install
npm run deploy   # deploys to Cloudflare via Wrangler
```

## Architecture

```
src/
├── extension.ts       Entry point — registers commands, modal dialog, orchestrates generation
├── extractor.ts       Reads Live Set data (tracks, clips, devices, scenes, cue points, mixer)
├── ai-suggestions.ts  Compacts project data → POST to Worker → parses AI suggestions. Falls back to local engine on failure
├── generator.ts       Writes the final HTML file to disk
├── template.ts        HTML/CSS/JS template (Teal Green theme, glassmorphism, animations)
├── modal.ts           Modal dialog HTML for pre-generation preview
└── types.ts           All TypeScript interfaces + utility functions (note names, warp modes, etc.)

worker/
├── src/index.ts       Cloudflare Worker — receives project JSON, builds prompt, calls Workers AI, returns suggestions
├── wrangler.toml      Worker config (NO secrets here — use `wrangler secret put`)
└── package.json       Worker dependencies
```

### Data Flow

1. User right-clicks in Ableton → modal shows project preview
2. User clicks Generate → `extractor.ts` reads the entire Live Set
3. `ai-suggestions.ts` sends compact data to Cloudflare Worker (8s timeout)
4. Worker calls GLM 4.7 Flash, returns 6 creative suggestions
5. If AI fails → local fallback engine generates suggestions
6. `generator.ts` writes standalone HTML file with all data + suggestions

## Code Style

- Use **named exports** only (no default exports)
- File names: `kebab-case.ts` for modules, `PascalCase` not used
- Async/await only — no `.then()` chains
- All Ableton SDK calls must be wrapped in try/catch (SDK is beta, properties may be undefined)
- `DeviceParameter.getValue()` is **async** — always await it
- Use `import type` for type-only imports

## Testing Instructions

- No automated tests currently (SDK requires live Ableton Live instance)
- Manual test: load extension in Ableton Live Beta → open a project → right-click → Generate Snapshot
- Verify HTML output opens in browser with all sections rendered
- Test AI suggestions by checking the "✨ AI Creative Ideas" section appears with 6 cards
- Test fallback: temporarily use an invalid Worker URL → local suggestions should appear

## Security Considerations

- **NEVER commit API keys, tokens, or Account IDs** to the repo
- Worker secrets are set via `wrangler secret put` (encrypted in Cloudflare)
- The extension sends only musical project data (BPM, track names, device names, clip counts) — no personal/user data
- The Worker URL is hardcoded in `src/ai-suggestions.ts` — this is intentional (no user configuration needed)
- `.env` and `.dev.vars` are gitignored

## Things to Avoid

- DO NOT use `npm install` inside `worker/` and commit `package-lock.json` — it's a separate project
- DO NOT add the Ableton SDK as a public npm dependency — it's vendored as `.tgz` under `vendor/`
- DO NOT use synchronous file operations in the extraction pipeline — Ableton's SDK is async
- DO NOT change the `compatibility_date` in `wrangler.toml` without testing the Worker
- DO NOT remove the fallback suggestions engine — it ensures the extension always works offline
- DO NOT add new dependencies to the extension without updating `build.ts` externals if needed

## Commit & PR Guidelines

- Use **conventional commits**: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- Always run `npm run build` before committing (type-check must pass)
- If changes affect the `.ablx`, rebuild it: `npm run package && npx extensions-cli package -o project-snapshot.ablx`
- If changes affect the Worker, note that `npm run deploy` is needed in the commit message
- Commit the `.ablx` binary to the repo — it's the distributable artifact

## Release Process

1. Ensure `npm run build` passes with no errors
2. Build production `.ablx`: `npm run package && npx extensions-cli package -o project-snapshot.ablx`
3. Commit all changes to `main`
4. Tag: `git tag -a v1.x.0 -m "Release v1.x.0 — description"`
5. Push tag: `git push origin v1.x.0`
6. Create GitHub release with `gh release create` and attach the `.ablx`

## License

MIT License — see [LICENSE](./LICENSE)
