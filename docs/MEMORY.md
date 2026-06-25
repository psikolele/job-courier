# Job Courier — Persistent Project Memory
**Last updated:** 2026-06-16
**Maintained by:** Claude Code + Emanuele Serra

---

## 🏢 Project Identity

- **Client:** Job Courier (jobcourier.ch)
- **Type:** Swiss job marketplace (React SPA)
- **Backend:** JobRoom API (external, scraped via `/api/jobs`, `/api/job-detail`)
- **PM/Tech:** Emanuele Serra (serra.emanuele09@gmail.com)
- **Client contact:** Gabriele Molteni (g.molteni@blc-sa.ch) — BLC-SA
- **Repo branch:** `feature/brand-identity-v1` → `main`
- **Deploy:** Vercel

---

## 🎨 Brand System

| Token | Value |
|-------|-------|
| `--brand-navy` | `#050B2B` |
| `--brand-fuchsia` | `#FF1F7A` |
| White | `#FFFFFF` |
| `--brand-gray-light` | `#F6F7FB` |
| `--brand-gray-mid` | (muted navy) |
| `--font-brand` | Satoshi |
| `--font-editorial` | Playfair Display |
| `--font-body` | (system/body) |

**Logos (HD):**
- `logo-full.png` — 625×278px (Navbar/Footer)
- `logo-square.png` — 1000×1000px (Favicon)
- Navbar height: `h-12 md:h-15` (48–60px)

**Button contrast rules (AnimatedButton):**
- Navy/Blue button → hover glow Fuchsia; outline text stays White
- Fuchsia button → hover glow Navy; text stays White

---

## 🗂️ Architecture

```
webapp/src/
├── App.jsx                          Routes: /, /offerte, /offerta/:id, /soluzioni-e-tariffe, /contatti, /come-funziona
├── components/
│   ├── Navbar.jsx                   Always-visible, shrink 72→60px on scroll, white bg, login modal
│   ├── Hero.jsx                     60/40 split (Candidates/Employers), GSAP, search form
│   ├── Filters.jsx                  Filter bar (region, sector, keyword)
│   ├── Blog.jsx                     50/50 split, async carousels (5s / 5.3s)
│   ├── Vetrini.jsx                  Premium company showcase (15 companies, grid 2-5 cols)
│   ├── AdSlot.jsx / AdBanner.jsx    Monetization slots
│   ├── Stats.jsx                    Statistics section
│   ├── CTA.jsx                      Call-to-action section
│   ├── ApplyRedirectModal.jsx       "Ti stiamo portando su un altro sito" modal
│   ├── RegistrationWallModal.jsx    Paywall registration modal
│   └── ui/
│       ├── animated-button.jsx      Magnetic hover-glow button (60fps, hardware-accelerated)
│       └── animated-slideshow.jsx   Slideshow component
├── pages/
│   ├── Home.jsx
│   ├── Offerte.jsx                  Job list (40%) + detail (60%) split, desktop/mobile adaptive
│   ├── OffertaDettaglio.jsx         Full-page job detail (mobile)
│   ├── Pricing.jsx
│   ├── Contact.jsx
│   └── ComeFunziona.jsx
├── hooks/
│   └── useRegistrationWall.js       3-click paywall logic (localStorage)
└── utils/
    └── applyHelper.js               Determines redirect vs internal apply flow
```

---

## ✅ Completed Work (Chronological)

### Aprile 2026
- Navbar refactor: sempre visibile, sfondo white/98, shrink on scroll, rimozione anchor #blog
- Hero 60/40 split: Candidati (light bg, search form) + Aziende (dark bg, CTA)
- Login modal restyling: sharp rectangular borders, Navy/Fuchsia
- GSAP: magnetic scale + slide-down animations (Navbar menu, links, CTA)
- AdSlots: sostituzione vecchia CTA ridondante con 2 slot flex-row 50/50 lazy load
- Blog 50/50 split "Clinical Boutique": caroselli asincroni 5s / 5.3s
- Pricing page: implementazione completa
- Offerte page: split layout desktop (40/60), mobile full-screen with back button

