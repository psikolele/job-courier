/**
 * SEO snapshot rendering for the two routes that are pure feed data: /offerta/:id and
 * /azienda/:slug.
 *
 * Both used to be rewritten straight to the static index.html, which is an empty shell —
 * React fetches the ad or the company profile client-side, after mount. A crawler reads
 * the shell and leaves: that is the whole of the site audit's "low word count",
 * "H1 tag missing", "meta description missing" and "Open Graph tags incomplete" errors,
 * 170 URLs each, and it is why those pages carry zero organic traffic.
 *
 * This is not server-side rendering of the React tree. It fills the shell's <head> and
 * drops the ad's real text into #root, then lets the app boot exactly as before:
 * main.jsx calls createRoot().render(), which REPLACES the container's children — so
 * there is no hydration contract to honour and no mismatch to get wrong. The snapshot is
 * what a crawler (and a visitor on a slow connection) sees until the bundle is parsed.
 *
 * The data comes from this deployment's own /api endpoints over HTTP rather than from
 * their internals. Both handlers keep their legacy-jobroom parsing private to the module
 * and pick between the Arca24 and jobroom sources at request time (see isArca24Enabled),
 * so calling them as endpoints is the only way to reuse that choice — and every parsing
 * rule behind it — without copying any of it here.
 */

// A separate, untouched copy of the built shell — not /index.html. That file now carries
// the home page's own h1/links (scripts/prerender-canonicals.mjs), and renderShell()
// below only replaces an EMPTY #root, so fetching the home page here would silently skip
// the injection and leak the home page's markup into every /offerta and /azienda snapshot.
const TEMPLATE_PATH = '/_template.html';

// Warm invocations reuse the shell instead of re-fetching it. It only changes on deploy,
// and a new deploy gets new lambdas, so there is no stale-template window to worry about.
let cachedTemplate = null;

export function siteOrigin(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  return `${proto}://${host}`;
}

/**
 * The built shell, with its hashed asset tags. Fetched over HTTP because the function
 * bundle does not contain the static build output. `/index.html` is a literal static
 * path — none of the rewrites in vercel.json match it — so this cannot recurse into
 * this same function.
 */
