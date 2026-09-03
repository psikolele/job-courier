# Piano implementazione — riunione Gabriele 03.09.2026

**Fonte:** trascrizione meeting (`P.txt`, ~1h22, 4 partecipanti). Brainstorming libero, non un piano già approvato — priorità dichiarata da Gabri: fix sito + SEO, il resto (CRM, dashboard FTP) è parallelo/successivo.

**Bloccanti esterni:** vedi mail "Job Courier — 4 cose che mi servono per partire" (bozza, non ancora inviata). Sprint 0 va risolto prima o in parallelo agli sprint 1-3.

---

## Sprint 0 — Sblocco dipendenze (non-code)

Nessuno di questi task è nostro codice, ma Sprint 1-6 ci sbattono contro.

- [ ] Arca24/Laura → file di esempio estrazione FTP + host + orario + delta o completo
- [ ] Gabri → OK scritto blog automatico + accesso pagina LinkedIn Job Courier
- [ ] Semrush → risposta al sollecito, altrimenti chiudere e valutare Ahrefs
- [ ] Arca24 → richiesta ads sull'applicativo jobroom (non è codice nostro)
- [ ] Gabri → chiarire strategia: applicativo "canale principale" vs `jobcourier.ch` "obiettivo primario" (impatta dove investire su SEO/ads)

---

## Sprint 1 — Quick fix, zero dipendenze

### Task 1.1: Tag "NUOVO" più visibile
**File:** `webapp/src/pages/Offerte.jsx` (badge data/nuovo, vedere riga con criterio data già agganciato)
- Bold + nero (non fucsia, scartato in riunione da Gabri)

### Task 1.2: Traduzioni condizioni/cookie/privacy/registrazione
**File:** `webapp/src/pages/CondizioniGenerali.jsx`, `CookiePolicy.jsx`, componenti i18n collegati
- Blocco condizioni generali/cookie policy/privacy non tradotto in EN/DE/FR
- L'URL non cambia al cambio lingua per queste pagine → verificare routing i18n

### Task 1.3: Redirect candidatura esterna
**File:** `webapp/src/components/ApplyRedirectModal.jsx`, `webapp/src/pages/Offerte.jsx:746`, `webapp/src/pages/OffertaDettaglio.jsx:405`
- Il componente esiste già ed è montato su entrambe le pagine — **non riscrivere, debuggare**
- Bug riportato: da alcune card il redirect non parte, serve doppio click
- Verificare rilevamento "ha apply esterna" per singola offerta (non tutte ce l'hanno)
- Aggiungere pagina di transizione brandizzata (loader con logo, animazione semplice) al posto di quella jobroom di default — è un layer sopra il modale esistente

---

## Sprint 2 — Logica ricerca e lista offerte

### Task 2.1: Parità ricerca widget home ↔ pagina offerte
**File:** `webapp/src/components/JobSearchWidget.jsx`, `webapp/src/pages/Offerte.jsx`
- Bug riportato: `HR` + Ticino da widget home → nessun risultato; stessa query da `/offerte` → funziona, ma restituisce "saldatore" per `HR`
- Causa nota: comportamento ricerca libera upstream Arca24, non completamente risolvibile lato nostro — mitigare con match su titolo/query più stretto, ma **segnalare a Gabri come limite upstream**, non prometterlo come fix completo

### Task 2.2: Criterio unico lingua+data con fallback
**File:** `webapp/src/pages/Offerte.jsx`, `webapp/src/pages/Home.jsx` (widget correlate)
- IT→Ticino, EN→Ticino, DE→cantoni tedeschi, FR→cantoni francesi
- Fallback: se vuoto nella lingua/cantone selezionato → mostrare Ticino (mai lista vuota)
- Cap **max 2 offerte per azienda** in vetrina/correlate (evita predominanza brand)
- Su "tutte le offerte" (`Offerte.jsx`): **solo lingua+data, nessun cap** (deciso in riunione, Gabri ha ritrattato la proposta di cap 5)

---

## Sprint 3 — Layout pagina offerte

### Task 3.1: Altezza dinamica invece di scroll interno
**File:** `webapp/src/pages/Offerte.jsx` (colonna dettaglio + colonna lista)
- Oggi: colonna dettaglio ha altezza fissa con scroll interno, troppi scroll
- Richiesto: la pagina si allunga all'altezza del dettaglio, non scrolla nel riquadro
- La colonna lista non deve tagliare l'ultima card a metà — mostrare sempre card intere (o nascondere l'ultima se non ci sta intera)

**Nota:** questo task va fatto **prima** di Sprint 4 (ads) — le slot pubblicitarie ogni-3-card e in-alto/in-basso dipendono da questo layout.

