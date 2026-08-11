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

const TEMPLATE_PATH = '/index.html';

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
export function renderShell(template, { title, description, canonical, ogImage, jsonLd, body }) {
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
 * Wrapper for the snapshot: real, visible content — never hidden text served only to bots.
 *
 * `links` is rendered as ordinary anchors. On a company page those point at that
 * employer's own ads, which is the only place some of them are linked from at all: the
 * offers list reaches ads through the search feed, so a company's back catalogue was
 * otherwise orphaned.
 */
export function snapshotBody({ heading, subheading, facts, paragraphs, links, linksHeading, backLink }) {
  const rows = (facts || [])
    .filter((f) => f && f.value)
    .map((f) => `<li><strong>${escapeHtml(f.label)}:</strong> ${escapeHtml(f.value)}</li>`)
    .join('');

  const text = (paragraphs || [])
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join('');

  const linkItems = (links || [])
    .filter((l) => l && l.href && l.label)
    .map((l) => `<li><a href="${escapeHtml(l.href)}">${escapeHtml(l.label)}</a>${l.meta ? ` — ${escapeHtml(l.meta)}` : ''}</li>`)
    .join('');

  return [
    '<div style="max-width:900px;margin:0 auto;padding:120px 24px 64px;font-family:Inter,system-ui,sans-serif;color:#050B2B;line-height:1.7">',
    `<h1 style="font-size:32px;font-weight:900;text-transform:uppercase;letter-spacing:-0.02em;line-height:1.1;margin:0 0 12px">${escapeHtml(heading)}</h1>`,
    subheading ? `<p style="font-size:16px;color:#8B8FA8;margin:0 0 20px">${escapeHtml(subheading)}</p>` : '',
    rows ? `<ul style="list-style:none;padding:0;margin:0 0 28px">${rows}</ul>` : '',
    text,
    linkItems && linksHeading ? `<h2 style="font-size:20px;margin:32px 0 12px">${escapeHtml(linksHeading)}</h2>` : '',
    linkItems ? `<ul style="padding-left:18px;margin:0">${linkItems}</ul>` : '',
    backLink ? `<p style="margin-top:32px"><a href="${escapeHtml(backLink.href)}">${escapeHtml(backLink.label)}</a></p>` : '',
    '</div>',
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