export async function loadTemplate(origin) {
  if (cachedTemplate) return cachedTemplate;

  let lastError = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`${origin}${TEMPLATE_PATH}`);
      if (!res.ok) throw new Error(`template responded ${res.status}`);
      const html = await res.text();
      // A shell without the mount point is not the shell — serving it would ship a page
      // that can never boot the app.
      if (!html.includes('id="root"')) throw new Error('template has no #root');
      cachedTemplate = html;
      return html;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('could not load template');
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Tags out, entities decoded, whitespace collapsed — the plain text of a scraped ad. */
export function htmlToText(html) {
  return String(html ?? '')
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/** Meta descriptions are truncated on a word boundary — a cut mid-word reads as broken. */
export function clamp(text, max = 155) {
  const clean = String(text ?? '').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/**
 * `</script>` inside a JSON string value would close the tag early and let the rest of
 * the value parse as markup. Escaping `<` at the JSON level keeps the value intact and
 * still parses as the same string.
 */
function jsonLdScript(schema) {
  if (!schema) return '';
  const json = JSON.stringify(schema).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}

/**
 * The shell with `canonical` as its one canonical URL — the template's own (the home
 * page's, since the template is index.html) is dropped rather than kept alongside.
 */
export function withCanonical(template, canonical) {
  const stripped = template
    .replace(/\s*<link\s+rel="canonical"[^>]*>/gi, '')
    .replace(/\s*<meta\s+property="og:url"[^>]*>/gi, '');

  // No canonical to give — a 404, say. Better none than the template's, which would
  // point a page that does not exist at the home page.
  if (!canonical) return stripped;

  const url = escapeHtml(canonical);
  return stripped
    .replace(
      '</head>',
      `  <link rel="canonical" href="${url}">\n    <meta property="og:url" content="${url}">\n  </head>`
    );
}

/**
 * Writes the page's identity into the shell.
 *
 * The static Open Graph tags in index.html are REPLACED, not appended to: the app cannot
 * do that (react-helmet-async appends, which is why PageSeo deliberately ships no og
 * tags — see components/PageSeo.jsx), so a per-page og:title has to be set here or not
 * at all. Same for the <title> and the canonical link.
 */
export function renderShell(template, { title, description, canonical, ogImage, jsonLd, body, hreflang }) {
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  const url = escapeHtml(canonical);

  // The template is the built index.html, which is also the home page and therefore
  // carries the home page's canonical (scripts/prerender-canonicals.mjs). It is stripped
  // here and this page's own is injected below, so a snapshot never ships two.
  let html = withCanonical(template, null);

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${t}</title>`);

  html = html
    .replace(
      /<meta\s+property="og:title"[^>]*>/i,
      `<meta property="og:title" content="${t}">`
    )
    .replace(
      /<meta\s+property="og:description"[^>]*>/i,
      `<meta property="og:description" content="${d}">`
    );

  if (ogImage) {
    html = html.replace(
      /<meta\s+property="og:image"[^>]*>/i,
      `<meta property="og:image" content="${escapeHtml(ogImage)}">`
    );
  }

  const head = [
    `<meta name="description" content="${d}">`,
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    ...(Array.isArray(hreflang) ? hreflang : []).map(
      (h) => `<link rel="alternate" hreflang="${escapeHtml(h.lang)}" href="${escapeHtml(h.href)}">`
    ),
    ...(Array.isArray(jsonLd) ? jsonLd : [jsonLd]).map(jsonLdScript),
  ].join('\n    ');

  html = html.replace('</head>', `  ${head}\n  </head>`);

  // createRoot().render() clears these children on mount, so this is a pre-boot snapshot
  // rather than markup React has to agree with.
  html = html.replace(
    /<div id="root">\s*<\/div>/i,
    `<div id="root">${body}</div>`
  );

  return html;
}

/**
 * The destinations Navbar.jsx and Footer.jsx link to from every page, once the bundle has
 * booted. Both components are client-only (react-router-dom hooks, react-i18next,
 * framer-motion, `window`/`document` reads in effects) and are never rendered into any
 * SSR/prerender output — so until this constant existed, a crawler reading raw HTML found
 * these destinations only on whatever page's own snapshot happened to link to them, which
 * for /faq, /contatti, /come-funziona and /soluzioni-e-tariffe was a single link from the
 * home page's own body. That is Semrush's 2026-08-29 "only one internal link pointing to
 * this page" finding (defect 213) across 72 crawled URLs.
 *
 * This is not a server-rendered Navbar/Footer — see snapshotBody's header for why the
 * snapshot is markup, not a hydration-safe render of the React tree. It is the same
 * destinations as plain anchors, appended to every snapshot so a crawler's raw-HTML read of
 * any one page always finds a path to every other section of the site.
 */
const SITE_NAV_LINKS = [
  { href: '/offerte', label: 'Offerte di lavoro' },
  { href: '/aziende-che-assumono', label: 'Aziende che assumono' },
  { href: '/come-funziona', label: 'Come funziona' },
  { href: '/soluzioni-e-tariffe', label: 'Soluzioni e tariffe' },
  { href: '/blog/carriera', label: 'Consigli di carriera' },
  { href: '/blog/recruiting', label: 'Consigli di recruiting' },
  { href: '/faq', label: 'Domande frequenti' },
  { href: '/contatti', label: 'Contatti' },
  { href: '/condizioni-generali', label: 'Condizioni generali' },
  { href: '/cookie-policy', label: 'Cookie policy' },
];

/**
 * Wrapper for the snapshot: the entire page for any client that does not execute the
 * bundle.
 *
 * The outer element carries `data-preboot`, which index.html hides with a rule scoped to
 * `html.js` — a class an inline script in <head> sets. The gate is JavaScript, not the
 * user agent: an agent that runs the script goes on to render the real app and reads that,
 * an agent that does not sees this and nothing else. So this is a no-JS fallback rather
 * than text served only to bots, which is what it would be if the hiding were
 * unconditional. Anything added here must therefore stay something we would be content to
 * show a person, because with JS off that is exactly what happens.
 *
 * `links` is rendered as ordinary anchors. On a company page those point at that
 * employer's own ads, which is the only place some of them are linked from at all: the
 * offers list reaches ads through the search feed, so a company's back catalogue was
 * otherwise orphaned.
 *
 * It is dressed as the site rather than left as raw markup because with JS off a visitor
 * sees it and never gets anything else. Until 18.08.2026 it was an unstyled heading over a
 * bulleted list of URLs on a white page, which read as a broken site; the styling landed
 * then, and the `data-preboot` gate on 18.08.2026 as well, once it turned out that styling
 * the flash was not the same as removing it — the snapshot still painted for a beat ahead
 * of the route loader on every cold load.
 */
export function snapshotBody({ heading, subheading, facts, paragraphs, links, linksHeading, backLink }) {
  const N = '#050B2B';
  const F = '#FF1F7A';
  const MUTED = '#8B8FA8';
  // Webfonts are loaded by the app's own stylesheet and are not necessarily there yet
  // when this paints, so every stack names something the OS already has.
  const SANS = "'Satoshi','Inter',system-ui,-apple-system,'Segoe UI',sans-serif";
  const SERIF = "'Playfair Display',Georgia,'Times New Roman',serif";

  const rows = (facts || [])
    .filter((f) => f && f.value)
    .map((f) => `<li style="display:inline-block;margin:0 8px 8px 0;padding:6px 12px;background:#F4F5F9;border-radius:2px;font-size:13px"><strong style="font-weight:700">${escapeHtml(f.label)}:</strong> ${escapeHtml(f.value)}</li>`)
    .join('');

  const text = (paragraphs || [])
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 14px;color:#2A3050">${escapeHtml(p)}</p>`)
    .join('');

  const siteNavItems = SITE_NAV_LINKS
    .map((l) => `<a href="${escapeHtml(l.href)}" style="color:${MUTED};text-decoration:none;font-size:12px;font-weight:600;white-space:nowrap">${escapeHtml(l.label)}</a>`)
    .join('<span style="color:rgba(5,11,43,0.15)">&nbsp;·&nbsp;</span>');

  const linkItems = (links || [])
    .filter((l) => l && l.href && l.label)
    .map((l) => [
      '<li style="border-bottom:1px solid rgba(5,11,43,0.08)">',
      `<a href="${escapeHtml(l.href)}" style="display:block;padding:12px 0;color:${N};text-decoration:none;font-weight:600">`,
      escapeHtml(l.label),
      l.meta ? `<span style="display:block;margin-top:2px;font-size:13px;font-weight:400;color:${MUTED}">${escapeHtml(l.meta)}</span>` : '',
      '</a></li>',
    ].join(''))
    .join('');

  return [
    `<div data-preboot style="min-height:100vh;background:#FFFFFF;font-family:${SANS};color:${N};line-height:1.6">`,

    // Brand bar: without it the page has no header at all until React arrives, which is
    // most of what made the snapshot look like a stray document rather than JobCourier.
    `<div style="background:${N};padding:18px 24px">`,
    `<div style="max-width:900px;margin:0 auto;display:flex;align-items:center;gap:10px">`,
    `<span style="width:10px;height:10px;background:${F};display:inline-block"></span>`,
    '<span style="color:#FFFFFF;font-weight:800;letter-spacing:-0.01em;font-size:18px">JobCourier</span>',
    '</div></div>',

    '<div style="max-width:900px;margin:0 auto;padding:56px 24px 64px">',

    // The same eyebrow-plus-headline rhythm the real sections use.
    `<div style="display:flex;align-items:center;gap:10px;margin:0 0 10px">`,
    `<span style="width:24px;height:2px;background:${F};display:inline-block"></span>`,
    `<span style="font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${F}">Caricamento</span>`,
    '</div>',

    `<h1 style="font-family:${SERIF};font-style:italic;font-weight:400;font-size:clamp(28px,4vw,40px);line-height:1.15;margin:0 0 12px;color:${N}">${escapeHtml(heading)}</h1>`,
    subheading ? `<p style="font-size:16px;color:${MUTED};margin:0 0 24px">${escapeHtml(subheading)}</p>` : '',
    rows ? `<ul style="list-style:none;padding:0;margin:0 0 28px">${rows}</ul>` : '',
    text,
    linkItems && linksHeading
      ? `<h2 style="font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};margin:36px 0 4px">${escapeHtml(linksHeading)}</h2>`
      : '',
    linkItems ? `<ul style="list-style:none;padding:0;margin:0;border-top:1px solid rgba(5,11,43,0.08)">${linkItems}</ul>` : '',
    backLink ? `<p style="margin-top:32px"><a href="${escapeHtml(backLink.href)}" style="color:${F};font-weight:600;text-decoration:none">${escapeHtml(backLink.label)}</a></p>` : '',

    // Site-wide nav, present on every snapshot regardless of the page-specific links
    // above — see SITE_NAV_LINKS for why this exists.
    `<nav aria-label="JobCourier" style="margin-top:40px;padding-top:20px;border-top:1px solid rgba(5,11,43,0.08);display:flex;flex-wrap:wrap;gap:6px 4px">${siteNavItems}</nav>`,
    '</div></div>',
  ].join('');
}

/**
 * A snapshot that could not be built is served as the plain shell, so the app still boots
 * and fetches the data client-side — exactly the behaviour before this function existed.
 * Never cached: the next crawl should get a chance at a real snapshot.
 *
 * `canonical` is still written into the shell. The upstream feed is slow often enough that
 * a crawl sweeping every ad and company page in a burst lands here on most of them, and a
 * shell without a canonical is a page whose URL is indistinguishable from every other one
 * that fell back — which is exactly the "Duplicate pages without canonical" report. The
 * page's own identity does not depend on the data we failed to read.
 */
export async function serveFallback(res, origin, status = 200, canonical = null) {
  try {
    const template = await loadTemplate(origin);
    const html = withCanonical(template, canonical);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.status(status).send(html);
  } catch (err) {
    console.error('ssr: template unavailable', err);
    res.setHeader('Cache-Control', 'no-store');
    res.status(500).send('Service temporarily unavailable');
  }
}
