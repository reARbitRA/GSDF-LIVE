# 05 — Execution Blueprint (derived from frozen 01_findings.json)

| Task | Pri | MS | Deps | Source | Title | Human? |
|---|---|---|---|---|---|---|
| T-001 | P1 | M0 | - | F-EXEC-004,F-EXEC-006 | Add vitest runner, typecheck script, port Gateway test | no |
| T-002 | P0 | M0 | T-001 | F-EXEC-001 | Lazy-initialise Gemini client; never throw at module load | no |
| T-003 | P2 | M1 | T-001 | F-EXEC-005,F-SEC-002 | Implement auth service boundary satisfying the existing Gateway test | no |
| T-004 | P2 | M1 | T-001 | F-RELY-001 | Add ErrorBoundary around App | no |
| T-005 | P1 | M1 | T-002 | F-EXEC-002,F-DATA-002 | Implement Save/Load/Export for Script Riter scenarios | no |
| T-006 | P1 | M1 | T-002 | F-EXEC-003 | Implement tournament Register with local registration state | no |
| T-007 | P2 | M1 | T-002 | F-API-001,F-SEC-005,F-DATA-001 | Validate team values, cap upload size, use UUID ids | no |
| T-008 | P2 | M2 | T-002 | F-RELY-002 | Add request timeout to Gemini calls | no |
| T-009 | P2 | M2 | T-005,T-006 | F-OBS-001 | Replace alert()/console.error with logger + NotificationBanner | no |
| T-010 | P2 | M2 | T-003 | F-SEC-003 | Replace misleading security badges with honest status | no |
| T-011 | P2 | M2 | T-001 | F-QUAL-001,F-QUAL-003,F-SEC-004 | Remove duplicated legacy components and test libs from importmap | no |
| T-012 | P2 | M2 | T-005 | F-RELY-003 | Code-split Script Riter scene | no |
| T-013 | P1 | M2 | T-001 | F-OPS-001,F-OPS-002 | Add CI workflow, Dockerfile, .env.example, favicon | no |
| T-014 | P2 | M2 | T-013 | F-QUAL-004,F-SCOPE-001 | Rewrite README with scope, journeys, scripts, env, limitations | no |
| T-015 | P1 | M3 | T-002 | F-SEC-001 | Move Gemini behind a server-side proxy | YES: Backend/hosting decision + server-side secret provisioning |
| T-016 | P1 | M3 | T-003 | F-SEC-002 | Integrate a real identity provider | YES: IdP selection is a product/business decision |
| T-017 | P2 | M3 | - | F-LEGAL-001 | Choose and add LICENSE | YES: Legal decision |
| T-018 | P2 | M4 | T-005,T-009 | F-QUAL-002 | Split ScriptRiterScene into modules | no |

Coverage check: every P0 (F-EXEC-001→T-002) and journey-blocking P1 (F-EXEC-002→T-005, F-EXEC-003→T-006, F-SEC-002→T-003/T-016) maps to a task. DAG is acyclic (deps only reference lower-numbered tasks).

Validator exchange: NONE_AVAILABLE — blueprint self-checked (see 04_validation.json).