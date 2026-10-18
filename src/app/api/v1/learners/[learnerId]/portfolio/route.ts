import { idSchema } from "@/contracts/learning";
import { ApiError } from "@/server/errors";
import { apiJson, withApi } from "@/server/http";
import { requirePrincipal } from "@/server/runtime";
export const runtime = "nodejs";
export async function GET(request: Request, context: { params: Promise<{ learnerId: string }> }): Promise<Response> {
  return withApi("portfolio.read", async (incoming, { requestId }) => {
    const { principal, repository } = await requirePrincipal(incoming);
    const parsed = idSchema.safeParse((await context.params).learnerId);
    if (!parsed.success) throw new ApiError(400, "INVALID_INPUT", "A valid learning record ID is required.");
    return apiJson(await repository.portfolio(principal, parsed.data, requestId), requestId);
  })(request);
}
