import type { AgeBand, Attempt, CreateEvidence, Evidence, PublishedMission, StartAttempt } from "../contracts/learning";
import type { Principal } from "./auth";
import type { LearnerBoundary } from "./permissions";

export interface LearnerRecord extends LearnerBoundary { ageBand: AgeBand }
/** Every implementation must enforce its principal scope again at the storage boundary. */
export interface LearningRepository {
  learner(principal: Principal, learnerId: string): Promise<LearnerRecord | null>;
  missions(principal: Principal, ageBand: AgeBand): Promise<PublishedMission[]>;
  mission(principal: Principal, versionId: string): Promise<PublishedMission | null>;
  start(principal: Principal, input: StartAttempt): Promise<Attempt>;
  attempt(principal: Principal, attemptId: string): Promise<Attempt | null>;
  evidence(principal: Principal, learnerId: string): Promise<Evidence[]>;
  appendEvidence(principal: Principal, learnerId: string, input: CreateEvidence): Promise<Evidence>;
  complete(principal: Principal, attemptId: string): Promise<Attempt | null>;
}
