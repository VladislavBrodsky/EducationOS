import type { PortalSubjectId } from "@/lib/portal-learning";
import type { LabId } from "./types";

export const PORTAL_LABS: ReadonlyArray<{
  id: LabId; title: string; subjectId: PortalSubjectId; minutes: number;
  question: string; description: string; takeaway: string; number: string;
}> = [
  { id: "loop-loom", title: "Loop Loom", subjectId: "programming", minutes: 12, question: "How many steps can one loop make?", description: "Weave a pattern with instructions. Predict the output, step through the code, then change the rule", takeaway: "A trace of your loop and a prediction for a new pattern.", number: "01" },
  { id: "same-half", title: "Same Half Different Shape", subjectId: "mathematics", minutes: 12, question: "Can different shapes be the same half?", description: "Move equal pieces, compare whole shapes, and find out when counting parts can fool you", takeaway: "A half you designed and an explanation using equal parts.", number: "02" },
  { id: "hidden-cubes", title: "Hidden Cube Builder", subjectId: "mathematics", minutes: 15, question: "Are cubes still there when you can’t see them?", description: "Look inside a cube building. Use its layers to count every cube, including the hidden ones", takeaway: "A layer strategy and a volume calculation for a new building.", number: "03" },
];

export function getPortalLab(id: string) { return PORTAL_LABS.find(lab => lab.id === id); }
