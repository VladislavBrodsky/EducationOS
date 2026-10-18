# Security and privacy boundaries · v0.5.0

> Historical reference only. Python/FastAPI supersedes this TypeScript experiment. See [archive status](../README.md).

## Release posture

EducationOS v0.5.0 is a synthetic demonstration and an application foundation. **It is not approved for collecting real child data and does not claim production safety or regulatory compliance.** Protected learning APIs return 503 until trusted identity, verified adult relationships/consent, persistence, operations and a security review are integrated. No analytics, advertising, social features, external AI calls or uploads are part of this slice.

The age selector changes the synthetic learning presentation. It does not prove age, create an account, verify a guardian, or grant a permission. Learner and guardian previews are presentation routes; they do not authenticate a person.

## Trust boundaries implemented

1. **Identity stays server side.** A principal is derived from an opaque server session, never from caller-provided role, subject, tenant, bearer text or learner selection. Tokens are 256-bit random; storage receives only a SHA-256 token hash. Cookie helpers set `__Host-`, `Secure`, `HttpOnly`, `SameSite=Strict`, `Path=/`, no Domain and at most a one-hour lifetime. Issuance is not exposed. Revocation and expiry are checked on every authenticated request.
2. **Learners stay within their record.** A learner principal can read/contribute only to its own learner ID within its tenant and with active consent. Requests for another record return the same generic 404 as missing records.
3. **Adults require a relationship.** A tenant membership or an adult role alone grants no learner access. Each learner relationship records explicit read and contribution permissions. A read-only educator cannot submit evidence. Consent rows alone do not establish adult access.
4. **Persistence repeats the boundary.** The repository uses parameterized SQL and transaction-local principal scope. SQL policies enforce tenant, learner/adult relationship and active consent for attempt/evidence access. RLS is enabled and forced. The application group role is neither an owner, superuser nor `BYPASSRLS`; it has no account, grant, consent, mission publishing or session write privileges. Session lookup requires a separate identity service role and policy that are not provisioned here.
5. **Writes have a narrow surface.** Exact configured Origin checks, Fetch Metadata, strict JSON objects, a streaming 8 KiB request limit and bounded fields protect the API boundary. These are defense layers; future identity integration still needs session fixation protections, rotation/recovery policy, CSRF review, rate limits and abuse controls.
6. **Progress remains evidence, not a diagnosis.** Seven-step completion requires stored evidence presence. Mission versions become immutable when published, and attempts cannot move to another learner/version. Evidence is append-only through the application; no invented mastery, intelligence or risk scores are derived.

## Data minimization

The database learner record contains a random ID, tenant ID, coarse age band and creation timestamp. It has no legal name, birth date, email, phone, photo, location or school identifier. Adult accounts hold an identity provider subject, not a copied adult profile. Relationship and consent metadata are restricted. Learning evidence is bounded text or manual numeric observations; no media ingestion exists.

Pseudonymous identifiers and learning evidence may still be personal data. Minimizing fields does not make a learner anonymous.

Free text may contain sensitive information despite a bounded schema. The current demo must use synthetic examples only. Before enabling intake, add age-appropriate copy, adult review, collection purpose and retention notices, appropriate input handling and safeguarding workflows. No automatic text filter can establish privacy safety.

Evidence receives a maximum 30-day retention deadline. The application RLS policy hides expired evidence immediately. `db/retention.sql` supplies a privileged deletion operation, **but no production scheduler, backups expiry process, account deletion or verified privacy-request workflow is installed**. A timestamp and hidden row do not prove deletion. Consent expiry/revocation prevents further attempt/evidence access; deletion and legally required retention need an approved workflow.

Retention periods and purge workflows for learner/attempt metadata, adult subjects, relationships, consent records and expired session hashes are also unresolved. The supplied evidence purge does not delete these other records.

## Assumptions and limitations

- The server and database credentials are trusted. End users must never receive a database connection or arbitrary SQL access. Session-setting SQL context is a server boundary, not protection against a compromised server or direct SQL user.
- Migration owners/superusers can bypass policies. Production must verify actual role grants, connection pooling, transaction cleanup and policies against deployed PostgreSQL, separately from the embedded test engine.
- Consent records capture structure, purpose, notice version, grant/expiry/revocation times and a guardian account reference. A verified guardian provisioning and consent workflow is **not implemented**. Provisioning roles must verify the relationship; inserting a row is not proof of consent. Revoking a relationship does not automatically revoke a consent row; these are distinct administrative actions that must be coordinated.
- The identity adapter and session issuance lifecycle are not connected. No password storage, identity document intake or child authentication flow is present.
- No audit log, incident process, key management, deployment secret handling, backup encryption, regional storage policy, restore exercise, accessibility certification or formal legal review is complete.
- The browser demo is not a storage location for real child data. Local demo reset does not represent a verified privacy erasure request.

## Gates before real users

- Select and integrate the identity provider; verify issuer/audience/state/nonce/PKCE as appropriate. Add account recovery, session rotation/revocation and carefully tested adult and child provisioning.
- Verify adult authority and explicit relationships; define educator scope. Implement consent, withdrawal, export/deletion and safeguarding processes for the intended jurisdictions and age groups with qualified review.
- Deploy PostgreSQL with distinct owner, app, identity, publisher, consent administration and retention roles; verify RLS with actual production drivers and pool configuration. Connect only audited adapters in `src/server/runtime.ts`.
- Add rate/usage controls, operational logs that exclude raw evidence/tokens, monitoring, retention scheduling, encrypted backups, restore testing and an incident response owner.
- Perform threat modeling, dependency and deployment review, independent security/privacy assessment and representative accessibility/user testing.

Tests cover forged identity headers, malformed/revoked/expired cookies, cross-tenant/learner requests, adult read-only access, missing consent, exact Origin checks, request size/shape validation, generic error handling, non-owner SQL RLS, immutable versions, attempt pinning and evidence contracts. Tests document implemented controls; they do not certify this product safe for children.

Primary reference: [PostgreSQL row security policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).
