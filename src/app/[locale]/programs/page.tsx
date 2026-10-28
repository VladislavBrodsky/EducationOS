import { notFound } from 'next/navigation';
import { ProgramsDetail } from '@/components/marketing/detail-pages';
import { detailMetadata } from '@/lib/marketing-details';
import { isLocale } from '@/lib/marketing-i18n';

export function generateStaticParams() { return [{ locale: 'en' }, { locale: 'ru' }]; }
export async function generateMetadata({ params }: PageProps<'/[locale]/programs'>) {
  const { locale } = await params;
  return isLocale(locale) && locale !== 'es' ? detailMetadata(locale, 'programs') : {};
}
export default async function Page({ params }: PageProps<'/[locale]/programs'>) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === 'es') notFound();
  return <ProgramsDetail locale={locale} />;
}