---

## Sprint 4 — AdSense (dopo Sprint 3)

### Task 4.1: Riattivare AdSlot su pagina offerte e dettaglio
**File:** `webapp/src/components/AdSlot.jsx` (esiste, attualmente orfano — nessun import), `webapp/src/components/AdsenseGate.jsx` (già montato in `App.jsx:111`)
- **Non toccare home** — decisione esplicita in riunione ("le sporca")
- Lista offerte: un blocco ogni 3 card, scroll laterale come le altre
- Dettaglio offerta: uno in alto (lungo/stretto) + uno in fondo (sezione esistente resta, "bella da vedere")
- **Riusare `AdSlot.jsx` esistente**, non ricrearlo

**⚠️ Prima di editare:**
- `git log --all -- webapp/src/components/AdSlot.jsx webapp/src/components/AdBanner.jsx` — verificare storia e altri usi, per via del precedente incidente banner sponsor rimossi site-wide (vedi CLAUDE.md § Scope discipline)
- Grep ogni uso di `AdBanner`/`AdSlot` prima di modificare, non assumere che sia solo-home

**⚠️ Rischio policy AdSense:**
- Blocco "stessa dimensione e stile di una card offerta" dentro una lista di offerte è il pattern che Google penalizza (ads mascherati da contenuto)
- Serve etichetta "Annuncio"/"Pubblicità" visibile + distinzione visiva minima (bordo, sfondo diverso)
- Segnalare a Gabri prima di procedere — non è pignoleria, è rischio sospensione account (fonte di ricavo)

### Task 4.2 (bloccato da Sprint 0): Ads su applicativo jobroom
- Non è codice nostro — richiede intervento Arca24, non partire finché non arriva conferma

---

## Sprint 5 — Automazione SEO (dopo Sprint 0.2 e 0.3)

Ordine per rischio/certezza crescente:

### Task 5.1: Correzione errori tecnici automatica
- H1 mancanti/duplicati, meta tag, contenuto duplicato — oggi check manuale giornaliero tra Ahrefs/Semrush e Google Search Console
- Automatizzare la parte di detection, correzione resta review umana

### Task 5.2: Keyword e indicizzazione multilingua DE/FR
- Analisi esistente fatta solo su territorio IT — Gabri ha segnalato l'assenza di lavoro sui cantoni francesi/tedeschi
- Estendere ricerca keyword semantiche a DE/FR prima di generare contenuti in quelle lingue

### Task 5.3: Blog automatico (rischio più alto — misurare prima di scalare)
- Trigger: audit giornaliero → prima nuova opportunità semantica diversa dal giorno prima → genera post
- **Cadenza consigliata: 2-3 post/settimana, non giornaliera** — 1/giorno × 3 lingue = ~1.100 pagine/anno su dominio DR 21, profilo classico di thin-content penalty
- Revisione umana a campione, misurare impatto SEO per 6 settimane prima di alzare il ritmo
- **Fase 2 (dopo validazione qualità):** auto-post su LinkedIn pagina Job Courier con immagine + link — richiede accesso pagina (Sprint 0.2)

---

## Sprint 6 — Dashboard FTP (parte a fine mese, dopo Sprint 0.1)

Cantiere separato da tenere fuori dagli sprint sopra — non toccare finché non arriva il file di esempio, la forma del delta decide l'architettura del parser.

- [ ] Creare cartella FTP dedicata, passare indirizzo ad Arca24
- [ ] Lettore delta (solo differenze giorno su giorno, non full-reload ogni sera)
- [ ] Dashboard di lettura: candidati reali, aperture, click, offerte
- [ ] Staccata dal sito — nessuna dipendenza da `webapp/`
- [ ] Valutare quali dati riversare nel sito per arricchire contenuti (dopo che la dashboard è stabile)

---

## Esplicitamente fuori scope ora

- **CRM Job Courier** — fermato da Gabri in riunione ("non voglio che ci lavorino")
- **Pagina dedicata per singola offerta** — scartata in riunione, il dettaglio a pagina intera è ritenuto sufficiente
- **Cancellazione hosting Hostpoint** — irreversibile, non urgente; verificare prima che non ci passino mail/DNS/redirect residui delle 213 regole SEO prima di procedere (vedi `docs/GOLIVE-PLAN.md`)

---

## Riferimenti

- Mail bozza Sprint 0: vedi conversazione, non ancora inviata
- Scope discipline e incidente banner: `CLAUDE.md` § "🚫 Scope discipline"
- Redirect trailing slash / 213 URL SEO: `docs/GOLIVE-PLAN.md`
- Audit tecnico precedente (logo/slug azienda): `docs/AUDIT-SITO-2026-08-04.md`
