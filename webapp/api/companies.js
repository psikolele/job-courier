import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { isArca24Enabled, fetchCompanies as fetchArca24Companies } from './_arca24.js';
import { companies as snapshotCompanies, generatedAt as snapshotAt } from './_companies-snapshot.js';

const LIST_URL = 'https://jobroom.jobcourier.ch/jobs-by-company.php?lan=it&language=it&source=direct';
const MAX_RETRIES = 3;
const MIN_VALID_LENGTH = 2000;

const fetchHeaders = {
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'it-IT,it;q=0.9,en;q=0.7',
  'Cache-Control': 'no-cache',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120',
  'Referer': 'https://jobroom.jobcourier.ch/',
};

function isStub(html) {
  return !html || html.length < MIN_VALID_LENGTH || !html.includes('standardCompanies');
}

// Without this, three retries against a slow-but-alive upstream can hang long enough to
// blow the caller's function budget — `api/jobs` calls this before its own timed fetches.
const REQUEST_TIMEOUT_MS = 6000;

// This URL is fetched by two separate functions — this one on every companies page view,
// and `api/jobs` on every fallback run — with no cache between them. When upstream starts
// stubbing (its bot protection did exactly that to a dev IP under load), each caller would
// answer with three more retries, turning real traffic into a retry storm against the host
// that is already refusing us. So: remember a good result briefly, and remember a refusal
// too, so a blocked window costs one request instead of one per page view.
const LIST_CACHE_MS = 60_000;
const STUB_BACKOFF_MS = 60_000;
let cachedList = { html: '', at: 0 };
let stubbedUntil = 0;

export async function fetchCompanyListHtml() {
  const now = Date.now();
  if (cachedList.html && now - cachedList.at < LIST_CACHE_MS) return cachedList.html;
  if (now < stubbedUntil) return '';

  let html = '';
  let cookiesStr = '';

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
    try {
      const headers = cookiesStr ? { ...fetchHeaders, Cookie: cookiesStr } : fetchHeaders;
      const response = await fetch(LIST_URL, { headers, signal: ctrl.signal });
      html = response.ok ? await response.text() : '';

      // Session cookies from the first (stub) response unlock real content on the retry.
      const setCookieHeader = response.headers.get('set-cookie') || '';
      if (setCookieHeader) {
        const rawCookies = setCookieHeader.split(/,(?=\s*[a-zA-Z0-9_]+=)/) || [];
        cookiesStr = rawCookies.map(cookie => cookie.trim().split(';')[0]).join('; ') || cookiesStr;
      }
    } catch (_) {
      html = '';
    } finally {
      clearTimeout(timer);
    }
    if (!isStub(html)) {
      cachedList = { html, at: Date.now() };
      stubbedUntil = 0;
      return html;
    }
  }
  // Every attempt came back a stub: stop asking for a while.
  stubbedUntil = Date.now() + STUB_BACKOFF_MS;
  return html;
}

export function parseCompaniesFromHtml(html) {
  const $ = cheerio.load(html);
  const companies = [];
  const seenIds = new Set();

  $('.standardCompanies > a[href*="view-company.php"]').each((i, el) => {
    const $a = $(el);
    const href = $a.attr('href') || '';

    let id = null;
    let slug = '';
    try {
      const u = new URL(href, 'https://jobroom.jobcourier.ch/employer/');
      id = u.searchParams.get('id');
      slug = u.searchParams.get('company-name') || '';
    } catch (_) {}

    if (!id || seenIds.has(id)) return;

    const inner = $a.find('.singleStandardCompanyInner');
    const name = inner.find('.descContainer h3').first().text().replace(/\s+/g, ' ').trim();
    if (!name) return;

    let logo = inner.find('.imgContainer img').first().attr('src') || '';
    if (logo && !logo.startsWith('http')) {
      logo = `https://jobroom.jobcourier.ch/${logo.replace(/^\//, '')}`;
    }
    if (!logo) {
      logo = 'https://jobroom.jobcourier.ch/assets/img/genericLogo.jpg';
    }

    const jobsCountText = inner.find('.viewOthers .viewotherNum').first().text().trim();
    const jobs_count = parseInt(jobsCountText, 10) || 0;

    let jobroom_url = href;
    try {
      jobroom_url = new URL(href, 'https://jobroom.jobcourier.ch/employer/').toString();
    } catch (_) {}

    seenIds.add(id);
    companies.push({ id, name, slug, logo, jobs_count, jobroom_url });
  });

  return companies;
}

