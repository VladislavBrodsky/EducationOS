# Security and child-data launch gates

## Current release boundary

v0.5.0 supports a synthetic demo and a production-oriented application foundation. It is not an approval to create real child profiles. Protected learning storage fails closed pending audited identity, consent-verification and database runtime integrations. No client-controlled role, consent checkbox, unsigned cookie or environment convenience switch should bypass that boundary.

The public legal and safety pages are draft operational notices. Before any real-account pilot, the operator must verify that they describe the actual service, identify the operating entity and support contact, and obtain a review for launch jurisdictions. This document defines engineering controls; it does not assert legal compliance or third-party certification.

## Implemented controls and required review

| Boundary | Foundation behavior | Required before real-account use |
| --- | --- | --- |
| Authentication | Server-session primitives use high-entropy opaque tokens, store token hashes, enforce expiry/revocation and set `__Host-`/Secure/HttpOnly/SameSite cookies | Provider-backed adult sign-in, callback validation, safe account linking, session rotation, logout/revocation, recovery and verified email flows |
| Authorization | Tenant/learner isolation, explicit guardian read/contribute grants and consent-aware checks | Database adapter integration and adversarial tests across families, roles, withdrawn consent and concurrently revoked grants |
| Consent | Separate modeled consent evidence and fail-closed account boundary | Verified adult/guardian relationship, jurisdiction/purpose/policy version, external verification evidence, revocation and erasure workflows; server-controlled status |
| Input | Strict schemas, bounded JSON bodies, typed identifiers, exact mutation origin and safe errors | Proxy body/time limits, content safety review and ongoing input-contract review |
| Browser | CSP, no framing, MIME sniffing protection, restricted feature permissions and visible keyboard focus | Check deployed headers on every route and error response; tighten CSP with nonces/hashes as rendering permits |
| Abuse | Local application controls are one layer only | Provider edge/WAF limits, distributed quotas, bot/credential-stuffing controls, provider-trusted client IP handling and alerts |
| Audit | Model and server boundary support accountability without evidence-body logging | Durable access-controlled audit sink, retention, clock synchronization, integrity checks, incident alert routing |

Review the actual code and tests before enabling a runtime adapter. A schema constraint does not validate an external identity or guardian-consent process. Authentication headers from the public internet must not be treated as provider identity.

## Data minimization and retention

Use learner pseudonyms and coarse age bands. Do not collect home addresses, exact birth dates, school location, biometric information, contact details, advertising IDs, public profiles, unrestricted messages, child photos/audio or payment data in this release. Do not add analytics or session replay to learner routes without a separate privacy review.

Do not put evidence text, names, email addresses, cookie values, authorization headers or database URLs in logs, traces, analytics, error reporting or URLs. Operational logs should use a request ID, route template, status code, duration and non-sensitive error code. Restrict support access; never copy child content into third-party debugging tools.

Before a pilot, define purpose-specific retention windows, implement scheduled deletion for expired sessions and data, support guardian access/export/withdrawal/deletion, and document how backups expire. Withdrawal must disable access and contributions promptly; preservation obligations and deletion timing require an operator-reviewed policy. Backups are protected data and need the same access controls and restoration discipline.

## Secrets, deployments and dependencies

- Keep `.env` files outside version control and use provider-managed secret storage. `.env.example` contains placeholders only. Only intentionally public values may use `NEXT_PUBLIC_`.
- Separate staging and production databases, keys, identity callbacks and email domains. Preview builds must never receive production child data or database credentials.
- Use pinned dependencies with the committed lockfile, automated dependency alerts and reviewed upgrades. `npm audit` is an additional signal and does not replace code/security review.
- Require CI and review on the production branch. Do not run untrusted pull-request code with production secrets. Limit GitHub Actions permissions and use protected environments for deployment jobs.
- Put self-hosted Next.js behind a TLS reverse proxy with request-size, time and rate limits. Restrict database network access and avoid exposing PostgreSQL publicly. [Next.js self-hosting guidance](https://nextjs.org/docs/app/guides/self-hosting)

## Blocking gates for actual child accounts

1. A named operator approves the scope, countries, age bands, safety escalation process and reviewed notices.
2. Adult identity and guardian verification work end to end. Consent includes purpose, policy version, verification evidence, timestamp and revocation history; only trusted server code changes its status.
3. Runtime adapters pass isolation, revoked-session, withdrawn-consent, origin/CSRF, rate-limit and audit-redaction tests. No real account bootstrap endpoint is publicly available before this review.
4. Retention/deletion, guardian export, incident response, database backup/restore and access reviews are exercised with synthetic fixtures in staging.
5. An independent security review closes material findings, and a controlled pilot approval is recorded. Do not label a public demo as certified, compliant or production-ready because CI passes.

## Incident response outline

Assign an incident owner and out-of-band contact before launch. On suspected exposure, disable affected routes/provisioning, revoke sessions/credentials as appropriate, preserve redacted audit evidence, determine affected data and identities, and follow the operator's approved notification process. Restore service only after the cause is fixed and validated. Record timeline, scope, corrective action and follow-up tests. Never post secrets or child evidence in a public issue.

To report a repository security issue, use the repository owner's private security-reporting channel when configured. A public vulnerability report should omit exploitable details and all personal data. The project has not established an operational child-support service in this release.
