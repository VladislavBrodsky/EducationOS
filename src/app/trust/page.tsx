import { TrustDetail } from '@/components/marketing/detail-pages';
import { detailMetadata } from '@/lib/marketing-details';

export const metadata = detailMetadata('es', 'trust');
export default function Trust() { return <TrustDetail locale="es" />; }