### Maggio 2026
- Palette istituzionale Navy/Fuchsia applicata globalmente
- Loghi HD: `logo-full.png` (625×278) + `logo-square.png` (1000×1000), Favicon aggiornata
- AnimatedButton: hover-glow magnetico con regole contrasto dinamico speculari
  - Integrato: Navbar, Hero, ApplyRedirectModal, RegistrationWallModal
- RegistrationWallModal: paywall di registrazione
- ApplyRedirectModal: modal "candidatura su sito esterno"
- useRegistrationWall hook: counter 3-click in localStorage
- **Hotfix produzione:** `style is not defined` in `animated-button.jsx` → destrutturazione `style` in firma `HoverButton` + merge corretto con spread operator

---

### Giugno 2026
- **Sezione Blog completata e mergiata in `main`** (branch `feature/blog-section`, ff-merge `1894c70`, 91 file):
  - 40 articoli (10 IT + 10 EN + 10 DE + 10 FR), pagine `BlogArticolo.jsx` / `BlogCategoria.jsx`, sidebar, FAQ, CTA/related box, firma articolo
  - Sitemap build-time con hreflang/x-default + robots.txt, canonical URL normalizzati
  - Nuovo block-type `{ list: [...] }` nel renderer articoli: marker quadrato fuchsia 6×6px + fade-in animato on-scroll (motion.li, stagger 0.08s)
  - Conversione a `{ list: [...] }` applicata a 19 sequenze (domande/citazioni/step) su tutti i 10 articoli IT
- **UI Consistency Audit** (su tutte le pagine): margini/spacing H1 e testo principale uniformati, ritmo sezioni Home standardizzato, blog list ridisegnata su brand identity
  - Nuovi componenti riusabili: `SectionLabel`, `ArticleCard` (estratto da Blog.jsx)
  - `AdBanner`: rimosso filtro grayscale-on-hover, immagini ADV ora a colori pieni
  - `Offerte.jsx`: scrollbar hover-reveal (`.scroll-fade`) su lista e dettaglio annunci
- Italiano impostato come lingua di lavoro globale (root `CLAUDE.md`, tutti i 20 progetti Antigravity)
- **Route Loader "Courier Dot"** implementato e mergiato in `main` (branch `feature/route-loader`, commit `cd8fbf2`):
  - Overlay full-screen CSS-only ad ogni cambio pathname, durata fissa 1200ms
  - Sequenza: linea fuchsia 1px top → dot fuchsia percorre rotta sx→dx → logo reale `/logo-full.svg` sale lentamente 2px sopra la linea → 2 battiti di cuore lenti (scale 1.06) → fade-out
  - File: `webapp/src/components/ui/RouteLoader.jsx`, `webapp/src/hooks/useRouteLoader.js`, keyframes `.jcl-*` in `index.css`, aggancio in `App.jsx`
  - `prefers-reduced-motion`: solo fade del logo centrato (≤400ms), niente movimento
  - Zero dipendenze Remotion in bundle; Remotion resta studio separato opzionale
- **Sessioni 23-25 Giugno 2026** (8 commit di rifinitura UI/UX e funzionalità):
  - **Footer Social & RSS** (commit `0594b12`): Aggiunti link social Instagram/Facebook nel footer e modale per feed RSS.
  - **Rifiniture Layout & Responsive** (commit `0f09548`, `6ac81c9`, `a471dad`): Alzato il breakpoint di split dell'Hero da md (768px) a lg (1024px); visualizzato solo il pittogramma del logo sulla navbar mobile; ridotta la Hero mobile search placeholder font.
  - **Allineamento Blog & Ads** (commit `2154ff7`, `75f1689`): Sistemati i breadcrumb e il titolo a 2 righe nel blog, larghezza annunci al 95%.
  - **Rework Pricing & Glassmorphism** (commit `6f7d305`, `4012150`): Ridisegnata la sezione statistiche del pricing con 5 card a effetto glassmorphism (sfocatura dello sfondo, angoli arrotondati e sollevamento al passaggio del mouse); CTAs allineate e impostate su "Contattaci".

---

## 🚀 Backlog (da LLM_Wiki_Status.md — pre-meeting 26/05)

