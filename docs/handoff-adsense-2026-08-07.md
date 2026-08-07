# Handoff — AdSense su www.jobcourier.ch

> **CHIUSO il 07.08.2026** — commit `f415dc7` su `main`, in produzione.
> `https://www.jobcourier.ch/ads.txt` risponde 200 `text/plain` e il loader
> AdSense è nel `<head>` gated su consenso marketing.
>
> **Publisher ID: `pub-4406252930350703`.** Il bloccante "manca l'accesso ad
> AdSense" descritto sotto è stato aggirato senza aspettare Laura: l'ID è stato
> ricostruito dagli snapshot Wayback del vecchio WordPress (`ads.txt` cambia da
> `pub-8558634965080879` a `pub-4406252930350703` tra apr e mag 2025, e la home
> archiviata di gen 2026 contiene `ca-pub-4406252930350703`), poi **confermato
> dalla dashboard reale** — l'URL della pagina Siti è
> `adsense.google.com/adsense/u/3/pub-4406252930350703/sites/list`, profilo
> jobcourier24@gmail.com.
>
> La vecchia home non aveva blocchi `<ins class="adsbygoogle">` → account su
> **Annunci automatici**, quindi il punto 3 del piano (unità annuncio) non
> serviva: il solo loader basta.
>
> **Cosa resta, e non dipende da noi:** AdSense rilegge `ads.txt` in 24-48 h, la
> cella "Stato di ads.txt" resta "Non trovato" fino ad allora e non c'è modo di
> forzare il ricontrollo. Gli annunci automatici impiegano qualche ora a
> comparire sul dominio nuovo.
>
> **Non verificato:** che accettando la categoria marketing su Cookiebot lo
> script parta davvero — richiede un browser reale con consenso dato. Il
> pattern è identico a quello di GA4 già in produzione. Da rifiutato, nessuna
> chiamata a `pagead2.googlesyndication.com` (verificato).

**Data:** 2026-08-07
**Sessione consigliata:** dedicata (questo tema è stato scorporato dalla sessione "vetrina aziende")
**Modello consigliato:** Sonnet 5, effort **medium**
**Perché medium:** il lavoro tecnico è piccolo e deterministico (un file statico, uno script tag, un gate di consenso). La parte non banale è il consenso Cookiebot per gli annunci personalizzati e la scelta dei posizionamenti. Non serve Opus. Non basta low perché una configurazione sbagliata del consenso è un problema GDPR/nLPD, non solo di resa.

---

## Stato accertato (verificato il 07.08.2026)

1. **`https://www.jobcourier.ch/ads.txt` → HTTP 404.**
   Verificato anche su `jobcourier.ch` (404) e `jobroom.jobcourier.ch` (404).
   È esattamente l'errore che Laura vede in AdSense: *"alcuni problemi relativi al file ads.txt … per non compromettere gravemente le entrate"*.

2. **Nel repo non esiste `webapp/public/ads.txt`.**
   `webapp/public/` contiene solo logo, `404.html`, `img/`. Il file c'era sul vecchio WordPress su Hostpoint; con il go-live del 01.08 il dominio punta a Vercel e il file non è stato portato.

3. **Nel sito nuovo non c'è NESSUN codice AdSense.**
   `grep -rn "adsense|ca-pub|adsbygoogle"` su `index.html`, `src/`, `public/`, `vercel.json`, `api/` → zero occorrenze.
   Quindi anche sistemando `ads.txt` **non verrebbe pubblicato alcun annuncio**: lo script di AdSense non è mai stato installato sul sito React. Questo, non `ads.txt`, è il motivo per cui l'incasso è a zero.
   I banner che si vedono in home (Ated, Formaty Academy) sono banner house fatti a mano, non AdSense.

4. **Il routing Vercel non è un ostacolo.**
   `webapp/vercel.json` non ha rewrite catch-all: le rewrite sono enumerate una per rotta. Un file in `webapp/public/ads.txt` viene servito tale e quale su `/ads.txt`. Nessuna modifica a `vercel.json` necessaria.

