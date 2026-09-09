import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { translatePath } from '../utils/langFromPath';

/**
 * Rewrites an internal link to the URL of the language currently being read:
 * lp('/offerte') is '/stellenangebote' in German.
 *
 * Needed because every link in the app is written with its Italian path, and each page now
 * has one URL per language. A German reader clicking a link that still said /offerte would
 * land on the URL that declares itself Italian, and App.jsx's SyncLangWithPath — which
 * trusts the URL, because that is what a crawler reads — would switch the whole site back
 * to Italian under them.
 *
 * Paths with no per-language form (home, a job ad, a company profile) come back unchanged,
 * so this is safe to wrap around any internal link. Query strings and anchors are carried
 * over, so a filtered list stays filtered.
 */
export default function useLocalizedPath() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.slice(0, 2) || 'it';
  return useCallback((path) => translatePath(path, lang), [lang]);
}
