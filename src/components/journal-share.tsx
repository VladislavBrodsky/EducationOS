'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';

export function JournalShare({ title }: { title: string }) {
  const [message, setMessage] = useState('');

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        setMessage('Shared');
      } else {
        await navigator.clipboard.writeText(url);
        setMessage('Link copied');
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setMessage('Sharing is unavailable on this device');
    }
  }

  return <div className="journal-share"><button type="button" className="button button-outline" onClick={share}><Share2 size={17} aria-hidden="true" /> Share this idea</button><span role="status" aria-live="polite">{message}</span></div>;
}
