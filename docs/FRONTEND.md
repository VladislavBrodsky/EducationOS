# Browser presentation and Python API integration

EducationOS v0.6.0 retains the public website and responsive learner demo: five
age groups, seven TRIZ steps, independent local drafts, measurement comparisons,
portfolio filtering, evidence export/reset, and keyboard-operable guardian tabs.
The earlier single-page `EducationApp` source is also preserved, without
replacing the current public site and `/demo` routes.

Python/FastAPI is the application backend. `src/server/`, Next route handlers,
Prisma, and their TypeScript backend tests are preserved only in
`reference/legacy-typescript-backend/`; build and lint explicitly exclude that
archive. The browser's form checks and synthetic draft state are presentation
behavior, not authorization or a persisted learning service.

## Curriculum contract

- FastAPI exports `backend/openapi.json`. `npm run api:generate` creates
  `src/lib/api/schema.d.ts` with the verified `openapi-typescript` package.
- `openapi-fetch` provides a generated-contract client for
  `GET /api/v1/missions?age_band=10-12`. Browser runtime validation rejects
  malformed curriculum, unsupported age groups, or reordered/missing TRIZ steps.
- The lab reads its materials, adult guidance, and seven age-adapted prompts
  from the API response. Requests contain the selected age band only: no draft,
  learner identity, notes, or stored credentials are sent.
- The same authored `shared/curriculum/missions.v1.json` is used by Python and
  the bundled preview. The demo visibly distinguishes checking, published
  curriculum, and offline preview. Failed/invalid responses offer a retry;
  fallback content never represents a successful API connection.
- Drafts remain synthetic and local in this tab's `sessionStorage`. Reload can
  restore them, and Clear demo notes removes the storage entry. Browser session
  restoration may retain data, as disclosed in the guardian and privacy pages.
  No enrollment, learner authorization, persistence writes, or AI calls are
  wired into the browser demo.

## Run and regenerate

Use Node 22.12 or newer. Exact direct package versions and registry integrity
metadata are recorded in `frontend-dependencies.json`; transitive versions are
locked in `package-lock.json`.

```sh
npm ci
# Start FastAPI separately; see the root README.
PYTHON_API_URL=http://127.0.0.1:8100 npm run dev -- --port 3100

# After a Python contract change, from backend/:
uv run python -m educationos.export_openapi
# From repository root:
npm run api:generate
npm run api:check
npm run check
PORT=3100 npm run test:e2e
```

`PYTHON_API_URL` is server-only; never prefix it with `NEXT_PUBLIC_`. Next
rewrites `/api/v1/*` to this internal HTTP(S) origin. Next records the rewrite
when building, so provide the intended upstream at build time and rebuild when
it changes. Default local upstream is `http://127.0.0.1:8000`; the isolated
review uses API 8100 and frontend 3100. Docker builds use `http://api:8000`.

```sh
PYTHON_API_URL=http://127.0.0.1:8100 npm run build
npm run start -- --port 3100
```

`npm run build` uses Next's supported webpack builder. The sandbox prevented
Turbopack's local worker process from binding a port; `build:turbo` remains
available for environments that support it. Runtime hosting still uses Next's
standalone output; the Docker image runs its standalone server.

## Verification on 2026-10-18

The current lint, route type generation/TypeScript checks, all 20 unit tests,
generated-client drift check, and no-emoji scan pass. The public pages and demo
compiled successfully as a production webpack build. All four Chromium end-to-end tests pass against the production build: the
seven-step mission with export/reset, separate drafts across five age bands
and reload, explicit offline/malformed-response recovery with retry, and 24
public/demo page scans at 1440 px and 390 px. No horizontal overflow or
automatically detected WCAG A/AA axe violations remain in those scans.

The scan found and corrected the original mission-step number contrast and
mobile trust-strip container overflow. Screenshots were generated under
`artifacts/dashboard-{1440,390}.png` and
`artifacts/guardian-{1440,390}.png`. Automated scans do not constitute an
independent accessibility certification. Browser curriculum responses were
intercepted in the behavioral suite; the root integration review separately
uses the actual Python API on 8100 and frontend on 3100.

The full npm audit reports zero known vulnerabilities, including development
dependencies (`frontend-npm-audit.json`). Independent ESLint TypeScript, React
Hooks, and JSX accessibility rules replace `eslint-config-next`, whose lint
transitive dependencies had an unresolved advisory. Browser tests cover the
framework integration directly. No audit override or forced framework downgrade
is used.

Official references reviewed: [Next CLI](https://nextjs.org/docs/app/api-reference/cli/next),
[OpenAPI TypeScript](https://openapi-ts.dev/introduction), and
[openapi-fetch](https://openapi-ts.dev/openapi-fetch/). Exact new tooling releases
were checked through the official npm registry before installation.

Primary-agent live integration check on 2026-10-18: the actual running FastAPI on8100 supplied the published mission through Next3100. The browser showed published-version readiness, switched from Makers to Explorers, and opened the age5–6 prompt with no mocked response.
