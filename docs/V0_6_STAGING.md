# Adult studio v0.6.0 staging

This release is an adult-only local/staging scaffold, not a production child learning service. The current public marketing/portal sites are separate deployments. Nothing in this release changes DNS or deploys this milestone.

## Reproducible local stack

Requires Docker Compose, or Python 3.13 + uv 0.10.11, Node 24/npm and PostgreSQL with pgvector plus Redis. The committed `backend/uv.lock` and `package-lock.json` pin dependencies; container images are digest pinned.

```sh
docker compose up --build --wait api web
docker compose run --rm migrate python -m educationos.seed_adults --role educator --tenant 60000000-0000-4000-8000-000000000001 --adult-attested
docker compose run --rm migrate python -m educationos.seed_adults --role reviewer --tenant 60000000-0000-4000-8000-000000000001 --adult-attested
```

The provisioning commands specify a shared sample tenant and separate roles, then prompt for adult email and password. Run it once for an educator, once for a reviewer with the same tenant UUID, and optionally a guardian. Use synthetic adult identities for testing; no founder details or passwords belong in Git, screenshots or this document. Open `http://127.0.0.1:3000/studio`. No default account exists. Use separate browser contexts for educator/reviewer. The Compose migration credential is local-only; do not expose this stack to the internet.

Without Docker, export backend settings explicitly from `backend/.env.example`, create managed/local migration and restricted runtime roles according to `infra/init-runtime-role.sql` using generated passwords, then:

```sh
cd backend
uv sync --frozen
# Use the owner/migration URL only for the next two commands
uv run --frozen alembic upgrade head
uv run --frozen python -m educationos.seed_adults --role educator --tenant 60000000-0000-4000-8000-000000000001 --adult-attested
# Repeat with --role reviewer and a separate adult email/password in the same tenant
# Switch EDUCATIONOS_DATABASE_URL to the restricted application role
uv run --frozen uvicorn educationos.main:app --host 127.0.0.1 --port 8000 --no-access-log
```

At repository root: `npm ci`, then `npm run dev`. Set `EDUCATIONOS_API_INTERNAL_URL` and `PYTHON_API_URL` to the private FastAPI origin; these are server-only. Public curriculum works offline, but adult writes require migrated PostgreSQL and a healthy Redis rate limiter.

## Isolated hosted staging

Use a separate Railway environment (the existing project records identify Railway), or any container host with private PostgreSQL/Redis. Do not reuse production data or automatically attach production domains. Build API from `backend/Dockerfile` and web from `Dockerfile`. PostgreSQL requires pgvector. Use a one-off owner migration job before starting a restricted app role; migrations grant only required runtime privileges when that role already exists. Run the owner provisioning command only in an operator session, never in a public web endpoint.

Set `EDUCATIONOS_ENVIRONMENT=staging`, a generated PostgreSQL URL, authenticated Redis, and exact `EDUCATIONOS_ALLOWED_ORIGINS=["https://<actual-staging-host>"]`. Prefer private verified TLS connections; production config requires verify-full PostgreSQL and rediss. Set web `EDUCATIONOS_STUDIO_ORIGIN=https://<actual-staging-host>` to the exact external HTTPS origin, matching the backend allowed origins. This protects writes when the container request address differs from the public address; forwarded-host headers are not trusted. Set `EDUCATIONOS_API_INTERNAL_URL` at runtime and `PYTHON_API_URL` at build time to the reachable private API origin. Set `EDUCATIONOS_SURFACE=auto` and `DEPLOYMENT_ENV=development` for noindex staging. API listens on 8000, web on 3000; health checks `/health/ready` and `/studio`. Restrict staging to invited adult testers at the provider access layer. Secure cookies require HTTPS. Never log upstream bodies, cookies or passwords.

Smoke checks: readiness 200 after Alembic 0002 + Redis; login/session/logout; educator draft + stale conflict; different reviewer approves exact revision with safety acknowledgement; old public snapshot stays stable during edits; guardian pending acknowledgement + revoke; child profile POST 503; AI POST 503. Record real results and roll back code only if compatible with the additive schema. Back up first; 0002 downgrade deletes all adult/studio records and is for disposable rehearsal only.

## CI and staging delivery

`.github/workflows/ci.yml` runs Python unit/auth/security tests, real disposable PostgreSQL/Redis migration and race tests, frontend behavior/build/accessibility checks, container smoke, and locked-runtime dependency audits. `.github/workflows/staging-images.yml` provides an explicitly dispatched staging build and smoke workflow; optional image publication tags both GHCR images with the full commit SHA. It does not deploy or change DNS. Repository administrators must configure the GitHub `staging` environment protection rules and package permissions; their presence is not assumed. Select the tested image digest in the actual provider staging service only after reviewing the run.

## DNS handoff grounded in observation

28 October 2026: direct DNS returned A `69.46.46.105`, no AAAA answer, and authoritative nameservers `dns1.registrar-servers.com` / `dns2.registrar-servers.com`. HTTPS returned 200 and Railway response headers; HTTP redirected to HTTPS. This is an observation of existing infrastructure, not a static IP recommendation or proof this release is deployed. Historical project documentation identifies Namecheap and Railway; do not overwrite the live zone from an old record.

No new DNS records are needed for a provider-issued staging URL. If a custom staging name is desired, first obtain the exact domain target and ownership TXT value from Railway's Networking domain panel for the actual staging web service. In Namecheap Advanced DNS, add the provider-issued CNAME for that subdomain and the exact verification TXT host/value only after comparing with the current zone. Do not replace apex, www, app, MX, SPF, nameservers or DNSSEC. No target or verification token for a new studio hostname has been issued here, so none is invented. Verify HTTPS and ownership before inviting testers. [Railway domain documentation](https://docs.railway.com/guides/public-networking#custom-domains)

Required handoff input for hosted work: confirm the intended staging service/environment and authorized access. Registrar access is needed only if a new custom staging hostname is requested. Existing services should not be repointed for this milestone.
