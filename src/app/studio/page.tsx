import type { Metadata } from 'next';
import { Studio } from '@/components/studio/studio';
import '@/components/studio/studio.css';

export const metadata: Metadata = {
  title: 'Educator studio',
  description: 'An adult-only curriculum authoring and review workspace',
  robots: { index: false, follow: false },
};

export default function StudioPage() { return <Studio />; }
