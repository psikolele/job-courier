# Piano pre-lancio — migrazione scraping da JobRoom ad Arca24

**Data:** 28.07.2026
**Modello:** Claude Opus 5, effort alto
**Contesto:** Arca24 sostituisce `jobroom.jobcourier.ch` con un portale nuovo. Host di QA noto (`viso-jobcourier.arca24.careers`), host di produzione **non ancora comunicato**.

---

## 🎯 Obiettivo

Arrivare al giorno del rilascio Arca24 con il parser nuovo già scritto, testato sui dati veri e attivabile cambiando **una variabile d'ambiente**. Niente sviluppo sotto pressione il giorno del passaggio.

---

## ✅ Stato: pronto

### Cosa è stato costruito

| File | Ruolo |
|---|---|
| `webapp/api/_arca24.js` | Adapter completo: lista offerte, dettaglio, aziende, dettaglio azienda |
| `webapp/api/_arca24.test.js` | 8 test sui selettori critici |
| `webapp/api/{jobs,job-detail,companies,company-detail}.js` | Switch di sorgente in testa all'handler |

L'adapter restituisce **esattamente lo stesso schema JSON** dei parser JobRoom. Il front-end non sa quale sorgente sta girando e non va toccato.

### Come si fa lo switch: da solo

**Aggiornato 29.07 dopo la risposta di Laura.** La produzione mantiene l'hostname
`jobroom.jobcourier.ch` e cambia solo la struttura dei path:

```
oggi:      https://jobroom.jobcourier.ch/job/latest-and-all-job-ads.php
al rilascio: https://jobroom.jobcourier.ch/it/careers/latest_jobs
             https://jobroom.jobcourier.ch/it/careers/jobs_by_company
```

Siccome le due generazioni vivono sullo stesso host, quale sia viva si **rileva** invece
di annunciarlo. Gli handler sondano `/it/careers/latest_jobs`: finché risponde 404 resta
attivo il percorso JobRoom, dal momento in cui risponde 200 passano al portale nuovo da
soli. Esito in cache 5 minuti, quindi una sonda per lambda ogni 5 minuti.

**Il giorno del rilascio non serve fare nulla.** Niente variabili, niente redeploy.

`JOBS_SOURCE` resta come forzatura manuale nei due sensi — `jobroom` o `arca24` — ed è la
via di rientro se il rilevamento sbagliasse. `ARCA24_HOST` serve solo per puntare
l'adapter all'ambiente di test (`https://viso-jobcourier.arca24.careers`).

Verificato nei tre scenari: oggi in automatico sceglie JobRoom (45 annunci, apply 200),
puntato al test usa Arca24 (45 annunci, apply 200), forzato su jobroom torna al vecchio.

### Verifiche già fatte sui dati veri

- **45/45 annunci** estratti con id, titolo, location e data; azienda su 44/45 (il mancante è un record di test lato Arca24)
- **45/45 `apply_url` → HTTP 200**
- **8/8 descrizioni** estratte correttamente su un campione di annunci svizzeri reali (440–5098 char)
- **90 annunci unici su 6 pagine**, nessuna duplicazione
- Microdata `JobPosting` complete: `datePosted`, `validThrough`, `baseSalary` min/max, `industry`, `occupationalCategory`, `addressRegion`
- Catalogo disponibile: **565 pagine × 15 = ~8'475 annunci**

### Differenze tecniche rispetto a JobRoom