// The home showcase renders nothing at all when no employer comes back flagged as hiring,
// and a run can end that way without anything being wrong upstream: a cold instance that
// hits the probe deadline reports everyone `null`, and a refused index page plus a failed
// feed read yields an empty roster. Both answers used to be handed to the CDN with the
// normal `s-maxage=300`, so one bad run hid the section for five minutes for every
// visitor — which is what a private window sees, having no browser cache of its own to
// paper over it.
//
// So a degraded answer is never allowed to evict a good one: the last roster that had
// somebody hiring is kept here and served in its place, and whatever we do answer in that
// state is cached for seconds rather than minutes so the next request re-asks.
const LAST_GOOD_TTL_MS = 30 * 60_000;
const DEGRADED_CACHE_HEADER = 's-maxage=30, stale-while-revalidate=600';
let lastGoodHiring = { list: null, at: 0 };

// A good answer stays servable for a day. `s-maxage` alone decides when the CDN goes back
// to the origin; the long `stale-while-revalidate` decides what it does while waiting, and
// the difference is the whole latency problem: with a ten-minute window, a PoP that saw no
// traffic for a quarter of an hour made the next visitor wait out a full cold run. Now it
// answers instantly from what it has and refreshes behind them.
const GOOD_CACHE_HEADER = 's-maxage=1800, stale-while-revalidate=86400';

// How long a cold run is allowed to keep the caller waiting before we answer with the
// stand-in instead. A warm run takes ~2s, so a real answer normally still wins the race.
const FAST_ANSWER_MS = 4000;

// The build-time snapshot is the answer of last resort — used only when this instance has
// no live result yet, and replaced the moment one lands. It is allowed to be days old
// because being a little out of date is the point: it exists precisely for the seconds
// where the truth is not available yet. Past a week, though, "who is hiring" has drifted
// far enough that waiting is more honest than answering.
const SNAPSHOT_MAX_AGE_MS = 7 * 24 * 60 * 60_000;

/**
 * What to answer when the live read is not ready: the newest thing we can stand behind,
 * or `null` if there is nothing worth showing.
 */
function standIn() {
  const now = Date.now();
  if (lastGoodHiring.list && now - lastGoodHiring.at < LAST_GOOD_TTL_MS) return lastGoodHiring.list;
  const snapshotAge = now - Date.parse(snapshotAt);
  if (snapshotCompanies.length > 0 && snapshotAge < SNAPSHOT_MAX_AGE_MS) return snapshotCompanies;
  return null;
}

// Health is variety, not "did anything come back" — the same lesson the job feed taught
// (see 00_Wiki/job-courier/jobroom-feed-resilience.md). When the `jobs_by_company` index
// cannot be read the roster collapses to the handful the job feed names, every one of them
// flagged hiring, because a feed is a list of open positions and so cannot name anybody
// who has none. That answer passes any "is somebody hiring?" test while showing a fraction
// of the showcase, so a floor is applied instead: below it the run is treated as degraded
// and the richer stand-in wins.
//
// Two floors, because either one alone gets a real case wrong:
//
//   - The hiring count is the original test, and it is the one that catches a roster that
//     came back long but stale.
//   - It cannot be the only test, though, because it reads a quiet job market as a broken
//     one. A sound run is 32 employers; how many of them are hiring is genuinely seasonal
//     and has been measured as low as 8. A full roster is therefore sound on its own —
//     reading the index is the thing that can fail here, and feed-only is 4 employers
//     against the index's 32, with nothing in between to be ambiguous about.
const MIN_HEALTHY_HIRING = 8;
const MIN_HEALTHY_ROSTER = 12;

