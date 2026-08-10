import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./_arca24.js', () => ({
  isArca24Enabled: vi.fn(async () => true),
  fetchCompanies: vi.fn(),
}));

import { isArca24Enabled, fetchCompanies } from './_arca24.js';
import handler, { resetLastGoodHiring } from './companies.js';

const hiring = [{ id: '1', name: 'Adecco', has_jobs: true }];
const unknown = [{ id: '1', name: 'Adecco', has_jobs: null }];

function fakeRes() {
  const headers = {};
  return {
    headers,
    body: undefined,
    code: undefined,
    setHeader: (k, v) => { headers[k.toLowerCase()] = v; },
    status(c) { this.code = c; return this; },
    json(b) { this.body = b; return this; },
    end() { return this; },
  };
}

const call = async () => {
  const res = fakeRes();
  await handler({ method: 'GET', query: { withJobs: '1' } }, res);
  return res;
};

describe('GET /api/companies?withJobs=1', () => {
  beforeEach(() => {
    resetLastGoodHiring();
    vi.mocked(isArca24Enabled).mockResolvedValue(true);
    vi.mocked(fetchCompanies).mockReset();
  });

  it('caches a roster with somebody hiring for the full five minutes', async () => {
    vi.mocked(fetchCompanies).mockResolvedValue(hiring);
    const res = await call();
    expect(res.code).toBe(200);
    expect(res.body).toEqual(hiring);
    expect(res.headers['cache-control']).toContain('s-maxage=300');
  });

  // A cold instance that hits the probe deadline reports everyone `null`, which the
  // showcase renders as nothing at all. Serving that for five minutes hid the section
  // for every visitor; the last good roster stands in instead.
  it('serves the last good roster when a run flags nobody as hiring', async () => {
    vi.mocked(fetchCompanies).mockResolvedValue(hiring);
    await call();

    vi.mocked(fetchCompanies).mockResolvedValue(unknown);
    const res = await call();
    expect(res.body).toEqual(hiring);
    expect(res.headers['cache-control']).toContain('s-maxage=30');
  });

  it('answers the degraded roster, briefly cached, when there is no good one yet', async () => {
    vi.mocked(fetchCompanies).mockResolvedValue(unknown);
    const res = await call();
    expect(res.code).toBe(200);
    expect(res.body).toEqual(unknown);
    expect(res.headers['cache-control']).toContain('s-maxage=30');
  });

  it('does not treat an empty plain roster as a good one', async () => {
    vi.mocked(fetchCompanies).mockResolvedValue([]);
    const res = fakeRes();
    await handler({ method: 'GET', query: {} }, res);
    expect(res.body).toEqual([]);
    expect(res.headers['cache-control']).toContain('s-maxage=30');
  });
});
