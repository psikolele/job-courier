/**
 * SEO snapshot for /azienda/:slug — see api/_ssr.js for why this exists and how the
 * snapshot and the React app coexist.
 *
 * The slug→id resolution mirrors src/pages/AziendaDettaglio.jsx exactly, including the
 * two fallbacks that page relies on: an id match for when the upstream slug changes shape
 * (it did once already, at the Arca24 switchover), and reading a bare numeric url as an
 * employer id, because the company index leaves some employers out of its roster
 * entirely.
 */
import {
  siteOrigin,
  loadTemplate,
  renderShell,
  snapshotBody,
  clamp,
  serveFallback,
} from './_ssr.js';

// Measured against production: /api/companies answers in ~0.3s warm but ~7.6s on a cold
// lambda, and this route waits on it before it can even resolve the slug to an id. At 8s
// the snapshot fell back to the bare shell on exactly the requests that matter — the first
// of a crawl, when nothing is warm. Only direct loads and crawlers reach this function at
// all; in-app navigation is client-side.
const UPSTREAM_TIMEOUT_MS = 12000;

async function fetchJson(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch (_) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  const origin = siteOrigin(req);
  const slug = String(req.query?.slug ?? '').trim();

  if (!slug) return serveFallback(res, origin, 400);

  let template;
  try {
    template = await loadTemplate(origin);
  } catch (err) {
    console.error('azienda-ssr: template unavailable', err);
    res.setHeader('Cache-Control', 'no-store');
    res.status(500).send('Service temporarily unavailable');
    return;
  }

  const list = await fetchJson(`${origin}/api/companies`);
  const match = Array.isArray(list)
    ? list.find((c) => c.slug === slug) || list.find((c) => String(c.id) === slug)
    : null;
  const target = match || (/^\d+$/.test(slug) ? { id: slug, slug: '' } : null);

  // A slug that resolves to no employer is a real 404, and saying so in the status line
  // is the point: the app renders its own "azienda non trovata" view on top, but a
  // crawler that never runs it would otherwise bank a 200 for a page that does not exist.
  if (!target) return serveFallback(res, origin, 404);

  const detail = await fetchJson(
    `${origin}/api/company-detail?id=${encodeURIComponent(target.id)}&slug=${encodeURIComponent(target.slug || '')}`
  );

  // The upstream times out on a single profile often enough that one failed read is not
  // an answer. The app retries client-side; serving the plain shell lets it.
  if (!detail || !detail.name) return serveFallback(res, origin);

  const canonical = `https://www.jobcourier.ch/azienda/${encodeURIComponent(slug)}`;
  const jobs = Array.isArray(detail.jobs) ? detail.jobs : [];

  // Same title the client sets, so the tab does not change text on mount.
  const title = `${detail.name} - Lavora con noi - JobCourier`;
  const description = clamp(
    detail.brand_description
      ? `${detail.name} — ${detail.brand_description}`
      : `Scopri ${detail.name} su JobCourier: sede, settore e opportunità di candidatura.`
  );

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: detail.name,
    url: canonical,
  };
  if (detail.logo && /^https?:\/\//i.test(detail.logo)) organization.logo = detail.logo;
  if (detail.website) organization.sameAs = [detail.website];
  if (detail.location) {
    organization.address = {
      '@type': 'PostalAddress',
      addressLocality: detail.location,
      addressCountry: 'CH',
    };
  }

  const html = renderShell(template, {
    title,
    description,
    canonical,
    ogImage: detail.logo,
    jsonLd: organization,
    body: snapshotBody({
      heading: detail.name,
      subheading: detail.brand_title || 'Lavora con noi',
      facts: [
        { label: 'Sede', value: detail.location },
        { label: 'Settore', value: detail.sector },
      ],
      paragraphs: [detail.brand_description],
      linksHeading: jobs.length ? 'Annunci attivi' : '',
      links: jobs.map((job) => ({
        href: `/offerta/${job.id}`,
        label: job.title,
        meta: [job.location, job.sector, job.role].filter(Boolean).join(' · '),
      })),
      backLink: { href: '/aziende-che-assumono', label: 'Tutte le aziende che assumono' },
    }),
  });

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1800');
  res.status(200).send(html);
}
