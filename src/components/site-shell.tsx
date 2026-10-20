import Link from 'next/link';
import { ArrowUpRight, Asterisk, ArrowRight } from 'lucide-react';

export function Brand() {
  return <Link className="brand" href="/" aria-label="EducationOS home"><span className="brand-mark"><Asterisk size={25} strokeWidth={2.3} aria-hidden="true" /></span>Education<span className="brand-os">OS</span></Link>;
}
export function SiteHeader() {
  return <header className="site-header"><div className="container header-inner"><Brand /><nav aria-label="Main navigation"><Link href="/programs">Programs</Link><Link href="/approach">Our approach</Link><Link href="/blog">Journal</Link><Link href="/trust">For families</Link></nav><Link href="/demo" className="button button-dark header-cta">Explore the demo <ArrowUpRight size={16} aria-hidden="true" /></Link></div></header>;
}
export function SiteFooter() {
  return <footer className="site-footer"><div className="container"><div className="footer-top"><div><Brand /><p>A little curiosity.<br />A world of possibility.</p></div><nav aria-label="Footer navigation"><Link href="/programs">Programs</Link><Link href="/approach">Learning approach</Link><Link href="/blog">Curiosity Journal</Link><Link href="/trust">Trust center</Link><Link href="/safety">Child safety</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/accessibility">Accessibility</Link></nav></div><div className="footer-bottom"><span>Copyright {new Date().getUTCFullYear()} EducationOS</span><span>Public demo · Real learner enrollment is not open.</span><span>Made for curious minds.</span></div></div></footer>;
}
export function SiteShell({ children }: { children: React.ReactNode }) { return <><SiteHeader /><main id="main-content">{children}</main><SiteFooter /></>; }
export function DemoCTA({ small = false }: { small?: boolean }) {
  return <section className={`demo-cta ${small ? 'compact' : ''}`}><div className="container"><p className="eyebrow">YOUR FIRST EXPERIMENT STARTS HERE</p><h2>What if we tried<br />something different?</h2><Link className="button button-dark" href="/demo">Step inside Inventors Lab <ArrowRight size={18} aria-hidden="true" /></Link><p className="cta-note">A free demo. No account. No personal details.</p></div></section>;
}
