import { apiJson, withApi } from "@/server/http";
import { requirePrincipal } from "@/server/runtime";
export const runtime = "nodejs";
export const GET = withApi("auth.session.read", async (request, { requestId }) => {
  const { principal } = await requirePrincipal(request);
  return apiJson({ authenticated: true, kind: principal.kind, childRegistration: "unavailable" }, requestId);
});
