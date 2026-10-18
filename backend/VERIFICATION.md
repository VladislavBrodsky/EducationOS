# Backend verification — 2026-10-18

Python 3.13.3, uv 0.10.11. Direct dependency versions and official upload timestamps were read from PyPI JSON before pinning; every recorded direct release predates 2026-10-19 UTC. See `dependency-evidence.json` and committed `uv.lock` for exact versions and artifact hashes. SQLAlchemy is 2.1.5, within the requested SQLAlchemy 2 family. The async extra installs its required greenlet runtime.

Executed successfully from `backend/`:

```sh
UV_CACHE_DIR=/tmp/educationos-uv-cache uv sync --python python3.13
uv run ruff check src tests alembic
uv run pytest -q
uv run python -m educationos.export_openapi --check
uv run alembic upgrade head --sql
uv run alembic downgrade 0001_python_foundation:base --sql
uv build --wheel
```

Result: **35 passed, 1 skipped**. The skipped check requires disposable real PostgreSQL/pgvector, Redis, API and maintenance-role URLs. SQLite tests exercise persistence and service authorization; they do not prove PostgreSQL RLS, pgvector operations, role grants, or migration execution. The real integration test checks these boundaries and rehearses upgrade/downgrade on an explicitly named `*_test` database when CI supplies `EDUCATIONOS_TEST_DATABASE_URL`, `EDUCATIONOS_TEST_APP_DATABASE_URL`, `EDUCATIONOS_TEST_WORKER_DATABASE_URL` and optional `EDUCATIONOS_TEST_REDIS_URL`.

The passing tests cover opaque session validation, expiration/revocation, tenant and guardian isolation, learner permissions, consent expiration/revocation, age boundaries, immutable version digest verification, persisted evidence, seven-step completion requirements, two distinct alternatives, controlled baseline/redesign measurements, evidence expiration/deletion, fail-closed Redis rate limits, bounded bodies and sanitized errors, corrupted Redis cache rejection/repair against reviewed source, unconditional live-AI/enrollment closure, curated retrieval provenance and exact citation spans, embedding shape validation, versioned prompts, adversarial retrieval fixtures, durable maintenance behavior, and a real MCP stdio initialize/list-tools/call-tool exchange. This is deterministic boundary evaluation, not live-model quality or moderation certification.

Wheel smoke check: built `educationos_backend-0.6.0-py3-none-any.whl`, verified it includes `educationos/data/missions.v1.json`, unpacked under `/tmp`, imported its app outside the checkout and confirmed all five reviewed missions load using the packaged resource. A regression test compares packaged curriculum bytes with the canonical shared JSON. The backend Dockerfile uses a verified official Python image digest and runs without root privileges or access logs. Docker image build and live PostgreSQL execution were not available in this local host; CI is configured to exercise them. No production deployment is claimed.

Official documentation reviewed:

- [FastAPI](https://fastapi.tiangolo.com/), including dependency lifetime, OpenAPI, security and deployment patterns.
- [Pydantic validation](https://docs.pydantic.dev/latest/) and [Pydantic Settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/).
- [SQLAlchemy asyncio](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html) and [psycopg dialect](https://docs.sqlalchemy.org/en/20/dialects/postgresql.html#module-sqlalchemy.dialects.postgresql.psycopg).
- [Alembic](https://alembic.sqlalchemy.org/en/latest/).
- [psycopg asynchronous operations](https://www.psycopg.org/psycopg3/docs/advanced/async.html).
- [Redis Python client](https://redis.io/docs/latest/develop/clients/redis-py/).
- [pgvector Python](https://github.com/pgvector/pgvector-python).
- [Official MCP Python SDK v2](https://py.sdk.modelcontextprotocol.io/). Installed v2.3.0 uses `MCPServer`, with snake_case Python attributes and protocol aliases for tool annotations. No deprecated FastMCP import is assumed.
- [OpenTelemetry Python](https://opentelemetry.io/docs/languages/python/).

See the root repository verification report for frontend, browser, CI and GitHub outcomes.

The first remote PostgreSQL integration run passed the real database/worker migration checks; it also exposed a unit test assumption about absent Redis. The fixture now explicitly tests healthy Redis and simulated outage without depending on host services. Production readiness logic was unchanged. See PR checks for the final full CI result.
