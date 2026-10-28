# v0.6.0 QA — 28 October 2026

This report records executed checks for the adult-studio milestone, not production readiness. Source baseline: GitHub `codex/marketing-v2-i18n` at `a60895c7fbd866e8bb05e946b6e821de3fa5a401`. The specifically named v0.5 Python ZIP is unavailable locally; available v0.5 artifacts and the later committed Python implementation provide continuity. The original dirty checkout and synced sources were untouched.

| Check | Observed result |
|---|---|
| Clean locked Python installation | `uv sync --frozen`, Python 3.13.3, 71 packages installed |
| Backend unit/API/auth/database suite | **74 passed**, zero skipped with disposable PG/Redis URLs |
| Real database | PostgreSQL 16.15, pgvector 0.8.0, Redis 8.0.0 on loopback-only isolated ports |
| Migration execution | base → 0001 → 0002; 0002/base rollback and upgrade rehearsal passed |
| Schema drift | Alembic metadata comparison returned no differences |
| Permissions/history | Restricted app/worker roles, legacy learner RLS and immutable published/history/audit checks passed |
| Races | Independent-session concurrent edits, reviewer approvals and consent acknowledgement passed |
| Backend lint and OpenAPI drift | Passed |
| Python wheel | Built; unpacked outside checkout, imported app and confirmed studio API + five bundled missions |
| Browser dependency install | `npm ci`, 354 packages installed |
| Frontend lint, types, generated API types, no-emoji policy | Passed |
| Frontend unit tests | **141 passed** |
| Production frontend build | Passed, 46 generated routes/pages including studio |
| Full Chromium regression | **80 passed** including learner lab, portfolio, portal, marketing and six studio checks |
| Real full-stack Chromium acceptance | **1 passed**, no API mocks: educator → reviewer publication → guardian acknowledgement/revocation, Python + real PG/Redis |
| Final targeted studio rerun | 6 UI/proxy checks + real full-stack check passed after origin hardening |
| Accessibility | Automated desktop/mobile studio scans: no detected WCAG A/AA violations or horizontal overflow; broader existing regression also passed |
| Runtime dependency security | npm production audit: 0 findings; pip-audit after patch: no known vulnerabilities |
| Sensitive-file check | Changed/new source pattern scan passed; no credentials, private founder documents, database or synced sources added |
| Local Docker image/Compose execution | Not run: this host has no Docker executable; CI contains full container smoke and real browser acceptance |

The inherited Python lock had certifi 2026.7.22. pip-audit identified advisory PYSEC-2026-4320/GHSA-6q48-6c7w-9gw2; the lock now uses certifi 2026.10.23 and the repeated audit is clear. Raw runtime audit summaries are in `docs/qa/v0.6.0-*-audit.json`. Audit databases change; passing today is not a security certification. No unrelated dependency upgrade was made.

Browser role-view/form tests use mocked API responses for deterministic UX assertions. The separate `tests/e2e/studio-live.spec.ts` uses actual cookies, CSRF, Python authentication, restricted PostgreSQL credentials and Redis. It is opt-in with `STUDIO_LIVE_E2E=1` and random provisioned synthetic credentials. CI's Compose job provisions disposable adults and runs it automatically; default standalone browser tests skip that one integration test unless configured. No real child or founder identity was used. Screenshots from local tests are kept outside version control in `artifacts/studio-*.png`; the live editor screenshot is `artifacts/studio-live-editor.png`.

A first wheel-smoke probe used an obsolete route-inspection assumption; it was corrected to inspect the generated OpenAPI and resolve macOS temporary-directory aliases. The final smoke confirms import from the unpacked wheel, not the editable checkout. The full browser run exercised the existing lab's labeled offline-catalog fallback while the default API port was absent; the separate studio run used a healthy real API.

## Reproduce

```sh
cd backend
uv sync --frozen
uv run --frozen ruff check src tests alembic
# Supply explicit disposable *_test ADMIN/APP/WORKER PostgreSQL and Redis URLs
uv run --frozen pytest -q
uv run --frozen python -m educationos.export_openapi --check
uv build --wheel
cd ..
npm ci
npm run check
npx playwright install chromium
npm run test:e2e
```

The destructive database test refuses non-`*_test` database names. Without all three explicit database URLs it skips rather than claiming a pass. Hosted staging must repeat against the pinned PostgreSQL 18 container/managed service and verify its TLS, backups and rollback. Local PG16 coverage is real but does not by itself prove the PG18 Docker image.

## Delivery and live boundaries

GitHub App branch creation was rechecked and still returned HTTP403. The existing local Git connection's dry-run accepted the review branch; actual published commit/PR links are provided in the handoff only after verified creation. Remote CI is reported separately and must not be inferred from these local results.

DNS/HTTP observations: apex A 69.46.46.105; no AAAA answer; registrar-servers nameservers; HTTPS200 with Railway headers and HTTP301 to HTTPS. This confirms an existing frontend, not a deployment of this milestone. No DNS records, production service or hosted database were modified in this work.

Production adult endpoints remain503; real child registration and learner AI remain closed. Adult attestation does not prove age/identity. Guardian acknowledgement remains pending verification or revoked and never enables children. Moderation is a conservative heuristic plus human review, with no guarantee of complete PII or hazard detection. Public approved snapshots deliberately omit author, tenant and audit fields. Retraction, verified identity/MFA, privacy/consent legal review, operational retention/deletion, abuse review, backup restore, independent security assessment and safeguarding sign-off remain required before real learner use. See the prioritized v0.7 roadmap.
