# Blog Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sezione Blog completa per Job Courier: due pagine categoria (`/blog/carriera`, `/blog/recruiting`), pagina dettaglio articolo 65/35 con sidebar sticky, 10 articoli da docx, SEO completa (helmet, JSON-LD, sitemap, hreflang), struttura multilingua con slug localizzati.

**Architecture:** Contenuti come moduli JS statici per lingua in `src/data/blog/{it,en,de,fr}/` con schema fisso (contratto per futuro backend AI). Indice leggero `blogIndex.js` per card/sidebar/slug-resolver. Componenti pagina riusano pattern OffertaDettaglio (split 65/35, breadcrumb dash 28px + fontSize 11 fuchsia, font Satoshi/Playfair/Inter da Brand Guidelines).

**Tech Stack:** React 19, Vite 7, react-router-dom 7, react-i18next, react-helmet-async (nuova dep), vitest (già presente), Tailwind 4 + inline styles come resto codebase.

**Spec:** `docs/superpowers/specs/2026-06-10-blog-section-design.md`

**Working dir per i comandi:** `webapp/`

---

## File Structure

```
webapp/src/
├── data/blog/
│   ├── signatures.js              # frasi firma cand/az (4 lingue)
│   ├── blogIndex.js               # indice leggero per lingua + mappa slug cross-lingua
│   ├── loader.js                  # getArticle(slug, lang) lazy + fallback IT
│   ├── it/                        # 10 articoli italiani
│   │   ├── come-scrivere-un-cv-che-ottiene-colloqui.js
│   │   └── … (9 altri)
│   ├── en/ de/ fr/                # vuote in v1 (fase 2 traduzioni)
├── pages/
│   ├── BlogCategoria.jsx          # pagina indice categoria (parametrica)
│   └── BlogArticolo.jsx           # dettaglio 65/35
├── components/blog/
│   ├── ArticleCtaBox.jsx          # riquadro domanda→azione JC
│   ├── ArticleRelatedBox.jsx      # riquadro "Leggi anche"
│   ├── ArticleSignature.jsx       # firma emotiva
│   ├── ArticleFaq.jsx             # accordion FAQ
│   ├── BlogSidebar.jsx            # preview articoli + CTA target + adv
│   └── BlogSeo.jsx                # helmet + JSON-LD + hreflang
├── App.jsx                        # MODIFY: route blog + redirect
├── components/Blog.jsx            # MODIFY: card cliccabili
├── components/Navbar.jsx          # MODIFY: voci menu blog
└── scripts/generate-sitemap.mjs   # build-time sitemap (webapp/scripts/)
```

Costanti categoria localizzate: `carriera|career|karriere|carriere` / `recruiting` (uguale in tutte le lingue).

---

### Task 1: Dipendenze e script test

**Files:**
- Modify: `webapp/package.json`

- [ ] **Step 1: Installa react-helmet-async** (⚠️ nuova dipendenza — già approvata in spec)

