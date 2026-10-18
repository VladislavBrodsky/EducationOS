# EducationOS v0.5.0 — preserved frontend and prior backend reference

**Architecture correction:** The user subsequently confirmed Python as the primary application/backend/API/AI language. The accepted FastAPI + SQLAlchemy/Alembic full-stack work is in the sibling `EducationOS-python-first` checkout, coordinated in “Revise EducationOS Python backend”. Its release supersedes the Node/Prisma backend below. This checkout preserves the frontend implementation and executed QA; its earlier Node backend is reference material, not the deployment target. The final marketing/demo frontend is being integrated into that Python-first app.

A runnable Next.js App Router / React / TypeScript application for **educationos.space**. White, charcoal, and lime; Tailwind CSS shared tokens; Lucide and original SVG illustrations; no frontend emojis.

**Release boundary:** production-oriented architecture with a synthetic, account-free demonstration. Real learner enrollment, identity-provider sign-in, and consent issuance are deliberately unavailable. This is not a claim of production safety or legal compliance. No payments or unrestricted AI/chat are connected.

## Run the app

Use Node.js 22.12+ (Node 24 LTS recommended) and npm. From this directory:

```sh
cp .env.example .env
npm ci
npm run dev
```

Open `http://127.0.0.1:3000`. No database is required for the demo.

```sh
npm run check
npm run test:e2e
```

Install Playwright Chromium first with `npx playwright install chromium`. The browser suite runs the production build, so run `npm run build` first. To use an existing local Chrome installation, set `PLAYWRIGHT_CHANNEL=chrome`.

## What works

- Editorial marketing site, five age pathways, learning approach, trust, privacy, demo terms, safety, accessibility, canonical URLs, sitemap and robots policy.
- Learner dashboard, seven-step age-adapted TRIZ paper bridge mission, recorded measurements, evidence-linked skills portfolio, JSON export, clear controls, and guardian preview.
- Demo answers stay in browser tab session storage; malformed saved state recovers safely. Only synthetic notes should be entered. No child profile is created.
- Versioned mission API and health/readiness endpoints. Protected learning APIs use opaque server-side sessions, tenant and guardian authorization, active verified consent checks, parameterized PostgreSQL queries, validation, bounded request bodies, transactional auditing, and durable authenticated rate limits.
- Prisma PostgreSQL schema, deployable SQL migration, immutable mission versions, composite tenant foreign keys, safe mission seed, retention SQL, and a tested PostgreSQL repository adapter. Runtime SQL uses `pg`; Prisma owns schema/migrations and generated types.
- Per-request script nonces, CSP, security headers, secure-cookie primitives, safe error envelopes, request IDs, redacted operational logs, CI, portable Docker image and deployment/runbook documentation.

## Database (optional for the demo)

```sh
docker compose up -d db
# Use the disposable local URLs documented in compose.yaml / docs/DEPLOYMENT.md.
npm run db:validate
npm run db:generate
npm run db:migrate
npm run db:seed
```

Set both `DATABASE_URL` (pooled runtime) and `DIRECT_URL` (direct migration) in a local ignored `.env` or host secrets dashboard. Hosted connections require verified TLS. The seed inserts only versioned public mission content. It creates no accounts, child records, sessions, or consent records. `AUTH_MODE=disabled` remains the default.

## Routes

| Purpose | Route |
| --- | --- |
| Marketing | `/`, `/programs`, `/approach`, `/trust` |
| Legal and safety | `/privacy`, `/terms`, `/safety`, `/accessibility` |
| Demo | `/demo`, `/demo/lab`, `/demo/portfolio`, `/demo/guardian` |
| Operations | `/api/health/live`, `/api/health/ready` |
| Public demo content | `/api/v1/demo/missions?ageBand=10-12` |
| Future protected API | `/api/v1/auth/session`, `/api/v1/missions`, `/api/v1/attempts`, `/api/v1/evidence`, learner portfolio/evidence |
| Registration | `/api/v1/auth/register` always returns unavailable |

API details and launch gates are in [ARCHITECTURE](docs/ARCHITECTURE.md) and [SECURITY](docs/SECURITY.md). Readiness reports demo availability separately from authenticated learning and does not signify production approval.

## Deployment and release

Recommended handoff: Vercel Node.js hosting with managed PostgreSQL in an appropriate region, or the standalone Docker image behind an HTTPS reverse proxy. This exact Next.js application is not converted to a different framework to fit a Workers host. No hosting account is linked and no live deployment is claimed.

1. [Prioritized phase plan](docs/PLAN.md)
2. [Deployment, migrations, backups and rollback](docs/DEPLOYMENT.md)
3. [Verified DNS/HTTP state and provider handoff](docs/DOMAIN.md)
4. [Executed checks and screenshots](docs/QA.md)
5. [Release and tagging instructions](docs/RELEASE.md)
6. [Source provenance and unavailable historical artifacts](docs/BASELINE.md)

The GitHub integration still returned **403 Resource not accessible by integration** when creating a branch on October 18, 2026; the initial sandboxed GitHub CLI check also failed. A later network-enabled CLI check succeeded through the system keyring, and the coordinated Python-first chat owns the canonical draft PR. Repository `main` contained only its initial README at commit `92101bdfb69645acb8a4d09f87976de6742b78ff`. This reference checkout created no PR or remote tag. This isolated checkout continues the inspected v0.5 scaffold and recorded v0.4 feature requirements; the old source/design ZIPs were unavailable, so source-level parity is unverified.

Never enter passwords or tokens in chat. Configure secrets only through the hosting/database provider or an approved credential flow. Use provider-issued domain and email records, not copied sample IPs or guessed DKIM selectors.
