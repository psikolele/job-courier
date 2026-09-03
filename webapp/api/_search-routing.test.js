import { describe, it, expect, beforeEach, vi } from 'vitest';

// The adapter imports fetch from node-fetch, so stubbing globalThis.fetch would leave
// these hitting the network for real.
vi.mock('node-fetch', () => ({ default: vi.fn() }));
import fetch from 'node-fetch';

import { fetchJobsForQuery, resolveRegionFacet, resetFacetCache } from './_arca24.js';

const REGION_INDEX = `
<a href="/it/careers/jobs_by_region/3115-214-svizzera-ticino/">Ticino</a>
<a href="/it/careers/jobs_by_region/3118-214-svizzera-vaud/">Vaud</a>
<a href="/it/careers/jobs_by_region/3120-214-svizzera-zurigo/">Zurigo</a>
`;
const ROLE_INDEX = `<a href="/it/careers/jobs_by_role/222-risorse-umane/">Risorse umane</a>`;

/** One results row in the portal's markup, enough for the parser to yield a job. */
const row = (id, title, location) => `
<div class="resultstring">
  <div class="md-caption title_heading">03/09/2026</div>
  <div class="titleContainer"><a href="/it/careers/jobad/${id}-${title.toLowerCase().replace(/\W+/g, '-')}">${title}</a></div>
  <table class="columns"><tbody><tr><td class="valueCell">
    ${location} - <a href="/it/careers/company/profile:id_1&company_name=acme">Acme</a>
  </td></tr></tbody></table>
</div>`;

const html = (body) => ({ ok: true, status: 200, text: async () => body });

describe('search routing — which upstream facet answers a filtered query', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockReset();
    resetFacetCache();
  });

  it('lets keyword win over region, because only keyword cannot be reapplied afterwards', async () => {
    // Upstream keyword search is semantic: `jobs_by_keyword/hr` returns "Talent
    // Acquisition Specialist", which contains no "hr" anywhere. Nothing we can run over
    // a region pool afterwards reproduces that — which is why "HR" + Ticino used to
    // return an empty page: region won the route, and the local substring pass over the
    // Ticino pool matched nothing.
    vi.mocked(fetch).mockImplementation(async (url) => {
      if (String(url).includes('jobs_by_keyword/hr')) {
        return html(row('1', 'Talent Acquisition Specialist', 'Svizzera, Locarno, Ti'));
      }
      return html(REGION_INDEX);
    });

    const out = await fetchJobsForQuery({ keyword: 'HR', region: '3115' }, { pages: 1, maxJobs: 15 });
    expect(out.honoured).toBe('keyword');
    expect(out.path).toContain('jobs_by_keyword/hr');
    expect(out.jobs).toHaveLength(1);
  });

  it('intersects both pools when keyword and role are asked for together', async () => {
    // Neither survives being applied to the other's pool, and the portal answers one
    // facet at a time — verified 03.09.2026 against every combined URL shape it might
    // accept. Two reads and an intersection is the only way to honour the pair.
    vi.mocked(fetch).mockImplementation(async (url) => {
      const u = String(url);
      if (u.includes('jobs_by_keyword/hr')) {
        return html(row('11', 'HR Specialist', 'Svizzera, Locarno, Ti') + row('22', 'HR Freelance', 'Svizzera, Zurigo'));
      }
      if (u.includes('jobs_by_role/222')) {
        return html(row('11', 'HR Specialist', 'Svizzera, Locarno, Ti') + row('33', 'Recruiter', 'Svizzera, Berna'));
      }
      return html(ROLE_INDEX);
    });

    const out = await fetchJobsForQuery({ keyword: 'HR', role_id: '222' }, { pages: 1, maxJobs: 15 });
    expect(out.honoured).toEqual(['keyword', 'role']);
    expect(out.jobs.map(j => j.jobroom_id)).toEqual(['11']);
  });

  it('reports "cannot answer" rather than "nothing found" when no facet fits', async () => {
    vi.mocked(fetch).mockImplementation(async () => html(REGION_INDEX));
    expect(await fetchJobsForQuery({ region: '9999' }, { pages: 1, maxJobs: 15 })).toBeNull();
    expect(await fetchJobsForQuery({}, { pages: 1, maxJobs: 15 })).toBeNull();
  });
});

describe('resolveRegionFacet — the portal index decides, not a local table', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockReset();
    resetFacetCache();
    vi.mocked(fetch).mockImplementation(async () => html(REGION_INDEX));
  });

  it('accepts an id the index confirms', async () => {
    expect(await resolveRegionFacet({ region: '3115' })).toBe('3115');
  });

  it('refuses an id the index does not list, however plausible', async () => {
    // `3095` for Argovia was carried in the client table for months. It resolves to no
    // route upstream, so every Argovia search answered empty.
    expect(await resolveRegionFacet({ region: '3095' })).toBeNull();
  });

  it('resolves a canton named only in text — six such cantons were listed upstream all along', async () => {
    expect(await resolveRegionFacet({ location: 'Vaud' })).toBe('3118');
    expect(await resolveRegionFacet({ location: 'ticino' })).toBe('3115');
  });

  it('prefers the index over a stale id when the location names a real canton', async () => {
    expect(await resolveRegionFacet({ region: '3095', location: 'Vaud' })).toBe('3118');
  });
});
