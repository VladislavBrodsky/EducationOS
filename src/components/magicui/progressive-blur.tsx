import type { CSSProperties } from 'react';
import styles from './progressive-blur.module.css';

type Side = 'top' | 'bottom' | 'left' | 'right';

/** Magic UI's layered blur masks, adapted for compact horizontal or vertical edges. */
export function ProgressiveBlur({ side, className = '' }: { side: Side; className?: string }) {
  const direction = { top: 'to top', bottom: 'to bottom', left: 'to left', right: 'to right' }[side];
  return <span aria-hidden="true" className={`${styles.root} ${styles[side]} ${className}`}>
    {[0.5, 1, 2, 4, 8].map((blur, index) => {
      const start = index * 20;
      const end = (index + 1) * 20;
      const mask = `linear-gradient(${direction}, transparent ${start}%, #000 ${end}%, #000 100%)`;
      const style: CSSProperties = { backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)`, maskImage: mask, WebkitMaskImage: mask };
      return <span key={blur} className={styles.layer} style={style} />;
    })}
  </span>;
}