Run: `npm install react-helmet-async` (in `webapp/`)
Expected: aggiunta a dependencies senza errori peer (compatibile React 19; se peer warning su React 19, usare `npm install react-helmet-async --legacy-peer-deps` e verificare che l'app builda).

- [ ] **Step 2: Aggiungi script test**

In `webapp/package.json` sezione scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Verifica vitest parte**

Run: `npx vitest run --passWithNoTests`
Expected: exit 0, "No test files found".

- [ ] **Step 4: Commit**

```bash
git add webapp/package.json webapp/package-lock.json
git commit -m "chore(blog): add react-helmet-async + vitest test script"
```

---

### Task 2: signatures.js + costanti categorie

**Files:**
- Create: `webapp/src/data/blog/signatures.js`
- Create: `webapp/src/data/blog/categories.js`
- Test: `webapp/src/data/blog/__tests__/categories.test.js`

- [ ] **Step 1: Scrivi test fallente per risoluzione categorie**

`webapp/src/data/blog/__tests__/categories.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { CATEGORIES, resolveCategorySegment, categorySegmentFor } from '../categories.js';

describe('categories', () => {
  it('risolve segmento localizzato in id categoria', () => {
    expect(resolveCategorySegment('carriera')).toBe('carriera');
    expect(resolveCategorySegment('career')).toBe('carriera');
    expect(resolveCategorySegment('karriere')).toBe('carriera');
    expect(resolveCategorySegment('recruiting')).toBe('recruiting');
    expect(resolveCategorySegment('nope')).toBe(null);
  });
  it('restituisce segmento per lingua', () => {
    expect(categorySegmentFor('carriera', 'de')).toBe('karriere');
    expect(categorySegmentFor('recruiting', 'fr')).toBe('recruiting');
    expect(categorySegmentFor('carriera', 'xx')).toBe('carriera'); // fallback it
  });
  it('espone label e target CTA per categoria', () => {
    expect(CATEGORIES.carriera.ctaTo).toBe('/offerte');
    expect(CATEGORIES.recruiting.ctaTo).toBe('/soluzioni-e-tariffe');
  });
});
```

- [ ] **Step 2: Run test → FAIL**

Run: `npx vitest run src/data/blog/__tests__/categories.test.js`
Expected: FAIL "Cannot find module '../categories.js'"

- [ ] **Step 3: Implementa categories.js e signatures.js**

`webapp/src/data/blog/categories.js`:
```js
// Categorie blog con segmenti URL localizzati.
// 'carriera' = candidati, 'recruiting' = aziende (segmento identico in tutte le lingue).
export const CATEGORIES = {
  carriera: {
    segments: { it: 'carriera', en: 'career', de: 'karriere', fr: 'carriere' },
    signature: 'cand',
    ctaTo: '/offerte',
  },
  recruiting: {
    segments: { it: 'recruiting', en: 'recruiting', de: 'recruiting', fr: 'recruiting' },
    signature: 'az',
    ctaTo: '/soluzioni-e-tariffe',
  },
};

export function resolveCategorySegment(segment) {
  for (const [id, cat] of Object.entries(CATEGORIES)) {
    if (Object.values(cat.segments).includes(segment)) return id;
  }
  return null;
}

export function categorySegmentFor(categoryId, lang) {
  const cat = CATEGORIES[categoryId];
  if (!cat) return null;
  return cat.segments[lang] || cat.segments.it;
}
```

`webapp/src/data/blog/signatures.js`:
```js
// Frasi di chiusa "firma" articolo (mail Gabriele 09/06/2026, Frasi finali Articoli.docx).
// Variante az alternativa: "Le persone giuste fanno la differenza. Se le cerchi, le trovi su JobCourier."
export const SIGNATURES = {
  cand: {
    it: ['Il prossimo lavoro potrebbe essere più vicino di quanto pensi.', 'Se lo cerchi, lo trovi su JobCourier.'],
    en: ['Your next job could be closer than you think.', 'If you look for it, you will find it on JobCourier.'],
    de: ['Ihr nächster Job könnte näher sein, als Sie denken.', 'Wer sucht, findet ihn auf JobCourier.'],
    fr: ['Votre prochain emploi est peut-être plus proche que vous ne le pensez.', 'Si vous le cherchez, vous le trouverez sur JobCourier.'],
  },
  az: {
    it: ['I candidati giusti fanno la differenza.', 'Se li cerchi, li trovi su JobCourier.'],
    en: ['The right candidates make all the difference.', 'If you look for them, you will find them on JobCourier.'],
    de: ['Die richtigen Kandidaten machen den Unterschied.', 'Wer sie sucht, findet sie auf JobCourier.'],
    fr: ['Les bons candidats font toute la différence.', 'Si vous les cherchez, vous les trouverez sur JobCourier.'],
  },
};

export function getSignature(kind, lang) {
  const s = SIGNATURES[kind];
  if (!s) return null;
  return s[lang] || s.it;
}
```

- [ ] **Step 4: Run test → PASS**

Run: `npx vitest run src/data/blog/__tests__/categories.test.js`
Expected: PASS (3 test)

- [ ] **Step 5: Commit**

```bash
git add webapp/src/data/blog
git commit -m "feat(blog): category constants with localized segments + signature phrases"
```

---

### Task 3: Estrazione 10 articoli docx → file JS IT

**Files:**
- Create: `webapp/src/data/blog/it/<slug>.js` × 10
- Source: `Blog/*.docx` (root progetto, NON webapp)

Slug IT definitivi (keyword-rich, dai meta title docx):

| Docx | Slug | category |
|------|------|----------|
| Art.1.Cand | `come-scrivere-un-cv-che-ottiene-colloqui` | carriera |
| Art.2.Cand | `come-affrontare-un-colloquio-di-lavoro` | carriera |
| Art.3.Cand | `settori-con-piu-opportunita-di-lavoro` | carriera |
| Art.4.Cand | `come-trovare-lavoro-guida-pratica` | carriera |
| Art.5.Cand | `perche-non-ricevi-risposte-alle-candidature` | carriera |
| Art.1.Az | `come-scrivere-un-annuncio-di-lavoro-efficace` | recruiting |
| Art.2.Az | `perche-non-ricevi-candidature-qualificate` | recruiting |
| Art.3.Az | `perche-i-candidati-scelgono-alcune-aziende` | recruiting |
| Art.4.Az | `employer-branding-pmi-guida-pratica` | recruiting |
| Art.5.Az | `come-ridurre-i-tempi-di-assunzione` | recruiting |

- [ ] **Step 1: Estrai ogni docx nello schema** (subagent paralleli ammessi, uno per articolo o batch 2×5)

Schema per file (ESM default export):
```js
export default {
  slug: 'come-scrivere-un-cv-che-ottiene-colloqui',
  category: 'carriera',
  metaTitle: '<Meta Title esatto dal docx>',
  metaDescription: '<Meta Description esatta dal docx>',
  title: 'Come scrivere un CV che ottiene colloqui',
  abstract: '<2 frasi dal blocco In sintesi>',
  readingTime: 8, // Math.ceil(parole_body / 200)
  datePublished: '2026-06-10',
  image: 'https://images.unsplash.com/<id pertinente>?w=1200&q=80',
  intro: '<testo completo blocco "In sintesi">',
  sections: [
    { heading: 'I primi 30 secondi contano', blocks: ['<paragrafo 1>', '<paragrafo 2>'] },
    // sub-heading (H3 docx) come sezione con heading proprio
    // DOPO la 2ª sezione inserire riquadro CTA:
    { cta: { question: '<domanda pertinente al tema>', action: '<label bottone>', to: '/offerte | /soluzioni-e-tariffe' } },
    // VERSO FINE BODY (prima di checklist) inserire correlato:
    { related: { question: '<domanda ponte>', slug: '<slug articolo correlato stessa o altra categoria>' } },
  ],
  checklist: ['<voce 1>', '…'],
  faq: [{ q: '<domanda>', a: '<risposta>' }],
  signature: 'cand', // 'az' per recruiting
};
```

Regole estrazione (vincolanti per ogni subagent):
- Testo FEDELE al docx — nessuna riscrittura, niente riassunti. Solo pulizia whitespace.
- Estrazione testo: `python -c` con zipfile + parsing `word/document.xml` (i docx usano bold paragraphs come heading — major bold standalone = heading sezione).
- Esempi prima/dopo e "Piano pratico 30 giorni" = sezioni normali con i loro heading.
- Mappa correlati (speculari + interni categoria):
  - cv→perche-non-ricevi-risposte | colloquio→cv | settori→come-trovare-lavoro | come-trovare-lavoro→settori | perche-non-ricevi-risposte→cv
  - annuncio-efficace→perche-non-ricevi-candidature | candidature-qualificate→annuncio-efficace | candidati-scelgono→employer-branding | employer-branding→candidati-scelgono | tempi-assunzione→annuncio-efficace
- CTA per categoria: carriera → `{ action: 'Vedi le offerte', to: '/offerte' }`; recruiting → `{ action: 'Pubblica il tuo annuncio', to: '/soluzioni-e-tariffe' }` (domanda specifica per tema articolo).
- readingTime = Math.ceil(conteggio parole body / 200).
- Immagini: Unsplash a tema (ufficio, colloquio, CV…) — placeholder accettabile, URL valido.

- [ ] **Step 2: Verifica struttura con script usa-e-getta**

Run (in `webapp/`): `node -e "const fs=require('fs');const files=fs.readdirSync('src/data/blog/it');console.log(files.length);" `
Expected: `10`

Poi smoke import: creare test Task 4 (lo valida a fondo) — qui basta conteggio + `npm run build` senza errori sintassi:
Run: `npx vite build --logLevel error`
Expected: exit 0

- [ ] **Step 3: Commit**

```bash
git add webapp/src/data/blog/it
git commit -m "feat(blog): extract 10 articles from docx into structured IT data files"
```

---

### Task 4: blogIndex.js + loader.js

**Files:**
- Create: `webapp/src/data/blog/blogIndex.js`
- Create: `webapp/src/data/blog/loader.js`
- Test: `webapp/src/data/blog/__tests__/loader.test.js`

- [ ] **Step 1: Test fallente**

`webapp/src/data/blog/__tests__/loader.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { blogIndex, findBySlug, listByCategory } from '../blogIndex.js';
import { getArticle } from '../loader.js';

describe('blogIndex', () => {
  it('contiene 10 articoli IT', () => {
    expect(blogIndex.it).toHaveLength(10);
  });
  it('5 per categoria', () => {
    expect(listByCategory('carriera', 'it')).toHaveLength(5);
    expect(listByCategory('recruiting', 'it')).toHaveLength(5);
  });
  it('findBySlug trova articolo e lingua', () => {
    const hit = findBySlug('employer-branding-pmi-guida-pratica');
    expect(hit.lang).toBe('it');
    expect(hit.entry.category).toBe('recruiting');
  });
  it('ogni entry ha campi card', () => {
    for (const e of blogIndex.it) {
      expect(e.slug).toBeTruthy();
      expect(e.title).toBeTruthy();
      expect(e.abstract).toBeTruthy();
      expect(e.readingTime).toBeGreaterThan(0);
      expect(e.image).toBeTruthy();
    }
  });
});

describe('getArticle', () => {
  it('carica articolo IT', async () => {
    const a = await getArticle('come-scrivere-un-cv-che-ottiene-colloqui', 'it');
    expect(a.metaTitle).toBeTruthy();
    expect(a.sections.length).toBeGreaterThan(3);
    expect(a.faq.length).toBeGreaterThanOrEqual(4);
  });
  it('fallback IT per lingua mancante', async () => {
    const a = await getArticle('come-scrivere-un-cv-che-ottiene-colloqui', 'de');
    expect(a).toBeTruthy(); // de non esiste ancora → IT
    expect(a._fallback).toBe(true);
  });
  it('null per slug inesistente', async () => {
    expect(await getArticle('non-esiste', 'it')).toBe(null);
  });
});
```

- [ ] **Step 2: Run → FAIL** (`npx vitest run src/data/blog/__tests__/loader.test.js`)

- [ ] **Step 3: Implementa**

`webapp/src/data/blog/blogIndex.js`:
```js
// Indice leggero per card, sidebar e slug-resolver. NON importa i body articolo.
// translations: mappa slug equivalenti tra lingue (popolata in fase 2 traduzioni).
const IT = [
  { slug: 'come-scrivere-un-cv-che-ottiene-colloqui', category: 'carriera', title: 'Come scrivere un CV che ottiene colloqui', abstract: '<da file articolo>', readingTime: 8, image: '<url>' },
  // … 9 entry (copiare slug/title/abstract/readingTime/image dai file it/)
];

export const blogIndex = { it: IT, en: [], de: [], fr: [] };

// slug IT → slug per lingua (identico finché non esistono traduzioni)
export const slugTranslations = {
  // 'come-scrivere-un-cv-che-ottiene-colloqui': { en: '…', de: '…', fr: '…' },
};

export function listByCategory(categoryId, lang) {
  const list = blogIndex[lang]?.length ? blogIndex[lang] : blogIndex.it;
  return list.filter((e) => e.category === categoryId);
}

export function findBySlug(slug) {
  for (const [lang, list] of Object.entries(blogIndex)) {
    const entry = list.find((e) => e.slug === slug);
    if (entry) return { lang, entry };
  }
  return null;
}

export function slugFor(itSlug, lang) {
  if (lang === 'it') return itSlug;
  return slugTranslations[itSlug]?.[lang] || itSlug; // fallback: slug IT
}
```
NB: le 10 entry IT vanno compilate con i valori reali dai file di Task 3 (copia campi, no import per tenere il chunk leggero).

`webapp/src/data/blog/loader.js`:
```js
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

// Ritorna articolo nella lingua richiesta; fallback IT (con flag) se mancante.
export async function getArticle(slug, lang) {
  const direct = await load(lang, slug);
  if (direct) return direct;
  const hit = findBySlug(slug);
  if (!hit) return null;
  const it = await load('it', hit.entry.slug);
  return it ? { ...it, _fallback: lang !== 'it' } : null;
}
```
Nota vitest: `import.meta.glob` è API Vite — i test girano con vitest (usa Vite) quindi funziona. Se vitest non risolve i glob, aggiungere `test: { environment: 'node' }` in `vite.config.js`.

- [ ] **Step 4: Run → PASS** (`npx vitest run src/data/blog/__tests__/loader.test.js`)

- [ ] **Step 5: Commit**

```bash
git add webapp/src/data/blog
git commit -m "feat(blog): lightweight index + lazy article loader with IT fallback"
```

---

### Task 5: Componenti articolo (CtaBox, RelatedBox, Signature, Faq)

**Files:**
- Create: `webapp/src/components/blog/ArticleCtaBox.jsx`
- Create: `webapp/src/components/blog/ArticleRelatedBox.jsx`
- Create: `webapp/src/components/blog/ArticleSignature.jsx`
- Create: `webapp/src/components/blog/ArticleFaq.jsx`

Stile: variabili `var(--brand-navy)`, `var(--brand-fuchsia)`, font `var(--font-brand|editorial|body)` — pattern identico a Offerte/OffertaDettaglio. Componenti presentazionali puri, niente test unit (verifica visiva Task 9).

- [ ] **Step 1: ArticleCtaBox.jsx**

```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Riquadro domanda → azione JC (spunto Laura). Sfondo navy, domanda Playfair, bottone fuchsia.
const ArticleCtaBox = ({ question, action, to }) => (
  <div style={{ background: 'var(--brand-navy)', padding: '32px 28px', margin: '40px 0', borderLeft: '3px solid var(--brand-fuchsia)' }}>
    <p style={{ fontFamily: 'var(--font-editorial)', fontStyle: 'italic', fontSize: 24, color: '#fff', lineHeight: 1.3, margin: 0 }}>
      {question}
    </p>
    <Link to={to} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 20, background: 'var(--brand-fuchsia)', color: '#fff', padding: '12px 24px', fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none' }}>
      {action} <ArrowRight size={14} />
    </Link>
  </div>
);
export default ArticleCtaBox;
```

- [ ] **Step 2: ArticleRelatedBox.jsx**

```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { findBySlug } from '../../data/blog/blogIndex.js';
import { categorySegmentFor } from '../../data/blog/categories.js';
import { useTranslation } from 'react-i18next';

// Riquadro "Leggi anche" → articolo correlato semanticamente (cross-linking Gabriele).
const ArticleRelatedBox = ({ question, slug }) => {
  const { i18n, t } = useTranslation();
  const hit = findBySlug(slug);
  if (!hit) return null;
  const seg = categorySegmentFor(hit.entry.category, i18n.language);
  return (
    <Link to={`/blog/${seg}/${slug}`} style={{ display: 'block', border: '1px solid rgba(5,11,43,0.14)', padding: '24px 28px', margin: '40px 0', textDecoration: 'none' }}>
      <span style={{ fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--brand-fuchsia)' }}>
        {t('blog.read_also', 'Leggi anche')}
      </span>
      <p style={{ fontFamily: 'var(--font-editorial)', fontStyle: 'italic', fontSize: 20, color: 'var(--brand-navy)', margin: '10px 0 6px' }}>{question}</p>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--brand-navy)', fontWeight: 600 }}>
        {hit.entry.title} <ArrowRight size={14} color="var(--brand-fuchsia)" />
      </span>
    </Link>
  );
};
export default ArticleRelatedBox;
```

- [ ] **Step 3: ArticleSignature.jsx**

```jsx
import React from 'react';
import { getSignature } from '../../data/blog/signatures.js';
import { useTranslation } from 'react-i18next';

// Firma emotiva di chiusura (requisito Gabriele: rilevanza emotiva e visiva).
const ArticleSignature = ({ kind }) => {
  const { i18n } = useTranslation();
  const lines = getSignature(kind, i18n.language);
  if (!lines) return null;
  const highlight = (text) => {
    const idx = text.indexOf('JobCourier');
    if (idx === -1) return text;
    return (<>{text.slice(0, idx)}<span style={{ color: 'var(--brand-fuchsia)' }}>JobCourier</span>{text.slice(idx + 'JobCourier'.length)}</>);
  };
  return (
    <div style={{ marginTop: 56, paddingTop: 40, borderTop: '1px solid rgba(5,11,43,0.1)', textAlign: 'center', background: 'var(--brand-gray-light)', padding: '40px 24px' }}>
      <span style={{ display: 'inline-block', width: 28, height: 2, background: 'var(--brand-fuchsia)', marginBottom: 20 }} />
      {lines.map((line, i) => (
        <p key={i} style={{ fontFamily: 'var(--font-editorial)', fontStyle: 'italic', fontSize: i === 0 ? 26 : 24, color: 'var(--brand-navy)', lineHeight: 1.35, margin: i === 0 ? '0 0 8px' : 0 }}>
          {highlight(line)}
        </p>
      ))}
    </div>
  );
};
export default ArticleSignature;
```

- [ ] **Step 4: ArticleFaq.jsx** (accordion — riusare pattern visivo `pages/FAQ.jsx` esistente: leggere quel file e replicare lo stile expand/collapse; chevron lucide, bordo sottile, heading Satoshi)

```jsx
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const ArticleFaq = ({ items, title = 'FAQ' }) => {
  const [open, setOpen] = useState(null);
  if (!items?.length) return null;
  return (
    <div style={{ marginTop: 48 }}>
      <h2 style={{ fontFamily: 'var(--font-editorial)', fontStyle: 'italic', fontSize: 28, color: 'var(--brand-navy)', marginBottom: 16 }}>{title}</h2>
      {items.map((f, i) => (
        <div key={i} style={{ borderBottom: '1px solid rgba(5,11,43,0.1)' }}>
          <button onClick={() => setOpen(open === i ? null : i)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 4px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 15, color: 'var(--brand-navy)' }}>{f.q}</span>
            <ChevronDown size={16} color="var(--brand-fuchsia)" style={{ transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }} />
          </button>
          {open === i && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.75, color: 'var(--brand-navy)', opacity: 0.8, padding: '0 4px 18px', margin: 0 }}>{f.a}</p>
          )}
        </div>
      ))}
    </div>
  );
};
export default ArticleFaq;
```

- [ ] **Step 5: Lint + commit**

Run: `npx eslint src/components/blog --no-warn-ignored`
Expected: 0 errori

```bash
git add webapp/src/components/blog
git commit -m "feat(blog): article building blocks (CTA box, related box, signature, FAQ)"
```

---

### Task 6: BlogSidebar + BlogSeo

**Files:**
- Create: `webapp/src/components/blog/BlogSidebar.jsx`
- Create: `webapp/src/components/blog/BlogSeo.jsx`
- Modify: `webapp/src/main.jsx` (HelmetProvider wrapper)

- [ ] **Step 1: BlogSidebar.jsx**

```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { listByCategory } from '../../data/blog/blogIndex.js';
import { CATEGORIES, categorySegmentFor } from '../../data/blog/categories.js';

// Colonnina laterale (requisito Gabriele: preview altri articoli come pagina ricerche).
const BlogSidebar = ({ currentSlug, categoryId }) => {
  const { i18n, t } = useTranslation();
  const lang = i18n.language;
  const same = listByCategory(categoryId, lang).filter((e) => e.slug !== currentSlug).slice(0, 4);
  const otherId = categoryId === 'carriera' ? 'recruiting' : 'carriera';
  const otherFirst = listByCategory(otherId, lang)[0];
  const seg = categorySegmentFor(categoryId, lang);
  const otherSeg = categorySegmentFor(otherId, lang);
  const cta = CATEGORIES[categoryId];

  return (
    <aside>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ width: 28, height: 2, background: 'var(--brand-fuchsia)' }} />
        <span style={{ fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--brand-fuchsia)' }}>
          {t('blog.other_articles', 'Altri articoli')}
        </span>
      </div>
      {same.map((e) => (
        <Link key={e.slug} to={`/blog/${seg}/${e.slug}`} style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid rgba(5,11,43,0.08)', textDecoration: 'none' }}>
          <img src={e.image} alt="" style={{ width: 64, height: 64, objectFit: 'cover', filter: 'grayscale(1)', flexShrink: 0 }} />
          <div>
            <p style={{ fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 14, color: 'var(--brand-navy)', lineHeight: 1.25, margin: '0 0 6px' }}>{e.title}</p>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--brand-gray-mid)' }}>
              <Clock size={11} /> {e.readingTime} min
            </span>
          </div>
        </Link>
      ))}
      {otherFirst && (
        <Link to={`/blog/${otherSeg}`} style={{ display: 'block', marginTop: 20, padding: '16px 18px', border: '1px solid rgba(5,11,43,0.14)', textDecoration: 'none' }}>
          <span style={{ fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--brand-navy)' }}>
            {categoryId === 'carriera' ? t('blog.switch_to_recruiting', 'Sei un’azienda? Consigli di recruiting') : t('blog.switch_to_career', 'Cerchi lavoro? Consigli di carriera')}
          </span>
          <ArrowRight size={14} color="var(--brand-fuchsia)" style={{ marginLeft: 8, display: 'inline' }} />
        </Link>
      )}
      <Link to={cta.ctaTo} style={{ display: 'block', marginTop: 16, padding: '24px 20px', background: 'var(--brand-navy)', textDecoration: 'none', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-editorial)', fontStyle: 'italic', fontSize: 18, color: '#fff', margin: '0 0 12px' }}>
          {categoryId === 'carriera' ? t('blog.cta_career', 'Trova il tuo prossimo lavoro') : t('blog.cta_recruiting', 'Pubblica il tuo annuncio')}
        </p>
        <span style={{ display: 'inline-block', background: 'var(--brand-fuchsia)', color: '#fff', padding: '10px 22px', fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          {categoryId === 'carriera' ? t('blog.cta_career_btn', 'Vedi le offerte') : t('blog.cta_recruiting_btn', 'Scopri le soluzioni')}
        </span>
      </Link>
      {/* Slot adv: riuso asset banner esistenti (vedi AdBanner.jsx) */}
      <a href="https://www.blc-sa.ch" target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: 16, border: '1px solid rgba(5,11,43,0.08)' }}>
        <img src="/img/Gemini_Generated_Image_ape98sape98sape9.png" alt="Business Learning Centre SA" style={{ width: '100%', display: 'block' }} />
      </a>
    </aside>
  );
};
export default BlogSidebar;
```

- [ ] **Step 2: BlogSeo.jsx**

```jsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { slugFor, findBySlug } from '../../data/blog/blogIndex.js';
import { categorySegmentFor } from '../../data/blog/categories.js';

const SITE = 'https://www.jobcourier.ch';
const LANGS = ['it', 'en', 'de', 'fr'];

// Helmet + hreflang + JSON-LD per pagine blog.
// type: 'category' | 'article'
const BlogSeo = ({ type, lang, categoryId, article, itSlug, title, description }) => {
  const seg = (l) => categorySegmentFor(categoryId, l);
  const urlFor = (l) =>
    type === 'article'
      ? `${SITE}/blog/${seg(l)}/${slugFor(itSlug, l)}`
      : `${SITE}/blog/${seg(l)}`;
  const canonical = urlFor(lang);

  const jsonLd = [];
  if (type === 'article' && article) {
    jsonLd.push({
      '@context': 'https://schema.org', '@type': 'Article',
      headline: article.title, description: article.metaDescription,
      datePublished: article.datePublished, image: article.image, inLanguage: lang,
      publisher: { '@type': 'Organization', name: 'JobCourier', url: SITE },
      mainEntityOfPage: canonical,
    });
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
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog/${seg(lang)}` },
        { '@type': 'ListItem', position: 3, name: article.title, item: canonical },
      ],
    });
  }

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {LANGS.map((l) => (<link key={l} rel="alternate" hrefLang={l} href={urlFor(l)} />))}
      <link rel="alternate" hrefLang="x-default" href={urlFor('it')} />
      <meta property="og:type" content={type === 'article' ? 'article' : 'website'} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      {article?.image && <meta property="og:image" content={article.image} />}
      {jsonLd.map((obj, i) => (<script key={i} type="application/ld+json">{JSON.stringify(obj)}</script>))}
    </Helmet>
  );
};
export default BlogSeo;
```

- [ ] **Step 3: HelmetProvider in main.jsx**

In `webapp/src/main.jsx` wrappare l'app:
```jsx
import { HelmetProvider } from 'react-helmet-async';
// dentro il render esistente:
<HelmetProvider>
  <BrowserRouter>…(contenuto invariato)…</BrowserRouter>
