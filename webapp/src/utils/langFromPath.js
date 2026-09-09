import { resolveRouteSegment, routeSegmentFor, ROUTE_LANGS } from '../data/routeSegments.js';
import {
  langsForCategorySegment,
  resolveCategorySegment,
  categorySegmentFor,
} from '../data/blog/categories.js';
import { findBySlug, slugFor, itSlugFor } from '../data/blog/blogIndex.js';

/**
 * The language a URL declares itself to be in, or null when the URL does not say.
 *
 * This is the fix for the reason jobroom.jobcourier.ch outranks us on French and German
 * queries: the language used to come from localStorage, which a crawler does not have, so
 * every page was served as Italian no matter which URL was requested and the FR/DE/EN
 * versions of the site did not exist as far as a search engine was concerned.
 *
 * Returning null matters as much as returning a language. The home page, a job ad and a
 * company profile are one URL each, shared by every language — there is nothing to deduce,
 * and the visitor's own stored preference must survive. Forcing Italian there would be the
 * same bug wearing different clothes.
 */
export function langFromPath(pathname) {
  const parts = String(pathname || '')
    .split('/')
    .filter(Boolean);
  if (!parts.length) return null; // home: one URL for every language

  if (parts[0] === 'blog') {
    // An article slug is unique per language, so it answers even under 'recruiting',
    // whose category segment is shared by all four.
    if (parts[2]) {
      const found = findBySlug(parts[2]);
      if (found) return found.lang;
    }
    if (parts[1]) return single(langsForCategorySegment(parts[1]));
    return null;
  }

  const route = resolveRouteSegment(parts[0]);
  return route ? single(route.langs) : null;
}

/**
 * A segment shared by several languages ('faq', 'recruiting') identifies no single one.
 * The caller keeps whatever it already had rather than being pushed to langs[0].
 */
function single(langs) {
  return langs && langs.length === 1 && ROUTE_LANGS.includes(langs[0]) ? langs[0] : null;
}

/**
 * The same page's URL in another language, or the path unchanged when it has no
 * per-language form (home, job ad, company profile, an unknown path).
 *
 * The language switcher navigates with this rather than only calling changeLanguage:
 * switching to German on /offerte has to land on /stellenangebote, otherwise the German
 * reader sits on the URL that declares itself Italian and the two contradict each other.
 * The hreflang sets are built from the same function, so the tags and the switcher can
 * never point at different URLs.
 */
export function translatePath(pathname, lang) {
  const full = String(pathname || '/');
  // Callers pass real link targets, which carry the filters and anchors the page needs:
  // /offerte?sector=Sanita is one of them. Only the path is translated; the rest is
  // carried over untouched, or switching language on a filtered list would silently
  // reset the filters.
  const suffixAt = full.search(/[?#]/);
  const path = suffixAt === -1 ? full : full.slice(0, suffixAt);
  const suffix = suffixAt === -1 ? '' : full.slice(suffixAt);
  const parts = path.split('/').filter(Boolean);
  if (!parts.length || !ROUTE_LANGS.includes(lang)) return full;

  if (parts[0] === 'blog') {
    const categoryId = parts[1] ? resolveCategorySegment(parts[1]) : null;
    if (!categoryId) return full;
    const segment = categorySegmentFor(categoryId, lang);
    if (!parts[2]) return `/blog/${segment}${suffix}`;
    return `/blog/${segment}/${slugFor(itSlugFor(parts[2]), lang)}${suffix}`;
  }

  const route = resolveRouteSegment(parts[0]);
  if (!route) return full;
  const rest = parts.slice(1);
  return ['', routeSegmentFor(route.routeId, lang), ...rest].join('/') + suffix;
}
