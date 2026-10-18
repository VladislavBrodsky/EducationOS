import type { AgeBand, PublishedMission } from "@/contracts/learning";

export const AGE_PROGRAMS: ReadonlyArray<{ ageBand: AgeBand; name: string; world: PublishedMission["world"]; worldName: string; focus: string }> = [
  { ageBand: "5-6", name: "Explorers", world: "curiosity-grove", worldName: "Curiosity Grove", focus: "Notice, wonder, and try together" },
  { ageBand: "7-9", name: "Builders", world: "builder-harbor", worldName: "Builder Harbor", focus: "Turn questions into small experiments" },
  { ageBand: "10-12", name: "Makers", world: "orbit-lab", worldName: "Orbit Lab", focus: "Find patterns and test an idea" },
  { ageBand: "13-15", name: "Creators", world: "future-city", worldName: "Future City", focus: "Explore tradeoffs and explain the evidence" },
  { ageBand: "16-17", name: "Launchers", world: "frontier-studio", worldName: "Frontier Studio", focus: "Design, measure, and question your conclusions" },
];

const prompts: Record<AgeBand, readonly string[]> = {
  "5-6": [
    "With a grown-up, put a sheet of paper between two books 10 cm apart. Set one large, light toy block in the middle. What happens? Tell your grown-up or type what you notice.",
    "We want our paper bridge to stand for longer. We also want to use just one sheet. What makes these two wishes tricky together?",
    "Imagine two different bridges. Could you fold the paper like a fan? Could you curve it? Describe or ask your grown-up to record two ideas.",
    "Make a guess: if I change the shape of the paper, then the bridge will… Tell us which shape you want to try and why.",
    "Ask a grown-up to time the flat bridge, then your changed bridge, using the same large light block. Stop each trial after 60 seconds. Record both times and what happened.",
    "Look at your two times. What surprised you? A bridge falling is useful information too. What would you try again?",
    "Where else could a fold make something stronger? Think of a paper tent, a card, or a roof. Share one new place to try your idea.",
  ],
  "7-9": [
    "Balance one sheet of paper across two books 10 cm apart. With an adult nearby, place one large, light toy block in the center. Observe what bends, moves, or stays still.",
    "Your challenge is to make a bridge stand longer without adding paper. Explain the tradeoff between using less material and making a stronger structure.",
    "Invent at least two different shapes. Think about folds, a curve, or changing where the paper touches the books. Give each idea a short description.",
    "Choose one idea. Finish the thought: if I change…, then I predict…, because… Keep the distance between the books the same.",
    "Time the flat bridge and your new bridge with the same large, light block. Stop at 60 seconds. Keep the gap, paper, block, and position the same. Record both results and any differences you noticed.",
    "Did your observation match your prediction? Explain one thing your experiment showed and one thing you would like to check again.",
    "Find another everyday structure that uses shape to stay strong. Describe how you could borrow your bridge idea there.",
  ],
  "10-12": [
    "Create a baseline: span two books 10 cm apart with one sheet of paper. Place one large, light block in the middle, with adult support. Describe the bending and likely weak point.",
    "State the contradiction: the bridge should resist bending, while its amount of material stays fixed. Which property do you want to improve, and which constraint must remain?",
    "Propose at least two distinct structures. Try a TRIZ lens: change the shape, divide the surface into folds, or redistribute support. Explain how each might help.",
    "Write a testable prediction for one design: if…, then…, because…. Name the variable you will change and the variables you will keep constant.",
    "Compare flat and redesigned paper using the same gap, paper, block, and placement. Measure time until collapse, capped at 60 seconds. Record both values and observations. These are single trials, not proof.",
    "Compare the recorded results with your prediction. What alternative explanation or measurement limitation could affect your conclusion?",
    "Apply the principle of changing shape to a different design problem. Explain the shared principle and one thing that would need a new test.",
  ],
  "13-15": [
    "Build a baseline paper bridge over a 10 cm gap between two books. Use one large, light block as a fixed load, with adult support. Describe deformation, support, and the likely failure mode.",
    "Formulate the technical contradiction: increase resistance to bending while keeping material quantity fixed. Explain how optimizing one property could make another property worse.",
    "Develop at least two structurally different concepts using TRIZ prompts: geometry transformation, segmentation, or local quality. State the mechanism behind each concept.",
    "Choose one concept and predict its effect on time to collapse. Specify the independent variable, expected direction, and why your mechanism should work.",
    "Measure baseline and modified time to collapse, with a 60-second cap. Control paper, gap, block, placement, and timing method. Record the results and any confounders. One pair of trials supports only a tentative conclusion.",
    "Interpret the change without overstating certainty. Discuss whether the observations support your mechanism, possible confounders, and a useful repeat trial.",
    "Transfer the same principle to a structure or product beyond bridges. Identify the new constraint and propose a test before claiming it works.",
  ],
  "16-17": [
    "Define a baseline system: a single paper sheet spanning a 10 cm gap, supporting one fixed large, light block. With adult support, document boundary conditions, deformation, and a plausible failure mechanism.",
    "Model the contradiction between flexural performance and fixed material quantity. Define the desired improvement and any secondary property your redesign might compromise.",
    "Generate at least two concepts with different mechanisms. Consider geometric transformation, segmentation, and local reinforcement through redistribution. Explain the causal rationale for each.",
    "Commit to a falsifiable hypothesis for one concept, naming the independent variable, expected outcome, controlled conditions, and the mechanism connecting them.",
    "Compare a baseline and redesigned bridge under matched conditions. Record time to collapse, censored at 60 seconds, and qualitative observations. Document timing uncertainty or confounders. A single pair of measurements cannot establish reproducibility.",
    "Assess the hypothesis against the recorded data. Separate observation from inference, identify uncertainty, and specify what replication or a contrasting test would add.",
    "Translate the principle to a new context. Explain the limits of the analogy, a competing constraint, and a measurable validation experiment.",
  ],
};

const titles = ["Notice the system", "Find the contradiction", "Imagine alternatives", "Make a hypothesis", "Test your idea", "Reflect on the evidence", "Transfer the principle"] as const;
const kinds = ["notice", "contradiction", "imagine", "hypothesis", "experiment", "reflect", "transfer"] as const;

/** Immutable synthetic lesson content; contains no identities or learner data. */
export const DEMO_MISSIONS: readonly PublishedMission[] = AGE_PROGRAMS.map((program, index) => ({
  id: `e0500000-0000-4000-8000-00000000000${index + 1}`,
  missionId: `e0501000-0000-4000-8000-00000000000${index + 1}`,
  version: 1,
  title: "A little paper. A stronger bridge.",
  ageBand: program.ageBand,
  world: program.world,
  publishedAt: "2026-10-18T00:00:00.000Z",
  content: {
    summary: "Use the shape of one sheet of paper to explore a classic design contradiction. Notice, imagine, predict, test, and explain what your own evidence shows.",
    materials: ["One sheet of paper", "Two stable books", "One large, light toy block", "Ruler", "Timer", "A clear, dry tabletop"],
    adultGuidance: "An adult should choose suitable materials and support the activity, especially for younger learners. Use a large, light block with no small parts. Keep books low and stable on a clear, dry table. Do not use heavy loads, sharp tools, liquids, or raised surfaces. Stop if materials become unstable. Record only made-up demo notes; never enter names, photos, or personal information.",
    steps: kinds.map((kind, step) => ({ kind, title: titles[step], prompt: prompts[program.ageBand][step] })),
  },
}));

export function getDemoMission(ageBand: AgeBand): PublishedMission {
  return DEMO_MISSIONS.find((mission) => mission.ageBand === ageBand)!;
}
