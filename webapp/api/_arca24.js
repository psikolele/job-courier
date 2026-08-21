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
import { names as orphanNames, generatedAt as orphanGeneratedAt } from './_orphan-employers-snapshot.js';

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

/**
 * Company links come in three shapes, all of them still in circulation:
 *   - "profile:id_3244729&company_name=x"          (the old jobroom portal)
 *   - "profile?uiid=3244729"                       (Arca24, still used by the job feed)
 *   - "/it/careers/3243375-tior-sa/profile"        (Arca24, the company index since 08.2026)
 *
 * The third is not a cosmetic change: on 18.08.2026 the `jobs_by_company` index served
 * every employer that way and nothing else did, so the roster read came back empty and the
 * home showcase fell to the single employer the job feed still names in the old shape —
 * one logo under a heading that promises the companies who trust Job Courier. The path
 * form is matched first because it carries the slug the query form dropped.
 */
export function parseCompanyRef(href = '') {
  const path = href.match(/\/careers\/(\d+)-([^/?#]+)\/(?:profile|jobs)/);
  if (path) return { id: path[1], slug: path[2] };
  const uiid = href.match(/[?&]uiid=(\d+)/);
  if (uiid) return { id: uiid[1], slug: '' };
  const legacy = href.match(/profile:id_(\d+)(?:&company_name=([^&"']*))?/);
  if (legacy) return { id: legacy[1], slug: legacy[2] || '' };
  return { id: null, slug: '' };
}

/**
 * Every markup shape parseCompanyRef understands, as a cheerio selector. Kept next to it:
 * a selector that finds fewer link shapes than the parser reads is exactly how the roster
 * emptied out, and the two drifting apart is easy to miss because nothing errors — the
 * page just quietly has no employers on it.
 */
export const COMPANY_LINK_SELECTOR =
  'a[href*="/careers/company/"], a[href*="/profile"], a[href*="profile:id_"]';

/** First link in `$scope` that actually resolves to a company. */
function findCompanyLink($, $scope) {
  const $links = $scope ? $scope.find(COMPANY_LINK_SELECTOR) : $(COMPANY_LINK_SELECTOR);
  let $found = null;
  $links.each((i, el) => {
    if ($found) return;
    if (parseCompanyRef($(el).attr('href') || '').id) $found = $(el);
  });
  return $found;
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

    const $companyLink = findCompanyLink($, $el);
    const companyName = ($companyLink ? $companyLink.text() : '').replace(/\s+/g, ' ').trim() || 'Azienda Riservata';
    const companyRef = parseCompanyRef(($companyLink && $companyLink.attr('href')) || '');

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
    || (findCompanyLink($)?.text() || '').replace(/\s+/g, ' ').trim()
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

  const companyRef = parseCompanyRef(findCompanyLink($)?.attr('href') || '');

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

/**
 * Unlike fetchHtml's other callers, this one needs to tell "the ad does not exist" (a
 * real 404 from Arca24 — job-detail.js turns that into an HTTP 404/410) apart from "the
 * feed is having a bad minute" (timeout/5xx — stays a 500, so offerta-ssr keeps serving
 * the safe 200 shell rather than de-indexing a live ad). fetchHtml's shared contract
 * doesn't carry that distinction, so it is not reused here.
 */
export async function fetchJobDetail(id) {
  const path = `/${LANG}/careers/jobad/${id}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  let res;
  try {
    res = await fetch(`${ARCA24_HOST}${path}`, { headers, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
  if (res.status === 404) {
    const err = new Error(`Arca24 job ${id} not found`);
    err.jobNotFound = true;
    throw err;
  }
  if (!res.ok) throw new Error(`Arca24 responded ${res.status} for ${path}`);
  return parseJobDetailFromHtml(await res.text(), id);
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

/**
 * The company index ships its whole roster in the first response and paginates it in the
 * browser: the "2" and "3" controls are buttons with no href, they only move a hash
 * (`#by-page=2`) and re-slice data that already arrived. Requesting `?page=2` from the
 * server is not what a click does and upstream answers 410 to it — which is how a walk
 * over `?page=N` came to look like an upstream outage on 18.08.2026. It was not: the
 * pages beyond the first were never a server round-trip to begin with.
 *
 * Only 15 employers are rendered into `.resultstring`; the remaining sixteen sit in the
 * page's own JSON payload waiting for a click that, for us, never comes. Reading that
 * payload is how the roster gets to be whole from a single request — measured 31
 * employers against the 15 the markup shows.
 *
 * Scanned as text rather than parsed as JSON: the payload is one deeply nested blob
 * spread over a Vue bootstrap, and the four fields wanted here (id, name, slug, logo)
 * appear together in a shape that has been stable across the portal's rewrites.
 */
function parseCompaniesFromPayload(html) {
  const out = [];
  const seen = new Set();
  const entry = /"subject_id":(\d+),"subject_type":"company"[\s\S]{0,600}?"title":"([^"]+)"/g;

  let m;
  while ((m = entry.exec(html)) !== null) {
    const id = m[1];
    if (seen.has(id)) continue;
    seen.add(id);

    // `&amp;` reaches us doubly encoded — JSON inside HTML — and "S &amp;amp; M beauty"
    // is what the tile would have read.
    const name = decodeEntities(m[2]).replace(/\s+/g, ' ').trim();
    if (!name) continue;

    const path = html.match(new RegExp(`/[a-z]{2}/careers/${id}-([^"'\\ ]+)/profile`));
    out.push({
      id,
      name,
      slug: (path && path[1]) || slugify(name),
      logo: companyLogo(id, name),
      jobs_count: 0,
      jobroom_url: `${ARCA24_HOST}${path ? path[0] : `/${LANG}/careers/company/profile?uiid=${id}`}`,
    });
  }
  return out;
}

/** The handful of entities the portal's titles actually carry. */
function decodeEntities(text) {
  return String(text)
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

export function parseCompaniesFromHtml(html) {
  const $ = cheerio.load(html);
  const companies = [];
  const seen = new Set();

  $('.resultstring').each((i, el) => {
    const $el = $(el);
    const $link = findCompanyLink($, $el);
    const { id, slug } = parseCompanyRef(($link && $link.attr('href')) || '');
    if (!id || seen.has(id)) return;

    const name = ($link ? $link.text() : '').replace(/\s+/g, ' ').trim()
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
      jobroom_url: new URL(($link && $link.attr('href')) || '', `${ARCA24_HOST}/`).toString(),
    });
  });

  // The rendered tiles come first — they carry "Annunci totali", which the payload does
  // not — and the rest of the roster is unioned in behind them.
  for (const company of parseCompaniesFromPayload(html)) {
    if (seen.has(company.id)) continue;
    seen.add(company.id);
    companies.push(company);
  }

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

/**
 * Test seam — lets the suite probe the same id twice without waiting out the TTL.
 *
 * Also rearms the one-shot expiry warning below, so a test that asserts the warning does
 * not depend on whether some earlier test already burned it.
 */
export function resetHasJobsCache() {
  hasJobsCache.clear();
  orphanExpiryWarned = false;
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
    //
    // `company/jobs`, not `company/profile`. The profile page used to render the ad list
    // server-side and stopped: measured 10.08.2026 it answers 200 with the heading
    // "Annunci dell'azienda" and not one `.resultstring` under it for any of the sixteen
    // employers who were hiring that morning — the list now arrives by script. Reading it
    // from here therefore reported nobody hiring at all, which is what collapsed the
    // showcase to the handful the job feed names. `company/jobs` still renders them:
    // Adecco 15, Manpower 4, PKB 1 on the same run that saw zero on every profile.
    const html = await fetchHtml(`/${LANG}/careers/company/jobs?uiid=${id}`,
      { acceptNotFound: true, attempts, timeoutMs: PROBE_TIMEOUT_MS });
    const value = cheerio.load(html)('.resultstring').length > 0;
    hasJobsCache.set(id, { value, at: Date.now() });
    return value;
  } catch {
    // Unknown, not "no ads" — and deliberately not cached, so the next build re-asks.
    return null;
  }
}

// Probing thirty-odd employers at once is what made the portal start refusing us.
//
// Six is not arbitrary and raising it does not help. Measured 07.08.2026: one profile page
// is 200-340 KB and takes ~5s, and six fetched together also take ~5s — but twelve
// together take longer than two rounds of six, and the full roster went from 33s to 47s
// with three employers falling off the end into "unknown". The host throttles past roughly
// this width. What bounds this endpoint is therefore the CDN in front of it, not the
// concurrency here.
const PROBE_CONCURRENCY = 6;

// The shared 6s budget is below what a profile page actually costs, so a probe would time
// out, retry, and spend twelve seconds discovering nothing.
//
// 9s was still not enough from Vercel: the same roster that takes ~30s from a desk takes
// ~57s there, and two employers — Rapelli among them — came back `null` on a timeout and
// so vanished from the showcase. Nothing about them was wrong; the portal was just slower
// than the budget. The function has 120s and the loop has its own deadline, so a probe can
// afford to wait rather than fail and drop an employer that is in fact hiring.
const PROBE_TIMEOUT_MS = 15_000;

// A cold instance probes the whole roster before it can answer, and on 07.08.2026 that
// run took long enough for production to return 504 on `/api/companies?withJobs=1` — the
// ceiling was 60s. `vercel.json` now allows this function 120s and the measured cold run
// is around 45s, so this is the backstop, not the normal path: past it no further batch
// is started and whoever is left is reported unknown, which the showcase renders as fewer
// tiles. Fewer tiles on one cold request beats an error page for it.
const PROBE_DEADLINE_MS = 80_000;

// Same 7 days as the roster snapshot in api/companies.js, for the opposite reason: a stale
// roster shows fewer companies than reality, a stale orphan list marks more of them as
// hiring, bypassing the probe. Past the week it answers for nobody and every company falls
// back to the probe.
const ORPHAN_SNAPSHOT_MAX_AGE_MS = 7 * 24 * 60 * 60_000;

// Warn once per process, not once per company and not once per request. On day 8 every
// orphan employer reverts to a probe that structurally answers false, so the showcase
// quietly loses them all and an operator looking at "the vetrina lost six companies
// again" would otherwise find nothing in the logs. A module-level flag is enough: the
// snapshot's `generatedAt` is a build-time constant, so within one instance the verdict
// can only flip once (fresh → expired) and there is nothing else to key on. Warning per
// request instead would flood a warm instance for the entire week the snapshot stays
// stale, which is exactly how a real signal gets tuned out.
let orphanExpiryWarned = false;

const freshOrphanNames = () => {
  if (Date.now() - Date.parse(orphanGeneratedAt) < ORPHAN_SNAPSHOT_MAX_AGE_MS) return orphanNames;
  if (!orphanExpiryWarned) {
    orphanExpiryWarned = true;
    // `[SNAPSHOT-EXPIRED]` is a stable greppable token, same family as the generator's
    // `[SNAPSHOT-REJECTED]`: whoever searches a log for one should find the other.
    // A missing or malformed `generatedAt` parses to NaN and lands here too — fail
    // closed, which is the safe direction: nobody gets marked hiring without evidence.
    console.warn(
      `[SNAPSHOT-EXPIRED] orphan employers snapshot: generatedAt=${orphanGeneratedAt} oltre i ${ORPHAN_SNAPSHOT_MAX_AGE_MS}ms — nessun datore orfano marcato hiring, tutti tornano alla sonda (che per loro risponde sempre false). Rigenerare con scripts/generate-orphan-employers-snapshot.mjs e committare.`
    );
  }
  return [];
};

/**
 * `known` holds ids already proven to be hiring, so they cost no request. Everyone the
 * job feed named is in it by definition: the feed is a list of open positions, so an
 * employer appearing there has at least the ad that put it there.
 *
 * `knownNames` holds employers the probe structurally cannot see: they have ads online
 * that are not attached to their own Arca24 record, so `company/jobs` shows an empty page
 * and reports them idle. Those ads carry no company id, so the normalized name is the only
 * identifier the two sides share — hence a name match here and an id match above.
 */
export async function withHasJobs(companies, known = new Set(), knownNames = new Set()) {
  // `normalizeCompanyName` discards the legal form, so "Immobiliare Ticino SA" and
  // "Immobiliare Ticino Sagl" share a key — and in Ticino those are frequently two
  // distinct entities of the same group. An orphan ad carries no company id, so there is
  // no second signal to disambiguate with, and a bare key match would put a coin flip in
  // the public showcase. Refused employers just fall through to the probe, as before.
  //
  // THE RULE — do not loosen it. A roster company matches a snapshot name when ALL of:
  //   1. its stripped key is non-empty, and exactly one roster company holds that stripped
  //      key (the roster-vs-roster ambiguity guard), AND
  //   2. some snapshot raw name has the same stripped key, AND
  //   3. the legal forms are COMPATIBLE: the two raw forms are identical, or at least one
  //      of the two carries no legal suffix at all.
  //
  // (3) covers the half (1) cannot. The dangerous arrangement is an orphan ad published by
  // an entity that is NOT on the roster — "Finders SA" — while the roster holds
  // "Finders Sagl", a different legal entity that is genuinely not hiring. Only one roster
  // company holds the key `finders`, so (1) sees no ambiguity and the showcase would
  // advertise the wrong company. Both sides carry a suffix and the suffixes differ:
  // refused. Where one side merely omits the form ("s & m beauty" from an ad vs
  // "s & m beauty sa" on the roster) the match still works — that is the case the feature
  // was built for.
  // Key per company, computed once: it is needed again by `unambiguous` and by the
  // ambiguity sweep below, and it must be the same string in all three.
  const keyOf = new Map(companies.map((c) => [c, normalizeCompanyName(c.name)]));
  const byKey = new Map();
  for (const c of companies) {
    const key = keyOf.get(c);
    if (!key) continue;
    byKey.set(key, byKey.has(key) ? null : c.id);
  }

  // Snapshot names arrive raw (legal form intact); index them by their stripped key.
  const rawNamesByKey = new Map();
  for (const raw of knownNames) {
    const key = stripLegalForm(raw);
    if (!key) continue;
    if (!rawNamesByKey.has(key)) rawNamesByKey.set(key, []);
    rawNamesByKey.get(key).push(raw);
  }

  const unambiguous = (c) => {
    const key = keyOf.get(c);
    if (!key || byKey.get(key) !== c.id) return false;
    const candidates = rawNamesByKey.get(key);
    if (!candidates) return false;
    // Incompatible only when BOTH sides carry a legal form and the two forms differ.
    const form = legalFormOf(normalizeCompanyNameRaw(c.name));
    return candidates.some((n) => {
      const other = legalFormOf(n);
      return !form || !other || form === other;
    });
  };

  // A shared key with an orphan ad behind it means one of these employers is hiring and we
  // cannot tell which. Refusing the match is right; letting the probe's `false` stand
  // afterwards is not, because the probe is structurally blind to orphan ads — that
  // blindness is the entire reason the snapshot exists. So these resolve to `null`
  // ("unknown") instead of asserting "not hiring" about a company we have reason to think
  // might be.
  //
  // No visible difference today: both api/companies.js and src/components/Vetrini.jsx
  // filter on `has_jobs === true`, so `null` and `false` render identically. The point is
  // the data model, not the pixels — the next consumer that wants to tell "we checked and
  // no" from "we could not check" will find the distinction already recorded rather than
  // having to reconstruct it.
  //
  // ONLY key collisions land here. A legal-form refusal (the Finders crossover) does not:
  // there we have a positive reason to believe the ad belongs to a different entity, so
  // the probe's `false` is a real answer about this one and must survive.
  const ambiguousUnknown = new Set(
    companies
      .filter((c) => {
        const key = keyOf.get(c);
        return Boolean(key) && byKey.get(key) === null && rawNamesByKey.has(key);
      })
      .map((c) => c.id)
  );

  const out = [];
  const toProbe = [];
  for (const c of companies) {
    if (known.has(c.id) || unambiguous(c)) out.push({ ...c, has_jobs: true });
    else toProbe.push(c);
  }

  const deadline = Date.now() + PROBE_DEADLINE_MS;
  let i = 0;
  for (; i < toProbe.length; i += PROBE_CONCURRENCY) {
    if (i > 0 && Date.now() > deadline) {
      console.warn(`has_jobs probe stopped at ${i} of ${toProbe.length} companies — deadline reached.`);
      break;
    }
    const batch = toProbe.slice(i, i + PROBE_CONCURRENCY);
    const flags = await Promise.all(batch.map(c => probeHasJobs(c.id)));
    // Only `false` is downgraded: a suppressed company that the probe finds hiring anyway
    // (it has linked ads too) keeps its `true`, and `null` is already unknown.
    batch.forEach((c, j) => out.push({
      ...c,
      has_jobs: flags[j] === false && ambiguousUnknown.has(c.id) ? null : flags[j],
    }));
  }
  for (const c of toProbe.slice(i)) out.push({ ...c, has_jobs: null });

  out.sort((a, b) => a.name.localeCompare(b.name, 'it', { sensitivity: 'base' }));
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
  const fromFeed = new Set();
  for (const company of await feedRoster) {
    fromFeed.add(company.id);
    if (!byId.has(company.id)) byId.set(company.id, company);
  }

  const companies = [...byId.values()];
  companies.sort((a, b) => a.name.localeCompare(b.name, 'it', { sensitivity: 'base' }));

  const withStatus = withJobStatus
    ? await withHasJobs(companies, fromFeed, new Set(freshOrphanNames()))
    : companies;

  // Opt-in: `api/jobs` reads this roster only to know which company pages to visit and
  // never shows these logos, so the HEAD checks would be pure latency on the path the
  // home showcase waits for.
  //
  // Ordered after the probe on purpose. Half the roster has no open position and is never
  // rendered, so checking every logo was checking twice as many as anyone would see —
  // latency spent on the request the home page waits for. Only what can reach the screen
  // is verified.
  if (verifyLogos) {
    await dropMissingLogos(withJobStatus ? withStatus.filter(c => c.has_jobs !== false) : withStatus);
  }
  return withStatus;
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

export const RESERVED_COMPANY = 'Azienda Riservata';

// Both sides of the comparison come from different sources: the company index delivers
// titles double-HTML-encoded (`S &amp;amp; M beauty SA`), the ad's microdata delivers them
// clean. Legal suffixes show up in one source and not the other, so they have to be
// stripped from both or the comparison fails on companies that are the same one.
const COMPANY_SUFFIXES = /\s+(s\.?\s?a\.?|s\.?a\.?g\.?l\.?|s\.?r\.?l\.?|ag|gmbh|sarl|inc|ltd)\.?$/;

const stripLegalForm = (raw) => raw.replace(COMPANY_SUFFIXES, '').trim();

// Answers "does this raw name carry a legal suffix, and which one" with a form canonical
// enough to compare across sources: punctuation and inner spacing are dropped, so
// "x s.a." and "x SA" report the same form `sa`, while `sa` and `sagl` stay distinct.
// `''` means the name carries no legal form at all. Kept next to the regex on purpose —
// the two must move together.
const legalFormOf = (raw) => {
  const m = COMPANY_SUFFIXES.exec(raw);
  return m ? m[1].replace(/[.\s]/g, '') : '';
};

/**
 * Builds a comparison key for an employer name so a name from the company index and the
 * same name from an ad's microdata can be checked for equality.
 *
 * Decodes HTML entities (including the double-encoding the company index emits, and
 * numeric entities such as `&#039;`/`&apos;` for an apostrophe — the form PHP's
 * `htmlspecialchars` produces, which matters for names like `L'Atelier` or `D'Angelo`),
 * lowercases, collapses whitespace, and strips a trailing legal-form suffix
 * (SA, S.A., Sagl, AG, GmbH, Sarl, Inc, Ltd).
 *
 * Lossy on purpose, in two ways a caller must account for:
 * - Legal form is discarded, so "Immobiliare Ticino SA" and "Immobiliare Ticino Sagl"
 *   normalize to the same key even though in Ticino those are frequently two distinct
 *   legal entities of the same group. Stripping the suffix is still necessary because one
 *   source omits it; a caller that needs certainty must disambiguate with a second signal
 *   (id, slug, logo) — or with `normalizeCompanyNameRaw` below, which keeps the legal form
 *   so two candidates sharing a key can at least be checked for compatibility.
 * - `''` means "not comparable, never matches" — returned for empty/missing input and for
 *   `RESERVED_COMPANY` ("Azienda Riservata"), the placeholder used when a listing row
 *   carries no company at all. A caller doing a bare `map.get(normalizeCompanyName(x))`
 *   without guarding the empty-string case would collapse every nameless record onto one
 *   key and produce exactly the false match this helper exists to prevent.
 */
export function normalizeCompanyName(value) {
  return stripLegalForm(normalizeCompanyNameRaw(value));
}

/**
 * Everything `normalizeCompanyName` does EXCEPT stripping the legal form: decodes entities
 * (twice, plus numeric ones), lowercases, collapses whitespace, and returns `''` for
 * empty/missing input and for `RESERVED_COMPANY` — `''` carrying the same
 * "not comparable, never matches" contract as above.
 *
 * It exists because the stripped key alone cannot tell a crossover from a match. An ad
 * published by "Finders SA" — an entity absent from the roster — and a roster entry
 * "Finders Sagl" share the key `finders`, and matching on that key alone would advertise
 * a company that is not hiring on the client's public home page. Keeping the raw form lets
 * the consumer refuse that pair while still accepting the case the feature was built for,
 * where one source simply omits the form ("s & m beauty" vs "s & m beauty sa").
 */
export function normalizeCompanyNameRaw(value) {
  let out = String(value ?? '');
  // Two passes: the index emits `&amp;amp;`, which a single decode only unwinds to `&amp;`.
  for (let i = 0; i < 2; i++) {
    out = out
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#0*(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
  }
  out = out.toLowerCase().replace(/\s+/g, ' ').trim();
  if (!out || out === RESERVED_COMPANY.toLowerCase()) return '';
  return out;
}

/**
 * Names the employer on ads read from that employer's own page.
 *
 * The listing rows on a company page carry no company link and no company in their
 * location cell — verified 10.08.2026, all fifteen rows on every page — so the row parser,
 * which has only the row to go on, falls back to "Azienda Riservata". On the global
 * listing that fallback is right about once in a hundred rows; here it was wrong every
 * single time, because we fetched the page by `uiid` and therefore know exactly whose ads
 * these are. Randstad's "Meccanico DISPONIBILE DA SUBITO" reached the home page labelled
 * anonymous while the ad's own page named Randstad in its header.
 *
 * A name the row did supply always wins: this fills a gap, it does not overwrite.
 */
export function withKnownEmployer(jobs, detail, id) {
  if (!detail?.name || detail.name === RESERVED_COMPANY) return jobs;
  return (jobs || []).map((job) => {
    if (job.company?.name && job.company.name !== RESERVED_COMPANY) return job;
    return {
      ...job,
      company: {
        ...job.company,
        name: detail.name,
        logo: detail.logo || job.company?.logo || '',
        domain: detail.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.ch',
        arca24_id: id,
        slug: detail.slug || job.company?.slug || slugify(detail.name),
      },
    };
  });
}

export async function fetchCompanyDetail(id, slug, { verifyLogos = false, patient = false, timeoutMs } = {}) {
  // An employer with no open position answers 404 — but with its real profile page in
  // the body, name and all. Treating that as an error turned "no ads right now" into a
  // dead link, which is what the home showcase used to do to three of its fifteen tiles.
  // `patient` is for the company page, where this one read IS the whole response: no
  // partial result to fall back on, so it gets more room and a second try. The showcase
  // fan-out calls this once per company and can afford to lose a straggler, so it keeps
  // the short single-shot budget — 30 companies × 2 patient attempts is a minute.
  //
  // Two pages, read together, because upstream split what used to be on one. The profile
  // still carries the employer's identity — the name comes off its first heading — but as
  // of 10.08.2026 it renders its ad list by script, so server-side it shows none. The ads
  // live on `company/jobs`, whose own heading is the label "Annunci attivi dell'azienda"
  // rather than the company, so neither page answers the whole question alone. Parallel,
  // so this still costs one round-trip's worth of waiting.
  const read = (path) => fetchHtml(`/${LANG}/careers/company/${path}?uiid=${id}`, {
    acceptNotFound: true,
    timeoutMs: patient ? 9000 : (timeoutMs || REQUEST_TIMEOUT_MS),
    attempts: patient ? 2 : 1,
  });
  const [html, jobsHtml] = await Promise.all([read('profile'), read('jobs').catch(() => '')]);

  const detail = parseCompanyDetailFromHtml(html, id, slug);
  if (jobsHtml) {
    const fromJobsPage = parseCompanyDetailFromHtml(jobsHtml, id, slug);
    // Only ever adds: a failed or empty jobs page must not blank out a profile that did
    // parse, and the profile's name stays the name whatever the other heading says.
    if (fromJobsPage.jobs.length > 0) {
      detail.jobs = fromJobsPage.jobs;
      detail.location = detail.location || fromJobsPage.location;
    }
  }
  detail.jobs = withKnownEmployer(detail.jobs, detail, id);
  // Opt-in for the same reason as `fetchCompanies`: `api/jobs` calls this once per
  // company to build the showcase pool and shows none of these logos.
  if (verifyLogos) {
    await dropMissingLogos([detail, ...(detail.jobs || []).map((j) => j.company).filter(Boolean)]);
  }
  return detail;
}
