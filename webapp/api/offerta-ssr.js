/**
 * SEO snapshot for /offerta/:id — see api/_ssr.js for why this exists and how the
 * snapshot and the React app coexist.
 *
 * Titles and descriptions mirror the `seo.offerta` strings in src/locales/it.json so the
 * tab does not change text when the app boots. Italian only: this is the shell a crawler
 * and a cold visitor read, and the site's default language is Italian — react-i18next
 * re-renders it in the visitor's language on mount, as it always did.
 */
import {
  siteOrigin,
  loadTemplate,
  renderShell,
  snapshotBody,
  htmlToText,
  clamp,
  serveFallback,
} from './_ssr.js';

// ~2.5s cold against production, well under this; the headroom is for a slow upstream
// rather than a cold lambda. See the note in azienda-ssr.js.
const UPSTREAM_TIMEOUT_MS = 12000;

async function fetchJson(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    return { status: res.status, data: res.ok ? await res.json() : null };
  } catch (_) {
    return { status: null, data: null };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Same rules as buildJobPostingSchema in src/pages/OffertaDettaglio.jsx: a date is only
 * emitted when it is a real ISO day (the jobroom source leaves free Italian text there,
 * and a fabricated date is penalised harder than a missing one), and the Google-favicon
 * fallback logo is never passed off as the employer's own.
 */
const toIsoDate = (value) => (/^\d{4}-\d{2}-\d{2}$/.test(String(value ?? '')) ? value : null);

function formatLocation(loc) {
  return String(loc ?? '')
    .replace(/\b(Svizzera|Switzerland|Suisse|Schweiz)\b/gi, '')
    .replace(/^[,\s]+|[,\s]+$/g, '')
    .replace(/\s*,\s*,/g, ',')
    .trim();
}

/**
 * "CHF 4'500 - 5'200" from details.salaryMin/salaryMax — both are plain numeric strings
 * from the feed (schema.org minValue/maxValue) when the source ad carries them at all,
 * which is the exception rather than the rule. Returns '' (dropped by snapshotBody's
 * empty-value filter) rather than a range with a hole in it when only one bound is present.
 */
function salaryRange(details) {
  const min = String(details?.salaryMin ?? '').trim();
  const max = String(details?.salaryMax ?? '').trim();
  if (min && max) return `CHF ${min} - ${max}`;
  return '';
}

/** The city only — "Ostermundigen, Be" -> "Ostermundigen". See buildOffertaTitle: two ads
 * that share a title and an employer (a staffing agency posting the same generic role in
 * several towns — see the 2026-08-29 Semrush "duplicate title" pair for Adecco's
 * "Kurierfahrer 100% (a)") always land in different towns, not just different cantons, so
 * the city is what actually tells them apart. */
function cityOf(loc) {
  return formatLocation(loc).split(',')[0].trim();
}

// Semrush's own crawl shows the real cutoff is somewhere past 75 chars (a 75-char title
// went unflagged, a 77-char one did not) — consistent with Google truncating by rendered
// pixel width rather than character count, which no plain string length can reproduce
// exactly. MAX is the target every title should hit when there is room; FALLBACK is the
// hard ceiling used only to keep the location clause alive (see below) — both sit well
// clear of the 77-char line the audit actually flagged.
const TITLE_MAX = 60;
const TITLE_FALLBACK_MAX = 72;

/**
 * The old title was `clamp(job.title, 70) + " - {company} - JobCourier"` — up to 70 chars
 * for the job title alone plus a fixed ~20-char suffix, so anything with a mid-length feed
 * title (most ads) sailed past 90 chars. This builds the fullest title that still fits a
 * budget instead, dropping the least essential piece first: the brand suffix, then the
 * employer's name, and only ever clamping the job title itself as a last resort.
 *
 * The location clause is not cosmetic: two ads for the same role from the same agency
 * (see the module comment above) produce byte-identical titles without it — that is
 * Semrush's 2026-08-29 "duplicate title tag" finding, on real postings for different towns.
 * Carrying it costs a wider budget (TITLE_FALLBACK_MAX) rather than the tighter TITLE_MAX,
 * since losing it re-creates the exact duplicate this rewrite exists to fix.
 */
export function buildOffertaTitle(jobTitle, companyRaw, location) {
  const brand = 'JobCourier';
  // company falls back to the literal string 'JobCourier' below when the feed has no
  // employer name (see the handler) — treat that sentinel as "no company" so a title never
  // reads "... - JobCourier, Bern - JobCourier".
  const company = companyRaw && companyRaw !== brand ? companyRaw : '';
  const city = cityOf(location);

  // Fullest first, in both lists: a shorter, less complete candidate is only worth
  // preferring over a fuller one when the fuller one does not fit even the wider budget —
  // otherwise the healthy majority of titles (no overflow, no duplicate) would lose their
  // company name or brand suffix for no reason.
  const withLocation = [
    company && city && `${jobTitle} - ${company}, ${city} - ${brand}`,
    company && city && `${jobTitle} - ${company}, ${city}`,
    city && `${jobTitle}, ${city} - ${brand}`,
    city && `${jobTitle}, ${city}`,
  ].filter(Boolean);

  const withoutLocation = [
    company && `${jobTitle} - ${company} - ${brand}`,
    company && `${jobTitle} - ${company}`,
    `${jobTitle} - ${brand}`,
  ].filter(Boolean);

  // Two full sweeps at the tight budget before ever touching the wide one: a title that
  // already fits under TITLE_MAX keeps its city (the duplicate-title fix) without being
  // pushed out to TITLE_FALLBACK_MAX just because a fuller candidate happens to fit there
  // too. The wide budget exists solely for the titles that need it — long job titles that
  // must keep a city to stay unique (see the module comment above) or that simply run long
  // on their own.
  for (const t of [...withLocation, ...withoutLocation]) {
    if (t.length <= TITLE_MAX) return t;
  }
  for (const t of [...withLocation, ...withoutLocation]) {
    if (t.length <= TITLE_FALLBACK_MAX) return t;
  }
  // Nothing fit, even bare — the job title itself already exceeds the fallback budget.
  return jobTitle.length > TITLE_FALLBACK_MAX
    ? `${jobTitle.slice(0, TITLE_FALLBACK_MAX - 1)}…`
    : jobTitle;
}

function buildJobPosting(job, canonical) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: htmlToText(job.description) || job.title,
    url: canonical,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company?.name || 'JobCourier',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: formatLocation(job.location) || undefined,
        addressCountry: 'CH',
      },
    },
  };

  const logo = job.company?.logo;
  if (logo && /^https?:\/\//i.test(logo) && !logo.includes('google.com/s2/favicons')) {
    schema.hiringOrganization.logo = logo;
  }

  const datePosted = toIsoDate(job.details?.entryDate);
  if (datePosted) schema.datePosted = datePosted;

  const validThrough = toIsoDate(job.details?.validThrough);
  if (validThrough) schema.validThrough = validThrough;

  return schema;
}

