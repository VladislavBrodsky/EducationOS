# Prepared GitHub review update

This title and body were published to pull request #2 with explicit user approval alongside commit e08c9a7. The text below preserves that release handoff; later UI updates are recorded separately.

## Title

Launch EducationOS learner portal and Anatomy discovery labs

## Body

EducationOS now has a learner portal with 15 starter activities across Programming, Science, Mathematics, Language & Writing, and Arts & Design, plus three interactive discovery labs: Loop Loom, Same Half Different Shape, and Hidden Cube Builder. Learners predict, manipulate a model, explain an observation and solve a new example before recording work. Drafts, reflections, progress and exports stay in the current browser-tab session.

The three labs use pinned MIT-licensed Anatomy geometry with original lesson models and React controls. Mobile layouts, keyboard controls, 2D alternatives and server-rendered worked examples support the same investigations. Hidden Cube Builder optionally loads actual rigid 3D turning; no lesson requires WebGL. Programming uses a bounded practice interpreter without arbitrary JavaScript or Python execution.

The frontend is deployed on separate Railway services:

- Learner portal: https://app.educationos.space
- Marketing website: https://educationos.space

Explicit portal/public routing keeps learner pages separate, preserves path/query redirects and sends portal noindex headers. HTTPS certificates, DNS and mail preservation are verified. The checked-in deployment evidence and file manifest identify the exact CLI upload; hosting is not connected to automatic GitHub deployment.

The existing Python/FastAPI foundation remains in this branch. Production accounts, enrollment, the Python API and learner-facing generative AI were not launched. Broader age-adapted curriculum, physical-device testing and supervised child usability remain follow-up work.

Validation:

- TypeScript, lint, generated API checks, icon policy and production builds passed during implementation. The final routing version passed 123 unit tests.
- 27 local browser journeys passed before the final public-only routing addition.
- After deployment, all three classes passed complete journeys at 390×844 and 430×932. Twelve light/dark accessibility scans reported zero violations, with no horizontal overflow, uncaught errors, failed assets or remote writes.
- Normal user Chrome separately completed the three live classes and checked both viewport sizes without DNS or TLS overrides. Automated headless checks selected fresh public DNS answers in their own process while retaining normal certificate validation.
- Both Railway services remain successful and both actual HTTPS homepages serve their expected content. These checks use mobile viewport/touch emulation, not physical phones.

See docs/DEPLOYMENT_STATUS.md, docs/TESTING.md and docs/anatomy/IMPLEMENTATION.md for evidence and limits. No merge is included. The older overlapping frontend foundation pull request still needs reconciliation before any merge.
