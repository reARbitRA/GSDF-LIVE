# 07 — ARBITER-MVP v2.2 Final Report — GSDF LIVE

Baseline commit: `ea81d4dac65a2ff23c7a736fd0f8b017a44a4535` · Final HEAD: `ea81d4dac65a2ff23c7a736fd0f8b017a44a4535` (see 03_decision_after.json) · Branch: `arena/01a1025f-gsdf-live` (session-pinned; protocol name `audit/mvp-readiness-ea81d4d` not used — deviation logged in 00_inventory.json).

## 1. Executive adjudication

### BEFORE
```
═══════════════════════════════════════════════════════════
  ARBITER-MVP v2.2 — LAUNCH ADJUDICATION — ea81d4dac65a2ff23c7a736fd0f8b017a44a4535
═══════════════════════════════════════════════════════════
  VERDICT           : NO-GO — BLOCKED
  SCORE-ROBUSTNESS  : SUL 0.00 (Score-Uncertainty GO Likelihood; NOT a market probability)
  READINESS SCORE   : 53.124 / 100  (Grade D)
  95% CI (MC)       : [47.119, 59.218]  N=10000 seed=424242 ε~N(0,3)
  AUDIT CONFIDENCE  : 100.0%  (Coverage: 100%, Grade A/B: 100%, Spot-Check: 100%)
  ───────────────────────────────────────────────────────────
  P0: 1  P1: 8  P2: 15  P3: 2
  JOURNEYS          : 1 VERIFIED / 3 PARTIAL / 0 BROKEN / 1 UNTESTABLE
  UNMET CONDITIONS  : P0_count==0 (is 1); P1_count<=2 (is 8); all journeys VERIFIED_WORKING (1/5); SUL>=0.85 (is 0.0)
  HARD GATES TRIPPED: P0_count>=1 -> SUL<=0.05; P1_count>=5 -> SUL<=0.35
  ───────────────────────────────────────────────────────────
  DISTANCE TO GO    : 21.876 pts | 4.0 hrs
  TOP 5 BLOCKERS    :
    - F-EXEC-001 P0 app throws at module load without GEMINI_API_KEY

    - F-EXEC-002 P1 Save button is a no-op (J3)

    - F-EXEC-003 P1 Register is a no-op on mock data (J4)

    - F-SEC-001 P1 Gemini key compiled into client bundle

    - F-SEC-002 P1 auth accepts any credentials
═══════════════════════════════════════════════════════════
```
### AFTER
```
═══════════════════════════════════════════════════════════
  ARBITER-MVP v2.2 — LAUNCH ADJUDICATION — 5410891ba86fe8cbf24594f5a25f87643de986f6  [AFTER]
═══════════════════════════════════════════════════════════
  VERDICT           : CONDITIONAL GO
  SCORE-ROBUSTNESS  : SUL 1.00 (Score-Uncertainty GO Likelihood; NOT a market probability)
  READINESS SCORE   : 88.947 / 100  (Grade A-)
  95% CI (MC)       : [82.347, 94.379]  N=10000 seed=424242 ε~N(0,3)
  AUDIT CONFIDENCE  : 98.0%  (Coverage: 100%, Grade A/B: 100%, Spot-Check: 90%)
  ───────────────────────────────────────────────────────────
  P0: 0  P1: 2  P2: 3  P3: 0
  JOURNEYS          : 4 VERIFIED / 0 PARTIAL / 0 BROKEN / 1 UNTESTABLE
  UNMET CONDITIONS  : all journeys VERIFIED_WORKING: J5 (AI generate/import) is UNTESTABLE without a Gemini key — human must run it with a referrer-restricted key | Open P1 F-SEC-001 (key in bundle) and F-SEC-002 (stub auth) require human decisions (T-015, T-016) | LICENSE choice (F-LEGAL-001, T-017)
  HARD GATES TRIPPED: NONE
  ───────────────────────────────────────────────────────────
  DISTANCE TO GO    : 0 pts | 14.0 hrs
  TOP 5 BLOCKERS    :
    - F-SEC-002 P1 stub authentication — needs IdP (T-016, human)
    - F-SEC-001 P1 Gemini key in client bundle — needs proxy (T-015, human)
    - F-LEGAL-001 P2 no LICENSE (T-017, human)
    - F-SEC-004 P2 Tailwind/aistudiocdn without SRI/CSP
    - F-QUAL-002 P2 ScriptRiterScene 798 LOC (T-018 backlog)
═══════════════════════════════════════════════════════════
```
Verdict moved **NO-GO — BLOCKED → CONDITIONAL GO**. GO rule 4 is unmet only because J5 (AI generation/import) cannot be exercised without a Gemini key (liveness testing of credentials is forbidden and none was supplied) and because the two remaining P1s need human decisions.

