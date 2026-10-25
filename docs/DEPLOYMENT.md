# Development and deployment — Python-first

## Local development

Use Python 3.13, uv and Node 24 LTS with the committed lockfiles. Run API and web from the README. Public curriculum works without storage; PostgreSQL/Redis readiness and protected synthetic operations require services. Copy root `.env.example` to `.env.local` for Next if desired; export backend variables explicitly from the shell (see `backend/.env.example`). No real child records belong in these environments.

```sh
docker compose up --build -d
docker compose ps
docker compose logs --tail=50 migrate api worker
docker compose run --rm seed
```

The migrator runs Alembic once and must succeed before API/worker startup. The API uses `educationos_app`, a non-superuser/non-owner role. The worker uses a distinct `educationos_worker` role limited to jobs, reviewed curriculum chunks, and deleting expired evidence; it cannot read evidence payloads. Migration and seed use the local owner. The init role script runs only when PostgreSQL initializes a new volume. For an existing volume, create the runtime role explicitly with the reviewed SQL, then rerun migrations/grants; do not delete a volume as a shortcut. PostgreSQL 18 mounts its parent data directory at `/var/lib/postgresql`. Stop with `docker compose down`; the volume is retained.

Ports bind to loopback. The known development credentials and synthetic consent are local fixtures. The optional seed emits a short-lived bearer token to its calling terminal. Do not paste it into issues, screenshots, commands committed to Git or browser assets. There is no public login/provisioning endpoint.

Pinned OCI index digests and verification timestamps are in `infra/images.json`. Refresh deliberately with `python3 scripts/verify-images.py`, review changes, update Dockerfiles/Compose/CI consistently and rebuild. Digest verification proves registry existence, not a local container run or security audit.

## Environment contract

| Variable | Scope | Purpose |
|---|---|---|
| `PYTHON_API_URL` | Next server, dev startup / production build | FastAPI origin used by rewrites; local `http://127.0.0.1:8000`, Compose `http://api:8000` |
| `EDUCATIONOS_ENVIRONMENT` | Python | development/test/staging/production; staging and production close private learner APIs and synthetic seeding |
| `EDUCATIONOS_DATABASE_URL` | Python runtime | `postgresql+psycopg://` restricted runtime role; managed verified TLS in hosting |
| `EDUCATIONOS_REDIS_URL` | Python | private authenticated Redis with TLS for hosting |
| `EDUCATIONOS_ALLOWED_ORIGINS` | Python JSON list | exact browser origins; production HTTPS only |
| `EDUCATIONOS_OTLP_ENDPOINT` | Python optional | trusted private OTLP collector; no evidence or credentials in spans |
| `EDUCATIONOS_TEST_DATABASE_URL` | test runner only | disposable admin database for integration suite |
| `EDUCATIONOS_TEST_APP_DATABASE_URL` | test runner only | restricted role in same disposable database |

Supply a distinct owner database URL only to the controlled Alembic migration job. Do not inject migration credentials into API or worker. `PYTHON_API_URL` is intentionally server-only; never use `NEXT_PUBLIC_` for secrets. Rewrites are compiled into the Next production build, so changing only the runtime variable does not redirect an already-built image.

## educationos.space target

The learner portal has a separate surface prepared for `app.educationos.space`. See [PORTAL_DEPLOYMENT.md](PORTAL_DEPLOYMENT.md) for hostname routing, local preview, hosting choices and the DNS handoff. The public website remains at the apex domain.

Preferred architecture: managed Next hosting or the supplied standalone web container; a managed Python container service for API and worker; managed PostgreSQL 18 with pgvector; private Redis; a TLS ingress that routes the canonical `https://educationos.space` UI and `/api/v1/*` to Python. With Vercel, set server-only `PYTHON_API_URL` to the real protected Python service HTTPS origin at build. Health probes go directly to Python `/health/live` and `/health/ready`. The Python service must not depend on Next for authorization.

The Next marketing and learner surfaces are hosted on Railway at the apex and `app` hostnames; see [DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md). A separate Railway `staging` environment now runs private PostgreSQL 18.6 with pgvector 0.8.7 and authenticated Redis. Neither database service has a public domain or TCP proxy. The Python API and migration job are configured in a pending staging patch but have not been deployed; no migration has run. A restricted `educationos_app` role exists without superuser, role-creation or row-security-bypass privileges. The API's staging mode requires PostgreSQL, authenticated Redis and exact HTTPS origins, while keeping private learner APIs and synthetic seeding closed. Do not use Node-only hosting for the Python service. Complete the migration and verify runtime grants before connecting the frontend. Configure network access, secrets, TLS verification for production, connection pools, request/body time limits, traffic limits, telemetry retention and alerts. Keep preview environments separate from production data and credentials. Disable or redact ingress logs containing IPs, query strings or authorization headers.

1. Deploy the reviewed images/commit to an isolated staging environment with enrollment and AI still closed.
2. Take a backup; run `uv run --frozen alembic upgrade head` as a single protected migration job. Inspect `alembic current` and verify restricted runtime role grants/RLS.
3. Verify liveness/readiness, public curriculum, negative protected requests, UI live and offline paths, all seven mission steps, mobile/keyboard layout and draft notices.
4. Rehearse database restoration into an isolated target; record recovery duration and policy. Keep the last reviewed application image for rollback. A code rollback does not undo a schema migration; prefer compatible forward fixes. Use downgrade only on disposable test databases unless a reviewed recovery plan authorizes it.
5. Complete the domain handoff in [DOMAIN.md](DOMAIN.md) using exact provider-issued DNS values. Preserve mail records. Verify apex/www HTTPS certificates, canonical redirects, path/query preservation and actual application content externally before recording a deployment.

The checked-in CI validates source; it does not deploy, change DNS or enable accounts. Production enrollment, external identity/consent, retention/deletion, support, curriculum approval and independent security review remain explicit gates.

Official guidance: [FastAPI containers](https://fastapi.tiangolo.com/deployment/docker/), [Compose health/start order](https://docs.docker.com/compose/how-tos/startup-order/), [Next self-hosting](https://nextjs.org/docs/app/guides/self-hosting), [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).
