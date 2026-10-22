export const journalArticles = [
  {
    slug: 'see-the-invisible',
    category: 'PHYSICS',
    title: 'How can we see what we cannot touch?',
    description: 'A child-friendly way to make motion, waves, and gravity easier to discuss',
    image: '/images/physics-cutout.webp',
    imageAlt: 'Concept artwork of a learner exploring Earth, orbits, and waves through clear glasses',
    readTime: '4 MIN READ',
    challenge: { label: 'TRY IT TOGETHER', question: 'Which ball will travel farther?', material: 'Two lightweight balls, a book, and a flat surface', action: 'Roll each ball from the same point on a gently tilted book. Compare where they stop, then try one change.' },
    sections: [
      { heading: 'Start with a question', paragraphs: ['What makes a ball fall? Why does a shadow move? A useful physics lesson begins with something a child can notice, not a formula to memorize.', 'Ask the learner to predict what will happen, try a safe everyday test, then describe what changed. A sketch or a few words can make the observation visible.'] },
      { heading: 'Make a model, then test its limits', paragraphs: ['A drawn arc can show the path of a tossed paper ball. A line of dots can show positions at different moments. A wave drawn on paper can help compare a faster and slower rhythm.', 'Models simplify reality. Invite the learner to point out what the drawing leaves out; that question is part of understanding, too.'] },
      { heading: 'Try it together', paragraphs: ['Roll two different lightweight balls down the same gentle ramp, one at a time. Keep the starting point the same. Where do they stop? What might you change next?', 'The floating overlays in our artwork are an imaginative illustration. Today’s EducationOS activities run in a web browser and use ordinary materials and guided reflection.'] },
    ],
  },
  {
    slug: 'math-you-can-move',
    category: 'MATHEMATICS',
    title: 'Math you can turn, fold, and explain',
    description: 'Geometry becomes more memorable when a learner can change the view',
    image: '/images/math-cutout.webp',
    imageAlt: 'Concept artwork of a learner arranging transparent geometric solids',
    readTime: '3 MIN READ',
    challenge: { label: 'TRY IT TOGETHER', question: 'Can two different shapes show the same half?', material: 'Paper, a pencil, and child-safe scissors with adult help', action: 'Fold a paper square in half two different ways. Cut along each fold and compare the pieces.' },
    sections: [
      { heading: 'Let a shape move', paragraphs: ['A square stays a square when you rotate the page. Two equal halves can look different while covering the same amount. These are ideas children can discover by moving real pieces.', 'Try drawing a shape, cutting it out with adult help, and turning it without stretching it. Ask what changed and what stayed the same.'] },
      { heading: 'Ask for an explanation', paragraphs: ['The strongest moment is often the child’s own sentence: “It is still half because the two parts would cover the same space.” An explanation reveals more than a correct choice alone.', 'Our Same Half, Different Shape web lab invites learners to compare parts visually and explain their reasoning. It works on a phone in 2D as well as on a larger screen.'] },
    ],
  },
  {
    slug: 'paper-glider-experiment',
    category: 'DESIGN & SCIENCE',
    title: 'A paper glider can become a fair test',
    description: 'Change one detail, compare a flight, and let the observation guide the next design',
    image: '/images/flight-cutout.webp',
    imageAlt: 'Concept artwork of a learner studying a paper glider with visual airflow lines',
    readTime: '4 MIN READ',
    challenge: { label: 'TRY IT TOGETHER', question: 'What happens when one wing changes?', material: 'Two sheets of paper and a clear space', action: 'Fold two gliders alike, then change one wing on just one. Predict, fly, and repeat from the same spot.' },
    sections: [
      { heading: 'Build two versions', paragraphs: ['Fold two paper gliders from the same kind of sheet. Give one a wider wing or change a small fold. Before either flies, ask which one the learner expects to travel farther and why.', 'Launch them gently from the same place, in the same direction, with an adult supervising the space. Keep people and breakable objects out of the flight path.'] },
      { heading: 'Notice before judging', paragraphs: ['A flight is never perfectly controlled. A breeze or a different throw can change the result. Repeat the test and compare what happened across several tries.', 'Our aerodynamics artwork imagines airflow around a glider. The image helps introduce a question; the observation and the child’s explanation are the actual learning work.'] },
    ],
  },
  {
    slug: 'program-a-paper-robot',
    category: 'PROGRAMMING',
    title: 'Can you program a paper robot?',
    description: 'A playful way to discover algorithms, loops, and debugging without a screen',
    image: '/images/code-cutout.webp',
    imageAlt: 'Concept artwork of a learner exploring a visual programming flow',
    readTime: '3 MIN READ',
    challenge: { label: 'TRY IT TOGETHER', question: 'Can your instructions draw a square?', material: 'Grid paper, a pencil, and a partner', action: 'Write “move one square, turn right” four times. Let your partner follow it exactly. Edit any instruction that surprises you.' },
    sections: [
      { heading: 'Give a tiny instruction', paragraphs: ['An algorithm is a sequence of instructions. Ask one person to be a paper robot and another to write steps for moving a pencil across a grid. A direction like “go over there” may sound clear until someone has to follow it exactly.', 'Start with small commands: move one square, turn right, and stop. Compare the path you imagined with the line your partner drew.'] },
      { heading: 'Notice the repeat', paragraphs: ['If a set of steps happens again and again, you have found a loop. Four repeats of “move one square, turn right” can trace a square. Change the number of steps and predict the new shape before drawing it.', 'When the result looks different from the plan, inspect one instruction at a time. Finding and fixing that mismatch is debugging.'] },
      { heading: 'Explain the change', paragraphs: ['Ask what the robot did, what the programmer expected, and which single edit made the result clearer. The goal is not to write perfect instructions first; it is to make an idea testable and improve it.'] },
    ],
  },
] as const;

export type JournalArticle = (typeof journalArticles)[number];