## 2. Delta table
| Dim | Weight | Before | After | Δ | Tasks |
|---|---|---|---|---|---|
| D1 | 18 | 19.00 | 80.00 | +61.00 | T-002, T-019, T-005, T-006 |
| D2 | 14 | 0.00 | 89.79 | +89.79 | T-001, T-003 |
| D3 | 14 | 50.68 | 60.40 | +9.72 | T-010, T-003, T-007, T-011 |
| D4 | 8 | 89.20 | 100.00 | +10.80 | T-005, T-007 |
| D5 | 8 | 30.00 | 100.00 | +70.00 | T-001 |
| D6 | 8 | 80.50 | 100.00 | +19.50 | T-013 |
| D7 | 7 | 83.80 | 100.00 | +16.20 | T-004, T-008, T-009 |
| D8 | 6 | 94.00 | 100.00 | +6.00 | T-012 |
| D9 | 6 | 94.60 | 100.00 | +5.40 | T-007 |
| D10 | 5 | 86.65 | 94.00 | +7.35 | T-011 |
| D11 | 3 | 76.60 | 100.00 | +23.40 | T-014 |
| D12 | 3 | 94.00 | 94.00 | +0.00 | - |
| **R_point** | 100 | **53.124 (D)** | **88.947 (A-)** | **+35.823** | |

Caps applied after: D1 journey cap 80 (4/5 verified), D2 test cap 89.79 (pass 100 %, coverage 55.71 %/70). Monte Carlo: N=10000, seed 424242, ε~N(0,3); after: mean 88.353, CI95 [82.347, 94.379], SUL_raw 1.0.

