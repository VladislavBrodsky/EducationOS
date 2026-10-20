export const journalArticles = [
  {
    slug: 'see-the-invisible',
    category: 'PHYSICS',
    title: 'How can we see what we cannot touch?',
    description: 'A child-friendly way to make motion, waves, and gravity easier to discuss.',
    image: '/images/physics-vision.webp',
    imageAlt: 'Concept artwork of a learner exploring Earth, orbits, and waves through clear glasses',
    readTime: '4 MIN READ',
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
    description: 'Geometry becomes more memorable when a learner can change the view.',
    image: '/images/math-vision.webp',
    imageAlt: 'Concept artwork of a learner arranging transparent geometric solids',
    readTime: '3 MIN READ',
    sections: [
      { heading: 'Let a shape move', paragraphs: ['A square stays a square when you rotate the page. Two equal halves can look different while covering the same amount. These are ideas children can discover by moving real pieces.', 'Try drawing a shape, cutting it out with adult help, and turning it without stretching it. Ask what changed and what stayed the same.'] },
      { heading: 'Ask for an explanation', paragraphs: ['The strongest moment is often the child’s own sentence: “It is still half because the two parts would cover the same space.” An explanation reveals more than a correct choice alone.', 'Our Same Half, Different Shape web lab invites learners to compare parts visually and explain their reasoning. It works on a phone in 2D as well as on a larger screen.'] },
    ],
  },
  {
    slug: 'paper-glider-experiment',
    category: 'DESIGN & SCIENCE',
    title: 'A paper glider can become a fair test',
    description: 'Change one detail, compare a flight, and let the observation guide the next design.',
    image: '/images/flight-vision.webp',
    imageAlt: 'Concept artwork of a learner studying a paper glider with visual airflow lines',
    readTime: '4 MIN READ',
    sections: [
      { heading: 'Build two versions', paragraphs: ['Fold two paper gliders from the same kind of sheet. Give one a wider wing or change a small fold. Before either flies, ask which one the learner expects to travel farther and why.', 'Launch them gently from the same place, in the same direction, with an adult supervising the space. Keep people and breakable objects out of the flight path.'] },
      { heading: 'Notice before judging', paragraphs: ['A flight is never perfectly controlled. A breeze or a different throw can change the result. Repeat the test and compare what happened across several tries.', 'Our aerodynamics artwork imagines airflow around a glider. The image helps introduce a question; the observation and the child’s explanation are the actual learning work.'] },
    ],
  },
] as const;

export type JournalArticle = (typeof journalArticles)[number];
