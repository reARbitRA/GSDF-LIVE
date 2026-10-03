# 06 — Execution Log

## Phase 0–6 state digest (tool calls ≈ 30)
- HEAD ea81d4d pinned; branch arena/01a1025f-gsdf-live (session-pinned; protocol name deviation logged).
- Baseline: install 0 / build 0 / tsc 2 (12 errs) / test N/A / audit 0 vulns / journey probe 6/6 [cmd#4–#7, #21].
- Findings: 26 (P0 1, P1 8, P2 15, P3 2). R_point 53.124 (D), SUL 0.00, verdict NO-GO — BLOCKED.
- Phase 5: VALIDATION DEGRADED — SINGLE-MODEL (no second model in sandbox). Spot-check 10/10 [cmd#24]. Freeze hashes in 04_validation.json.
- Blueprint: 18 tasks; 14 autonomous, 4 require_human (T-015 proxy, T-016 IdP, T-017 LICENSE) + T-018 backlog.

## Phase 7 task log

### T-001 — Add vitest runner, typecheck script, port Gateway test
- Files: package.json (scripts test/typecheck; test libs → devDependencies; +vitest, jsdom, @vitest/coverage-v8, @testing-library/dom), package-lock.json (new), vitest.config.ts, vitest.setup.ts, tsconfig.json (types vitest/globals; exclude audit/dist), GatewayScene.test.tsx (jest.mock→vi.mock, @jest/globals→vitest; assertions untouched).
- Verify [cmd#26]: `npm run typecheck` exit 0 (was 2). `npx vitest run` executes 6 tests: 1 pass / 5 fail — failures are pre-existing spec gaps F-EXEC-005 and newly found F-EXEC-007 (FREEZE_EXCEPTION-001), addressed by T-019/T-003 next. Baseline had 0 runnable tests, so no regression.
- cmd#27 isolated repro: identifier='operator1' + click Authenticate → no alert; identifier='' → alert. Root cause: hidden <input type=email> shares `identifier` state, form lacks noValidate.

### T-019 + T-003 — Gateway: fix hidden-email validation block; add auth service boundary
- Files: services/authService.ts (+), services/authService.test.ts (+4 tests), components/scenes/Gateway/DigitalIdCard.tsx (noValidate, disabled inactive inputs, sync validateForm, async authenticate via service, aria-label/aria-busy on submit so the button keeps an accessible name while loading, success transition 300 ms), GatewayScene.test.tsx (only change: ambiguous `/Password/i` → `/^Password$/i`; all assertions intact).
- Test-first: cmd#26/#28 showed 5/6 then 4/6 failing; after fix cmd#29: 10/10 pass, typecheck 0 errors.
- F-EXEC-005 closed (asserted manipulation error now implemented behind a clearly labelled STUB). F-SEC-002 remains OPEN/requires_human (stub is not security).

### T-002 (P0) + T-008 — Lazy Gemini client; request timeout
- Files: services/geminiService.ts (AiUnavailableError, isAiConfigured, getClient() lazy init, abortSignal: AbortSignal.timeout(30000) on both calls), services/geminiService.test.ts (+5 tests).
- Test-first cmd#30: 5/5 failed on old code. After fix cmd#31: product suite 15/15, typecheck 0 errors.
- Baseline probe now fails its two *negative* assertions (module throws without key; bad-password not implemented) — expected: these encoded the defects. Baseline probe kept for the record; a post-remediation probe will be added at milestone close.
- F-EXEC-001 CLOSED, F-RELY-002 CLOSED.

### T-007 — Team normalisation, upload cap, collision-free ids
- Files: services/roleNormalizer.ts (+), services/roleNormalizer.test.ts (+4 tests), ScriptRiterScene.tsx (newId/toRole/validateImportFile; `as Team` casts and Date.now() ids removed), geminiService.ts (prompt lists all 4 teams; file content fenced as untrusted data and sliced to MAX_IMPORT_BYTES).
- Verify cmd#32: 19/19 tests, typecheck 0 errors, build OK. F-API-001, F-SEC-005, F-DATA-001 CLOSED.

### T-004 — ErrorBoundary + structured logger + reusable NotificationBanner
- Files: components/shared-ui/core/ErrorBoundary.tsx (+), ErrorBoundary.test.tsx (+3), services/logger.ts (+), components/shared-ui/banners/NotificationBanner.tsx (rewritten: role=alert/status, dismiss, auto-dismiss), index.tsx (wrap App).
- Discovered during typecheck: @types/react / @types/react-dom were absent, so every React type resolved to implicit `any` (cmd#33 error surfaced it). Installed both; typecheck still 0 errors with real types (cmd#34). Logged as part of F-EXEC-006 closure.
- Verify cmd#35: 22/22 tests, typecheck 0. F-RELY-001 CLOSED.

### T-005 + T-009 — Save/Load/Export scenarios; replace alert()/console.error with banner + logger
- Files: services/scenarioStorage.ts (+), services/scenarioStorage.test.ts (+4), components/scenes/ScriptRiter/ScriptRiterScene.tsx (restore last-opened on mount, handleSave/handleNew/handleExport, NotificationBanner for import/AI errors, aria-labels, data-testid on nodes), ScriptRiterScene.test.tsx (+3), components/scenes/Gateway/Dashboard.tsx (alert → banner), services/geminiService.ts (console.* → logger).
- Test-first: new scene tests written before wiring (Save button had no handler). Verify cmd#36: 29/29, typecheck 0; `git grep alert(` only matches orphan legacy files (removed in T-011).
- F-EXEC-002, F-DATA-002, F-OBS-001 CLOSED.

### T-006 — Tournament registration (local) + demo-data label
- Files: services/registrationStorage.ts (+), components/scenes/Lobby/TournamentBrowser.tsx (Register/withdraw wired, counts reflect registration, aria-pressed, demo-data label, banner), TournamentBrowser.test.tsx (+4).
- Test-first (tests target behaviour absent at baseline). Verify cmd#37: 33/33, typecheck 0. F-EXEC-003 CLOSED (with the explicit caveat that listings remain demo data until a backend exists).

### T-010 + T-011 + T-012 — honest badges; dead code & importmap cleanup; code-split
- T-010: DigitalIdCard footer now reads "Demo auth — no server verification" / "Local-only session". `git grep 'E2EE Active|Device Trust Verified'` → 0.
- T-011: removed components/{Dashboard,Header,AnimatedLogo,TournamentBrowser,ScenarioEditor}.tsx, components/icons/*, components/scenes/Nexus/ScenarioEditor.tsx (all orphans per cmd#11; exact duplicates/older iterations of live files). Scene stubs kept. Test libs removed from index.html importmap.
- T-012: App.tsx lazy-loads ScriptRiterScene behind Suspense.
- Verify cmd#38: build OK — main chunk 668.41 kB → 257.06 kB + 186.85 kB lazy chunk; 33/33 tests; typecheck 0; zero window.alert in src.
- F-SEC-003, F-QUAL-001, F-QUAL-003, F-RELY-003 CLOSED. F-SEC-004 partially mitigated (importmap trimmed; Tailwind CDN remains — backlog).

### T-013 + T-014 — CI, Dockerfile, .env.example, favicon; README rewrite
- Files: .github/workflows/ci.yml (npm ci --ignore-scripts → typecheck → vitest --coverage → key-less build → npm audit --audit-level=high), Dockerfile (node:22-alpine build stage runs typecheck+test+build; nginxinc/nginx-unprivileged:1.27-alpine runtime, uid 101, port 8080, /healthz), docker/nginx.conf, .dockerignore, .env.example, public/favicon.svg (+ index.html link), README.md (rewritten: quickstart, scripts, env table, journeys J1–J5 + status, architecture, security notes, limitations).
- cmd#39: all files present; build OK; dist/favicon.svg emitted; README greps pass. YAML parser not available in sandbox → workflow syntax UNVERIFIED by parser (hand-checked). Docker daemon not available → image build UNVERIFIED.
- cmd#40–#42: simulated CI steps locally: npm ci OK, typecheck 0, 33/33 tests, coverage 55.71 % lines (v8). Found 3 moderate dev-only advisories introduced by vitest 3.x (GHSA path traversal in @vitest/mocker dev server); upgraded to vitest 5.0.3 / coverage-v8 5.0.3 → npm audit total 0; all tests still pass.
- F-OPS-001, F-OPS-002, F-QUAL-004 CLOSED; F-SCOPE-001 CLOSED (scope now documented in README).

## Milestone close (M0+M1+M2) and Phase 8
- Post-remediation probe 5/5 [cmd#43]; after-score R=88.947 (A-), SUL=1.00, verdict CONDITIONAL GO [cmd#45]; spot-check 9/10 + 1 exit-code-only [cmd#47].
- Remaining: T-015, T-016, T-017 (human), T-018 (backlog). Termination: MAX AUTONOMOUS PROGRESS (GO blocked on J5 key + human decisions).
- cmd#49: push rejected — GitHub App lacks `workflows` permission for .github/workflows/ci.yml. Moved workflow to ci/github-workflow-ci.yml with activation instructions (no history rewrite). T-013 → DONE_PARTIAL.
