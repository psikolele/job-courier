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

const SITE = 'https://www.jobcourier.ch';

// Must stay in step with the non-blog rewrites in vercel.json: a route listed there and
// missing here goes back to serving a shell with no canonical.
//
// index.html itself is deliberately left untouched — it is the template api/_ssr.js
// fetches for the /offerta and /azienda snapshots, and renderShell() appends a canonical
// rather than replacing one, so a canonical baked into the template would give those
// pages two. The home page gets its own file instead.
const ROUTES = {
  '/': 'home.html',
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

for (const [route, file] of Object.entries(ROUTES)) {
  const canonical = route === '/' ? SITE : `${SITE}${route}`;
  writeFileSync(
    distFile(file),
    shell.replace(
      '</head>',
      `  <link rel="canonical" href="${canonical}">\n` +
        `    <meta property="og:url" content="${canonical}">\n  </head>`
    )
  );
}

console.log(`prerender: ${Object.keys(ROUTES).length} canonical URL`);
