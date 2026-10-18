# Verification — EducationOS v0.6.0

Observed on 2026-10-18. Tested source is the isolated Python-first release, continuing the existing frontend. Historical v0.4 test claims were not rerun because the original source archive remains unavailable.

| Check | Observed result |
|---|---|
| Python dependencies from verified PyPI metadata and uv lock | Installed successfully; Python 3.13.3, uv 0.10.11 |
| Backend Ruff | Passed |
| Python tests | 34 passed, 1 skipped locally |
| Real PostgreSQL/pgvector/RLS/migration integration | Skipped locally: no Docker/PostgreSQL service; committed GitHub CI runs it with three restricted roles and disposable `_test` database |
| Offline Alembic upgrade/downgrade SQL | Passed; does not prove live PostgreSQL execution |
| Exported FastAPI OpenAPI drift | Passed |
| Python wheel installed outside checkout | Passed; all five bundled missions load |
| Actual MCP stdio initialization/list/call | Passed |
| Frontend generated types, typecheck, lint, no-emoji and unit tests | Passed; 20 unit tests |
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

Browser tests cover the current `/demo` experience, stage/draft isolation, seven steps, validation, portfolio export/clear, offline/malformed curriculum/retry, responsive pages and automated axe checks. Automated accessibility complements but does not replace manual screenreader, keyboard and supervised usability review.

Before staging promotion, inspect live PostgreSQL/container CI results, then rehearse backup/restore, operational telemetry and provider integration. Real enrollment, external guardian verification, complete erasure/retention operations, curriculum approval and independent security review remain gates.
