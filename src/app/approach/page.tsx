import { ApproachDetail } from '@/components/marketing/detail-pages';
import { detailMetadata } from '@/lib/marketing-details';

export const metadata = detailMetadata('es', 'approach');
export default function Approach() { return <ApproachDetail locale="es" />; }
