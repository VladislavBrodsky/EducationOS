# Testing and validation — v0.5.0

## Run checks

Use Node.js 22 LTS and npm. Install the lockfile dependencies with `npm ci`.

| Command | Purpose |
|---|---|
| `npm run typecheck` | TypeScript correctness |
| `npm test` | Domain, contracts, and negative permission tests |
| `npm run check:icons` | Reject frontend emojis and enforce the icon policy |
| `npm run build` | Next.js production compilation |
| `npm run check` | Combined repository checks |
| `npm run test:e2e` | Playwright browser journeys and automated accessibility checks |

Install browser support first with `npx playwright install chromium`. The browser suite starts its configured local application server. See the checked-in Playwright configuration for its exact viewport and server settings.

## Release validation record

| Check | Result on 2026-10-18 |
|---|---|
| Dependency install from lockfile | Pending |
| Typecheck | Pending |
| Unit/contracts/authorization | Pending |
| Frontend icon policy | Pending |
| Production build | Pending |
| Desktop/mobile journey | Pending |
| Automated accessibility | Pending |
| PostgreSQL migration smoke and policy checks | Pending |

Update this table with actual execution results before describing any check as passed. Historical v0.4 test results were recorded in the earlier conversation and were not rerun against that unavailable source.

## What meaningful checks cover

Exercise all five stage contexts, reject invalid evidence, pin mission versions, and test denied access for missing identity, wrong role, wrong learner, wrong tenant, and invalid relationships. Mission completion should require actual demonstration inputs, preserve fair test comparisons, and expose evidence without asserting mastery. Export and clear operations should act only on the current synthetic session.

Browser checks should cover the dashboard-to-mission-to-portfolio journey, guardian navigation, keyboard interaction, mobile layout, and accessible names/labels. Automated accessibility scans target rendered states; a clean scan does not demonstrate full WCAG conformance, screenreader compatibility, comprehension, or child usability.

Database checks must run against an isolated test database using the intended application role. Merely parsing SQL or inspecting an RLS declaration cannot prove that tenant or role boundaries work. A migration test does not establish backup readiness or production persistence.

## Limits and remaining verification

This release has no production authentication, real guardian consent, approved school roster integration, independent penetration test, legal approval, curriculum efficacy study, or operational safety certification. Manual screenreader testing, comprehensive accessibility review, consent revocation operations, retention/erasure/restore drills, and authorized pilot research remain open gates.

Use synthetic fixtures only. Do not record or upload real child information during manual or automated testing. Local JSON exports can contain text entered in the demo, so export synthetic examples only.
