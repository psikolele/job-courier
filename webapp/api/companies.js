import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

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

async function fetchCompanyListHtml() {
  let html = '';
  let cookiesStr = '';

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const headers = cookiesStr ? { ...fetchHeaders, Cookie: cookiesStr } : fetchHeaders;
      const response = await fetch(LIST_URL, { headers });
      html = response.ok ? await response.text() : '';

      // Session cookies from the first (stub) response unlock real content on the retry.
      const setCookieHeader = response.headers.get('set-cookie') || '';
      if (setCookieHeader) {
        const rawCookies = setCookieHeader.split(/,(?=\s*[a-zA-Z0-9_]+=)/) || [];
        cookiesStr = rawCookies.map(cookie => cookie.trim().split(';')[0]).join('; ') || cookiesStr;
      }
    } catch (_) {
      html = '';
    }
    if (!isStub(html)) return html;
  }
  return html;
}

function parseCompaniesFromHtml(html) {
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
    const html = await fetchCompanyListHtml();

    if (isStub(html)) {
      res.setHeader('Cache-Control', 'no-store');
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
