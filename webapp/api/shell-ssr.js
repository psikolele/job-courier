/**
 * Canonical link for the routes that are pure client-side React.
 *
 * Every SPA route was rewritten straight to the static index.html, which carries no
 * <link rel="canonical"> at all — App.jsx only adds it once the bundle has booted. A
 * crawler that does not execute JavaScript therefore read the same shell, with the same
 * generic title and no canonical, for /, /offerte, /faq, every blog page and so on: that
 * is the site audit's "Duplicate pages without canonical" bucket.
 *
 * There is nothing to fetch here — a self-referencing canonical is derivable from the
 * requested path alone, which is why this handler takes the path as an explicit `path`
 * query parameter written by the rewrite in vercel.json rather than guessing it from
 * req.url (the rewrite has already replaced that).
 *
 * The tags it injects are the same ones main.jsx strips before the first render, so the
 * booted app still ends up with exactly one of each — see the list in main.jsx.
 */
import { siteOrigin, loadTemplate, withCanonical, serveFallback } from './_ssr.js';

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

  const html = withCanonical(template, canonical);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  // Same reason index.html is no-store in vercel.json: the shell names hashed asset files
  // that only exist in the deployment that built them. A cached copy outliving a deploy
  // asks for a bundle that is gone — a blank page, not a stale one.
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.status(200).send(html);
}
