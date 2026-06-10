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
