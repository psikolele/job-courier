import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { fetchCompanyListHtml, parseCompaniesFromHtml } from './companies.js';
import { warmUpSessionCookies } from './company-detail.js';
import {
  isArca24Enabled,
  fetchJobs as fetchArca24Jobs,
  fetchCompanies as fetchArca24Companies,
  fetchCompanyDetail as fetchArca24CompanyDetail,
  fetchJobDetail as fetchArca24JobDetail,
  fetchJobsForQuery as fetchArca24Query,
  fetchFacetIndex as fetchArca24FacetIndex,
  resolveRegionFacet as resolveArca24Region,
  slugify,
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
  // Ours, not the portal's: the two-letter canton code the search widget already holds.
  // Ads spell the canton either way — "Svizzera, Ticino, Mendrisio" but also "Svizzera,
  // Locarno, Ti" — so matching the name alone drops the ones written with the code.
  'canton',
]);

// Per-page timeout. A single slow upstream page must not drag the whole
// showcase request past the function's time limit; a missing page just means
// fewer jobs in the pool, which the caller already tolerates.
const PAGE_TIMEOUT_MS = 6000;

// Arca24 quirk: a handful of ads carry no company link at all on the results list —
// the row itself has nothing to scrape, not even a name — yet name their employer once
// the ad is opened, in structured data the list never exposes. The list parser falls
// back to "Azienda Riservata" for these, which reads as "this employer chose to stay
// anonymous" when in fact the name is one request away. Rare (about 1 in 120 on the
// live feed) and worth resolving rather than showing a fallback that looks intentional.
// Bounded so a portal that anonymises many ads at once can't turn one page load into
// dozens of extra requests.
const MAX_RESERVED_ENRICH = 6;

export async function enrichReservedCompanies(jobs) {
  const targets = jobs.filter(j => j.company?.name === 'Azienda Riservata').slice(0, MAX_RESERVED_ENRICH);
  if (targets.length === 0) return jobs;

  const details = await Promise.all(
    targets.map(j => fetchArca24JobDetail(j.id).catch(() => null))
  );
  const byId = new Map(targets.map((j, i) => [j.id, details[i]]));

  return jobs.map(job => {
    const detail = byId.get(job.id);
    const realName = detail?.company?.name;
    if (!realName || realName === 'Azienda Riservata') return job;
    return {
      ...job,
      company: {
        ...job.company,
        name: realName,
        logo: detail.company.logo || job.company.logo,
        domain: realName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.ch',
        slug: detail.company.slug || slugify(realName),
        arca24_id: detail.company.arca24_id ?? job.company.arca24_id,
      },
    };
  });
}

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

// `published_at` is scraped free text ("31/07/2026", "15/08/2026 Nuovo!", "14/08/2026
// Urgente!") — always DD/MM/YYYY optionally followed by a badge word, from both the
// sequential listing and each company's own page (both go through parseJobsFromHtml
// in _arca24.js). Undated/unparseable ads sort last rather than being dropped: a
// missing date is not evidence the ad is old.
function publishedAtRank(job) {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(job?.published_at || '');
  if (!m) return -Infinity;
  const [, d, mo, y] = m;
  return Date.UTC(Number(y), Number(mo) - 1, Number(d));
}

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
// ~15s. Pushing it to 20 made the portal time out far more of them than it saved time
// (03-06/08/2026: 25 of 29 aborted at 20, 16 at 8), so the pool cache below carries the
// latency win instead and this stays gentle.
const ARCA24_BATCH_SIZE = 8;

