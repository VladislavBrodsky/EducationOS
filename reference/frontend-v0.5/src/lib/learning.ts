/** Synthetic-only learning model. This module never sends or persists learner data. */
export const stages = [
  { id: 'explorers', name: 'Explorers', ages: '5–6', world: 'Curiosity Grove', verb: 'Notice, wonder, try.', prompt: 'With a grown-up, make a paper path for a pretend animal. Can it hold a little weight?', support: 'Ask a grown-up to read with you and place the paper. Draw your ideas first, then describe them together.', question: 'How can your paper bridge be strong and light?' },
  { id: 'builders', name: 'Builders', ages: '7–9', world: 'Builder Harbor', verb: 'Build a better possibility.', prompt: 'A tiny delivery robot needs to cross a gap. Design a paper bridge that is strong and light.', support: 'Sketch or speak your idea to a trusted adult before writing a short lab note.', question: 'How can a bridge carry more without using more paper?' },
  { id: 'makers', name: 'Makers', ages: '10–12', world: 'Orbit Lab', verb: 'Test an idea. Find a pattern.', prompt: 'Your research team needs a lightweight bridge. Change its structure, keep the material equal, and compare.', support: 'Keep the span, paper size, and test weights the same for both prototypes.', question: 'How can changing the structure improve strength without adding mass?' },
  { id: 'creators', name: 'Creators', ages: '13–15', world: 'Future City', verb: 'Challenge the compromise.', prompt: 'Design an efficient crossing for a model city. Investigate how geometry changes load capacity.', support: 'Define a failure criterion, control the variables, and separate your observation from your explanation.', question: 'Can geometry resolve the contradiction between load capacity and material use?' },
  { id: 'launchers', name: 'Launchers', ages: '16–17', world: 'Frontier Studio', verb: 'Turn evidence into possibility.', prompt: 'Prototype a material-efficient structure. Evaluate a TRIZ-inspired design against a controlled baseline.', support: 'Discuss limitations, measurement uncertainty, and what evidence would justify another iteration.', question: 'What structural intervention increases load capacity at a fixed material budget?' }
] as const;
export type StageId = typeof stages[number]['id'];
export const steps = ['Notice', 'Find the contradiction', 'Imagine', 'Predict', 'Experiment', 'Reflect', 'Transfer'] as const;
export type AnswerKey = 'notice' | 'goal' | 'constraint' | 'idea1' | 'idea2' | 'idea3' | 'hypothesis' | 'flat' | 'folded' | 'observation' | 'reflection' | 'transfer';
export type Answers = Record<AnswerKey, string>;
export type Attempt = { missionId: 'paper-bridge'; missionVersion: 1; stage: StageId; step: number; completedSteps: number[]; answers: Answers };
const fieldStep: Record<AnswerKey, number> = { notice: 0, goal: 1, constraint: 1, idea1: 2, idea2: 2, idea3: 2, hypothesis: 3, flat: 4, folded: 4, observation: 4, reflection: 5, transfer: 6 };
export function newAttempt(stage: StageId): Attempt {
  return { missionId: 'paper-bridge', missionVersion: 1, stage, step: 0, completedSteps: [], answers: { notice: '', goal: '', constraint: '', idea1: '', idea2: '', idea3: '', hypothesis: '', flat: '', folded: '', observation: '', reflection: '', transfer: '' } };
}
export function updateAnswer(attempt: Attempt, key: AnswerKey, value: string): Attempt {
  return { ...attempt, answers: { ...attempt.answers, [key]: value.slice(0, 1000) }, completedSteps: attempt.completedSteps.filter(n => n < fieldStep[key]) };
}
export function validateStep(attempt: Attempt): string | null {
  const a = attempt.answers;
  const has = (key: AnswerKey, min = 10) => a[key].trim().length >= min;
  switch (attempt.step) {
    case 0: return has('notice') ? null : 'Describe one thing you notice in at least 10 characters.';
    case 1: return has('goal') && has('constraint') ? null : 'Describe both what should improve and what must stay the same (at least 10 characters each).';
    case 2: {
      const ideas = [a.idea1, a.idea2, a.idea3].map(v => v.trim().toLowerCase());
      return ideas.every(v => v.length >= 8) && new Set(ideas).size === 3 ? null : 'Add three different ideas, at least 8 characters each.';
    }
    case 3: return has('hypothesis', 12) ? null : 'Write a prediction with a reason (at least 12 characters).';
    case 4: {
      const validCount = (v: string) => /^\d{1,2}$/.test(v) && Number(v) <= 50;
      return validCount(a.flat) && validCount(a.folded) && has('observation') ? null : 'Enter both test counts as whole numbers from 0 to 50 and add an observation (at least 10 characters).';
    }
    case 5: return has('reflection', 12) ? null : 'Describe what the evidence tells you (at least 12 characters).';
    case 6: return has('transfer', 12) ? null : 'Describe where else you could try this idea (at least 12 characters).';
    default: return 'Choose a valid mission step.';
  }
}
export function advance(attempt: Attempt): Attempt {
  if (validateStep(attempt)) return attempt;
  return { ...attempt, step: Math.min(6, attempt.step + 1), completedSteps: Array.from(new Set([...attempt.completedSteps, attempt.step])).sort() };
}
export function isComplete(attempt: Attempt): boolean { return attempt.completedSteps.length === steps.length; }
export function progress(attempt: Attempt): number { return Math.round(attempt.completedSteps.length / steps.length * 100); }
export function exportPortfolio(attempts: Attempt[]) {
  return { schemaVersion: '0.5.0', syntheticDemo: true, provenance: 'Manually entered demonstration notes; unverified observations. No mastery score.', missions: attempts.filter(a => a.completedSteps.length > 0).map(a => ({ missionId: a.missionId, missionVersion: a.missionVersion, stage: a.stage, completedSteps: a.completedSteps.map(i => steps[i]), complete: isComplete(a), evidence: a.answers })) };
}
export const sampleAnswers: Answers = {
  notice: 'The flat paper bends in the middle when a small counter is added.',
  goal: 'The bridge should hold more identical counters.',
  constraint: 'Use one equal-sized sheet of paper for each prototype.',
  idea1: 'Fold the paper into a zigzag cross section.',
  idea2: 'Roll the paper into two narrow support tubes.',
  idea3: 'Shape the paper into an arch across the gap.',
  hypothesis: 'If I add accordion folds, the bridge may carry more because its cross section changes.',
  flat: '2', folded: '8',
  observation: 'In this fictional example, the folded paper held eight counters and the flat paper held two.',
  reflection: 'The folded structure carried more in this example. One trial is not enough to prove it always will.',
  transfer: 'I could compare flat and folded cardboard in a model shelf, with the same material and span.'
};
