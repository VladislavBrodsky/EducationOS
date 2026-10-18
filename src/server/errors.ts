import type { z } from "zod";
import type { errorSchema } from "../contracts/learning";

type ErrorCode = z.infer<typeof errorSchema>["error"]["code"];
export class ApiError extends Error {
  constructor(readonly status: number, readonly code: ErrorCode, message: string, readonly retryAfter?: number) { super(message); }
}
