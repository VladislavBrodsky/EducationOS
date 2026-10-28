# EducationOS v0.6.0 — Adult curriculum studio

A runnable Python-first milestone extending the existing Inventors Lab, evidence portfolio and premium white/black/lime frontend. Adult workspace: `/studio`. FastAPI owns all authentication, role checks, consent-intent records, validation, publication, versioning and audit history. The original learner demo remains at `/demo/lab` and `/demo/portfolio`. No mastery scores or unrestricted child AI are introduced.

Educators create five age variants, submit a version for review, and a different reviewer explicitly confirms safety before publishing. Edits use optimistic version checks; published snapshots and audit/revision history remain immutable. Guardians can record or revoke a consent intent; child profiles remain unavailable. No public signup or client-selected staff roles exist. Production adult access is closed in code.

Start with [the tested release report](docs/V0_6_QA.md), [local and staging instructions](docs/V0_6_STAGING.md), [architecture decision](docs/adr/0002-adult-studio.md), and [v0.7 priorities](docs/V0_7_ROADMAP.md).

```sh
docker compose up --build --wait api web
docker compose run --rm migrate python -m educationos.seed_adults --role educator --tenant 60000000-0000-4000-8000-000000000001 --adult-attested
docker compose run --rm migrate python -m educationos.seed_adults --role reviewer --tenant 60000000-0000-4000-8000-000000000001 --adult-attested
```

Provision educator and reviewer in the same tenant using separate operator prompts. Open `http://127.0.0.1:3000/studio`. No default credentials are shipped. For non-Docker setup and exact tests, see the staging and QA guides. Python dependencies use `uv sync --frozen`; browser dependencies use `npm ci`. Docker availability and executed tests are reported separately in QA.

**Release boundary:** adult attestation and guardian intent are unverified scaffolding. Child profiles, verified consent and production adult access remain closed. Legal/jurisdiction review, verified adult identity, security assessment, retention/deletion operations and safeguarding validation are still required. Heuristic moderation is incomplete and requires human judgment.

The referenced `EducationOS_Python_First_Fullstack_Source_v0.5.0.zip` is not present in this workspace. Continuity uses the available local v0.5 artifacts and the latest committed Python-first branch `a60895c7fbd866e8bb05e946b6e821de3fa5a401`, verified against GitHub on 28 October 2026. Uncommitted changes in the prior checkout were preserved. Earlier frontend/deployment history follows and must not be read as a deployment claim for this studio milestone.

---

## Earlier project context

**Working rule for this project and all active documents:** use the Pareto principle. Prioritize the smallest roughly 20% of work that delivers 80–100% of the useful result, ship it first, and stop adding scope once the outcome is clear and verified. See [AGENTS.md](AGENTS.md) for the standing development and copy rules.

**v0.6.0 — Python-first application foundation for educationos.space.**

Python owns the application: FastAPI REST APIs, Pydantic contracts, permission/consent policy, SQLAlchemy 2 persistence, Alembic migrations, TRIZ orchestration, tasks, AI tooling and MCP. Next.js/React/TypeScript provides the existing responsive browser interface and generated API client. This supersedes the earlier TypeScript-backend/Prisma plan; archived code in `reference/legacy-typescript-backend/` is historical only.

The public website and the original Inventors Lab demo remain separate from the new learner portal. The portal has 15 starter activities across Programming, Science, Mathematics, Language & Writing, and Arts & Design, plus three interactive Anatomy discovery labs, with editable practice code, activity feedback, local drafts, reflections, progress, and export/reset. The original demo retains five age stages and seven TRIZ steps. Demonstration notes stay in the browser tab's session storage; no learner notes are sent to a server. FastAPI supplies the original demo's versioned curriculum, with a clearly labeled offline fallback.

The new marketing landing and Curiosity Journal are available in Spanish (`/`, `/blog`), English (`/en`, `/en/blog`), and Russian (`/ru`, `/ru/blog`). Four stories are localized in all three languages. The learner demo, remaining marketing pages, and legal text are still in English; see the [marketing v2 audit, architecture, and roadmap](docs/MARKETING_V2_ROADMAP.md) for the next translation and editorial stages.

