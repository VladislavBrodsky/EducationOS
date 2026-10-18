import { apiJson, withApi } from "@/server/http";
export const runtime = "nodejs";
export const GET = withApi("health.live", async (_request, { requestId }) => apiJson({ status: "alive", version: "0.5.0", childRegistration: "unavailable" }, requestId));
