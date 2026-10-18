import { learningApi } from "../../../../../server/runtime";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request, context: { params: Promise<{ missionId: string }> }) {
  return learningApi.getMission(request, (await context.params).missionId);
}