export default async function handler(req, res) {
  const origin = siteOrigin(req);
  const id = String(req.query?.id ?? '').trim();

  if (!id) return serveFallback(res, origin, 400);

  let template;
  try {
    template = await loadTemplate(origin);
  } catch (err) {
    console.error('offerta-ssr: template unavailable', err);
    res.setHeader('Cache-Control', 'no-store');
    res.status(500).send('Service temporarily unavailable');
    return;
  }

  const canonical = `https://www.jobcourier.ch/offerta/${encodeURIComponent(id)}`;

  const { status: jobStatus, data: job } = await fetchJson(
    `${origin}/api/job-detail?id=${encodeURIComponent(id)}`
  );

  // job-detail.js said explicitly the ad does not exist (a real 404 from Arca24) — not a
  // feed hiccup, which comes back as 500/timeout and falls through to the shell below.
  if (jobStatus === 404) return serveFallback(res, origin, 404, canonical);

  // Feed is having one of its bad minutes: hand over the plain shell and let the app retry
  // client-side rather than publish a snapshot claiming the ad is gone. The canonical goes
  // with it — this URL is still this URL.
  if (!job || !job.title) return serveFallback(res, origin, 200, canonical);

  // Ad existed and carries a real expiry date in the past: gone on purpose, not missing.
  const expiredThrough = toIsoDate(job.details?.validThrough);
  if (expiredThrough && new Date(expiredThrough) < new Date()) {
    return serveFallback(res, origin, 410, canonical);
  }

  const company = job.company?.name || 'JobCourier';
  const location = job.location || 'Svizzera';
  const bodyText = htmlToText(job.description);

  const title = buildOffertaTitle(job.title, company, job.location);
  const description = clamp(
    bodyText
      ? `${job.title} presso ${company} - ${location}. ${bodyText}`
      : `${job.title} presso ${company} - ${location}. Candidati su JobCourier.`
  );

  const html = renderShell(template, {
    title,
    description,
    canonical,
    ogImage: job.company?.logo,
    jsonLd: buildJobPosting(job, canonical),
    body: snapshotBody({
      heading: job.title,
      subheading: company,
      facts: [
        { label: 'Sede', value: formatLocation(job.location) },
        { label: 'Settore', value: job.sector },
        { label: 'Ruolo', value: job.role },
        { label: 'Impiego', value: job.details?.percentage },
        { label: 'Durata', value: job.details?.duration },
        { label: 'Entrata', value: job.details?.entryDate },
        // Real Arca24 fields the page fetches on every request but, until now, never
        // rendered anywhere — not here, not in OffertaDettaglio.jsx. Both are already
        // filtered out below when empty (most ads carry no salary range), so adding them
        // costs nothing on the ads that don't have the data and adds real, page-specific
        // words on the ones that do.
        { label: 'Scadenza', value: job.details?.validThrough },
        { label: 'Retribuzione', value: salaryRange(job.details) },
      ],
      paragraphs: [bodyText],
      backLink: { href: '/offerte', label: 'Tutte le offerte di lavoro' },
    }),
  });

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1800');
  res.status(200).send(html);
}
