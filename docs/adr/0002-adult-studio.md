# ADR 0002 — Adult curriculum workspace

Accepted for v0.6.0, 28 October 2026

Python owns authentication, roles, consent intent, curriculum validation, moderation flags, version transitions, and persistence. Next.js supplies a same-origin browser interface at `/studio` and a narrowly allowed forwarding route. No client-supplied role or tenant is trusted.

An operator provisions an adult-attested account in a tenant with one role: educator, reviewer, or guardian. Educators write five age variants with seven TRIZ steps. An independent reviewer explicitly confirms their safety review before publication. Every write uses an expected version and atomically appends a revision and audit event. Editing a published mission creates a new draft while the previous approved snapshot remains public. Published studio snapshots use `/api/v1/curriculum/published`; the original reviewed Inventors Lab catalog remains unchanged.

PostgreSQL migration 0002 is additive to the frozen foundation. Runtime credentials cannot provision accounts or mutate revision/audit history. Database triggers also reject history mutation by the table owner. Adult/studio tenant and role authorization is enforced by Python on every private request; the legacy learner tables retain forced PostgreSQL row security. Adult authentication lookups and public published snapshots intentionally do not use tenant RLS. This is a documented boundary, not a claim that all database reads are tenant isolated.

Opaque sessions expire in eight hours, are stored as hashes, and use HttpOnly SameSite Strict cookies. Cookie-authenticated writes require a session-bound CSRF token. Passwords use salted scrypt. Only a hash of the normalized adult email locator is stored; this is pseudonymous personal data, not anonymous data. Logs omit credentials, request bodies and raw identifiers. Adult sessions and consent intent remain unavailable in production.

Guardian acknowledgement records only a policy version, purpose, adult account and timestamps. Status is pending verification or revoked. It never creates or activates a child profile. There are no child identity documents or dates of birth. No legal validity, identity verification or mastery claim is inferred. Heuristic text moderation assists a human reviewer; it is neither comprehensive nor a safety certification.

An identity provider with MFA and verified adult eligibility, launch-jurisdiction review, valid guardian authorization, deletion/retention workflows, independent security assessment, and safeguarding review remain release gates. The milestone has no unrestricted child AI and makes no production launch claim.
