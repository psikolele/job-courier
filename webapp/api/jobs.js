import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { fetchCompanyListHtml, parseCompaniesFromHtml } from './companies.js';
import { warmUpSessionCookies } from './company-detail.js';
import {
  isArca24Enabled,
  fetchJobs as fetchArca24Jobs,
  fetchCompanies as fetchArca24Companies,
  fetchCompanyDetail as fetchArca24CompanyDetail,
  fetchJobsForQuery as fetchArca24Query,
  fetchFacetIndex as fetchArca24FacetIndex,
} from './_arca24.js';

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

// What "the listing is working" looks like. Below this the fallback steps in, and a
// fallback result under these numbers is treated as degraded: served, but not cached
// for 40 minutes. Measured baseline is 120 ads across 12 companies.
const MIN_HEALTHY_JOBS = 10;
const MIN_HEALTHY_COMPANIES = 3;

/**
 * Identity of an ad, for de-duplication.
 *
 * The two sources spell the same ad differently — `6727905` on a company page,
 * `6727905-aiuto-cuoco-lugano` in the search listing — so keying on the raw id
 * would let a merged result carry it twice. The leading jobroom number is what
 * they share. Ads with no id at all fall back to their title, as before.
 */
function adKey(job) {
  const id = String(job.jobroom_id ?? '');
  const m = id.match(/^(\d+)/);
  return m ? m[1] : (id || job.title);
}

/**
 * Read jobs from the per-company pages instead of the global search listing.
 *
 * Companies are read in parallel batches, then interleaved round-robin so the result
 * is not one company followed by the next: the upstream ad count is wildly uneven
 * (Adecco alone carries most of the catalogue) and a naive concat would make every
 * caller — the showcase especially — look single-brand again.
 */
/**
 * Round-robin across per-company lists.
 *
 * Never concatenate: one company usually carries most of the catalogue, and a naive
 * concat hands the showcase a single-brand list — the exact problem the per-company cap
 * exists to prevent.
 */
function interleaveByCompany(perCompany, maxJobs) {
  const seen = new Set();
  const out = [];
  const depth = Math.max(...perCompany.map(list => list.length), 0);
  for (let rank = 0; rank < depth && out.length < maxJobs; rank++) {
    for (const list of perCompany) {
      if (out.length >= maxJobs) break;
      const job = list[rank];
      if (!job) continue;
      const key = adKey(job);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(job);
    }
  }
  return out;
}

/**
 * Same idea as the jobroom fallback below, against the Arca24 portal.
 *
 * It is not a fallback there but the only source of variety: the new listing is ordered
 * so that one company fills every page — measured on 03/08/2026, pages 1 through 50 were
 * Adecco without exception — while the company pages carry the rest of the catalogue.
 */
// The Arca24 roster is 33 companies against jobroom's 12 with ads, and each page answers
// in about a second, so the jobroom concurrency of 6 put this at ~34s — uncomfortably
// close to the function's 60s ceiling for a request the showcase waits on. At 12 it is
// ~15s. Still one request per company, just fewer rounds.
const ARCA24_BATCH_SIZE = 12;

async function fetchArca24CompanyJobs(maxJobs) {
  const companies = await fetchArca24Companies();
  if (companies.length === 0) return [];

  const perCompany = [];
  for (let i = 0; i < companies.length; i += ARCA24_BATCH_SIZE) {
    const batch = companies.slice(i, i + ARCA24_BATCH_SIZE).map(company =>
      fetchArca24CompanyDetail(company.id, company.slug)
        .then(detail => detail.jobs || [])
        .catch(() => [])
    );
    perCompany.push(...await Promise.all(batch));
  }
  return interleaveByCompany(perCompany, maxJobs);
}

