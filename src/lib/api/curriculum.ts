import createClient from "openapi-fetch";
import { publishedMissionSchema, type AgeBand, type PublishedMission } from "@/contracts/learning";
import { getDemoMission } from "@/content/missions";
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
    const mission = publishedMissionSchema.parse(matches[0]);
    const reviewed = getDemoMission(ageBand);
    // Draft/export format v1 is tied to this reviewed curriculum. Never silently
    // mix saved notes with a newer version or changed content under the same ID.
    // Python may serialize UTC with or without fractional seconds.
    const canonical = (value: PublishedMission) => JSON.stringify({ ...value, publishedAt: new Date(value.publishedAt).toISOString() });
    if (canonical(mission) !== canonical(reviewed)) throw new Error("The published lesson does not match the reviewed demo version.");
    return mission;
  } finally {
    clearTimeout(timer);
  }
}
