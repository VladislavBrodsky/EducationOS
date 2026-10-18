import { createEvidenceSchema } from "@/contracts/learning";
import { apiJson, assertSameOrigin, parseJsonBody, withApi } from "@/server/http";
import { requirePrincipal, siteOrigin } from "@/server/runtime";
export const runtime = "nodejs";
export const POST = withApi("evidence.create", async (request, { requestId }) => {
  assertSameOrigin(request, siteOrigin());
  const { principal, repository } = await requirePrincipal(request);
  const input = await parseJsonBody(request, createEvidenceSchema);
  return apiJson({ evidence: await repository.createEvidence(principal, input, requestId) }, requestId, 201);
});
