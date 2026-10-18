# Persistence status · v0.5.0

Python/FastAPI is the canonical core service. Its SQLAlchemy models and Alembic migrations own production persistence. This Next.js presentation repository has no active database connection, domain repository or storage activation setting.

Experimental TypeScript-backend SQL, role definitions and retention operations are retained in `reference/typescript-backend/db/` for historical review. They are **not production migrations** and must not be applied as the Python service's schema. Historical PGlite tests exercise that archived SQL only; they do not validate the canonical Python database or Alembic history.

Before connecting the frontend, reconcile versioned mission/evidence contracts, tenant/learner/adult permissions, consent, retention and deletion requirements with the Python project's authoritative models and APIs. Generate frontend contract types from FastAPI OpenAPI once that contract is approved. See [architecture](ARCHITECTURE.md).
