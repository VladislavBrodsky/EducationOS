'use client';

import Link from 'next/link';
import { Check, ChevronDown, Globe2 } from 'lucide-react';
import { localizedPath, locales, type Locale } from '@/lib/marketing-i18n';
import { useDismissDisclosure } from './use-dismiss-disclosure';

const languageNames = { es: 'Español', en: 'English', ru: 'Русский' } as const;
const labels = { es: 'Idioma', en: 'Language', ru: 'Язык' } as const;

export function LanguageSwitcher({ locale, section }: { locale: Locale; section: string }) {
  const disclosure = useDismissDisclosure();

  return <details className="m-language" ref={disclosure}>
    <summary aria-label={`${labels[locale]}: ${locale.toUpperCase()} — ${languageNames[locale]}`}>
      <Globe2 size={16} aria-hidden="true" /><span>{locale.toUpperCase()}</span><ChevronDown className="m-language-chevron" size={14} aria-hidden="true" />
    </summary>
    <nav className="m-language-options" aria-label="Language / Idioma / Язык">
      {locales.map(item => <Link key={item} href={localizedPath(item, section)} hrefLang={item} lang={item} aria-current={item === locale ? 'page' : undefined} onClick={() => {
        if (disclosure.current) disclosure.current.open = false;
      }}><span>{languageNames[item]}</span>{item === locale && <Check size={16} aria-hidden="true" />}</Link>)}
    </nav>
  </details>;
}
