// Categorie blog con segmenti URL localizzati.
// 'carriera' = candidati, 'recruiting' = aziende (segmento identico in tutte le lingue).
export const CATEGORIES = {
  carriera: {
    segments: { it: 'carriera', en: 'career', de: 'karriere', fr: 'carriere' },
    signature: 'cand',
    ctaTo: '/offerte',
  },
  recruiting: {
    segments: { it: 'recruiting', en: 'recruiting', de: 'recruiting', fr: 'recruiting' },
    signature: 'az',
    ctaTo: '/soluzioni-e-tariffe',
  },
};

export function resolveCategorySegment(segment) {
  for (const [id, cat] of Object.entries(CATEGORIES)) {
    if (Object.values(cat.segments).includes(segment)) return id;
  }
  return null;
}

export function categorySegmentFor(categoryId, lang) {
  const cat = CATEGORIES[categoryId];
  if (!cat) return null;
  return cat.segments[lang] || cat.segments.it;
}

/**
 * Which languages use a category segment: ['de'] for 'karriere', all four for
 * 'recruiting' (same string in every locale, so one shared URL).
 *
 * Used by i18n.js to read the page language out of the URL instead of localStorage.
 * A crawler has no localStorage, so it used to be served Italian on every blog URL and
 * BlogCategoria then redirected /blog/karriere to /blog/carriera — the translated pages
 * existed, carried the right hreflang, and were still unindexable.
 */
export function langsForCategorySegment(segment) {
  for (const cat of Object.values(CATEGORIES)) {
    const langs = Object.entries(cat.segments)
      .filter(([, s]) => s === segment)
      .map(([l]) => l);
    if (langs.length) return langs;
  }
  return [];
}
