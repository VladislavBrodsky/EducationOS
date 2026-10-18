# Superseded TypeScript backend reference

This directory preserves the completed TypeScript backend experiment as historical reference. **Python/FastAPI is the canonical core REST, domain and authentication implementation, with SQLAlchemy and Alembic for persistence.** This archived implementation is not wired into the Next.js application and must not be presented as its active backend.

Contents retain a portable relative layout:

- `src/server/`: session, authorization, API and abstract PostgreSQL adapter experiment.
- `src/contracts/learning.ts`: a snapshot of the candidate contract used by this experiment.
- `db/`: experimental SQL migrations, application role and retention operation. These are not the canonical production migrations; the Python service owns Alembic migrations.
- `tests/`: executable historical contract, auth, API and embedded PostgreSQL tests.
- `docs/`: archived API, database and security notes, describing this superseded experiment only.

The historical tests remain useful regression evidence for the experiment. Passing them does not validate the Python service or establish production safety. The current frontend contract in `src/contracts/learning.ts` at the repository root is a candidate to reconcile with and ultimately generate from FastAPI OpenAPI. It is not authoritative for the Python service.

All active Next protected routes call `src/lib/protected-api.ts` and return an unconditional, non-cacheable 503 until the Python service integration is reviewed and connected. The frontend demo uses synthetic data only; no real child intake is enabled.
