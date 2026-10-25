import Link from 'next/link';
import { ArrowUpRight, Check, Code2, FlaskConical, NotebookPen } from 'lucide-react';
import type { Locale } from '@/lib/marketing-i18n';
import { marketingCopy } from '@/lib/marketing-i18n';
import { showcaseCopy } from '@/lib/marketing-showcase';
import { BentoGrid } from '@/components/magicui/bento-grid';
import { MagicCard } from '@/components/magicui/magic-card';
import { BridgePreview } from './bridge-preview';

export function LearningBento({ locale }: { locale: Locale }) {
  const copy = showcaseCopy[locale];
  const marketing = marketingCopy[locale];
  return <section className="m-section container fx-learning" aria-labelledby="learning-in-motion">
    <div className="m-section-heading"><div><span className="m-kicker">{copy.kicker}</span><h2 id="learning-in-motion">{copy.title}</h2></div><p>{copy.description}</p></div>
    <BentoGrid>
      <article className="fx-bento-feature">
        <div className="fx-bento-feature-head"><span className="fx-icon-tile"><FlaskConical size={22} aria-hidden="true" /></span><span className="m-kicker">{copy.model}</span></div>
        <h3>{marketing.labTitle}</h3><p className="fx-bento-description">{copy.materials}</p>
        <BridgePreview locale={locale} />
        <div className="fx-bento-feature-footer"><Link className="m-button m-button-dark fx-shimmer" href="/demo/lab">{marketing.labAction}<ArrowUpRight size={18} aria-hidden="true" /></Link><span>{copy.language}</span></div>
      </article>
      <MagicCard className="fx-bento-card fx-evidence-card" href="/demo/portfolio">
        <span className="fx-icon-tile"><NotebookPen size={22} aria-hidden="true" /></span>
        <span className="m-kicker">{copy.evidenceTag}</span><h3>{copy.evidenceTitle}</h3><p>{copy.evidenceDescription}</p>
        <div className="fx-evidence-list" aria-hidden="true">{copy.evidenceItems.map((item, i) => <span key={item}><span className="fx-evidence-dot">{i === 0 ? <Check size={12} /> : `0${i + 1}`}</span>{item}</span>)}</div>
        <span className="fx-bento-link">{copy.evidenceAction}<ArrowUpRight size={17} aria-hidden="true" /></span><span className="fx-bento-language">{copy.language}</span>
      </MagicCard>
      <MagicCard className="fx-bento-card fx-code-card" href="/portal/labs/loop-loom">
        <div className="fx-code-example" aria-hidden="true"><span><Code2 size={16} />loop-loom</span><code><b>repeat</b> (3) {'{'}<br />&nbsp;&nbsp;move()<br />{'}'}</code><div><i /><i /><i /><ArrowUpRight size={18} /></div></div>
        <span className="m-kicker">{copy.codeTag}</span><h3>{copy.codeTitle}</h3><p>{copy.codeDescription}</p><span className="fx-bento-link">{copy.codeAction}<ArrowUpRight size={17} aria-hidden="true" /></span><span className="fx-bento-language">{copy.language}</span>
      </MagicCard>
    </BentoGrid>
  </section>;
}
