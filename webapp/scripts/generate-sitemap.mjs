// Genera public/sitemap.xml dalle entry blog + pagine statiche.
// Eseguito prima di vite build.
import { writeFileSync } from 'node:fs';
import { blogIndex, slugFor } from '../src/data/blog/blogIndex.js';
import { CATEGORIES, categorySegmentFor } from '../src/data/blog/categories.js';

const SITE = 'https://www.jobcourier.ch';
const LANGS = ['it', 'en', 'de', 'fr'];
const STATIC = ['/', '/offerte', '/soluzioni-e-tariffe', '/come-funziona', '/contatti', '/faq', '/aziende-che-assumono'];

const urls = [];
for (const p of STATIC) urls.push({ loc: `${SITE}${p}` });

// One <url> entry per actually-distinct URL, each carrying the full reciprocal hreflang
// set (every language's href, including its own — required by the sitemap spec, and by
// Ahrefs' "missing reciprocal hreflang" check). Previously this only emitted the IT loc
// with the other languages as alternates, so EN/DE/FR pages had zero <loc> of their own —
// undiscoverable via the sitemap, only reachable through a hreflang tag on the IT page.
//
// "recruiting" is one real URL shared by all four languages (categories.js: same segment
// string in every locale) — it must not appear four times with four different "self"
// hreflang claims, which is exactly the "referenced for more than one language" issue the
// audit flags. Same rule as scripts/generate-blog-snapshot.mjs: group by the actual URL.
for (const catId of Object.keys(CATEGORIES)) {
  const langsBySegment = new Map();
  for (const l of LANGS) {
    const seg = categorySegmentFor(catId, l);
    if (!langsBySegment.has(seg)) langsBySegment.set(seg, []);
    langsBySegment.get(seg).push(l);
  }
  const distinctUrls = langsBySegment.size > 1;
  const xDefault = `${SITE}/blog/${categorySegmentFor(catId, 'it')}`;
  for (const seg of langsBySegment.keys()) {
    const loc = `${SITE}/blog/${seg}`;
    const alts = distinctUrls
      ? [...langsBySegment.entries()].map(([s, ls]) => ({ l: ls[0], href: `${SITE}/blog/${s}` }))
          .concat([{ l: 'x-default', href: xDefault }])
      : [];
    urls.push({ loc, alts });
  }
}
for (const e of blogIndex.it) {
  const seg = (l) => categorySegmentFor(e.category, l);
  const hrefFor = (l) => `${SITE}/blog/${seg(l)}/${slugFor(e.slug, l)}`;
  const alts = LANGS.map((l) => ({ l, href: hrefFor(l) }));
  alts.push({ l: 'x-default', href: hrefFor('it') });
  for (const l of LANGS) urls.push({ loc: hrefFor(l), alts });
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
${(u.alts || []).map((a) => `    <xhtml:link rel="alternate" hreflang="${a.l}" href="${a.href}"/>`).join('\n')}
  </url>`).join('\n')}
</urlset>
`;
writeFileSync(new URL('../public/sitemap.xml', import.meta.url), xml);
console.log(`sitemap.xml: ${urls.length} URL`);
