import { runPracticeCode, type PracticeCodeResult } from "@/lib/learning-runner";

export type PortalSubjectId = "programming" | "science" | "mathematics" | "language" | "arts";
export type PortalSubject = {
  id: PortalSubjectId;
  title: string;
  shortTitle: string;
  description: string;
  color: string;
  icon: "code" | "flask" | "shapes" | "book" | "palette";
  skillPath: string[];
  lessonIds: string[];
};
export type CodeActivity = {
  kind: "code";
  starterCode: string;
  expectedOutput: string[];
  hint: string;
  successMessage: string;
  languageLabel: string;
};
export type ChoiceActivity = {
  kind: "choice";
  question: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
};
export type WritingActivity = {
  kind: "writing";
  prompt: string;
  placeholder: string;
  minWords: number;
  checklist: string[];
  example: string;
};
export type ExperimentField = {
  id: string;
  label: string;
  placeholder: string;
  type: "text" | "number";
  min?: number;
  max?: number;
  minWords?: number;
};
export type ExperimentActivity = {
  kind: "experiment";
  prompt: string;
  fields: ExperimentField[];
  checklist: string[];
};
export type PortalActivity = CodeActivity | ChoiceActivity | WritingActivity | ExperimentActivity;
export type PortalLesson = {
  id: string;
  subjectId: PortalSubjectId;
  title: string;
  subtitle: string;
  minutes: number;
  skill: string;
  objective: string;
  learn: string[];
  instructions: string;
  activity: PortalActivity;
  reflection: string;
};
export type ActivitySubmission = {
  code?: string;
  answer?: string;
  writing?: string;
  observations?: Record<string, string>;
};
export type ActivityCheck = {
  passed: boolean;
  field?: string;
  feedback: string;
  output?: string[];
  error?: PracticeCodeResult["error"];
};

export const PORTAL_SUBJECTS: PortalSubject[] = [
  { id: "programming", title: "Programming", shortTitle: "Code", description: "Give ideas instructions. Make something that works", color: "lime", icon: "code", skillPath: ["Sequences", "Variables", "Loops"], lessonIds: ["programming-first-message", "programming-variables", "programming-repeat"] },
  { id: "science", title: "Science", shortTitle: "Science", description: "Ask a question. Test an idea. Follow the evidence", color: "blue", icon: "flask", skillPath: ["Fair tests", "Observe", "Explain"], lessonIds: ["science-fair-test", "science-paper-bridge", "science-evidence"] },
  { id: "mathematics", title: "Mathematics", shortTitle: "Maths", description: "Find patterns and explain why they work", color: "orange", icon: "shapes", skillPath: ["Patterns", "Fractions", "Area"], lessonIds: ["mathematics-patterns", "mathematics-fractions", "mathematics-area"] },
  { id: "language", title: "Language & writing", shortTitle: "Writing", description: "Choose clear words. Build a story worth sharing", color: "purple", icon: "book", skillPath: ["Observe", "Revise", "Tell a story"], lessonIds: ["language-precise-description", "language-strong-sentence", "language-short-story"] },
  { id: "arts", title: "Arts & design", shortTitle: "Arts", description: "Notice, imagine and make your own visual language", color: "pink", icon: "palette", skillPath: ["Patterns", "Colour", "Design"], lessonIds: ["arts-patterns", "arts-color-story", "arts-design-brief"] },
];

