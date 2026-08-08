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

// Measured against production, and the two calls are nothing alike:
//   /api/companies       ~0.3s warm, 7.6s–12s+ cold (it has exceeded 12s in production)
//   /api/company-detail  ~9.3s warm, ~18.4s cold (and 500s on its own internal abort)
//
// company-detail scrapes a profile page the upstream is slow and flaky about — the reason
// AziendaDettaglio.jsx retries it client-side too. A single shared 12s budget timed it out
// on every cold request, so company pages silently served the bare shell, which is most of
// what this function exists to fix.
//
// The cost is latency on a cold miss. Only direct loads and crawlers reach this function
// (in-app navigation is client-side), a successful render is edge-cached for 10 minutes
// with a 30 minute stale-while-revalidate window, and a timeout still falls back to the
// shell rather than failing.
const COMPANIES_TIMEOUT_MS = 20000;
const DETAIL_TIMEOUT_MS = 25000;

async function fetchJson(url, timeoutMs) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
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

  const list = await fetchJson(`${origin}/api/companies`, COMPANIES_TIMEOUT_MS);

  // A roster we could not read — timed out, errored, or came back empty because the feed
  // was having one of its thin moments — is not evidence that the employer is gone. Only
  // a roster we actually read can say that. Answering 404 here instead cost a real company
  // page its status the first time /api/companies ran slow, and a 404 is how a live,
  // indexed page gets dropped from the index.
  const roster = Array.isArray(list) && list.length > 0 ? list : null;
  if (!roster && !/^\d+$/.test(slug)) return serveFallback(res, origin);

  const match = roster
    ? roster.find((c) => c.slug === slug) || roster.find((c) => String(c.id) === slug)
    : null;
  const target = match || (/^\d+$/.test(slug) ? { id: slug, slug: '' } : null);

  // Read the roster, and it does not list this slug: a real 404. The app renders its own
  // "azienda non trovata" view on top, but a crawler that never runs it would otherwise
  // bank a 200 for a page that does not exist.
  if (!target) return serveFallback(res, origin, 404);

  const detail = await fetchJson(
    `${origin}/api/company-detail?id=${encodeURIComponent(target.id)}&slug=${encodeURIComponent(target.slug || '')}`,
    DETAIL_TIMEOUT_MS
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
