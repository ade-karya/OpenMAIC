import i18n from './config';
import { type Locale, defaultLocale } from './types';
import { supportedLocales } from './locales';

export { type Locale, defaultLocale, supportedLocales };

// Re-export translations from the dedicated module
export { translations } from './translations';

export type TranslationKey = string;

export function translate(locale: string, key: string): string {
  return i18n.t(key, { lng: locale });
}

export function getClientTranslation(key: string): string {
  let locale: Locale = defaultLocale;

  if (typeof window !== 'undefined') {
    try {
      const storedLocale = localStorage.getItem('locale');
      if (storedLocale === 'en-US' || storedLocale === 'id-ID' || storedLocale === 'ar-SA') {
        locale = storedLocale;
      }
    } catch {
      // localStorage unavailable, keep default locale
    }
  }

  return translate(locale, key);
}