const isHealthy = (list) => {
  const hiring = hiringCount(list);
  return hiring >= MIN_HEALTHY_HIRING || (hiring >= 1 && list.length >= MIN_HEALTHY_ROSTER);
};

const hiringCount = (list) => list.filter((c) => c.has_jobs === true).length;

const PENDING = Symbol('pending');

/** Test seam. */
export function resetLastGoodHiring() { lastGoodHiring = { list: null, at: 0 }; }

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.setHeader('Cache-Control', GOOD_CACHE_HEADER);

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    if (await isArca24Enabled()) {
      // `?withJobs=1` costs one extra profile read per employer (cached for a few minutes
      // upstream), so it is opt-in: only the home showcase needs to know who is hiring.
      const withJobStatus = String(req.query?.withJobs || '') === '1';

      if (!withJobStatus) {
        const roster = await fetchArca24Companies({ withJobStatus: false, verifyLogos: true });
        if (roster.length === 0) res.setHeader('Cache-Control', DEGRADED_CACHE_HEADER);
        res.status(200).json(roster);
        return;
      }

      const work = fetchArca24Companies({ withJobStatus: true, verifyLogos: true })
        .then((result) => {
          if (isHealthy(result)) lastGoodHiring = { list: result, at: Date.now() };
          return result;
        });

      // Racing the live read against a short budget is what keeps a cold instance off the
      // visitor's clock: past it they get the stand-in, and the run they would have waited
      // for carries on behind the response — the invocation stays alive until it lands, so
      // it still fills this instance's caches and `lastGoodHiring` for whoever is next.
      let timer;
      const budget = new Promise((resolve) => { timer = setTimeout(() => resolve(PENDING), FAST_ANSWER_MS); });
      let list;
      try {
        list = await Promise.race([work, budget]);
      } finally {
        clearTimeout(timer);
      }

      if (list === PENDING) {
        const stand = standIn();
        if (stand) {
          res.setHeader('Cache-Control', DEGRADED_CACHE_HEADER);
          res.setHeader('X-Roster-Source', 'stand-in');
          res.status(200).json(stand);
          await work.catch(() => {});
          return;
        }
        // Nothing to stand in with — an empty section is worse than a slow one.
        list = await work;
      }

      if (isHealthy(list)) {
        // Read by scripts/generate-companies-snapshot.mjs, which must never record a
        // stand-in as the new snapshot: doing so would let one stale roster feed the next
        // build's snapshot and the one after that, drifting with nothing to correct it.
        res.setHeader('X-Roster-Source', 'live');
        res.status(200).json(list);
        return;
      }

      // Thin, not necessarily wrong — so whichever of the two shows more employers wins,
      // and it is cached for seconds so the next request can do better.
      res.setHeader('Cache-Control', DEGRADED_CACHE_HEADER);
      res.setHeader('X-Roster-Source', 'stand-in');
      const stand = standIn();
      res.status(200).json(stand && hiringCount(stand) > hiringCount(list) ? stand : list);
      return;
    }

    const html = await fetchCompanyListHtml();

    if (isStub(html)) {
      // Briefly cacheable on purpose: `no-store` meant every visitor during an upstream
      // refusal generated a fresh round of retries against it.
      res.setHeader('Cache-Control', 's-maxage=60');
      res.status(502).json({ error: 'Upstream did not return valid company list content' });
      return;
    }

    const companies = parseCompaniesFromHtml(html);
    companies.sort((a, b) => a.name.localeCompare(b.name, 'it', { sensitivity: 'base' }));

    res.status(200).json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.setHeader('Cache-Control', 'no-store');
    res.status(500).json({ error: 'Failed to fetch companies data', details: error.message });
  }
}
