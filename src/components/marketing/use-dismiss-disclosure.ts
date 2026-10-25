'use client';

import { useEffect, useRef } from 'react';

export function useDismissDisclosure() {
  const disclosure = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const dismiss = (event: Event) => {
      const element = disclosure.current;
      if (element?.open && event.target instanceof Node && !element.contains(event.target)) element.open = false;
    };
    const escape = (event: KeyboardEvent) => {
      const element = disclosure.current;
      if (event.key === 'Escape' && element?.open && event.target instanceof Node && element.contains(event.target)) {
        event.preventDefault();
        element.open = false;
        element.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('focusin', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('focusin', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, []);

  return disclosure;
}
