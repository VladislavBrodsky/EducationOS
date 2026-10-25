import { ApiError } from "@/server/errors";
import { withApi } from "@/server/http";
export const runtime = "nodejs";
export const POST = withApi("auth.register.unavailable", async () => {
  throw new ApiError(503, "UNAVAILABLE", "Registration and child-profile creation are unavailable while identity and verified guardian consent are being implemented. Use the browser demo without personal data.");
});
