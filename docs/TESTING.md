# Verification — EducationOS v0.6.0

Observed on 2026-10-18. Tested source is the isolated Python-first release, continuing the existing frontend. Historical v0.4 test claims were not rerun because the original source archive remains unavailable.

## Portal navigation and resume — 2026-10-18

The UI follow-up passed lint, TypeScript, icon policy, a production build, **129 unit tests** and **33 browser tests**. New coverage checks meaningful unfinished work across every activity type and lab; zero observations and changed/cleared models; recorded-work exclusion; actual return to saved lab answers; and Revisit activity for finished paths.

At 320px, 390px and 430px the persistent mobile navigation is visible and receives taps during a long lab. Lab step links focus visible headings below the sticky shortcuts. Gated sections unlock after prediction and relock after a changed cube preset. Moving between sections preserves answers. New light/dark mobile accessibility scans pass with zero detected violations. The full existing public/demo/portal/lab browser suite also passed. These are Chromium viewport/touch checks, not physical-device verification.

## Hosted deployment verification — 2026-10-18

The portal and unchanged marketing content were deployed to isolated Railway services at `app.educationos.space` and `educationos.space`. Both builds succeeded; all three custom hostnames (including `www`) have verified ownership and valid certificates.

- Six complete mobile learning journeys passed on the actual app hostname at 390×844 and 430×932; 12 light/dark accessibility scans found zero violations, with no horizontal overflow, browser errors, failed assets or remote writes.
- Actual user Chrome separately completed the three live classes at 390px and checked all saved records/layouts at 430px, without DNS or TLS overrides.
- Live marketing identity, `www` canonical redirect, public-to-app learner redirect, app-to-public privacy redirect, portal noindex/robots and absent app sitemap passed. Mail forwarding records were unchanged.
- Public-only routing passed the local typecheck/lint and all 123 unit tests. The earlier 27 local browser tests remain the pre-deployment record; the new live suite is separate.

The headless test process selected fresh public DNS answers because its system resolver retained earlier results; TLS validation remained enabled. The earlier mobile report's pre-cutover marketing timeout was resolved in the later live host-separation checks. Tests used browser viewport/touch emulation, not physical phones. Full scope and durable evidence: [deployment status](DEPLOYMENT_STATUS.md), [live summary](deployment/live-2026-10-18.json).

## Anatomy discovery labs — 2026-10-18

Implemented Loop Loom, Same Half Different Shape, and Hidden Cube Builder in the learner portal. This section records checks before deployment; the hosted verification above is the current release record. These results supersede frontend totals in the earlier sections; backend source was unchanged.

| Check | Observed result |
|---|---|
| TypeScript, ESLint, icon policy, production webpack build | Passed |
| Unit tests | 115 passed across 10 files; includes exact lesson models, interpreter equivalence, rotation/count invariants, saved-state migration, draft isolation and completion invalidation |
| Browser tests | 27 passed across six files; includes all 11 earlier public/demo/portal journeys plus the three discovery labs and integration checks |
| Learning flows | Wrong initial predictions accepted; observation and new-example checks required; 0–6 repeat boundaries; twelve-cell selection/rearrangement; all four cube presets; restore, edited-work invalidation and reflection |
| Fallbacks and controls | 390px and desktop; keyboard cell selection and native controls; reduced motion; disabled canvas/WebGL; 2D/3D switching; intentionally blocked turning-runtime chunk returns to usable layers; all three native paper examples work without JavaScript |
| Automated accessibility | Earlier selected WCAG scans plus new light/dark mobile lab scans passed without detected violations; cube diagrams' invalid generic-element label was corrected before the final run |
| Source/geometry | Pinned MIT Anatomy source and license retained. Four strict builds at 73 yaw poses passed; actual projected cube paths change during turning; layer counts remain correct; returning to 2D removes the controller |
| Performance observation | Default 12-part cube sampled at 720 half-degree yaw positions in desktop Chromium: no forced/unseparated ordering, controller.set p95 about0.20ms. Excludes layout/paint, network, phone throttling and total route load; see detailed runtime evidence |
| Data and host boundaries | Lab records appear in the notebook and export, cancel/clear works and preserves a saved original-demo draft. Real app Host requests for collection and all three classes use clean paths/noindex. Public marketing home and original demo journeys passed |
| Visual review | Inspected actual collection, loom and cube desktop models and mobile fraction grid; ignored screenshots at `artifacts/discovery-labs-desktop.png`, `loop-loom-desktop.png`, `hidden-cubes-desktop.png`, `same-half-mobile.png`, `hidden-cubes-mobile-dark.png` |
| Deployment | Source preparation only. No DNS, certificate, hosting or enrollment change |

The first pass found a streamed-component boundary hiding a native no-JavaScript example; the thin lesson components now render synchronously and only the optional cube enhancement is lazy. Full upstream orbit/fidelity verification was not completed, and desktop geometry timings do not establish phone performance. Automated checks do not replace supervised child usability, curriculum or manual screenreader review. See [implementation notes](anatomy/IMPLEMENTATION.md), [strict build evidence](anatomy/cube-build-evidence.json) and [runtime evidence](anatomy/cube-runtime-evidence.json).

## Learner portal addition — 2026-10-18

The portal frontend was verified after adding 15 starter activities and host separation, before the later discovery labs and hosting cutover. No backend source or generated API contract changed.