const practiceLanguage = "EducationOS practice code";
export const PORTAL_LESSONS: PortalLesson[] = [
  {
    id: "programming-first-message", subjectId: "programming", title: "Your first message", subtitle: "A small instruction. A visible result", minutes: 6, skill: "Sequences",
    objective: "Write two instructions and see how their order changes the output.",
    learn: ["A program is a sequence of instructions. This workspace runs one line after another, from top to bottom.", 'print("Hello") displays the text inside the quotes. Quotes tell the program that Hello is text.', "Try changing the message, run it, then arrange two lines to match the activity goal."],
    instructions: 'Make the output show Hello, world! on the first line and I can make things. on the second line. Use two print() instructions.',
    activity: { kind: "code", starterCode: 'print("Hello, world!")\nprint("Change this message")', expectedOutput: ["Hello, world!", "I can make things."], hint: 'Keep the first line. On the second, put I can make things. inside the quotes.', successMessage: "Both messages appeared in the right order. Your sequence matches the goal.", languageLabel: practiceLanguage },
    reflection: "What changes if you swap the two instructions? Try it, then restore your solution.",
  },
  {
    id: "programming-variables", subjectId: "programming", title: "Give an idea a name", subtitle: "Store a value. Use it again", minutes: 8, skill: "Variables",
    objective: "Use a variable to hold a number and calculate a new value.",
    learn: ["A variable is a name for a stored value. seeds = 4 stores the number 4 under the name seeds.", "print(seeds) reads that value. print(seeds + 2) calculates a result without changing seeds.", "You can also update a value: seeds = seeds + 2. The right side is calculated before the new value is stored."],
    instructions: "You have 4 seeds and find 3 more. Set seeds to 4, add 3 to seeds, then print seeds. The output should be 7.",
    activity: { kind: "code", starterCode: "seeds = 4\nseeds = seeds + 1\nprint(seeds)", expectedOutput: ["7"], hint: "The second line changes seeds. Replace 1 with the number of seeds you found.", successMessage: "The output is 7: four seeds plus three more. Read your code once more and point to where the value changes.", languageLabel: practiceLanguage },
    reflection: "If you start with 10 seeds, which line would you change? What would the result be?",
  },
  {
    id: "programming-repeat", subjectId: "programming", title: "Make a little rhythm", subtitle: "Let a loop do the repeating", minutes: 8, skill: "Loops",
    objective: "Use a repeat block to produce a three-part pattern.",
    learn: ["A loop repeats a group of instructions. repeat 3: runs the indented lines three times.", 'Place two spaces before a line that belongs to a repeat block. For example: repeat 2: followed by an indented print("Clap").', "The number after repeat counts the whole block. Two instructions inside a loop of three repeats produce six output lines."],
    instructions: 'Make a rhythm with three repeats of Clap followed by Tap. Use a repeat block and two indented print() lines.',
    activity: { kind: "code", starterCode: 'repeat 2:\n  print("Clap")\n  print("Tap")', expectedOutput: ["Clap", "Tap", "Clap", "Tap", "Clap", "Tap"], hint: "Your block already has the right rhythm. How many times should the block repeat?", successMessage: "The six output lines form three Clap–Tap pairs. A loop makes the repeated pattern easier to change.", languageLabel: practiceLanguage },
    reflection: "Add a third sound inside the block. Predict how many lines you will get before you run it.",
  },
  {
    id: "science-fair-test", subjectId: "science", title: "Ask a testable question", subtitle: "Change one thing. Watch what happens", minutes: 6, skill: "Fair tests",
    objective: "Identify a comparison that can help test an explanation.",
    learn: ["A useful test starts with a question you can investigate: does folding a paper bridge change how long it holds a light block?", "Change one main feature at a time. Keep the paper, the 10 cm gap between supports and the light block the same.", "This helps you connect a difference in the result to the feature you changed. Repeating the test helps you see how much the result varies."],
    instructions: "Choose the plan that makes the clearest comparison.",
    activity: { kind: "choice", question: "Which plan best tests whether folding makes a paper bridge hold a light block for longer?", options: [{ id: "same", text: "Use the same paper, 10 cm gap and light block; compare flat paper with folded paper." }, { id: "different", text: "Compare flat cardboard across a small gap with folded tissue across a large gap." }, { id: "one", text: "Test only the folded paper, then call it the strongest design." }], correctOptionId: "same", explanation: "Keeping paper, gap and the light block the same leaves folding as the main changed feature. Different materials or gaps introduce other explanations." },
    reflection: "Name two things you would keep the same in your own test.",
  },
  {
    id: "science-paper-bridge", subjectId: "science", title: "Build, test, notice", subtitle: "Your observations are the material", minutes: 15, skill: "Observe",
    objective: "Record a simple comparison, including results that surprise you.",
    learn: ["With an adult, set two stable supports 10 cm apart on a low table. Place a sheet of paper across them. Put one large, light toy block in the middle and time how long it holds, stopping at 60 seconds.", "Record the time. Fold the same-sized paper into a zigzag, keep the 10 cm gap the same and test again with the same block. The adult can help time the trial.", "A lower result is useful evidence too. Describe what happened without changing the numbers to fit your prediction. Use large materials and keep the test close to the tabletop."],
    instructions: "Run both trials and record what you actually observed. Zero is a valid result if the bridge collapses immediately. Record 60 if it is still standing at the time limit.",
    activity: { kind: "experiment", prompt: "Compare your flat and folded paper bridges.", fields: [{ id: "flat", label: "Flat bridge: seconds held (0–60)", placeholder: "For example, 3", type: "number", min: 0, max: 60 }, { id: "folded", label: "Folded bridge: seconds held (0–60)", placeholder: "Use your own result", type: "number", min: 0, max: 60 }, { id: "notice", label: "What happened?", placeholder: "Describe where it bent, slipped or stayed strong.", type: "text", minWords: 6 }], checklist: ["I kept the paper, 10 cm gap and block the same.", "I recorded the results I observed.", "I can describe one thing I would test again."] },
    reflection: "Which result would you expect if you repeated the test? What might make it change?",
  },
  {
    id: "science-evidence", subjectId: "science", title: "What can evidence say?", subtitle: "A result is the start of an explanation", minutes: 6, skill: "Explain",
    objective: "Choose a conclusion that fits the available evidence.",
    learn: ["Imagine a flat bridge held a block for 3 seconds and a folded bridge held it for 8 seconds in one test.", "You can report that the folded bridge held the block for 5 seconds longer in that comparison. You cannot yet say it will always be stronger in every situation.", "Repeat the comparison, write down all results and look for a pattern. Evidence can strengthen or change an explanation."],
    instructions: "Read the result carefully, then choose the conclusion it supports.",
    activity: { kind: "choice", question: "A flat bridge held a block for 3 seconds; a folded bridge held it for 8 seconds in one trial. What can you conclude?", options: [{ id: "always", text: "Every folded bridge is always stronger than every flat bridge." }, { id: "observed", text: "The folded bridge held the block for 5 seconds longer in this comparison; more trials would test the pattern." }, { id: "nothing", text: "The test tells us nothing because it was only done once." }], correctOptionId: "observed", explanation: "8 − 3 = 5 describes the recorded difference. One trial provides evidence, while repeated trials help check how consistent it is." },
    reflection: "What other explanation could you investigate if a second trial gave a different result?",
  },
  {
    id: "mathematics-patterns", subjectId: "mathematics", title: "Find the rule", subtitle: "See what stays the same as numbers change", minutes: 6, skill: "Patterns",
    objective: "Find and apply an addition rule in a number sequence.",
    learn: ["In the sequence 3, 6, 9, 12, each number is 3 more than the one before it.", "Compare neighbouring numbers to look for a repeating change. Here, 6 − 3, 9 − 6 and 12 − 9 all equal 3.", "A few numbers can fit several possible rules. In this activity, use the rule add 3 each time."],
    instructions: "Continue the sequence using the stated rule.",
    activity: { kind: "choice", question: "Add 3 each time: 3, 6, 9, 12, … What comes next?", options: [{ id: "14", text: "14" }, { id: "15", text: "15" }, { id: "16", text: "16" }, { id: "24", text: "24" }], correctOptionId: "15", explanation: "The rule adds 3 to the last number. 12 + 3 = 15. Adding another 3 would give 18." },
    reflection: "Make your own four-number sequence. Tell someone the rule and ask them for the next number.",
  },
  {
    id: "mathematics-fractions", subjectId: "mathematics", title: "Share the whole", subtitle: "Equal parts make fractions useful", minutes: 8, skill: "Fractions",
    objective: "Recognise equivalent fractions using equal-sized parts.",
    learn: ["A fraction describes equal parts of a whole. In 2/4, the whole is divided into 4 equal parts and 2 of them are selected.", "Imagine folding a paper in half, then folding each half in half again. Two of the four equal sections cover one half.", "2/4 and 1/2 represent the same amount of the same-sized whole."],
    instructions: "Compare the fractions using the same whole.",
    activity: { kind: "choice", question: "You shade 2 of 4 equal sections of a square. Which fraction describes the same shaded amount?", options: [{ id: "half", text: "1/2" }, { id: "quarter", text: "1/4" }, { id: "third", text: "2/3" }, { id: "whole", text: "4/4" }], correctOptionId: "half", explanation: "Two quarters make one half. Dividing the top and bottom of 2/4 by 2 gives 1/2." },
    reflection: "Draw a shape divided into 6 equal parts. How many parts would cover half?",
  },
  {
    id: "mathematics-area", subjectId: "mathematics", title: "Build a tiny garden", subtitle: "Count space in square units", minutes: 8, skill: "Area",
    objective: "Calculate the area of a rectangle from rows and columns.",
    learn: ["Area measures how much surface a shape covers. A square unit is one unit wide and one unit tall.", "A rectangular garden with 3 rows of 4 square tiles contains 4 + 4 + 4 = 12 tiles.", "For a rectangle, rows × columns gives the total number of square units. The distance around its edge is a different measurement: perimeter."],
    instructions: "Imagine or draw the rows of tiles before choosing your answer.",
    activity: { kind: "choice", question: "A rectangular garden has 3 rows of 4 square tiles. What is its area?", options: [{ id: "7", text: "7 square units" }, { id: "12", text: "12 square units" }, { id: "14", text: "14 square units" }, { id: "34", text: "34 square units" }], correctOptionId: "12", explanation: "There are 3 rows, each with 4 tiles: 3 × 4 = 12 square units. Adding the side lengths would not count the surface." },
    reflection: "Can you arrange 12 tiles into a different rectangle? Name its rows and columns.",
  },
  {
    id: "language-precise-description", subjectId: "language", title: "Help a reader see it", subtitle: "Trade a vague word for a useful detail", minutes: 8, skill: "Observe",
    objective: "Describe an ordinary object using specific observations.",
    learn: ["A description gives a reader details they can imagine. Nice tells us your opinion; a chipped blue handle tells us something we can picture.", "Choose an object near you. Notice its shape, texture, colour or sound. You do not need to use every sense.", "Select two or three details that help distinguish this object from another one."],
    instructions: "Write at least 20 words about a nearby object without naming it. Then ask someone to guess the object.",
    activity: { kind: "writing", prompt: "Describe your mystery object.", placeholder: "It has… When I look closely…", minWords: 20, checklist: ["I included at least two specific details.", "I chose words that help a reader imagine the object.", "I read my description aloud and revised one word."], example: "A curved blue handle sticks out from its smooth white side. Inside, a dark ring marks where warm tea used to sit." },
    reflection: "Which detail helped someone guess your object? Which detail could be clearer?",
  },
  {
    id: "language-strong-sentence", subjectId: "language", title: "Choose the useful detail", subtitle: "A clearer sentence has a job to do", minutes: 6, skill: "Revise",
    objective: "Recognise a revision that makes an action more specific.",
    learn: ["Revision means choosing words that better express your idea. Longer sentences are not automatically clearer.", "The bird moved gives little information. The sparrow hopped along the windowsill names the bird, the movement and the place.", "Choose details that serve the meaning. You can remove extra words when they distract from the action."],
    instructions: "Find the sentence that helps you picture the action most clearly.",
    activity: { kind: "choice", question: "Which revision makes The animal moved more specific?", options: [{ id: "extra", text: "The very, very nice animal moved in a way." }, { id: "clear", text: "The fox slipped through a gap in the fence." }, { id: "same", text: "The animal did a movement." }], correctOptionId: "clear", explanation: "Fox names the animal, slipped describes its movement and the gap in the fence gives a place. Each detail helps the reader picture the action." },
    reflection: "Write your own specific version of A person went somewhere.",
  },
  {
    id: "language-short-story", subjectId: "language", title: "A problem, a choice, a change", subtitle: "Build a story in a few sentences", minutes: 12, skill: "Tell a story",
    objective: "Write a short story in which a character responds to a problem.",
    learn: ["A story can begin when someone wants something and a problem gets in the way.", "Give your character a choice. What do they try? What happens because of that choice?", "An ending can show a change in the situation, the character or what the reader understands."],
    instructions: "Write at least 40 words about someone who finds a mysterious key. Include a problem, a choice and a change.",
    activity: { kind: "writing", prompt: "What does the key change?", placeholder: "The key was lying… But… So…", minWords: 40, checklist: ["My character faces a clear problem.", "My character makes a choice that affects what happens.", "The ending shows something that changed."], example: "A key might open a locked garden, belong to someone who lost it, or fit nothing at all. Decide what your character wants before you choose the answer." },
    reflection: "Read your story aloud. Where could one detail make the character's choice easier to understand?",
  },
  {
    id: "arts-patterns", subjectId: "arts", title: "Notice a visual rhythm", subtitle: "Shapes can repeat, too", minutes: 6, skill: "Patterns",
    objective: "Recognise the repeating unit in a visual pattern.",
    learn: ["Artists and designers use repeated shapes, colours or marks to create rhythm.", "A repeating unit is the smallest group that starts again. In circle, triangle, triangle, circle, triangle, triangle, the unit has three shapes.", "You can create variety by changing the size, spacing or direction while keeping a pattern recognisable."],
    instructions: "Find the group that repeats.",
    activity: { kind: "choice", question: "A pattern is circle, triangle, triangle, circle, triangle, triangle. What is the repeating unit?", options: [{ id: "one", text: "Circle" }, { id: "two", text: "Circle, triangle" }, { id: "three", text: "Circle, triangle, triangle" }], correctOptionId: "three", explanation: "The group circle, triangle, triangle appears twice. Repeating that three-shape unit produces the whole pattern." },
    reflection: "Draw your own repeating unit, then repeat it four times. Change the spacing and notice the effect.",
  },
  {
    id: "arts-color-story", subjectId: "arts", title: "Tell a story with colour", subtitle: "Make choices, then explain their effect", minutes: 12, skill: "Colour",
    objective: "Choose a small colour palette for an intended mood.",
    learn: ["Colour can suggest a mood, but people do not all experience it in the same way. Context, culture and personal memories matter.", "Choose three colours for an imaginary place. Think about their brightness, contrast and the amount of space each colour takes.", "Sketch the place on paper if you like. Then explain your choices. Your explanation matters more than choosing a supposedly correct colour."],
    instructions: "Invent a peaceful, energetic or mysterious place. Write at least 25 words describing three colour choices and the effect you want.",
    activity: { kind: "writing", prompt: "Give your place a three-colour palette.", placeholder: "My place feels… I chose… because…", minWords: 25, checklist: ["I named three colours.", "I explained the mood or effect I want.", "I described where or how much I would use each colour."], example: "A quiet reading garden could use pale green for most of the walls, dark blue for shaded corners and a small yellow doorway that draws the eye." },
    reflection: "Change one colour in your plan. How might the place feel different?",
  },
  {
    id: "arts-design-brief", subjectId: "arts", title: "Design for someone", subtitle: "A useful idea starts with a real need", minutes: 12, skill: "Design",
    objective: "Connect a design decision to the needs of its user.",
    learn: ["Design starts by asking who something is for and what they need to do.", "Imagine a sign that helps a new learner find a quiet reading corner. Words, a simple symbol and good contrast can work together.", "A useful design explanation connects each choice to a need: large lettering can be read from farther away; a book symbol can help someone who is still learning to read."],
    instructions: "Sketch a reading-corner sign on paper, then write at least 30 words explaining who will use it and two choices that help them.",
    activity: { kind: "writing", prompt: "Explain your sign design.", placeholder: "This sign is for… They need… I chose…", minWords: 30, checklist: ["I identified who the sign is for.", "I explained two choices that help that person.", "I named one way to test whether the sign works."], example: "Show the sign to someone without explaining it. Ask where they think it leads and what part they notice first. Their answer can guide your next version." },
    reflection: "What would you change if someone could not understand the sign? Test one revision.",
  },
];

