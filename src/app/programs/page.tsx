import { ProgramsDetail } from '@/components/marketing/detail-pages';
import { detailMetadata } from '@/lib/marketing-details';

export const metadata = detailMetadata('es', 'programs');
export default function Programs() { return <ProgramsDetail locale="es" />; }
