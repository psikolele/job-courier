# LLM Wiki: Job Courier Redesign (Aggiornato: 26 Giugno 2026)

## 📌 Stato Attuale: Operazioni Completate

### 1. Handoff Refinements & Pricing Redesign (Giugno 2026) — ✅ *COMPLETED*
* **DotCard Animation & Responsiveness**: Risolto il conflitto con Flexbox introducendo un contenitore assoluto `.jc-dot-border-container` (85% di larghezza/altezza, centrato) per racchiudere il pallino `.jc-dot-dot`. Riscritto `@keyframes moveDot` con coordinate percentuali `left`/`top` e allineamento `transform: translate(-50%, -50%)` per seguire i bordi della card in modo perfettamente responsivo. Rilevamento automatico della lunghezza del testo del contatore (se > 7 caratteri, ad esempio `120'000+`) per ridurre la dimensione del font a `1.9rem` (invece di `2.4rem`), eliminando i problemi di clipping laterale.
* **Footer Login Modal Trigger**: Risolto il problema del link non funzionante `#login` nel Footer passando la prop `setShowLoginModal` da `App.jsx` a `<Footer />` e aggiungendo un gestore `onClick` per intercettare i click con `href === '#login'`, che apre direttamente il modal del login.
* **API Cookie Parsing Fix**: Corretto il crash del backend in `webapp/api/job-detail.js:38` (dovuto alla deprecazione/assenza di `headers.raw()` in `node-fetch` v3). Ora viene utilizzato `sessionResponse.headers.get('set-cookie')` ed estratto il token di sessione con una regex robusta `/,(?=\s*[a-zA-Z0-9_]+=)/` per prevenire divisioni errate sulle virgole interne alle date di scadenza dei cookie.
* **Redesign della Pagina Pricing**: Completato il restyling completo di `Pricing.jsx` nello stile visuale "Organic Tech". Strutturato in 2 tab navigabili: `Aziende & PMI` (con 3 card di prezzo: Job Post Basic a CHF 249, Pack 5 Boost a CHF 890 con fucsia highlight, e Piano Continuo da CHF 1'200; affiancate da una sidebar con i vantaggi di brand) e `Agenzie di selezione` (con una schermata di invito a richiedere offerte personalizzate per volumi massivi tramite bottone verso `/contatti`).

### 2. Brand Identity & Visual Alignment (Maggio 2026) — ✅ *COMPLETED*
* **Palette Istituzionale**: Applicazione rigorosa dei colori ufficiali da Brand Guidelines:
  * Primary Navy: `#050B2B`
  * Accent Fuchsia: `#FF1F7A`
  * White: `#FFFFFF`
  * Light Gray: `#F6F7FB`
* **Loghi ad Alta Risoluzione**:
  * Sostituiti tutti i vecchi asset raster a bassa risoluzione con i nuovi file ufficiali HD: `logo-full.png` (esteso, **625x278px**) e `logo-square.png` (**1000x1000px**).
  * Ripristinati i tag immagine (`motion.img`) in Navbar e Footer con un'altezza ottimizzata di `h-12 md:h-15` (48px-60px), assicurando una visualizzazione imponente, nitida e priva di margini trasparenti superflui anche su schermi Retina/4K.
  * Favicon aggiornata con successo all'asset ad alta risoluzione `/logo-square.png`.

### 3. Sistema di Interazione: Hover-Glow Dinamico (Maggio 2026) — ✅ *COMPLETED*
* **Componente `AnimatedButton`**: Sviluppato un pulsante a puntatore magnetico tracciato da cursore (60fps fluido), esente da lag da griglia grazie a proprietà CSS accelerate via hardware.
* **Regole di Contrasto Dinamico (Speculari)**:
  * **SU BOTTONI BLU/NAVY (e Outline su Sfondo Blu)**: l'effetto hover proietta un glow **Fucsia di Brand (`#FF1F7A`)**. All'hover il testo dei pulsanti outline (es. *"Come funziona"*, *"Soluzioni e tariffe"*) rimane rigidamente **Bianco (`#FFFFFF`)** per evitare impasti cromatici e garantire leggibilità 1:1.
  * **SU BOTTONI FUCHSIA**: l'effetto hover proietta un glow **Blu/Navy di Brand (`#050B2B`)**, preservando il testo bianco brillante ed esaltando il contrasto.
* **Integrazione Globale**: Sostituiti tutti i bottoni tradizionali/link all'interno delle modali critiche dell'applicazione per garantire uniformità:
  * `Navbar.jsx` (Navy CTA)
  * `Hero.jsx` (Selettori di ricerca, CTA ed outline *"Altri Link"*)
  * `ApplyRedirectModal.jsx` (CTAs di candidatura esterna)
  * `RegistrationWallModal.jsx` (CTA paywall di registrazione)

### 4. Debugging & Stabilità a Runtime — ✅ *COMPLETED*
* **Hotfix ReferenceError**: Risolto crash a runtime sul deploy di produzione (`style is not defined`) in `animated-button.jsx` inserendo la destrutturazione di `style` nella firma di `HoverButton` ed eseguendo il merge corretto con l'oggetto di stile interno, prevenendo sovrascritture causate dallo spread operator (`...props`).

### 5. Hero, Navbar & UI Layout (Aprile 2026) — ✅ *COMPLETED*
* **Navbar Sempre Visibile**: Rimosso lo stato trasparente allo scroll di partenza. Navbar sempre attiva con sfondo `white/98`, shrinkage di altezza `72px -> 60px` ed attivazione progressiva di ombra all'aumentare dello scroll.
* **Spazi Pubblicitari (AdSlots)**: Eliminata la vecchia sezione CTA ridondante e sostituita con due ampi spazi AdSlot flex-row 50%/50% a caricamento lazy per massimizzare la monetizzazione.
* **Blog 50/50 Split**: Layout "Clinical Boutique" totalmente bianco spezzato in due colonne asincrone (Candidati a sx con carosello 5s, Aziende a dx con carosello 5.3s).

### 7. Notion CRM Integration & Snapshot Rebuild (Luglio 2026) — ✅ *COMPLETED*
* **Importazione e Allineamento Categoria**: Sviluppato lo script di sincronizzazione `sync_categories_to_notion.py` che ha mappato e importato le categorie `Temp`, `Perm` e `Temp e Perm` dal file Excel `.raw/20260629_Agenzie_CH_aggiornate_2026.xlsx` su Notion (353 pagine Notion aggiornate con un match rate del 98.5% e 0 errori).
* **Vercel Blob Snapshot Cache**: Configurato il Vercel Blob store `jc-crm-blob` per ospitare lo snapshot cache JSON contenente tutte le **6.138 aziende e contatti** raggruppati lato server Next.js. Questo bypassa i limiti di rate-limiting di Notion e ottimizza il caricamento della pipeline e delle tabelle a schermo.
* **Middleware Rebuild Protection**: Modificato `middleware.ts` per consentire all'endpoint `/api/companies/rebuild` di bypassare NextAuth se l'header `x-rebuild-secret` corrisponde alla variabile d'ambiente `REBUILD_SECRET`.
* **Automazione Cron Job su n8n**: Sviluppato lo script `deploy_rebuild_cron.mjs` ed attivato il workflow cron job `"JC CRM - Rebuild Snapshot Cron"` (ID: `TtIVXWWuyfAgawl6`) su `emanueleserra.app.n8n.cloud` per innescare la ricostruzione automatica dello snapshot in Vercel Blob ogni 15 minuti.
* **Audit di Verifica & Esportazione**: Creato lo script di controllo `verify_and_export.py` che ha confermato un'unione dei dati con copertura superiore al 98.5% rispetto a tutti i file di input storici e generato il file Excel consolidato `Notion_CRM_Export_Gabriele.xlsx` (6.138 righe) pronto per Gabriele.

### 6. LLM-Enhanced Job Matching — 3-Phase Plan (Giugno 2026) — 🔴 *IN PROGRESS*

**Handoff:** `docs/handoff-2026-06-25.md` | **Piano:** `docs/IMPLEMENTATION_PLAN_2026-06-25.md` | **Meeting:** `docs/MEETING_SUMMARY_2026-06-25.md`

**Contesto:** 2 sessioni meeting Otter.ai (49 min totali, 25 giugno). Session 1 = LinkedIn automation strategy. Session 2 = Database + email automation design. Entrambe mappate direttamente su Job Courier come blueprint architetturale.

#### Phase 1 — Foundation (NOW, 2-3 settimane, target 15 luglio)
* **P1.1 Tassonomia Normalizzata:** Centralizzare enums cantoni→regionId, settori→sectorId in `utils/taxonomy.js`. Cross-reference ISCO-08/O*NET. 26 cantoni svizzeri + 15+ settori. Effort: 1 settimana.
* **P1.2 Search Indexing (Elasticsearch):** Sostituire scraping HTML raw (3 page concurrent, 45 jobs max) con Elasticsearch index. Sub-100ms retrieval, full-text + filtri. Docker-compose per ES 8.11.0. Pipeline: Scraper → Indexer → API. Effort: 1.5 settimane.
* **P1.3 Faceted Navigation:** Conteggi live per cantone/settore/livello esperienza. Salary range slider. Aggregation queries ES. Componente `FacetedSearch.jsx`. Effort: 1 settimana.
* **Checkpoint Phase 1:** Staging deploy con 10k+ offerte indicizzate, ricerca <100ms, filtri funzionanti.

#### Phase 2 — Semantic Matching (4-6 settimane, target fine agosto)
* **P2.1 Vector Embeddings:** 768-dim embeddings per job descriptions. OpenAI `text-embedding-3-small` ($0.02/1M tokens) o HuggingFace `paraphrase-multilingual-mpnet-base-v2` (gratuito, supporta IT+DE). Hybrid search keyword+vector (30%/70% weight).
* **P2.2 LLM Query Understanding:** Claude API per parsing query strutturato → skills, experience_level, location, remote_preference. Costo ~$0.10-0.50/1k queries.
* **P2.3 Skills Graph:** Grafo bidirezionale skill con distanza (adjacent=0.5, similar=0.7). 500+ skills target. Auto-expand query "React" → include "Vue", "Angular".
* **P2.4 LLM Ranking + Explainability:** Claude re-rank top-20 con match score 0-10 + reasoning. UI `JobCardWithReasoning.jsx`.

#### Phase 3 — Personalization (6-8 settimane, target fine ottobre)
* **P3.1 Candidate Profiles:** Search history, click tracking, application signals, saved jobs.
* **P3.2 Unified Recommendation Model:** SilverTorch pattern — retrieval+ranking in single stage (23.7x faster).
* **P3.3 Dual-Perspective Reasoning:** Match under hard constraints (certificazione, visa, location) + soft signals.

#### Discriminanti Chiave (da Session 2 meeting)
| Discriminante | Impatto |
|---------------|---------|
| **Lingua** (IT/DE/FR/EN) | Template email, lingua job alerts |
| **Cantone** (26 CH) | Filtro regionale, regionId mapping |
| **Tipo Azienda** (Corporate vs Staffing) | Contenuto outreach diverso |
| **Tipo Impiego** (Permanent/Temporary/Contract) | Value proposition diversa |
| **Livello Esperienza** (Junior/Mid/Senior) | Matching candidato-offerta |

#### Assegnazioni
* **Emanuele S.:** Phase 1 (ES setup, tassonomia, UI filtri) — 3.5 settimane
* **Michele:** Phase 2 (embeddings, LLM query, skills graph) — 5 settimane post-Phase 1

#### Costi Stimati
| Componente | Costo |
|-----------|-------|
| Elasticsearch Cloud | ~$500/mese |
| OpenAI Embeddings | ~$200 (una tantum, 10k jobs) |
| Claude API (query+ranking) | ~$150/mese |
| **Totale** | **~$850/mese** |

#### Blockers per Gabriele (in attesa feedback)
1. Risorse: Emanuele + Michele 100% dedicati?
2. Infrastruttura: ES cloud vs self-hosted?
3. Budget API: Claude + OpenAI approvato?
4. Scope Phase 1 lock
5. Timeline OK?
6. Standup frequency?

**Mail bozza pronta:** `GMAIL_DRAFT_GABRIELE.txt` → `g.molteni@jobcourier.ch` (CC: emanuele.serra, michele). Mail NON ancora inviata (Gmail MCP non disponibile il 25/06).

### 8. Modifiche Sito richieste da Laura (26 Luglio 2026) — 🔴 *DA IMPLEMENTARE*
* **Dettaglio completo:** `docs/MODIFICHE_SITO_2026-07-26.md`
* Go-live target: 30.07–03.08.2026. Check finale vdc: mer 29 (16-19:30) o gio (11-12).
* Copre: titoli Home, link menu Azienda, sezione Aziende Partner, sezione Formazione continua (Ated+Supsi separata da ASFL/BLC), titoli blog, copia statica pagina "Aziende che assumono", 4 immagini "Come funziona", testi pagina Soluzioni, correzioni legali Cookie Policy (JobCourier Sagl, Riva San Vitale, privacy@jobcourier.ch). Pagina Contatti in attesa di contenuti da Laura.

---

## 🚀 Prossime Operazioni & Task Rimasti (Missing Tasks)

1. **Paywall Incrementale a 3 Click**:
   * Sviluppare nello state globale (o local storage) il contatore di click sugli annunci: giunto al terzo click, l'utente visualizza `RegistrationWallModal` per costringerlo alla registrazione gratuita.

2. **Template Dettaglio Annuncio Interno**:
   * Completare la rotta `/offerta/:id` in sostituzione dei redirect esterni diretti di JobRoom. Il template deve presentare le informazioni strutturate dell'offerta e mostrare come unica CTA il pulsante *"Candidati Ora"* (gestito tramite `ApplyRedirectModal`).

3. **Integrazione Componente Vetrini**:
   * Integrare il componente `<Vetrini />` per le aziende premium direttamente in homepage sotto la sezione delle statistiche o del manifesto.

4. **Sezione Referenze / Testimonianze**:
   * Creare una sezione dedicata in fondo alla homepage per accogliere due grandi card per i testimonial/referenze aziendali.

5. **Uniformità Dimensioni H1**:
   * Controllare che l'animazione GSAP / CSS di ridimensionamento degli H1 Candidati e Aziende mantenga dimensioni rigorosamente speculari e simmetriche anche a riposo.

---

## 📝 Notion Documentation Standard

Tutte le sessioni create su Notion (es. "Sessioni di Lavoro" o "Devlog") **DEVONO** seguire il seguente template di struttura a blocchi (ispirato allo stile "Premium/Clinical"):

1. **Paragraph**: `🚀 [Tipo] [Nome Progetto] — [Titolo Sessione]`
2. **Heading 2**: `🎯 Obiettivo della sessione`
3. **Paragraph**: `**Conclusione:** [Testo del riassunto]`
4. **Paragraph**: `**📋 Attività svolte:**`
5. **Bulleted List**: Elenco dei compiti completati
6. **Divider**
7. **Heading 2**: `✅ Risultati raggiunti`
8. **Paragraph (Opzionale)**: Sottotitolo in bold es. `**UI/UX Components:**`
9. **Bulleted List**: Elenco dei risultati
10. **Divider**
11. **Heading 2**: `📋 Prossimi passi`
12. **Bulleted List**: Elenco dei prossimi passi
