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
for (const catId of Object.keys(CATEGORIES)) {
  const alts = LANGS.map((l) => ({ l, href: `${SITE}/blog/${categorySegmentFor(catId, l)}` }));
  alts.push({ l: 'x-default', href: alts[0].href });
  urls.push({ loc: alts[0].href, alts });
}
for (const e of blogIndex.it) {
  const seg = (l) => categorySegmentFor(e.category, l);
  const alts = LANGS.map((l) => ({ l, href: `${SITE}/blog/${seg(l)}/${slugFor(e.slug, l)}` }));
  alts.push({ l: 'x-default', href: alts[0].href });
  urls.push({ loc: alts[0].href, alts });
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
