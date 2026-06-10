# Sezione Blog Job Courier — Design

**Data:** 2026-06-10
**Fonte requisiti:** Mail Gabriele 2026-06-09 "I: Articoli Blog" (+ inoltro Laura 2026-06-08)
**Contenuti:** 10 articoli .docx in `Blog/` (5 Candidati + 5 Aziende, speculari) + `Frasi finali Articoli.docx`

## Requisiti (dalla mail)

1. Articoli Aziende/Candidati speculari
2. Frase di chiusa = "firma" articolo, rilevanza emotiva e visiva
3. Cross-linking tra articoli + colonnina laterale preview (come pagina ricerche)
4. SEO già nei docx (Meta Title + Meta Description per articolo)
5. Tempo di lettura visibile
6. (Laura) Riquadri domande che invitano ad azioni su JC; banner target candidati/aziende

## Decisioni di brainstorming

| Tema | Decisione |
|------|-----------|
| Pagine indice | Due pagine separate: `/blog/carriera` e `/blog/recruiting` (opzione C) |
| Layout dettaglio | Split 65/35 stile OffertaDettaglio, sidebar sticky |
| Riquadri in-articolo | Ibrido: CTA azione JC + riquadro "Leggi anche" correlato semantico |
| Storage contenuti | File JS statici in `src/data/blog/` — schema = contratto per futuro backend AI/Notion |
| Multilingua | Struttura it/en/de/fr dal giorno 1, fallback IT; traduzioni statiche generate da Claude in fase 2, review umana de/fr prima di attivarle |
| Slug | Localizzati per lingua da subito, anche segmento categoria; resolver cross-lingua con redirect |
| Banner grafici | Placeholder v1; slot adv riusa asset esistenti `AdBanner.jsx` (ASFL, Formati Academy, BLC) |
| Banner immagini "spezza-articolo" | Fuori v1 (serve materiale grafico dal cliente) |

## 1. Pagine e routing

```
/blog                  → redirect a /blog/carriera (lingua attiva)
/blog/:categoria       → BlogCategoria  (carriera|career|karriere|carriere ; recruiting)
/blog/:categoria/:slug → BlogArticolo
```

- `BlogCategoria.jsx` — componente unico parametrico. Hero: breadcrumb standard (dash 28px + label fontSize 11 fuchsia uppercase), titolo Playfair italic, subtitle. Griglia 5 card (immagine, titolo, abstract, tempo lettura, CTA "Leggi articolo"). Footer sezione: link incrociato all'altra categoria.
- `BlogArticolo.jsx` — split 65/35 (vedi §3).
- Resolver slug: route cerca lo slug nell'indice su tutte le lingue; se appartiene a lingua diversa da quella attiva → redirect allo slug equivalente della lingua attiva. Nessun 404 da cambio lingua o link esterni.
- Cambio lingua su pagina articolo: switcher naviga allo slug equivalente.
- `Blog.jsx` homepage (carosello) resta; card diventano cliccabili → `/blog/:categoria/:slug`; titoli sezione linkano alle pagine categoria.
- Navbar: voce Blog con due destinazioni ("Suggerimenti per la carriera" / "Suggerimenti per il recruiting" — coerente meeting note).

## 2. Schema dati (contratto futuro backend)

Un file per articolo per lingua: `src/data/blog/{it,en,de,fr}/<slug>.js`

```js
export default {
  slug: 'come-scrivere-un-cv-che-ottiene-colloqui', // localizzato per lingua, keyword-rich
  category: 'carriera',            // 'carriera' | 'recruiting'
  metaTitle: '…',                  // dai docx
  metaDescription: '…',            // dai docx
  title: '…',
  abstract: '…',                   // card + sidebar preview
  readingTime: 8,                  // calcolato parole/200 a estrazione
  datePublished: '2026-06-…',
  image: '…',
  intro: '…',                      // blocco "In sintesi"
  sections: [
    { heading: '…', blocks: ['…'] },
    { cta: { question: '…', action: '…', to: '/offerte' } },        // riquadro azione JC
    { related: { question: '…', slug: '…' } },                       // riquadro "Leggi anche"
  ],
  checklist: ['…'],
  faq: [{ q: '…', a: '…' }],
  signature: 'cand'                // 'cand' | 'az' → frase da signatures.js
}
```

