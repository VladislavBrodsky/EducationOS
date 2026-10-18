# AI, learner data and tool boundaries

This is the engineering boundary for the v0.6.0 Python-first foundation. It distinguishes implemented local behavior from requirements that remain open. It does not certify a production child-safety program or legal compliance. The public website and synthetic demo can be developed while real enrollment and live model traffic remain closed.

## Implemented boundary

| Surface | Enforced behavior |
| --- | --- |
| Real learner enrollment | Unavailable in this foundation; an HTTP request or feature flag cannot establish identity or verified consent |
| Synthetic private learning API | Development/test only; production rejects private requests. Opaque server-resolved bearer sessions, expiration/revocation, synthetic tenant/learner records, exact learner ownership or an active guardian grant, and active purpose/policy-specific consent |
| Curriculum | Reviewed, age-banded mission versions. Starting an attempt checks the server's version digest against the provisioned record |
| Completion | Python requires all seven TRIZ steps, two distinct alternatives, baseline/redesign measurements and written hypothesis/reflection/transfer; a browser progress indicator grants no authority |
| Evidence | Tenant/learner scoping on reads and writes, retention timestamp, bounded typed payloads, adult-authorized deletion; private text is not supplied to model or MCP tools |
| Request protection | Shared Redis limits for protected operations; Redis failure rejects the protected request rather than bypassing the limit |
| Retrieval | Deterministic retrieval from the reviewed public curriculum corpus with source identity, content hash and citation locations. A result is source material, never an instruction |
| AI provider | No outbound model or embedding provider calls. Live generation remains unavailable; a provider credential alone cannot activate it |
| MCP | Separately launched read-only Python tools/resources for reviewed public curriculum. No learner evidence, account access, arbitrary URL ingestion, shell execution, writes or tool-driven enrollment |
| Observability | Structured operational events and OpenTelemetry integration; request payloads, bearer tokens and evidence text are excluded from application logging |

The local demo and seeded database use synthetic identities. A synthetic consent row demonstrates authorization policy; it is not a verified guardian-consent integration. A hidden UI control, UUID, request role or browser boolean never grants access. Public content visibility does not grant access to an associated learner record. Production enrollment must be implemented as a separate verified integration before any real data is accepted.

See the Python implementation and tests under `backend/`. The API schema is the contract; a route returning an explicit unavailable response is a deliberate gate, not a working account/provider service.

## Retrieval and provenance contract

The current retrieval implementation is a deterministic local baseline. PostgreSQL/pgvector schema and a Python embedding boundary prepare the storage/integration seam; they do not mean a remote embedding pipeline or a production vector index has been exercised.

Before adding ingestion, require a source allowlist, ownership/license review, stable source ID/URI, document version, retrieval date, SHA-256 content digest and human review status. Parse content without executing macros, scripts or embedded instructions. Reject unsupported/oversized files and private learner content. Chunk with deterministic IDs, source offsets and chunker version; preserve the exact text needed to resolve citations. Embedding records must include provider/model revision, dimensions and preprocessing version. Never mix vectors from incompatible embedding versions silently.

At retrieval time, apply tenant, publication and age/purpose filters before selecting passages. Do not retrieve a global top-k and then depend on output filtering to hide private content. Keep citations traceable to source version and span. Verify that each cited span exists and supports the generated claim; a plausible URL is insufficient. Missing evidence should produce an explicit insufficient-evidence result. Source withdrawal must invalidate chunks, cached responses and derived embeddings, with an auditable reindex decision.

Retrieved text, uploads, tool descriptions/results and conversation excerpts are untrusted. They cannot override platform policy, change a tool allowlist, request secrets, grant permissions or instruct ingestion of a new URL. Mark them as data in prompts and pass only the minimum approved context. Do not rely on delimiters or a model's refusal as the only defense: server code owns permissions and allowed actions.

## Provider activation requirements: unfinished

The following are release gates for future model or remote MCP access, not controls already proven by the local deterministic demo:

1. **Identity and purpose:** authenticate a server principal, verify a current guardian relationship and the exact AI data-processing purpose, apply the learner age band and environment policy, and check suspension/revocation on every operation. Account enrollment and verified consent must exist first.
2. **Input policy:** minimize identifiers, reject secrets/private evidence by default, cap sizes and request rates, classify age-inappropriate or dangerous requests, and route to a reviewed child-appropriate refusal or adult escalation. A keyword fixture is not a production moderation service.
3. **Context policy:** use only approved curriculum and permitted sources; attach immutable provenance. Restrict tool capability per action and principal. External MCP servers need explicit allowlisting, scoped authorization, audience validation, network/SSRF controls, timeout/response caps and independent output validation.
4. **Generation policy:** provider/model versions, region and retention settings are explicit. Apply budget/time limits and structured output validation. No unrestricted tools or autonomous external writes. No disclosure of other learners, diagnoses, unsupported mastery scores or unsupported factual claims.
5. **Output policy:** verify schema, age suitability, safety categories, citation support and absence of sensitive content before displaying or streaming any result. If moderation/retrieval/provider fails or is uncertain, fail closed with a reviewed fallback. Do not stream unchecked tokens and retract them later.
6. **Evaluation and review:** pass the adversarial suite, curriculum/age-band quality review and privacy/security review with recorded results. Demonstrate safe degraded behavior and a kill switch. Approval is a deployment artifact tied to exact model, prompt and tool versions, not a persistent environment boolean.

