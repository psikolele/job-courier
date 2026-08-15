# jobcourier.ch — Fix Critici: Guida Implementazione

*Riferimento: FULL-AUDIT-REPORT.md, ACTION-PLAN.md. Stack rilevato: Vercel (Next.js-style, funzione `api/_ssr.js` già presente e funzionante su `/offerte` e `/offerta/{id}`), consent management Cookiebot (IAB TCF v2.2/2.3, CMP id 134).*

---

## 1. Estendere SSR a tutte le route

**Problema:** solo `/offerte` e `/offerta/{id}` sono server-rendered. Home, `/come-funziona`, `/tariffe`, `/faq`, `/contatti`, tutte le `/blog/*` restituiscono HTML grezzo con `<div id="root"></div>` vuoto e title fallback identico (`JobCourier - Il portale svizzero per il lavoro`) finché il JS non idrata (~13.7s in test).

**Come implementare:**
1. Localizzare `api/_ssr.js` (o equivalente) — è la funzione serverless che già produce SSR corretto per le route job. Verificare che routing/matcher sia limitato a `/offerte*` e `/offerta/*`.
2. Estendere il matcher (in `vercel.json` o nel routing interno della funzione) per includere tutte le route pubbliche: `/`, `/come-funziona`, `/tariffe`, `/faq`, `/contatti`, `/blog/*`, `/aziende*`.
3. Per ogni route, la funzione SSR deve:
   - Popolare `<title>` e `<meta name="description">` dinamici (non il fallback condiviso).
   - Iniettare il JSON-LD già generato lato client (verificato che esiste e è valido — vedi punto 3 per il bug di encoding) direttamente nell'HTML servito.
   - Renderizzare il contenuto testuale principale (non solo shell) prima dell'idratazione client.
4. Se la stack è React puro senza framework SSR nativo (Next.js/Remix), valutare `react-dom/server` (`renderToString`/`renderToPipeableStream`) richiamato dalla stessa funzione serverless che già gestisce `/offerte`, riusando la stessa pipeline.
5. **Test di verifica:** `curl -s https://www.jobcourier.ch/faq | grep -o '<title>.*</title>'` deve restituire un title univoco per pagina, non il fallback. Ripetere per ogni route.

**Priorità:** blocca a cascata i fix GEO e parte del fix Performance — va fatto per primo.

---

## 2. Cookiebot: deferral + lazy-load vendor list

**Problema:** homepage ha DOM da 44.306 elementi, causato dal caricamento immediato della lista completa di 981 vendor IAB TCF. Risultato: TBT 3.39s (home) / 1.94s (/offerte), e sia utenti reali che crawler/AI (GPTBot, PerplexityBot, render Playwright) vedono solo il banner consenso come contenuto estratto, non il copy reale.

**Come implementare:**
1. Nel `<head>`, cambiare il tag script Cookiebot da caricamento sincrono/blocking a:
   ```html
   <script id="Cookiebot" src="https://consent.cookiebot.com/uc.js"
           data-cbid="<CBID>" data-blockingmode="auto" async defer></script>
   ```
   Nota: se `data-blockingmode="auto"` è richiesto per bloccare script terzi fino al consenso, valutare `data-blockingmode="manual"` con blocking selettivo solo sugli script che realmente lo richiedono (analytics/ads), non su tutto il DOM.
2. La lista dei 981 vendor (dialog "Dettagli"/"Preferenze") non deve essere renderizzata nel DOM al load — Cookiebot la carica tipicamente on-demand quando l'utente apre il pannello dettagli. Se il tema/configurazione attuale la pre-renderizza, verificare in Cookiebot Manager (Settings → Banner → Advanced) l'opzione di rendering lazy del vendor panel, o passare a `data-framework` config che non pre-carica la lista IAB completa.
3. Aggiungere `<link rel="preconnect" href="https://consent.cookiebot.com">` per mitigare la latenza residua del caricamento asincrono.
4. **Test di verifica:** Lighthouse mobile su homepage — DOM element count deve scendere sotto ~1.500 (soglia Lighthouse "Avoid excessive DOM size"), TBT sotto 200ms.

