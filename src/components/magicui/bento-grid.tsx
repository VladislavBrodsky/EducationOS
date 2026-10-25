// Adapted from Magic UI (MIT). See LICENSE and NOTICE.md in this directory.
import type { ComponentPropsWithoutRef } from 'react';

export function BentoGrid({ className = '', ...props }: ComponentPropsWithoutRef<'div'>) {
  return <div className={`fx-bento ${className}`} {...props} />;
}
