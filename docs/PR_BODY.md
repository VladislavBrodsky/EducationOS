EducationOS now uses Python/FastAPI for API contracts, permissions, TRIZ learning services, PostgreSQL persistence, tasks, AI tooling and read-only MCP. The existing responsive Next.js experience remains the presentation layer and consumes generated types from the exported FastAPI OpenAPI schema. Prior Node/Prisma services are archived as superseded reference.

This source milestone includes Alembic/pgvector, Redis limits, synthetic-only permission tests, contract drift checks, CI and separate-role Docker Compose. Real enrollment and learner-facing generative AI remain closed. The missing original v0.4 source archive is documented; no production deployment or curriculum efficacy is claimed.

See docs/TESTING.md for actual validation and environment limits, docs/adr/0001-python-first.md for the architecture decision, and docs/DEPLOYMENT.md for the educationos.space staging/cutover procedure.
