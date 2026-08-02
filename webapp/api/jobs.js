import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { fetchCompanyListHtml, parseCompaniesFromHtml } from './companies.js';
import { warmUpSessionCookies } from './company-detail.js';

const fetchHeaders = {
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'it-IT,it;q=0.9,en;q=0.7',
  'Cache-Control': 'no-cache',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120',
  'Referer': 'https://jobroom.jobcourier.ch/',
};

const PAGES_TO_FETCH = 3;   // 3 pages × 15 jobs = 45 — faster default load
const MAX_JOBS = 45;
const BATCH_SIZE = 3;       // max concurrent fetches to avoid upstream rate-limit

// The home showcase needs company variety, not volume. Upstream groups its
// listing pages by company — the first nine pages are all Adecco — so reading
// the first N pages yields a single-brand showcase once the per-company cap is
// applied. Walking 30 consecutive pages fixed the variety but made the request
// slow enough to hang the function.
//
// Instead we sample the catalogue with a stride: the first three pages for
// recency, then every fifth page. Measured on the live feed this reaches the
// same five companies as 30 consecutive pages in 8 requests (~1s), which is
// what a 10-card showcase capped at 2 per company needs.
const SHOWCASE_PAGE_NUMBERS = [1, 2, 3, 10, 15, 20, 25, 30];
const SHOWCASE_MAX_JOBS = 120;

// Params we are willing to forward upstream. Everything else (including our own
// `showcase` flag) is dropped instead of being proxied blindly.
const UPSTREAM_PARAMS = new Set([
  'language', 'country', 'keyword', 'location', 'sector', 'role_id', 'region', 'global',
]);

// Per-page timeout. A single slow upstream page must not drag the whole
// showcase request past the function's time limit; a missing page just means
// fewer jobs in the pool, which the caller already tolerates.
const PAGE_TIMEOUT_MS = 6000;

async function fetchPage(url, headers) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), PAGE_TIMEOUT_MS);
  try {
    const r = await fetch(url, { headers, signal: ctrl.signal });
    return r.ok ? await r.text() : '';
  } catch {
    return '';
  } finally {
    clearTimeout(timer);
  }
}

// Company pages render the same `.singleResult` markup as the search listing, but
// without the `Sede:` label and with the company in a hidden span. `options` lets the
// caller supply the company it already knows and keeps the location parsing honest.
// Fallback source: one request per company, so these are the cost knobs. Measured
// against the live listing on 02/08/2026: 35 companies, of which only 12 carry ads,
// scattered through the list — so every company is read rather than a prefix, which
// would silently drop jobs. 120 ads come back in ~11s at concurrency 6, and the
// response is CDN-cached for 5 minutes (s-maxage), so only the first request after an
// expiry pays it. The cap is a runaway guard above the current roster, not a target:
// if it ever bites, the truncation is logged rather than passing unnoticed.
const FALLBACK_MAX_COMPANIES = 40;
const FALLBACK_BATCH_SIZE = 6;

/**
 * Read jobs from the per-company pages instead of the global search listing.
 *
 * Companies are read in parallel batches, then interleaved round-robin so the result
 * is not one company followed by the next: the upstream ad count is wildly uneven
 * (Adecco alone carries most of the catalogue) and a naive concat would make every
 * caller — the showcase especially — look single-brand again.
 */
async function fetchJobsFromCompanyPages(maxJobs) {
  const listHtml = await fetchCompanyListHtml();
  // `jobs_count` reads 0 for every company on the current listing page, so it cannot be
  // used to skip empty ones — a company with no ads simply yields an empty list here.
  const allCompanies = parseCompaniesFromHtml(listHtml).filter(c => c.id);
  const companies = allCompanies.slice(0, FALLBACK_MAX_COMPANIES);
  if (allCompanies.length > companies.length) {
    console.warn(`Job fallback: reading ${companies.length} of ${allCompanies.length} companies — raise FALLBACK_MAX_COMPANIES.`);
  }

  if (companies.length === 0) return [];

  const cookiesStr = await warmUpSessionCookies();
  const headers = cookiesStr ? { ...fetchHeaders, Cookie: cookiesStr } : fetchHeaders;

  const perCompany = [];
  for (let i = 0; i < companies.length; i += FALLBACK_BATCH_SIZE) {
    const batch = companies.slice(i, i + FALLBACK_BATCH_SIZE).map(async (company, idx) => {
      const url = new URL('https://jobroom.jobcourier.ch/employer/view-company.php');
      url.searchParams.set('id', company.id);
      url.searchParams.set('company-name', company.slug || '');
      url.searchParams.set('lan', 'it');
      url.searchParams.set('language', 'it');
      url.searchParams.set('source', 'direct');

      const html = await fetchPage(url.toString(), headers);
      if (!html) return [];
      // Offset keeps the synthetic image seeds distinct across companies.
      return parseJobsFromHtml(html, (i + idx) * 15, { companyName: company.name });
    });
    perCompany.push(...await Promise.all(batch));
  }

  const seen = new Set();
  const out = [];
  const depth = Math.max(...perCompany.map(list => list.length), 0);
  for (let rank = 0; rank < depth && out.length < maxJobs; rank++) {
    for (const list of perCompany) {
      if (out.length >= maxJobs) break;
      const job = list[rank];
      if (!job) continue;
      const key = job.jobroom_id || job.title;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(job);
    }
  }
  return out;
}

