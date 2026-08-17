// Builds api/_blog-snapshot.js: full SEO data (title, description, canonical, hreflang
// set, JSON-LD, plain-text body) for every blog URL — 2 category pages x4 langs and every
// article x4 langs. Blog content is static data compiled into the repo (src/data/blog/),
// not a live feed, so unlike jobs/companies this can be exhaustive and exact rather than a
// capped snapshot.
//
// Why this exists: api/shell-ssr.js used to inject only a <link rel="canonical"> for blog
// routes, so a crawler that does not execute JS read the shared shell — same fallback
// title, no H1, no meta description, no outgoing links, no hreflang return tags. That is
// the site audit's largest remaining bucket (H1/meta description/twitter card missing,
// ~54-57 URLs each; a chunk of "orphan page" and "missing reciprocal hreflang").
//
// This is the "system" the SEO backlog asks for: any new article added to blogIndex.js +
// its per-language src/data/blog/{lang}/{slug}.js file is picked up automatically the next
// time `npm run build` runs — no per-page code to write.
import { writeFileSync } from 'node:fs';
import { blogIndex, slugFor } from '../src/data/blog/blogIndex.js';
import { CATEGORIES, categorySegmentFor } from '../src/data/blog/categories.js';

const SITE = 'https://www.jobcourier.ch';
const LANGS = ['it', 'en', 'de', 'fr'];

const CATEGORY_COPY = {
  carriera: {
    it: { title: 'Consigli di carriera per candidati - Blog JobCourier', description: 'Guide pratiche su ricerca di lavoro, CV, colloqui e carriera per candidati in Svizzera.' },
    en: { title: 'Career Advice for Candidates - JobCourier Blog', description: 'Practical guides on job search, CVs, interviews and career growth for candidates in Switzerland.' },
    de: { title: 'Karrieretipps für Kandidaten - JobCourier Blog', description: 'Praktische Leitfäden zu Jobsuche, Lebenslauf, Vorstellungsgespräch und Karriere in der Schweiz.' },
    fr: { title: 'Conseils de carrière pour candidats - Blog JobCourier', description: "Guides pratiques sur la recherche d'emploi, le CV, les entretiens et la carrière en Suisse." },
  },
  recruiting: {
    it: { title: 'Consigli di recruiting per aziende - Blog JobCourier', description: 'Guide pratiche su selezione, annunci di lavoro ed employer branding per aziende in Svizzera.' },
    en: { title: 'Recruiting Advice for Companies - JobCourier Blog', description: 'Practical guides on hiring, job ads and employer branding for companies in Switzerland.' },
    de: { title: 'Recruiting-Tipps für Unternehmen - JobCourier Blog', description: 'Praktische Leitfäden zu Rekrutierung, Stellenanzeigen und Employer Branding in der Schweiz.' },
    fr: { title: 'Conseils de recrutement pour entreprises - Blog JobCourier', description: "Guides pratiques sur le recrutement, les offres d'emploi et la marque employeur en Suisse." },
  },
};

const CATEGORY_H1 = {
  carriera: { it: 'Consigli di carriera', en: 'Career advice', de: 'Karrieretipps', fr: 'Conseils de carrière' },
  recruiting: { it: 'Consigli di recruiting', en: 'Recruiting advice', de: 'Recruiting-Tipps', fr: 'Conseils de recrutement' },
};

// Node runs this as a plain ESM script (not bundled by Vercel), so a dynamic import with a
// computed path works exactly like any other filesystem read — no glob/bundler needed.
async function loadArticle(lang, slug) {
  try {
    const mod = await import(`../src/data/blog/${lang}/${slug}.js`);
    return mod.default;
  } catch {
    return null;
  }
}

/** Flattens the article's `sections` shape (see BlogArticolo.jsx) into plain text. */
function sectionsToText(article) {
  const parts = [article.intro];
  for (const s of article.sections || []) {
    if (s.cta || s.related) continue;
    if (s.heading) parts.push(s.heading);
    for (const b of s.blocks || []) {
      if (typeof b === 'string') parts.push(b);
      else if (b?.list) parts.push(b.list.join(' '));
      else if (b?.weekPlan) parts.push(b.weekPlan.map((w) => `${w.title}: ${w.items.join(' ')}`).join(' '));
    }
  }
  return parts.filter(Boolean).join('\n\n');
}

function urlForArticle(itSlug, seg, lang) {
  return `${SITE}/blog/${categorySegmentFor(seg, lang)}/${slugFor(itSlug, lang)}`;
}

function hreflangSet(urlFor) {
  const alts = LANGS.map((l) => ({ lang: l, href: urlFor(l) }));
  alts.push({ lang: 'x-default', href: urlFor('it') });
  return alts;
}

const pages = {};