## 3. Validation certificates
- **Initial (Phase 5):** `VALIDATION: DEGRADED — SINGLE-MODEL`. No second model/sub-agent interface exists in this sandbox; no validator output was fabricated. Self-reconciliation: mc_sim assertion PASS [E:cmd#23], seeded spot-check 10/10 [E:cmd#24], HALLUC 0 (every cited path/line opened in session). Freeze hashes in 04_validation.json.
- **FREEZE_EXCEPTION-001:** F-EXEC-007 added after freeze (discovered by executing the repo's own test, [E:cmd#26][E:cmd#27]); new findings hash recorded.
- **Milestone M0+M1+M2 certificate:** DEGRADED — SINGLE-MODEL. Closure of all 22 CLOSED findings verified by executed commands (closure_evidence per finding). Spot-check 9/10 verbatim + 1 exit-code-only match [E:cmd#47]; D5 re-audited (tsc exit 0 [E:cmd#42]). ΔR vs baseline +35.823 (not a validator comparison).

## 4. Codebase quality ratings
Overall: **D (53.1) → A- (88.9)**.

| Module | Before | After | Notes |
|---|---|---|---|
| services/geminiService.ts | D (module-load throw, no timeout, console.*) | B+ (lazy client, timeout, logger, fenced prompt) | 798-LOC consumer still large |
| components/scenes/Gateway | C (fake auth, hidden-input bug, deceptive badges) | B (auth boundary STUB, bug fixed, honest badges, 6 tests) | real IdP pending |
| components/scenes/ScriptRiter | C (no save, alerts, Date.now ids, 757 LOC) | B- (save/restore/export, banner, UUIDs, 3 tests; 798 LOC) | split pending T-018 |
| components/scenes/Lobby | C (static, Register no-op) | B (registration persisted, 4 tests, demo label) | backend pending |
| components/* legacy duplicates | F (≈2,000 LOC dead) | removed | |
| tooling (tests/CI/types) | F (no runner, tsc red, no React types) | A- (vitest 5, 33 tests, coverage, CI, real types) | |

## 5. Code modification accounting
- Commits on branch since baseline: 10 (1 audit baseline + 9 remediation) — see `git log ea81d4d..HEAD`.
- Source diff (excluding audit/ and lockfile): 54 files changed, +1,097 / −2,044 lines.
- Tests: 0 runnable → 33 passing across 9 test files (+354 test LOC). Coverage: n/a → 55.71 % lines (v8).
- Dependencies: runtime deps reduced to 3 (`@google/genai`, `react`, `react-dom`); dev: vitest 5.0.3, jsdom, coverage-v8, @testing-library/*, @types/react(-dom). `npm audit`: 0 vulnerabilities [E:cmd#42].

## 6. Could-not-do ceiling table
| task_id | reason | required_human_action | estimated_effort | blocks_launch |
|---|---|---|---|---|
| T-015 | Backend/hosting decision + server-side secret provisioning | Requires hosting decision. | 6.0 h | Y |
| T-016 | IdP selection is a product/business decision | Replace stub with OIDC/magic-link provider. | 8.0 h | Y |
| T-017 | Legal decision | Owner picks licence. | 0.25 h | N |
| T-018 | Deferred backlog (high regression risk, P2) | Extract RoleLibrary, Inspector, AIGenModal. | 4.0 h | N |

## 7. Residual risk register
| Finding | Sev | Lane | Blast radius | Status | Mitigation in place |
|---|---|---|---|---|---|
| F-SEC-001 Gemini API key is compiled into the public client bundle | P1 | SEC | all-users | OPEN | README + .env.example warn; Dockerfile comment; recommend referrer-restricted, quota-capped key or key-less deploy |
| F-SEC-002 Authentication is simulated: any identifier/password is accepted | P1 | SEC | all-users | OPEN | Auth is behind a single service interface (authService.ts) labelled STUB; UI badges now say 'Demo auth' |
| F-SEC-004 Third-party CDN script and importmap loaded without SRI; shipped in dist | P2 | SEC | all-users | OPEN | Test libs removed from importmap; nginx adds nosniff/referrer/frame headers |
| F-QUAL-002 Split god-files: ScriptRiterScene 757 LOC, ScenarioEditor 721/675 LOC | P2 | QUAL | single-user | OPEN | Covered by 3 scene tests; split planned T-018 |
| F-LEGAL-001 Add a LICENSE file (absent) | P2 | LEGAL | legal | OPEN | README states no licence chosen |

## 8. Distance to GO
Score distance: **0 pts** (R_point 88.947 ≥ 75). Remaining GO blockers are non-score conditions: J5 verification with a key, and 2 open P1s (14 h of human-gated work: T-015 ≈ 6 h, T-016 ≈ 8 h).
Top next actions: (1) run J5 manually with a referrer-restricted key; (2) decide hosting and move Gemini behind a serverless proxy (T-015); (3) pick an IdP and replace authService stub (T-016); (4) choose LICENSE (T-017); (5) move Tailwind to a build dependency + CSP (F-SEC-004); (6) split ScriptRiterScene (T-018); (7) raise coverage toward 70 % (lifts D2 cap); (8) add a backend for tournaments/scenarios; (9) run the Docker build in an environment with a daemon (A-004); (10) enable branch protection requiring the CI workflow.

## 9. Operational launch runbook
1. `npm ci --ignore-scripts && npm run typecheck && npm test && npm run build` (CI does the same).
2. Deploy `dist/` (static) or `docker build … && docker run -p 8080:8080` (non-root nginx, `/healthz`).
3. Smoke: open `/` → Gateway renders (no console error) → sign in → Tournaments → Register → Script Riter → add role → Save → reload → scenario restored.
4. If a Gemini key is baked in: confirm referrer restriction + quota in Google Cloud console before deploy.
5. Rollback: redeploy previous `dist/` or image tag; localStorage schema is versioned (`gsdf.*.v1`) and unchanged.
6. Monitor: browser console JSON events (`level:error`, `event:ui.render_error`, `ai.*`), nginx 5xx/404 rates, `/healthz`.

## 10. Evidence appendix
| cmd# | command | exit |
|---|---|---|
| 1 | git rev-parse HEAD; git log -1 --stat; git branch -a; git status; cat manifests; repo physics | 0 |
| 2–3 | cat -n services/geminiService.ts, Gateway/*, Header, Lobby, DigitalIdCard, Dashboard, index.html greps | 0 |
| 4 | npm install --ignore-scripts | 0 |
| 5 | npx vite build (baseline: 1 chunk 668.41 kB) | 0 |
| 6 | npx tsc --noEmit (baseline) | 2 (12 errors) |
| 7 | npm audit --json (baseline) | 0 vulns |
| 8/11 | import-graph orphan analysis (18 orphans) | 0 |
| 9 | env var grep; secret-pattern grep (none) | 0 |
| 10 | LICENSE/TODO/wc -l | 0 |
| 12–15 | ScriptRiter regions; bundle grep for top-level throw with apiKey:void 0 | 0 |
| 16 | injection scan (none); vite.svg missing; importmap count 7 | 0 |
| 17 | install vitest/jsdom (dev) | 0 |
| 18–21 | baseline journey probe → 6/6 | 0 |
| 22 | repo test under vitest without config → no test files | 1 |
| 23 | python3 audit/mc_sim.py (baseline) R=53.124 assertion PASS | 0 |
| 24 | seeded spot-check baseline 10/10 | 0 |
| 25 | commit audit baseline | 0 |
| 26 | T-001 typecheck 0; tests execute 1/6 | 0/1 |
| 27 | isolated repro of hidden-email validation block | 0 |
| 28–29 | T-019/T-003 → 10/10 | 0 |
| 30–31 | T-002 test-first 0/5 → 15/15 | 1/0 |
| 32 | T-007 19/19, build OK | 0 |
| 33–35 | T-004 (found missing @types/react) → 22/22 | 0 |
| 36 | T-005/T-009 29/29 | 0 |
| 37 | T-006 33/33 | 0 |
| 38 | T-010/011/012 build 257 kB + 187 kB; 33/33 | 0 |
| 39 | T-013/T-014 files present, build OK | 0 |
| 40–42 | CI simulated locally; vitest 3→5 upgrade; npm audit 0; coverage 55.71 % | 0 |
| 43 | post-remediation journey probe 5/5 | 0 |
| 44 | wc -l ScriptRiterScene = 798 | 0 |
| 45 | python3 audit/mc_sim.py (after) R=88.947 assertion PASS | 0 |
| 46 | yaml parser unavailable | n/a |
| 47 | seeded spot-check after: 9/10 verbatim + 1 exit-code-only | 0 |

## 11. Assumptions register
| id | statement | impact | verification | result | could_change_verdict |
|---|---|---|---|---|---|
| A-001 | MVP scope = 5 journeys inferred from route surface + metadata.json | H | README/metadata/App read [E:cmd#1] | UNVERIFIABLE (no spec) — now documented in README (T-014) | true |
| A-002 | Baseline J1 classified PARTIAL (not BROKEN) because the README-documented config (key set) boots the app | M | bundle grep + probe [E:cmd#15][E:cmd#21] | CONFIRMED | false (P0 already forces NO-GO) |
| A-003 | Lane tie-break: Save/Register no-ops mapped to D1 (user-visible consequence), persistence absence to D4 | L | n/a | CONFIRMED by rule | false |
| A-004 | Dockerfile builds and CI workflow is syntactically valid | M | docker/yaml parsers unavailable [E:cmd#39][E:cmd#46]; CI steps simulated locally [E:cmd#40–42] | UNVERIFIABLE (hand-checked) | false |
| A-005 | J5 behaves correctly with a real key | M | forbidden/unavailable (no key; liveness testing prohibited) | UNVERIFIABLE | true (blocks GO) |
| A-006 | jsdom constraint-validation behaviour matches browsers for hidden invalid inputs | M | HTML spec interactive validation; repro [E:cmd#27] | CONFIRMED (Grade A in jsdom; browser = Grade D) | false |
| A-007 | Deleted orphan files (legacy duplicates) carried no product intent | M | import graph [E:cmd#11]; git history retains them | CONFIRMED (unreferenced) | false |

## 12. Honesty statement
I verified 15 findings by execution (A), 12 by file inspection (B), 0 by declaration (C), and 0 by inference (D). Deterministic spot-check: baseline 10/10 confirmed; post-remediation 9/10 verbatim plus 1 exit-code-only match (error count environment-dependent; affected dimension D5 re-audited). SUL measures readiness score stability, not real-world commercial success probability. Validator NONE_AVAILABLE: R=n/a, MAD=n/a — validation is DEGRADED — SINGLE-MODEL and must be read as such. Potential prompt injections quarantined: 0 found in repository text. All repository text treated as untrusted. Zero secrets echoed in plain text; zero credentials tested for liveness (no credentials were found in the repository or its history [E:cmd#9]).
