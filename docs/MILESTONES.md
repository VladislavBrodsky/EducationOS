# v0.5.0 handoff and release gates

Status as of 2026-10-18. Checkmarks describe observed presentation behavior; they do not approve production child enrollment. Final verification after relocating superseded backend artifacts is recorded in [TESTING.md](TESTING.md).

## Presentation vertical slice

- [x] Next.js/React/TypeScript presentation shell builds and runs locally.
- [x] Shared components support lime learner and editorial adult surfaces.
- [x] Frontend passes the no-emoji SVG/Lucide policy check.
- [x] Five age stages adapt dashboard context and mission scaffolding.
- [x] Seven Inventors Lab steps support a complete synthetic journey with three ideas.
- [x] Two manual experiment results can be compared.
- [x] Skills Vault, portfolio, JSON export, session reset, and reopened-step evidence behavior pass browser tests.
- [x] Guardian view explains evidence and unfinished readiness requirements without providing adult authorization.
- [x] Desktop/mobile views and seven lab states pass configured axe scans; keyboard skip/reset-dialog smoke passes.
- [x] Protected HTTP routes remain closed with no-store HTTP 503, including forged identity headers.
- [x] Source-level baseline limitations, architecture correction, CI, and version history are documented.
- [x] Final clean install and combined checks passed: 46 unit/reference tests, production build, lint, types, icon policy, and 5 browser tests; validation record updated.

## Canonical Python backend

- [x] Recorded Python/FastAPI as canonical backend/API/domain/authentication, with SQLAlchemy/Alembic for PostgreSQL.
- [x] Classified TypeScript backend, SQL, and security tests as superseded reference work.
- [ ] Align presentation schemas/client types with canonical FastAPI OpenAPI contracts.
- [ ] Implement and validate canonical FastAPI routes and domain behavior in the separate Python workstream.
- [ ] Implement SQLAlchemy repositories and Alembic versioned mission/evidence migrations.
- [ ] Port and expand negative adult/child, relationship, tenant, consent/revocation, and database-role tests in Python.
- [ ] Integrate the presentation with the canonical authenticated API using synthetic records first.

Reference tests verify reference behavior only. They are not canonical backend acceptance.

## Historical and delivery continuity

- [x] Inspected the linked repository and referenced conversation.
- [x] Recovered the public v0.1.0 documentation archive; preserved checksum and missing-file notice.
- [x] Reconstructed the recorded v0.4 feature inventory as acceptance targets.
- [ ] Recover actual v0.4 source ZIP and verify source-level parity.
- [x] Published [draft PR #1](https://github.com/VladislavBrodsky/EducationOS/pull/1) through the verified GitHub CLI path; connector branch creation returned HTTP 403. The PR remains unmerged; hosted CI status is separate from local validation.

The unavailable historical source remains an explicit limitation; its recovery is not required to review the new presentation handoff.

## Before real child data or enrollment

**This release is not production-safe for child enrollment.** Keep intake disabled until evidence, named owners, and independent review cover:

- [ ] Launch jurisdiction, controller/processor roles, age assurance, data minimization, and reviewed legal/privacy information.
- [ ] Verified adult identity, child sessions, scoped guardian/educator relationships, revocation, and least-privilege administration.
- [ ] Purpose-specific consent or reviewed school authority, enforced across requests and background work.
- [ ] Authenticated retention/deletion/export operations, backup restoration, audit minimization, and applicable vendor agreements.
- [ ] Canonical API/database negative security tests and remediation of high-severity independent review findings.
- [ ] Secrets, encryption, monitoring, abuse limits, incident response, safeguarding staff, and support contacts.
- [ ] Scientific, pedagogical, age-appropriateness, accessibility, and experiment safety approval for each pilot mission.
- [ ] Manual keyboard/screenreader review and supervised usability research with appropriate authorization.
- [ ] Predeclared pilot learning/wellbeing measures without unsupported efficacy or mastery claims.

## Next implementation priorities

1. Complete and test canonical Python contracts, permissions, and Alembic persistence using synthetic fixtures.
2. Generate or align the presentation API client from FastAPI OpenAPI, then replace unavailable shims with the reviewed integration boundary.
3. Complete identity/consent and privacy operations before enabling any real intake.
4. Obtain curriculum, accessibility, legal, and safeguarding review before planning an authorized narrow pilot.

AI tutoring, social features, uploads, billing, native apps, and AR hardware remain separate later workstreams.
