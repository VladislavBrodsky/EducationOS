import type { Metadata } from 'next';
import { LandingPage } from '@/components/marketing/landing';
import { marketingCopy } from '@/lib/marketing-i18n';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: `EducationOS — ${marketingCopy.es.heroLead} ${marketingCopy.es.heroAccent}`,
  description: marketingCopy.es.heroDescription,
  alternates: { canonical: '/', languages: { es: '/', en: '/en', ru: '/ru', 'x-default': '/' } },
  openGraph: { locale: 'es_MX', url: SITE_URL, title: `EducationOS — ${marketingCopy.es.heroLead} ${marketingCopy.es.heroAccent}`, description: marketingCopy.es.heroDescription },
};

export default function Home() { return <LandingPage locale="es" />; }
