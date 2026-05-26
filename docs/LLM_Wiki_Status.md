# LLM Wiki: Job Courier Redesign (Aggiornato: 26 Maggio 2026)

## 📌 Stato Attuale: Operazioni Completate

### 1. Brand Identity & Visual Alignment (Maggio 2026) — ✅ *COMPLETED*
* **Palette Istituzionale**: Applicazione rigorosa dei colori ufficiali da Brand Guidelines:
  * Primary Navy: `#050B2B`
  * Accent Fuchsia: `#FF1F7A`
  * White: `#FFFFFF`
  * Light Gray: `#F6F7FB`
* **Loghi ad Alta Risoluzione**:
  * Sostituiti tutti i vecchi asset raster a bassa risoluzione con i nuovi file ufficiali HD: `logo-full.png` (esteso, **625x278px**) e `logo-square.png` (**1000x1000px**).
  * Ripristinati i tag immagine (`motion.img`) in Navbar e Footer con un'altezza ottimizzata di `h-12 md:h-15` (48px-60px), assicurando una visualizzazione imponente, nitida e priva di margini trasparenti superflui anche su schermi Retina/4K.
  * Favicon aggiornata con successo all'asset ad alta risoluzione `/logo-square.png`.

### 2. Sistema di Interazione: Hover-Glow Dinamico (Maggio 2026) — ✅ *COMPLETED*
* **Componente `AnimatedButton`**: Sviluppato un pulsante a puntatore magnetico tracciato da cursore (60fps fluido), esente da lag da griglia grazie a proprietà CSS accelerate via hardware.
* **Regole di Contrasto Dinamico (Speculari)**:
  * **SU BOTTONI BLU/NAVY (e Outline su Sfondo Blu)**: l'effetto hover proietta un glow **Fucsia di Brand (`#FF1F7A`)**. All'hover il testo dei pulsanti outline (es. *"Come funziona"*, *"Soluzioni e tariffe"*) rimane rigidamente **Bianco (`#FFFFFF`)** per evitare impasti cromatici e garantire leggibilità 1:1.
  * **SU BOTTONI FUCHSIA**: l'effetto hover proietta un glow **Blu/Navy di Brand (`#050B2B`)**, preservando il testo bianco brillante ed esaltando il contrasto.
* **Integrazione Globale**: Sostituiti tutti i bottoni tradizionali/link all'interno delle modali critiche dell'applicazione per garantire uniformità:
  * `Navbar.jsx` (Navy CTA)
  * `Hero.jsx` (Selettori di ricerca, CTA ed outline *"Altri Link"*)
  * `ApplyRedirectModal.jsx` (CTAs di candidatura esterna)
  * `RegistrationWallModal.jsx` (CTA paywall di registrazione)

### 3. Debugging & Stabilità a Runtime — ✅ *COMPLETED*
* **Hotfix ReferenceError**: Risolto crash a runtime sul deploy di produzione (`style is not defined`) in `animated-button.jsx` inserendo la destrutturazione di `style` nella firma di `HoverButton` ed eseguendo il merge corretto con l'oggetto di stile interno, prevenendo sovrascritture causate dallo spread operator (`...props`).

### 4. Hero, Navbar & UI Layout (Aprile 2026) — ✅ *COMPLETED*
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
