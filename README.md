# GSDF LIVE

The platform of the **Global Social-Deduction Federation**: a tournament lobby, the **Script Riter** scenario
editor (a node-and-link canvas for designing social-deduction games such as Mafia / Werewolf), and optional
Gemini-powered role generation and import.

Client-only React 19 + Vite 6 + TypeScript single-page app. There is **no backend yet** — see
[Current limitations](#current-limitations).

## Quickstart (≈ 5 minutes)

Prerequisites: Node.js 22+.

```bash
npm ci --ignore-scripts        # install
cp .env.example .env.local     # optional: add a Gemini key to enable AI features
npm run dev                    # http://localhost:5173
```

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production bundle in `dist/` (works with or without a Gemini key) |
| `npm run preview` | Serve the production bundle locally |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest + jsdom unit/component tests (`npm run test:watch` for watch mode) |
| `npx vitest run --coverage` | Tests with V8 coverage |

### Environment

| Variable | Required | Notes |
|---|---|---|
| `GEMINI_API_KEY` | No | Read at **build time** by `vite.config.ts` and exposed to the client as `process.env.API_KEY`. Enables *Generate with AI* and *Import* in Script Riter. |

### Docker

```bash
docker build -t gsdf-live --build-arg GEMINI_API_KEY="$GEMINI_API_KEY" .
docker run --rm -p 8080:8080 gsdf-live      # non-root nginx; GET /healthz → ok
```

## User journeys

| # | Journey | Status |
|---|---|---|
| J1 | Sign in on the Gateway (Digital ID or Magic Link) and land in the lobby | Works — **demo authentication** (local checks only, no server) |
| J2 | Navigate Dashboard / Script Riter / Tournaments | Works |
| J3 | Build a scenario in Script Riter (add roles from the 477-role community library, link and edit them), **Save**, reopen, **Export JSON** | Works — saved in this browser's `localStorage` |
| J4 | Browse / filter tournaments and **Register** | Works — listings are **demo data**; registrations are stored on this device |
| J5 | Generate roles with AI / import roles from a text, Markdown, HTML, XML or JSON file (≤ 200 KB) | Requires `GEMINI_API_KEY`; otherwise an "AI unavailable" message is shown |

Out of scope for this build: Tribunal, Interrogation, Results scenes, analysis tools and progression
(placeholder components only); real-time play.

## Architecture

```
index.html ─ index.tsx ─ <ErrorBoundary> ─ App.tsx (auth flag + page switch)
   ├─ scenes/Gateway       DigitalIdCard → services/authService (STUB)
   ├─ scenes/Lobby         TournamentBrowser → services/registrationStorage (localStorage)
   └─ scenes/ScriptRiter   (lazy-loaded) → services/scenarioStorage (localStorage)
                                         → services/geminiService → Google Gemini (lazy client, 30 s timeout)
                                         → services/roleNormalizer (team enum validation, upload limits, ids)
services/logger.ts         structured JSON log events (swap the sink for Sentry/OTel in one place)
```

## Security notes (read before deploying)

* **Authentication is a stub.** `services/authService.ts` validates input locally and grants a demo session.
  Integrate a real identity provider before any production use.
* **The Gemini key ships in the bundle.** Anyone can extract it from the deployed JavaScript. Until the
  calls are moved behind a server-side proxy, use a key restricted by HTTP referrer with a hard quota, or
  deploy without a key.
* Tailwind is loaded from `cdn.tailwindcss.com` and React/Gemini SDK are mapped to `aistudiocdn.com`
  in `index.html` (AI Studio runtime compatibility). Migrating Tailwind to a build-time dependency and adding
  a CSP are tracked follow-ups.

## Current limitations

* No backend, database or multi-device sync — scenarios and registrations live in `localStorage`.
* Tournament listings are static demo data.
* No licence file has been chosen yet.

## Contributing

CI (`ci/github-workflow-ci.yml` — move to `.github/workflows/ci.yml` to activate, see `ci/README.md`) runs typecheck, tests with coverage, a key-less production build and
`npm audit --audit-level=high` on every push and pull request. Keep it green.
