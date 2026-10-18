import createClient from "openapi-fetch";
import { publishedMissionSchema, type AgeBand, type PublishedMission } from "@/contracts/learning";
import type { paths } from "./schema";

// Same-origin calls are proxied to FastAPI by Next. No private origin or secret
// belongs in this browser module. It sends no identity, draft, or learner data.
const client = createClient<paths>({ baseUrl: "", credentials: "omit", cache: "no-store" });

export async function fetchPublishedMission(ageBand: AgeBand, signal?: AbortSignal): Promise<PublishedMission> {
  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), 5000);
  try {
    const { data, error, response } = await client.GET("/api/v1/missions", {
      params: { query: { age_band: ageBand } },
      signal: signal ? AbortSignal.any([signal, timeout.signal]) : timeout.signal,
    });
    if (error || !response.ok || !data) throw new Error("Published lessons are currently unavailable.");
    const matches = data.items.filter((item) => item.ageBand === ageBand);
    if (matches.length !== 1) throw new Error("The requested lesson is not available.");
    // Runtime validation complements generated compile-time request contracts.
    return publishedMissionSchema.parse(matches[0]);
  } finally {
    clearTimeout(timer);
  }
}
