import Link from 'next/link';
import { ArrowUpRight, Asterisk } from 'lucide-react';
import { localizedPath, locales, marketingCopy, type Locale } from '@/lib/marketing-i18n';

export function MarketingShell({ locale, children, section = '' }: { locale: Locale; children: React.ReactNode; section?: string }) {
  const copy = marketingCopy[locale];
  const home = localizedPath(locale);
  return <>
    <header className="m-header">
      <div className="m-header-inner container">
        <Link className="m-brand" href={home} aria-label={copy.brandHome}><span className="m-brand-symbol"><Asterisk size={25} strokeWidth={2.2} aria-hidden="true" /></span><span>Education<span className="m-brand-light">OS</span></span></Link>
        <nav className="m-nav" aria-label={copy.navigation}>
          <Link href={localizedPath(locale, 'approach')} aria-current={section === 'approach' ? 'page' : undefined}>{copy.nav.method}</Link>
          <Link href={localizedPath(locale, 'programs')} aria-current={section === 'programs' ? 'page' : undefined}>{copy.nav.programs}</Link>
          <Link href={localizedPath(locale, 'blog')} aria-current={section.startsWith('blog') ? 'page' : undefined}>{copy.nav.journal}</Link>
          <Link href={localizedPath(locale, 'trust')} aria-current={section === 'trust' ? 'page' : undefined}>{copy.nav.care}</Link>
        </nav>
        <div className="m-header-actions">
          <nav className="m-language" aria-label="Language / Idioma / Язык">
            {locales.map(item => <Link key={item} href={localizedPath(item, section)} hrefLang={item} lang={item} aria-current={item === locale ? 'page' : undefined}>{item.toUpperCase()}</Link>)}
          </nav>
          <Link className="m-header-cta" href="/demo">{copy.demo}<ArrowUpRight size={16} aria-hidden="true" /></Link>
        </div>
      </div>
    </header>
    <main id="main-content" className="m-main">{children}</main>
    <footer className="m-footer"><div className="container"><div className="m-footer-top"><div><Link className="m-brand" href={home} aria-label={copy.brandHome}><span className="m-brand-symbol"><Asterisk size={25} strokeWidth={2.2} aria-hidden="true" /></span><span>Education<span className="m-brand-light">OS</span></span></Link><p>{copy.footerLine}</p></div><div className="m-footer-links"><Link href={localizedPath(locale, 'approach')}>{copy.nav.method}</Link><Link href={localizedPath(locale, 'programs')}>{copy.nav.programs}</Link><Link href={localizedPath(locale, 'blog')}>{copy.nav.journal}</Link><Link href={localizedPath(locale, 'trust')}>{copy.footerLinks.trust}</Link><Link href="/safety">{copy.footerLinks.safety}</Link><Link href="/privacy">{copy.footerLinks.privacy}</Link><Link href="/terms">{copy.footerLinks.terms}</Link><Link href="/accessibility">{copy.footerLinks.accessibility}</Link></div></div><div className="m-footer-bottom"><span>Copyright {new Date().getUTCFullYear()} EducationOS</span><span>{copy.footerStatus}</span><span>{copy.footerLegal}</span></div></div></footer>
  </>;
}
