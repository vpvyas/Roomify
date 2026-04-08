import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from './locales/en/translation.json';
import translationHI from './locales/hi/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: translationEN },
      hi: { translation: translationHI }
    },
    lng: "en", // Set initial language explicitly for testing
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

export default i18n;