// One request per company against a portal that answers in ~1-2s is the whole cost of
// this endpoint, and on Arca24 nearly every request lands here (see the health check
// below). Nothing upstream caches it, so without this the home showcase paid the full
// fan-out on every cold instance — measured at 26s warm, 65s cold. Ads do not move in
// ten minutes; a stale pool is served rather than re-read.
const POOL_TTL_MS = 10 * 60 * 1000;
// How long a pool stays usable as a fallback after it has gone stale. The portal answers
// this fan-out with timeouts when it is under load — measured 03-06/08/2026, a run that
// normally returns 120 ads across a dozen companies came back with 18 ads from two — and
// a thin refresh must not replace a good pool with a two-company showcase.
const POOL_STALE_MAX_MS = 6 * 60 * 60 * 1000;
let companyPool = { jobs: [], companies: 0, at: 0 };
let poolInFlight = null;

const distinctCompanies = (jobs) => new Set(jobs.map(j => j.company?.name).filter(Boolean)).size;

// Reading the whole roster costs 30s when the portal is slow, and the visitor is waiting
// on it. Past this point no further batch is started: what came back is enough for a
// showcase that shows ten cards from at most two companies each, and the next refresh
// picks up where this one stopped caring. `POOL_MIN_BATCHES` keeps a deadline hit from
// producing a two-company pool.
const POOL_DEADLINE_MS = 10_000;
const POOL_MIN_BATCHES = 2;

async function readCompanyPool() {
  const companies = await fetchArca24Companies();
  if (companies.length === 0) return [];

  const deadline = Date.now() + POOL_DEADLINE_MS;
  const perCompany = [];
  let batches = 0;
  for (let i = 0; i < companies.length; i += ARCA24_BATCH_SIZE) {
    if (batches >= POOL_MIN_BATCHES && Date.now() > deadline) {
      console.warn(`Job pool stopped at ${i} of ${companies.length} companies — deadline reached.`);
      break;
    }
    const batch = companies.slice(i, i + ARCA24_BATCH_SIZE).map(company =>
      // Wider than the shared 6s budget, not narrower: measured 06/08/2026 the portal
      // needs ~5s for a company page under load, and a 4.5s cut-off failed every single
      // one — a fan-out that times out uniformly returns an empty pool, which is worse
      // than a slow one. The global deadline below is what bounds the wait.
      fetchArca24CompanyDetail(company.id, company.slug, { timeoutMs: 8000 })
        .then(detail => detail.jobs || [])
        .catch(() => [])
    );
    perCompany.push(...await Promise.all(batch));
    batches++;
  }
  // Interleaved at full depth, not at `maxJobs`: the cache is shared by callers wanting
  // different slice sizes, so the cut happens on the way out.
  return interleaveByCompany(perCompany, Number.MAX_SAFE_INTEGER);
}

