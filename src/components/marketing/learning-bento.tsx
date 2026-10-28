import Link from 'next/link';
import { ArrowUpRight, Code2, FlaskConical, NotebookPen } from 'lucide-react';
import type { Locale } from '@/lib/marketing-i18n';
import { marketingCopy } from '@/lib/marketing-i18n';
import { showcaseCopy } from '@/lib/marketing-showcase';
import { LOOP_LOOM_INSTRUCTIONS, loopLoomSource } from '@/lib/labs/loop-loom';
import { BentoGrid } from '@/components/magicui/bento-grid';
import { MagicCard } from '@/components/magicui/magic-card';
import { BridgePreview } from './bridge-preview';

export function LearningBento({ locale }: { locale: Locale }) {
  const copy = showcaseCopy[locale];
  const marketing = marketingCopy[locale];
  return <section className="m-section container fx-learning" aria-labelledby="learning-in-motion">
    <div className="m-section-heading"><div><span className="m-kicker">{copy.kicker}</span><h2 id="learning-in-motion">{copy.title}</h2></div><p>{copy.description}</p></div>
    <BentoGrid>
      <article id="paper-bridge-challenge" className="fx-bento-feature" tabIndex={-1} aria-labelledby="paper-bridge-title">
        <div className="fx-bento-feature-head"><span className="fx-icon-tile"><FlaskConical size={22} aria-hidden="true" /></span><span className="m-kicker">{copy.model}</span></div>
        <h3 id="paper-bridge-title">{marketing.labTitle}</h3><p className="fx-bento-description">{copy.materials}</p>
        <BridgePreview locale={locale} />
        <div className="fx-bento-feature-footer"><Link className="m-button m-button-dark fx-shimmer" href="/demo/lab">{marketing.labAction}<ArrowUpRight size={18} aria-hidden="true" /></Link><span>{copy.language}</span></div>
      </article>
      <MagicCard className="fx-bento-card fx-evidence-card" href="/demo/portfolio" aria-labelledby="evidence-preview-title" aria-describedby="evidence-preview-description evidence-preview-language">
        <div className="fx-bento-card-heading"><span className="fx-icon-tile"><NotebookPen size={21} aria-hidden="true" /></span><span className="m-kicker">{copy.evidenceTag}</span></div>
        <h3 id="evidence-preview-title">{copy.evidenceTitle}</h3><p id="evidence-preview-description">{copy.evidenceDescription}</p>
        <div className="fx-notebook-preview"><span className="fx-preview-label">{copy.previewLabel}</span><dl>{copy.evidenceItems.map(([label, example], index) => <div key={label}><dt><span className="fx-evidence-number" aria-hidden="true">0{index + 1}</span>{label}</dt><dd>{example}</dd></div>)}</dl></div>
        <div className="fx-bento-card-footer"><span className="fx-bento-link">{copy.evidenceAction}<ArrowUpRight size={17} aria-hidden="true" /></span><span className="fx-bento-language" id="evidence-preview-language">{copy.language}</span></div>
      </MagicCard>
      <MagicCard className="fx-bento-card fx-code-card" href="/portal/labs/loop-loom" aria-labelledby="code-preview-title" aria-describedby="code-preview-description code-preview-language">
        <div className="fx-bento-card-heading"><span className="fx-icon-tile"><Code2 size={21} aria-hidden="true" /></span><span className="m-kicker">{copy.codeTag}</span></div>
        <h3 id="code-preview-title">{copy.codeTitle}</h3><p id="code-preview-description">{copy.codeDescription}</p>
        <div className="fx-code-example"><span className="fx-preview-label">{copy.codePreview}</span><code>{loopLoomSource(3)}</code><div className="fx-code-output" aria-hidden="true">{[1, 2, 3].map(repeat => <span key={repeat}>{LOOP_LOOM_INSTRUCTIONS.map(instruction => <i key={instruction}>{instruction}</i>)}</span>)}</div><span className="fx-code-result">{copy.codeResult}</span></div>
        <div className="fx-bento-card-footer"><span className="fx-bento-link">{copy.codeAction}<ArrowUpRight size={17} aria-hidden="true" /></span><span className="fx-bento-language" id="code-preview-language">{copy.language}</span></div>
      </MagicCard>
    </BentoGrid>
  </section>;
}
