import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/marketing-i18n';
import { MissionIndex, missionMetadata } from '@/components/missions/mission-pages';
export async function generateMetadata({params}:PageProps<'/[locale]/missions'>){const {locale}=await params;return isLocale(locale)&&locale!=='es'?missionMetadata(locale):{};}
export default async function Page({params}:PageProps<'/[locale]/missions'>){const {locale}=await params;if(!isLocale(locale)||locale==='es')notFound();return <MissionIndex locale={locale}/>;}
