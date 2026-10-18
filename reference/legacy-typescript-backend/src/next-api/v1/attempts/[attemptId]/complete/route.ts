import { learningApi } from "../../../../../../server/runtime";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request, context: { params: Promise<{ attemptId: string }> }) { return learningApi.completeAttempt(request, (await context.params).attemptId); }
