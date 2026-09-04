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

**⚠️ Residuo aperto (verificato 04/09):** l'indicatore "questa offerta si candida su un altro
sito" esiste solo su `/offerte` (`jobs.apply_external_note`), **non** su `/offerta/:id`. Il
meeting lo chiedeva sotto il bottone, e il dettaglio è la pagina dove si arriva da Google.

---

## Sprint 2 — Logica ricerca e lista offerte

### Task 2.1: Parità ricerca widget home ↔ pagina offerte
**File:** `webapp/src/components/JobSearchWidget.jsx`, `webapp/src/pages/Offerte.jsx`
- Bug riportato: `HR` + Ticino da widget home → nessun risultato; stessa query da `/offerte` → funziona, ma restituisce "saldatore" per `HR`
- Causa nota: comportamento ricerca libera upstream Arca24, non completamente risolvibile lato nostro — mitigare con match su titolo/query più stretto, ma **segnalare a Gabri come limite upstream**, non prometterlo come fix completo

### Task 2.2: Criterio unico lingua+data con fallback — ✅ GIÀ IMPLEMENTATO (30/07)

**Verificato nel codice il 04/09**, prima di riscriverlo: `hooks/useShowcaseJobs.js` fa già tutto
quanto elencato qui sotto — cap rigido 2 per azienda (`SHOWCASE_CAP`), ordinamento per
lingua-regione, `EN→Ticino` (`regionForLang` in `utils/localeRegion.js`), fallback che accoda le
offerte fuori regione invece di lasciare la lista vuota. `/offerte` non applica cap.

**Resta una sola cosa da chiarire con Gabriele, non da implementare al buio:** il meeting dice
"vetrina **e correlate**", ma una sezione di offerte correlate nel dettaglio non esiste nel
codice. O era un modo di dire per la vetrina, o è una feature nuova mai costruita.

Specifica originale, tenuta come riferimento:
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

---

## Monetizzazione AdSense — stato reale (misurato 04.09.2026)

Sezione riscritta dopo una prima versione sbagliata: avevo dedotto "jobroom non
ha pubblicità" da due URL caricate a campione (`/it/careers/jobs` e la pagina di
registrazione), che girano sulla piattaforma nuova `viso` e in effetti non ne
hanno. Il report AdSense per sito dice l'opposto ed è la fonte da usare.

### Da dove arrivano i soldi (ultimi 30 giorni)

| Sito | Visualizz. pagina | Utili stimati | Clic |
|---|---|---|---|
| `jobroom.jobcourier.ch` | 6.598 | **351,62 CHF** | 899 |
| `www.jobcourier.ch` | 415 | 5,13 CHF | 21 |
| `viso-jobcourier.arca24.careers` | 1 | 0,00 CHF | 0 |

**Jobroom fa il 98,6% del ricavo.** Il sito nuovo vale l'1,4%.

### ⚠️ Le sei unità di jobroom non vanno toccate

Su `jobroom.jobcourier.ch/it/careers/latest_jobs` girano 6 unità AdSense, tutte
riempite, inserite fra un annuncio di lavoro e l'altro — lo stesso schema che
replichiamo noi su `/offerte`. Gli slot:

`8728236901` · `9174651970` · `7527137192` · `7254548728` · `3363103858`

Nel pannello AdSense compaiono con nomi che sembrano residui di un vecchio sito
(`NEW-latest jobs orizzontale 1/2`, `NEW-searchandfilterads-1/2`, `horizontal2/3`,
`permanent_mobile`, ultima modifica maggio 2025). **Non sono residui: sono la
fonte di ricavo.** `NEW-latest jobs orizzontale 1` da sola fa ~31 CHF su 52 CHF
settimanali. Non archiviarle, non rinominarle, non "fare pulizia". Stanno dentro
pagine servite da Arca24, che non controlliamo.

### Perché su jobroom gli annunci si vedono senza accettare nulla

Verificato dal vivo: su jobroom non c'è Cookiebot né altro script di consenso
nel sorgente, ma `window.__tcfapi` esiste — c'è un CMP conforme TCF gestito lato
Google (Privacy e messaggi / Funding Choices). Navigando dalla Svizzera il banner
non compare e gli annunci partono subito, perché l'obbligo di consenso preventivo
per i cookie pubblicitari nasce dalla direttiva ePrivacy europea, che in Svizzera
non si applica. La nLPD chiede trasparenza e possibilità di opporsi, non l'opt-in
preventivo.

Sul nostro dominio invece Cookiebot gira in `blockingmode="auto"` e blocca
AdSense per **tutti**, svizzeri compresi: siamo più restrittivi sia della legge
svizzera sia del nostro stesso applicativo che fa il 98% del fatturato. Non è un
bug, è una configurazione — vedi il piano qui sotto.

### Auto ads spenti il 04.09.2026