| Check | Observed result |
|---|---|
| TypeScript, ESLint, frontend icon policy | Passed |
| Unit tests | 75 passed across 6 files, including runner bounds, state recovery, escaped-data round trips, completion invalidation and host routing |
| Generated API contract drift | Passed against the existing Python OpenAPI schema |
| Production webpack build | Passed; portal and existing public/demo routes included |
| Browser tests | 11 passed: 4 existing public/demo journeys and 7 portal journeys |
| Responsive layouts | Existing public/demo routes and all 20 portal pages fit at 1440px and 390px; mobile activity panels checked for all 15 lessons |
| Automated accessibility | Existing 24 route/viewport scans plus portal desktop code, mobile choice and dark progress scans found no violations under the selected WCAG 2/2.1 A/AA rules |
| Visual review | Inspected desktop home/code workspace and mobile coding workspace; screenshots in ignored `artifacts/portal-*.png` |
| App/public boundary | Real HTTP requests with the app Host serve portal HTML/clean links; privacy redirects to public origin; app robots disallows crawling and app sitemap returns 404; public Host keeps marketing HTML |
| Local learning data | Coding, choice, writing and experiment recording, reload, reflection, export and reset/cancel passed; observed no portal API mutation requests |
| DNS/hosting | Prepared only; no records, certificate or deployment changed |

The first browser pass exposed a loopback-origin rewrite/header-loss bug and a brief contrast failure during theme transitions. Both were corrected before the passing run. Review also found a potential escaped-draft storage overflow; serialization now fails explicitly instead of replacing work with empty state, with a regression test.

These results do not establish supervised child usability, screenreader conformance, age-adapted portal curricula, or production account readiness. The starter practice language is bounded and is not a general-purpose Python/JavaScript sandbox. The following table retains the earlier Python-first release's verification record.

| Check | Observed result |
|---|---|
| Python dependencies from verified PyPI metadata and uv lock | Installed successfully; Python 3.13.3, uv 0.10.11 |
| Backend Ruff | Passed |
| Python tests | 35 passed, 1 skipped locally |
| Real PostgreSQL/pgvector/RLS/migration integration | Passed in the first remote run with real services, including RLS/migrations/worker; skipped locally because Docker/PostgreSQL is unavailable. Final complete CI status is on PR #2 |
| Offline Alembic upgrade/downgrade SQL | Passed; does not prove live PostgreSQL execution |
| Exported FastAPI OpenAPI drift | Passed |
| Python wheel installed outside checkout | Passed; all five bundled missions load |
| Actual MCP stdio initialization/list/call | Passed |
| Frontend generated types, typecheck, lint, no-emoji and unit tests | Passed; 11 active unit tests; earlier unmounted interface/tests archived as reference |
| Production frontend build | Passed with supported webpack builder; local Turbopack process binding was restricted |
| Full npm dependency audit | Zero reported vulnerabilities, including development packages, after replacing the affected lint-config dependency chain |
| Browser journeys/accessibility | Passed 4/4 browser tests, including 24 route/viewport axe scans at 1440/390 with no detected violations or overflow |
| Live browser against Python | Confirmed published lesson status and age-adapted Explorers mission through actual Next proxy/FastAPI |
| Local FastAPI HTTP smoke | Liveness/catalog 200; protected writes without identity 401; enrollment/AI 503; readiness 503 without services |
| OCI image digests | Verified against public registry; timestamps in infra/images.json |
| Compose and CI YAML | Parsed; actual full-stack checks run in GitHub CI (Docker unavailable locally) |
| Deployment/domain/DNS | No hosting deployment or domain change performed |

See [backend verification](../backend/VERIFICATION.md) and [frontend verification](FRONTEND.md) for executed commands and scope. The draft PR's checks are the authoritative remote PostgreSQL/container CI status. Local SQLite tests cannot establish PostgreSQL row policies, vector extension behavior, locks or role grants.

## Reproduce

From the repository root:

```sh
cd backend
uv sync --frozen
uv run --frozen ruff check .
uv run --frozen pytest -v
uv run --frozen python -m educationos.export_openapi --check
cd ..
npm ci
npm run check
npx playwright install chromium
npm run test:e2e
```

For actual PostgreSQL integration, create a disposable database whose name ends in `_test`, create the restricted roles from the reviewed init script with that database's CONNECT grant, and export `EDUCATIONOS_TEST_DATABASE_URL`, `EDUCATIONOS_TEST_APP_DATABASE_URL`, `EDUCATIONOS_TEST_WORKER_DATABASE_URL` plus `EDUCATIONOS_TEST_REDIS_URL`. The integration test upgrades/downgrades its schema and must never point at a valuable database. The CI workflow supplies isolated services and runs this test.

The Python tests cover sessions/revocation, tenant/learner/guardian/consent boundaries, publication digest and age checks, evidence ownership/expiry, complete TRIZ evidence requirements, bounded input, safe errors, Redis failure, closed enrollment/AI, citation spans, prompt digests, retrieval adversarial fixtures, maintenance jobs and actual MCP exchange. They do not measure learning efficacy, live-model quality, verified adult identity or regulatory compliance.

Browser tests cover the original `/demo` experience, stage/draft isolation, seven steps, validation, portfolio export/clear, offline/malformed curriculum/retry, the new portal's subject selection and activity workflows, local draft recovery, work export/clear, app/public isolation, responsive pages and automated axe checks. Automated accessibility complements but does not replace manual screenreader, keyboard and supervised usability review.

Before staging promotion, inspect live PostgreSQL/container CI results, then rehearse backup/restore, operational telemetry and provider integration. Real enrollment, external guardian verification, complete erasure/retention operations, curriculum approval and independent security review remain gates.
