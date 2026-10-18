import { startAttemptSchema } from "@/contracts/learning";
import { apiJson, assertSameOrigin, parseJsonBody, withApi } from "@/server/http";
import { requirePrincipal, siteOrigin } from "@/server/runtime";
export const runtime = "nodejs";
export const POST = withApi("attempts.create", async (request, { requestId }) => {
  assertSameOrigin(request, siteOrigin());
  const { principal, repository } = await requirePrincipal(request);
  const input = await parseJsonBody(request, startAttemptSchema);
  return apiJson({ attempt: await repository.startAttempt(principal, input, requestId) }, requestId, 201);
});
