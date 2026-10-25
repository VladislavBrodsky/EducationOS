'use client';

import { useId, useState } from 'react';
import { Share2 } from 'lucide-react';
import type { Locale } from '@/lib/marketing-i18n';
import { SITE_URL } from '@/lib/site';

const labels = {
  es: { button: 'Compartir historia', shared: 'Compartido', copied: 'Enlace copiado', manual: 'Copia el enlace para compartirlo', link: 'Enlace para compartir' },
  en: { button: 'Share story', shared: 'Shared', copied: 'Link copied', manual: 'Copy the link to share it', link: 'Link to share' },
  ru: { button: 'Поделиться историей', shared: 'Отправлено', copied: 'Ссылка скопирована', manual: 'Скопируйте ссылку, чтобы поделиться', link: 'Ссылка для отправки' },
} as const;

export function ShareLink({ title, locale, url, buttonLabel }: { title: string; locale: Locale; url?: string; buttonLabel?: string }) {
  const [message, setMessage] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const inputId = useId();
  const copy = labels[locale];

  async function share() {
    if (busy) return;
    const link = url ?? `${SITE_URL}${window.location.pathname}`;
    setBusy(true);
    setMessage('');
    setManualUrl('');
    try {
      if (navigator.share) {
        try {
          await navigator.share({ title, url: link });
          setMessage(copy.shared);
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') return;
        }
      }
      try {
        await navigator.clipboard.writeText(link);
        setMessage(copy.copied);
      } catch {
        setManualUrl(link);
        setMessage(copy.manual);
        requestAnimationFrame(() => document.getElementById(inputId)?.focus());
      }
    } finally {
      setBusy(false);
    }
  }

  return <div className="m-share">
    <button type="button" className="m-button m-button-ghost" disabled={busy} aria-busy={busy} onClick={share}><Share2 size={17} aria-hidden="true" />{buttonLabel ?? copy.button}</button>
    <span role="status" aria-live="polite">{message}</span>
    {manualUrl && <div className="m-share-fallback"><label htmlFor={inputId}>{copy.link}</label><input id={inputId} type="url" readOnly value={manualUrl} onFocus={event => event.currentTarget.select()} /></div>}
  </div>;
}
