import { describe, it, expect } from 'vitest';
import { blogIndex, findBySlug, listByCategory } from '../blogIndex.js';
import { getArticle } from '../loader.js';

describe('blogIndex', () => {
  it('contiene articoli IT', () => {
    expect(blogIndex.it.length).toBeGreaterThan(0);
  });
  it('ogni lingua ha lo stesso numero di articoli di IT', () => {
    expect(Object.keys(blogIndex).sort()).toEqual(['de', 'en', 'fr', 'it']);
    for (const lang of Object.keys(blogIndex)) {
      expect(blogIndex[lang], lang).toHaveLength(blogIndex.it.length);
    }
  });
  it('le due categorie partizionano l\'indice, in parti uguali', () => {
    const carriera = listByCategory('carriera', 'it');
    const recruiting = listByCategory('recruiting', 'it');
    expect(carriera.length + recruiting.length).toBe(blogIndex.it.length);
    expect(carriera).toHaveLength(recruiting.length);
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
