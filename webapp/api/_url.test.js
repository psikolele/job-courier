import { describe, it, expect } from 'vitest';
import { normalizeExternalHref } from './_url.js';

describe('normalizeExternalHref', () => {
  it('lascia intatto un URL gia con schema http/https', () => {
    expect(normalizeExternalHref('https://www.adecco.com/it')).toBe('https://www.adecco.com/it');
    expect(normalizeExternalHref('http://example.com')).toBe('http://example.com');
  });

  it('aggiunge https:// a un host nudo senza schema', () => {
    expect(normalizeExternalHref('www.adecco.com/it-ch')).toBe('https://www.adecco.com/it-ch');
  });

  it('risolve un URL protocol-relative con https:', () => {
    expect(normalizeExternalHref('//www.adecco.com/it')).toBe('https://www.adecco.com/it');
  });

  it('non tocca schemi non-http (tel:, mailto:) invece di romperli', () => {
    expect(normalizeExternalHref('tel:+41911234567')).toBe('tel:+41911234567');
    expect(normalizeExternalHref('mailto:info@adecco.com')).toBe('mailto:info@adecco.com');
  });

  it('stringa vuota o assente resta stringa vuota', () => {
    expect(normalizeExternalHref('')).toBe('');
    expect(normalizeExternalHref(undefined)).toBe('');
  });
});
