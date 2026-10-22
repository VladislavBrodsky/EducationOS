import type { LabId, LabRecord } from "@/lib/labs/types";
import { isCubePrediction } from "@/lib/labs/hidden-cubes";

const steps = [
  { id: "lab-predict", label: "Predict" },
  { id: "lab-explore", label: "Explore" },
  { id: "lab-explain", label: "Explain" },
  { id: "lab-transfer", label: "New case" },
];

export function LabStepNavigation({ labId, record }: { labId: LabId; record: LabRecord }) {
  const unlocked = labId === "loop-loom" || record.answers.revealed === "yes" && (labId !== "hidden-cubes" || isCubePrediction(record.answers.prediction));
  return <nav className="lab-step-navigation" aria-label="Discovery lab steps">
    <ol>{steps.map((step, index) => <li key={step.id}>
      {index === 0 || unlocked
        ? <a href={`#${step.id}`}><span className="lab-step-number" aria-hidden="true">{index + 1}</span>{step.label}</a>
        : <span className="lab-step-locked" aria-disabled="true"><span className="lab-step-number" aria-hidden="true">{index + 1}</span>{step.label}</span>}
    </li>)}</ol>
    {!unlocked && <p>Save your prediction to open the next steps.</p>}
  </nav>;
}
