import Link from 'next/link';
import { SiteShell } from '@/components/site-shell';
export default function NotFound(){return <SiteShell><section className="container error-page"><p className="eyebrow justify-center">404 / A NEW DIRECTION</p><h1>Let’s find your way back</h1><p>This page does not exist. There’s plenty to explore in the lab.</p><Link href="/" className="button button-dark">Return to EducationOS</Link></section></SiteShell>}
