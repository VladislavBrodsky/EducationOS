import { randomUUID } from "node:crypto";
import type { z } from "zod";
import { ApiError } from "./errors";

export interface RequestContext { requestId: string }
const MAX_BODY_BYTES = 8 * 1024;
export function apiJson(data: unknown, requestId: string, status = 200): Response {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store", "X-Request-Id": requestId, "X-Content-Type-Options": "nosniff", "Vary": "Cookie, Origin" } });
}
export function withApi(operation: string, handler: (request: Request, context: RequestContext) => Promise<Response>) {
  return async (request: Request): Promise<Response> => {
    const requestId = randomUUID();
    const started = performance.now();
    let status = 500;
    try {
      const response = await handler(request, { requestId });
      status = response.status;
      return response;
    } catch (error) {
      const safe = error instanceof ApiError ? error : new ApiError(500, "INTERNAL_ERROR", "The request could not be completed.");
      status = safe.status;
      const response = apiJson({ error: { code: safe.code, message: safe.message } }, requestId, safe.status);
      if (safe.retryAfter) response.headers.set("Retry-After", String(safe.retryAfter));
      return response;
    } finally {
      // Never log URLs, query strings, cookies, IDs, request bodies, evidence, or database exceptions.
      console.info(JSON.stringify({ event: "api_request", operation, requestId, status, durationMs: Math.round(performance.now() - started) }));
    }
  };
}
export function assertSameOrigin(request: Request, configuredOrigin: string): void {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (!origin || origin !== configuredOrigin || (fetchSite !== null && fetchSite !== "same-origin" && fetchSite !== "none")) {
    throw new ApiError(403, "FORBIDDEN", "A same-origin request is required.");
  }
}
export async function parseJsonBody<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  if (request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !== "application/json") {
    throw new ApiError(415, "UNSUPPORTED_MEDIA_TYPE", "Use application/json.");
  }
  const declared = request.headers.get("content-length");
  if (declared !== null && (!/^\d+$/.test(declared) || Number(declared) > MAX_BODY_BYTES)) throw new ApiError(413, "TOO_LARGE", "The request body is too large.");
  if (!request.body) throw new ApiError(400, "INVALID_INPUT", "A valid JSON body is required.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BODY_BYTES) { await reader.cancel(); throw new ApiError(413, "TOO_LARGE", "The request body is too large."); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const merged = new Uint8Array(bytes);
  let offset = 0;
  for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.byteLength; }
  let value: unknown;
  try { value = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(merged)); }
  catch { throw new ApiError(400, "INVALID_INPUT", "A valid JSON body is required."); }
  const result = schema.safeParse(value);
  if (!result.success) throw new ApiError(400, "INVALID_INPUT", "The request does not match the API contract.");
  return result.data;
}
