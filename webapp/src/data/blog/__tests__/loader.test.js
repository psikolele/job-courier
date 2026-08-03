import { describe, it, expect } from 'vitest';
import { blogIndex, findBySlug, listByCategory } from '../blogIndex.js';
import { getArticle } from '../loader.js';

const LANGS = ['it', 'en', 'de', 'fr'];

describe('blogIndex', () => {
  // Conteggi esatti evitati di proposito: si rompevano a ogni articolo aggiunto
  // (10 → 12 il 28.07). Questi invarianti reggono la crescita e catturano comunque
  // traduzioni mancanti, slug copiati e categorie sbilanciate.
  it('tutte le lingue hanno lo stesso numero di articoli', () => {
    const counts = Object.fromEntries(LANGS.map(l => [l, blogIndex[l]?.length ?? 0]));
    expect(new Set(Object.values(counts)).size, `conteggi disallineati: ${JSON.stringify(counts)}`).toBe(1);
  });
  it('almeno 10 articoli IT', () => {
    expect(blogIndex.it.length).toBeGreaterThanOrEqual(10);
  });
  it('nessuno slug duplicato in nessuna lingua', () => {
    for (const lang of LANGS) {
      const slugs = blogIndex[lang].map(e => e.slug);
      expect(new Set(slugs).size, `slug duplicati in ${lang}`).toBe(slugs.length);
    }
  });
  it('le due categorie restano bilanciate', () => {
    const carriera = listByCategory('carriera', 'it').length;
    const recruiting = listByCategory('recruiting', 'it').length;
    expect(carriera).toBe(recruiting);
    expect(carriera + recruiting).toBe(blogIndex.it.length);
  });
  it('findBySlug trova articolo e lingua', () => {
    const hit = findBySlug('employer-branding-pmi-guida-pratica');
    expect(hit.lang).toBe('it');
    expect(hit.entry.category).toBe('recruiting');
  });
  it('ogni entry ha campi card', () => {
    for (const e of blogIndex.it) {
      expect(e.slug).toBeTruthy();
      expect(e.title).toBeTruthy();
      expect(e.abstract).toBeTruthy();
      expect(e.readingTime).toBeGreaterThan(0);
      expect(e.image).toBeTruthy();
    }
  });
});

describe('getArticle', () => {
  it('carica articolo IT', async () => {
    const a = await getArticle('come-scrivere-un-cv-che-ottiene-colloqui', 'it');
    expect(a.metaTitle).toBeTruthy();
    expect(a.sections.length).toBeGreaterThan(3);
    expect(a.faq.length).toBeGreaterThanOrEqual(4);
  });
  it('fallback IT per lingua mancante', async () => {
    const a = await getArticle('come-scrivere-un-cv-che-ottiene-colloqui', 'de');
    expect(a).toBeTruthy();
    expect(a._fallback).toBe(true);
  });
  it('null per slug inesistente', async () => {
    expect(await getArticle('non-esiste', 'it')).toBe(null);
  });
  it('carica articolo DE tradotto senza fallback', async () => {
    const a = await getArticle('lebenslauf-schreiben-der-zum-vorstellungsgespraech-fuehrt', 'de');
    expect(a).toBeTruthy();
    expect(a._fallback).toBeUndefined();
    expect(a.metaTitle).toBeTruthy();
  });
});

describe('slugTranslations', () => {
  it('contiene mapping per tutti gli articoli IT e tutte le lingue', async () => {
    const { slugTranslations } = await import('../blogIndex.js');
    const { blogIndex: idx } = await import('../blogIndex.js');
    for (const e of idx.it) {
      const map = slugTranslations[e.slug];
      expect(map).toBeTruthy();
      expect(map.en).toBeTruthy();
      expect(map.de).toBeTruthy();
      expect(map.fr).toBeTruthy();
    }
  });
});