---

## Bloccante: accessi

Emanuele ha chiesto a Laura l'accesso admin all'account AdSense il **03.08.2026** (thread "Re: Problema AdSense") e **non ha ancora ricevuto risposta**.

Serve il **publisher ID** (`pub-XXXXXXXXXXXXXXXX`). Senza quello `ads.txt` non è scrivibile: il valore non è indovinabile e un ID sbagliato è peggio del file mancante.

Il publisher ID si legge anche senza accesso completo se Laura manda uno screenshot di **AdSense → Account → Informazioni account**, oppure il contenuto dell'`ads.txt` del vecchio sito WordPress (backup Hostpoint — Laura ne ha uno, thread "I: Il backup da Lei richiesto è disponibile per il download" del 01.08).

---

## Piano operativo

### 1. `ads.txt` (sblocca l'avviso AdSense)

Creare `webapp/public/ads.txt` con una riga per venditore autorizzato:

```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

`f08c47fec0942fa0` è il TAG-ID di certificazione di Google, uguale per tutti.
Se sul vecchio sito c'erano altre reti (Criteo, ecc.) vanno riportate le rispettive righe: `ads.txt` è una lista completa, non incrementale — righe mancanti = inventory non vendibile.

Verifica dopo il deploy:
- `curl -i https://www.jobcourier.ch/ads.txt` → 200, `content-type: text/plain`
- AdSense impiega **fino a 24-48 h** a rileggerlo. L'avviso non sparisce subito: non è un sintomo di errore.

### 2. Script AdSense sul sito

Aggiungere il loader nel `<head>` di `webapp/index.html`:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
```

**Attenzione al consenso.** Il sito ha Cookiebot attivo (installato il 30.07). Gli annunci personalizzati richiedono il consenso categoria *marketing*. Due strade:
- **Consent Mode v2** — lo script parte sempre ma con `ad_storage: denied` finché l'utente non accetta; è la strada che Google raccomanda ed è quella già usata per GA4 su questo sito (vedi come è stato gestito il tag GA4 `G-06VZ8XHHPH`, che parte solo dopo consenso categoria statistiche).
- Caricamento condizionato al consenso marketing, coerente con l'approccio GA4 già in essere.

Scegliere **la stessa strategia già usata per GA4**, per non avere due meccanismi di consenso diversi sullo stesso sito. Leggere prima come è wired GA4 in `webapp/index.html` / `webapp/src`.

### 3. Unità annuncio

Se l'account usa **Annunci automatici**, il punto 2 basta: Google decide i posizionamenti.
Se invece si vogliono slot fissi, servono i blocchi `<ins class="adsbygoogle">` con `data-ad-slot`, e vanno inseriti dove oggi stanno i banner house — sezione banner della home e colonna offerte. Non mettere annunci sopra la fold della home: rischio "valuable inventory: navigation" in AdSense.

### 4. Verifica finale

- `/ads.txt` risponde 200 in plaintext
- Sorgente pagina contiene `adsbygoogle.js` con il client corretto
- AdSense → Siti: `jobcourier.ch` in stato "Pronto"
- Nessun errore di consenso in console
- Cookiebot: rifiutando marketing, nessuna chiamata a `pagead2.googlesyndication.com`

---

## Cosa scrivere a Laura

Va detta la cosa importante, che non è `ads.txt`: **sul sito nuovo AdSense non è mai stato installato**, quindi l'avviso su `ads.txt` è solo la parte visibile. Servono il publisher ID e la conferma di come vuole gli annunci (automatici o slot fissi). Con quello, l'intervento è di poche ore.

Riferimenti citati da Laura: <https://support.google.com/adsense/answer/12171244>

---

## File toccati (previsti)

- `webapp/public/ads.txt` — nuovo
- `webapp/index.html` — loader AdSense + gate consenso
- eventuale componente slot annunci in `webapp/src/components/`
