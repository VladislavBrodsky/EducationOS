import { notFound } from 'next/navigation';
import { ApproachDetail } from '@/components/marketing/detail-pages';
import { detailMetadata } from '@/lib/marketing-details';
import { isLocale } from '@/lib/marketing-i18n';

export function generateStaticParams() { return [{ locale: 'en' }, { locale: 'ru' }]; }
export async function generateMetadata({ params }: PageProps<'/[locale]/approach'>) {
  const { locale } = await params;
  return isLocale(locale) && locale !== 'es' ? detailMetadata(locale, 'approach') : {};
}
export default async function Page({ params }: PageProps<'/[locale]/approach'>) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === 'es') notFound();
  return <ApproachDetail locale={locale} />;
}
