import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { supportedLocales } from './locales';
import { defaultLocale } from './types';
import { translations } from './translations';

// Build i18next resource bundles from the TypeScript translation objects.
// Each locale's translations are merged into a single "translation" namespace.
const resources: Record<string, { translation: Record<string, unknown> }> = {};
for (const locale of supportedLocales) {
  const code = locale.code as keyof typeof translations;
  if (translations[code]) {
    resources[code] = { translation: translations[code] };
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLocale,
    fallbackLng: defaultLocale,
    supportedLngs: supportedLocales.map((l) => l.code),
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
