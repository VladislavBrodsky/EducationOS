# EducationOS working rule

Apply the Pareto principle to every EducationOS change and document: identify the smallest roughly 20% of work that delivers 80–100% of the useful result, ship that first, and stop expanding scope once the user-facing outcome is clear and verified. Prefer a focused fix over broad polish, repeated testing, or documentation churn. Record only the evidence needed to judge the result and any remaining blocker.

This rule governs all active project plans, specifications, design notes, implementation documents, tests, pull requests, and releases. Preserve historical files in `reference/` and read-only synced files in `../sources/`.

For user-facing copy, never end a title or subtitle with a period.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