async function fetchJobsFromCompanyPages(maxJobs) {
  if (await isArca24Enabled()) return fetchArca24CompanyJobs(maxJobs);

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

  return interleaveByCompany(perCompany, maxJobs);
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

/** Accent- and punctuation-insensitive, so "Basilea Città" matches "basilea citta". */
function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Apply whatever the chosen upstream route did not.
 *
 * Only one faceted route can answer a query on the Arca24 portal, so a request combining
 * filters comes back filtered by one of them. The rest are applied here, over that pool:
 * `keyword` and `location` against the text we carry, `sector` as the free text it is
 * (the search widget sends a typed word, not a code), and `region` by resolving its code
 * to the canton named in the facet's own path.
 *
 * `role_id` is deliberately absent: the list pages expose no role or sector at all, so it
 * cannot be re-checked here. That is exactly why it wins the route in `fetchJobsForQuery`.
 */
async function applyArca24LeftoverFilters(jobs, callerParams = {}, honoured = null) {
  let out = jobs;

  const keyword = normalizeText(callerParams.keyword);
  if (keyword && honoured !== 'keyword') {
    out = out.filter(job => normalizeText(`${job.title} ${job.company?.name || ''}`).includes(keyword));
  }

  const location = normalizeText(callerParams.location);
  if (location) {
    out = out.filter(job => normalizeText(job.location).includes(location));
  }

  const sector = normalizeText(callerParams.sector);
  if (sector) {
    out = out.filter(job => normalizeText(`${job.sector} ${job.role} ${job.title}`).includes(sector));
  }

  if (callerParams.region && honoured !== 'region') {
    // Facet paths read `/it/careers/jobs_by_region/3115-214-svizzera-ticino/` — id,
    // country code, country, then the canton, which is what the location text carries.
    const path = (await fetchArca24FacetIndex('region')).get(String(callerParams.region));
    const canton = path
      ? normalizeText(decodeURIComponent(path).split('/').filter(Boolean).pop().split('-').slice(3).join(' '))
      : '';
    if (canton) out = out.filter(job => normalizeText(job.location).includes(canton));
  }

  return out;
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

    // Which upstream generation is live. The Arca24 portal answers on the same hostname
    // and is detected, not announced — see `_arca24.js`.
    const arca24 = await isArca24Enabled();

    // `global` widens the search beyond Switzerland rather than narrowing it, and every
    // source carries those ads, so it is not a filter. `language`/`country` are defaults.
    const isFiltered = Object.keys(callerParams)
      .some(k => k !== 'language' && k !== 'country' && k !== 'global');

    const pageUrls = pageNumbers.map((pageNumber) => {
      const url = new URL(baseUrl);
      url.searchParams.set('language', callerParams.language || 'it');
      url.searchParams.set('country', callerParams.country || '214');
      Object.entries(callerParams).forEach(([k, v]) => url.searchParams.set(k, v));
      url.searchParams.set('page', pageNumber);
      return url.toString();
    });

    const allJobs = [];
    let honoured = null;

    if (arca24 && isFiltered) {
      // Filtered queries are answered by the portal's faceted routes, not by us.
      const query = await fetchArca24Query(callerParams, { pages: pageNumbers.length, maxJobs });
      if (!query) {
        // The query names a facet the portal does not list, so we cannot answer it.
        // Saying "no matching ads" would be a claim we have not checked.
        console.warn(`Arca24: no faceted route for ${JSON.stringify(callerParams)} — answering empty.`);
        res.status(200).json([]);
        return;
      }
      allJobs.push(...query.jobs);
      honoured = query.honoured;
    } else if (arca24) {
      // The stride in SHOWCASE_PAGE_NUMBERS bought company variety on the old listing.
      // It buys nothing here — every page is the same company — so only the page count
      // carries over, and variety comes from the company pages below.
      allJobs.push(...await fetchArca24Jobs({ pages: pageNumbers.length, maxJobs }));
    } else {
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
      for (let p = 0; p < responses.length; p++) {
        if (!responses[p]) continue;
        const pageJobs = parseJobsFromHtml(responses[p], p * 15);
        for (const job of pageJobs) {
          const key = adKey(job);
          if (!seen.has(key)) {
            seen.add(key);
            allJobs.push(job);
          }
          if (allJobs.length >= maxJobs) break;
        }
        if (allJobs.length >= maxJobs) break;
      }
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
    // `global` is not one of those: it widens the search to ads outside Switzerland
    // rather than narrowing it, and the company pages carry exactly those ads too, so
    // answering it from them is honest. It sat in this list only because it arrives as
    // a caller param — which left `/offerte?global=1`, the URL every home-showcase card
    // links to, as the one page the fallback never covered.
    //
    // On the Arca24 portal the company pages are not a fallback but the only source of
    // variety, and the filtering below is done by us rather than upstream, so a filtered
    // request wants that wider pool too.
    //
    // Not just on zero. A half-recovered listing answering with a handful of ads is worse
    // than one answering with none: the page looks like real data — "three jobs in all of
    // Switzerland" — instead of an obvious outage, and would stay that way indefinitely
    // while the ads sit reachable on the company pages. Whatever the listing did return is
    // kept and merged, never discarded.
    // Volume alone does not mean the listing is well: on 03/08/2026 it came back
    // answering with 120 ads that were all Adecco, which sailed past a count-only check
    // while the rest of the catalogue stayed invisible. The showcase caps each company
    // at two cards, so a single-company pool renders as two cards and the by-language
    // ordering has nothing from Ticino to put first. Variety is part of health.
    const listingCompanies = new Set(allJobs.map(j => j.company?.name)).size;
    const listingHealthy = allJobs.length >= MIN_HEALTHY_JOBS
      && listingCompanies >= MIN_HEALTHY_COMPANIES;

    if (!listingHealthy && !isFiltered) {
      const fromCompanies = await fetchJobsFromCompanyPages(maxJobs);
      // Interleaved, not appended. A monobrand listing can fill `maxJobs` on its own,
      // and appending behind it would push every company-page ad past the limit — the
      // fallback would run, cost its requests, and change nothing.
      const merged = [];
      const known = new Set();
      const depth = Math.max(allJobs.length, fromCompanies.length);
      for (let i = 0; i < depth && merged.length < maxJobs; i++) {
        for (const job of [allJobs[i], fromCompanies[i]]) {
          if (!job || merged.length >= maxJobs) continue;
          const key = adKey(job);
          if (known.has(key)) continue;
          known.add(key);
          merged.push(job);
        }
      }
      const fallbackJobs = merged;
      if (fallbackJobs.length > 0) {
        // Each miss on this path costs one upstream request per company, so the default
        // 5-minute TTL would mean ~420 requests/hour against a partner platform that is
        // already under strain — enough to trip its bot protection, which would also
        // take down `api/companies`. At 40 minutes it is ~53/hour, and ads do not move
        // that fast during an outage.
        //
        // But only pin a result that looks healthy. If some company pages were stubbed
        // and others answered, the run still returns something — just thin, or from a
        // single company, which is the monobrand showcase this code exists to avoid.
        // Caching that for 40 minutes would lock in the bad hour. A weak result is still
        // served, at the short TTL, so the next request can do better.
        const companyCount = new Set(fallbackJobs.map(j => j.company?.name)).size;
        const healthy = fallbackJobs.length >= MIN_HEALTHY_JOBS && companyCount >= MIN_HEALTHY_COMPANIES;
        if (healthy) {
          res.setHeader('Cache-Control', 's-maxage=2400, stale-while-revalidate=1200');
        } else {
          console.warn(`Job fallback returned a weak result (${fallbackJobs.length} ads, ${companyCount} companies) — serving it without the long TTL.`);
        }
        res.status(200).json(fallbackJobs);
        return;
      }
    }

    res.status(200).json(
      arca24 && isFiltered
        ? await applyArca24LeftoverFilters(allJobs, callerParams, honoured)
        : allJobs
    );
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.setHeader('Cache-Control', 'no-store');
    res.status(500).json({ error: 'Failed to fetch jobs data', details: error.message });
  }
}
