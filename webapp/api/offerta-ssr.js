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

  const title = `${job.title} - ${company} - JobCourier`;
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
      ],
      paragraphs: [bodyText],
      backLink: { href: '/offerte', label: 'Tutte le offerte di lavoro' },
    }),
  });

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1800');
  res.status(200).send(html);
}
