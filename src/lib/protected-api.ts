/**
 * Presentation-only boundary. The Python/FastAPI service owns identity,
 * permissions, domain behavior and persistence. No adapter is connected yet.
 */
export function unavailable(): Response {
  return new Response(JSON.stringify({
    error: {
      code: "UNAVAILABLE",
      message: "The Python learning service is not connected. Use synthetic demo data only.",
    },
  }), {
    status: 503,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
