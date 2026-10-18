# v0.5.0 milestone and release gates

Status as of 2026-10-18. Checkmarks are implementation acceptance, not production approval. Validation is pending until the release test record in [TESTING.md](TESTING.md) is completed.

## Application foundation

- [ ] Next.js/React/TypeScript app builds and runs locally.
- [ ] Shared accessible components support the learner and adult themes.
- [ ] Frontend source passes the no-emoji SVG/Lucide policy check.
- [ ] Five age stages adapt the dashboard and mission scaffolding.
- [ ] Seven Inventors Lab steps support a complete synthetic learning journey.
- [ ] Two experiment results can be compared manually.
- [ ] Skills Vault, portfolio, JSON export, and clearing work preserve recorded v0.4 capabilities.
- [ ] Guardian view explains evidence and the remaining readiness limits.
- [ ] Versioned mission/evidence contracts reject invalid inputs.
- [ ] PostgreSQL migration validates constraints and access boundaries in a test database.
- [ ] Negative authorization tests cover adult/child, object, and tenant boundaries.
- [ ] Desktop/mobile browser journeys and automated accessibility checks pass.
- [ ] Documentation, CI configuration, baseline provenance, and changelog are reviewable.

## Historical continuity

- [x] Inspected repository and referenced conversation.
- [x] Recovered the public v0.1.0 documentation ZIP and recorded its checksum/completeness.
- [x] Recorded the v0.4 feature inventory as reconstruction acceptance criteria.
- [ ] Recover the actual v0.4 source ZIP and verify source-level parity.
- [ ] Open a reviewable GitHub PR when effective write access is available; branch creation returned HTTP 403 despite repository metadata reporting permission.

The unavailable historical source remains an explicit limitation; its recovery is not required to review this new foundation.

## Before any real child data or enrollment

**This release is not production-safe for child enrollment.** Keep real enrollment disabled until these gates have evidence, named owners, and independent review:

- [ ] Select launch jurisdiction, controller/processor roles, age-assurance approach, and minimum required data with qualified privacy counsel.
- [ ] Implement verified adult authentication, child sessions, scoped guardian/educator relationships, revocation, and least-privilege administration.
- [ ] Implement legally appropriate purpose-specific consent and school authority checks; test revocation across synchronous and background work.
- [ ] Exercise authenticated deletion, export, retention expiry, backup restoration, and audit handling with synthetic data.
- [ ] Integrate production repositories and validate row-level policy using actual application database roles; eliminate bypasses.
- [ ] Complete independent threat modeling, security testing, dependency review, and remediation of high-severity findings.
- [ ] Establish secrets, encryption, monitoring, abuse limits, incident response, safeguarding staff, and support contacts.
- [ ] Publish reviewed privacy information and vendor/data-processing agreements for the chosen market.
- [ ] Obtain scientific, pedagogical, age-appropriateness, accessibility, and experiment safety approval for every pilot mission.
- [ ] Complete manual keyboard/screenreader review and supervised usability research with appropriate authorization.
- [ ] Predeclare pilot learning and wellbeing measures; avoid claims of learning efficacy or mastery unsupported by evidence.

## Next implementation priorities

1. Integrate a verified adult identity provider and short-lived child sessions behind the deny-by-default API boundary; retain synthetic-only environments while evaluating providers.
2. Connect PostgreSQL through repositories, enforce version pinning and database roles, and exercise migrations/rollback/restoration in isolated CI environments.
3. Complete consent, revocation, retention, erasure, export, and scoped guardian/educator tests before real records are accepted.
4. Commission curriculum and accessibility review, then plan a narrowly scoped, authorized pilot after all enrollment gates pass.

AI tutoring, social features, open uploads, billing, native apps, and AR hardware remain separate later workstreams.
