# Current development plan

The active plan is [v0.6.0 milestones](MILESTONES.md) and [the Python-first ADR](adr/0001-python-first.md). FastAPI/Python replaces the prior Node/TypeScript backend and Prisma plan. The responsive Next.js frontend is preserved as presentation. Follow [ARCHITECTURE.md](ARCHITECTURE.md), [DEPLOYMENT.md](DEPLOYMENT.md) and [TESTING.md](TESTING.md) for implementation, operations and actual evidence. Historical planning is preserved under `reference/legacy-typescript-backend/docs/` and is superseded.

## North Star: Pareto delivery

For every development milestone, identify the smallest roughly 20% of effort expected to deliver 80–100% of its defined useful result. Deliver and verify that work first. Treat the ratio as a prioritization target to measure against actual outcomes, not a promised result for every task.

1. Define the user-facing outcome, the evidence that will show it works, and any required security, privacy, accessibility or release gates.
2. Rank candidate work by expected outcome per unit of effort. Choose the smallest set that can satisfy the outcome and its required gates.
3. Ship that set, check the evidence, and record the effort spent, result achieved and remaining gap in the relevant milestone or test record.
4. Defer lower-value work once the outcome is met. If the first set falls short, choose the next highest-impact work and reassess rather than expanding scope by default.

The [standing project rule](../AGENTS.md) applies this approach to implementation, tests, documentation and releases. Required gates remain part of the result being optimized.
