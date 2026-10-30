'use client';

import { useRef, useState } from 'react';
import { useMotionPreference } from '@/components/magicui/use-motion-preference';
import { ArrowRight, ArrowUpRight, Atom, BookOpen, Check, Code2, FlaskConical, Layers3, Lightbulb, RotateCcw, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { MAGIC_UI_COMPONENTS } from '@/lib/magic-ui-catalog';
import { Marquee } from '@/components/magicui/marquee';
import { WordRotate } from '@/components/magicui/word-rotate';
import { ScrollProgress } from '@/components/magicui/scroll-progress';
import { AnimatedList, BlurFade, DotPattern, InteractiveHoverButton, RippleButton, Terminal } from '@/components/magicui/learning-effects';
import { OrbitingCircles } from '@/components/magicui/orbiting-circles';
import { MagicCard } from '@/components/magicui/magic-card';
import { ShineBorder } from '@/components/magicui/shine-border';
import { BentoGrid } from '@/components/magicui/bento-grid';
import { ProgressiveBlur } from '@/components/magicui/progressive-blur';
import { MotionToggle } from '@/components/marketing/motion-surface';
import styles from './component-studio.module.css';

export const LIVE_PREVIEW_IDS = ['marquee', 'word-rotate', 'scroll-progress', 'animated-list', 'blur-fade', 'ripple-button', 'interactive-hover-button', 'terminal', 'dot-pattern', 'grid-pattern', 'orbiting-circles', 'shine-border', 'magic-card', 'bento-grid', 'progressive-blur', 'shimmer-button'];
const topics = [{ title: 'Ask a question', icon: Lightbulb }, { title: 'Try an experiment', icon: FlaskConical }, { title: 'Explore a pattern', icon: Layers3 }, { title: 'Explain an idea', icon: BookOpen }];
const categories = [...new Set(MAGIC_UI_COMPONENTS.map(item => item.category))];

function Preview({ id, onInteract }: { id: string; onInteract: () => void }) {
  if (id === 'marquee') return <Marquee label="Rolling learning topics" duration={32}>{topics.map(({ title, icon: Icon }) => <span className={styles.topic} key={title}><Icon aria-hidden="true" size={24} /><strong>{title}</strong></span>)}</Marquee>;
  if (id === 'word-rotate') return <div className={styles.wordPreview}><span>Make room for</span><WordRotate words={['curiosity', 'experiments', 'possibilities']} /></div>;
  if (id === 'animated-list') return <AnimatedList label="A learning mission">{topics.map(({ title, icon: Icon }) => <span key={title}><Icon size={20} aria-hidden="true" />{title}</span>)}</AnimatedList>;
  if (id === 'blur-fade') return <div className={styles.miniGrid}>{topics.slice(0, 3).map(({ title, icon: Icon }) => <BlurFade key={title} className={styles.miniCard}><Icon size={25} aria-hidden="true" /><strong>{title}</strong><p>Content stays readable before the animation starts</p></BlurFade>)}</div>;
  if (id === 'ripple-button') return <div className={styles.center}><RippleButton onClick={onInteract}>Try the ripple<ArrowRight size={17} aria-hidden="true" /></RippleButton></div>;
  if (id === 'interactive-hover-button') return <div className={styles.center}><InteractiveHoverButton href="/demo/lab">Open Inventors Lab</InteractiveHoverButton></div>;
  if (id === 'terminal') return <Terminal title="A small Python example" code={'ideas = ["fold", "curve", "combine"]\nfor idea in ideas:\n    print(f"What if we {idea}?")\n\n# An example, not a remote code runner'} />;
  if (id === 'dot-pattern' || id === 'grid-pattern') return <div className={styles.patternPreview}><DotPattern variant={id === 'grid-pattern' ? 'grid' : 'dots'} /><div><ShapesLabel /><strong>Structure leaves room for ideas</strong><p>A quiet background that keeps text in focus</p></div></div>;
  if (id === 'orbiting-circles') return <div className={styles.orbitPreview}><span className={styles.orbitCenter}><Sparkles aria-hidden="true" size={30} /></span><OrbitingCircles radius={90} duration={32}><Atom size={20} /><Code2 size={20} /><FlaskConical size={20} /><BookOpen size={20} /></OrbitingCircles></div>;
  if (id === 'shine-border') return <div className={styles.shinePreview}><ShineBorder /><Lightbulb aria-hidden="true" size={28} /><strong>A little emphasis</strong><p>One restrained accent around the idea that matters</p></div>;
  if (id === 'magic-card') return <MagicCard href="/demo/lab" className={styles.magicPreview}><Lightbulb aria-hidden="true" size={28} /><h3>One question can change the design</h3><p>Move your pointer, or follow this card using your keyboard</p><span>Try Inventors Lab<ArrowUpRight size={17} aria-hidden="true" /></span></MagicCard>;
  if (id === 'bento-grid') return <BentoGrid className={styles.bentoPreview}>{topics.map(({ title, icon: Icon }) => <div key={title}><Icon size={24} aria-hidden="true" /><strong>{title}</strong></div>)}</BentoGrid>;
  if (id === 'progressive-blur') return <div className={styles.blurPreview}><div className={styles.blurItems}>{topics.map(({ title, icon: Icon }) => <span key={title}><Icon size={32} aria-hidden="true" />{title}</span>)}</div><ProgressiveBlur side="left" /><ProgressiveBlur side="right" /></div>;
  if (id === 'shimmer-button') return <div className={styles.center}><button className="m-button m-button-dark fx-shimmer" type="button" onClick={onInteract}>A subtle shimmer<ArrowRight size={17} aria-hidden="true" /></button></div>;
  return <div className={styles.readingPreview}><BookOpen size={32} aria-hidden="true" /><strong>Scroll to see your place in this page</strong><p>The thin lime line at the top of the page follows reading position. It does not represent learning progress or mastery.</p></div>;
}
function PreviewSurface({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { canAnimate } = useMotionPreference(ref);
  return <div ref={ref} className={styles.preview} data-preview-motion={canAnimate ? 'running' : 'static'}>{children}</div>;
}
function ShapesLabel() { return <Layers3 size={30} aria-hidden="true" />; }

export function ComponentStudio() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All categories');
  const [liveOnly, setLiveOnly] = useState(false);
  const [active, setActive] = useState('marquee');
  const [replay, setReplay] = useState(0);
  const [interactions, setInteractions] = useState(0);
  const selected = MAGIC_UI_COMPONENTS.find(item => item.id === active)!;
  const matching = MAGIC_UI_COMPONENTS.filter(item => (!liveOnly || LIVE_PREVIEW_IDS.includes(item.id)) && (category === 'All categories' || item.category === category) && `${item.name} ${item.summary} ${item.category}`.toLowerCase().includes(query.toLowerCase().trim()));
  return <div className={styles.root}>
    <ScrollProgress />
    <noscript><p>Interactive previews need JavaScript. The catalog and official documentation links remain available below.</p></noscript>
    <header className={styles.hero}><span className={styles.eyebrow}>Design that supports discovery</span><h1>EducationOS component studio</h1><p>Explore the complete Magic UI catalog, try the EducationOS adaptations, and choose motion with a purpose.</p><div className={styles.facts}><span>{MAGIC_UI_COMPONENTS.length} catalog entries</span><span>{LIVE_PREVIEW_IDS.length} working local previews</span><span><ShieldCheck size={15} aria-hidden="true" />Reduced motion supported</span></div></header>
    <section className={styles.workbench} id="component-preview" aria-labelledby="preview-title" tabIndex={-1} data-component-previews>
      <div className={styles.workbenchTop}><div><span className={styles.eyebrow}>Live preview</span><h2 id="preview-title">{selected.name}</h2><p>{selected.summary}</p></div><div className={styles.previewControls}><button type="button" onClick={() => setReplay(value => value + 1)}><RotateCcw size={16} aria-hidden="true" />Replay</button><MotionToggle locale="en" /></div></div>
      <PreviewSurface key={`${active}:${replay}`}><Preview id={active} onInteract={() => setInteractions(value => value + 1)} /></PreviewSurface>
      <div className={styles.previewFooter}><span data-preview-feedback>{interactions ? `Preview interactions: ${interactions}` : 'Adapted for EducationOS · MIT source'}</span><a href={selected.docsUrl} target="_blank" rel="noreferrer">Official documentation<ArrowUpRight size={15} aria-hidden="true" /></a></div>
    </section>
    <section className={styles.catalog} aria-labelledby="catalog-title"><div className={styles.catalogHeading}><div><span className={styles.eyebrow}>Complete catalog</span><h2 id="catalog-title">Find the right detail</h2></div><p>Local previews are marked clearly. The other entries link to Magic UI’s official demos for exploration.</p></div>
      <div className={styles.filters}><div className={styles.search}><Search size={18} aria-hidden="true" /><label className="sr-only" htmlFor="component-search">Search components</label><input id="component-search" type="search" placeholder="Search components" value={query} onChange={event => setQuery(event.target.value)} /></div><label className={styles.category}>Category<select aria-label="Filter by category" value={category} onChange={event => setCategory(event.target.value)}><option>All categories</option>{categories.map(item => <option key={item}>{item}</option>)}</select></label><div className={styles.segmented} role="group" aria-label="Preview availability"><button type="button" aria-pressed={!liveOnly} onClick={() => setLiveOnly(false)}>All</button><button type="button" aria-pressed={liveOnly} onClick={() => setLiveOnly(true)}>Live previews</button></div></div>
      <p className={styles.count} role="status">{matching.length} of {MAGIC_UI_COMPONENTS.length} components</p>
      <div className={styles.cards}>{matching.map(item => { const local = LIVE_PREVIEW_IDS.includes(item.id); return <article className={styles.card} key={item.id} data-component-card data-component-id={item.id}><div className={styles.cardMeta}><span>{item.category}</span><span className={local ? styles.liveBadge : styles.referenceBadge}>{local ? 'Local preview' : 'Official reference'}</span></div><h3>{item.name}</h3><p>{item.summary}</p><div className={styles.cardLinks}>{local && <a href="#component-preview" aria-label={`Preview ${item.name}`} onClick={() => { setActive(item.id); setInteractions(0); document.getElementById('component-preview')?.focus({ preventScroll: true }); }}>Try preview<ArrowRight size={15} aria-hidden="true" /></a>}<a href={item.docsUrl} target="_blank" rel="noreferrer" aria-label={`Official ${item.name} documentation`}>{local ? 'Docs' : 'View official demo'}<ArrowUpRight size={15} aria-hidden="true" /></a></div></article>; })}</div>
      {!matching.length && <div className={styles.empty}><Search size={28} aria-hidden="true" /><h3>No matching components</h3><p>Try another name or reset the filters.</p><button type="button" onClick={() => { setQuery(''); setCategory('All categories'); setLiveOnly(false); }}>Reset filters</button></div>}
    </section>
    <aside className={styles.note}><Check size={20} aria-hidden="true" /><p>One preview runs at a time. Movement pauses when it is out of view, respects your device preference, and can be stopped. This gallery uses educational examples, with no copied testimonials or learner claims.</p></aside>
  </div>;
}
