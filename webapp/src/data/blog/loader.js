import { findBySlug } from './blogIndex.js';

const loaders = {
  it: import.meta.glob('./it/*.js'),
  en: import.meta.glob('./en/*.js'),
  de: import.meta.glob('./de/*.js'),
  fr: import.meta.glob('./fr/*.js'),
};

async function load(lang, slug) {
  const key = `./${lang}/${slug}.js`;
  const fn = loaders[lang]?.[key];
  if (!fn) return null;
  const mod = await fn();
  return mod.default;
}

// Articolo nella lingua richiesta; fallback IT (con flag) se mancante.
export async function getArticle(slug, lang) {
  const direct = await load(lang, slug);
  if (direct) return direct;
  const hit = findBySlug(slug);
  if (!hit) return null;
  const it = await load('it', hit.entry.slug);
  return it ? { ...it, _fallback: lang !== 'it' } : null;
}
