/**
 * Adapter for the Arca24 "viso" portal that replaces jobroom.jobcourier.ch.
 *
 * Output shapes are identical to the jobroom parsers in jobs.js / job-detail.js /
 * companies.js / company-detail.js, so switching source needs no front-end change.
 *
 * The hostname is the only thing expected to change at release:
 *   ARCA24_HOST=https://<production-host>
 */
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { sanitizeHtml } from './_sanitize.js';

// Confirmed by Laura on 29.07: production keeps the jobroom.jobcourier.ch hostname and
// only the path structure changes. viso-jobcourier.arca24.careers is the test environment
// — point ARCA24_HOST at it to exercise this adapter before the switchover.
export const ARCA24_HOST = (process.env.ARCA24_HOST || 'https://jobroom.jobcourier.ch').replace(/\/$/, '');

const LANG = 'it';
const PROBE_PATH = `/${LANG}/careers/latest_jobs`;
const PROBE_TTL_MS = 5 * 60 * 1000;
const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=800&auto=format&fit=crop';

// The test environment serves full content with no gate, but production lives on the
// jobroom host, which rejects requests without a Referer. Sending it costs nothing and
// avoids depending on which layer sits in front on release day.
const headers = {
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'it-IT,it;q=0.9,en;q=0.7',
  'Accept-Encoding': 'gzip, deflate',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120',
  'Referer': 'https://jobroom.jobcourier.ch/',
};

let probeCache = { value: null, at: 0 };

/** Test seam — lets the suite exercise detection without waiting out the TTL. */
export function resetSourceProbe() {
  probeCache = { value: null, at: 0 };
}

/**
 * Both portal generations answer on the same hostname, so which one is live can be
 * detected instead of announced. On release day the new paths start responding and the
 * switch happens on its own; no env var, no redeploy.
 *
 * JOBS_SOURCE still forces a source when set — that is the manual rollback.
 */
export async function isArca24Enabled() {
  const forced = process.env.JOBS_SOURCE;
  if (forced === 'arca24') return true;
  if (forced === 'jobroom') return false;

  const now = Date.now();
  if (probeCache.value !== null && now - probeCache.at < PROBE_TTL_MS) return probeCache.value;

  let live = false;
  try {
    let res = await fetch(`${ARCA24_HOST}${PROBE_PATH}`, { method: 'HEAD', headers });
    // Not every stack answers HEAD; a 405 says nothing about whether the page exists.
    if (res.status === 405 || res.status === 501) {
      res = await fetch(`${ARCA24_HOST}${PROBE_PATH}`, { headers });
    }
    live = res.ok;
  } catch {
    live = false;
  }

  probeCache = { value: live, at: now };
  return live;
}

// Reading every company page costs one request each and the portal answers in about a
// second per page, so an untimed straggler can eat the whole function budget. A missing
// page only means fewer ads in the pool, which every caller already tolerates.
const REQUEST_TIMEOUT_MS = 6000;

export async function fetchHtml(path, { acceptNotFound = false, timeoutMs = REQUEST_TIMEOUT_MS, attempts = 1 } = {}) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(`${ARCA24_HOST}${path}`, { headers, signal: ctrl.signal });
      if (!res.ok && !(acceptNotFound && res.status === 404)) {
        throw new Error(`Arca24 responded ${res.status} for ${path}`);
      }
      return await res.text();
    } catch (err) {
      lastErr = err;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr;
}

