# Superseded TypeScript backend

These files preserve the previous Next.js route handlers, domain services,
Prisma schema/migration, and backend tests for historical review. They are
excluded from the active TypeScript build, lint, and test configuration and
must not be deployed. Their old relative imports are intentionally preserved.

The current application backend, authorization boundaries, migrations, and
tests live in `backend/` and use Python/FastAPI. No backend or database package
from this archive is required by the frontend.