**Synthetic demonstration only. Real enrollment and learner-facing generative AI remain closed in code.** There is no public session-issuance or asserted-consent endpoint. The development seed is synthetic and refuses production. The frontend is now live on separate portal and marketing services; see [verified deployment status](docs/DEPLOYMENT_STATUS.md). Production accounts and the Python service were not launched. Hosting uses explicit CLI releases independently of the repository review.

## Run locally

Prerequisites: Python 3.13, uv, Node.js 24 LTS and npm. Python dependencies are locked in `backend/uv.lock`; browser dependencies in `package-lock.json`.

```sh
cd backend
uv sync --frozen
uv run --frozen uvicorn educationos.main:app --host 127.0.0.1 --port 8000 --no-access-log
```

In a second terminal at the repository root:

```sh
npm ci
npm run dev
```

Open [EducationOS](http://127.0.0.1:3000), [the learning portal](http://127.0.0.1:3000/portal), [the original learner demo](http://127.0.0.1:3000/demo), and [FastAPI docs](http://127.0.0.1:8000/docs). The new portal's bundled activities work without starting Python. Public API curriculum needs neither PostgreSQL nor Redis. Readiness correctly reports unavailable dependencies until storage services are running. Protected synthetic APIs need migrated PostgreSQL, Redis, and a server-issued development token.

The portal is live at [app.educationos.space](https://app.educationos.space), serving clean lesson paths while [educationos.space](https://educationos.space) serves the separate marketing website. See [portal behaviour](docs/PORTAL.md) and [hostname/deployment handoff](docs/PORTAL_DEPLOYMENT.md). DNS, certificates and post-deployment mobile checks are recorded in [deployment status](docs/DEPLOYMENT_STATUS.md). Programming uses a bounded EducationOS practice language, not a complete Python or JavaScript runtime. New portal activities are starter content rather than five age-adapted curricula; younger learners should explore with adult assistance.

[Anatomy discovery labs](docs/anatomy/README.md) includes the implemented Loop Loom, Same Half Different Shape, and Hidden Cube Builder, with mobile 2D alternatives and optional rigid 3D cube viewing. It also contains the pinned technical audit, a broader 15-class roadmap, and professional 2D/3D authoring prompts. See [implementation details](docs/anatomy/IMPLEMENTATION.md).

For the complete local stack with Docker Compose:

```sh
docker compose up --build -d
docker compose logs --tail=30 api worker
docker compose run --rm seed
```

Compose waits for PostgreSQL/Redis health and successful Alembic migration before serving the app. The optional seed prints a short-lived synthetic bearer token for local API experiments; keep it private. Compose uses loopback ports and explicit local-only credentials. [Development and deployment details](docs/DEPLOYMENT.md).

## Verify and regenerate contracts

```sh
cd backend
uv run --frozen ruff check .
uv run --frozen pytest
cd ..
npm run check
npm run api:generate
npx playwright install chromium
npm run test:e2e
```

[TESTING.md](docs/TESTING.md) records actual results and remaining checks. Database integration tests require isolated PostgreSQL; a skipped check is not a pass. See [API.md](docs/API.md) for exact schema regeneration and authenticated examples.

## Architecture and continuity

- [Architecture and module boundaries](docs/ARCHITECTURE.md), [Python-first ADR](docs/adr/0001-python-first.md), [official-source stack review](docs/STACK_REVIEW.md)
- [Database and migrations](docs/DATABASE.md), [AI and MCP safety](docs/AI_SAFETY.md), [security](docs/SECURITY.md)
- [Milestone and remaining gates](docs/MILESTONES.md), [release and GitHub handoff](docs/RELEASE.md), [changelog](CHANGELOG.md)
- [Historical evidence](docs/BASELINE.md), [domain observations and cutover](docs/DOMAIN.md)

The original `EducationOS_Source_v0.4.0.zip` remains unavailable. This work continues the local v0.5 implementation and recorded v0.4 feature inventory; it does not claim source-level parity with that missing archive. Recovered public v0.1 documentation is preserved unchanged in `reference/`; private founder files are excluded.

Two earlier chats were editing the original folder concurrently. This release was isolated as `EducationOS-python-first` from a snapshot of their existing progress, then corrected here. Its branch is `codex/python-first-foundation`; the previous checkouts remain preserved. GitHub integration reads succeed, but connector branch creation returned 403 on 2026-10-18. Network-enabled CLI authentication succeeds; see the release record for the verified PR result.
