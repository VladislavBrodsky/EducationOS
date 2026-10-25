// Adapted from Magic UI (MIT). See LICENSE and NOTICE.md in this directory.
import { Children, type CSSProperties, type ReactNode } from 'react';

export function OrbitingCircles({ children, radius = 160, duration = 36, reverse = false }: {
  children: ReactNode; radius?: number | string; duration?: number; reverse?: boolean;
}) {
  const count = Children.count(children);
  return <div className="fx-orbits" aria-hidden="true" style={{ '--orbit-radius': typeof radius === 'number' ? `${radius}px` : radius, '--orbit-duration': `${duration}s` } as CSSProperties}>
    <span className="fx-orbit-path" />
    {Children.map(children, (child, index) => <span className="fx-orbit-node" data-reverse={reverse || undefined} style={{ '--orbit-angle': `${360 / count * index}deg` } as CSSProperties}><span>{child}</span></span>)}
  </div>;
}
