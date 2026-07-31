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

const SUPPORTED = ['it', 'en', 'de', 'fr'];
export const LANG_STORAGE_KEY = 'jc_lang';

// The stored language is a functional UI preference set explicitly by the user
// (not tracking), so it is kept in localStorage rather than a cookie.
function readStoredLang() {
  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    return SUPPORTED.includes(stored) ? stored : null;
  } catch {
    return null; // private mode / storage disabled
  }
}

function persistLang(lng) {
  try {
    if (SUPPORTED.includes(lng)) window.localStorage.setItem(LANG_STORAGE_KEY, lng);
  } catch {
    /* storage unavailable — the switcher still works for the current session */
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: readStoredLang() || "it",
    fallbackLng: "it",
    supportedLngs: SUPPORTED,
    interpolation: {
      escapeValue: false
    }
  });

i18n.on('languageChanged', persistLang);

export default i18n;
