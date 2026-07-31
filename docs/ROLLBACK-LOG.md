# ROLLBACK LOG — operazioni go-live jobcourier.ch

Registro di ogni operazione con effetto fuori dal repo (Vercel, DNS, hosting, deploy).
Per ognuna: cosa è stato fatto, comando esatto per annullarla, come verificare che l'annullamento sia riuscito.

**Regola:** si scrive PRIMA di eseguire, si aggiorna con l'esito subito dopo.

**Rollback totale del go-live** (il tasto rosso, sempre disponibile — vedi [GOLIVE-PLAN.md](GOLIVE-PLAN.md) §6.1):
```
GoDaddy → DNS jobcourier.ch:
  A @    → 217.26.61.124
  www    → elimina CNAME, ricrea A → 217.26.61.124
```
Recupero ~10 min con TTL 600s. Il WordPress su Hostpoint resta intatto e riprende a servire.

---

## Stato di partenza (fotografia pre-intervento, 2026-07-28)

| Elemento | Valore |
|---|---|
| DNS `A @` | 217.26.61.124 (Hostpoint) |
| DNS `A www` | 217.26.61.124, TTL 1 ora |
| Nameserver | ns49/ns50.domaincontrol.com (GoDaddy) |
| Sito pubblico su jobcourier.ch | WordPress 7.0.2 su Hostpoint |
| Progetto Vercel | `job-courier-webapp` (team psikolele-projects), root `webapp` |
| Branch prod | `main` @ 5f355cc |

---

## OP-01 — Aggiunta domini al progetto Vercel

**Data:** 2026-07-28
**Stato:** ✅ eseguita e verificata

**Cosa fa:** registra `jobcourier.ch` e `www.jobcourier.ch` sul progetto Vercel `job-courier-webapp`.

**Cosa NON fa:** non modifica alcun record DNS. Il sito pubblico resta il WordPress su Hostpoint finché i record A non vengono cambiati manualmente su GoDaddy. I domini appariranno "Invalid Configuration" su Vercel: stato atteso, non errore.

**Comandi eseguiti** (con progetto già linkato la CLI vuole un solo argomento):
```bash
vercel domains add jobcourier.ch
vercel domains add www.jobcourier.ch
```
Entrambi hanno risposto `Success! Domain ... added to project job-courier-webapp`.

Subito dopo il successo la CLI tenta un `domains inspect` e restituisce
`You don't have access to "jobcourier.ch" (403)`. **Non è un fallimento
dell'operazione**: il dominio è registrato presso GoDaddy, non nell'account
Vercel, quindi l'inspect dell'anagrafica dominio non è autorizzato. L'aggiunta
al progetto è comunque avvenuta.

**ROLLBACK:**
```bash
vercel domains rm jobcourier.ch
vercel domains rm www.jobcourier.ch
```

**Verifica del rollback:**
```bash
vercel domains inspect jobcourier.ch     # deve dare "not found" o non elencare il progetto
curl -s -o /dev/null -w "%{http_code}\n" https://www.jobcourier.ch   # deve restare il WordPress
```

**Rischio residuo:** nullo. Operazione reversibile e senza effetto sul traffico.

**Esito:** domini aggiunti. Nessun effetto sul traffico, verificato prima e dopo:

| Controllo | Prima | Dopo |
|---|---|---|
| `https://www.jobcourier.ch` | 200, `Server: Apache` | 200, `Server: Apache` |
| `A www.jobcourier.ch` (via 8.8.8.8) | 217.26.61.124 | 217.26.61.124 |
| `A jobcourier.ch` (via 8.8.8.8) | 217.26.61.124 | 217.26.61.124 |

Il sito pubblico è ancora il WordPress su Hostpoint, come previsto.

**Bonus — spuntato un altro punto del pre-flight.** `vercel project inspect` conferma le
impostazioni richieste dal GOLIVE-PLAN §4:
- Root Directory: `webapp` ✅
- Framework Preset: Vite ✅
- Owner del progetto: team "N8N Projects" (`psikolele-projects`)

---

