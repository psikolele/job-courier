import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { isArca24Enabled, fetchCompanies as fetchArca24Companies } from './_arca24.js';

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    if (await isArca24Enabled()) {
      // `?withJobs=1` costs one extra HEAD per employer, so it is opt-in: only the home
      // showcase needs to know who is actually hiring.
      const withJobStatus = String(req.query?.withJobs || '') === '1';
      res.status(200).json(await fetchArca24Companies({ withJobStatus, verifyLogos: true }));
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