export function parseJobsFromHtml(html, offset = 0, options = {}) {
  const $ = cheerio.load(html);
  const jobs = [];

  $('.vacancies .vacancy, .job-listing, tr.job-item, .singleResult').each((i, el) => {
    const $el = $(el);

    let titleLink = $el.find('a[href*="view-job.php"]').first();
    if (titleLink.length === 0) {
      titleLink = $el.find('.details .dataContainer a').first();
    }

    const title = titleLink.text().trim() || $el.find('h3').text().trim() || 'Titolo non disponibile';
    if (title === 'Titolo non disponibile' && titleLink.length === 0) return;

    let relativeLink = titleLink.attr('href') || $el.find('a').first().attr('href');
    let absoluteLink = 'https://jobroom.jobcourier.ch/job/latest-and-all-job-ads.php?global=1';

    if (relativeLink) {
      try {
        const base = relativeLink.startsWith('http') ? relativeLink
          : relativeLink.startsWith('/job/') || relativeLink.startsWith('job/')
            ? `https://jobroom.jobcourier.ch/${relativeLink.replace(/^\//, '')}`
            : `https://jobroom.jobcourier.ch/job/${relativeLink.replace(/^(\.\.\/|\.\/|\/)/, '')}`;
        const u = new URL(base);
        u.searchParams.set('lan', 'it');
        u.searchParams.set('language', 'it');
        absoluteLink = u.toString();
      } catch (_) {}
    }

    const companyName = options.companyName
      || $el.find('.companyLink span, .company, .firm').first().text().trim()
      || 'Azienda Riservata';

    let location = '';
    const labelSede = $el.find('.detailsHead label:contains("Sede:")');
    if (labelSede.length > 0) {
      const clone = labelSede.parent().clone();
      clone.find('label').remove();
      location = clone.text().replace(/\s+/g, ' ').trim().replace(/^[,\s-]+/, '').trim();
    }
    if (!location) {
      // Company pages mark the location with a maps glyph instead of a `Sede:` label.
      // The markup carries empty segments ("Svizzera, , Basel, Basel") and repeats the
      // city as canton, so normalise before using it — `utils/localeRegion` reads this.
      // Only the span right after the glyph: the same `.detailsHead` can also carry
      // "Settore:" and "Ruolo:", which must not bleed into the location string.
      const geo = $el.find('.detailsHead .glyphicon.google-maps').first().next('span');
      if (geo.length > 0) {
        const parts = geo.text().replace(/\s+/g, ' ').split(',')
          .map(p => p.trim())
          .filter(Boolean)
          .filter((p, i, arr) => i === 0 || p.toLowerCase() !== arr[i - 1].toLowerCase())
          .filter(p => !/^(svizzera|suisse|schweiz|switzerland)$/i.test(p));
        location = parts.join(', ');
      }
    }
    if (!location) {
      location = $el.find('.location, .place').first().text().trim();
    }
    if (!location) {
      // Kept for the search listing, where this was the long-standing last resort.
      // Guarded because on company pages the same selector hits the hidden span that
      // holds the company name, which would silently land in the location field.
      const tail = $el.find('.details span:last-child').first().text().trim();
      if (tail && tail !== companyName) location = tail;
    }
    if (!location) location = 'Svizzera';

    let sector = $el.find('.sector, .category, .details span:contains("Settore"), .detailsHead label:contains("Settore:")').next('span').text().trim();
    if (!sector) {
      const text = $el.text().toLowerCase();
      if (text.includes('trasporti')) sector = 'Trasporti';
      else if (text.includes('logistica')) sector = 'Logistica';
      else if (text.includes('amministrazione')) sector = 'Amministrazione';
      else if (text.includes('vendita')) sector = 'Vendita';
      else sector = 'Non specificato';
    }

    let role = $el.find('.role, .details span:contains("Ruolo"), .detailsHead label:contains("Ruolo:")').next('span').text().trim();
    if (!role) role = 'Non specificato';

    let redirect = false;
    let external_url = null;
    const externalAnchor = $el.find('a[href*="externalLink.php"]').first();
    if (externalAnchor.length > 0) {
      try {
        const u = new URL(externalAnchor.attr('href') || '', 'https://jobroom.jobcourier.ch/job/');
        const target = u.searchParams.get('redirect');
        if (target) { redirect = true; external_url = decodeURIComponent(target); }
      } catch (_) {}
    }

    const jobIdMatch = absoluteLink.match(/[?&]id=([^&]+)/) || absoluteLink.match(/view-job\.php\?id=([^&]+)/);
    const jobRoomId = jobIdMatch ? jobIdMatch[1] : null;

    let published_at = $el.find('.publishedDate, .date, time, .details .data').first().text().trim();
    if (!published_at) {
      const dateMatch = $el.text().match(/(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/);
      published_at = dateMatch ? dateMatch[1] : null;
    }

    let logoUrl = $el.find('img.companyImg, img.companyLogo, .moreDataContainer img').attr('src')
      || $el.find('.detailsHead img').attr('src');

    let absoluteLogo = '';
    if (logoUrl) {
      if (logoUrl.startsWith('..')) logoUrl = logoUrl.substring(2);
      absoluteLogo = logoUrl.startsWith('http')
        ? logoUrl
        : `https://jobroom.jobcourier.ch/job/${logoUrl.startsWith('/') ? logoUrl.substring(1) : logoUrl}`;
    } else {
      let domain = 'jobcourier.ch';
      if (companyName.toLowerCase().includes('randstad')) domain = 'randstad.ch';
      else if (companyName.toLowerCase().includes('adecco')) domain = 'adecco.ch';
      else if (companyName.toLowerCase().includes('manpower')) domain = 'manpower.ch';
      else if (companyName.toLowerCase().includes('gi group')) domain = 'gigroup.com';
      absoluteLogo = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    }

    jobs.push({
      id: jobRoomId || `job-${offset + i}`,
      jobroom_id: jobRoomId,
      title,
      link: absoluteLink,
      apply_url: absoluteLink,
      redirect,
      external_url,
      published_at,
      sector,
      role,
      company: {
        name: companyName,
        logo: absoluteLogo,
        domain: companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.ch'
      },
      location,
      image: `https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=800&auto=format&fit=crop&sig=${offset + i}`
    });
  });

  return jobs;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    const baseUrl = 'https://jobroom.jobcourier.ch/job/latest-and-all-job-ads.php';
    const singlePage = req.query?.singlePage === '1';
    const showcase = req.query?.showcase === '1';

    let pageNumbers = Array.from({ length: PAGES_TO_FETCH }, (_, i) => i + 1);
    let maxJobs = MAX_JOBS;
    if (singlePage) { pageNumbers = [1]; maxJobs = 15; }
    else if (showcase) { pageNumbers = SHOWCASE_PAGE_NUMBERS; maxJobs = SHOWCASE_MAX_JOBS; }

    // Build per-page params, forwarding only whitelisted caller query params
    const callerParams = req.query ? Object.fromEntries(
      Object.entries(req.query).filter(([k]) => UPSTREAM_PARAMS.has(k))
    ) : {};

    const pageUrls = pageNumbers.map((pageNumber) => {
      const url = new URL(baseUrl);
      url.searchParams.set('language', callerParams.language || 'it');
      url.searchParams.set('country', callerParams.country || '214');
      Object.entries(callerParams).forEach(([k, v]) => url.searchParams.set(k, v));
      url.searchParams.set('page', pageNumber);
      return url.toString();
    });

    // Batched parallel fetch (BATCH_SIZE concurrent to avoid rate-limiting)
    const responses = [];
    for (let i = 0; i < pageUrls.length; i += BATCH_SIZE) {
      const batch = pageUrls.slice(i, i + BATCH_SIZE).map(url =>
        fetchPage(url, fetchHeaders)
      );
      responses.push(...await Promise.all(batch));
    }

    // Parse + flatten, offset IDs by page to avoid collision
    const seen = new Set();
    const allJobs = [];

    for (let p = 0; p < responses.length; p++) {
      if (!responses[p]) continue;
      const pageJobs = parseJobsFromHtml(responses[p], p * 15);
      for (const job of pageJobs) {
        const key = job.jobroom_id || job.title;
        if (!seen.has(key)) {
          seen.add(key);
          allJobs.push(job);
        }
        if (allJobs.length >= maxJobs) break;
      }
      if (allJobs.length >= maxJobs) break;
    }

    // The search listing went dry on 02/08/2026 (Arca24 platform work): it renders its
    // shell and reports "Non ci sono risultati" while the ads themselves are still
    // published and reachable on each company's page. Fall back to those pages so the
    // site keeps serving jobs. Once the listing answers again this branch stops running
    // on its own — no flag to flip back.
    // Only for unfiltered requests. The company pages cannot honour keyword/sector/
    // region, so answering a filtered query from them would return a grab-bag of
    // unrelated jobs instead of an honest "no match" — wrong data rather than none.
    // A filtered search that finds nothing must keep saying so.
    const isFiltered = Object.keys(callerParams).some(k => k !== 'language' && k !== 'country');
    if (allJobs.length === 0 && !isFiltered) {
      const fallbackJobs = await fetchJobsFromCompanyPages(maxJobs);
      if (fallbackJobs.length > 0) {
        res.status(200).json(fallbackJobs);
        return;
      }
    }

    res.status(200).json(allJobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.setHeader('Cache-Control', 'no-store');
    res.status(500).json({ error: 'Failed to fetch jobs data', details: error.message });
  }
}
