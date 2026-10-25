// Adapted from Magic UI (MIT). See LICENSE and NOTICE.md in this directory.
import type { CSSProperties } from 'react';

export function ShineBorder({ duration = 16, color = '#d5fc51' }: { duration?: number; color?: string }) {
  return <span className="fx-shine-border" aria-hidden="true" style={{ '--shine-duration': `${duration}s`, '--shine-color': color } as CSSProperties} />;
}
