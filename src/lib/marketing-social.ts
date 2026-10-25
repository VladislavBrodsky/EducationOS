import type { Locale } from './marketing-i18n';

export const MARKETING_SHARE_IMAGE = '/images/curiosity-hero.webp';

const shareImageAlt: Record<Locale, string> = {
  es: 'Una estudiante imagina un mundo de descubrimientos',
  en: 'A curious learner imagines a world of discovery',
  ru: 'Ученица представляет мир открытий',
};

export function marketingShareImage(locale: Locale) {
  return { url: MARKETING_SHARE_IMAGE, width: 1400, height: 933, alt: shareImageAlt[locale] };
}
