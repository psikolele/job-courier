import { describe, it, expect, vi } from 'vitest';

vi.mock('node-fetch', () => ({ default: vi.fn() }));
vi.mock('./companies.js', () => ({ fetchCompanyListHtml: vi.fn(), parseCompaniesFromHtml: vi.fn() }));
vi.mock('./company-detail.js', () => ({ warmUpSessionCookies: vi.fn() }));

import { isInCanton } from './jobs.js';

describe('isInCanton', () => {
  it('matches the canton written out in full', () => {
    expect(isInCanton('Svizzera, Ticino, Mendrisio', 'Ticino', 'TI')).toBe(true);
  });

  it('matches the two-letter code, which is how many ads write it', () => {
    // Every Ticino HR ad is spelled this way. Matching the name alone dropped them all,
    // which is what made "HR + Ticino" answer empty.
    expect(isInCanton('Svizzera, Locarno, Ti', 'Ticino', 'TI')).toBe(true);
    expect(isInCanton('Svizzera, Stabio, TI', 'Ticino', 'TI')).toBe(true);
  });

  it('does not let a canton name match inside another word', () => {
    // Found by sweeping all 26 cantons against the live feed: "uri" sits inside
    // "zurigo", so a substring test handed every Zurich ad to a search for Uri.
    expect(isInCanton('Svizzera, Zurigo, Bülach', 'Uri', 'UR')).toBe(false);
    expect(isInCanton('Svizzera, Horgen, Zh', 'Uri', 'UR')).toBe(false);
  });

  it('does not let a canton code match inside another word', () => {
    expect(isInCanton('Svizzera, Bellinzona', 'Ticino', 'TI')).toBe(false);
  });

  it('matches multi-word canton names as consecutive whole words', () => {
    expect(isInCanton('Svizzera, Basilea Città, Basel', 'Basilea Città', 'BS')).toBe(true);
    expect(isInCanton('Svizzera, San Gallo, Wil', 'San Gallo', 'SG')).toBe(true);
  });

  it('keeps distinct cantons distinct when one name contains the other', () => {
    expect(isInCanton('Svizzera, Basilea Campagna, Liestal', 'Basilea Campagna', 'BL')).toBe(true);
    // "Basilea" alone is a prefix of "Basilea Campagna": the code is what separates them.
    expect(isInCanton('Svizzera, Liestal, BL', 'Basilea', 'BS')).toBe(false);
  });

  it('says no when the ad names no canton at all', () => {
    expect(isInCanton('', 'Ticino', 'TI')).toBe(false);
    expect(isInCanton(undefined, 'Ticino', 'TI')).toBe(false);
  });
});
