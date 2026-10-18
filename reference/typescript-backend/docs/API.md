# Learning API foundation · v0.5.0

> Historical reference only. Python/FastAPI supersedes this TypeScript experiment. See [archive status](../README.md).

Contract version: `2026-10-18.v1`. Executable schemas and inferred TypeScript types live in `src/contracts/learning.ts`. Every input object rejects unknown keys. IDs are UUIDs; dates are ISO 8601 UTC strings; attempts always pin a `missionVersionId`.

## Runtime status

**All protected routes intentionally return HTTP 503 in this release.** `src/server/runtime.ts` supplies no identity or persistence adapters. The interactive learner experience uses synthetic browser data and does not submit to these routes. No request header, body role, cookie value, or environment flag enables storage.

`createLearningApi({ auth, repository, origin })` is the testable integration seam. The `auth` adapter must verify a server session and supply a trusted principal. The `repository` must independently enforce tenant, learner, consent and contribution permissions. `origin` is an exact configured HTTPS origin; it must not be derived from incoming Host or forwarding headers. The supplied PostgreSQL repository uses a fresh transaction and transaction-local scope for every operation.

## Routes

| Method | Route | Contract / behavior |
| --- | --- | --- |
| GET | `/api/v1/missions?learnerId={uuid}` | Returns `{ missions: PublishedMission[] }` for the authorized learner's age band. Published versions remain individually identifiable. |
| GET | `/api/v1/missions/{missionVersionId}?learnerId={uuid}` | Returns `{ mission: PublishedMission }`; requires an age-band match. |
| POST | `/api/v1/attempts` | Input `{ learnerId, missionVersionId }`; returns `{ attempt: Attempt }` with 201. |
| GET | `/api/v1/learners/{learnerId}/evidence` | Returns `{ evidence: Evidence[] }`, limited to 200 recent unexpired records. Pagination/export beyond that limit is a future integration. |
| POST | `/api/v1/learners/{learnerId}/evidence` | Input `{ attemptId, step, payload }`; returns `{ evidence: Evidence }` with 201. The active attempt must belong to this learner. |
| POST | `/api/v1/attempts/{attemptId}/complete` | Completes only after persisted evidence exists for all seven steps; returns `{ attempt: Attempt }`. Completion counts evidence presence, never mastery. |

Mutations require `Content-Type: application/json` where a JSON body is accepted, an exact matching `Origin`, and an authenticated server session. Cross-site `Sec-Fetch-Site` values are rejected. A streaming 8 KiB limit applies before JSON parsing; a false or missing `Content-Length` does not bypass it. The completion route does not accept client completion scores or state.

Evidence supports these payloads only:

```json
{ "kind": "reflection", "text": "Synthetic example: folding added stiffness." }
```

```json
{ "kind": "measurement", "label": "Folded paper", "value": 8, "unit": "blocks" }
```

Text kinds are `idea`, `observation`, `reflection`, with 1–1,200 trimmed characters. Measurements require a label of 1–80 characters, a finite number from 0 through 10,000, and a unit of `blocks`, `grams`, `centimeters`, or `seconds`. The API accepts no uploads, image URLs, audio, dates of birth, contacts, locations, teacher messages or identity fields. Free text can still contain personal information; these shape restrictions are **not** a privacy filter. Protected intake stays disabled.

Seven ordered step keys: `notice`, `contradiction`, `imagine`, `hypothesis`, `experiment`, `reflect`, `transfer`.

## Identity and errors

The reusable `OpaqueCookieAuthenticator` accepts exactly one `__Host-educationos-session` cookie containing a 32-byte random base64url token. Only its SHA-256 hash is looked up in a server store. Expired, revoked, unknown and malformed sessions fail. `Authorization`, `x-user-id`, `x-user-role`, `x-tenant-id`, query parameters and body fields never establish a principal. There is no public sign-in/session issuance route in v0.5.0.

Every response uses `Cache-Control: no-store` and `X-Content-Type-Options: nosniff`. Errors have `{ "error": { "code": "…", "message": "…" } }`:

| Status | Code | Meaning |
| --- | --- | --- |
| 400 | `INVALID_INPUT` | Invalid contract or insufficient step evidence. |
| 401 | `UNAUTHENTICATED` | No valid server session. |
| 403 | `FORBIDDEN` | Mutation origin rejected. |
| 404 | `NOT_FOUND` | Missing or unauthorized learner, attempt, or mission. |
| 413 | `TOO_LARGE` | Body exceeds the limit. |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | JSON endpoint received another media type. |
| 503 | `UNAVAILABLE` | Protected storage has not been integrated. |
| 500 | `INTERNAL_ERROR` | Generic internal failure; no SQL, evidence or token details are returned. |

Rate limiting, abuse controls, session provisioning/recovery, end-to-end identity provider verification, production PostgreSQL deployment and audit logging remain release gates. Repeated attempt creation is not idempotent yet; clients must not automatically retry successful creates without a future idempotency contract.

Schema library reference: [Zod API](https://zod.dev/api).
