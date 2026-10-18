import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'EducationOS — A world of possibilities', description: 'Synthetic demonstration of the EducationOS learner dashboard and TRIZ Inventors Lab.', robots: { index: false, follow: false } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
