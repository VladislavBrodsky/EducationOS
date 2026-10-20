import type { Metadata, Viewport } from 'next';
import { connection } from 'next/server';
import { SITE_URL } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'EducationOS — A world for curious minds', template: '%s | EducationOS' },
  description: 'Explore hands-on invention, creative problem solving, and the joy of asking better questions. Discover the EducationOS Inventors Lab demo for ages 5–17',
  alternates: { canonical: '/' },
  openGraph: { type: 'website', siteName: 'EducationOS', locale: 'en_US', title: 'EducationOS — A world for curious minds', description: 'Small experiments. Big possibilities', url: SITE_URL },
  robots: process.env.DEPLOYMENT_ENV === 'production' ? { index: true, follow: true } : { index: false, follow: false },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#d5fc51' };
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await connection();
  return <html lang="en"><body><a href="#main-content" className="skip-link">Skip to content</a>{children}</body></html>;
}