/** Company links come in two shapes: "profile:id_3244729&company_name=x" and "profile?uiid=3244729". */
export function parseCompanyRef(href = '') {
  const uiid = href.match(/[?&]uiid=(\d+)/);
  if (uiid) return { id: uiid[1], slug: '' };
  const legacy = href.match(/profile:id_(\d+)(?:&company_name=([^&"']*))?/);
  if (legacy) return { id: legacy[1], slug: legacy[2] || '' };
  return { id: null, slug: '' };
}

/**
 * Last resort for ads published without a company profile — anonymous listings, mostly.
 * It used to default to jobcourier.ch's own favicon, which put the JobCourier mark on
 * other employers' ads. Better to return nothing and let the front-end show the name.
 */
function fallbackLogo(companyName = '') {
  const n = companyName.toLowerCase();
  let domain = '';
  if (n.includes('randstad')) domain = 'randstad.ch';
  else if (n.includes('adecco')) domain = 'adecco.ch';
  else if (n.includes('manpower')) domain = 'manpower.ch';
  else if (n.includes('gi group')) domain = 'gigroup.com';
  return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : '';
}

/**
 * The portal serves every employer logo it holds under a path keyed by the company id,
 * redirecting to a presigned S3 object. The list markup cannot be read for it — the
 * `<img>` there carries a base64 placeholder and the real source is set by the portal's
 * own script — but the id is in the company link, so the URL can be built instead.
 *
 * 30 of the 35 employers currently have one; the rest answer 404 and the front-end falls
 * back to the company name. Without this every ad carried the JobCourier favicon, which
 * read as "this ad belongs to JobCourier".
 */
export function companyLogo(id, companyName = '') {
  if (!id) return fallbackLogo(companyName);
  return `${ARCA24_HOST}/custom_visojobcourier/media/logo/logo_company_${id}.jpg`;
}

/**
 * List page: one `.resultstring` per ad. Sector/role are not exposed here — only the
 * detail page carries the JobPosting microdata — so they stay unspecified, matching
 * how the jobroom list parser degrades.
 */
export function parseJobsFromHtml(html, offset = 0) {
  const $ = cheerio.load(html);
  const jobs = [];

  $('.resultstring').each((i, el) => {
    const $el = $(el);

    const $titleLink = $el.find('a[href*="/careers/jobad/"]').first();
    const href = $titleLink.attr('href') || '';
    const title = $titleLink.text().replace(/\s+/g, ' ').trim()
      || $el.find('.md-headline.title').first().text().replace(/\s+/g, ' ').trim();
    if (!title || !href) return;

    const id = (href.match(/\/jobad\/(\d+)/) || [])[1] || null;
    const link = new URL(href, `${ARCA24_HOST}/`).toString();

    const $companyLink = $el.find('a[href*="/careers/company/"]').first();
    const companyName = $companyLink.text().replace(/\s+/g, ' ').trim() || 'Azienda Riservata';
    const companyRef = parseCompanyRef($companyLink.attr('href') || '');

    // First value cell reads "Svizzera, Ticino, Bellinzona, Bellinzona - Randstad Svizzera SA";
    // the company is appended after " - " and has to come off.
    let location = $el.find('.valueCell').first().text().replace(/\s+/g, ' ').trim();
    if (companyName !== 'Azienda Riservata') {
      location = location.replace(new RegExp(`\\s*-\\s*${companyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`), '');
    }
    location = location.replace(/\s*-\s*$/, '').trim() || 'Svizzera';

    const published_at = $el.find('.md-caption.title_heading').first().text().replace(/\s+/g, ' ').trim() || null;

    jobs.push({
      id: id || `job-${offset + i}`,
      jobroom_id: id,
      title,
      link,
      apply_url: link,
      redirect: false,
      external_url: null,
      published_at,
      sector: 'Non specificato',
      role: 'Non specificato',
      company: {
        name: companyName,
        logo: companyLogo(companyRef.id, companyName),
        domain: companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.ch',
        arca24_id: companyRef.id,
        slug: companyRef.slug || slugify(companyName),
      },
      location,
      image: `${PLACEHOLDER_IMG}&sig=${offset + i}`,
    });
  });

  return jobs;
}

export async function fetchJobs({ pages = 3, maxJobs = 45 } = {}) {
  const urls = Array.from({ length: pages }, (_, i) => `/${LANG}/careers/latest_jobs?page=${i + 1}`);
  const htmls = await Promise.all(urls.map(u => fetchHtml(u).catch(() => '')));

  const seen = new Set();
  const all = [];
  htmls.forEach((html, p) => {
    if (!html) return;
    for (const job of parseJobsFromHtml(html, p * 15)) {
      const key = job.jobroom_id || job.title;
      if (seen.has(key)) continue;
      seen.add(key);
      if (all.length < maxJobs) all.push(job);
    }
  });
  await dropMissingLogos(all.map((j) => j.company).filter(Boolean));
  return all;
}

/** Detail page carries full JobPosting microdata — richer than what jobroom exposed. */
export function parseJobDetailFromHtml(html, id) {
  const $ = cheerio.load(html);
  const prop = (name) => {
    const $e = $(`[itemprop="${name}"]`).first();
    return ($e.attr('content') || $e.text() || '').replace(/\s+/g, ' ').trim();
  };

  const title = prop('title') || $('.md-headline.title').first().text().replace(/\s+/g, ' ').trim() || 'Titolo Annuncio';

  const $org = $('[itemprop="hiringOrganization"]').first();
  const companyName = $org.find('[itemprop="name"]').first().text().replace(/\s+/g, ' ').trim()
    || $org.text().replace(/\s+/g, ' ').trim()
    || $('a[href*="/careers/company/"]').first().text().replace(/\s+/g, ' ').trim()
    || 'Azienda Riservata';

  const location = [prop('addressCountry'), prop('addressRegion'), prop('addressLocality')]
    .filter(Boolean).join(', ') || 'Svizzera';

  // The body lives in a leaf .textBlock inside .mainContent — the description microdata
  // is only a one-line summary. Sibling leaves hold the location line and the "other ads
  // from this company" list, so those get filtered out before picking the longest.
  const NOISE = /Altri annunci di lavoro|Annunci di lavoro correlati|Related job searches/i;
  let $body = null;
  let bodyLen = 0;
  $('.mainContent .textBlock').each((i, el) => {
    const $el = $(el);
    if ($el.find('.textBlock').length > 0) return;
    const text = $el.text().replace(/\s+/g, ' ').trim();
    if (!text || NOISE.test(text) || text === location) return;
    if (text.length > bodyLen) { bodyLen = text.length; $body = $el; }
  });

  let description = $body ? $body.html().trim() : '';
  if (!description) description = prop('description');
  if (!description) description = '<p>La descrizione dettagliata per questa offerta di lavoro è consultabile premendo il tasto "Candidati ora".</p>';
  // Attacker-controlled markup: whoever publishes the ad writes it. See _sanitize.js.
  description = sanitizeHtml(description);

  const companyRef = parseCompanyRef($('a[href*="/careers/company/"]').first().attr('href') || '');

  // `itemprop="image"` is the company logo for a normal ad — verified against ads from
  // half a dozen employers, each pointing at that employer's own `logo_company_<id>.jpg`.
  // But when the page carries no company link at all (`companyRef.id` stays null — an ad
  // the portal renders anonymously), the same tag falls back to the site's own social-share
  // cover image, and the code was showing that as if it were the employer's logo: the
  // JobCourier mark, on someone else's ad. That fallback image is excluded on purpose.
  const rawImg = $('[itemprop="image"]').first().attr('content') || $('[itemprop="image"]').first().attr('src') || '';
  const logo = (companyRef.id && rawImg) ? rawImg : companyLogo(companyRef.id, companyName);

  const apply_url = `${ARCA24_HOST}/${LANG}/careers/jobad/${id}`;

  return {
    id,
    title,
    company: { name: companyName, logo, arca24_id: companyRef.id, slug: companyRef.slug || slugify(companyName) },
    location,
    sector: prop('industry') || 'Non specificato',
    role: prop('occupationalCategory') || 'Non specificato',
    details: {
      duration: '',
      percentage: '',
      entryDate: prop('datePosted') || '',
      validThrough: prop('validThrough') || '',
      salaryMin: prop('minValue') || '',
      salaryMax: prop('maxValue') || '',
    },
    description,
    apply_url,
    redirect: false,
    external_url: null,
    original_link: apply_url,
  };
}

export async function fetchJobDetail(id) {
  return parseJobDetailFromHtml(await fetchHtml(`/${LANG}/careers/jobad/${id}`), id);
}

/* ------------------------------------------------------------------ *
 * Filtered search
 *
 * The portal's own search box posts to /viso/viewControllers.php, which stores the
 * criteria server-side and hands back a `uiid`; the results page for that uiid is then
 * rendered entirely in the browser, so there is no HTML for us to read. Unusable.
 *
 * What is usable are the faceted routes the same response advertises — jobs_by_keyword,
 * jobs_by_region, jobs_by_role, jobs_by_sector. They are plain server-rendered pages in
 * the same `.resultstring` markup as the listing, they paginate with `?page=`, and their
 * paths carry the facet's numeric id: `/it/careers/jobs_by_region/3115-214-svizzera-
 * ticino/`. Those ids are the same codes our own dropdowns already send — `region=3115`
 * is Ticino on both sides — so the index is read at runtime and no table is hardcoded.
 * ------------------------------------------------------------------ */

const FACET_TTL_MS = 60 * 60 * 1000;
const facetCache = new Map();

/** "Ristorazione/Hotellerie" -> "ristorazione-hotellerie" */
export function slugify(value) {
  return String(value ?? '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Map of facet id -> path, read from the portal's own index page for that facet. */
export async function fetchFacetIndex(kind) {
  const cached = facetCache.get(kind);
  if (cached && Date.now() - cached.at < FACET_TTL_MS) return cached.map;

  const map = new Map();
  try {
    const $ = cheerio.load(await fetchHtml(`/${LANG}/careers/jobs_by_${kind}`));
    $(`a[href*="/careers/jobs_by_${kind}/"]`).each((_, el) => {
      const href = $(el).attr('href') || '';
      const id = (href.match(/jobs_by_[a-z]+\/(\d+)/) || [])[1];
      if (!id || map.has(id)) return;
      map.set(id, href.startsWith('/') ? href : `/${href}`);
    });
  } catch {
    // An unreadable index means no facet can be resolved; the caller treats that as
    // "cannot honour this filter" rather than as "no matching ads".
  }

  facetCache.set(kind, { map, at: Date.now() });
  return map;
}

async function fetchPagesFrom(path, pages, maxJobs) {
  const sep = path.includes('?') ? '&' : '?';
  const urls = Array.from({ length: pages }, (_, i) => `${path}${sep}page=${i + 1}`);
  const htmls = await Promise.all(urls.map(u => fetchHtml(u).catch(() => '')));

  const seen = new Set();
  const out = [];
  htmls.forEach((html, p) => {
    if (!html) return;
    for (const job of parseJobsFromHtml(html, p * 15)) {
      const key = job.jobroom_id || job.title;
      if (seen.has(key) || out.length >= maxJobs) continue;
      seen.add(key);
      out.push(job);
    }
  });
  return out;
}

/**
 * Answer a filtered query from the faceted routes.
 *
 * One route is chosen, because they cannot be combined upstream. The order is by what
 * cannot be re-checked afterwards: `role_id` first — the list pages carry no role or
 * sector at all, so a role filter has to be the route or it is lost — then `region`,
 * whose slug names the canton and so can also be matched against the location text, then
 * `keyword`, which is plain text and the easiest to apply ourselves.
 *
 * Returns the pool plus which filter the route honoured, so the caller knows what is
 * left to apply. A null result means the query names a facet the portal does not list —
 * that is "we cannot answer this", not "there is nothing".
 */
export async function fetchJobsForQuery(params = {}, { pages = 3, maxJobs = 45 } = {}) {
  const byFacet = async (kind, id) => {
    const path = (await fetchFacetIndex(kind)).get(String(id));
    if (!path) return null;
    return { jobs: await fetchPagesFrom(path, pages, maxJobs), honoured: kind, path };
  };

  if (params.role_id) return byFacet('role', params.role_id);
  if (params.region) return byFacet('region', params.region);

  if (params.keyword) {
    const slug = slugify(params.keyword);
    if (!slug) return null;
    return {
      jobs: await fetchPagesFrom(`/${LANG}/careers/jobs_by_keyword/${slug}`, pages, maxJobs),
      honoured: 'keyword',
      path: `/${LANG}/careers/jobs_by_keyword/${slug}`,
    };
  }

  return null;
}

export function parseCompaniesFromHtml(html) {
  const $ = cheerio.load(html);
  const companies = [];
  const seen = new Set();

  $('.resultstring').each((i, el) => {
    const $el = $(el);
    const $link = $el.find('a[href*="/careers/company/"]').first();
    const { id, slug } = parseCompanyRef($link.attr('href') || '');
    if (!id || seen.has(id)) return;

    const name = $link.text().replace(/\s+/g, ' ').trim()
      || $el.find('.md-headline.title, .titleContainer').first().text().replace(/\s+/g, ' ').trim();
    if (!name) return;

    const jobs_count = parseInt(($el.text().match(/Annunci totali\s*:\s*(\d+)/) || [])[1], 10) || 0;

    seen.add(id);
    companies.push({
      id,
      name,
      // The new portal links employers as `profile?uiid=<id>` and no longer carries a
      // slug, so one is derived from the name. Without it every card linked to
      // `/azienda/` — a path that matches no route and rendered the 404 page.
      slug: slug || slugify(name),
      logo: companyLogo(id, name),
      jobs_count,
      jobroom_url: new URL($link.attr('href') || '', `${ARCA24_HOST}/`).toString(),
    });
  });

  return companies;
}

/**
 * Second, independent source for the roster: the job feed.
 *
 * `jobs_by_company` only lists employers the portal holds a hand-made profile for.
 * Employers whose ads arrive through the RSS feed import are absent from it even though
 * their profile page exists and carries live ads — Manpower, Work Selection AG and
 * Work & Work SA were each missing from the home showcase for exactly that reason, all
 * three answering 200 with ten open positions. Their ads do show up in `latest_jobs`,
 * and every ad links its employer as `profile?uiid=<id>`, so the feed names them.
 *
 * `jobs_count` stays 0 here: the feed proves an employer is present, not how many ads it
 * holds. Where the index knows the same employer its entry wins the union, count included.
 *
 * The whole feed gets read, not the first few pages. It is ordered by publication date, so
 * an employer surfaces wherever its most recent ad happens to fall: measured 2026-08-07 the
 * feed was 42 pages / ~630 ads, and while Manpower showed up on page 3, Work & Work SA did
 * not appear until page 26. A shallow read finds the first and silently loses the second.
 *
 * Pages go out in bounded batches rather than all at once — firing forty-odd requests in
 * one breath is what makes this host start answering with stubs. Batches of
 * FEED_CONCURRENCY covered the full feed in about four seconds. A batch that yields no ads
 * at all ends the walk, so a shorter feed costs proportionally less.
 */
const FEED_MAX_PAGES = 45;
const FEED_CONCURRENCY = 12;

// `fetchCompanies` is not only the showcase's: `api/jobs` calls it to know which company
// pages to fan out over, and does so under a 10s deadline that starts *after* the roster
// is in hand. Reading the whole feed on every one of those would be several seconds of
// pure added latency on the path the home page waits for — and the answer barely moves,
// since a new employer appears in the feed on the order of days. So the walk happens once
// per warm instance per TTL and every caller shares it. An in-flight read is shared too,
// so two concurrent callers cannot both walk 42 pages.
const FEED_ROSTER_TTL_MS = 10 * 60 * 1000;
let feedRosterCache = { value: null, at: 0 };
let feedRosterInFlight = null;

/** Test seam — the suite exercises the walk itself and must not read a warm cache. */
export function resetFeedRosterCache() {
  feedRosterCache = { value: null, at: 0 };
  feedRosterInFlight = null;
}

export async function fetchCompaniesFromJobFeed({ pages = FEED_MAX_PAGES, concurrency = FEED_CONCURRENCY } = {}) {
  const byId = new Map();

  for (let start = 0; start < pages; start += concurrency) {
    const batch = Array.from(
      { length: Math.min(concurrency, pages - start) },
      (_, i) => `/${LANG}/careers/latest_jobs?page=${start + i + 1}`
    );
    const htmls = await Promise.all(batch.map((u) => fetchHtml(u).catch(() => '')));

    let adsInBatch = 0;
    for (const html of htmls) {
      if (!html) continue;
      // parseJobsFromHtml already resolves the company ref through parseCompanyRef and
      // derives name, slug and logo, so reading the ads is also how the employers are read.
      for (const job of parseJobsFromHtml(html)) {
        adsInBatch++;
        const { arca24_id: id, name, slug } = job.company || {};
        // Ads the portal renders anonymously carry no company link at all: no id, and the
        // name reads "Azienda Riservata". There is no employer to name, so they are skipped.
        if (!id || !name || byId.has(id)) continue;
        byId.set(id, {
          id,
          name,
          slug: slug || slugify(name),
          logo: companyLogo(id, name),
          jobs_count: 0,
          jobroom_url: `${ARCA24_HOST}/${LANG}/careers/company/profile?uiid=${id}`,
        });
      }
    }
    if (adsInBatch === 0) break;
  }

  return [...byId.values()];
}

/** `fetchCompaniesFromJobFeed` behind the shared TTL described above. */
function cachedFeedRoster() {
  const now = Date.now();
  if (feedRosterCache.value && now - feedRosterCache.at < FEED_ROSTER_TTL_MS) {
    return Promise.resolve(feedRosterCache.value);
  }
  if (feedRosterInFlight) return feedRosterInFlight;

  feedRosterInFlight = fetchCompaniesFromJobFeed()
    .then((list) => {
      // An empty walk means the portal stubbed us, not that the feed has no employers.
      // Caching that would blank the three feed-only employers for the whole TTL.
      if (list.length > 0) feedRosterCache = { value: list, at: Date.now() };
      return list;
    })
    .finally(() => { feedRosterInFlight = null; });

  return feedRosterInFlight;
}

// The company index is paginated fifteen at a time, and the order is not stable: the
// same company shows up on page 1 and page 4 of consecutive reads. Reading only the
// first page therefore returns a random slice of the roster — which made the company
// list page show fifteen of thirty-three employers, and made keyword search answer
// differently on every request depending on who happened to be in the slice.
// Pages are read until one brings nothing new, with a hard stop so a portal that
// paginates forever cannot spin here.
const COMPANY_INDEX_MAX_PAGES = 8;
// How many index pages go out in parallel before falling back to the one-at-a-time walk.
// Three covers the current roster (2 full pages + the empty one that ends it) in a
// single round-trip instead of three.
const COMPANY_INDEX_LOOKAHEAD = 3;

// One showcase build probes the whole roster, and `api/companies` is hit on every home
// page view, so the same thirty-odd profiles were being read over and over. Same shape as
// `logoCache` below: remember the verdict for a few minutes, keep it out of the cold path.
const HAS_JOBS_TTL_MS = 5 * 60 * 1000;
const hasJobsCache = new Map(); // id -> { value, at }

/** Test seam — lets the suite probe the same id twice without waiting out the TTL. */
export function resetHasJobsCache() {
  hasJobsCache.clear();
}

/**
 * Whether an employer has any open position right now.
 *
 * The company index lists everyone who has a profile, with no count and no way to tell
 * the two apart — which put employers with nothing to offer in the home showcase while
 * Adecco and Gi Group, both hiring, were missing from it.
 *
 * The check used to be a HEAD, reading the status alone: 404 meant "no ads". That is not
 * what the status means. PKB Private Bank answers 404 on a page that lists two real ads,
 * and other employers answer 200 on a profile with nothing on it — the code is about the
 * profile record, not about its contents. So the body is what gets read, and the count of
 * `.resultstring` (one per ad, the same marker the list parser keys on) is the answer.
 *
 * `null` means the request itself failed. Callers keep those: hiding an employer because
 * the portal was briefly slow would be a worse error than showing an empty profile.
 */
async function probeHasJobs(id, attempts = 2) {
  const cached = hasJobsCache.get(id);
  if (cached && Date.now() - cached.at < HAS_JOBS_TTL_MS) return cached.value;

  try {
    // `acceptNotFound` because a 404 body is exactly the case this probe exists to read;
    // `attempts` because a timeout or connection reset is worth one more try.
    const html = await fetchHtml(`/${LANG}/careers/company/profile?uiid=${id}`,
      { acceptNotFound: true, attempts });
    const value = cheerio.load(html)('.resultstring').length > 0;
    hasJobsCache.set(id, { value, at: Date.now() });
    return value;
  } catch {
    // Unknown, not "no ads" — and deliberately not cached, so the next build re-asks.
    return null;
  }
}

/** Probing thirty-odd employers at once is what made the portal start refusing us. */
const PROBE_CONCURRENCY = 6;

async function withHasJobs(companies) {
  const out = [];
  for (let i = 0; i < companies.length; i += PROBE_CONCURRENCY) {
    const batch = companies.slice(i, i + PROBE_CONCURRENCY);
    const flags = await Promise.all(batch.map(c => probeHasJobs(c.id)));
    batch.forEach((c, j) => out.push({ ...c, has_jobs: flags[j] }));
  }
  return out;
}

export async function fetchCompanies({ withJobStatus = false, verifyLogos = false } = {}) {
  const byId = new Map();
  const readPage = (page) =>
    fetchHtml(`/${LANG}/careers/jobs_by_company?page=${page}`)
      .then(parseCompaniesFromHtml)
      .catch(() => null);

  // The index is not the whole roster — see fetchCompaniesFromJobFeed — so the feed goes
  // out at the same time as the index pages and is unioned in below. Started here rather
  // than awaited here so the two reads overlap instead of queueing.
  const feedRoster = cachedFeedRoster().catch(() => []);

  // The roster is two pages of fifteen plus an empty third that proves there is no more,
  // and reading them one after another put three round-trips in front of every showcase
  // build. The first `COMPANY_INDEX_LOOKAHEAD` go out together; the sequential walk only
  // resumes if the roster turns out to be longer than that.
  let page = 1;
  const head = await Promise.all(
    Array.from({ length: COMPANY_INDEX_LOOKAHEAD }, (_, i) => readPage(i + 1))
  );
  let exhausted = false;
  for (const batch of head) {
    page++;
    if (batch === null) { exhausted = true; break; }
    const before = byId.size;
    for (const company of batch) if (!byId.has(company.id)) byId.set(company.id, company);
    if (batch.length === 0 || byId.size === before) { exhausted = true; break; }
  }

  for (; !exhausted && page <= COMPANY_INDEX_MAX_PAGES; page++) {
    const batch = await readPage(page);
    if (batch === null) break;
    const before = byId.size;
    for (const company of batch) if (!byId.has(company.id)) byId.set(company.id, company);
    if (batch.length === 0 || byId.size === before) break;
  }

  // Index entries were inserted first and stay: they carry the real "Annunci totali" count.
  for (const company of await feedRoster) {
    if (!byId.has(company.id)) byId.set(company.id, company);
  }

  const companies = [...byId.values()];
  companies.sort((a, b) => a.name.localeCompare(b.name, 'it', { sensitivity: 'base' }));
  // Opt-in: `api/jobs` reads this roster only to know which company pages to visit and
  // never shows these logos, so the HEAD checks would be pure latency on the path the
  // home showcase waits for.
  if (verifyLogos) await dropMissingLogos(companies);
  return withJobStatus ? withHasJobs(companies) : companies;
}

// Five of the thirty-five employers have no logo stored, so the built URL answers 404.
// The front-end already falls back to the name, but only after the browser has fired the
// request — which is what fills the console with red. Checking here means the missing
// ones are never handed to the client at all. HEAD is cheap, the answer is cached for the
// life of the warm instance, and a failed check keeps the URL (a transient upstream
// hiccup must not strip logos that do exist).
const LOGO_CHECK_TTL_MS = 30 * 60 * 1000;
const logoCache = new Map(); // url -> { ok, at }

async function logoExists(url) {
  const cached = logoCache.get(url);
  if (cached && Date.now() - cached.at < LOGO_CHECK_TTL_MS) return cached.ok;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 3000);
  let ok = true;
  try {
    const res = await fetch(url, { method: 'HEAD', headers, signal: ctrl.signal });
    ok = res.status !== 404;
  } catch {
    ok = true;
  } finally {
    clearTimeout(timer);
  }
  logoCache.set(url, { ok, at: Date.now() });
  return ok;
}

/** Blanks out `logo` on any item whose logo URL answers 404. Mutates and returns `items`. */
export async function dropMissingLogos(items = []) {
  const urls = [...new Set(items.map((it) => it?.logo).filter((u) => u && u.startsWith(ARCA24_HOST)))];
  const verdicts = new Map();
  const CONCURRENCY = 6;
  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    const slice = urls.slice(i, i + CONCURRENCY);
    const results = await Promise.all(slice.map((u) => logoExists(u)));
    slice.forEach((u, j) => verdicts.set(u, results[j]));
  }
  for (const it of items) {
    if (it && it.logo && verdicts.get(it.logo) === false) it.logo = '';
  }
  return items;
}

export function parseCompanyDetailFromHtml(html, id, slug) {
  const $ = cheerio.load(html);

  const heading = $('h1, h2').first().text().replace(/\s+/g, ' ').trim();
  // The count is missing, not zero, when the employer has no open position — so the
  // digits are optional here, or the label itself ends up glued to the company name.
  const name = heading.replace(/Annunci totali\s*:\s*\d*\s*$/, '').trim() || null;

  const jobs = parseJobsFromHtml(html);
  const location = jobs[0]?.location || '';

  return {
    id,
    name,
    slug: slug || slugify(name || ''),
    logo: $('[itemprop="image"]').first().attr('content') || companyLogo(id, name || ''),
    location,
    sector: '',
    brand_title: '',
    brand_description: $('[itemprop="description"]').first().text().replace(/\s+/g, ' ').trim(),
    website: '',
    spontaneous_url: '',
    jobroom_url: `${ARCA24_HOST}/${LANG}/careers/company/profile?uiid=${id}`,
    jobs,
  };
}

export async function fetchCompanyDetail(id, slug, { verifyLogos = false, patient = false, timeoutMs } = {}) {
  // An employer with no open position answers 404 — but with its real profile page in
  // the body, name and all. Treating that as an error turned "no ads right now" into a
  // dead link, which is what the home showcase used to do to three of its fifteen tiles.
  // `patient` is for the company page, where this one read IS the whole response: no
  // partial result to fall back on, so it gets more room and a second try. The showcase
  // fan-out calls this once per company and can afford to lose a straggler, so it keeps
  // the short single-shot budget — 30 companies × 2 patient attempts is a minute.
  const html = await fetchHtml(`/${LANG}/careers/company/profile?uiid=${id}`, {
    acceptNotFound: true,
    timeoutMs: patient ? 9000 : (timeoutMs || REQUEST_TIMEOUT_MS),
    attempts: patient ? 2 : 1,
  });
  const detail = parseCompanyDetailFromHtml(html, id, slug);
  // Opt-in for the same reason as `fetchCompanies`: `api/jobs` calls this once per
  // company to build the showcase pool and shows none of these logos.
  if (verifyLogos) {
    await dropMissingLogos([detail, ...(detail.jobs || []).map((j) => j.company).filter(Boolean)]);
  }
  return detail;
}
