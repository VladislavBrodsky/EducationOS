import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LandingPage } from '@/components/marketing/landing';
import { isLocale, marketingCopy } from '@/lib/marketing-i18n';
import { marketingShareImage } from '@/lib/marketing-social';
import { SITE_URL } from '@/lib/site';

export function generateStaticParams() { return [{ locale: 'en' }, { locale: 'ru' }]; }

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale) || locale === 'es') return {};
  const copy = marketingCopy[locale];
  return { title: { absolute: `EducationOS — ${copy.heroLead} ${copy.heroAccent}` }, description: copy.heroDescription, alternates: { canonical: `/${locale}`, languages: { es: '/', en: '/en', ru: '/ru', 'x-default': '/' } }, openGraph: { locale: locale === 'en' ? 'en_US' : 'ru_RU', url: `${SITE_URL}/${locale}`, title: `EducationOS — ${copy.heroLead} ${copy.heroAccent}`, description: copy.heroDescription, images: [marketingShareImage(locale)] } };
}

export default async function LocalizedHome({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === 'es') notFound();
  return <LandingPage locale={locale} />;
}
