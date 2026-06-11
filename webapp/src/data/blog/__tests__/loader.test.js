import { describe, it, expect } from 'vitest';
import { blogIndex, findBySlug, listByCategory } from '../blogIndex.js';
import { getArticle } from '../loader.js';

describe('blogIndex', () => {
  it('contiene 10 articoli IT', () => {
    expect(blogIndex.it).toHaveLength(10);
  });
  it('5 per categoria', () => {
    expect(listByCategory('carriera', 'it')).toHaveLength(5);
    expect(listByCategory('recruiting', 'it')).toHaveLength(5);
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
});