export function getPortalSubject(id: string): PortalSubject | undefined { return PORTAL_SUBJECTS.find((subject) => subject.id === id); }
export function getPortalLesson(id: string): PortalLesson | undefined { return PORTAL_LESSONS.find((lesson) => lesson.id === id); }
export function getSubjectLessons(subjectId: string): PortalLesson[] { return PORTAL_LESSONS.filter((lesson) => lesson.subjectId === subjectId); }
export function countWords(value: string): number { return value.trim().split(/\s+/u).filter(Boolean).length; }

/** Checks only the stated, visible criteria; free writing is never graded for quality. */
export function checkPortalActivity(lesson: PortalLesson, submission: ActivitySubmission): ActivityCheck {
  const activity = lesson.activity;
  if (activity.kind === "code") {
    const result = runPracticeCode(submission.code ?? "");
    if (!result.ok) return { passed: false, field: "code", feedback: `Line ${result.error?.line}: ${result.error?.message}`, output: result.output, error: result.error };
    const matches = result.output.length === activity.expectedOutput.length && result.output.every((line, index) => line === activity.expectedOutput[index]);
    return { passed: matches, field: matches ? undefined : "code", output: result.output, feedback: matches ? `${activity.successMessage} This checks output, so compare your instructions with the goal too.` : "Your program ran. Compare its output with the goal, change one thing and try again." };
  }
  if (activity.kind === "choice") {
    if (!activity.options.some((option) => option.id === submission.answer)) return { passed: false, field: "answer", feedback: "Choose an answer, then check your thinking." };
    const matches = submission.answer === activity.correctOptionId;
    return { passed: matches, field: matches ? undefined : "answer", feedback: matches ? activity.explanation : `Try again. ${activity.explanation}` };
  }
  if (activity.kind === "writing") {
    const writing = submission.writing ?? "";
    if (writing.length > 6000) return { passed: false, field: "writing", feedback: "Keep your response under 6,000 characters so it can be saved in this workspace." };
    const words = countWords(writing);
    if (words < activity.minWords) return { passed: false, field: "writing", feedback: `You have ${words} ${words === 1 ? "word" : "words"}. Write at least ${activity.minWords}, then review the checklist.` };
    return { passed: true, feedback: `Your ${words}-word draft is recorded. This checks length, not writing quality. Read the checklist, revise your draft and discuss it with someone when you can.` };
  }
  for (const field of activity.fields) {
    const value = submission.observations?.[field.id]?.trim() ?? "";
    if (value.length > 2000) return { passed: false, field: field.id, feedback: `Keep “${field.label}” under 2,000 characters.` };
    if (field.type === "number") {
      if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) < (field.min ?? 0) || Number(value) > (field.max ?? 1000)) return { passed: false, field: field.id, feedback: `Enter a whole number from ${field.min ?? 0} to ${field.max ?? 1000} for “${field.label}”.` };
    } else if (countWords(value) < (field.minWords ?? 3)) return { passed: false, field: field.id, feedback: `Add at least ${field.minWords ?? 3} words to “${field.label}” to describe your observation.` };
  }
  return { passed: true, feedback: "Your observations are recorded. This checks that the fields are filled in; it does not verify the experiment or prove an explanation. Review the checklist and consider a repeat trial." };
}
