# API status · v0.5.0

The Python/FastAPI project is canonical for core REST endpoints, domain behavior, identity and permissions. This Next.js repository owns presentation and the synthetic learner experience. It does not contain an active Node authentication or learning-data service.

Every existing Next protected API route imports the unconditional `unavailable()` shim from `src/lib/protected-api.ts` and returns HTTP 503 with `Cache-Control: no-store`. No role, subject, cookie, environment setting or submitted body activates identity or persistence. The browser demo operates on synthetic data without calling a storage service.

`src/contracts/learning.ts` is a **candidate frontend contract**. Endpoint names, payloads and validation rules must be reconciled with the Python service and generated from its FastAPI OpenAPI before integration. These candidates do not establish an authoritative backend API.

The superseded TypeScript implementation, its SQL and its tests are preserved under `reference/typescript-backend/`. Those historical tests validate only that archived experiment. See [architecture](ARCHITECTURE.md) for the current ownership boundary.
