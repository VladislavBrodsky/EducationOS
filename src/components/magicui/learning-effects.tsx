'use client';

// EducationOS adaptations of Magic UI's MIT components. See LICENSE / NOTICE.md.
import { Children, useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { ArrowUpRight, TerminalSquare } from 'lucide-react';
import Link from 'next/link';
import { useMotionPreference } from './use-motion-preference';
import styles from './learning-effects.module.css';

/** Entry enhancement: server-rendered content remains readable without JavaScript. */
export function BlurFade({ children, className = '' }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const played = useRef(false);
  const { canAnimate } = useMotionPreference(root);
  useEffect(() => {
    if (!canAnimate || !root.current || played.current) return;
    played.current = true;
    const animation = root.current.animate([
      { opacity: .65, transform: 'translateY(8px)', filter: 'blur(2px)' },
      { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' },
    ], { duration: 450, easing: 'cubic-bezier(.22,1,.36,1)' });
    return () => animation.cancel();
  }, [canAnimate]);
  return <div ref={root} className={className} data-blur-fade>{children}</div>;
}

export function AnimatedList({ children, label, className = '' }: { children: ReactNode; label: string; className?: string }) {
  const root = useRef<HTMLOListElement>(null);
  const played = useRef(false);
  const { canAnimate } = useMotionPreference(root);
  useEffect(() => {
    if (!canAnimate || !root.current || played.current) return;
    played.current = true;
    const animations = [...root.current.children].map((element, index) => element.animate([
      { opacity: .7, transform: 'translateX(-8px)' }, { opacity: 1, transform: 'translateX(0)' },
    ], { duration: 350, delay: Math.min(index, 6) * 80, easing: 'ease-out' }));
    return () => animations.forEach(animation => animation.cancel());
  }, [canAnimate]);
  return <ol ref={root} aria-label={label} className={`${styles.list} ${className}`} data-animated-list>{Children.map(children, child => <li>{child}</li>)}</ol>;
}

export function RippleButton({ children, className = '', onClick, type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const root = useRef<HTMLButtonElement>(null);
  const { canAnimate } = useMotionPreference(root);
  return <button {...props} ref={root} type={type} className={`${styles.rippleButton} ${className}`} onClick={event => {
    if (canAnimate) {
      const element = event.currentTarget;
      const bounds = element.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.hypot(bounds.width, bounds.height) * 2;
      ripple.className = styles.ripple;
      ripple.setAttribute('aria-hidden', 'true');
      Object.assign(ripple.style, { width: `${size}px`, height: `${size}px`, left: `${(event.detail ? event.clientX - bounds.left : bounds.width / 2) - size / 2}px`, top: `${(event.detail ? event.clientY - bounds.top : bounds.height / 2) - size / 2}px` });
      element.append(ripple);
      const animation = ripple.animate([{ transform: 'scale(0)', opacity: .4 }, { transform: 'scale(1)', opacity: 0 }], { duration: 500 });
      animation.finished.then(() => ripple.remove(), () => ripple.remove());
    }
    onClick?.(event);
  }}><span className={styles.buttonContent}>{children}</span></button>;
}

export function InteractiveHoverButton({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return <Link href={href} className={`${styles.hoverButton} ${className}`}><span>{children}</span><ArrowUpRight size={18} aria-hidden="true" /></Link>;
}

export function Terminal({ code, title = 'Example output' }: { code: string; title?: string }) {
  return <figure className={styles.terminal}>
    <figcaption><TerminalSquare size={16} aria-hidden="true" />{title}<span>Python</span></figcaption>
    {/* Keyboard access lets readers scroll long code samples without a pointer. */}
    {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
    <pre tabIndex={0} aria-label={title}><code>{code}</code></pre>
  </figure>;
}

export function DotPattern({ variant = 'dots' }: { variant?: 'dots' | 'grid' }) {
  return <span className={`${styles.pattern} ${variant === 'grid' ? styles.grid : ''}`} aria-hidden="true" />;
}
