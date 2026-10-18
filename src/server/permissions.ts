import type { Principal } from "./auth";

export interface LearnerBoundary {
  tenantId: string;
  learnerId: string;
  consentActive: boolean;
  adultGrants: ReadonlyArray<{ accountId: string; canRead: boolean; canContribute: boolean }>;
}
export function canAccessLearner(principal: Principal, boundary: LearnerBoundary, action: "read" | "contribute"): boolean {
  if (principal.tenantId !== boundary.tenantId || !boundary.consentActive) return false;
  if (principal.kind === "learner") return principal.learnerId === boundary.learnerId;
  const grant = boundary.adultGrants.find((candidate) => candidate.accountId === principal.accountId);
  return Boolean(grant && (action === "read" ? grant.canRead : grant.canContribute));
}
