# Stack review: 2026-10-18

This review applies the founder's Q4 2026 correction to the current implementation. Python is the principal product-logic language; the existing React/Next.js interface remains the browser presentation. The architecture decision is [ADR 0001](adr/0001-python-first.md).

## Verification method and limits

Official framework documentation and first-party package registries were inspected on 2026-10-18. Dates below are observed upload dates, not predictions. Registry metadata is mutable; exact dependency resolutions and the committed lockfiles establish what this deliverable installs. A package being available does not demonstrate compatibility or a clean security audit. Only recorded test results establish what was exercised locally.

Python package metadata, upload timestamps, Python requirements and source URLs are preserved in [`backend/dependency-evidence.json`](../backend/dependency-evidence.json). These are direct PyPI JSON observations. Live registry metadata was available, so no release number was inferred from the calendar or a marketing page. Search indexes and translated release notes can lag: one FastAPI result stopped at July 2026 while the registry identified an October release. The registry evidence takes precedence for package availability; official version-specific docs govern API behavior.

## Backend packages reviewed

| Package | Available version observed | Uploaded | Purpose / decision |
| --- | --- | --- | --- |
| [FastAPI](https://pypi.org/pypi/fastapi/json) | 0.143.3 | 2026-10-16 | Core REST transport; OpenAPI generated from Python contracts |
| [Uvicorn](https://pypi.org/pypi/uvicorn/json) | 0.54.0 | 2026-09-25 | ASGI server |
| [Pydantic](https://pypi.org/pypi/pydantic/json) | 2.14.1 | 2026-10-11 | Strict request/response and domain contracts |
| [pydantic-settings](https://pypi.org/pypi/pydantic-settings/json) | 2.16.0 | 2026-10-14 | Environment configuration |
| [SQLAlchemy](https://pypi.org/pypi/sqlalchemy/json) | 2.1.5 | 2026-10-16 | SQLAlchemy 2 ORM/Core, asynchronous transactions |
| [Alembic](https://pypi.org/pypi/alembic/json) | 1.20.0 | 2026-09-11 | Reviewed schema history |
| [psycopg](https://pypi.org/pypi/psycopg/json) | 3.3.6 | 2026-09-18 | Explicit asynchronous PostgreSQL driver |
| [redis](https://pypi.org/pypi/redis/json) | 8.1.0 | 2026-07-30 | Python client for caching and shared rate limits |
| [pgvector](https://pypi.org/pypi/pgvector/json) | 0.5.1 | 2026-10-09 | Python adapter; distinct from the database extension version |
| [mcp](https://pypi.org/pypi/mcp/json) | 2.3.0 | 2026-10-02 | Official Python MCP SDK |
| [opentelemetry-api](https://pypi.org/pypi/opentelemetry-api/json), [SDK](https://pypi.org/pypi/opentelemetry-sdk/json), [OTLP HTTP exporter](https://pypi.org/pypi/opentelemetry-exporter-otlp-proto-http/json) | 1.45.1 | 2026-10-06 | Trace API, SDK and optional collector export |
| [FastAPI instrumentation](https://pypi.org/pypi/opentelemetry-instrumentation-fastapi/json) | 0.66b1 | 2026-10-06 | Contrib instrumentation uses a beta version scheme; review as a separate dependency |
| [pytest](https://pypi.org/pypi/pytest/json) / [pytest-asyncio](https://pypi.org/pypi/pytest-asyncio/json) | 9.1.1 / 1.4.0 | 2026-06-19 / 2026-05-26 | Python behavior and asynchronous integration tests |
| [HTTPX](https://pypi.org/pypi/httpx/json) / [aiosqlite](https://pypi.org/pypi/aiosqlite/json) | 0.28.1 / 0.22.1 | 2024-12-06 / 2025-12-23 | ASGI tests / lightweight local test database |
| [Ruff](https://pypi.org/pypi/ruff/json) | 0.17.1 | 2026-10-15 | Python linting |

The selected Python runtime range is recorded in `backend/pyproject.toml`; the application targets Python 3.13 or 3.14. Python 3.13 is a deliberate compatibility target, not a claim to be the newest Python release. SQLAlchemy 2.1 satisfies the requested SQLAlchemy 2 architecture. Avoid copying SQLAlchemy 1.x patterns into the new backend.

## Official documentation findings

| Component | Source reviewed | Concrete implementation consequence |
| --- | --- | --- |
| FastAPI | [Features](https://fastapi.tiangolo.com/features/), [versions](https://fastapi.tiangolo.com/deployment/versions/) | Derive OpenAPI from Pydantic types; verify pinned upgrades with application tests |
| Pydantic | [Models](https://pydantic.dev/docs/validation/latest/concepts/models/) | Explicit validation constraints and rejected unknown fields at trust boundaries; types do not establish authorization |
| SQLAlchemy 2 | [AsyncIO](https://docs.sqlalchemy.org/en/21/orm/extensions/asyncio.html), [psycopg dialect](https://docs.sqlalchemy.org/en/21/dialects/postgresql.html#module-sqlalchemy.dialects.postgresql.psycopg) | Per-task `AsyncSession`; explicit `postgresql+psycopg` driver and transaction ownership |
| Alembic | [Autogeneration](https://alembic.sqlalchemy.org/en/latest/autogenerate.html) | Manually review generated changes; run upgrades against PostgreSQL before release |
| PostgreSQL | [Current documentation](https://www.postgresql.org/docs/current/) | Observed stable docs: 18.6; PostgreSQL 19 was RC1, so do not select it as a stable release by assumption |
| pgvector extension | [Maintainer repository](https://github.com/pgvector/pgvector) | Observed install tag v0.8.7; extension supports PostgreSQL 13+. Confirm the chosen container tag independently; adapter version 0.5.1 is not the extension version |
| psycopg 3 | [Concurrent operations](https://www.psycopg.org/psycopg3/docs/advanced/async.html) | Native asynchronous connections; use application transactions and pooling deliberately. The moving docs reported a development build, not a new stable pin |
| Redis | [Python client](https://redis.io/docs/latest/develop/clients/redis-py/) | Use maintained `redis` client; server image and client version are independent |
| OpenTelemetry | [Python status](https://opentelemetry.io/docs/languages/python/) | Traces/metrics stable, logs still development per reviewed status. Keep structured Python logging independent; avoid capturing sensitive request data |
| Python MCP SDK | [Stable v2 docs](https://py.sdk.modelcontextprotocol.io/), [migration](https://py.sdk.modelcontextprotocol.io/migration/) | Use v2's `MCPServer` API, verify actual imports; a v1 `FastMCP` example is not automatically compatible |

## Browser stack and Python UI evaluation

The retained source snapshot specifies Next.js 16.4.2, React/React DOM 19.3.1, TypeScript 5.9.3 and Tailwind CSS 4.3.3. These are preservation choices; the lockfile is the authority for installation. The frontend agent verified `openapi-typescript` 7.13.0 and `openapi-fetch` 0.17.0 against npm registry metadata on 2026-10-18 for generated API contracts. Neither generated types nor browser validation replaces Python authorization. [Next.js installation](https://nextjs.org/docs/app/getting-started/installation), [server/client components](https://nextjs.org/docs/app/getting-started/server-and-client-components), [React documentation](https://react.dev/learn), [OpenAPI TypeScript](https://openapi-ts.dev/introduction), [OpenAPI Fetch](https://openapi-ts.dev/openapi-fetch/).

| Candidate | Honest scope and decision |
| --- | --- |
| React / Next.js | Retain existing accessible HTML/SVG presentation, responsive pages and interactive mission UI. Python owns authoritative learning services. Future AR/WebXR needs a separate browser/device evaluation; no AR support is claimed here |
| [Pyodide](https://pyodide.org/en/stable/usage/webworker.html) | Optional future Python lesson runtime in a module worker. Official stable worker docs reported 314.0.7 when reviewed. No package pin or runtime is introduced because this release does not implement Python code execution. Assess payload, supported packages, isolation and cancellation before adoption |
| [Reflex](https://reflex.dev/docs/getting-started/introduction/) | Python-authored UI compiled to browser JavaScript; candidate for internal tools. Replacing the child-facing interface requires the benchmark and user decision in ADR 0001 |
| [NiceGUI](https://github.com/zauberzeug/nicegui) | Python web UI with browser and server interaction; candidate for curriculum/evaluation tools. Official site fetch was unavailable, so the maintainer repository was reviewed |
| [Flet](https://flet.dev/docs/) | Python UI abstraction for application views; candidate for internal tools. No claim of comparable DOM accessibility, WebXR integration or child-facing performance was established |

No comparative UI performance, accessibility or device benchmark was executed. No Python-native UI candidate was added as a production dependency. A requirement to author the entire browser UI in Python would change this accepted decision and needs explicit direction before a rewrite.

## Upgrade policy

Keep Python and npm lockfiles under version control. Upgrade in a dedicated change with resolved metadata, deterministic contract regeneration, meaningful backend permission/consent tests, migration checks and frontend checks. Keep SDK API migrations separate from routine patch upgrades when behavior changes. Do not label a dependency safe merely because it is current, and do not add model orchestration libraries until a concrete integration needs them.

AI provider selection, production embedding model/dimensions, live moderation and remote MCP authorization remain unselected. The schema's nullable 384-dimensional vector column is a declared storage placeholder, not a selected embedding provider contract. The implemented foundation must remain usable without network AI credentials; activation requirements are recorded in [AI_SAFETY.md](AI_SAFETY.md).
