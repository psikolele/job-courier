// Writes one copy of the built shell per fixed route, each carrying its own
// <link rel="canonical">. Runs after vite build.
//
// index.html has no canonical: App.jsx only adds one once the bundle has booted, so every
// route that was rewritten to the shell served a crawler the same head — same title, no
// canonical. That is the site audit's "Duplicate pages without canonical" bucket, and no
// amount of client-side Helmet fixes it for a crawler that does not run JavaScript.
//
// These are plain static files rather than a function on purpose: the home page must not
// gain a lambda (and a cold start, and a way to fail) to gain a link tag. The blog routes
// are the exception — their paths are dynamic, so api/shell-ssr.js handles those.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { escapeHtml, snapshotBody, withCanonical } from '../api/_ssr.js';
import { jobs as jobsSnapshot } from '../api/_jobs-snapshot.js';
import { companies as companiesSnapshot } from '../api/_companies-snapshot.js';
import {
  ROUTE_LANGS,
  DEFAULT_LANG,
  distinctPathsFor,
  alternatesFor,
  routeSegmentFor,
  ROUTE_SEGMENTS,
} from '../src/data/routeSegments.js';
import { translatePath } from '../src/utils/langFromPath.js';

const SITE = 'https://www.jobcourier.ch';

// Copy comes from the locale files rather than being restated here: the translations
// already exist (that was never the gap), and a second copy of every title would drift
// from the one the app renders. Read as JSON rather than imported so this script still
// has no dependency on the i18n runtime.
const locale = Object.fromEntries(
  ROUTE_LANGS.map((lang) => [
    lang,
    JSON.parse(readFileSync(new URL(`../src/locales/${lang}.json`, import.meta.url), 'utf8')),
  ])
);

// Where each localized route's title and description live in a locale file. `aziende` is
// the odd one out: its page predates the seo.* block and keeps its copy under
// companies_list, which is also what AziendeCheAssumono.jsx renders.
const COPY = {
  offerte: (l) => ({ title: l.seo.offerte.title, description: l.seo.offerte.description }),
  aziende: (l) => ({ title: l.companies_list.meta_title, description: l.companies_list.intro }),
  pricing: (l) => ({ title: l.seo.pricing.title, description: l.seo.pricing.description }),
  comeFunziona: (l) => ({ title: l.seo.come_funziona.title, description: l.seo.come_funziona.description }),
  contatti: (l) => ({ title: l.seo.contatti.title, description: l.seo.contatti.description }),
  faq: (l) => ({ title: l.seo.faq.title, description: l.seo.faq.description }),
};

/**
 * The reciprocal hreflang set for a route, as tags.
 *
 * Every localized URL needs these, the Italian one included: hreflang only works when
 * each page points at all the others *and* at itself. Without the self-reference — and
 * without the Italian page pointing back — the set is one-directional and search engines
 * discard it, which is the "missing reciprocal hreflang" the audit reports.
 */
function hreflangTags(routeId) {
  return alternatesFor(routeId)
    .map(({ lang, path }) => `    <link rel="alternate" hreflang="${lang}" href="${SITE}${path}">`)
    .join('\n');
}

/**
 * Inserts the hreflang set before </head>, replacing any already there so the script stays
 * idempotent over a dist it has already written (same reason withCanonical strips first).
 */
