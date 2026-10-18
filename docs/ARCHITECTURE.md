# Architecture and data boundaries

> Superseded backend target: Python/FastAPI with SQLAlchemy/Alembic is the current accepted architecture in `../EducationOS-python-first`. Node/Prisma details here document a preserved earlier implementation; do not deploy them as the product backend. Frontend/domain findings remain applicable.
EducationOS v0.5.0 is a Next.js modular monolith. A single application contains public pages, a synthetic learning demo and a guarded backend boundary. This keeps deployment and review manageable while providing explicit seams for identity, consent verification and persistence integrations.

## Module responsibilities

| Area | Responsibility |
| --- | --- |
| `src/app` | App Router pages, metadata, error/loading states and HTTP route handlers |
| `src/components` | Shared accessible UI and interactive demo components |
| `src/lib` | Versioned demo learning content and client-safe utilities |
| `src/contracts` | Strict input/output shapes shared across the backend boundary |
| `src/server/auth.ts` | Opaque-cookie authentication primitives; server-side session lookup |
| `src/server/permissions.ts` | Tenant, learner, guardian-grant and consent checks |
| `src/server/http.ts` | Bounded input parsing, exact mutation-origin checks, request IDs, safe errors and redacted logs |
| `src/server/database.ts` | Parameterized PostgreSQL driver, verified remote TLS, pool limits and transactions |
| `src/server/repository.ts` | Persistence boundary; implementations must repeat principal scoping |
| `src/server/runtime.ts` | Explicit runtime wiring, session/consent integration gate and rate budgets; protected storage is disabled by default |
| `prisma` | PostgreSQL schema and reviewed migration history |
| `tests` | Behavior, authorization, database and browser verification |

Server-only code and database secrets must never enter client components. Browser-supplied roles, learner IDs, tenant IDs and consent booleans do not establish authority. Future integrations must obtain the principal from a validated server session, then scope each query to the principal and current guardian relationship.

## Request and trust flow

1. Public pages and the demo render without a child account. The demo uses synthetic identity and a local learning interaction; it is clearly identified as a preview.
2. Protected API requests enter `/api/v1`. Runtime wiring fails closed by default. The future `opaque-session` mode requires database access, a configured verification-provider allowlist value, a valid pre-provisioned server session and independently verified active consent. No query parameter, public environment flag or request header establishes identity or consent. Registration always returns 503 in this release.
3. An enabled integration would authenticate an opaque secure cookie, retrieve an active server-side session, check the exact configured mutation origin, parse strict bounded input, and check the learner boundary.
4. The repository rechecks tenant ownership, guardian grants, active verified consent and mission age band inside the storage transaction. A guessed ID must not reveal whether another family's record exists.
5. Evidence links to an immutable mission version and an attempt. Evidence expires after 90 days and reads exclude expired rows. Portfolio reads are bounded to 100 attempts and 200 evidence items. Completion requires the expected learning steps; it does not create an unsupported mastery score.

## Persistence model

PostgreSQL is the source of truth for a future enabled account service. The committed schema separates adult identity, learner pseudonyms/age bands, guardian relationships, consent records, server sessions, versioned content, attempts, evidence and audit history. Read the schema and migration alongside the backend tests for exact constraints. Store coarse age bands rather than full dates of birth unless a reviewed requirement makes additional information necessary.

Use a managed database with TLS, restricted network access, environment-specific credentials and automated backups. Application queries use a least-privilege runtime role. Migration jobs use a separate role that can alter schema. A connection pool is needed for a serverless host; use the provider's pooled URL at runtime and its supported migration/direct URL for migration jobs. Do not assume a pooler supports every migration operation.

## Content and versioning

The mission sequence follows the recorded v0.4.0 feature inventory. Contract step keys are `notice`, `contradiction`, `imagine`, `hypothesis`, `experiment`, `reflect`, `transfer`; experiment evidence supports fair comparison. The historical source ZIP was not recovered, so source-level parity is unverified. Instructions and expected detail adapt by age band. Mission versions are immutable once published; new content or scoring rules require a new version. Keep a reviewed publication status and author/reviewer trail when enabling a content administration workflow.

## Operational boundaries

The app is independently buildable and can run on Vercel or in the included container. DNS, certificate issuance, adult identity verification, verified consent, email sending, managed backup configuration, external alerting and distributed abuse controls require provider/operator setup. Documentation describes those steps; code presence alone does not prove they are configured. See [SECURITY.md](SECURITY.md), [DEPLOYMENT.md](DEPLOYMENT.md) and [DOMAIN.md](DOMAIN.md).
