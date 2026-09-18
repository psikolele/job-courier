import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./_arca24.js', () => ({
  isArca24Enabled: vi.fn(),
  fetchCompanyDetail: vi.fn(),
}));
vi.mock('./_company-overrides.js', () => ({
  overrides: {
    '999': { description: 'Descrizione di test', website: 'https://esempio-test.ch' },
  },
}));

import { isArca24Enabled, fetchCompanyDetail } from './_arca24.js';
import handler from './company-detail.js';

function mockRes() {
  const res = {
    headers: {},
    setHeader: vi.fn((k, v) => { res.headers[k] = v; }),
    statusCode: null,
    status: vi.fn((code) => { res.statusCode = code; return res; }),
    json: vi.fn((body) => { res.body = body; return res; }),
    end: vi.fn(),
  };
  return res;
}

describe('company-detail handler — merge degli override', () => {
  beforeEach(() => {
    vi.mocked(isArca24Enabled).mockResolvedValue(true);
    vi.mocked(fetchCompanyDetail).mockReset();
  });

  it('usa il testo di override solo quando il dato reale e vuoto', async () => {
    vi.mocked(fetchCompanyDetail).mockResolvedValue({
      id: '999', name: 'Test SA', brand_description: '', website: '', spontaneous_url: '', jobs: [],
    });
    const res = mockRes();
    await handler({ method: 'GET', query: { id: '999', slug: 'test-sa' } }, res);
    expect(res.body.brand_description).toBe('Descrizione di test');
    expect(res.body.website).toBe('https://esempio-test.ch');
  });

  it('non sovrascrive un valore reale con loverride', async () => {
    vi.mocked(fetchCompanyDetail).mockResolvedValue({
      id: '999', name: 'Test SA', brand_description: 'Testo vero già presente', website: '', spontaneous_url: '', jobs: [],
    });
    const res = mockRes();
    await handler({ method: 'GET', query: { id: '999', slug: 'test-sa' } }, res);
    expect(res.body.brand_description).toBe('Testo vero già presente');
    expect(res.body.website).toBe('https://esempio-test.ch');
  });

  it('azienda senza voce di override: risposta invariata', async () => {
    vi.mocked(fetchCompanyDetail).mockResolvedValue({
      id: '1', name: 'Altra SA', brand_description: '', website: '', spontaneous_url: '', jobs: [],
    });
    const res = mockRes();
    await handler({ method: 'GET', query: { id: '1', slug: 'altra-sa' } }, res);
    expect(res.body.brand_description).toBe('');
    expect(res.body.website).toBe('');
  });
});