- `signatures.js` — costante condivisa:
  - cand: "Il prossimo lavoro potrebbe essere più vicino di quanto pensi. Se lo cerchi, lo trovi su JobCourier."
  - az: "I candidati giusti fanno la differenza. Se li cerchi, li trovi su JobCourier."
- `blogIndex.js` — indice leggero per lingua (slug, titolo, abstract, categoria, readingTime, image) per card/sidebar/resolver senza caricare interi articoli. Mappa equivalenze slug tra lingue.
- Loader `getArticle(slug, lang)` con lazy import e fallback IT.
- Vincolo: contenuti estratti fedelmente dai docx, nessuna riscrittura.

## 3. Layout BlogArticolo (split 65/35)

**Sinistra (65%):**
- Breadcrumb: dash 28px + "BLOG — CARRIERA|RECRUITING" (fontSize 11, fuchsia, 0.2em, uppercase)
- H1 Satoshi 900 uppercase navy (~32px) + meta riga: chip categoria, tempo lettura, data
- Immagine hero
- "In sintesi": box grigio chiaro, bordo sinistro fuchsia 3px
- Sezioni: H2 Playfair Display italic navy, body Inter (conforme Brand Guidelines: Satoshi display, Playfair editorial, Inter body — verificato in `Brand Guidelines JobCourier.html`)
- Riquadri CTA (1-2/articolo): sfondo navy, domanda Playfair italic bianca, bottone fuchsia → azione JC (carriera → /offerte; recruiting → pricing/contatti)
- Riquadro "Leggi anche": bordo navy sottile, domanda + freccia → articolo correlato
- Checklist: lista con check fuchsia
- FAQ: accordion (pattern pagina FAQ esistente)
- Firma emotiva: separatore + frase Playfair italic ~24px navy, "JobCourier" in fuchsia, sfondo leggero

**Destra (35%, sticky top-28):**
- "Altri articoli": 4 preview card compatte stessa categoria (thumb, titolo, tempo)
- 1 card verso l'altra categoria
- Banner CTA target (placeholder grafico v1): carriera → "Trova il tuo prossimo lavoro" → /offerte; recruiting → "Pubblica il tuo annuncio" → pricing/contatti
- Slot adv: riuso asset AdBanner esistenti
- Mobile: sidebar scende sotto l'articolo

## 4. SEO tecnica

- `react-helmet-async`: title, meta description, canonical, OG (title/description/image/type=article), hreflang ×4 + x-default (IT)
- JSON-LD: `Article` + `FAQPage` (rich snippet dalle FAQ docx) + `BreadcrumbList`
- `sitemap.xml` generato a build time da blogIndex (script Node), ~48 URL (10 articoli + 2 categorie × 4 lingue) con xhtml:link alternates; robots.txt aggiornato
- Tempo lettura calcolato a estrazione (parole/200)
- Limite SPA: meta client-side — ok per Google (renderizza JS); prerendering statico pagine blog = miglioria futura, non blocca lancio

## 5. Fasi implementazione

1. **Estrazione contenuti**: 10 docx → 10 file JS IT (subagent paralleli, fedeltà al testo, meta dai docx)
2. **Componenti**: BlogCategoria, BlogArticolo, riquadri, firma, sidebar, routing+resolver, link navbar/homepage
3. **SEO layer**: helmet, JSON-LD, sitemap script
4. **Verifica**: dev server + Playwright screenshot desktop (1440) / mobile (375), meta nel DOM, Lighthouse SEO
5. **Traduzioni** (post-approvazione v1): 30 file en/de/fr batch → review Laura/Gabriele → attivazione per lingua (fallback IT attivo nel frattempo)

## Fuori scope v1

- Backend AI/Notion per generazione articoli (futuro: produce lo stesso JSON schema via API)
- Banner immagini interni all'articolo (serve materiale grafico cliente)
- Prerendering statico (miglioria SEO futura)
- Slug localizzati: inclusi v1 (decisione utente)

## Domande aperte per il cliente

- Variante firma aziende: "I candidati giusti…" vs "Le persone giuste…" (mail propone entrambe — v1 usa la prima, swap in signatures.js banale)
- Banner grafici target: in attesa asset (placeholder v1)