| # | Task | Stato |
|---|------|-------|
| A | Paywall incrementale 3 click (localStorage counter → mostra RegistrationWallModal) | ✅ Completato |
| B | Template `/offerta/:id` — rotta interna completa con CTA "Candidati Ora" | ⏳ File esiste (OffertaDettaglio.jsx), da completare |
| C | Componente Vetrini integrato in homepage | ✅ Completato |
| D | Sezione Referenze/Testimonianze in fondo homepage | ❌ Non iniziato |
| E | Uniformità H1 Candidati/Aziende — dimensioni simmetriche GSAP | ⏳ Parziale |

---

## 📋 Task da Meeting 26/05/2026 (Emanuele + Gabriele)

### TASK 1 — Brand Guideline BLC [Michelle]
- Definizione e allineamento delle linee guida del brand BLC
- Escluso da questo progetto

### TASK 2 — Sistema Email Automation [Gabriele]
- Input: Excel database contatti (colonne: nome azienda, dati, mail, lingua, tipo offerta, tipo agenzia)
- Discriminanti: lingua (colonna) + tipo offerta + tipo agenzia
- Claude/AI scrive la mail nella lingua corretta dal concept fornito da Emanuele
- Logica di follow-up:
  - No risposta → coda → resend schedulato
  - Non interessato → sospeso → ricontatto fra 3 mesi
  - Interessato → email follow-up avanzato
- Emanuele manderà il primo file Excel + concept mail trigger

### TASK 3 — Hero Destra: Sezione Statica (no slider) [Gabriele]
- Rimuovere comportamento slider dalla sezione destra Hero
- Renderla STATICA
- Rimuovere immagine di background dall'area slider
- Slider rimane vuoto (verrà riempito con numeri/contenuto commerciale futuro)

### TASK 4 — Job Listing Cards: Allineamento + Hover [Gabriele]
- Candidati e Aziende cards: stessa larghezza E altezza
- Stessa altezza dei tag interni
- Rimozione bordatura esterna (non piace)
- Aggiunta riga sottile bottom della card (coerente con altri elementi grafici)
- Hover: leggero cambio colore background al mouse-over

### TASK 5 — Filtri: Bottom Border Riga [Gabriele]
- Riga sottile piena larghezza sotto la sezione filtri
- NON troppo fuchsia — 1px, appena percettibile
- Bianco su bianco = invisibile attuale → renderla visibile ma discreta

### TASK 6 — Hero: Background Sinistro + Colori [Gabriele]
- Aggiungere elemento background lato sinistro (dietro contenuto), colore Navy `#050B2B`
- Logo prominente
- Testi: bianco o fuchsia (lasciare fuchsia dove poca scrittura visibile)

### TASK 7 — Popup Automatico 2 secondi (Pagina Annunci) [Gabriele] 🔴 ALTA
- Appare automaticamente dopo 2s dal caricamento pagina `/offerte`
- Contenuto: invito a registrarsi o fare login
- Due CTA: "Iscriviti" (→ registrazione candidato) + "Login" (→ link login)
- I due link portano a destinazioni diverse
- Contesto: quando utente clicca annuncio, JobRoom apre in nuova finestra; popup interno cattura registrazione in parallelo

### TASK 8 — Vetrini: Layout Finale [Gabriele]
- 3 card sopra + 3 card sotto con linea divisoria centrale
- Logo azienda visibile, sfondo blu, testi bianchi/fuchsia
- Hover: card si colora al passaggio mouse
- Rimuovere bordatura esterna extra, tenere solo linea sottile
- Logo dimensione aumentata rispetto alle versioni piccole

### TASK 9 — Piano Formazione Michelle [Emanuele] 🟢 ONGOING
- Step 1: Brand Guideline BLC (Task 1)
- Step 2: Sito BLC (escluso da questo progetto)
- Step 3: Incrementalmente, aiuto su processi automation
- Approccio: task-by-task, NON blocco monolitico
- No n8n in autonomia per ora

### TASK 10 — Fix Login Modal: Bordatura + Font [Gabriele]
- Modal login ha acquisito bordatura inaspettata (bottone login troppo prominente)
- Font e colori brand non ancora applicati correttamente
- Fix: rimuovere bordatura esterna non voluta, applicare font/colori brand

---

## 🔑 Chiavi Tecniche Importanti

**API endpoints:**
- `GET /api/jobs?keyword=&region=&role_id=&location=` → lista annunci
- `GET /api/job-detail?id={jobroom_id}` → dettaglio scraped da JobRoom

