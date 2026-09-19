import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./_arca24.js', () => ({
  isArca24Enabled: vi.fn(),
  fetchCompanyDetail: vi.fn(),
}));
vi.mock('./_company-overrides.js', () => ({
  overrides: {
    '999': { about: 'Descrizione di test', website: 'https://esempio-test.ch' },
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

  it('espone about dal file override anche se brand_description e gia pieno (boilerplate della banda)', async () => {
    vi.mocked(fetchCompanyDetail).mockResolvedValue({
      id: '999', name: 'Test SA', brand_description: 'Vuoi entrare a far parte del nostro team?', website: '', spontaneous_url: '', jobs: [],
    });
    const res = mockRes();
    await handler({ method: 'GET', query: { id: '999', slug: 'test-sa' } }, res);
    expect(res.body.about).toBe('Descrizione di test');
    expect(res.body.brand_description).toBe('Vuoi entrare a far parte del nostro team?');
  });

  it('il website di override riempie solo un valore vuoto, mai uno reale', async () => {
    vi.mocked(fetchCompanyDetail).mockResolvedValue({
      id: '999', name: 'Test SA', brand_description: '', website: '', spontaneous_url: '', jobs: [],
    });
    const empty = mockRes();
    await handler({ method: 'GET', query: { id: '999', slug: 'test-sa' } }, empty);
    expect(empty.body.website).toBe('https://esempio-test.ch');

    vi.mocked(fetchCompanyDetail).mockResolvedValue({
      id: '999', name: 'Test SA', brand_description: '', website: 'https://vero.ch', spontaneous_url: '', jobs: [],
    });
    const real = mockRes();
    await handler({ method: 'GET', query: { id: '999', slug: 'test-sa' } }, real);
    expect(real.body.website).toBe('https://vero.ch');
  });

  it('azienda senza voce di override: risposta invariata', async () => {
    vi.mocked(fetchCompanyDetail).mockResolvedValue({
      id: '1', name: 'Altra SA', brand_description: '', website: '', spontaneous_url: '', jobs: [],
    });
    const res = mockRes();
    await handler({ method: 'GET', query: { id: '1', slug: 'altra-sa' } }, res);
    expect(res.body.about).toBe('');
    expect(res.body.website).toBe('');
  });
});
