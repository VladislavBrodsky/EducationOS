'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import type { Locale } from '@/lib/marketing-i18n';

const labels = {
  es: { button: 'Compartir historia', shared: 'Compartido', copied: 'Enlace copiado', unavailable: 'No se puede compartir en este dispositivo' },
  en: { button: 'Share story', shared: 'Shared', copied: 'Link copied', unavailable: 'Sharing is unavailable on this device' },
  ru: { button: 'Поделиться историей', shared: 'Отправлено', copied: 'Ссылка скопирована', unavailable: 'На этом устройстве нельзя поделиться' },
} as const;

export function JournalShare({ title, locale }: { title: string; locale: Locale }) {
  const [message, setMessage] = useState('');
  const copy = labels[locale];

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        setMessage(copy.shared);
      } else {
        await navigator.clipboard.writeText(url);
        setMessage(copy.copied);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setMessage(copy.unavailable);
    }
  }

  return <div className="m-share"><button type="button" className="m-button m-button-ghost" onClick={share}><Share2 size={17} aria-hidden="true" />{copy.button}</button><span role="status" aria-live="polite">{message}</span></div>;
}
