import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('./_arca24.js', () => ({
  isArca24Enabled: vi.fn(async () => true),
  fetchCompanies: vi.fn(),
}));
vi.mock('./_companies-snapshot.js', () => ({
  generatedAt: new Date().toISOString(),
  companies: Array.from({ length: 12 }, (_, i) => ({ id: `s${i}`, name: `Snapshot ${i}`, has_jobs: true })),
}));

import { isArca24Enabled, fetchCompanies } from './_arca24.js';
import { companies as snapshotCompanies } from './_companies-snapshot.js';
import handler, { resetLastGoodHiring } from './companies.js';

/** A sound run: more employers than the health floor, plus some who are not hiring. */
const healthy = [
  ...Array.from({ length: 16 }, (_, i) => ({ id: `h${i}`, name: `Hiring ${i}`, has_jobs: true })),
  { id: 'x', name: 'Idle', has_jobs: false },
];
/** The shape the index refusal leaves behind: only the handful the job feed names. */
const feedOnly = Array.from({ length: 5 }, (_, i) => ({ id: `f${i}`, name: `Feed ${i}`, has_jobs: true }));
const allUnknown = [{ id: 'u', name: 'Unknown', has_jobs: null }];

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

const call = async (query = { withJobs: '1' }) => {
  const res = fakeRes();
  await handler({ method: 'GET', query }, res);
  return res;
};

describe('GET /api/companies?withJobs=1', () => {
  beforeEach(() => {
    resetLastGoodHiring();
    vi.mocked(isArca24Enabled).mockResolvedValue(true);
    vi.mocked(fetchCompanies).mockReset();
  });
  afterEach(() => vi.useRealTimers());

  it('serves a sound roster, marked live, cached for the full five minutes', async () => {
    vi.mocked(fetchCompanies).mockResolvedValue(healthy);
    const res = await call();
    expect(res.code).toBe(200);
    expect(res.body).toEqual(healthy);
    expect(res.headers['x-roster-source']).toBe('live');
    expect(res.headers['cache-control']).toContain('s-maxage=300');
  });

  // A cold instance that hits the probe deadline reports everyone `null`, which the
  // showcase renders as nothing at all.
  it('stands in for a run that flags nobody', async () => {
    vi.mocked(fetchCompanies).mockResolvedValue(allUnknown);
    const res = await call();
    expect(res.body).toEqual(snapshotCompanies);
    expect(res.headers['x-roster-source']).toBe('stand-in');
    expect(res.headers['cache-control']).toContain('s-maxage=30');
  });

  // The index refusing us leaves the five employers the feed names, all hiring by
  // definition — an answer that passes "is somebody hiring?" while showing a third of the
  // showcase. Health is variety, not whether anything came back at all.
  it('treats a feed-only roster as degraded and prefers the richer stand-in', async () => {
    vi.mocked(fetchCompanies).mockResolvedValue(feedOnly);
    const res = await call();
    expect(res.body).toEqual(snapshotCompanies);
    expect(res.headers['x-roster-source']).toBe('stand-in');
    expect(res.headers['cache-control']).toContain('s-maxage=30');
  });

  // How many employers are hiring is seasonal; whether the index could be read is not.
  // A quiet week must not be mistaken for a broken read and pin the site to a snapshot.
  it('serves a full roster live even when few of it are hiring', async () => {
    const fullButQuiet = [
      ...Array.from({ length: 3 }, (_, i) => ({ id: `q${i}`, name: `Hiring ${i}`, has_jobs: true })),
      ...Array.from({ length: 15 }, (_, i) => ({ id: `i${i}`, name: `Idle ${i}`, has_jobs: false })),
    ];
    vi.mocked(fetchCompanies).mockResolvedValue(fullButQuiet);
    const res = await call();
    expect(res.body).toEqual(fullButQuiet);
    expect(res.headers['x-roster-source']).toBe('live');
  });

  it('keeps a degraded run from evicting the good roster it follows', async () => {
    vi.mocked(fetchCompanies).mockResolvedValue(healthy);
    await call();

    vi.mocked(fetchCompanies).mockResolvedValue(feedOnly);
    const res = await call();
    expect(res.body).toEqual(healthy);
    expect(res.headers['cache-control']).toContain('s-maxage=30');
  });

  // Nobody should sit through a cold run. The stand-in goes out at the budget and the run
  // keeps going behind it, so the next request finds a warm instance.
  it('answers with the stand-in rather than wait out a slow run', async () => {
    vi.useFakeTimers();
    let release;
    vi.mocked(fetchCompanies).mockReturnValue(new Promise((r) => { release = r; }));

    const res = fakeRes();
    const pending = handler({ method: 'GET', query: { withJobs: '1' } }, res);

    await vi.advanceTimersByTimeAsync(4100);
    expect(res.code).toBe(200);
    expect(res.body).toEqual(snapshotCompanies);
    expect(res.headers['x-roster-source']).toBe('stand-in');

    release(healthy);
    await pending;
  });

  it('does not treat an empty plain roster as a good one', async () => {
    vi.mocked(fetchCompanies).mockResolvedValue([]);
    const res = await call({});
    expect(res.body).toEqual([]);
    expect(res.headers['cache-control']).toContain('s-maxage=30');
  });
});
