import { CONTRACT_VERSION, ageBandSchema } from "@/contracts/learning";
import { DEMO_MISSIONS } from "@/content/missions";
import { ApiError } from "@/server/errors";
import { apiJson, withApi } from "@/server/http";
import { limitAnonymousDemo } from "@/server/runtime";
export const runtime = "nodejs";
export const GET = withApi("demo.missions.list", async (request, { requestId }) => {
  limitAnonymousDemo("demo.missions");
  const query = new URL(request.url).searchParams;
  if ([...query.keys()].some((key) => key !== "ageBand") || query.getAll("ageBand").length > 1) throw new ApiError(400, "INVALID_INPUT", "Use one ageBand query parameter.");
  const age = query.get("ageBand");
  const band = age === null ? null : ageBandSchema.safeParse(age);
  if (band && !band.success) throw new ApiError(400, "INVALID_INPUT", "Choose a supported age band.");
  const missions = band?.success ? DEMO_MISSIONS.filter((mission) => mission.ageBand === band.data) : DEMO_MISSIONS;
  return apiJson({ contractVersion: CONTRACT_VERSION, mode: "demo", missions }, requestId);
});