Disattivati su `jobcourier.ch` per avere controllo sui piazzamenti e stare dentro
le norme Google sugli annunci mascherati da contenuto. Impatto economico reale:
tocca solo l'1,4% del ricavo totale, non il 98% che sta su jobroom.
Ottimizzazione automatica lasciata ON (non piazza annunci, ottimizza gli
esistenti). Reversibile da pannello in un minuto.

---

## Piano — consenso per regione su jobcourier.ch

Obiettivo: smettere di bloccare gli annunci ai visitatori svizzeri, restando
conformi per chi arriva dall'Unione Europea. Allineare il sito a quello che
l'applicativo già fa.

**Non sono un consulente legale.** Quanto segue è la lettura tecnica delle regole
Google e della differenza nLPD/ePrivacy; prima di applicarlo va confermato da chi
segue la privacy per il cliente.

### Il quadro in due righe
- **Svizzera (nLPD):** nessun obbligo di opt-in preventivo per i cookie
  pubblicitari. Servono informativa chiara e possibilità di opporsi.
- **UE/SEE + UK (ePrivacy + GDPR):** consenso preventivo obbligatorio, e la
  policy di Google sul consenso degli utenti UE impone un CMP certificato TCF.
  Cookiebot lo è già.

### Passi

1. **Misurare cosa si perde oggi.** Da Cookiebot: tasso di accettazione del
   consenso marketing. Da AdSense: quota di traffico `www.jobcourier.ch` per
   paese. Il guadagno atteso è (traffico CH) × (quota che oggi rifiuta o ignora
   il banner). Senza questo numero non si sa se l'intervento vale.
2. **Verificare il piano Cookiebot.** La configurazione per regione è una
   funzione a pagamento: controllare che l'abbonamento attuale la includa.
3. **Configurare le regioni in Cookiebot:** banner e blocco preventivo per
   UE/SEE/UK; per Svizzera e resto del mondo, banner informativo senza blocco
   preventivo, con opt-out sempre raggiungibile.
4. **Verificare il codice.** `AdsenseGate` carica lo script con
   `type="text/plain"` e `data-cookieconsent="marketing"`: è Cookiebot a
   decidere se sbloccarlo. Con le regioni attive dovrebbe sbloccarlo da solo
   fuori UE — da verificare dal vivo con IP svizzero e IP europeo prima di
   dichiararlo fatto.
5. **Aggiornare la cookie policy.** La pagina è già tradotta in 4 lingue: va
   aggiunto che il comportamento del consenso dipende dalla regione e come
   opporsi dalla Svizzera.
6. **Misurare per due settimane.** Confrontare RPM pagina e impressioni di
   `www.jobcourier.ch` prima/dopo. Restano numeri piccoli in assoluto: l'1,4%
   del totale non diventerà la voce principale.

### Il punto che vale davvero i soldi

Il ricavo sta su jobroom, non sul sito. Le leve grosse sono due, entrambe fuori
dal nostro codice e da decidere con Gabri e Arca24:
- portare traffico dal sito verso jobroom (dove le unità già rendono), oppure
- ottenere che Arca24 aggiunga piazzamenti nostri sull'applicativo (Task 4.2).

Ottimizzare il consenso su `www.jobcourier.ch` migliora l'1,4%. Va fatto perché è
corretto e costa poco, non perché sposti il fatturato.

---

## Task 4.3 — Automazione di verifica AdSense (n8n)

Nasce da due fatti di questa sessione: le sei unità che fanno il 98,6% del
ricavo hanno nomi che sembrano residui da cancellare, e per tre giorni nessuno
si sarebbe accorto se il sito avesse smesso di mostrare annunci. Oggi il calo si
scopre guardando il pannello, cioè per caso.

Va nel workflow n8n esistente del guardiano sito+feed (attivo dal 28.08, mail su
`/api/companies` e `/api/jobs`), come sezione separata: stesso canale di allerta,
controlli distinti.

### Regole ereditate dagli allarmi precedenti

Il guardiano ha già prodotto 34 mail di allarme senza guasto (02.09), per una
soglia appoggiata al valore di ripiego. Quelle lezioni valgono anche qui:

- **Mai una soglia appoggiata al valore di fallback.** Confrontare con la media
  mobile dei 14 giorni precedenti, non con un numero fisso scritto a mano.
- **Due letture prima della mail.** Un solo campione sotto soglia non è un
  guasto: AdSense stesso ritarda e ricalcola i dati del giorno corrente.
- **Leggere la provenienza del dato.** Se la risposta API è vuota o parziale,
  è un errore di raccolta, non un calo di ricavo: va distinto nel messaggio,
  altrimenti si rincorre un guasto che non esiste.

### Controllo 1 — Le unità di jobroom sono ancora vive (priorità massima)

