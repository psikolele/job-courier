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
import { escapeHtml, snapshotBody } from '../api/_ssr.js';
import { jobs as jobsSnapshot } from '../api/_jobs-snapshot.js';
import { companies as companiesSnapshot } from '../api/_companies-snapshot.js';

const SITE = 'https://www.jobcourier.ch';

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

for (const [route, file] of Object.entries(ROUTES)) {
  // The home page keeps its trailing slash: that is the form the sitemap lists and the
  // form the site is indexed under. Every other route drops it (trailingSlash: false).
  const canonical = `${SITE}${route}`;
  // Stripping first keeps the script idempotent: index.html is both an input and one of
  // the outputs, so a second run over the same dist would otherwise stack a second tag.
  let html = shell
    .replace(/\s*<link\s+rel="canonical"[^>]*>/gi, '')
    .replace(/\s*<meta\s+property="og:url"[^>]*>/gi, '')
    .replace(
      '</head>',
      `  <link rel="canonical" href="${canonical}">\n` +
        `    <meta property="og:url" content="${canonical}">\n  </head>`
    );

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

  // Only the two hubs get real body content — see HUB_CONTENT's own comment for why.
  if (HUB_CONTENT[route]) {
    // createRoot().render() replaces #root's children on mount (see api/_ssr.js's header
    // comment), so this is a pre-boot snapshot, not markup the client has to reconcile.
    html = html.replace(/<div id="root">\s*<\/div>/i, `<div id="root">${HUB_CONTENT[route].body()}</div>`);
  }

  writeFileSync(distFile(file), html);
}

console.log(`prerender: ${Object.keys(ROUTES).length} canonical URL, ${Object.keys(HUB_CONTENT).length} hub con contenuto`);
