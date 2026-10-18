import { apiJson, withApi } from "@/server/http";
import { authenticatedLearningConfigured, databaseConfigured, getDatabase } from "@/server/runtime";
export const runtime = "nodejs";
export const GET = withApi("health.ready", async (_request, { requestId }) => {
  let storage: "unconfigured" | "ready" | "unavailable" = "unconfigured";
  if (databaseConfigured()) {
    try {
      // Verify expected migration tables as well as connectivity.
      await getDatabase().query("SELECT 1 FROM mission_versions LIMIT 0");
      await getDatabase().query("SELECT 1 FROM sessions LIMIT 0");
      storage = "ready";
    } catch { storage = "unavailable"; }
  }
  const ready = storage !== "unavailable";
  return apiJson({ status: ready ? "ready" : "unavailable", mode: "demo", database: storage, authenticatedLearning: storage === "ready" && authenticatedLearningConfigured(), childRegistration: "unavailable", consentIssuance: "unavailable" }, requestId, ready ? 200 : 503);
});
