import { Atom, FlaskConical, Lightbulb, MessagesSquare } from 'lucide-react';
import { Marquee } from '@/components/magicui/marquee';
import { WordRotate } from '@/components/magicui/word-rotate';
import type { Locale } from '@/lib/marketing-i18n';
import styles from './learning-marquee.module.css';

const icons = [Lightbulb, FlaskConical, Atom, MessagesSquare];
const labels = {
  en: { heading: 'Room for', words: ['questions', 'experiments', 'new ideas'], list: 'Ways to explore', pause: 'Pause rolling topics', resume: 'Resume rolling topics', browse: 'Use the arrow keys to explore the list' },
  es: { heading: 'Espacio para', words: ['preguntas', 'experimentos', 'nuevas ideas'], list: 'Formas de explorar', pause: 'Pausar temas en movimiento', resume: 'Reanudar temas en movimiento', browse: 'Usa las flechas para explorar la lista' },
  ru: { heading: 'Место для', words: ['вопросов', 'опытов', 'новых идей'], list: 'Способы исследовать', pause: 'Приостановить ленту тем', resume: 'Продолжить ленту тем', browse: 'Используйте стрелки для просмотра списка' },
};

export function LearningMarquee({ locale, items }: { locale: Locale; items: readonly string[] }) {
  const copy = labels[locale];
  return <section className={styles.ribbon} aria-label={copy.list}>
    <div className={`container ${styles.inner}`}>
      <div className={styles.heading}><span>{copy.heading}</span><WordRotate words={copy.words} /></div>
      <Marquee className={styles.marquee} label={copy.list} duration={36} pauseLabel={copy.pause} resumeLabel={copy.resume} browseLabel={copy.browse}>
        {items.map((item, index) => { const Icon = icons[index % icons.length]; return <span className={styles.topic} key={item}><Icon size={22} strokeWidth={1.6} aria-hidden="true" /><span>{item}</span><span className={styles.number} aria-hidden="true">0{index + 1}</span></span>; })}
      </Marquee>
    </div>
  </section>;
}
