import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const PAGES_TO_FETCH = 3;   // 3 pages × 15 jobs = 45 — faster default load
const MAX_JOBS = 45;
const BATCH_SIZE = 3;       // max concurrent fetches to avoid upstream rate-limit

// Home showcase needs a wider window: the feed is heavily skewed towards one
// language region, so 45 jobs are not enough to fill a language-filtered list.
const SHOWCASE_PAGES = 8;
const SHOWCASE_MAX_JOBS = 120;

// Params we are willing to forward upstream. Everything else (including our own
// `showcase` flag) is dropped instead of being proxied blindly.
const UPSTREAM_PARAMS = new Set([
  'language', 'country', 'keyword', 'location', 'sector', 'role_id', 'region', 'global',
]);

export function parseJobsFromHtml(html, offset = 0) {
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

    const companyName = $el.find('.companyLink span, .company, .firm').first().text().trim() || 'Azienda Riservata';

    let location = '';
    const labelSede = $el.find('.detailsHead label:contains("Sede:")');
    if (labelSede.length > 0) {
      const clone = labelSede.parent().clone();
      clone.find('label').remove();
      location = clone.text().replace(/\s+/g, ' ').trim().replace(/^[,\s-]+/, '').trim();
    }
    if (!location) {
      location = $el.find('.location, .place, .details span:last-child').first().text().trim() || 'Svizzera';
    }

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

  const fetchHeaders = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'it-IT,it;q=0.9,en;q=0.7',
    'Cache-Control': 'no-cache',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120',
    'Referer': 'https://jobroom.jobcourier.ch/',
  };

  try {
    const baseUrl = 'https://jobroom.jobcourier.ch/job/latest-and-all-job-ads.php';
    const singlePage = req.query?.singlePage === '1';
    const showcase = req.query?.showcase === '1';

    let pagesToFetch = PAGES_TO_FETCH;
    let maxJobs = MAX_JOBS;
    if (singlePage) { pagesToFetch = 1; maxJobs = 15; }
    else if (showcase) { pagesToFetch = SHOWCASE_PAGES; maxJobs = SHOWCASE_MAX_JOBS; }

    // Build per-page params, forwarding only whitelisted caller query params
    const callerParams = req.query ? Object.fromEntries(
      Object.entries(req.query).filter(([k]) => UPSTREAM_PARAMS.has(k))
    ) : {};

    const pageUrls = Array.from({ length: pagesToFetch }, (_, idx) => {
      const url = new URL(baseUrl);
      url.searchParams.set('language', callerParams.language || 'it');
      url.searchParams.set('country', callerParams.country || '214');
      Object.entries(callerParams).forEach(([k, v]) => url.searchParams.set(k, v));
      url.searchParams.set('page', idx + 1);
      return url.toString();
    });

    // Batched parallel fetch (BATCH_SIZE concurrent to avoid rate-limiting)
    const responses = [];
    for (let i = 0; i < pageUrls.length; i += BATCH_SIZE) {
      const batch = pageUrls.slice(i, i + BATCH_SIZE).map(url =>
        fetch(url, { headers: fetchHeaders })
          .then(r => r.ok ? r.text() : '')
          .catch(() => '')
      );
      responses.push(...await Promise.all(batch));
      if (responses.filter(Boolean).length >= pagesToFetch) break;
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

    res.status(200).json(allJobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.setHeader('Cache-Control', 'no-store');
    res.status(500).json({ error: 'Failed to fetch jobs data', details: error.message });
  }
}
