# Audit sito jobcourier.ch — 04.08.2026

Controllo su **produzione** (`https://www.jobcourier.ch`), crawl automatizzato Chromium 1440×950
+ verifica diretta delle API e del portale a monte `jobroom.jobcourier.ch`.

Causa comune a quasi tutti i difetti: **la migrazione al portale Arca24 "viso"** (commit `aeb63e1`…`bd0077e`).
L'adapter legge le nuove pagine, ma tre campi che il vecchio portale esponeva — **logo, slug azienda,
numero annunci** — sul nuovo non vengono più letti e degradano a un fallback.

---

## 1. Logo Job Courier al posto del logo azienda 🔴 BLOCCANTE

**Dove:** card offerte in home, lista `/offerte`, griglia `/aziende-che-assumono` (35 riquadri su 35
mostrano la "JC"), dettaglio offerta.

**Causa:** [`webapp/api/_arca24.js:99`](webapp/api/_arca24.js#L99) — `fallbackLogo()` conosce solo
4 nomi (randstad, adecco, manpower, gi group). Tutti gli altri finiscono su
`google.com/s2/favicons?domain=jobcourier.ch` = favicon JC.

Il parser della lista non legge nessun logo perché sul nuovo portale l'immagine è **lazy-loaded**:
nell'HTML c'è solo un placeholder base64, l'URL vero lo mette il JS.

**Fix:** il logo è ricavabile dall'id azienda, che già abbiamo (`company.arca24_id`):

```
https://jobroom.jobcourier.ch/custom_visojobcourier/media/logo/logo_company_<ID>.jpg
```

302 → S3 presigned, `200 image/jpeg`. Verificato su tutte le 35 aziende: **30 hanno il logo reale**,
5 no (Blackpoints SA, Casinò Lugano, Fabio Rezzonico SA, Romande Energie SA, Suisse Immo Solutions SA)
→ per quelle resta il fallback testuale.

> Nota: `api/company-detail.js:108` usa ancora il path vecchio `custom_jobcourier/` (senza `viso`).
> Risponde tuttora 200, ma è il path della piattaforma dismessa: va allineato.

---

## 2. Vetrine azienda → 404 🔴 BLOCCANTE

**Dove:** `/aziende-che-assumono`, click su qualsiasi "SCOPRI DI PIÙ".

**Cosa succede:** l'URL generato è `/azienda/` (slug vuoto) → non matcha `Route path="/azienda/:slug"`
→ cade sul catch-all → pagina "Errore 404 – Pagina non trovata". **Tutte e 35.**

**Causa:** [`_arca24.js:91` `parseCompanyRef()`](webapp/api/_arca24.js#L91) — il vecchio portale
usava `profile:id_3244729&company_name=x` (slug incluso), il nuovo usa `profile?uiid=3244729`
(**slug assente**). Il ramo `uiid` ritorna `slug: ''`, quindi `/api/companies` restituisce
`"slug": ""` per ogni record e [`AziendeCheAssumono.jsx:144`](webapp/src/pages/AziendeCheAssumono.jsx#L144)
costruisce `` `/azienda/${company.slug}` `` = `/azienda/`.

Secondo effetto: [`AziendaDettaglio.jsx:34`](webapp/src/pages/AziendaDettaglio.jsx#L34) cerca
`list.find(c => c.slug === slug)` — con tutti gli slug vuoti non troverebbe mai nulla comunque.

**Fix:** generare lo slug dal nome (`slugify()` esiste già in `_arca24.js:279`) e risolvere per
slug **o** per id, così i vecchi link restano validi.

---

## 3. Vetrine in home → loop di reload infinito 🔴 BLOCCANTE

**Dove:** home, sezione "Aziende e Recruiter che si affidano a Job Courier" (15 loghi, "VEDI ANNUNCI").

**Cosa succede:** i link puntano al **vecchio** portale:
`jobroom.jobcourier.ch/employer/view-company.php?id=3243388&company-name=orienta-sa`.
Su Arca24 quella pagina risponde 200 ma il body è:

```html
<script> localStorage.clear(); window.location.reload(true); </script>
```

→ la pagina si ricarica all'infinito. Per l'utente è indistinguibile da un sito rotto.
Sono **15 link su 15**, in [`Vetrini.jsx:8-22`](webapp/src/components/Vetrini.jsx#L8) (lista hardcoded).

**Fix:** puntare a `/azienda/<slug>` interno (una volta risolto il punto 2), oppure al nuovo
`https://jobroom.jobcourier.ch/it/careers/company/profile?uiid=<ID>`.

---

## 4. Contatore annunci sempre 0 🟠

`/api/companies` restituisce `"jobs_count": 0` per tutte. Il parser cerca
`Annunci totali : N` ([`_arca24.js:380`](webapp/api/_arca24.js#L380)), stringa che il nuovo indice
non contiene più — la riga ora è `"Gi Group SA · Neuchâtel · Vedi tutti gli annunci"`.
La località, invece, è disponibile e non viene letta.

---

## 5. Settore e Ruolo sempre "Altro / Non specificato" 🟠

Nelle card e nel dettaglio: `RUOLO: ALTRO` ovunque, `SETTORE: ALTRO` su molte.
La lista Arca24 non espone settore/ruolo (`_arca24.js:152-153` li mette a `'Non specificato'` per
scelta) e sul dettaglio i microdata `industry` / `occupationalCategory` spesso mancano.
Impatta anche i filtri: filtrare per ruolo non può funzionare su dati assenti.

---

## 6. `[removed]` nel testo degli annunci 🟠 — **problema a monte, non nostro**

Nel dettaglio compaiono frasi tipo *"Grundausbildung ([removed] als Automatiker…)"*.
Verificato: la stringa è già **nell'HTML servito da Arca24** (4 occorrenze sulla stessa offerta),
il nostro sanitizer non la produce. Da segnalare a Gabriele/Laura.

---

## 7. `<title>` unico su 7 pagine 🟡 SEO

`/offerte`, `/soluzioni-e-tariffe`, `/come-funziona`, `/contatti`, `/faq`, `/condizioni-generali`,
`/cookie-policy` e le pagine `/offerta/:id` servono tutte
`"JobCourier - Il portale svizzero per il lavoro"`. Titoli corretti solo su `/aziende-che-assumono`
e sul blog. Da sistemare prima che Google reindicizzi.

---

## Cosa invece funziona ✅

- Tutte le 13 rotte principali rispondono **200**, nessun 404 accidentale.
- I 18 link interni del blog: tutti validi, nessuno rotto.
- Nessun errore JS in console, nessuna richiesta di rete fallita (a parte quella di `/azienda/`).
- I 26 link `href="#"` visti dal crawler sono **tutti** dentro il dialog Cookiebot: falso allarme.
- Le pagine dettaglio offerta `/offerta/:id` caricano e mostrano descrizione completa.
- I loghi statici della sezione "Aziende partner" in home si vedono correttamente.

---

## Priorità

| # | Problema | Impatto | Sforzo |
|---|----------|---------|--------|
| 2 | Vetrine azienda → 404 | 35 pagine irraggiungibili | Basso |
| 3 | Vetrine home → loop reload | 15 link, home page | Basso |
| 1 | Logo JC al posto dell'azienda | tutto il sito | Basso |
| 4 | Contatore annunci 0 | estetico | Basso |
| 7 | Title duplicati | SEO | Medio |
| 5 | Settore/Ruolo mancanti | filtri | Alto (dipende da Arca24) |
| 6 | `[removed]` nei testi | contenuti | — (Arca24) |

I primi tre sono tutti nello stesso file (`api/_arca24.js`) più due componenti, e sono quelli
che Gabriele vede.

---

## Stato: 1, 2 e 3 risolti (stessa giornata)

- **Logo** — `companyLogo(id, nome)` costruisce l'URL dall'id azienda; il ripiego per nome resta
  solo per i 4 brand noti e per tutti gli altri **non restituisce nulla** invece della favicon
  JobCourier. Applicato a lista offerte, dettaglio offerta, lista aziende, dettaglio azienda.
  Tolta anche la favicon JC dai due ripieghi lato front-end (`Filters.jsx`, `OffertaDettaglio.jsx`).
- **Slug** — derivato dal nome con lo `slugify()` già presente; `AziendaDettaglio` risolve per
  slug **o** per id, così i link reggono un altro cambio di formato a monte.
- **Vetrine home** — `Vetrini.jsx` tiene solo gli id e costruisce logo e link; il link punta al
  profilo sul portale nuovo, non più alla pagina che si auto-ricaricava all'infinito.

Verifica su build di produzione servita in locale contro il portale vero:
`/offerte` e home → **0 favicon JobCourier**, 15 loghi reali, 0 immagini rotte; le 33 card azienda
puntano al proprio slug (0 vuote) e il click apre il profilo; 14 rotte controllate, nessun 404.
Suite: 189 test verdi (5 nuovi a copertura di logo e slug).

Restano aperti i punti 4, 5, 6 e 7.