**Nota collaterale:** questo fix risolve simultaneamente 4 finding distinti (Performance Critical #2, GEO Critical #2, SXO #2, Content "homepage testo = solo banner consenso") — massima priorità per rapporto costo/beneficio.

---

## 3. Fix encoding UTF-8 (mojibake) nei JSON-LD

**Problema:** ogni carattere accentato (ä, ö, ü, è, à, ù...) nei blocchi JSON-LD (descrizioni JobPosting, testo Article, risposte FAQPage) è doppiamente codificato — es. "Verständnis" diventa "VerstÃ¤ndnis". Corrompe ciò che Google indicizza per descrizioni annunci e contenuto FAQ.

**Come implementare:**
1. Causa tipica: contenuto salvato/letto come UTF-8 ma poi ri-processato/servito come Latin-1 (o viceversa) — spesso capita quando:
   - Il CMS/DB scrive in UTF-8 ma la response HTTP non dichiara `charset=utf-8` in `Content-Type` per l'endpoint che serve il JSON usato per generare il JSON-LD.
   - `JSON.stringify()` lato server viene applicato su una stringa già mal decodificata a monte (letta con encoding sbagliato dal DB/file).
2. Verificare header di risposta dell'endpoint dati (es. API che alimenta `/offerta/{id}`): deve essere `Content-Type: application/json; charset=utf-8`.
3. Verificare la connessione/query al database: se Postgres/MySQL, controllare che client encoding sia `UTF8` end-to-end (non `LATIN1` di default in alcune config).
4. Se il bug è già "nei dati" (doppia codifica già salvata a DB), serve uno script di correzione una tantum: decodificare la stringa mal-codificata (`bytes.decode('utf-8').encode('latin-1').decode('utf-8')` in Python, o equivalente) sui campi testo interessati (title, description, FAQ answers) prima di ri-salvarli.
5. **Test di verifica:** `curl -s https://www.jobcourier.ch/offerta/<id> | grep -A2 '"description"'` — i caratteri accentati devono apparire corretti, non come sequenze `Ã¨`/`Ã¤` ecc. Ripetere su un post blog con accenti (tedeschi/francesi se presenti nelle varianti linguistiche).

**Priorità:** singolo fix di infrastruttura, corregge tutte le pagine contemporaneamente — non serve intervento pagina per pagina.

---

## 4. Soft-404 su job ID scaduti/inesistenti

**Problema:** `GET /offerta/6000000` (ID inesistente) restituisce HTTP 200 con una pagina shell generica invece di 404/410. Impedisce a Google di capire che l'annuncio non esiste più, e impedisce la pulizia affidabile di `sitemap-jobs.xml` (annunci scaduti restano indicizzabili).

**Come implementare:**
1. Nell'handler/route che serve `/offerta/{id}` (la stessa funzione SSR del punto 1): dopo il fetch dei dati annuncio dal DB/API, se il record non esiste O `validThrough` è nel passato:
   - Annuncio **inesistente**: restituire `404 Not Found` con pagina 404 custom (mantenendo navigazione/link utili, non solo errore nudo).
   - Annuncio **scaduto ma esistito**: restituire `410 Gone` (più corretto di 404 per contenuto rimosso intenzionalmente/scaduto) — opzionalmente con redirect soft verso `/offerte` filtrato per stesso settore/città, ma lo status code HTTP deve comunque essere 410, non 200/302 silenzioso.
2. Impostare lo status code a livello di response Vercel function (`res.status(404)` / `res.status(410)`), non solo a livello di contenuto renderizzato.
3. Propagare questa logica anche alla generazione di `api/sitemap-jobs.xml`: escludere dal feed qualsiasi annuncio con `validThrough` scaduto (prerequisito per il fix "aggiungere lastmod" del piano azione, priorità Alta).
4. **Test di verifica:** `curl -o /dev/null -s -w "%{http_code}\n" https://www.jobcourier.ch/offerta/6000000` deve restituire `404` (non `200`).

---

## Ordine di esecuzione consigliato

1. **Fix #3 (encoding UTF-8)** — isolato, basso rischio, nessuna dipendenza da altri fix.
2. **Fix #4 (soft-404)** — isolato, basso rischio.
3. **Fix #1 (SSR esteso)** — impatto maggiore, richiede più test (una route alla volta, verificare title/meta/JSON-LD/contenuto per ognuna).
4. **Fix #2 (Cookiebot deferral)** — da fare dopo il fix #1 così il retest Lighthouse/GEO misura l'effetto combinato corretto.

Dopo i 4 fix critici: ri-eseguire audit (`seo-audit`) per confermare impatto reale sui punteggi prima di passare ai fix Alta priorità (ACTION-PLAN.md).
