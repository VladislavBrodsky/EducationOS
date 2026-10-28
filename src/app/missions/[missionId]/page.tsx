import { notFound } from 'next/navigation';
import { getMission } from '@/lib/missions/catalog';
import { MissionPage, missionMetadata } from '@/components/missions/mission-pages';
export async function generateMetadata({params}:PageProps<'/missions/[missionId]'>){const {missionId}=await params;const mission=getMission(missionId);return mission?missionMetadata('es',mission):{};}
export default async function Page({params}:PageProps<'/missions/[missionId]'>){const {missionId}=await params;const mission=getMission(missionId);if(!mission)notFound();return <MissionPage locale="es" mission={mission}/>;}