**Cosa:** ogni giorno, AdSense Management API, report per unità sugli ultimi 3
giorni. Verifica che le sei unità di jobroom (`8728236901`, `9174651970`,
`7527137192`, `7254548728`, `3363103858` più la sesta senza slot esposto)
compaiano ancora con impressioni > 0.

**Allerta se:** una unità che nei 14 giorni precedenti aveva impressioni scende
a zero per due giorni di fila, oppure sparisce dal report (archiviata).

**Perché:** è il 98,6% del fatturato dentro pagine che non controlliamo. Se
Arca24 cambia un template o qualcuno fa pulizia nel pannello, oggi ce ne
accorgiamo a fine mese.

### Controllo 2 — Crollo del ricavo per sito

**Cosa:** ogni giorno, utili stimati e impressioni per sito (`jobroom`,
`www.jobcourier.ch`), confrontati con la media mobile 14 giorni.

**Allerta se:** utili < 50% della media per due giorni consecutivi. Margine
ampio di proposito: il traffico di un portale lavoro oscilla molto fra
settimana e weekend, e una soglia stretta genera solo rumore.

### Controllo 3 — Le nostre tre unità servono davvero annunci

**Cosa:** dopo il go-live dei piazzamenti, controllo giornaliero che
`2640720133`, `2308818696`, `1919655083` abbiano richieste di annunci > 0.

**Allerta se:** zero richieste per due giorni. Distingue tre guasti diversi che
oggi sarebbero indistinguibili: piazzamento rotto da un deploy, script bloccato
dal consenso per tutti, unità disapprovata da Google.

### Controllo 4 — Copertura del consenso (dopo il Task consenso per regione)

**Cosa:** confronto fra sessioni con consenso marketing accettato (Cookiebot) e
richieste di annunci (AdSense) sul solo `www.jobcourier.ch`.

**Allerta se:** la quota di richieste crolla mentre il traffico resta stabile —
segnale che la configurazione per regione è saltata e stiamo di nuovo bloccando
gli annunci a tutti.

**Nota:** questo controllo ha senso solo dopo che le regioni sono attive.
Prima, il rapporto è quello atteso e l'allarme sarebbe rumore.

### Vincoli tecnici

- **Accesso:** AdSense Management API v2, OAuth sull'account `jobcourier24@gmail.com`
  (l'account principale non ha accesso al publisher). Serve un client OAuth e il
  refresh token in credenziale n8n dedicata.
- **Credenziali:** scegliere il bot Telegram/la casella mail apposta per Job
  Courier, non fidandosi dell'etichetta di una credenziale condivisa —
  l'istanza n8n serve più clienti e a fine agosto un workflow JC è finito sul
  bot di BLC.
- **Ruolo:** n8n resta osservatore. Legge e avvisa, non tocca il pannello
  AdSense e non modifica il sito.
- **Costo:** l'API AdSense è gratuita entro quote ampie; quattro chiamate al
  giorno non le sfiorano.

### Ordine di implementazione

Controllo 1 per primo, da solo: protegge il 98,6% del ricavo ed è quello che
oggi manca del tutto. Gli altri tre quando i piazzamenti nuovi sono in
produzione e hanno due settimane di storico da cui derivare le medie.

### Stato: Controllo 1 implementato il 04.09.2026

Workflow n8n **`Job Courier — guardiano annunci AdSense`** (`CVA0jPFdLKvr1POi`),
**creato ma non ancora attivo** — vedi sotto.

Due scelte diverse da quanto previsto qui sopra, entrambe per vincoli emersi
implementando:

**Niente OAuth, niente API AdSense.** I cinque slot id sono nell'HTML servito da
`/it/careers/latest_jobs` (verificato: 457 KB, 5 slot su 5, 41 riferimenti
`adsbygoogle`). Un GET e un confronto di stringhe bastano per sapere se i posti
esistono ancora, che è il guasto che costa. Resta scoperto "Google ha smesso di
riempirli", che richiede davvero l'API: quando servirà il Controllo 2, l'OAuth
andrà creato allora.

**Workflow separato invece che nel guardiano esistente.** Ogni scrittura sul
workflow `g15tqVsAWtcOc48z` viene rifiutata da questa istanza n8n con
`request/body must NOT have additional properties`: la validazione passa, il PUT
no. La creazione di workflow nuovi funziona, gli aggiornamenti no — probabile
disallineamento fra il connettore MCP e la versione di n8n. Da capire prima del
prossimo intervento su un workflow esistente.

**⚠️ Attivazione manuale richiesta.** Per lo stesso motivo non è attivabile via
MCP: va acceso a mano dall'interfaccia n8n. Finché resta spento non controlla
nulla.

Logica verificata contro la pagina reale su tutti e sette i percorsi: pagina
sana (nessuna mail), slot sparito alla prima lettura (nessuna mail), alla
seconda (allarme), rientro, stato stabile dopo il rientro, fetch fallita alla
prima e alla seconda (allarme distinto, con scritto che non è un calo di
ricavo).
