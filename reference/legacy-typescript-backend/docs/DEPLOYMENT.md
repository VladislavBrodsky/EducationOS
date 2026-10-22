# Deployment, recovery and operations

This runbook targets the pinned Prisma 6 schema/migration format in this repository. Do not substitute newer CLI migration commands or run an unpinned `prisma@latest` against this release. The provided CI checks build/test behavior; it does not deploy, configure DNS or enable actual child accounts.

## Local reproducible setup

Prerequisites: Node.js 22.12 or later in the Node 22 line, npm, and optionally Docker with Compose for PostgreSQL. Use the committed lockfile. The application remains usable as a synthetic browser demo with `AUTH_MODE=disabled`; database creation is optional for public pages.

```sh
cp .env.example .env
npm ci
npx prisma generate
npm run dev
```

For PostgreSQL development, start the database and use the local-only URLs described in `.env.example`:

```sh
docker compose up -d db
npx prisma migrate deploy
npm run db:seed
npm run check
npx playwright install chromium
npm run test:e2e
```

The seed publishes synthetic mission content only. Do not create real learner/guardian fixtures, issue sessions or insert asserted consent into development, staging or production. The integration tests construct synthetic fixtures in isolated in-process PostgreSQL and never require a real family account.

Portable container flow:

```sh
docker compose up -d db
docker compose run --rm migrate
docker compose up --build -d web
```

Open `http://localhost:3000`. The included Compose password is explicitly a local synthetic-development credential; database and web ports bind only to loopback. Do not reuse this configuration on a public host. `docker compose down` stops it while retaining the database volume. Removing the volume is destructive and is unnecessary for normal development.

## Environment separation

| Setting | Local / CI | Staging / production |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Loopback app URL | Exact public origin for that deployment; intentionally public, set before build |
| `APP_ORIGIN` | Exact origin used by browser tests | Exact trusted HTTPS origin, e.g. the actual production `https://educationos.space`; no trailing slash |
| `DATABASE_URL` | Local/synthetic database | Managed provider's pooled/runtime URL with verified TLS; secret |
| `DIRECT_URL` | Same local DB | Provider-supported migration/direct URL with verified TLS; migration job secret |
| `AUTH_MODE` | `disabled` | Keep `disabled` for public demo launch |
| `CONSENT_VERIFICATION_PROVIDER` | Unset | Leave unset until a reviewed external provisioner exists; never use a made-up provider to bypass launch gates |
| `NEXT_TELEMETRY_DISABLED` | `1` | `1` |

