# LLM Wiki: Job Courier Redesign (Aggiornato: 4 Giugno 2026)

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
