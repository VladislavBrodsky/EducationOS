import type { Metadata, Viewport } from 'next';
import { connection } from 'next/server';
import { headers } from 'next/headers';
import { SITE_URL } from '@/lib/site';
import { isLocale, marketingCopy } from '@/lib/marketing-i18n';
import { isValidMeasurementId } from '@/lib/analytics';
import { PORTAL_HOST_HEADER } from '@/lib/portal-routing';
import { Analytics } from '@/components/analytics';
import '@fontsource-variable/manrope';
import './globals.css';
import './marketing.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'EducationOS — Curiosity changes everything', template: '%s | EducationOS' },
  description: 'Explore hands-on invention, creative problem solving, and the joy of asking better questions in Spanish, English, and Russian',
  icons: { icon: [{ url: '/icon.svg', type: 'image/svg+xml' }] },
  alternates: { canonical: '/' },
  openGraph: { type: 'website', siteName: 'EducationOS', locale: 'es_MX', title: 'EducationOS — Curiosity changes everything', description: 'Small experiments. Big possibilities', url: SITE_URL, images: [{ url: '/images/curiosity-hero.webp', width: 1400, height: 933, alt: 'A curious learner imagines a world of discovery' }] },
  twitter: { card: 'summary_large_image', images: ['/images/curiosity-hero.webp'] },
  robots: process.env.DEPLOYMENT_ENV === 'production' ? { index: true, follow: true } : { index: false, follow: false },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#d5fc51' };
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await connection();
  const requestHeaders = await headers();
  const requestedLocale = requestHeaders.get('x-educationos-locale') ?? 'en';
  const locale = isLocale(requestedLocale) ? requestedLocale : 'en';
  // Public marketing site in production only; never the learner portal host.
  const measurementId = process.env.GA_MEASUREMENT_ID;
  const analytics = process.env.DEPLOYMENT_ENV === 'production' && requestHeaders.get(PORTAL_HOST_HEADER) !== 'true' && isValidMeasurementId(measurementId);
  return <html lang={locale} data-scroll-behavior="smooth"><body><a href="#main-content" className="skip-link">{marketingCopy[locale].skip}</a>{children}{analytics && <Analytics measurementId={measurementId} locale={locale} />}</body></html>;
}
