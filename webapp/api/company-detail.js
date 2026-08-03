import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { parseJobsFromHtml } from './jobs.js';
import { isArca24Enabled, fetchCompanyDetail as fetchArca24CompanyDetail } from './_arca24.js';

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
  return !html || html.length < MIN_VALID_LENGTH;
}

export async function warmUpSessionCookies() {
  const warmUpUrl = 'https://jobroom.jobcourier.ch/jobs-by-company.php?lan=it&language=it&source=direct';
  let cookiesStr = '';
  // Bounded: `api/jobs` runs this before its own timed fetches, so an untimed hang here
  // would eat the whole function budget and turn a degrade into a hard platform timeout.
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const response = await fetch(warmUpUrl, { headers: fetchHeaders, signal: ctrl.signal });
    const setCookieHeader = response.headers.get('set-cookie') || '';
    const rawCookies = setCookieHeader.split(/,(?=\s*[a-zA-Z0-9_]+=)/) || [];
    cookiesStr = rawCookies.map(cookie => cookie.trim().split(';')[0]).join('; ');
  } catch (err) {
    console.warn('Session cookie warm-up failed:', err.message);
  } finally {
    clearTimeout(timer);
  }
  return cookiesStr;
}

async function fetchCompanyDetailHtml(id, slug) {
  const cookiesStr = await warmUpSessionCookies();

  const detailUrl = new URL('https://jobroom.jobcourier.ch/employer/view-company.php');
  detailUrl.searchParams.set('id', id);
  detailUrl.searchParams.set('company-name', slug || '');
  detailUrl.searchParams.set('lan', 'it');
  detailUrl.searchParams.set('language', 'it');
  detailUrl.searchParams.set('source', 'direct');

  const headers = { ...fetchHeaders };
  if (cookiesStr) headers['Cookie'] = cookiesStr;

  let html = '';
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(detailUrl.toString(), { headers });
      html = response.ok ? await response.text() : '';
    } catch (_) {
      html = '';
    }
    if (!isStub(html)) return html;
  }
  return html;
}

function parseCompanyDetailFromHtml(html, id, slug) {
  const $ = cheerio.load(html);

  const nameContainer = $('#companyTexts h2[itemprop="name"]').first().clone();
  nameContainer.find('.fb-send').remove();
  const name = nameContainer.text().replace(/\s+/g, ' ').trim();

  const location = $('span[itemprop="addressLocality"]').first().text().replace(/\s+/g, ' ').trim();

  let sector = '';
  $('*').each((i, el) => {
    const $el = $(el);
    const ownText = $el.contents().filter((_, c) => c.type === 'text').text();
    if (/Settore\s*:/.test(ownText)) {
      sector = $el.find('strong').first().text().trim();
      if (sector) return false;
    }
  });

  const brand_title = $('p.employerBrandTitles').first().text().replace(/\s+/g, ' ').trim();
  const brand_description = $('p.band-desc').first().text().replace(/\s+/g, ' ').trim();

  let spontaneous_url = '';
  let website = '';
  const externalAnchor = $('a[href*="externalLinkCompany.php"]').first();
  if (externalAnchor.length > 0) {
    const href = externalAnchor.attr('href') || '';
    try {
      // href is root-relative ("/job/externalLinkCompany.php?..."), so it must resolve
      // against the origin, not against /employer/ — the latter 404s.
      const u = new URL(href, 'https://jobroom.jobcourier.ch/employer/view-company.php');
      spontaneous_url = u.toString();
      const redirect = u.searchParams.get('redirect');
      if (redirect) {
        const target = decodeURIComponent(redirect);
        website = /^https?:\/\//i.test(target) ? target : `https://${target}`;
      }
    } catch (_) {}
  }

  let logo = $('meta[property="og:image"]').attr('content') || '';
  if (!logo) logo = `https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_${id}.jpg`;

  const jobsContainerHtml = $('.searchresults.forViewCompany').first().html() || '';
  const jobs = jobsContainerHtml ? parseJobsFromHtml(jobsContainerHtml) : [];

  const jobroom_url = `https://jobroom.jobcourier.ch/employer/view-company.php?id=${id}&company-name=${slug || ''}&lan=it&language=it`;

  return {
    id,
    name: name || null,
    slug: slug || '',
    logo,
    location: location || '',
    sector: sector || '',
    brand_title: brand_title || '',
    brand_description: brand_description || '',
    website,
    spontaneous_url,
    jobroom_url,
    jobs,
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { id, slug } = req.query || {};

  if (!id || !/^\d+$/.test(String(id))) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(400).json({ error: 'Missing or invalid numeric id parameter' });
    return;
  }

  try {
    if (await isArca24Enabled()) {
      res.status(200).json(await fetchArca24CompanyDetail(String(id), slug || ''));
      return;
    }

    const html = await fetchCompanyDetailHtml(id, slug || '');

    if (isStub(html)) {
      res.setHeader('Cache-Control', 'no-store');
      res.status(502).json({ error: 'Upstream did not return valid company detail content' });
      return;
    }

    const detail = parseCompanyDetailFromHtml(html, id, slug || '');
    res.status(200).json(detail);
  } catch (error) {
    console.error('Error fetching company detail:', error);
    res.setHeader('Cache-Control', 'no-store');
    res.status(500).json({ error: 'Failed to fetch company detail data', details: error.message });
  }
}
