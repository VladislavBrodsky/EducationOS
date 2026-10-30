import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { ComponentStudio } from '@/components/component-studio/component-studio';

export const metadata: Metadata = { title: 'Component studio', alternates: { canonical: '/components' }, description: 'Explore the Magic UI component catalog and accessible EducationOS adaptations', robots: { index: false, follow: false } };
export default function ComponentsPage() {
  return <MarketingShell locale="en" showLanguageSwitcher={false}><ComponentStudio /></MarketingShell>;
}