// Category pages: 2 categories, but "recruiting" is the same URL segment in every
// language (categories.js: segments.it === segments.en === ... === 'recruiting'), so it is
// genuinely ONE url, not four — categorySegmentFor + slug alone decide the URL, and a
// snapshot keyed by path can only hold one entry per path no matter how many languages
// share it. Grouping by segment first, rather than looping languages and overwriting the
// same key, is what makes that explicit instead of silently keeping only the last write.
for (const catId of Object.keys(CATEGORIES)) {
  const langsBySegment = new Map(); // segment -> [langs that use it, in LANGS order]
  for (const lang of LANGS) {
    const seg = categorySegmentFor(catId, lang);
    if (!langsBySegment.has(seg)) langsBySegment.set(seg, []);
    langsBySegment.get(seg).push(lang);
  }

  for (const [seg, langsHere] of langsBySegment) {
    // The URL's own language: first (in LANGS order, so IT wins ties) of the languages
    // that map to this segment. Real for "carriera" (only 'it' maps to it); for
    // "recruiting" this is a naming choice — IT copy, since IT is the site's default and
    // canonicalPath()/generate-sitemap.mjs already treat it as x-default.
    const lang = langsHere[0];
    const list = blogIndex[lang]?.filter((e) => e.category === catId)?.length
      ? blogIndex[lang].filter((e) => e.category === catId)
      : blogIndex.it.filter((e) => e.category === catId);

    // hreflang only for segments that are actually distinct URLs. A single shared segment
    // (recruiting) has nothing to alternate to — declaring hreflang="en" on a URL that is
    // also the German and French page is exactly the "referenced for more than one
    // language" issue the audit flagged.
    const distinctUrls = langsBySegment.size > 1;

    pages[`/blog/${seg}`] = {
      type: 'category',
      lang,
      title: CATEGORY_COPY[catId][lang].title,
      description: CATEGORY_COPY[catId][lang].description,
      canonical: `${SITE}/blog/${seg}`,
      hreflang: distinctUrls
        ? [...langsBySegment.entries()].map(([s, ls]) => ({ lang: ls[0], href: `${SITE}/blog/${s}` }))
            .concat([{ lang: 'x-default', href: `${SITE}/blog/${categorySegmentFor(catId, 'it')}` }])
        : [],
      heading: CATEGORY_H1[catId][lang],
      // blogIndex[lang] entries already carry that language's own slug (see blogIndex.js:
      // EN/DE/FR arrays are declared in full, not derived) — no translation lookup needed.
      links: list.map((e) => ({
        href: `/blog/${seg}/${e.slug}`,
        label: e.title,
        meta: `${e.readingTime} min`,
      })),
    };
  }
}

// Article pages: every IT entry x4 langs (falls back to the IT article body when a
// translation file is missing, same rule as src/data/blog/loader.js's getArticle).
for (const entry of blogIndex.it) {
  for (const lang of LANGS) {
    const direct = await loadArticle(lang, slugFor(entry.slug, lang));
    const article = direct || (await loadArticle('it', entry.slug));
    if (!article) continue;

    const seg = categorySegmentFor(article.category, lang);
    const urlFor = (l) => urlForArticle(entry.slug, article.category, l);
    const canonical = urlFor(lang);
    const bodyText = sectionsToText(article);

    const jsonLd = [
      {
        '@context': 'https://schema.org', '@type': 'Article',
        headline: article.title, description: article.metaDescription,
        datePublished: article.datePublished, image: article.image, inLanguage: lang,
        publisher: { '@type': 'Organization', name: 'JobCourier', url: SITE },
        mainEntityOfPage: canonical,
      },
    ];
    if (article.faq?.length) {
      jsonLd.push({
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: article.faq.map((f) => ({
          '@type': 'Question', name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      });
    }
    jsonLd.push({
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog/${seg}` },
        { '@type': 'ListItem', position: 3, name: article.title, item: canonical },
      ],
    });

    pages[`/blog/${seg}/${slugFor(entry.slug, lang)}`] = {
      type: 'article',
      lang,
      title: article.metaTitle,
      description: article.metaDescription,
      canonical,
      hreflang: hreflangSet(urlFor),
      ogImage: article.image,
      heading: article.title,
      subheading: article.abstract,
      bodyText,
      jsonLd,
      backHref: `/blog/${seg}`,
    };
  }
}

const out = `// GENERATED by scripts/generate-blog-snapshot.mjs — do not edit by hand.
// Rebuilt on every \`npm run build\` from src/data/blog/*. A new article or translation
// appears here automatically on the next build; nothing else needs to change.
export const blogPages = ${JSON.stringify(pages, null, 2)};
`;
writeFileSync(new URL('../api/_blog-snapshot.js', import.meta.url), out);
console.log(`blog-snapshot: ${Object.keys(pages).length} pagine`);
