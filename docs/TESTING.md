# Testing and validation — v0.5.0 presentation handoff

## Run checks

Use Node.js 22 LTS, version 22.13 or newer. Install lockfile dependencies with `npm ci`.

| Command | Purpose |
|---|---|
| `npm run check:icons` | Reject frontend emojis |
| `npm run lint` | Lint active presentation and included verification code |
| `npm run typecheck` | TypeScript correctness |
| `npm test` | Presentation/contracts and explicitly superseded reference tests |
| `npm run build` | Next.js production compilation |
| `npm run check` | Combined icon, lint, type, unit/reference, and build checks |
| `npm run test:e2e` | Chromium journeys and configured axe scans |

Install Chromium first with `npx playwright install chromium`. The browser suite runs the production application via the checked-in Playwright server configuration; build first or run `npm run check`.

## Validation record — 2026-10-18

| Check | Observed result |
|---|---|
| Clean `npm ci` | Passed: 196 packages installed, 197 audited, zero known vulnerabilities reported at this install |
| Frontend icon policy | Passed in the final combined check |
| Lint | Passed in the final combined check |
| Typecheck | Passed in the final combined check |
| Production build | Passed in the final combined check |
| Unit and reference tests | 46 passed across 6 files: 19 active demo/shim tests and 27 superseded-reference tests |
| Chromium browser suite | 5 passed in 18.5 seconds after reference relocation |

The five observed browser tests cover:

1. Full seven-step fictional mission, validation, Skills Vault, JSON export, reopened evidence exclusion, reset, and no local/session storage.
2. Age-band switching without losing another stage's demo work; refresh clears work.
3. All five views at 1440px, 768px, and 390px, no horizontal overflow, visible buttons at least 44px high, and zero detected violations under the configured `wcag2a`, `wcag2aa`, and `wcag21aa` axe tags.
4. Keyboard skip-link focus and reset-dialog cancellation.
5. Protected HTTP routes returning no-store 503 despite forged identity headers.

The mission journey also scans all seven lab states with axe. Design review inspected actual learner/adult screenshots at desktop and mobile sizes. These checks do not establish full WCAG conformance, comprehensive keyboard/screenreader support, child usability, curriculum validity, or production safety.

## Reference tests and canonical backend limits

The completed TypeScript API/auth/SQL implementation and its tests are retained under [superseded reference](../reference/typescript-backend/README.md). Their results apply only to that reference implementation. They do not verify the canonical Python/FastAPI backend, SQLAlchemy repositories, or Alembic migration history.

Reference database smoke tests may exercise migrations, immutability, RLS, scoped roles, version-pinned attempts, and consent boundaries in an isolated PostgreSQL-compatible runtime. This does not demonstrate compatibility with the separate canonical schema, managed PostgreSQL deployment, backup readiness, or complete operational privacy.

The active Next.js API shim tests verify only that protected intake is unavailable and non-cacheable. They do not test real sessions, adult verification, child authorization, or persistence. Canonical Python tests must be run in that workstream and reported separately.

## Remaining verification

The final clean install and post-relocation checks passed as recorded above. Independent security review, manual screenreader testing, privacy operations, consent revocation, retention/erasure/restore drills, curriculum approval, and authorized pilot research remain open gates. Historical v0.4 tests were not rerun because its source ZIP was unavailable.

Use synthetic fixtures only. Free-text demo fields and local exports are not personal-information filters; never enter real child information.
