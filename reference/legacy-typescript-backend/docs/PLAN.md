# EducationOS delivery phases

## Phase 1: v0.5.0 runnable foundation

Deliver a single maintained Next.js App Router application with React and TypeScript, shared Tailwind design tokens, accessible navigation and responsive pages. Preserve the existing seven-step TRIZ learning sequence and five age bands. Use professional SVG icons, a white/black/lime visual language, and no frontend emojis.

The public product includes marketing, program and age-group information, trust/safety/legal notices, and a synthetic learner demo with Inventors Lab, portfolio export and guardian preview. Demo progress is not a verified skill assessment. The backend includes versioned contracts, guarded route handlers, consent-aware authorization boundaries and PostgreSQL migrations. Identity provisioning and actual child accounts remain disabled.

Acceptance: dependency installation is reproducible; static checks, unit/integration tests, production build and browser checks pass; desktop/mobile screenshots are inspected; security limitations and operational commands are documented. Passing these checks establishes a foundation release, not permission to collect child data.

## Phase 2: reviewed staging deployment

Priority order:

1. Restore/confirm repository branch and pull-request write access. Review the complete change set; protect the production branch and require CI.
2. Create separate staging and production hosting projects and managed PostgreSQL databases. Set secret values in provider dashboards; prohibit production data in previews.
3. Apply committed migrations to staging, exercise API boundaries with synthetic fixtures, and test backup restore into a disposable database.
4. Configure identity-provider integration for verified adult accounts, secure session lifecycle, abuse controls and operational alerts. Complete consent-provider selection and recorded consent verification before designing any enabled child-account workflow.
5. Perform accessibility, content-safety and independent security review, review legal copy for the actual operator and launch markets, and close identified blockers.

Acceptance: staging is reproducible from a commit, isolated from production, monitored, and recoverable. Authentication and consent integration require negative authorization tests and review before enabling protected runtime adapters.

## Phase 3: verified public demo launch

Connect `educationos.space` and `www` only after staging passes. Obtain the project's actual DNS values, preserve existing mail DNS, verify HTTPS on both hostnames, enforce www-to-apex redirection, and confirm canonical URLs. Launch the public site and synthetic demo with real-account provisioning disabled. Record the deployment commit, domain check time and release tag. No payment collection or unrestricted AI/chat is part of this phase.

Acceptance: the exact reviewed release is served over HTTPS on the custom domain, all entry hostnames converge on the canonical URL, legal/trust content accurately describes current behavior, and an operator can roll back the app and restore the database.

## Phase 4: controlled consented pilot

This phase is a separate approval gate. Complete adult identity verification, a jurisdiction-appropriate verifiable guardian-consent process, purpose and policy version tracking, withdrawal and deletion workflows, least-privilege guardian grants, retention enforcement, staff access review, incident response and support ownership. Use a small controlled pilot with reviewed learning content and no public learner profiles.

Acceptance: the operator has evidence for the consent and authorization controls, can demonstrate withdrawal and erasure, has tested recovery and incident procedures, and has approved the pilot scope. Do not treat a boolean consent field, typed guardian name or client-side checkbox as validated consent.

## Phase 5: evidence-led expansion

Add reviewed versioned missions, localization, richer evidence formats and educator workflows only after the pilot validates the operational and learning model. Introduce AI features only through a separate constrained, age-appropriate design and safety evaluation. Publish learning efficacy claims only when supported by an appropriate study.
