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

import { langFromPath } from './utils/langFromPath.js';

const SUPPORTED = ['it', 'en', 'de', 'fr'];
export const LANG_STORAGE_KEY = 'jc_lang';

// The URL wins over the stored preference, and both over the Italian default.
//
// It has to be this order. A crawler has no localStorage, so when the language came from
// storage alone every URL was read as Italian — /stellenangebote and /blog/karriere
// included, which then redirected themselves back to the Italian URL on boot. The
// translated pages were there, with correct hreflang, and could not be indexed in the
// language they were written in. That is what left jobroom.jobcourier.ch, with its four
// declared languages, ranking above us on French and German searches for our own brand.
//
// A URL that names no language (home, a job ad, a company profile) returns null and the
// stored preference still decides, so a visitor who picked German keeps German.
function initialLang() {
  try {
    const fromUrl = langFromPath(window.location.pathname);
    if (fromUrl) return fromUrl;
  } catch {
    /* no window: SSR/prerender falls through to the default below */
  }
  return readStoredLang() || 'it';
}

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
    lng: initialLang(),
    fallbackLng: "it",
    supportedLngs: SUPPORTED,
    interpolation: {
      escapeValue: false
    }
  });

i18n.on('languageChanged', persistLang);

export default i18n;
