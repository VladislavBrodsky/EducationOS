import type { Metadata } from 'next';
import { SiteShell, DemoCTA } from '@/components/site-shell';
export const metadata: Metadata = { title: 'Learning through invention', alternates: { canonical: '/approach' } };
const steps = [
 ['Notice','Look closely before solving. Describe what happens with the first version of your paper bridge.'],
 ['Find a contradiction','We want a stronger bridge, but we want to use the same sheet of paper. A useful tension gives invention a direction.'],
 ['Imagine possibilities','Sketch or describe different approaches. Folding, changing the shape, and rearranging the same material give us different ideas to explore.'],
 ['Form a hypothesis','Choose one idea and make a prediction you can test. Explain why you think it might work.'],
 ['Run a fair experiment','Compare your first structure with the new version. Keep the test conditions steady and record what you observe.'],
 ['Reflect on the evidence','Did the result fit your prediction? A surprising result is a reason to think again, not a failure.'],
 ['Transfer the idea','Look for another place where the same principle might help. The mission ends with a new question.'],
];
export default function Approach(){return <SiteShell><div className="container"><section className="page-hero"><p className="eyebrow">OUR LEARNING APPROACH</p><h1>Teach a way of thinking.<br />Open a world of ideas.</h1><p className="section-lead">A guided cycle of questions, possibilities, and real observations. Inspired by TRIZ inventive problem solving and adapted for hands-on exploration.</p></section><div className="approach-steps">{steps.map(([title,body],i)=><section className="approach-step" key={title}><span className="step-number">0{i+1}</span><div><h2>{title}</h2><p>{body}</p></div></section>)}</div><div className="notice">Evidence over scores. The demo portfolio shows the ideas and observations you actually record. It does not infer intelligence, diagnose learning needs, or claim mastery from a completed activity. Curriculum and age suitability require educator review before a real learner launch.</div></div><DemoCTA small /></SiteShell>}
