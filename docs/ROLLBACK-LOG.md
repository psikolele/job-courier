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
