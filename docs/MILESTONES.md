# Milestones and release gates

The prioritized work is maintained in [PLAN.md](PLAN.md). Executed checks and screenshots are recorded in [QA.md](QA.md). Code presence is separate from verified operation, deployment and approval to handle child data.

| Milestone | Scope and acceptance |
| --- | --- |
| v0.5.0 foundation | One runnable Next.js application; responsive public site; five age bands; synthetic seven-step TRIZ mission; portfolio and guardian preview; guarded PostgreSQL backend; reproducible install, checks and handoff |
| Reviewed staging | Separate managed database/secrets; migration/seed replay; browser/security review; backup restore rehearsal; monitored deployment |
| Verified public demo | Exact reviewed release on educationos.space; HTTPS for apex and www; canonical redirects; account creation disabled |
| Controlled consented pilot | Verified adult identity and guardian consent, operational revocation/deletion, staff access controls, reviewed curriculum/legal notices, tested recovery and independent security review |
| Later expansion | Reviewed new missions, localization and educator workflows; any AI/chat or billing requires separate design and approval |

Source continuity is documented in [BASELINE.md](BASELINE.md). The missing v0.4.0 source and v0.3.1 design ZIPs prevent a source-level parity claim. A current branch/PR operation and provider deployment check must establish external delivery status.

Before real child accounts, all gates in [SECURITY.md](SECURITY.md) need evidence and named owners. The public demo does not establish regulatory compliance, pedagogical efficacy, safeguarding certification or operational readiness.
