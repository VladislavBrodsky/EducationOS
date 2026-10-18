import { createLearningApi } from "./api";

// No environment toggle, header, demo cookie, or client role can enable storage.
// Wire audited adapters only after the gates in docs/SECURITY.md are complete.
export const learningApi = createLearningApi(null);
