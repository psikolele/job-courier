// Segmenti URL localizzati per le pagine indicizzabili non-blog.
//
// Same shape and rules as data/blog/categories.js, which solved this for the blog first:
// one distinct URL per language, so a crawler has something to index per language. Before
// this, /offerte was the only URL in existence and i18n picked the language out of
// localStorage — which Googlebot does not have, so it read every page as Italian and the
// FR/DE/EN versions of the site were, to a search engine, not there at all. That is why
// jobroom.jobcourier.ch (four declared languages, reciprocal hreflang) outranks us on
// French and German queries for our own brand.
//
// The Italian segments are the URLs already indexed and already listed in the sitemap and
// the 213-entry redirect map: they must never change. Everything here is additive.
//
// A segment shared by several languages is allowed and is not a bug — 'faq' reads the
// same in all four, and inventing a translation just to have a distinct URL would trade a
// real word for a worse one. resolveRouteSegment reports every language a segment belongs
// to; the caller decides. Same case as 'recruiting' in categories.js, which the sitemap
// generator already groups by actual URL rather than by language.
export const ROUTE_SEGMENTS = {
  offerte: {
    segments: { it: 'offerte', en: 'jobs', de: 'stellenangebote', fr: 'offres-emploi' },
  },
  aziende: {
    segments: {
      it: 'aziende-che-assumono',
      en: 'companies-hiring',
      de: 'firmen-die-einstellen',
      fr: 'entreprises-qui-recrutent',
    },
  },
  pricing: {
    segments: {
      it: 'soluzioni-e-tariffe',
      en: 'solutions-and-pricing',
      de: 'loesungen-und-preise',
      fr: 'solutions-et-tarifs',
    },
  },
  comeFunziona: {
    segments: {
      it: 'come-funziona',
      en: 'how-it-works',
      de: 'so-funktioniert-es',
      fr: 'comment-ca-marche',
    },
  },
  contatti: {
    segments: { it: 'contatti', en: 'contact-us', de: 'kontakt', fr: 'contact' },
  },
  faq: {
    segments: { it: 'faq', en: 'faq', de: 'faq', fr: 'faq' },
  },
};

export const ROUTE_LANGS = ['it', 'en', 'de', 'fr'];
export const DEFAULT_LANG = 'it';

/**
 * The segment for a route in a language, falling back to Italian — the language every
 * route is guaranteed to have, and the one the existing URLs are indexed under.
 */
export function routeSegmentFor(routeId, lang) {
  const route = ROUTE_SEGMENTS[routeId];
  if (!route) return null;
  return route.segments[lang] || route.segments[DEFAULT_LANG];
}

/**
 * Which route a URL segment belongs to, and in which languages.
 *
 * `langs` holds every language claiming that segment, in ROUTE_LANGS order: exactly one
 * for a translated segment, all four for a shared one like 'faq'. A caller deducing the
 * page language from the URL can trust a single-entry list and must keep its current
 * preference when the segment is shared — picking langs[0] there would silently force
 * every visitor to Italian, which is the bug this whole module exists to fix.
 */
export function resolveRouteSegment(segment) {
  for (const [routeId, route] of Object.entries(ROUTE_SEGMENTS)) {
    const langs = ROUTE_LANGS.filter((l) => route.segments[l] === segment);
    if (langs.length) return { routeId, langs };
  }
  return null;
}

/**
 * Every distinct URL path for a route, mapped to the languages that use it. Used by the
 * sitemap and the prerender to emit one file (and one <loc>) per real URL rather than one
 * per language — four identical /faq entries each claiming to be the canonical version of
 * a different language is precisely the "referenced for more than one language" error the
 * audit flags.
 */
export function distinctPathsFor(routeId) {
  const route = ROUTE_SEGMENTS[routeId];
  if (!route) return [];
  const bySegment = new Map();
  for (const lang of ROUTE_LANGS) {
    const segment = routeSegmentFor(routeId, lang);
    if (!bySegment.has(segment)) bySegment.set(segment, []);
    bySegment.get(segment).push(lang);
  }
  return [...bySegment.entries()].map(([segment, langs]) => ({ path: `/${segment}`, langs }));
}

/**
 * The hreflang set for a route: one entry per distinct URL, plus x-default on the Italian
 * one. A shared segment is declared once for every language that uses it, which is what
 * makes the set reciprocal — the check Ahrefs failed us on before the blog was fixed.
 */
export function alternatesFor(routeId) {
  const alts = [];
  for (const { path, langs } of distinctPathsFor(routeId)) {
    for (const lang of langs) alts.push({ lang, path });
  }
  alts.push({ lang: 'x-default', path: `/${routeSegmentFor(routeId, DEFAULT_LANG)}` });
  return alts;
}
