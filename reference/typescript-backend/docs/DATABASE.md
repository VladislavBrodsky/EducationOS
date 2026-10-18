# Database foundation · v0.5.0

> Historical reference only. Python/FastAPI supersedes this TypeScript experiment. See [archive status](../README.md).

PostgreSQL is the target persistence engine. No database connection is required for the synthetic UI. The reusable SQL adapter is present, but the runtime does not connect it to HTTP routes.

## Migration files

- `db/migrations/001_foundation.up.sql`: transactional schema, constraints, triggers, indexes and RLS policies.
- `db/application-role.sql`: separate deployment administrator script creating a non-login, non-owner application group role and minimal grants. Grant this group role to the server's separately provisioned connection role.
- `db/migrations/001_foundation.down.sql`: destructive rollback for a disposable development database. Back up and obtain the appropriate operational approval before using it against persisted data.
- `db/retention.sql`: maintenance deletion statement for expired evidence. Provision and schedule a separate maintenance role before claiming deletion occurs.

For a disposable local PostgreSQL database, an administrator can apply the upward migration and then the role script with the PostgreSQL client. The migration does not create users, assign passwords, seed learners, grant session access, or run a production migration runner. Record migration checksums and successful versions in the deployment's migration system; do not repeatedly apply the same numbered migration.

## Model

| Table | Purpose / boundary |
| --- | --- |
| `tenants` | Household/organization boundary using a random ID. |
| `adult_accounts` | Provider subject scoped to tenant; no copied contact profile. |
| `learners` | Random ID and age band; no names or exact birth dates. |
| `learner_grants` | Explicit guardian/educator relationships and read/contribution permissions. |
| `consent_records` | Notice version, learning-evidence purpose, guardian reference, grant/expiry/revocation; verification workflow pending. |
| `missions` | Stable authored mission identity. |
| `mission_versions` | Numbered authored versions; published rows immutable. |
| `attempts` | Learner/tenant plus an immutable version pin; active/complete state. |
| `evidence` | Append-only application records linked by tenant + learner + attempt composite foreign key; bounded JSON payload and maximum 30-day deadline. |
| `sessions` | Opaque token hashes and server-assigned principals; denied to application role. |

Published versions require seven unique ordered TRIZ step keys. The publisher must validate the complete document against `missionContentSchema` before inserting/publishing. The database additionally checks version numbering, title/age/world constraints, content size, ordered step keys and publication timestamps. It does not validate every nested prompt/material string against the complete Zod contract; the publisher workflow is not yet implemented. The adapter validates mapped published documents on read and fails rather than return malformed content. Mission content is global authored content, not tenant-specific child data. A draft is invisible to the application role; edit a new draft and publish a new numbered version to change a mission. Unpublishing/takedown management is a future control; immutable versions cannot simply be overwritten.

The five allowed age/world pairs are Curiosity Grove (5–6), Builder Harbor (7–9), Orbit Lab (10–12), Future City (13–15), Frontier Studio (16–17). Attempt insertion requires a published version with the learner's recorded age band. Completion requires evidence for all seven steps and does not assert skill mastery.

## RLS and adapter

`PostgresLearningRepository` accepts a structural `SqlPool` interface compatible with a PostgreSQL driver. The deployment supplies the actual driver and credentials. It starts a transaction, sets `educationos.tenant_id`, `educationos.actor_kind`, `educationos.account_id`, and `educationos.learner_id` with parameterized `set_config(..., true)`, performs the operation and commits/rolls back before releasing the connection. Transaction-local context prevents a reused connection from retaining the previous request's identity.

Use the application role for that pool. Do not use the schema owner, a superuser, a role with `BYPASSRLS`, or shared browser credentials. Do not copy principal IDs from HTTP headers or bodies. The session store uses a **different identity-service pool**; its role and narrowly scoped session policy intentionally remain deployment work. No broad application session policy is supplied.

Reads/writes of attempts and evidence require a current unrevoked consent record with the learning-evidence purpose, an authorized learner scope, and contribution rights for mutations. Foreign keys forbid attaching evidence to another learner's attempt even if the tenant matches. Published mission/version and attempt identity fields are protected by triggers; application grants further restrict modification.

## Verification and remaining work

`tests/db-migrations.test.ts` runs the actual SQL through PGlite's embedded PostgreSQL engine. It creates the restricted role, changes role for adversarial queries, checks default deny, cross-tenant and sibling access, linked adult contribution limits, consent revocation/expiry, evidence expiry and privileged purge, version immutability, pinned attempts and evidence/completion constraints. A real repository workflow performs learner lookup, mission reads, attempt creation, seven evidence submissions (including a manual blocks measurement), early/final completion, mapped output validation, adult read-only/cross-tenant denial and transaction-context cleanup. A separate disposable database applies the downward migration and reapplies the upward migration.

PGlite tests establish executable PostgreSQL semantics in this repository. They do not substitute for deployment tests against the chosen PostgreSQL version, driver, network, credentials, pool and backup configuration. Production migration tracking, pool integration, session identity policy, consent administration, mission publishing, automated retention/deletion, privacy export and operational observability remain open.

Primary reference: [PostgreSQL row security policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).
