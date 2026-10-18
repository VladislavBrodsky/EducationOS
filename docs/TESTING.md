# Testing and verification

Use the committed dependency lockfile. Node.js must satisfy `package.json` (22.12 or newer); the checked-in CI targets Node.js 22. The actual local runtime and command results are recorded in [QA.md](QA.md).

| Command | Purpose |
| --- | --- |
| `npm ci` | Reproducible dependency installation and Prisma Client generation |
| `npm run db:validate` | Validate the pinned Prisma schema |
| `npm run check:icons` | Enforce no frontend emoji/SVG icon policy |
| `npm run lint` | Static code/accessibility rule checks |
| `npm run typecheck` | TypeScript consistency |
| `npm test` | Learning contracts, authorization, HTTP behavior and in-process PostgreSQL repository/migration integration |
| `npm run build` | Production Next.js compilation |
| `npm run check` | Icon policy, lint, typecheck, tests and production build |
| `npx playwright install chromium` | Install the browser used by end-to-end checks |
| `npm run test:e2e` | Browser journeys and automated accessibility checks |
| `node scripts/domain-check.mjs educationos.space` | Read-only current public DNS/HTTP report |
| `node scripts/release.mjs --check` | Repeat quality and browser checks before a release |

## Database coverage

The regular tests replay committed PostgreSQL SQL through PGlite and exercise synthetic cross-tenant/guardian/consent/session/evidence/audit/rate-limit behavior. CI also provisions a disposable PostgreSQL 17 service, uses Prisma 6 to validate/generate/apply/status-check the real schema, runs the synthetic mission seed twice, and sets `TEST_DATABASE_URL` so the network `pg` adapter smoke test executes. The optional network test skips when that variable is absent and requires a database name ending in `_test`.

Never set `TEST_DATABASE_URL` to production. It is a synthetic test target, not an available hosted service. Migration replay and a rate-bucket roundtrip verify specific behavior; they do not establish production role configuration, managed backups, complete row-policy assurance or recovery readiness.

## Browser and content coverage

Exercise all five stage contexts, bounded structured evidence, mission completion, fair-test comparisons, export/reset and guardian navigation. Test keyboard flow, mobile layout, focus/error announcements and accessible labels. Automated accessibility scans apply to rendered states only; they do not establish complete WCAG conformance, screenreader compatibility, comprehension or child usability.

Use synthetic examples only. Demo text may appear in a local JSON export; do not enter actual child information during testing. Confirm the default protected API and registration gates remain unavailable, CSP/header behavior works in the built app and logs do not expose submitted content.

## Execution record and limits

[QA.md](QA.md) is the release's execution record. It must distinguish passing checks, skipped checks, network/tool limitations and remaining manual reviews. Do not replace skipped network PostgreSQL, unavailable Docker, failed installation or missing browser checks with a passing label. Historical v0.4.0 results are not current release results.

Real identity/consent integration, manual screenreader testing, comprehensive accessibility and security review, retention/erasure operations, managed restore drills and pilot learning studies remain separate gates in [SECURITY.md](SECURITY.md).