function withHreflang(html, routeId) {
  const stripped = html.replace(/\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*">/g, '');
  return stripped.replace('</head>', `${hreflangTags(routeId)}\n  </head>`);
}

// Must stay in step with the non-blog rewrites in vercel.json: a route listed there and
// missing here goes back to serving a shell with no canonical.
//
// The home page writes into index.html itself: Vercel serves that file for "/" straight
// off the filesystem, before any rewrite runs, so "/" cannot be pointed at a copy. A
// pristine copy is saved as dist/_template.html before index.html is touched — that copy,
// not index.html, is what api/_ssr.js fetches as the template for /offerta and /azienda
// snapshots, so the home page's own h1/links never leak into those.
const ROUTES = {
  '/': 'index.html',
  '/offerte': 'offerte.html',
  '/aziende-che-assumono': 'aziende-che-assumono.html',
  '/soluzioni-e-tariffe': 'soluzioni-e-tariffe.html',
  '/come-funziona': 'come-funziona.html',
  '/contatti': 'contatti.html',
  '/faq': 'faq.html',
  '/condizioni-generali': 'condizioni-generali.html',
  '/cookie-policy': 'cookie-policy.html',
};

const distFile = (name) => fileURLToPath(new URL(`../dist/${name}`, import.meta.url));
const shell = readFileSync(distFile('index.html'), 'utf8');

if (!shell.includes('</head>')) throw new Error('prerender: built shell has no </head>');

// index.html is both the input read above and one of the outputs written below — it ends
// the run carrying the home page's own body. Running this script twice over the same dist
// would therefore stamp the home page's markup into every other route's snapshot, silently:
// the pages still build, they just all say "Il portale svizzero per il lavoro". `npm run
// build` always runs vite first, so a shell whose #root is not empty means this ran on a
// stale dist, and failing is better than shipping that.
if (!/<div id="root">\s*<\/div>/i.test(shell)) {
  throw new Error('prerender: dist/index.html already has a rendered body — run vite build first');
}

// api/_ssr.js fetches this pristine copy — with its #root still empty — to build the
// /offerta and /azienda snapshots. It has to be written before index.html gets the home
// page's own h1/links below, or every snapshot would inherit the home page's markup too.
writeFileSync(distFile('_template.html'), shell);

const NON_SPECIFICATO = 'Non specificato';

/**
 * Unique, non-empty values of `key` across the jobs snapshot, in first-seen order and
 * capped — this feeds the hub's facet links, not a filter UI, so a few dozen is plenty
 * and keeps offerte.html from ballooning with one link per distinct string on the feed.
 */
function uniqueJobField(key, max = 30) {
  const seen = new Set();
  const out = [];
  for (const job of jobsSnapshot) {
    const value = job[key];
    if (!value || value === NON_SPECIFICATO || seen.has(value)) continue;
    seen.add(value);
    out.push(value);
    if (out.length >= max) break;
  }
  return out;
}

/**
 * Title + meta description for the six static routes that, until now, only got a
 * canonical from this script — the audit's "duplicate titles pre-render" finding: every
 * one of them shipped the home page's fallback `<title>` because nothing overwrote it.
 * Values mirror src/locales/it.json's `seo.*` block (same convention as api/offerta-ssr.js
 * and the HUB_CONTENT titles below) — kept here rather than imported so this script has
 * no runtime dependency on the i18n bundle.
 */
const STATIC_META = {
  '/soluzioni-e-tariffe': {
    title: 'Soluzioni e tariffe per le aziende - JobCourier',
    description: 'Pubblica i tuoi annunci e trova candidati in Svizzera: piani, tariffe e servizi JobCourier per aziende e agenzie.',
  },
  '/come-funziona': {
    title: 'Come funziona - JobCourier',
    description: "Come funziona JobCourier per candidati e aziende: dalla ricerca dell'offerta alla candidatura, passo per passo.",
  },
  '/contatti': {
    title: 'Contatti - JobCourier',
    description: 'Scrivici per informazioni su pubblicazione annunci, candidature e collaborazioni. Il team JobCourier ti risponde.',
  },
  '/faq': {
    title: 'Domande frequenti - JobCourier',
    description: 'Le risposte alle domande più frequenti di candidati e aziende su JobCourier.',
  },
  '/condizioni-generali': {
    title: 'Condizioni generali - JobCourier',
    description: 'Condizioni generali di utilizzo del portale JobCourier.',
  },
  '/cookie-policy': {
    title: 'Cookie Policy - JobCourier',
    description: 'Come JobCourier utilizza i cookie e come gestire le tue preferenze.',
  },
};

/**
 * Static markup for the two hubs that were pure shells: their whole purpose in the site
 * audit is to give a crawler <a href> toward every job ad / company profile, so the body
 * here IS the fix — see the file header for why sitemap-jobs.xml alone could not do this.
 */
const HUB_CONTENT = {
  '/': {
    // index.html already ships the right static <title>/og tags — only the body (empty
    // until React boots) needs a real h1 and real links for a crawler.
    body: () => snapshotBody({
      heading: 'JobCourier - Il portale svizzero per il lavoro',
      subheading: `${jobsSnapshot.length} offerte attive e ${companiesSnapshot.length} aziende che assumono in Svizzera.`,
      links: [
        { href: '/offerte', label: 'Vedi tutte le offerte' },
        { href: '/aziende-che-assumono', label: 'Aziende che assumono' },
        { href: '/soluzioni-e-tariffe', label: 'Soluzioni e tariffe per aziende' },
        { href: '/come-funziona', label: 'Come funziona' },
        { href: '/faq', label: 'Domande frequenti' },
        { href: '/contatti', label: 'Contatti' },
        ...jobsSnapshot.slice(0, 20).map((job) => ({
          href: `/offerta/${job.id}`,
          label: job.title,
          meta: [job.company, job.location].filter(Boolean).join(', '),
        })),
      ],
      linksHeading: 'Ultime offerte pubblicate',
    }),
  },
  '/offerte': {
    title: 'Offerte di lavoro in Svizzera - JobCourier',
    description: 'Tutte le offerte di lavoro pubblicate su JobCourier: filtra per settore, ruolo e cantone e candidati in pochi clic.',
    body: () => snapshotBody({
      heading: 'Offerte di lavoro in Svizzera',
      subheading: `${jobsSnapshot.length} annunci attivi su JobCourier, aggiornati regolarmente dalle aziende che assumono.`,
      links: [
        ...jobsSnapshot.map((job) => ({
          href: `/offerta/${job.id}`,
          label: job.title,
          meta: [job.company, job.location].filter(Boolean).join(', '),
        })),
        ...uniqueJobField('sector').map((sector) => ({
          href: `/offerte?sector=${encodeURIComponent(sector)}`,
          label: `Offerte nel settore ${sector}`,
        })),
        ...uniqueJobField('role').map((role) => ({
          href: `/offerte?keyword=${encodeURIComponent(role)}`,
          label: `Offerte per il ruolo ${role}`,
        })),
        { href: '/aziende-che-assumono', label: 'Aziende che assumono' },
      ],
      linksHeading: 'Tutte le offerte',
      backLink: { href: '/', label: 'Torna alla home' },
    }),
  },
  '/aziende-che-assumono': {
    title: 'Aziende che assumono in Svizzera - JobCourier',
    description: 'Le aziende con un profilo attivo su JobCourier che stanno assumendo in Svizzera: scopri chi sono e candidati alle loro offerte.',
    body: () => snapshotBody({
      heading: 'Aziende che assumono',
      subheading: `${companiesSnapshot.length} aziende con almeno una posizione aperta su JobCourier.`,
      links: [
        ...companiesSnapshot.map((company) => ({
          href: `/azienda/${company.slug}`,
          label: company.name,
        })),
        { href: '/offerte', label: 'Vedi tutte le offerte' },
      ],
      linksHeading: 'Tutte le aziende',
      backLink: { href: '/', label: 'Torna alla home' },
    }),
  },
};

// Italian path -> routeId, for the loop below: those pages now carry the hreflang set too,
// without which the translated URLs point at an Italian page that never points back.
const ROUTE_ID_BY_IT_PATH = Object.fromEntries(
  Object.keys(ROUTE_SEGMENTS).map((id) => [`/${routeSegmentFor(id, DEFAULT_LANG)}`, id])
);

for (const [route, file] of Object.entries(ROUTES)) {
  // The home page keeps its trailing slash: that is the form the sitemap lists and the
  // form the site is indexed under. Every other route drops it (trailingSlash: false).
  const canonical = `${SITE}${route}`;
  // Shared with the SSR routes rather than reimplemented: it strips before injecting,
  // which is what keeps this script idempotent (index.html is both an input and one of
  // the outputs, so a second run over the same dist would otherwise stack a second tag).
  // Reimplemented, the two could drift into emitting different markup for the same page
  // without anything failing.
  let html = withCanonical(shell, canonical);

  // Every route in HUB_CONTENT or STATIC_META gets its title/og/meta description
  // overwritten. The home page's entry in HUB_CONTENT carries no `title` — its
  // <title>/og:title/og:description are already correct static values in index.html, and
  // (unlike every other route here) index.html doubles as the pristine dist/_template.html
  // api/_ssr.js fetches for /offerta and /azienda snapshots, so nothing here may append a
  // second meta description that would leak into those.
  const meta = HUB_CONTENT[route] || STATIC_META[route];
  if (meta?.title) {
    const t = escapeHtml(meta.title);
    const d = escapeHtml(meta.description);

    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${t}</title>`);
    html = html
      .replace(/<meta\s+property="og:title"[^>]*>/i, `<meta property="og:title" content="${t}">`)
      .replace(/<meta\s+property="og:description"[^>]*>/i, `<meta property="og:description" content="${d}">`);

    // Every route reaching here is a standalone copy of the shell (not fetched as a
    // template by anything else — see the module comment on why '/' is the exception),
    // so appending fresh here never risks a duplicate: none of them ship a meta
    // description or twitter:card of their own.
    html = html.replace(
      '</head>',
      `  <meta name="description" content="${d}">\n` +
        `    <meta name="twitter:card" content="summary_large_image">\n  </head>`
    );
  }

  // createRoot().render() replaces #root's children on mount (see api/_ssr.js's header
  // comment), so this is a pre-boot snapshot, not markup the client has to reconcile.
  //
  // The two hubs get their full body from HUB_CONTENT. The six STATIC_META-only routes
  // (faq, contatti, come-funziona, soluzioni-e-tariffe, condizioni-generali, cookie-policy)
  // used to get no body at all — <div id="root"></div> stayed empty, so a non-JS crawler
  // read zero <a href> on any of them. That is exactly Semrush's 2026-08-29 "only one
  // internal link pointing to this page" finding (defect 213) for those four marketing
  // pages: reachable only via the one link the home page's own snapshot happens to include.
  // snapshotBody's own site-wide nav (see api/_ssr.js) now gives every one of these a real
  // link graph too; the heading/subheading below reuse this same route's own title/
  // description rather than inventing new copy.
  if (HUB_CONTENT[route]) {
    html = html.replace(/<div id="root">\s*<\/div>/i, `<div id="root">${HUB_CONTENT[route].body()}</div>`);
  } else if (STATIC_META[route]) {
    const heading = STATIC_META[route].title.split(' - ')[0];
    html = html.replace(
      /<div id="root">\s*<\/div>/i,
      `<div id="root">${snapshotBody({
        heading,
        subheading: STATIC_META[route].description,
        backLink: { href: '/', label: 'Torna alla home' },
      })}</div>`
    );
  }

  if (ROUTE_ID_BY_IT_PATH[route]) html = withHreflang(html, ROUTE_ID_BY_IT_PATH[route]);

  writeFileSync(distFile(file), html);
}

/**
 * One prerendered file per translated URL — /stellenangebote.html, /offres-emploi.html and
 * the rest — each with its own canonical, its own title and description in that language,
 * lang="xx" on <html>, the shared hreflang set, and a body whose links stay inside the
 * same language.
 *
 * This is the part that makes the translations exist for a crawler. Everything before it
 * only mattered to a browser running the bundle: Googlebot reads this HTML, and until now
 * the only HTML on the site said Italian no matter which URL was asked for.
 */
let localizedCount = 0;
for (const routeId of Object.keys(ROUTE_SEGMENTS)) {
  for (const { path, langs } of distinctPathsFor(routeId)) {
    // The Italian file is written by the loop above, together with its hub body. A shared
    // segment (/faq) is that same single file for every language — writing it again here,
    // once per language, would just overwrite it with whichever ran last.
    if (langs.includes(DEFAULT_LANG)) continue;
    const lang = langs[0];
    const { title, description } = COPY[routeId](locale[lang]);
    const t = escapeHtml(title);
    const d = escapeHtml(description);

    let html = withCanonical(shell, `${SITE}${path}`);
    html = withHreflang(html, routeId);
    html = html.replace(/<html([^>]*)\slang="[^"]*"/i, '<html$1').replace(/<html/i, `<html lang="${lang}"`);
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${t}</title>`);
    html = html
      .replace(/<meta\s+property="og:title"[^>]*>/i, `<meta property="og:title" content="${t}">`)
      .replace(/<meta\s+property="og:description"[^>]*>/i, `<meta property="og:description" content="${d}">`);
    html = html.replace(
      '</head>',
      `  <meta name="description" content="${d}">\n` +
        `    <meta name="twitter:card" content="summary_large_image">\n  </head>`
    );

    // Same crawlable body as the Italian hubs, with every internal link translated into
    // this language. A German page linking to /offerte would hand the crawler back to the
    // Italian side of the site and leave the German pages with no link graph of their own —
    // the orphan-page problem the hub work fixed for Italian in August.
    const lp = (p) => translatePath(p, lang);
    const heading = title.split(' - ')[0];

    // The site-wide nav appended to every snapshot defaults to the Italian URLs (see
    // SITE_NAV_LINKS in api/_ssr.js). Translated here so each language's pages link to
    // each other rather than back into the Italian site.
    const navLinks = [
      ...Object.keys(ROUTE_SEGMENTS).map((id) => ({
        href: lp(`/${routeSegmentFor(id, DEFAULT_LANG)}`),
        label: COPY[id](locale[lang]).title.split(' - ')[0],
      })),
      { href: lp('/blog/carriera'), label: locale[lang].blog.page_candidates_breadcrumb },
      { href: lp('/blog/recruiting'), label: locale[lang].blog.page_companies_breadcrumb },
    ];
    let body;
    if (routeId === 'offerte') {
      body = snapshotBody({
        heading,
        subheading: description,
        links: [
          ...jobsSnapshot.map((job) => ({
            href: `/offerta/${job.id}`,
            label: job.title,
            meta: [job.company, job.location].filter(Boolean).join(', '),
          })),
          { href: lp('/aziende-che-assumono'), label: COPY.aziende(locale[lang]).title.split(' - ')[0] },
        ],
        linksHeading: heading,
        backLink: { href: '/', label: 'JobCourier' },
        navLinks,
      });
    } else if (routeId === 'aziende') {
      body = snapshotBody({
        heading,
        subheading: description,
        links: [
          ...companiesSnapshot.map((company) => ({ href: `/azienda/${company.slug}`, label: company.name })),
          { href: lp('/offerte'), label: COPY.offerte(locale[lang]).title.split(' - ')[0] },
        ],
        linksHeading: heading,
        backLink: { href: '/', label: 'JobCourier' },
        navLinks,
      });
    } else {
      body = snapshotBody({
        heading,
        subheading: description,
        links: Object.keys(ROUTE_SEGMENTS)
          .filter((id) => id !== routeId)
          .map((id) => ({
            href: lp(`/${routeSegmentFor(id, DEFAULT_LANG)}`),
            label: COPY[id](locale[lang]).title.split(' - ')[0],
          })),
        backLink: { href: '/', label: 'JobCourier' },
        navLinks,
      });
    }
    html = html.replace(/<div id="root">\s*<\/div>/i, `<div id="root">${body}</div>`);

    writeFileSync(distFile(`${path.slice(1)}.html`), html);
    localizedCount += 1;
  }
}

console.log(
  `prerender: ${Object.keys(ROUTES).length} canonical URL, ${Object.keys(HUB_CONTENT).length} hub con contenuto, ${localizedCount} URL tradotte`
);