</HelmetProvider>
```

- [ ] **Step 4: Build check + commit**

Run: `npx vite build --logLevel error` → exit 0

```bash
git add webapp/src/components/blog webapp/src/main.jsx
git commit -m "feat(blog): sticky sidebar + SEO component (helmet, hreflang, JSON-LD)"
```

---

### Task 7: Pagine BlogCategoria + BlogArticolo

**Files:**
- Create: `webapp/src/pages/BlogCategoria.jsx`
- Create: `webapp/src/pages/BlogArticolo.jsx`

- [ ] **Step 1: BlogCategoria.jsx**

```jsx
import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { listByCategory } from '../data/blog/blogIndex.js';
import { resolveCategorySegment, categorySegmentFor } from '../data/blog/categories.js';
import BlogSeo from '../components/blog/BlogSeo.jsx';

const LABELS = {
  carriera: { breadcrumb: 'Blog — Carriera', title: 'Suggerimenti per la carriera', subtitle: 'Consigli pratici per chi cerca lavoro.' },
  recruiting: { breadcrumb: 'Blog — Recruiting', title: 'Suggerimenti per il recruiting', subtitle: 'Strategie per attrarre i candidati giusti.' },
};

const BlogCategoria = () => {
  const { categoria } = useParams();
  const { i18n } = useTranslation();
  const lang = i18n.language?.slice(0, 2) || 'it';
  const categoryId = resolveCategorySegment(categoria);
  if (!categoryId) return <Navigate to="/blog/carriera" replace />;
  // segmento di altra lingua → redirect a segmento lingua attiva
  const expected = categorySegmentFor(categoryId, lang);
  if (categoria !== expected) return <Navigate to={`/blog/${expected}`} replace />;

  const articles = listByCategory(categoryId, lang);
  const otherId = categoryId === 'carriera' ? 'recruiting' : 'carriera';
  const L = LABELS[categoryId];

  return (
    <div className="w-full px-6 md:px-12 pt-28 pb-20" style={{ background: 'var(--brand-gray-light)' }}>
      <div className="max-w-[1400px] mx-auto w-full">
        <BlogSeo type="category" lang={lang} categoryId={categoryId} title={`${L.title} | JobCourier`} description={L.subtitle} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <span style={{ width: 28, height: 2, background: 'var(--brand-fuchsia)' }} />
          <span style={{ fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--brand-fuchsia)' }}>{L.breadcrumb}</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-editorial)', fontStyle: 'italic', fontSize: 38, color: 'var(--brand-navy)', margin: '0 0 8px' }}>{L.title}</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--brand-gray-mid)', margin: '0 0 36px' }}>{L.subtitle}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((e) => (
            <Link key={e.slug} to={`/blog/${categorySegmentFor(categoryId, lang)}/${e.slug}`}
              className="group" style={{ background: '#fff', border: '1px solid rgba(5,11,43,0.08)', textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
              <img src={e.image} alt={e.title} style={{ width: '100%', height: 180, objectFit: 'cover', filter: 'grayscale(1)', transition: 'filter .3s' }}
                onMouseEnter={(ev) => (ev.currentTarget.style.filter = 'none')} onMouseLeave={(ev) => (ev.currentTarget.style.filter = 'grayscale(1)')} />
              <div style={{ padding: '22px 22px 26px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--brand-gray-mid)', marginBottom: 10 }}>
                  <Clock size={12} /> {e.readingTime} min di lettura
                </span>
                <h2 style={{ fontFamily: 'var(--font-brand)', fontWeight: 900, fontSize: 19, textTransform: 'uppercase', color: 'var(--brand-navy)', lineHeight: 1.15, margin: '0 0 10px' }}>{e.title}</h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.6, color: 'var(--brand-navy)', opacity: 0.7, margin: '0 0 16px', flex: 1 }}>{e.abstract}</p>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--brand-fuchsia)' }}>
                  Leggi articolo <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <Link to={`/blog/${categorySegmentFor(otherId, lang)}`} style={{ fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--brand-navy)', textDecoration: 'none', borderBottom: '2px solid var(--brand-fuchsia)', paddingBottom: 4 }}>
            {categoryId === 'carriera' ? 'Sei un’azienda? Suggerimenti per il recruiting →' : 'Cerchi lavoro? Suggerimenti per la carriera →'}
          </Link>
        </div>
      </div>
    </div>
  );
};
export default BlogCategoria;
```
(Label IT hardcoded v1 con chiavi i18n da aggiungere in fase 2 traduzioni — coerente con resto sito che ha mix.)

- [ ] **Step 2: BlogArticolo.jsx**

```jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { Clock, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getArticle } from '../data/blog/loader.js';
import { findBySlug, slugFor } from '../data/blog/blogIndex.js';
import { resolveCategorySegment, categorySegmentFor } from '../data/blog/categories.js';
import BlogSeo from '../components/blog/BlogSeo.jsx';
import BlogSidebar from '../components/blog/BlogSidebar.jsx';
import ArticleCtaBox from '../components/blog/ArticleCtaBox.jsx';
import ArticleRelatedBox from '../components/blog/ArticleRelatedBox.jsx';
import ArticleSignature from '../components/blog/ArticleSignature.jsx';
import ArticleFaq from '../components/blog/ArticleFaq.jsx';