**JobRoom integration:**
- Annunci esterni: `job.redirect === true` → ApplyRedirectModal → link esterno
- Annunci interni: `applyHelper.js` gestisce il flow
- `job.jobroom_id` è l'ID usato per scraping dettaglio

**useRegistrationWall hook:**
- Conta click in localStorage
- Al 3° click mostra RegistrationWallModal
- Reset ogni 24h

**Routing:**
- Desktop Offerte: split view con `?jobId=` query param
- Mobile Offerte: naviga a `/offerta/:jobroomId` full screen

---

## 📁 File Chiave per Sviluppo

| File | Scopo |
|------|-------|
| `webapp/src/components/Hero.jsx` | Hero principale, search, GSAP |
| `webapp/src/components/Navbar.jsx` | Navbar, login modal |
| `webapp/src/pages/Offerte.jsx` | Lista annunci + split view |
| `webapp/src/components/Vetrini.jsx` | Showcase aziende premium (15 co.) |
| `webapp/src/components/Filters.jsx` | Filtri ricerca |
| `webapp/src/components/ui/animated-button.jsx` | Bottone magnetico brand |
| `webapp/src/hooks/useRegistrationWall.js` | Paywall logic |
| `webapp/src/utils/applyHelper.js` | Apply redirect/internal logic |
| `docs/LLM_Wiki_Status.md` | Stato operazioni correnti |
| `docs/MEMORY.md` | Questo file |

---

## 📰 Sezione Blog — ✅ COMPLETATO E LIVE (live su `main` dal 2026-06-15)

**Requisiti originali (Mail Gabriele 2026-06-09 "I: Articoli Blog"):**

**Contenuti:** 10 articoli .docx in `Blog/` — 5 Candidati (Art.1-5.Cand_) + 5 Aziende (Art.1-5.Az_), speculari tra loro. ~1.300-1.600 parole ciascuno (~14.4k totali). Template identico: Meta Title + Meta Description (SEO già pronta), "In sintesi", sezioni body (bold paragraphs, non heading styles Word), "Piano pratico 30 giorni" (quasi tutti), "Checklist finale", "FAQ" (5-6 domande), "Conclusione".

**Requisiti Gabriele:**
1. Articoli Az/Cand speculari (stessi temi a specchio)
2. Frase di chiusa = "firma" articolo, rilevanza emotiva e visiva (da `Frasi finali Articoli.docx`):
   - Cand: "Il prossimo lavoro potrebbe essere più vicino di quanto pensi. Se lo cerchi, lo trovi su JobCourier."
   - Az: "I candidati giusti fanno la differenza. Se li cerchi, li trovi su JobCourier." (variante: "Le persone giuste…")
3. Cross-linking tra articoli + colonnina laterale preview altri articoli (come pagina ricerche/Offerte)
4. SEO meta già dentro i docx
5. Tempo di lettura visibile (~6-8 min ad articolo)

**Spunti aperti (Laura):** banner target candidati/aziende dentro articolo; riquadri immagine o "riquadri domande" CTA che spezzano il testo.

**Stato attuale codice (✅ implementato):** `Blog.jsx` = carosello homepage (MarqueeSlider career/recruiting). `BlogCategoria.jsx` = lista articoli per categoria. `BlogArticolo.jsx` = dettaglio articolo (sections/heading/blocks, CTA, related, FAQ, checklist, firma, sidebar). Dati in `data/blog/{it,en,de,fr}/<slug>.js`, indice in `blogIndex.js`, loader in `loader.js`. Tutti i requisiti sopra soddisfatti (speculari Cand/Az, firme, cross-linking via `related`, SEO via `BlogSeo.jsx` + sitemap hreflang, reading time).

---

## 🗓️ Meeting Log

| Data | Partecipanti | Topic |
|------|-------------|-------|
| 2026-03-27 | Emanuele + Gabriele | Feedback UI, API dashboard, gestione team |
| 2026-04-10 | Emanuele + Gabriele | Revisione avanzamento, urgenze |
| 2026-05-20 | Emanuele + Gabriele | Rebranding, layout cards, accessibilità |
| 2026-05-26 | Emanuele + Gabriele | Task assignment, email automation, popup, BLC |