## OP-02 — TTL record `A www` da 1 ora a 600 secondi (GoDaddy)

**Data:** 2026-07-28
**Stato:** ✅ eseguita e verificata
**Autorizzazione:** via libera di Laura confermato dall'utente prima dell'esecuzione. Login al pannello effettuato dall'utente (credenziali mai viste né digitate da Claude).

**Stato del record PRIMA della modifica** (letto dal pannello GoDaddy):
```
Tipo: A
Nome: www
Dati: 217.26.61.124
TTL:  1 ora
```

**Cosa fa:** abbassa solo il TTL del record `A www`. Il valore `217.26.61.124` resta invariato.

**Perché:** far scadere la cache DNS lunga prima del go-live, così venerdì la propagazione (e l'eventuale rollback) richiede ~10 minuti invece di un'ora.

**ROLLBACK:** rimettere TTL del record `A www` a 1 ora (3600s) dallo stesso pannello. Nessun impatto sul traffico in nessuno dei due stati.

**Verifica:**
```bash
nslookup -type=A www.jobcourier.ch 8.8.8.8
```

**Guardrail:** toccare esclusivamente il campo TTL di `A www`. NON toccare MX, `jobroom`, `crm`, TXT SPF/DKIM/DMARC, nameserver — vedi tabella "VIETATO" in [GOLIVE-PLAN.md](GOLIVE-PLAN.md) §2.

**Procedura seguita:** il TTL minimo selezionabile dai preset GoDaddy è 30 minuti; per
600 secondi serve l'opzione "Personalizzata" che apre un campo in secondi. Prima del
salvataggio il form è stato riletto per intero (tipo `a`, nome `www`, valore
`217.26.61.124`, ttl `custom`/`600`) e verificato che fosse l'unico form aperto.

**Esito:**
```
Tipo: A   Nome: www   Dati: 217.26.61.124   TTL: 600 secondi
```

Controlli dopo il salvataggio:

| Controllo | Risultato |
|---|---|
| `A www` nel pannello | 217.26.61.124, **600 secondi** ✅ |
| `A @` | 217.26.61.124, 600 s — invariato |
| MX `@` | jobcourier-ch.mail.protection.outlook.com — intatto ✅ |
| CNAME `jobroom` | jobcourier.arca24.careers — intatto ✅ |
| CNAME `crm`, `autodiscover`, brevo, splio | invariati ✅ |
| `https://www.jobcourier.ch` | 200, `Server: Apache` (WordPress su Hostpoint) ✅ |
| Risoluzione da 8.8.8.8 e da ns49 | 217.26.61.124 — invariata ✅ |

Nota: i resolver che avevano già in cache la risposta con TTL 3600 continueranno a
usarla fino a un'ora dal salvataggio. Da quel momento tutti avranno il TTL corto.
Per questo l'operazione va fatta ≥24h prima del go-live.

**Rischio residuo:** nessuno. Il valore del record non è cambiato, quindi il traffico
non si sposta. Se servisse annullare, rimettere TTL 1 ora dallo stesso form.

---

## OP-03 — Allineamento `main` alla produzione + host canonico su www

**Data:** 2026-07-31 · **Stato:** ✅ eseguita e verificata

**Perché:** il deploy di produzione delle 09:54 veniva da `claude/site-final-updates-ed071a`,
tre commit avanti a `main` (fix UI offerte/pricing/AdBanner/stats mobile). Il primo push su
`main` avrebbe fatto regredire la produzione. In più apex e www rispondevano entrambi 200
senza `<link rel="canonical">` in pagina: duplicate content sulle 213 URL indicizzate, che
sono tutte su www.

**Cosa è stato fatto:**
1. fast-forward `claude/site-final-updates-ed071a` → `main` (0 commit persi, 0 conflitti)
2. `68fb357` canonical + og:url derivati dal pathname nell'Helmet di `App.jsx`, host `https://www.jobcourier.ch`
3. `3ec9d1c` rimosso l'`og:url` statico da `index.html` (react-helmet-async non sostituisce i tag che non ha creato → ne comparivano due)
4. push su `main` → deploy produzione `eawfnzsx4`

**ROLLBACK:**
```bash
git -C <repo> revert 3ec9d1c 68fb357 && git push origin main
# oppure, immediato, senza rebuild:
vercel rollback https://job-courier-webapp-demddmwmn-psikolele-projects.vercel.app
```

**Verifica eseguita sul deploy live:**

| Controllo | Esito |
|---|---|
| 211/211 URL vecchie (`old-urls-snapshot.txt`) | tutte 200, nessuna orfana ✅ |
| `/xyz-inesistente` | 404 HTTP reale ✅ |
| 10 route principali | 200 ✅ |
| `/api/jobs`, `/api/companies`, `/api/job-detail` | 200 ✅ |
| canonical su `/soluzioni-e-tariffe` | 1 tag, `https://www.jobcourier.ch/soluzioni-e-tariffe` ✅ |
| `og:url` | 1 tag, coerente col canonical ✅ |
| console browser | 0 errori ✅ |
| lint su `App.jsx` | 0 problemi (errori pre-esistenti del repo invariati) ✅ |

**Rischio residuo:** nullo sul traffico — il DNS punta ancora a Hostpoint, questo deploy
è visibile solo su `.vercel.app`.

---

## OP-04 — Redirect apex → www su Vercel Domains — ⏳ DA ESEGUIRE

**Perché:** oggi apex e www servono entrambi 200. Va scelto un host canonico o Google
vede contenuto duplicato. Si tiene **www**: è l'host di tutte le 213 URL indicizzate,
della sitemap e di robots.txt, quindi il canonical non si sposta.

**Dove:** Vercel → progetto `job-courier-webapp` → Settings → Domains →
`jobcourier.ch` → Edit → *Redirect to* `www.jobcourier.ch`, status 308.
Lasciare `www.jobcourier.ch` come dominio primario servito dal deploy.

**ROLLBACK:** stessa schermata, rimettere `jobcourier.ch` su "No Redirect".

**Verifica:** dopo il cambio DNS,
`curl -sI https://jobcourier.ch/` → `308` + `location: https://www.jobcourier.ch/`.

**Rischio:** nullo prima del cambio DNS (nessuno raggiunge ancora quei domini su Vercel).

---

## OP-05 — Backup database WordPress da Hostpoint

**Data:** 2026-07-31 19:32–19:41 · **Stato:** ✅ eseguita
**Autorizzazione:** utente, esplicita. Login al pannello fatto dall'utente (credenziali mai viste né digitate da Claude).

**Cosa:** Backup Manager → tab "Backup database" → download dei due DB MySQL.

| File | Dimensione | Tabelle | Esito |
|---|---|---|---|
| `uzohucip_wp0.sql` | 276 KB | 12 | `-- Dump completed on 2026-07-31 19:32:59` ✅ |
| `uzohucip_wp1.sql` | 953 MB | 85 | `-- Dump completed on 2026-07-31 19:37:24` ✅ |

Destinazione: `C:\Users\psiko\Downloads\`. **Da spostare in un archivio stabile** — la
cartella Download non è un posto dove tenere l'unica copia del sito del cliente.

**⚠️ Incidente durante l'operazione — il sito è andato 503 per ~7 minuti.**

Il dump di `uzohucip_wp1` è quasi 1 GB. Su Smart Webhosting condiviso il mysqldump ha
saturato la capacità: `https://www.jobcourier.ch/` ha risposto **503 Service Unavailable**
(Apache, "capacity problems") fra le 19:37 e le 19:41 circa. A download concluso il sito è
tornato **200** senza alcun intervento.

Aggravante mia: il primo click su DOWNLOAD sembrava non aver fatto nulla (nessun file su
disco dopo 60s), ho ricliccato, e sono partiti **due** dump da 1 GB in parallelo. Il primo
in realtà stava lavorando, solo lentamente. Il file duplicato `uzohucip_wp1 (1).sql` è
stato cancellato. Regola per la prossima volta: su Hostpoint un dump grosso può metterci
minuti prima di scrivere il primo byte su disco — controllare `*.crdownload`, non
l'assenza del file finale.

**Conseguenza operativa:** il **backup file (tab "Backup server")** NON è stato lanciato.
Genera un archivio dell'intero account da 9.2 GB e rischia un 503 molto più lungo mentre
il sito è ancora quello pubblico. Va fatto **dopo** lo switch DNS, quando jobcourier.ch
non punta più a Hostpoint: stesso backup, zero impatto visibile.

**ROLLBACK:** non applicabile — operazione di sola lettura. Nessuna modifica sul server.

---

## OP-06 — GO-LIVE: switch DNS jobcourier.ch → Vercel

**Data:** 2026-07-31, ~22:20–22:33 CET · **Stato:** ✅ eseguito e verificato
**Autorizzazione:** utente, esplicita. Modifiche fatte dall'utente sul pannello GoDaddy (credenziali mai viste né digitate da Claude).

**Cosa è stato fatto (GoDaddy → DNS jobcourier.ch):**
1. `A @`: `217.26.61.124` → `76.76.21.21`
2. `A www` eliminato → creato `CNAME www` → `cname.vercel-dns.com`, TTL 600s
3. Vercel Domains: `jobcourier.ch` impostato su Redirect 308 → `www.jobcourier.ch`; `www.jobcourier.ch` confermato su Production (fatto prima dello switch, OP precedente non numerata)

**Timeline propagazione:**
- 22:20 — apex già 308 funzionante (Server: Vercel), www ancora SSL "SEC_E_WRONG_PRINCIPAL" (cert non emesso)
- 22:26, 22:33 — ricontrolli, SSL ancora pending
- ~22:32 — certificato Let's Encrypt emesso (`notBefore=Jul 31 21:32:32 2026 GMT`), www torna 200 HTTPS
- Tempo totale emissione SSL: ~12 minuti, ben dentro la soglia di 1h del playbook §6.3

**Matrice di verifica finale (§5 punto 7) — tutto verde:**

| Controllo | Esito |
|---|---|
| `https://jobcourier.ch` | 308 → www, SSL valido |
| `https://www.jobcourier.ch` | 200, SSL Let's Encrypt valido fino 29/10/2026 |
| 10 rotte principali | tutte 200 |
| `/xyz-inesistente` | 404 reale |
| `https://jobroom.jobcourier.ch` | 200, intatto |
| `https://crm.jobcourier.ch` | 200, intatto |
| 5 redirect a campione (`/prezzi/`, `/faq-candidato/`, `/de/`, `/candidati/`, `/recruiters/`) | tutti risolti alla pagina corretta |
| `/api/jobs`, `/api/companies`, `/api/job-detail` | 200 |
| Mixed content homepage | nessuno |

**Non ancora verificato (richiede azione umana):**
- Invio/ricezione email @jobcourier.ch (test con Laura)
- Submit sitemap + richiesta indicizzazione su Search Console

**ROLLBACK disponibile (§6.1):**
```
GoDaddy → DNS jobcourier.ch:
  A @   → 217.26.61.124
  www   → elimina CNAME, ricrea A → 217.26.61.124
```
Recupero ~10 min (TTL 600s). WordPress su Hostpoint intatto, non toccato, non disdetto.

**Prossimo passo consigliato:** backup file completo Hostpoint (OP "Backup server", rimandato in OP-05 per evitare 503 sul sito pubblico) — ora sicuro, Hostpoint non serve più traffico live.

---

## OP-07 — Deploy vetrina home: cap 2 offerte per azienda + regione lingua

**Data:** 2026-08-01, ~00:45–01:10 · **Stato:** ✅ eseguito e verificato in produzione
**Autorizzazione:** utente, esplicita ("ora"); conferma push su main tramite AskUserQuestion prima del deploy (bloccato una volta dal classificatore di sicurezza dell'harness, poi confermato).

**Perché:** la home mostrava le "Offerte appena pubblicate" senza alcun filtro — il feed
upstream raggruppa le offerte per azienda, risultando in run di 3-4 annunci consecutivi
della stessa agenzia (es. 4× Adecco). Segnalato dall'utente confrontando il sito live con
la build precedente.

**Origine del fix:** la feature esisteva già, sviluppata e verificata in preview il 30/07
sul branch `claude/offerte-vetrina-lingua-cantone-d4d073`, ma **mai mergiata** — quel
branch divergeva da un `main` di ieri pomeriggio (prima di UI fixes, canonical SEO,
i18n batch2). Un merge diretto avrebbe toccato 37 file e reintrodotto regressioni già
sistemate stanotte: heading `Offerte.jsx` (tornerebbe al fontSize/testo pre-fix) e
CSS mobile stats (perderebbe il fix di `8b49ead`).

**Cosa è stato effettivamente portato in main** (cherry-pick chirurgico, non merge):
- **Nuovi file** (copiati as-is dal branch): `webapp/src/hooks/useShowcaseJobs.js` +
  test, `webapp/src/utils/localeRegion.js` + test — logica di cap-per-azienda e
  mappatura cantone→regione linguistica
- **Patch mirate** (5 file, diff isolato dal resto del branch):
  `webapp/src/components/Filters.jsx` (consuma l'hook), `webapp/src/services/api.js`
  (fetchLatestJobs accetta parametri), `webapp/api/jobs.js` (nuovo modo opt-in
  `showcase=1`: campiona 8 pagine con stride invece di 3 consecutive, whitelist dei
  parametri inoltrati upstream), `webapp/vercel.json` (timeout 60s sulla function
  `api/jobs.js`), `webapp/src/i18n.js` (persiste la lingua scelta in localStorage)
- **Esplicitamente escluso**: il diff del branch su `Offerte.jsx` (heading) e
  `index.css` (rimuoveva il fix mobile) — avrebbero causato regressioni
- **Nessuna modifica ai file locale** (`it/en/de/fr.json`) — la feature non richiede
  nuove chiavi di traduzione, evitando così il conflitto a 342 vs 246 chiavi

**Verifica pre-deploy:**
- Build ✅, lint invariato (60 problemi, stesso baseline pre-esistente), 134 test nuovi
  passati (`useShowcaseJobs.test.js` + `localeRegion.test.js`)
- Server dev locale: home mostra 8 aziende diverse, zero ripetizioni; richieste
  `api/jobs?showcase=1` → 200; `/offerte` (listing completo) verificata intatta,
  heading statico invariato

**Verifica post-deploy (produzione, bundle `index-CZExhNgr.js`):**
- Homepage live: 7 aziende distinte, max 2 occorrenze ciascuna (Adecco×2,
  Manpower×2, Work Selection×2) — cap rispettato
- Tutte le rotte 200, jobroom/crm intatti, redirect di esempio ok,
  `api/jobs?showcase=1` e `api/jobs` (default, usato da `/offerte`) entrambi 200

**ROLLBACK:**
```bash
git -C <repo> revert 0c72fcf && git push origin main
# oppure immediato senza rebuild:
vercel rollback <url del deployment precedente>
```
Il modo `showcase=1` di `api/jobs.js` è additivo: se disabilitato, `/offerte` e il resto
del sito non sono toccati.

---

## OP-08 — Backup file completo (ZIP) account Hostpoint

**Data:** 2026-08-01, 01:09 · **Stato:** ⏳ avviato, in corso lato server
**Autorizzazione:** utente, esplicita ("lancia il backup file completo... per ultimo").

**Cosa:** Backup Manager → tab "Backup server" → tipo ZIP Archive → Avviare un backup.
Rimandato dopo lo switch DNS (OP-06) apposta: ora Hostpoint non serve più traffico
pubblico, un backup di 9.2GB non rischia il 503 osservato in OP-05.

**Stato al momento della richiesta:** "Creato il 01.08.2026 01:09:25 — Il backup non è
ancora finito". Notifica automatica via mail a laura@jobcourier.ch al completamento
(comportamento dichiarato dal pannello). Download disponibile dalla stessa pagina una
volta pronto.

**ROLLBACK:** non applicabile — operazione di sola lettura, nessuna modifica al server.
