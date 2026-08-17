/**
 * Canonical link for the routes that are pure client-side React, and a full SEO snapshot
 * (title, description, H1, body text, hreflang, JSON-LD) for blog routes specifically.
 *
 * Every SPA route was rewritten straight to the static index.html, which carries no
 * <link rel="canonical"> at all — App.jsx only adds it once the bundle has booted. A
 * crawler that does not execute JavaScript therefore read the same shell, with the same
 * generic title and no canonical, for /, /offerte, /faq, every blog page and so on: that
 * is the site audit's "Duplicate pages without canonical" bucket.
 *
 * Blog routes get more than a canonical: they were still the site audit's largest
 * remaining bucket (H1/meta description/twitter card missing, ~55 URLs each; part of
 * "orphan page" and "missing reciprocal hreflang") because a non-JS crawler read the empty
 * shell for every one of the 56 blog URLs. api/_blog-snapshot.js — built at deploy time by
 * scripts/generate-blog-snapshot.mjs from src/data/blog/* — has that content ready for
 * every article and category page, so no live fetch is needed here (unlike offerta-ssr.js
 * and azienda-ssr.js, which depend on a live, slow upstream).
 *
 * The tags it injects are the same ones main.jsx strips before the first render, so the
 * booted app still ends up with exactly one of each — see the list in main.jsx.
 */
import { siteOrigin, loadTemplate, withCanonical, renderShell, snapshotBody, serveFallback } from './_ssr.js';
import { blogPages } from './_blog-snapshot.js';

// The indexed hostname. Hard-coded for the same reason as in the other SSR handlers:
// preview deployments and the apex must not canonicalise to themselves.
const SITE = 'https://www.jobcourier.ch';

// Routes the app redirects away from on mount. Their canonical is the destination, not
// themselves — /blog renders nothing of its own (App.jsx: <Navigate to="/blog/carriera">).
const ALIASES = { '/blog': '/blog/carriera' };

/**
 * Only a path this site actually routes. Anything else — an absolute URL, a traversal, a
 * stray query string — canonicalises to the home page rather than minting a canonical for
 * a URL that does not exist.
 */
export function canonicalPath(raw) {
  const value = String(raw ?? '').trim();
  if (!value.startsWith('/') || value.startsWith('//')) return '/';
  const path = value.split(/[?#]/)[0];
  if (path.includes('..') || !/^\/[\w\-/]*$/.test(path)) return '/';
  const trimmed = path.replace(/\/+$/, '') || '/';
  return ALIASES[trimmed] || trimmed;
}

export default async function handler(req, res) {
  const origin = siteOrigin(req);
  const path = canonicalPath(req.query?.path);
  // '/' keeps its slash, matching the sitemap and the prerendered home page.
  const canonical = `${SITE}${path}`;

  let template;
  try {
    template = await loadTemplate(origin);
  } catch (err) {
    console.error('shell-ssr: template unavailable', err);
    return serveFallback(res, origin, 500);
  }

  const page = blogPages[path];

  // Not a blog URL, or one this build's snapshot does not recognise (a stale link, a typo)
  // — the plain canonical-only shell, same as before. The client-side 404 handling still
  // runs once the bundle boots.
  if (!page) {
    const html = withCanonical(template, canonical);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.status(200).send(html);
    return;
  }

  const html = renderShell(template, {
    title: page.title,
    description: page.description,
    canonical: page.canonical,
    ogImage: page.ogImage,
    jsonLd: page.jsonLd,
    hreflang: page.hreflang,
    body:
      page.type === 'article'
        ? snapshotBody({
            heading: page.heading,
            subheading: page.subheading,
            paragraphs: page.bodyText.split('\n\n'),
            backLink: { href: page.backHref, label: 'Tutti gli articoli' },
          })
        : snapshotBody({
            heading: page.heading,
            links: page.links,
            linksHeading: 'Articoli',
            backLink: { href: '/blog/carriera', label: 'Torna al blog' },
          }),
  });

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  // Static blog data, rebuilt only on deploy — safe to cache at the edge, unlike the
  // canonical-only branch above which must stay fresh for every other SPA route.
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(html);
}
