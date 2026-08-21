import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('./_arca24.js', () => ({
  isArca24Enabled: vi.fn(),
  fetchJobs: vi.fn(),
  fetchCompanies: vi.fn(),
  fetchCompanyDetail: vi.fn(),
  fetchJobDetail: vi.fn(),
  fetchJobsForQuery: vi.fn(),
  fetchFacetIndex: vi.fn(),
  slugify: (value) => String(value ?? '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, ''),
}));
vi.mock('./companies.js', () => ({
  fetchCompanyListHtml: vi.fn(),
  parseCompaniesFromHtml: vi.fn(),
}));
vi.mock('./company-detail.js', () => ({ warmUpSessionCookies: vi.fn() }));

import { fetchJobDetail } from './_arca24.js';
import { enrichReservedCompanies } from './jobs.js';

const reservedJob = (id) => ({
  id,
  title: 'Operatore Carroponte / Gru',
  company: { name: 'Azienda Riservata', logo: '', domain: 'aziendariservata.ch' },
});
const namedJob = (id, name) => ({ id, title: 'Contabile', company: { name, logo: 'https://x/logo.jpg' } });

describe('enrichReservedCompanies', () => {
  // afterEach, not beforeEach: a reset placed before the test trips a Vitest/tinyspy
  // quirk where an async mock that later rejects gets reported as an unhandled error
  // even once production code catches it (verified separately — the catch does fire
  // and the fallback name is genuinely returned). Resetting after each test leaves
  // every test starting from the same clean mock with none of that noise.
  afterEach(() => vi.mocked(fetchJobDetail).mockReset());

  it('resolves the real name when the detail page has one — the list scrape had none to give', () => {
    // Reproduces job 6738804: the results row carries no company link at all, so the
    // list parser falls back to "Azienda Riservata", but the ad's own page names the
    // employer via structured hiringOrganization data the list never exposes.
    vi.mocked(fetchJobDetail).mockResolvedValue({
      company: { name: 'Team Personnel Solutions SA', logo: '' },
    });

    return enrichReservedCompanies([reservedJob('6738804')]).then((out) => {
      expect(out[0].company.name).toBe('Team Personnel Solutions SA');
    });
  });

  it('rebuilds slug and domain from the recovered name, not the placeholder\'s', async () => {
    // Reproduces ad 6740371 live 20/08/2026: only the name was recovered, so the link
    // built from it pointed at "azienda-riservata" — a slug that does not exist.
    vi.mocked(fetchJobDetail).mockResolvedValue({
      company: { name: 'Dinamic Hub', logo: '', slug: '', arca24_id: null },
    });

    const out = await enrichReservedCompanies([reservedJob('6740371')]);

    expect(out[0].company.name).toBe('Dinamic Hub');
    expect(out[0].company.slug).toBe('dinamic-hub');
    expect(out[0].company.domain).toBe('dinamichub.ch');
  });

  it('leaves jobs that already carry a real company name untouched, without calling the detail page', async () => {
    const out = await enrichReservedCompanies([namedJob('1', 'Randstad Svizzera SA')]);
    expect(out[0].company.name).toBe('Randstad Svizzera SA');
    expect(fetchJobDetail).not.toHaveBeenCalled();
  });

  it('keeps the fallback name if the detail page cannot resolve one either', async () => {
    vi.mocked(fetchJobDetail).mockResolvedValue({ company: { name: 'Azienda Riservata', logo: '' } });
    const out = await enrichReservedCompanies([reservedJob('1')]);
    expect(out[0].company.name).toBe('Azienda Riservata');
  });

  it('keeps the fallback name if the detail fetch fails, instead of throwing', async () => {
    vi.mocked(fetchJobDetail).mockImplementation(() => Promise.reject(new Error('Arca24 responded 500')));
    await expect(enrichReservedCompanies([reservedJob('1')])).resolves.toEqual([reservedJob('1')]);
  });

  it('caps enrichment so a portal that anonymises many ads at once cannot multiply requests', async () => {
    vi.mocked(fetchJobDetail).mockResolvedValue({ company: { name: 'Qualcuno SA', logo: '' } });
    const jobs = Array.from({ length: 20 }, (_, i) => reservedJob(String(i)));
    await enrichReservedCompanies(jobs);
    expect(fetchJobDetail).toHaveBeenCalledTimes(6);
  });
});
