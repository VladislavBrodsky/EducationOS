# Security and privacy status · v0.5.0

This repository is a synthetic Next.js presentation demo. It is not approved to collect real child data and makes no production safety or regulatory compliance claim.

The canonical Python/FastAPI service owns identity, sessions, adult/child permissions, core learning behavior and persistence. No Node domain/authentication service is active here. All Next protected API routes call one unconditional, non-cacheable HTTP 503 shim. There is no identity provisioning, storage connection or activation setting in that shim.

The learner age selector and adult preview affect presentation only. They do not authenticate a user, verify age or guardian authority, establish consent, or grant access. Use synthetic examples only. The candidate frontend contract limits data shape but does not prevent personal information from appearing in text.

Before integration, the Python project must provide and validate its authoritative security/privacy boundaries, including trusted identity, explicit tenant/learner/adult relationships, verified consent, least-privilege persistence, retention/deletion, operational controls and appropriate review. Next should consume the reviewed Python API and generated OpenAPI contract without duplicating those domain rules.

The archived TypeScript experiment and its security notes under `reference/typescript-backend/` remain historical evidence only. Passing its tests does not certify the Python service or this product safe for children. See [architecture](ARCHITECTURE.md) for current ownership.

Response headers disable framing and sensitive device features, reduce referrer exposure, and set a same-origin Content Security Policy. The current CSP permits inline scripts and styles for the Next.js shell. A reviewed nonce/hash policy, deployed HTTPS configuration, and independent security assessment remain integration work; these headers alone do not establish production readiness.
