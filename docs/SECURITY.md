# Security boundaries — v0.6.0

Real child enrollment and learner-facing generative AI are unavailable in code. The release accepts synthetic development fixtures only; production rejects synthetic private sessions. Public legal/trust notices are draft operational information, not a certification or a guardian-consent mechanism.

Python authenticates opaque bearer tokens by hash, expiry and revocation, then checks server-owned tenant, learner grant and active learning-purpose consent. Roles/IDs in browser headers cannot establish permission. Learner, guardian and educator relationships are scoped to a learner; evidence belongs to an active attempt and published mission version. Forced PostgreSQL tenant row policies must run under the restricted role; owners/superusers/migration credentials must not be used for request handling. Tests must cover both application policy and actual PostgreSQL RLS.

The synthetic seed is command-line-only, development-only and must never become public identity issuance. No verified adult identity, age assurance or legal guardian proof has been integrated. The guardian preview and consent fixtures convey no authority over real records. Withdrawal, deletion, authenticated export and backup expiry require complete operating workflows before a pilot.

Treat user notes and retrieved text as untrusted data. Do not place evidence, tokens, raw URLs/query strings, IPs or database URLs in logs/traces. Only bounded request IDs, route templates, duration/status and safe error codes belong in operational telemetry. Check upstream host/ingress defaults too. Redis failure closes protected rate-limited access; public edge abuse protection remains a hosting responsibility.

Use provider secret managers, verified TLS, separate staging/production data and migration/runtime credentials. Never expose PostgreSQL/Redis publicly. Lock dependency versions, review upgrades and retain exact image digests. Untrusted PR CI receives no production secrets. See [AI_SAFETY.md](AI_SAFETY.md) for prompt/provenance/evaluation boundaries and [DEPLOYMENT.md](DEPLOYMENT.md) for infrastructure.

Before real accounts, complete external adult identity/authority and revocable consent, purpose/data minimization policy, erasure/export/retention and restore drills, independent security/accessibility/curriculum/experiment review, operator incident response and support. Do not infer legal compliance, learning efficacy or full accessibility from a clean automated suite.

Report sensitive security findings privately through the repository owner's configured private channel. No operational safeguarding/support service is established by this code release.