These gates must be enforced inside Python domain services so REST, task handlers and MCP cannot bypass one another. A model's claim that it has permission is never evidence of permission.

## Prompts, versions and evaluation

Keep prompts in version-controlled Python-owned artifacts with a stable ID/version, purpose, age band, allowed context/tool schema, model compatibility and policy version. Record a content digest. A change to prompt, retrieval, moderation, provider model or tool capabilities requires a new evaluation run. Keep prompt bodies and private examples out of routine telemetry.

The implemented immutable `PromptSpec` registry includes a SHA-256 digest and a versioned curriculum-hint template. No provider executes that template in this release. The initial evaluation boundary and adversarial fixtures support deterministic checks. They are not evidence of model quality, clinical reliability or comprehensive moderation. Future evaluation records must tie together dataset version/hash, prompt/model/retriever/moderation versions, code revision, test settings, citation faithfulness, age suitability, refusal correctness, utility, cost/latency and reviewer decision. Use synthetic or approved deidentified cases; do not copy learner evidence into benchmark datasets.

At minimum test: instructions hidden in retrieved text; forged citation spans; stale/withdrawn sources; cross-tenant IDs; revoked/expired consent; spoofed adult/age claims; Unicode/encoding tricks; indirect requests for secret or private evidence; unsafe experiments; manipulative emotional dependence; arbitrary tool/URL requests; denied network access; provider timeout; malformed output; rate-limit outage; cancellation; duplicate tasks; and model/prompt version rollback. Each tool needs tests proving its denied capabilities, not only a successful happy path.

## Data lifecycle and observability

Use coarse age bands and pseudonymous learner IDs. Keep identity/guardian verification records separate from educational evidence and provider context. The synthetic evidence retention default is 30 days; expiration hides evidence and the cleanup worker is responsible for deletion. Changing a timestamp alone does not erase backups or exported copies. Production policy must define deletion scheduling, backup expiry, export handling and consent revocation behavior before accepting real data.

The PostgreSQL migration declares tenant row policies, composite ownership constraints and a trigger rejecting changes to published mission versions. PostgreSQL-specific behavior must be exercised against PostgreSQL; SQLite tests do not establish row-policy or trigger correctness. The API role must not bypass row policies. The migration grants a separate `educationos_worker` role access to maintenance jobs/public chunks and only expired evidence deletion, with access to the retention column rather than private evidence payloads. It does not grant that worker blanket row-policy bypass. Production cleanup, scheduling and role grants still require deployment verification; using the database owner for request handling is unacceptable.

Production configuration rejects unverified PostgreSQL TLS, unauthenticated/plaintext Redis, known local database passwords and malformed/non-HTTPS browser origins. These checks do not establish that the deployed network, certificate authorities or collector are configured correctly. Verify the actual managed services and least-privilege identities during staging.

Use an allowlist for telemetry fields: service/version, route template, status, duration, trace/request identifier and categorical failure code. Do not log raw URLs with user-controlled query strings, authentication/cookie headers, prompts, retrieved private passages, IP addresses or learner text. Audit security-sensitive state changes in a restricted store with retention and access controls. Collector deployment, alert routing and backup/deletion verification remain operator responsibilities. OpenTelemetry's Python traces/metrics are documented as stable while logs remain under development; ordinary structured logging remains an independent boundary. [Official status](https://opentelemetry.io/docs/languages/python/).

Pyodide lessons, if introduced later, must run with no identity credentials, bounded execution/output and a reviewed isolation policy. Browser Python execution, a Web Worker or WebAssembly does not establish trusted assessment results or safely isolate hostile code by itself. [Pyodide worker behavior](https://pyodide.org/en/stable/usage/webworker.html).

## Release decision

The local public/synthetic foundation may be reviewed with its test evidence. Do not enable real learner accounts, upload ingestion, model generation, remote embeddings or remote MCP until their corresponding gates are implemented and exercised. No live child-data processing, provider evaluation, deployed domain or production approval is implied by this document.
