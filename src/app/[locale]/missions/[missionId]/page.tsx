import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/marketing-i18n';
import { getMission } from '@/lib/missions/catalog';
import { MissionPage, missionMetadata } from '@/components/missions/mission-pages';
export async function generateMetadata({params}:PageProps<'/[locale]/missions/[missionId]'>){const {locale,missionId}=await params;const mission=getMission(missionId);return isLocale(locale)&&locale!=='es'&&mission?missionMetadata(locale,mission):{};}
export default async function Page({params}:PageProps<'/[locale]/missions/[missionId]'>){const {locale,missionId}=await params;const mission=getMission(missionId);if(!isLocale(locale)||locale==='es'||!mission)notFound();return <MissionPage locale={locale} mission={mission}/>;}
