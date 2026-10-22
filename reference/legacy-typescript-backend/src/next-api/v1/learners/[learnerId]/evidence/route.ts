import { learningApi } from "../../../../../../server/runtime";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ learnerId: string }> };
export async function GET(request: Request, context: Context) { return learningApi.listEvidence(request, (await context.params).learnerId); }
export async function POST(request: Request, context: Context) { return learningApi.createEvidence(request, (await context.params).learnerId); }
