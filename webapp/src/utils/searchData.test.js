import { describe, it, expect } from 'vitest';
import { CANTONS, SECTORS, buildSearchParams, getCantonValueFromParams } from './searchData';

describe('buildSearchParams', () => {
  it('sends the canton as name and code, not as a hand-kept upstream id', () => {
    // The id table was the defect: nine cantons of twenty-six had one, one of those
    // (Argovia 3095) named a facet the portal does not list, and every search on the
    // rest resolved to no route and answered empty.
    const p = buildSearchParams({ keyword: 'HR', selectedSector: '', selectedCanton: 'TI' });
    expect(p.get('location')).toBe('Ticino');
    expect(p.get('canton')).toBe('TI');
    expect(p.get('region')).toBeNull();
    expect(p.get('keyword')).toBe('HR');
  });

  it('treats every canton alike — the ones that used to fall back to a text-only search too', () => {
    const vaud = buildSearchParams({ keyword: '', selectedSector: '', selectedCanton: 'VD' });
    const ticino = buildSearchParams({ keyword: '', selectedSector: '', selectedCanton: 'TI' });
    expect(vaud.get('canton')).toBe('VD');
    expect(vaud.get('location')).toBe('Vaud');
    expect(vaud.get('global')).toBeNull();
    expect([...vaud.keys()].sort()).toEqual([...ticino.keys()].sort());
  });

  it('sends role_id alone — the role slug was never forwarded upstream', () => {
    const p = buildSearchParams({ keyword: '', selectedSector: '222', selectedCanton: '' });
    expect(p.get('role_id')).toBe('222');
    expect(p.get('role')).toBeNull();
    expect(p.get('global')).toBe('1');
  });
});

describe('getCantonValueFromParams', () => {
  it('reads the canton the form now sends', () => {
    expect(getCantonValueFromParams('', '', 'TI')).toBe('TI');
  });

  it('still reads links made before cantons stopped carrying region ids', () => {
    expect(getCantonValueFromParams('3115', '', '')).toBe('TI');
    expect(getCantonValueFromParams('3118', '', '')).toBe('VD');
  });

  it('falls back to the location name', () => {
    expect(getCantonValueFromParams('', 'Ticino', '')).toBe('TI');
  });

  it('returns empty rather than guessing', () => {
    expect(getCantonValueFromParams('', '', '')).toBe('');
    expect(getCantonValueFromParams('9999', 'Atlantide', 'XX')).toBe('');
  });
});

describe('the tables themselves', () => {
  it('offers all 26 cantons, each with a two-letter code', () => {
    expect(CANTONS).toHaveLength(26);
    CANTONS.forEach(c => expect(c.value).toMatch(/^[A-Z]{2}$/));
  });

  it('no longer lists the four sectors the portal has no route for', () => {
    // 231, 220, 233 and 902 sat in the dropdown and answered empty on every click.
    const ids = SECTORS.map(s => s.id);
    expect(ids).not.toContain('231');
    expect(ids).not.toContain('220');
    expect(ids).not.toContain('233');
    expect(ids).not.toContain('902');
  });

  it('lists the roles the portal exposes, including the eight that were missing', () => {
    const ids = SECTORS.map(s => s.id);
    ['230', '237', '904', '235', '229', '227', '228', '903'].forEach(id => {
      expect(ids).toContain(id);
    });
    expect(new Set(ids).size).toBe(SECTORS.length);
  });
});
