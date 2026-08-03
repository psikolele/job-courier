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

export async function fetchHtml(path) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${ARCA24_HOST}${path}`, { headers, signal: ctrl.signal });
    if (!res.ok) throw new Error(`Arca24 responded ${res.status} for ${path}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

/** Company links come in two shapes: "profile:id_3244729&company_name=x" and "profile?uiid=3244729". */
export function parseCompanyRef(href = '') {
  const uiid = href.match(/[?&]uiid=(\d+)/);
  if (uiid) return { id: uiid[1], slug: '' };
  const legacy = href.match(/profile:id_(\d+)(?:&company_name=([^&"']*))?/);
  if (legacy) return { id: legacy[1], slug: legacy[2] || '' };
  return { id: null, slug: '' };
}

function fallbackLogo(companyName = '') {
  const n = companyName.toLowerCase();
  let domain = 'jobcourier.ch';
  if (n.includes('randstad')) domain = 'randstad.ch';
  else if (n.includes('adecco')) domain = 'adecco.ch';
  else if (n.includes('manpower')) domain = 'manpower.ch';
  else if (n.includes('gi group')) domain = 'gigroup.com';
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
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
        logo: fallbackLogo(companyName),
        domain: companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.ch',
        arca24_id: companyRef.id,
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

  const logo = $('[itemprop="image"]').first().attr('content')
    || $('[itemprop="image"]').first().attr('src')
    || fallbackLogo(companyName);

  const companyRef = parseCompanyRef($('a[href*="/careers/company/"]').first().attr('href') || '');
  const apply_url = `${ARCA24_HOST}/${LANG}/careers/jobad/${id}`;

  return {
    id,
    title,
    company: { name: companyName, logo, arca24_id: companyRef.id },
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
      slug,
      logo: fallbackLogo(name),
      jobs_count,
      jobroom_url: new URL($link.attr('href') || '', `${ARCA24_HOST}/`).toString(),
    });
  });

  return companies;
}

// The company index is paginated fifteen at a time, and the order is not stable: the
// same company shows up on page 1 and page 4 of consecutive reads. Reading only the
// first page therefore returns a random slice of the roster — which made the company
// list page show fifteen of thirty-three employers, and made keyword search answer
// differently on every request depending on who happened to be in the slice.
// Pages are read until one brings nothing new, with a hard stop so a portal that
// paginates forever cannot spin here.
const COMPANY_INDEX_MAX_PAGES = 8;

export async function fetchCompanies() {
  const byId = new Map();
  for (let page = 1; page <= COMPANY_INDEX_MAX_PAGES; page++) {
    let batch = [];
    try {
      batch = parseCompaniesFromHtml(await fetchHtml(`/${LANG}/careers/jobs_by_company?page=${page}`));
    } catch {
      break;
    }
    const before = byId.size;
    for (const company of batch) if (!byId.has(company.id)) byId.set(company.id, company);
    if (batch.length === 0 || byId.size === before) break;
  }

  const companies = [...byId.values()];
  companies.sort((a, b) => a.name.localeCompare(b.name, 'it', { sensitivity: 'base' }));
  return companies;
}

export function parseCompanyDetailFromHtml(html, id, slug) {
  const $ = cheerio.load(html);

  const heading = $('h1, h2').first().text().replace(/\s+/g, ' ').trim();
  const name = heading.replace(/Annunci totali\s*:\s*\d+\s*$/, '').trim() || null;

  const jobs = parseJobsFromHtml(html);
  const location = jobs[0]?.location || '';

  return {
    id,
    name,
    slug: slug || '',
    logo: $('[itemprop="image"]').first().attr('content') || fallbackLogo(name || ''),
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

export async function fetchCompanyDetail(id, slug) {
  const html = await fetchHtml(`/${LANG}/careers/company/profile?uiid=${id}`);
  return parseCompanyDetailFromHtml(html, id, slug);
}
