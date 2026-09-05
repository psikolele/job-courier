# Verifica in produzione — 4 Settembre 2026

Ogni punto sollevato da Gabriele nel meeting del 03/09, ri-testato su
**`https://www.jobcourier.ch` in produzione** (non in locale) dopo il deploy dei fix.
Test automatizzati con Playwright su Chromium, viewport 1440×900, lingua `it-CH`,
**consenso marketing rifiutato** (l'opzione più conservativa: è anche la condizione in cui
è emerso il difetto n. 10).

Metodo: ogni prova misura il DOM reale e salva lo screenshot. Le misure stanno qui sotto,
le immagini nei file numerati. Dove non ho potuto provare qualcosa, è scritto.

---

## Esito per punto del meeting

| # | Cosa aveva segnalato Gabriele | Misura in produzione | Esito | Prova |
|---|---|---|---|---|
| 1 | Tag NUOVO poco visibile, va **bold e nero** | `font-weight: 900`, `rgb(5,11,43)` (navy) | ✅ | `01` |
| 2 | AdSense: un blocco **ogni 3 card** | sequenza `CARD CARD CARD ANNUNCIO CARD CARD`, etichetta "Annuncio", fondo grigio, bordo tratteggiato | ✅ | `02` |
| 3 | Redirect candidatura non parte, serve doppio click | **non provabile oggi**: nessuna delle 45 offerte del feed ha candidatura esterna (40 dettagli controllati) | ⏸ | — |
| 4 | Pagina di transizione brutta → farne una nostra | idem: senza offerte esterne il modale non si apre in produzione. Verificato in locale con dati reali il 04/09 | ⏸ | — |
| 5 | Traduzioni mancanti su condizioni/cookie | DE: 57 blocchi, titolo `Allgemeine Geschäftsbedingungen` · FR: 49 blocchi, `Politique de cookies` · entrambe con la riga "fa fede l'italiano" | ✅ | `05`, `06` |
| 6 | Ricerca incoerente fra widget home e pagina offerte | widget → `/offerte?country=214&location=Ticino&canton=TI&keyword=HR` → 5 card; stessa URL aperta direttamente → **le stesse 5 card, stessi titoli** | ✅ | `07a`, `07b`, `08` |
| 7 | Troppi scroll interni, ultima card tagliata | **0 contenitori con scroll proprio**, bottone "Carica altro" presente, 5 card intere | ✅ | `09` |

## Difetto trovato durante la verifica — e corretto

**10. Cornice "Annuncio" vuota per chi rifiuta i cookie di marketing.**
Misurato: riquadro alto 152 px con `<ins>` di 100 px mai riempito, perché senza consenso lo
script AdSense non viene caricato. Il visitatore vedeva l'etichetta "ANNUNCIO" sopra uno
spazio bianco, in mezzo alle offerte. Una cornice etichettata e vuota si legge come annuncio
rotto, ed è peggio di nessuna cornice.

Corretto in `382889c`: l'`<ins>` resta nel DOM a piena larghezza (serve a Google per
riempirlo), ma cornice, etichetta e altezza riservata compaiono **solo quando un annuncio
arriva davvero** — sondato per sei secondi, poi il riquadro collassa. Lo screenshot `10`
documenta il difetto prima del fix.

---

## Confronto filtri: Job Courier ↔ jobroom

Stesse query sui due motori. Dati grezzi in `confronto-filtri-jc-vs-jobroom.json`.

| Query | JC (canton) | jobroom (città + raggio) |
|---|---|---|
| HR · Lugano / TI | 4 | 4 |
| saldatore · Lugano / TI | 3 | 10 |
| informatico · Lugano / TI | 20 | 26 |
| Elektriker · Zürich / ZH | 6 | 222 |
| HR · Zürich / ZH | 10 | 42 |
| vendeur · Genève / GE | 0 | 0 |
| HR · Genève / GE | 0 | 2 |
| Pflege · Bern / BE | 2 | 73 |

**I due motori non possono dare gli stessi numeri, e la ragione non è un bug.** Sono due
filtri diversi:

1. **Geografia.** jobroom cerca per **città più raggio** (30 km di default) e attraversa i
   confini cantonali: la ricerca "Pflege a Bern" restituisce annunci di **Solothurn**. Job
   Courier filtra per **cantone esatto**. Su Berna questo da solo spiega gran parte del
   divario.
2. **Profondità.** Le query filtrate di JC vengono servite dalle rotte a faccette del
   portale, leggendo **al massimo 3 pagine (~45 annunci)** e restringendo poi in locale
   (`webapp/api/jobs.js`, `queryPages`/`queryMaxJobs`). jobroom interroga il proprio
   database intero. Per questo `Elektriker · Zürich` dà 6 contro 222: JC filtra 45
   candidati, jobroom tutti.

**Coerenza interna di JC, verificata:** su tutte le query il luogo è corretto al 100%
(`luogoCoerente` = totale in ogni riga del JSON). La parola cercata compare nel titolo in
modo variabile (`HR · Zürich` 9/10, `informatico · Lugano` 0/20) perché il portale cerca
anche nel corpo dell'annuncio e in altre lingue — un annuncio da "sviluppatore software" è
un risultato legittimo per "informatico" pur non avendo la parola nel titolo.

### Per rendere il comportamento identico servono due decisioni, non due fix

- **Adottare città + raggio** al posto del cantone: allinea la semantica, ma cambia il
  modello di ricerca del sito e va deciso con il cliente.
- **Alzare la profondità** oltre le 3 pagine: più risultati, ma ogni pagina in più è una
  richiesta di scraping verso Arca24, quindi latenza e carico. Oggi il tetto esiste apposta.

Nessuna delle due è un difetto da correggere in silenzio: sono scelte di prodotto con un
costo. Il dato utile per la riunione è che **la parità fra widget e pagina offerte — il bug
riferito da Gabriele — è raggiunta**, mentre la differenza con jobroom è strutturale.

---

## File

| File | Cosa mostra |
|---|---|
| `01-lista-offerte-badge-nuovo.png` | badge NUOVO nero accanto alla data |
| `02-lista-annuncio-ogni-3-card.png` | annuncio fra la terza e la quarta card |
| `05-condizioni-generali-DE.png` | condizioni generali in tedesco |
| `06-cookie-policy-FR.png` | cookie policy in francese |
| `07a-home-widget-HR-Ticino-compilato.png` | widget home con HR + Ticino |
| `07b-risultati-dal-widget-home.png` | risultati partendo dal widget |
| `08-stessa-query-dalla-pagina-offerte.png` | stessa query dalla pagina offerte |
| `09-layout-una-scrollbar-carica-altro.png` | una sola scrollbar, card intere |
| `10-slot-annuncio-senza-consenso.png` | il difetto trovato, prima del fix |
| `11-jobroom-ricerca-esempio.png` | ricerca su jobroom (Pflege · Bern, 73 risultati) |
| `confronto-filtri-jc-vs-jobroom.json` | dati grezzi del confronto |
