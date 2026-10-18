# EducationOS

**v0.6.0 — Python-first application foundation for educationos.space.**

Python owns the application: FastAPI REST APIs, Pydantic contracts, permission/consent policy, SQLAlchemy 2 persistence, Alembic migrations, TRIZ orchestration, tasks, AI tooling and MCP. Next.js/React/TypeScript provides the existing responsive browser interface and generated API client. This supersedes the earlier TypeScript-backend/Prisma plan; archived code in `reference/legacy-typescript-backend/` is historical only.

The public experience has five age stages, seven TRIZ steps, observations, portfolio/export/reset, guardian preview and SVG icons. Demonstration notes stay in the browser tab's session storage; no learner notes are sent by the demo. FastAPI supplies versioned curriculum, with a clearly labeled offline fallback.

**Synthetic demonstration only. Real enrollment and learner-facing generative AI remain closed in code.** There is no public session-issuance or asserted-consent endpoint. The development seed is synthetic and refuses production. No hosting deployment, domain cutover or GitHub push is implied by this source release.

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

Open [EducationOS](http://127.0.0.1:3000), [the learner demo](http://127.0.0.1:3000/demo), and [FastAPI docs](http://127.0.0.1:8000/docs). Public curriculum needs neither PostgreSQL nor Redis. Readiness correctly reports unavailable dependencies until storage services are running. Protected synthetic APIs need migrated PostgreSQL, Redis, and a server-issued development token.

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
