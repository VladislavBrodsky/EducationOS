# v0.6.0 implementation and next gates

This is the correction of the current v0.5 implementation, not a separate strategic roadmap. Earlier source is preserved, and TypeScript backend ownership is superseded by [ADR 0001](adr/0001-python-first.md).

## This release

- Preserve the public website, five-stage learner interface, seven-step TRIZ journey, evidence portfolio, export/reset, guardian preview and no-emoji SVG iconography.
- Supply public curriculum from FastAPI, with an exported OpenAPI schema, generated typed browser client, explicit loading/offline/retry behavior and no silent curriculum-version changes.
- Implement Python permission/consent checks, synthetic session repository, attempts/evidence services, SQLAlchemy persistence, Alembic/PostgreSQL/pgvector, Redis rate limiting, Python worker, read-only MCP, AI provenance/prompt/evaluation foundation and metadata observability.
- Deliver locked dependencies, tests, CI, health-gated Compose, separate database roles and deployment instructions.

Acceptance evidence is in [TESTING.md](TESTING.md). Code presence does not imply deployed infrastructure or approved enrollment.

## Next implementation priorities

1. Run the committed PostgreSQL/Redis integration and Compose suites on a Docker-capable runner; inspect forced RLS with the restricted role, schema replay, rollback and worker behavior. Resolve any failures before staging promotion.
2. Link managed hosting for the reviewed Python API/worker and Next interface, provision isolated staging PostgreSQL/Redis, run the reviewed Alembic migration, and perform backup/restore and end-to-end smoke checks.
3. Integrate verified adult identity, guardian relationship/authority and purpose consent issuance/revocation behind dedicated provider adapters. Replace synthetic provisioning rather than exposing it. Implement retention/erasure/export operations and test revocation across requests and jobs.
4. Complete independent curriculum/experiment safety, accessibility and security review, operator/support procedures, and a narrowly scoped pilot approval before enabling real learners.
5. For AI, select an explicit embedding/provider version, approved corpus and moderation process, evaluate retrieval/citation quality and adversarial inputs, then review the deployment gate. No default open chat, unrestricted uploads or learner-to-provider traffic is enabled by this release.

## Historical continuity

The recorded v0.4 capabilities remain acceptance targets, but its original ZIP is still missing. [BASELINE.md](BASELINE.md) distinguishes recovered documentation, conversation claims and locally inspected code. Browser evidence and current test counts belong to this release only.