`NEXT_PUBLIC_` values are compiled into browser assets; changing only a runtime container variable does not rebuild them. The Dockerfile accepts `--build-arg NEXT_PUBLIC_APP_URL=https://actual-staging-host.example` for a staging image. That hostname is illustrative, not a created environment. Keep database/identity/email secrets out of this build argument and all public variables. [Next.js environment handling](https://nextjs.org/docs/app/guides/self-hosting)

Use separate databases and secret sets for Preview/Staging and Production. Do not share production credentials with PR jobs. Remote database runtime connections require `sslmode=verify-full` or `sslmode=verify-ca` under this release's adapter; use the managed provider's real hostname and CA/trust configuration. Do not disable certificate verification or copy a generic connection string. Validate the managed provider's pooler, connection limits and region before deployment.

## Vercel staging and production

1. Import `VladislavBrodsky/EducationOS` into the user's Vercel team after repository access is granted. Framework: Next.js. Root: repository root. Install: `npm ci`. Build: `npm run build`; generate Prisma Client explicitly in the build job if not covered by install scripts. Node.js: supported 22 runtime. No DNS change is needed for a Preview URL.
2. Provision managed PostgreSQL close to the app region. Record the provider's backup/PITR capabilities, retention, regional residency, encryption, maintenance and restore procedure. Create separate runtime/migration roles, use provider-managed secrets, and restrict network access where supported.
3. Set Preview and Production environment variables separately. Initially keep `AUTH_MODE=disabled`, leave consent-provider integration unset, and do not give Preview access to production data. Enable provider deployment protection on staging. Any future identity callback URL must be explicitly allowed by its provider.
4. In a protected migration job for the target environment, use the reviewed lockfile and run `npx prisma migrate deploy`, followed by `npx prisma migrate status`. Apply the release's migration files exactly once before promoting a compatible build. Never use `migrate dev`, `migrate reset` or `db push` on a hosted environment. [Prisma 6/7 production migration workflow](https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production)
5. Seed reviewed mission content with `npm run db:seed` only when needed. Inspect idempotence in staging first. This is not an account or consent bootstrap command. Migration and seed jobs must have change logs, exclusive deployment control and bounded timeouts.
6. Deploy the reviewed commit. Check `/api/health/live`, then `/api/health/ready`. Readiness must fail if configured database access or required tables are unavailable; a database-free synthetic demo may report its intended degraded mode. Inspect the response rather than treating any 200 as evidence of enabled accounts.
7. Exercise marketing, navigation, all age bands, the seven-step mission, demo reset/portfolio behavior, error states and mobile/keyboard use. Verify protected routes remain unavailable in disabled mode, registration returns 503, no submitted evidence appears in server logs, and the deployed CSP allows expected scripts while blocking framing.
8. Complete [DOMAIN.md](DOMAIN.md), then associate the exact reviewed production deployment with the apex domain. Do not label the domain live until certificates, redirects, content and release identity have been checked externally.

The checked-in GitHub workflow has no production secrets or automatic deployment job. Add a separate protected deployment environment only after hosting is linked and staging has passed. Prefer short-lived provider credentials/OIDC when supported, require review for production promotion, and prevent concurrent migration jobs.

## Self-hosting alternative

Build the included standalone image and run it as its non-root user behind a managed TLS load balancer or reverse proxy. Public traffic must enter the proxy, which enforces payload limits, request timeouts, rate limiting and HTTP-to-HTTPS redirects. The container's database URL is a runtime secret; migration tooling lives in the builder target and should run as a separate controlled job, not at every web-server startup. [Next.js self-hosting](https://nextjs.org/docs/app/guides/self-hosting)

Retain the exact release image/digest for rollback. Supply healthy liveness/readiness probes. Permit writable cache storage only as needed; do not make the entire image writable to solve a deployment error. If scaling beyond one replica, review shared-cache behavior, consistent build identity and the framework's Server Action encryption requirements. No application upload or learner data should be stored on ephemeral container disk.

## Observability and abuse limits

The server emits structured request ID, operation, status and duration metadata with safe error codes. Request bodies, cookie values, full URLs, actor identities, learner aliases and submitted evidence are excluded. Restrict log access, configure environment-specific retention and scrub host/provider access logs as well as application logs. Providers may otherwise record IP addresses and query strings independently.

Monitor availability, p95 latency, 5xx rates, database pool exhaustion, migration failures, health/readiness, consent-denial anomalies and 429 rates. Route alerts to a named operator with an incident runbook. The authenticated API uses database-backed rate buckets at 60 requests per minute per actor; public demo limits are process-local at 600 requests per minute per operation. Add hosting/WAF distributed public traffic and authentication limits before exposing account endpoints; do not trust an arbitrary forwarded IP header.

Run `prisma/retention.sql` daily through an authenticated provider maintenance job using a restricted role. It deletes expired evidence, sessions and rate buckets and returns counts only. Evidence has a 90-day expiry and expired evidence is hidden from reads; hiding alone does not erase storage. Review the policy and verify the scheduler before any pilot. Account/consent/audit erasure, legal retention decisions and backup expiry require a separately tested worker and operator policy before child accounts are enabled.

## Backups and restore rehearsal

Before schema changes or any enabled account pilot:

1. Enable managed automated backups/PITR; assign and record recovery-point and recovery-time targets the operator can actually meet.
2. Take a provider snapshot or encrypted backup before a migration. Restrict access and avoid moving production data into developer machines or preview projects.
3. Restore into a restricted isolated database. Verify migration history, required constraints, content versions, count integrity and application health with controlled test data. Do not expose restored endpoints publicly.
4. Record elapsed recovery time, gaps, backup timestamp and reviewer. Destroy disposable copies according to policy. Repeat after material schema/infrastructure changes and on the operator's recovery schedule.

Local synthetic restore rehearsal can use `pg_dump --format=custom` and `pg_restore` from the same major-version toolchain. Never print database connection strings or paste them into tickets. Follow the managed provider's actual restore process for hosted data; no provider restore has been verified by this implementation.

## Rollback

Prefer backward-compatible expand/contract changes. On an application regression, route traffic to the prior reviewed deployment/image and confirm health plus a browser smoke test. Do not assume reverting code reverts a migration. Destructive schema changes need a separately reviewed restore/forward-fix plan; Prisma migrations do not supply automatic down migrations. If data recovery is required, pause writes, have the incident owner authorize the restore, restore to an isolated target, validate it, and then perform a controlled cutover. Retain incident and migration evidence without learner content.
