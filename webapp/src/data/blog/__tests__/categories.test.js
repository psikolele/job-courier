import { describe, it, expect } from 'vitest';
import { CATEGORIES, resolveCategorySegment, categorySegmentFor } from '../categories.js';

describe('categories', () => {
  it('risolve segmento localizzato in id categoria', () => {
    expect(resolveCategorySegment('carriera')).toBe('carriera');
    expect(resolveCategorySegment('career')).toBe('carriera');
    expect(resolveCategorySegment('karriere')).toBe('carriera');
    expect(resolveCategorySegment('recruiting')).toBe('recruiting');
    expect(resolveCategorySegment('nope')).toBe(null);
  });
  it('restituisce segmento per lingua', () => {
    expect(categorySegmentFor('carriera', 'de')).toBe('karriere');
    expect(categorySegmentFor('recruiting', 'fr')).toBe('recruiting');
    expect(categorySegmentFor('carriera', 'xx')).toBe('carriera'); // fallback it
  });
  it('espone label e target CTA per categoria', () => {
    expect(CATEGORIES.carriera.ctaTo).toBe('/offerte');
    expect(CATEGORIES.recruiting.ctaTo).toBe('/soluzioni-e-tariffe');
  });
});
