import type { Locale } from './marketing-i18n';

/** Shared by server routing and browser navigation; root layouts persist between pages. */
export function pageLocale(pathname: string, portalHost = false): Locale {
  if (portalHost) return 'en';
  if (pathname === '/ru' || pathname.startsWith('/ru/')) return 'ru';
  if (['/', '/programs', '/approach', '/trust', '/blog', '/missions'].includes(pathname)
    || pathname.startsWith('/blog/') || pathname.startsWith('/missions/')) return 'es';
  return 'en';
}
