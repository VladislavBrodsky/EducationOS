# PostgreSQL, pgvector and Alembic

`backend/alembic/versions/0001_python_foundation.py` is the active frozen migration history. SQLAlchemy 2 models live in `backend/src/educationos/models.py`; psycopg async connects to PostgreSQL. Old SQL/Prisma history is archived as superseded reference and must not be applied to this schema.

The schema contains synthetic tenants, opaque hashed sessions, learner age bands, scoped guardian grants, expiring/revocable synthetic-learning consent, immutable mission versions, attempts, private bounded evidence, curated public chunks and allowlisted maintenance jobs. Composite foreign keys constrain attempt/evidence ownership to tenant and learner. Mission updates/deletes are rejected: publish a new version instead. The `vector` extension and a 384-dimensional nullable vector column are foundation only; no production embedding provider/model has been selected.

## Roles and policies

- Migration/seed owner: schema changes and explicit synthetic fixture provisioning only.
- `educationos_app`: reads authentication and published curriculum, reads tenant-scoped learner/grant/consent rows, and reads/writes attempts/evidence. It cannot issue sessions, consent or grants.
- `educationos_worker`: public curriculum-chunk indexing and maintenance-job rows; limited expiry-only evidence delete/read of retention timestamp. It cannot read evidence payloads or issue identity/consent.

All runtime roles are non-superuser, non-owner and `NOBYPASSRLS`. Private tenant tables have forced row security. After authenticating an opaque session, Python sets transaction-local `app.tenant_id`; absent/wrong context must return no private rows. The maintenance role has explicit expiry policies rather than tenant-policy bypass. Do not grant it broad evidence SELECT.

`infra/init-runtime-role.sql` is for local synthetic development with known passwords; hosted roles require generated secrets through the provider. Create roles before running migration so its conditional grants apply. Re-running an already-applied migration does not add grants for a newly created role; inspect and apply the exact reviewed GRANT statements when adding roles later.

## Migration and verification

```sh
cd backend
uv run --frozen alembic upgrade head
uv run --frozen alembic current
uv run --frozen alembic upgrade head --sql > /tmp/educationos-migration.sql
uv run --frozen pytest -v
```

`EDUCATIONOS_DATABASE_URL` for Alembic must be the migration role. Request/worker URLs must be their restricted roles. The PostgreSQL suite uses `EDUCATIONOS_TEST_DATABASE_URL`, `EDUCATIONOS_TEST_APP_DATABASE_URL` and `EDUCATIONOS_TEST_WORKER_DATABASE_URL` in a disposable database. It exercises schema replay, restricted runtime access, missing/cross-tenant row context, immutable versions, worker restrictions/expiry and downgrade/replay. SQLite tests exercise application behavior and cannot prove PostgreSQL RLS, pgvector or locking semantics.

Never run the integration suite or downgrade against a valuable database; it tears down its own schema. Local Compose creates an isolated named database volume; CI uses disposable services. Test execution evidence belongs in [TESTING.md](TESTING.md).

Expired evidence is omitted from reads, and the periodic Python maintenance worker purges expired records. This foundation does not implement complete guardian/account erasure, backup expiry, a verified durable retry queue or restore operations. Before real data, define retention, schedule/monitor maintenance, rehearse restore and ensure withdrawal/erasure reaches all storage and backups.
