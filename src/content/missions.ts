import { z } from "zod";
import { publishedMissionSchema, type AgeBand, type PublishedMission } from "@/contracts/learning";
import curriculumSnapshot from "../../shared/curriculum/missions.v1.json";

export const AGE_PROGRAMS: ReadonlyArray<{ ageBand: AgeBand; name: string; world: PublishedMission["world"]; worldName: string; focus: string }> = [
  { ageBand: "5-6", name: "Explorers", world: "curiosity-grove", worldName: "Curiosity Grove", focus: "Notice, wonder, and try together" },
  { ageBand: "7-9", name: "Builders", world: "builder-harbor", worldName: "Builder Harbor", focus: "Turn questions into small experiments" },
  { ageBand: "10-12", name: "Makers", world: "orbit-lab", worldName: "Orbit Lab", focus: "Find patterns and test an idea" },
  { ageBand: "13-15", name: "Creators", world: "future-city", worldName: "Future City", focus: "Explore tradeoffs and explain the evidence" },
  { ageBand: "16-17", name: "Launchers", world: "frontier-studio", worldName: "Frontier Studio", focus: "Design, measure, and question your conclusions" },
];


/** Offline copy of authored curriculum. FastAPI serves the same versioned source.
 * This is an explicit preview fallback, never evidence of an API connection.
 */
export const DEMO_MISSIONS: readonly PublishedMission[] = z.array(publishedMissionSchema).parse(curriculumSnapshot);

export function getDemoMission(ageBand: AgeBand): PublishedMission {
  return DEMO_MISSIONS.find((mission) => mission.ageBand === ageBand)!;
}