| | JobRoom | Arca24 |
|---|---|---|
| Gate accesso | `Referer` obbligatorio + warm-up cookie | **nessuno** |
| Rate limit | non rilevato | non rilevato (8 req rapide OK) |
| Risposta | ~200 ms | 3–14 s a freddo, ~150 ms da cache CDN |
| Compressione | — | gzip: 41 KB vs 323 KB (l'adapter manda già `Accept-Encoding`) |
| Cache upstream | `no-store` | `public, max-age=72000` (20 h) |
| Header sicurezza | nessun CSP, nessun X-Frame-Options | CSP completa, HSTS, nosniff, SAMEORIGIN |

---

## ❓ Punti aperti

### ✅ Risolti dalla risposta di Laura del 29.07

1. ~~**Hostname di produzione**~~ — resta `jobroom.jobcourier.ch`, cambiano solo i path.
   `viso-jobcourier` è l'ambiente di test. Adapter aggiornato di conseguenza e switch reso
   automatico.
2. ~~**`robots.txt` è `Disallow: /`**~~ — è così solo perché `viso-` è ambiente di test e
   non deve finire su Google. La produzione sarà configurata per essere indicizzata.
   Verificato: il `robots.txt` di `jobroom.jobcourier.ch` è già una allow-list normale,
   senza blocco globale. **Da ricontrollare comunque il giorno del rilascio.**

### ⏳ Ancora aperti

3. **La pagina aziende restituisce solo 5 aziende** e ignora ogni parametro di paginazione provato (`page`, `p`, `offset`, `start`, `limit`, `pageSize`, `rows`). Il controllo `.pages` è vuoto. Sulla lista offerte la paginazione `?page=N` invece funziona. Serve sapere qual è il parametro corretto, o se il resto arriva via chiamata client-side. Non ancora risposto.
4. **Data esatta del rilascio** — non comunicata. Meno critica ora che lo switch è
   automatico, ma serve per sapere quando presidiare.
5. **Laura chiede se passare ad Arca il link alla pagina "come funziona" del nuovo sito** —
   richiesta rivolta a noi, da riscontrare.
4. **Due formati diversi di link azienda** nello stesso sito: `profile?uiid=3242903` sulla pagina aziende e `profile:id_3244729&company_name=...` nella lista offerte. L'adapter li gestisce entrambi, ma conviene sapere quale sarà quello stabile.
5. **Tempo di risposta a freddo fino a 14 s.** Confermare se è una caratteristica del QA o resta in produzione — impatta il timeout delle nostre funzioni.
6. Restano annunci di test in catalogo (`test etst`, azienda `ts`, salari in EUR, sedi italiane). Verificare che spariscano in produzione.

---

## 📋 Checklist go-live

### Prima del rilascio Arca24

- [ ] Ricevuto hostname di produzione
- [ ] `robots.txt` sbloccato lato Arca24
- [ ] Chiarita la paginazione aziende
- [x] `functions.maxDuration: 30` in `webapp/vercel.json` — fatto 28.07 (mancava, default 10 s: un cold hit da 14 s faceva fallire `/api/jobs`)
- [x] Sanitizzare la descrizione annuncio — fatto 28.07, vedi sezione sicurezza

### Il giorno del rilascio

Lo switch avviene da solo entro 5 minuti dal momento in cui i path nuovi rispondono.
Restano solo verifiche:

- [ ] Smoke test: `/api/jobs` restituisce 45 elementi, `/api/job-detail`, `/api/companies`, `/api/company-detail`
- [ ] Verificare a campione 10 `apply_url` → HTTP 200
- [ ] Controllare la pagina Offerte e la pagina Aziende sul sito
- [ ] Ricontrollare `robots.txt` di `jobroom.jobcourier.ch`: deve **non** contenere `Disallow: /`
- [ ] Verificare che la pagina Aziende non sia rimasta a 5 profili (punto aperto n.3)

### Rollback

Impostare `JOBS_SOURCE=jobroom` e redeployare: la forzatura ha la precedenza sul
rilevamento e riporta tutto sul percorso vecchio, che resta intatto nel codice.
Vale però solo finché i path `.php` rispondono ancora.

---

## 🔒 Sicurezza — da chiudere prima del go-live

Emerse durante l'analisi, indipendenti dalla migrazione:

1. ~~**XSS stored, severità alta.**~~ **CHIUSO il 28.07.** La descrizione annuncio arrivava come HTML grezzo dall'upstream e finiva in `dangerouslySetInnerHTML` (`OffertaDettaglio.jsx:233`, `Offerte.jsx:585`); il filtro rimuoveva solo `button/script/style` e `onerror=`, `<iframe>`, `<svg onload>` passavano. Chiunque potesse pubblicare un annuncio poteva eseguire JavaScript su jobcourier.ch con accesso alla sessione dei candidati.

   Risolto con `webapp/api/_sanitize.js`: allow-list di tag e attributi costruita su cheerio, non DOMPurify + jsdom (che avrebbero aggiunto ~10 MB e latenza di cold start a ogni invocazione). Rimuove tutti gli attributi non in whitelist — quindi ogni handler `on*` in un colpo solo — valida gli schemi URL contro tab/entity smuggling (`java&#09;script:`), elimina i commenti condizionali e aggiunge `rel="noopener noreferrer nofollow"` ai link. Applicato a entrambe le sorgenti.

   Coperto da 18 test in `_sanitize.test.js`, con i payload reali che prima passavano. Verificato end-to-end su 5 annunci per sorgente: nessun payload pericoloso, descrizioni integre (2326–3787 char).
2. **`id` non validato** in `job-detail.js` (nessun `encodeURIComponent`), mentre `company-detail.js` valida con `/^\d+$/`. Da allineare.
3. **CORS `*`** su tutti gli endpoint: le nostre API sono un proxy pubblico e anonimo a nostro consumo di quota. In più `job-detail.js` aggiunge `Access-Control-Allow-Credentials: true`, combinazione che i browser rifiutano comunque.
4. **CSP Arca24:** `frame-ancestors 'self' https://*.teamsystemhr.com` → il portale nuovo **non è embeddabile in iframe** dal nostro sito, se mai servisse un piano B.
5. Credenziali Cookiebot ricevute in chiaro via email il 28.07: cambiare password e passare a un gestore condiviso.

---

## 🐛 Fix già applicato in questa sessione

`webapp/api/jobs.js` generava `apply_url` con doppio segmento — `/job/job/view-job.php` — che restituiva **404 su 45 annunci su 45**. Gli href arrivano come `../job/view-job.php`; il codice li spogliava del `../` e ri-prefissava `/job/`. Ora vengono risolti con `new URL(href, LISTING_URL)`, che collassa il `../` correttamente.

Verificato dal vivo: 45/45 → HTTP 200, e anche i link annidati in `/api/company-detail` tornano 200.

Colpiva chi cliccava "Candidati" **dalla lista** senza aprire prima il dettaglio: in quel percorso `getApplyData` ricade sull'`apply_url` della lista. Aprendo prima il dettaglio funzionava, perché `job-detail` restituisce `redirect: true` con l'URL esterno.
