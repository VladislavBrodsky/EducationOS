import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { FileText } from 'lucide-react';
import { SiteShell } from '@/components/site-shell';
import './legal-page.css';

export function LegalPage({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  const sections: { id: string; label: string }[] = [];
  const content = Children.toArray(children).map(child => {
    if (!isValidElement<{ children?: ReactNode; id?: string }>(child) || child.type !== 'h2' || typeof child.props.children !== 'string') return child;
    const label = child.props.children;
    const id = child.props.id ?? label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    sections.push({ id, label });
    return cloneElement(child as ReactElement<{ id?: string }>, { id });
  });

  return <SiteShell>
    <div className="container legal-page">
      <header className="legal-page-header">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="legal-page-context"><FileText size={16} aria-hidden="true" />Public demo<span aria-hidden="true">·</span>Policy information in English</p>
      </header>
      <div className="legal-page-grid">
        <nav className="legal-page-index" aria-label="On this page">
          <p>In this guide</p>
          <ol>{sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.label}</a></li>)}</ol>
        </nav>
        <article className="legal-content">{content}</article>
      </div>
    </div>
  </SiteShell>;
}
