import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import itTranslation from './locales/it.json';
import enTranslation from './locales/en.json';
import deTranslation from './locales/de.json';
import frTranslation from './locales/fr.json';

const resources = {
  it: { translation: itTranslation },
  en: { translation: enTranslation },
  de: { translation: deTranslation },
  fr: { translation: frTranslation }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "it",
    fallbackLng: "it",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