async function fetchArca24CompanyJobs(maxJobs) {
  const fresh = Date.now() - companyPool.at < POOL_TTL_MS;
  if (companyPool.jobs.length > 0 && fresh) return companyPool.jobs.slice(0, maxJobs);

  // Concurrent cold requests share one fan-out instead of each starting their own —
  // otherwise a burst multiplies the load on a portal that is already the bottleneck.
  if (!poolInFlight) {
    poolInFlight = readCompanyPool()
      .then(jobs => {
        const companies = distinctCompanies(jobs);
        const cacheUsable = companyPool.jobs.length > 0
          && Date.now() - companyPool.at < POOL_STALE_MAX_MS;
        // A refresh that comes back thinner than what is held is the portal struggling,
        // not the catalogue shrinking. Keep the richer pool and try again next window.
        if (cacheUsable && companies < companyPool.companies) {
          console.warn(`Job pool refresh degraded (${jobs.length} ads, ${companies} companies) — keeping the cached pool.`);
          return companyPool.jobs;
        }
        if (jobs.length > 0) companyPool = { jobs, companies, at: Date.now() };
        return jobs;
      })
      .catch(() => [])
      .finally(() => { poolInFlight = null; });
  }

  const jobs = await poolInFlight;
  // A failed refresh keeps serving the expired pool: stale ads beat an empty showcase.
  const usable = jobs.length > 0 ? jobs : companyPool.jobs;
  return usable.slice(0, maxJobs);
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
/**
 * True when an ad sits in the named canton.
 *
 * An ad writes its canton either in full ("Svizzera, Ticino, Mendrisio") or as the
 * two-letter code ("Svizzera, Locarno, Ti"), and the second form is not rare — the Ticino
 * HR ads a canton search is supposed to find are nearly all written that way. Matching the
 * name only found the first form and silently dropped the rest.
 *
 * Both forms are matched on whole words, never as bare substrings. A substring test reads
 * plausibly and is wrong in both directions: "ti" appears inside "Bellinzona", and — found
 * by the live sweep of all 26 cantons — "uri" appears inside "zurigo", which handed every
 * Zurich ad to a search for Uri.
 */
export function isInCanton(location, cantonName, cantonCode) {
  const tokens = normalizeText(location).split(' ').filter(Boolean);
  const name = normalizeText(cantonName).split(' ').filter(Boolean);
  const code = normalizeText(cantonCode);

  // The canton name can be more than one word ("basilea citta"), so it matches when its
  // words appear in order and whole, not when its letters appear inside another word.
  if (name.length) {
    for (let i = 0; i + name.length <= tokens.length; i++) {
      if (name.every((word, k) => tokens[i + k] === word)) return true;
    }
  }
  if (code && tokens.includes(code)) return true;
  return false;
}

async function applyArca24LeftoverFilters(jobs, callerParams = {}, honoured = null) {
  let out = jobs;
  // A route can honour more than one filter now (keyword ∩ role), so membership is the
  // question, not equality.
  const wasHonoured = (kind) => (Array.isArray(honoured) ? honoured.includes(kind) : honoured === kind);

  const keyword = normalizeText(callerParams.keyword);
  if (keyword && !wasHonoured('keyword')) {
    out = out.filter(job => normalizeText(`${job.title} ${job.company?.name || ''}`).includes(keyword));
  }

  const sector = normalizeText(callerParams.sector);
  if (sector) {
    out = out.filter(job => normalizeText(`${job.sector} ${job.role} ${job.title}`).includes(sector));
  }

  // Region and location describe the same thing — the canton — and arrive together now,
  // so they are applied as one test instead of two filters that each half-match.
  if (!wasHonoured('region')) {
    let cantonName = normalizeText(callerParams.location);
    if (callerParams.region) {
      // Facet paths read `/it/careers/jobs_by_region/3115-214-svizzera-ticino/` — id,
      // country code, country, then the canton, which is what the location text carries.
      const path = (await fetchArca24FacetIndex('region')).get(String(callerParams.region));
      if (path) {
        cantonName = normalizeText(decodeURIComponent(path).split('/').filter(Boolean).pop().split('-').slice(3).join(' '));
      }
    }
    if (cantonName || callerParams.canton) {
      out = out.filter(job => isInCanton(job.location, cantonName, callerParams.canton));
    }
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

    const allJobs = [];
    let honoured = null;

    if (arca24 && isFiltered) {
      // The caller's canton id is not trusted on its own: the table it comes from had
      // drifted from the portal's own index (`3095` for Argovia is listed nowhere), and
      // most cantons carried no id at all even when the portal lists them. The index
      // decides, and a canton named only in text still gets its route.
      const resolvedRegion = (callerParams.region || callerParams.location)
        ? await resolveArca24Region({ region: callerParams.region, location: callerParams.location })
        : null;
      const queryParams = resolvedRegion ? { ...callerParams, region: resolvedRegion } : callerParams;

      // A filter the route cannot honour is applied afterwards, over the pool the route
      // returned — so the pool has to be deep enough to still hold matches once narrowed.
      // One page of a canton is not much to filter a keyword out of.
      //
      // The keyword ∩ role case needs the depth most: the portal's role facets are thin
      // and loosely tagged (222 "Risorse umane" carried five ads on 03.09.2026, most of
      // them not HR work), so at one page per side the two pools miss each other and an
      // intersection that does exist reads as "nothing matches".
      const narrowsAfterwards = Boolean(
        (queryParams.region || callerParams.canton || callerParams.location) ||
        callerParams.sector ||
        (callerParams.keyword && callerParams.role_id)
      );
      const queryPages = narrowsAfterwards ? Math.max(pageNumbers.length, 3) : pageNumbers.length;
      const queryMaxJobs = narrowsAfterwards ? Math.max(maxJobs, 45) : maxJobs;

      // Filtered queries are answered by the portal's faceted routes, not by us.
      const query = await fetchArca24Query(queryParams, { pages: queryPages, maxJobs: queryMaxJobs });
      if (query) {
        allJobs.push(...query.jobs);
        honoured = query.honoured;
      } else {
        // The portal lists no facet for this query — ten cantons have none, and a role
        // can drop out of the index when nothing is advertised under it. That used to be
        // answered with an empty list, which reads as "no such jobs" when what we mean is
        // "we could not ask". Filtering the recent pool ourselves is a weaker answer than
        // a facet, but it is an honest one and it is not empty when matches exist.
        console.warn(`Arca24: no faceted route for ${JSON.stringify(callerParams)} — filtering the recent pool instead.`);
        allJobs.push(...await fetchArca24Jobs({ pages: Math.max(pageNumbers.length, 3), maxJobs: Math.max(maxJobs, 45) }));
        honoured = null;
      }
    } else if (arca24) {
      // The stride in SHOWCASE_PAGE_NUMBERS bought company variety on the old listing.
      // It buys nothing here — every page is the same company — so only the page count
      // carries over, and variety comes from the company pages below.
      allJobs.push(...await fetchArca24Jobs({ pages: pageNumbers.length, maxJobs }));
    } else {
      // Built here rather than above because this is the only branch that reads them:
      // with Arca24 as the live source, building them for every request bought nothing.
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
      // Collected at full interleave depth, capped only by `known` de-dup — the maxJobs
      // cut happens after sorting below, not here, or a job pushed past position
      // `maxJobs` in interleave order would never get the chance to sort back in front
      // of an older one that happened to land earlier.
      const merged = [];
      const known = new Set();
      const depth = Math.max(allJobs.length, fromCompanies.length);
      for (let i = 0; i < depth; i++) {
        for (const job of [allJobs[i], fromCompanies[i]]) {
          if (!job) continue;
          const key = adKey(job);
          if (known.has(key)) continue;
          known.add(key);
          merged.push(job);
        }
      }
      // Interleaving by company mixes today's sequential-listing ads with older ones
      // still sitting on a company's own page — sort by date so "ultimi annunci" is
      // actually chronological instead of just alternating sources.
      const fallbackJobs = merged
        .sort((a, b) => publishedAtRank(b) - publishedAtRank(a))
        .slice(0, maxJobs);
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
        // On Arca24, this path is not an outage recovery — the comment above the
        // health check explains why: the sequential pages read above are typically a
        // single company, so most requests end up here by design, not as a fallback.
        // `fromCompanies` jobs always carry a real name (each comes off that company's
        // own page), but the sequential `allJobs` interleaved into `merged` can still
        // include the odd anonymous-on-the-list ad, so this is the path that actually
        // needs enriching, not the one below it.
        res.status(200).json(arca24 ? await enrichReservedCompanies(fallbackJobs) : fallbackJobs);
        return;
      }
    }

    const finalJobs = (arca24 && isFiltered
      ? await applyArca24LeftoverFilters(allJobs, callerParams, honoured)
      : allJobs
    ).sort((a, b) => publishedAtRank(b) - publishedAtRank(a));

    res.status(200).json(arca24 ? await enrichReservedCompanies(finalJobs) : finalJobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.setHeader('Cache-Control', 'no-store');
    res.status(500).json({ error: 'Failed to fetch jobs data', details: error.message });
  }
}
