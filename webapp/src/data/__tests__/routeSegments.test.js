import { describe, it, expect } from 'vitest';
import {
  ROUTE_SEGMENTS,
  ROUTE_LANGS,
  routeSegmentFor,
  resolveRouteSegment,
  distinctPathsFor,
  alternatesFor,
} from '../routeSegments.js';

describe('routeSegments', () => {
  it('tiene invariati i segmenti italiani già indicizzati', () => {
    // These are the URLs in public/sitemap.xml and in the 213-entry redirect map.
    expect(routeSegmentFor('offerte', 'it')).toBe('offerte');
    expect(routeSegmentFor('aziende', 'it')).toBe('aziende-che-assumono');
    expect(routeSegmentFor('pricing', 'it')).toBe('soluzioni-e-tariffe');
    expect(routeSegmentFor('comeFunziona', 'it')).toBe('come-funziona');
    expect(routeSegmentFor('contatti', 'it')).toBe('contatti');
    expect(routeSegmentFor('faq', 'it')).toBe('faq');
  });

  it('restituisce segmento per lingua, con fallback italiano', () => {
    expect(routeSegmentFor('offerte', 'de')).toBe('stellenangebote');
    expect(routeSegmentFor('offerte', 'fr')).toBe('offres-emploi');
    expect(routeSegmentFor('offerte', 'xx')).toBe('offerte');
    expect(routeSegmentFor('nope', 'it')).toBe(null);
  });

  it('risolve un segmento tradotto in route e lingua sola', () => {
    expect(resolveRouteSegment('stellenangebote')).toEqual({ routeId: 'offerte', langs: ['de'] });
    expect(resolveRouteSegment('offres-emploi')).toEqual({ routeId: 'offerte', langs: ['fr'] });
    expect(resolveRouteSegment('offerte')).toEqual({ routeId: 'offerte', langs: ['it'] });
    expect(resolveRouteSegment('nope')).toBe(null);
  });

  it('segnala tutte le lingue di un segmento condiviso', () => {
    // 'faq' reads the same in all four: the caller must keep its own language rather than
    // taking langs[0], which would force every visitor to Italian.
    expect(resolveRouteSegment('faq')).toEqual({ routeId: 'faq', langs: ROUTE_LANGS });
  });

  it('non ha collisioni di segmento tra route diverse', () => {
    const seen = new Map();
    for (const [routeId, route] of Object.entries(ROUTE_SEGMENTS)) {
      for (const segment of Object.values(route.segments)) {
        if (seen.has(segment) && seen.get(segment) !== routeId) {
          throw new Error(`segmento "${segment}" usato da ${seen.get(segment)} e ${routeId}`);
        }
        seen.set(segment, routeId);
      }
    }
    expect(seen.size).toBeGreaterThan(0);
  });

  it('usa segmenti URL-safe', () => {
    for (const route of Object.values(ROUTE_SEGMENTS)) {
      for (const segment of Object.values(route.segments)) {
        expect(segment).toMatch(/^[a-z0-9-]+$/);
      }
    }
  });

  it('raggruppa per URL reale, non per lingua', () => {
    expect(distinctPathsFor('offerte')).toEqual([
      { path: '/offerte', langs: ['it'] },
      { path: '/jobs', langs: ['en'] },
      { path: '/stellenangebote', langs: ['de'] },
      { path: '/offres-emploi', langs: ['fr'] },
    ]);
    // One URL, four languages — not four <loc> each claiming a different canonical.
    expect(distinctPathsFor('faq')).toEqual([{ path: '/faq', langs: ROUTE_LANGS }]);
  });

  it('emette hreflang reciproci con x-default sull italiano', () => {
    const alts = alternatesFor('offerte');
    expect(alts).toContainEqual({ lang: 'it', path: '/offerte' });
    expect(alts).toContainEqual({ lang: 'de', path: '/stellenangebote' });
    expect(alts).toContainEqual({ lang: 'x-default', path: '/offerte' });
    // Every language is declared, including the page's own — the reciprocity check.
    for (const lang of ROUTE_LANGS) expect(alts.some((a) => a.lang === lang)).toBe(true);
  });

  it('dichiara ogni lingua anche su un segmento condiviso', () => {
    const alts = alternatesFor('faq');
    for (const lang of ROUTE_LANGS) expect(alts).toContainEqual({ lang, path: '/faq' });
    expect(alts).toContainEqual({ lang: 'x-default', path: '/faq' });
  });
});
