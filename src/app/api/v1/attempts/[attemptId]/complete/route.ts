import { z } from "zod";
import { idSchema } from "@/contracts/learning";
import { ApiError } from "@/server/errors";
import { apiJson, assertSameOrigin, parseJsonBody, withApi } from "@/server/http";
import { requirePrincipal, siteOrigin } from "@/server/runtime";
export const runtime = "nodejs";
export async function POST(request: Request, context: { params: Promise<{ attemptId: string }> }): Promise<Response> {
  return withApi("attempts.complete", async (incoming, { requestId }) => {
    assertSameOrigin(incoming, siteOrigin());
    const { principal, repository } = await requirePrincipal(incoming);
    await parseJsonBody(incoming, z.object({}).strict());
    const attemptId = idSchema.safeParse((await context.params).attemptId);
    if (!attemptId.success) throw new ApiError(400, "INVALID_INPUT", "A valid attempt ID is required.");
    return apiJson({ attempt: await repository.completeAttempt(principal, attemptId.data, requestId) }, requestId);
  })(request);
}