const BlogArticolo = () => {
  const { categoria, slug } = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const lang = i18n.language?.slice(0, 2) || 'it';
  const [article, setArticle] = useState(undefined); // undefined=loading, null=404

  const categoryId = resolveCategorySegment(categoria);

  useEffect(() => {
    let alive = true;
    getArticle(slug, lang).then((a) => alive && setArticle(a));
    return () => { alive = false; };
  }, [slug, lang]);

  // slug di altra lingua → redirect a slug lingua attiva
  useEffect(() => {
    const hit = findBySlug(slug);
    if (hit && hit.lang !== lang) {
      const target = slugFor(hit.lang === 'it' ? slug : hit.entry.slug, lang);
      const seg = categorySegmentFor(hit.entry.category, lang);
      if (target !== slug) navigate(`/blog/${seg}/${target}`, { replace: true });
    }
  }, [slug, lang, navigate]);

  if (!categoryId) return <Navigate to="/blog/carriera" replace />;
  if (article === undefined) return <div style={{ minHeight: '60vh' }} />;
  if (article === null) return <Navigate to={`/blog/${categorySegmentFor('carriera', lang)}`} replace />;

  const seg = categorySegmentFor(article.category, lang);

  return (
    <div className="w-full px-6 md:px-12 pt-28 pb-20" style={{ background: 'var(--brand-gray-light)' }}>
      <div className="max-w-[1400px] mx-auto w-full">
        <BlogSeo type="article" lang={lang} categoryId={article.category} article={article} itSlug={findBySlug(slug)?.entry.slug || slug}
          title={article.metaTitle} description={article.metaDescription} />

        <Link to={`/blog/${seg}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24, fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--brand-navy)', textDecoration: 'none' }}>
          <ArrowLeft size={13} /> Tutti gli articoli
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Colonna articolo 65% */}
          <article className="lg:w-[65%]" style={{ background: '#fff', border: '1px solid rgba(5,11,43,0.06)', padding: '40px 36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <span style={{ width: 28, height: 2, background: 'var(--brand-fuchsia)' }} />
              <span style={{ fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--brand-fuchsia)' }}>
                Blog — {article.category === 'carriera' ? 'Carriera' : 'Recruiting'}
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-brand)', fontWeight: 900, fontSize: 32, textTransform: 'uppercase', color: 'var(--brand-navy)', lineHeight: 1.05, margin: '0 0 14px' }}>{article.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 26 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--brand-gray-mid)' }}>
                <Clock size={13} /> {article.readingTime} min di lettura
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--brand-gray-mid)' }}>
                {new Date(article.datePublished).toLocaleDateString('it-CH', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <img src={article.image} alt={article.title} style={{ width: '100%', height: 320, objectFit: 'cover', marginBottom: 28 }} />

            {/* In sintesi */}
            <div style={{ background: 'var(--brand-gray-light)', borderLeft: '3px solid var(--brand-fuchsia)', padding: '22px 26px', marginBottom: 36 }}>
              <span style={{ fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--brand-navy)' }}>In sintesi</span>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.75, color: 'var(--brand-navy)', margin: '10px 0 0' }}>{article.intro}</p>
            </div>

            {/* Sezioni */}
            {article.sections.map((s, i) => {
              if (s.cta) return <ArticleCtaBox key={i} {...s.cta} />;
              if (s.related) return <ArticleRelatedBox key={i} {...s.related} />;
              return (
                <section key={i} style={{ marginBottom: 32 }}>
                  <h2 style={{ fontFamily: 'var(--font-editorial)', fontStyle: 'italic', fontSize: 26, color: 'var(--brand-navy)', margin: '0 0 14px' }}>{s.heading}</h2>
                  {s.blocks.map((b, j) => (
                    <p key={j} style={{ fontFamily: 'var(--font-body)', fontSize: 15.5, lineHeight: 1.8, color: 'var(--brand-navy)', opacity: 0.85, margin: '0 0 14px' }}>{b}</p>
                  ))}
                </section>
              );
            })}

            {/* Checklist */}
            {article.checklist?.length > 0 && (
              <div style={{ marginTop: 40 }}>
                <h2 style={{ fontFamily: 'var(--font-editorial)', fontStyle: 'italic', fontSize: 26, color: 'var(--brand-navy)', margin: '0 0 16px' }}>Checklist finale</h2>
                {article.checklist.map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'baseline', marginBottom: 10 }}>
                    <span style={{ color: 'var(--brand-fuchsia)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.6, color: 'var(--brand-navy)', margin: 0 }}>{c}</p>
                  </div>
                ))}
              </div>
            )}

            <ArticleFaq items={article.faq} />
            <ArticleSignature kind={article.signature} />
          </article>

          {/* Sidebar 35% */}
          <div className="lg:w-[35%]">
            <div className="lg:sticky lg:top-28">
              <BlogSidebar currentSlug={slug} categoryId={article.category} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default BlogArticolo;
```

- [ ] **Step 3: Build check**

Run: `npx vite build --logLevel error` → exit 0

- [ ] **Step 4: Commit**

```bash
git add webapp/src/pages/BlogCategoria.jsx webapp/src/pages/BlogArticolo.jsx
git commit -m "feat(blog): category index page + article detail page (65/35 split)"
```

---

### Task 8: Routing + Navbar + carosello homepage

**Files:**
- Modify: `webapp/src/App.jsx` (aggiungere route dopo `/offerta/:id`)
- Modify: `webapp/src/components/Navbar.jsx` (voce Blog)
- Modify: `webapp/src/components/Blog.jsx` (card cliccabili)

- [ ] **Step 1: Route in App.jsx**

Aggiungere import e route (pattern identico alle route esistenti):
```jsx
import BlogCategoria from './pages/BlogCategoria';
import BlogArticolo from './pages/BlogArticolo';
// dentro <Routes>:
<Route path="/blog" element={<Navigate to="/blog/carriera" replace />} />
<Route path="/blog/:categoria" element={<BlogCategoria />} />
<Route path="/blog/:categoria/:slug" element={<BlogArticolo />} />
```
(`Navigate` già importabile da react-router-dom; verificare import esistenti.)

- [ ] **Step 2: Navbar — voce Blog**

Leggere `Navbar.jsx`, individuare struttura voci menu esistenti e aggiungere voce/dropdown Blog con due link: "Suggerimenti per la carriera" → `/blog/carriera`, "Suggerimenti per il recruiting" → `/blog/recruiting`. Replicare ESATTAMENTE lo stile delle voci esistenti (desktop + menu mobile). Se la navbar non ha dropdown, due voci possono stare sotto un'unica voce "Blog" che porta a `/blog/carriera` con switch in pagina — decidere in base alla struttura reale del file, priorità: zero rottura layout esistente.

- [ ] **Step 3: Blog.jsx homepage — card cliccabili**

In `webapp/src/components/Blog.jsx`: wrappare card carosello in `<Link to={'/blog/' + segment + '/' + slug}>`. Le card oggi vengono da i18n (`blog.candidateArticles`) — mappare per indice ai 10 slug reali (array di mapping id→slug nel componente, candidati→carriera, aziende→recruiting). Titoli sezione "Consigli di carriera"/"Consigli di recruiting" linkano a `/blog/carriera` e `/blog/recruiting`. Non toccare logica GSAP marquee.

- [ ] **Step 4: Verifica manuale rapida**

Run: `npm run dev` → aprire `http://localhost:5173/blog/carriera`, `/blog/recruiting`, un articolo, click da homepage carosello.
Expected: pagine renderizzano, navigazione funziona, nessun errore console.

- [ ] **Step 5: Commit**

```bash
git add webapp/src/App.jsx webapp/src/components/Navbar.jsx webapp/src/components/Blog.jsx
git commit -m "feat(blog): routing, navbar links, clickable homepage carousel cards"
```

---

### Task 9: Sitemap build-time + robots.txt

**Files:**
- Create: `webapp/scripts/generate-sitemap.mjs`
- Modify: `webapp/package.json` (build script)
- Modify/Create: `webapp/public/robots.txt`

- [ ] **Step 1: Script sitemap**

`webapp/scripts/generate-sitemap.mjs`:
```js
// Genera public/sitemap.xml dalle entry blog + pagine statiche.
// Eseguito prima di vite build. Import dell'indice via percorso relativo.
import { writeFileSync } from 'node:fs';
import { blogIndex, slugFor } from '../src/data/blog/blogIndex.js';
import { CATEGORIES, categorySegmentFor } from '../src/data/blog/categories.js';

const SITE = 'https://www.jobcourier.ch';
const LANGS = ['it', 'en', 'de', 'fr'];
const STATIC = ['/', '/offerte', '/soluzioni-e-tariffe', '/come-funziona', '/contatti', '/faq'];

const urls = [];
for (const p of STATIC) urls.push({ loc: `${SITE}${p}` });
for (const catId of Object.keys(CATEGORIES)) {
  const alts = LANGS.map((l) => ({ l, href: `${SITE}/blog/${categorySegmentFor(catId, l)}` }));
  urls.push({ loc: alts[0].href, alts });
}
for (const e of blogIndex.it) {
  const seg = (l) => categorySegmentFor(e.category, l);
  const alts = LANGS.map((l) => ({ l, href: `${SITE}/blog/${seg(l)}/${slugFor(e.slug, l)}` }));
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
```

- [ ] **Step 2: Hook nel build**

`webapp/package.json`:
```json
"build": "node scripts/generate-sitemap.mjs && vite build"
```

- [ ] **Step 3: robots.txt**

`webapp/public/robots.txt`:
```
User-agent: *
Allow: /

Sitemap: https://www.jobcourier.ch/sitemap.xml
```

- [ ] **Step 4: Verifica**

Run: `npm run build`
Expected: "sitemap.xml: 18 URL" (6 static + 2 categorie + 10 articoli) e build ok. Controllare `webapp/public/sitemap.xml` ben formato.

- [ ] **Step 5: Commit**

```bash
git add webapp/scripts/generate-sitemap.mjs webapp/package.json webapp/public/robots.txt webapp/public/sitemap.xml
git commit -m "feat(blog): build-time sitemap with hreflang alternates + robots.txt"
```

---

### Task 10: Verifica end-to-end

**Files:** nessuna modifica prevista (solo fix emersi)

- [ ] **Step 1: Suite test completa**

Run: `npx vitest run` → tutti PASS

- [ ] **Step 2: Verifica visiva Playwright**

Con dev server attivo, screenshot:
- `/blog/carriera` e `/blog/recruiting` a 1440px e 375px
- 1 articolo carriera + 1 recruiting a 1440px e 375px (sidebar sotto articolo su mobile)
Check: breadcrumb dash 28px/fontSize 11, firma emotiva visibile, riquadri CTA/related presenti, FAQ accordion funziona, sidebar sticky su desktop.

- [ ] **Step 3: Verifica SEO nel DOM**

Su pagina articolo (browser eval): `document.title` = metaTitle docx; `document.querySelectorAll('link[hreflang]').length` = 5; `document.querySelectorAll('script[type="application/ld+json"]').length` = 3 (Article, FAQPage, BreadcrumbList).

- [ ] **Step 4: Lint completo**

Run: `npx eslint src --no-warn-ignored` → 0 errori nuovi

- [ ] **Step 5: Commit fix eventuali + screenshot cleanup**

Screenshot diagnostici eliminati a fine verifica (Temp File Rule progetto).

```bash
git add -A webapp/src
git commit -m "fix(blog): verification fixes from e2e pass" # solo se fix presenti
```

---

### Task 11 (Fase 2 — post approvazione v1): Traduzioni EN/DE/FR

**Files:**
- Create: `webapp/src/data/blog/{en,de,fr}/<slug-localizzato>.js` × 30
- Modify: `webapp/src/data/blog/blogIndex.js` (entry en/de/fr + slugTranslations)
- Modify: label hardcoded IT in BlogCategoria/BlogSidebar → chiavi i18n nei 4 locale

- [ ] **Step 1: Genera traduzioni** (subagent paralleli, 1 per lingua)
  - Stessa shape schema, slug localizzato keyword-rich per lingua
  - Terminologia svizzera (de-CH: ß→ss; fr-CH; riferimenti AVS/permessi corretti)
  - Firma da signatures.js (già tradotta)
- [ ] **Step 2: Popola slugTranslations + blogIndex en/de/fr**
- [ ] **Step 3: Test:** estendere loader.test.js — `getArticle(slugDE,'de')` ritorna articolo senza `_fallback`
- [ ] **Step 4: Review umana** — STOP: consegnare file a Emanuele per review Laura/Gabriele su de/fr prima del deploy di quelle lingue
- [ ] **Step 5: Commit per lingua dopo approvazione**

---

## Note esecuzione

- Branch: lavorare su branch corrente o feature branch da `preview/pricing-docx` (decisione a inizio esecuzione)
- STOP & ASK prima di: nuove dipendenze oltre react-helmet-async, modifiche schema dati, deploy
- Deploy production solo su richiesta esplicita di Emanuele
