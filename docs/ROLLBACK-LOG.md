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

**Stato:** 🔜 non ancora eseguita — richiede login manuale dell'utente al pannello GoDaddy (account di Laura)

**Cosa fa:** abbassa solo il TTL del record `A www`. Il valore `217.26.61.124` resta invariato.

**Perché:** far scadere la cache DNS lunga prima del go-live, così venerdì la propagazione (e l'eventuale rollback) richiede ~10 minuti invece di un'ora.

**ROLLBACK:** rimettere TTL del record `A www` a 1 ora (3600s) dallo stesso pannello. Nessun impatto sul traffico in nessuno dei due stati.

**Verifica:**
```bash
nslookup -type=A www.jobcourier.ch 8.8.8.8
```

**Guardrail:** toccare esclusivamente il campo TTL di `A www`. NON toccare MX, `jobroom`, `crm`, TXT SPF/DKIM/DMARC, nameserver — vedi tabella "VIETATO" in [GOLIVE-PLAN.md](GOLIVE-PLAN.md) §2.

**Esito:** _(da compilare)_
