# ADR 0001: Python owns application logic and service boundaries

- Status: accepted for this implementation
- Decision date: 2026-10-18
- Release: v0.6.0 Python-first foundation
- Supersedes: v0.5 plans to put account, permission, persistence and learning services in Next.js/TypeScript with Prisma

## Context

The founder corrected the current development plan: Python is EducationOS's primary application, backend, API and AI engineering language. The existing browser presentation and synthetic learning experience remain useful. Replacing their framework solely to reduce the number of languages would delay the interactive product without establishing better accessibility, mobile usability or lesson performance.

The repository snapshot contains a reconstructed v0.5 frontend and historical reference documents. The v0.4 source archive was not available during the earlier reconstruction; see [BASELINE.md](../BASELINE.md). Preserve that provenance rather than treating a feature inventory as recovered source. This change continues that implementation; it does not create a separate product or claim historical source parity.

## Decision

Use a Python modular monolith under `backend/`, served by FastAPI. Python owns versioned REST endpoints, strict Pydantic contracts, authorization, consent policy, curriculum publication and age-band rules, TRIZ mission orchestration, attempts/evidence, persistence, task handlers, retrieval and AI/MCP integration. Domain behavior and permission checks are tested in Python. No TypeScript route handler is an alternative authority for those decisions.

Use SQLAlchemy 2 with an asynchronous psycopg 3 driver, Alembic migrations, and PostgreSQL as the durable source of truth. Keep `postgresql+psycopg://` explicit. Use a separate `AsyncSession` for each request or independent task; it is mutable transaction state and must not be shared among concurrent tasks. Alembic-generated changes are review candidates, not proof of a safe migration. [SQLAlchemy asyncio](https://docs.sqlalchemy.org/en/21/orm/extensions/asyncio.html), [PostgreSQL dialect](https://docs.sqlalchemy.org/en/21/dialects/postgresql.html#module-sqlalchemy.dialects.postgresql.psycopg), [Alembic review guidance](https://alembic.sqlalchemy.org/en/latest/autogenerate.html).

Use Redis for shared rate limits and cache state, with explicit failure behavior for protected operations. Durable work uses Python handlers and persisted task state; CPU-heavy ingestion/embedding jobs must run outside request handling. The initial worker is a foundation, not a claim of an established production queue service. PostgreSQL/pgvector is the selected vector storage boundary. A provider-neutral Python embedding interface allows model replacement without moving product rules into JavaScript.

Retain Next.js App Router, React, TypeScript, CSS/Tailwind and professional SVG icons for public pages, accessible browser interactions and responsive learning presentation. Next.js may render and deliver pages; it does not own account, consent, curriculum or AI services. Generate the TypeScript client from FastAPI's OpenAPI schema. Browser validation helps users correct input; Python validates and authorizes again. Browser demo state and UI animation are presentation conveniences, not authoritative learner evidence. [Next.js component boundaries](https://nextjs.org/docs/app/getting-started/server-and-client-components), [React](https://react.dev/learn).

Use OpenTelemetry for backend tracing and structured logging with an explicit attribute allowlist. Use the official Python MCP SDK for tools/resources/clients. Current SDK v2 uses `MCPServer`; adopting the unrelated standalone FastMCP package is optional and needs its own compatibility review. [Python MCP SDK](https://py.sdk.modelcontextprotocol.io/), [SDK migration guide](https://py.sdk.modelcontextprotocol.io/migration/), [OpenTelemetry Python](https://opentelemetry.io/docs/languages/python/).

## Module and trust boundaries

| Boundary | Owner and rule |
| --- | --- |
| Browser | Displays content and synthetic local interactions; cannot grant roles, verify consent, trust a citation, or certify completion |
| FastAPI transport | Versioned contracts, bounded inputs, error translation and dependency wiring |
| Identity/permissions | Server-resolved principal, expiring/revocable session, tenant and exact learner relationship, purpose-specific active consent |
| Curriculum/TRIZ | Reviewed immutable mission versions, age bands, experiment evidence and completion rules |
| Persistence | SQLAlchemy transactions repeat ownership constraints; Alembic changes schema |
| Retrieval/AI | Reviewed sources, provenance, limited tool capabilities, policy gates, prompt versions and evaluations |
| Tasks | Python handlers under the same domain policies; retry/deduplication and failure records are explicit |
| MCP | Separately launched internal tooling; public reviewed curriculum only until identity/tool policy is reviewed |

Module boundaries are service interfaces inside one deployable backend, not a requirement to operate microservices. Extract a service only when operational evidence justifies a different scaling, availability or security boundary. See [AI_SAFETY.md](../AI_SAFETY.md) for the implemented gates and unfinished activation requirements.

## Python in the browser

Pyodide/WebAssembly is a candidate for selected Python programming lessons, not a replacement for the DOM or the trusted server. Run it in a module Web Worker to avoid blocking interaction; use a separate restricted origin, package/network allowlists and time/output limits before executing learner code. Worker execution alone is not a security sandbox. Never supply tokens, PII or privileged service objects to lesson code, and never trust browser execution as assessment proof. Pyodide is not bundled in this milestone. [Official worker guidance](https://pyodide.org/en/stable/usage/webworker.html).

Reflex, NiceGUI and Flet remain candidates for internal curriculum, evaluation and operations tools. A literal Python-only authored browser frontend would require a user decision before replacing the existing child-facing implementation. Reflex compiles Python UI declarations to JavaScript; NiceGUI serves a browser UI with Python server behavior; Flet offers a Python UI abstraction. None implies that Python alone becomes the browser's native DOM runtime. [Reflex](https://reflex.dev/docs/getting-started/introduction/), [NiceGUI](https://github.com/zauberzeug/nicegui), [Flet](https://flet.dev/docs/).

No framework benchmark was performed in this milestone. Before a child-facing framework switch, build the same mission flow and compare keyboard/screen-reader behavior, touch interaction, reduced motion, 360px layouts, SVG/scientific interaction, browser back/forward, offline interruption, initial transfer/parse cost on a low-end phone, event latency under constrained network conditions, reconnect/data loss behavior, testability and deployment cost. Publish measurements and identify any required JavaScript escape hatches. A prototype score does not establish accessibility or child usability.

## Consequences and acceptance

Python carries the product logic while TypeScript remains a browser delivery tool. Node.js is needed to build/run Next.js and its developer tools; it is not the application's backend service platform. Keep the historical baseline as reference and remove the active Prisma/TypeScript service paths so there is one source of authority.

This milestone is accepted when the Python API runs locally, private synthetic flows enforce server-side authorization/consent, migrations and meaningful Python tests run, the frontend consumes generated contracts, and live learner enrollment/provider AI remain closed until their missing integrations are completed. Exact tested dependency pins live with their lockfiles, with source/date evidence in [STACK_REVIEW.md](../STACK_REVIEW.md). Deployment, database hosting, domain ownership, GitHub writes and legal compliance require separate evidence and are not established by this ADR.
