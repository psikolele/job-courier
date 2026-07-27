# GO-LIVE PLAN — jobcourier.ch → Vercel

**Verificato:** 2026-07-26 con fonti autorevoli (RDAP nic.ch, DNS pubblico, header HTTP, pannello GoDaddy, pannello Hostpoint)
**Owner:** Emanuele Serra
**Status:** 🟡 PRE-FLIGHT — bloccanti aperti (vedi §4)
**Riferimento memoria Claude:** `project_dns_hosting_map.md`

---

## 1. Mappa infrastruttura attuale (verificata, non presunta)

```
                    ┌─────────────────────────────────────┐
                    │  GODADDY (account LB)               │
                    │  Registrar + Zona DNS               │
                    │  dominio scade: 5 feb 2027          │
                    │  NS: ns49/ns50.domaincontrol.com    │
                    └──────────────┬──────────────────────┘
                                   │ 22 record DNS
        ┌──────────────┬───────────┼────────────┬──────────────────┐
        ▼              ▼           ▼            ▼                  ▼
   A @ e www      MX @ →      CNAME jobroom  CNAME crm      TXT SPF/DKIM/
   217.26.61.124  outlook.com → jobcourier.  → jobcourierperm DMARC/GSC
        │         (email M365)  arca24.careers  .arca24.careers (Outlook,
        ▼              │            │            │           Brevo, Splio)
   HOSTPOINT       EMAIL       PIATTAFORMA    CRM ARCA24
   "uzohucip"      AZIENDALI   ARCA24 (LIVE!) (LIVE!)
   sl1730, Apache  laura@,     nuova versione
   WordPress 7.0.2 g.molteni@  il 3 agosto
   (sito vecchio)
```

**Hostpoint (account "Jobcourier Sagl", login laura@jobcourier.ch):**
- Smart Webhosting "uzohucip" — SOLO sito WordPress vecchio
- Docroot: `www/jobcourier.ch/www.jobcourier.ch/marahouse`
- 2 DB MySQL (uzohucip_wp0, wp1) · 0 cron job · 0 caselle email · 1 account FTP
- Dominio qui solo "collegato", NON registrato (verificato: c'è opzione "Trasferimento dominio")
- **Il doc handoff-2026-06-13 che dice "già live su Vercel" è ERRATO** — produzione è su Hostpoint

**Nuovo sito:** React 19 + Vite 7, repo `webapp/`, deploy auto Vercel su push a `main`.

---

## 2. Il cambio DNS (la parte facile)

In GoDaddy → DNS → jobcourier.ch, **SOLO 2 modifiche**:

| # | Record | Valore attuale | Nuovo valore |
|---|--------|----------------|--------------|
| 1 | A `@` | 217.26.61.124 | `76.76.21.21` |
| 2 | A `www` | 217.26.61.124 | eliminare A, creare CNAME `www` → `cname.vercel-dns.com` |

**VIETATO toccare** (ognuno = disastro immediato):

| Record | Se toccato |
|--------|-----------|
| MX `@` → outlook.com + CNAME autodiscover | Email aziendali morte |
| CNAME `jobroom` → jobcourier.arca24.careers | Piattaforma job Arca24 giù |
| CNAME `crm` → jobcourierperm.arca24.careers | CRM giù |
| TXT SPF (`v=spf1 include:spf.protection.outlook.com -all`) | Mail aziendali in spam |
| TXT/CNAME Brevo + Splio (DKIM/DMARC/bounce, anche su `service`) | Email marketing in spam |
| MX `service` → bounce.splio4.com | Bounce handling Splio rotto |
| TXT `google-site-verification` (su `service`) | Perdita verifica GSC |
| NS ns49/ns50 | TUTTO giù |

---

## 3. ⚠️ LA VERITÀ BRUTALE: il DNS non è il rischio. Il rischio è la SEO.

Il sito WP vecchio ha **213 URL indicizzate** (sitemap Rank Math verificata 26/07):
- 146 post blog (IT + DE + FR)
- 67 pagine (incluse `/de/...` e `/fr/...` complete)

La webapp nuova ha ~10 route: `/`, `/offerte`, `/offerta/:id`, `/blog/:categoria`, `/blog/:categoria/:slug`, `/soluzioni-e-tariffe`, `/come-funziona`, `/contatti`, `/faq`, `/condizioni-generali`, `/cookie-policy`.

**Cosa succede al go-live senza redirect:** ~200 URL indicizzate → la SPA serve index.html con status 200 (rewrite in vercel.json) → Google li classifica **soft-404** → deindicizzazione progressiva + perdita ranking. Esattamente il danno SEO che nella mail a Mara/Gabriele abbiamo promesso di evitare.

### 3.1 URL con parità diretta (OK senza lavoro)
`/`, `/come-funziona`, `/contatti`, `/soluzioni-e-tariffe`, `/condizioni-generali`, `/cookie-policy`, `/faq`* 
(*vecchio ha `/faq-candidato/` → serve 301)

### 3.2 Lavoro OBBLIGATORIO pre-go-live: redirect map in `webapp/vercel.json`
Categorie da mappare (array `redirects`, `permanent: true`):

| Gruppo vecchio | Destinazione 301 |
|---|---|
| `/faq-candidato/` | `/faq` |
| `/prezzi/` | `/soluzioni-e-tariffe` |
| `/candidati/` | `/offerte` |
| `/recruiters/`, `/agenzie-per-il-lavoro/` | `/soluzioni-e-tariffe` |
| `/login/` | `/` (o piattaforma jobroom) |
| `/news/`, `/magazine-*` | `/blog/carriera` |
| Post blog IT con equivalente nuovo | articolo corrispondente `/blog/:cat/:slug` |
| Post blog IT senza equivalente | `/blog/carriera` (catch da valutare singolarmente) |
| `/de/:path*` | `/blog/karriere` o home — DECISIONE APERTA |
| `/fr/:path*` | `/blog/carriere` o home — DECISIONE APERTA |

Nota Vercel: i redirect si valutano PRIMA del rewrite SPA, quindi basta aggiungerli all'array esistente. Pattern: `{ "source": "/de/:path*", "destination": "/", "permanent": true }`.

**Comando per rigenerare lista completa URL vecchi** (finché WP è vivo):
```bash
curl -s https://www.jobcourier.ch/post-sitemap.xml https://www.jobcourier.ch/page-sitemap.xml | grep -oP '(?<=<loc>)[^<]+'
```
⚠️ Eseguirlo e salvare output PRIMA dello switch — dopo, il WP non è più raggiungibile (se non via hosts file → vedi §7).

### 3.3 Altri gap trovati nel repo (fix pre-go-live)
1. **Nessuna route 404** in `App.jsx` (`path="*"`) → aggiungere pagina NotFound con status handling; senza, ogni URL sbagliata è soft-404
2. `public/robots.txt` OK (punta a sitemap corretta) ✅
3. Sitemap generata a build con hreflang IT/EN/DE/FR ✅
4. Cache headers + SPA rewrite in vercel.json ✅

---

## 4. Bloccanti pre-flight (da chiudere PRIMA di toccare DNS)

- [x] **Redirect map completa** in vercel.json (§3.2) — ✅ 2026-07-26: 121 redirect generati (211 URL coperte: 6 parità, 86 DE/FR via 2 pattern, 119 IT singole). Build OK. Da testare su .vercel.app dopo push
- [x] **Route 404** aggiunta — ✅ 2026-07-26: `webapp/src/pages/NotFound.jsx` + catch-all in App.jsx, verificata in dev
- [ ] **Verifica impostazioni progetto Vercel**: Root Directory = `webapp`, framework Vite, output `dist`, functions `api/jobs.js` + `api/job-detail.js` funzionanti su .vercel.app
- [ ] **Domini aggiunti su Vercel** (Settings → Domains): `jobcourier.ch` + `www.jobcourier.ch` (resteranno "pending" — normale)
- [ ] **TTL abbassato**: record A `www` da 1h → 600s (il `@` è già 600s). Farlo ≥24h prima
- [x] **Snapshot URL vecchie salvate** — ✅ `docs/old-urls-snapshot.txt` (211 URL uniche, 2026-07-26)
- [ ] **Accesso Search Console ottenuto** (chiedere a Laura/Gabriele chi ha la proprietà; il TXT google-site-verification esiste già. Fallback: auto-verifica via record DNS in GoDaddy, metodo "Dominio")
- [ ] **Backup Hostpoint**: da pannello → Backup Manager, scaricare backup file+DB WordPress (assicurazione se un giorno serve contenuto vecchio)
- [ ] **Coordinamento Arca24**: il 3 agosto rilasciano la nuova piattaforma su jobroom — NON fare lo switch DNS lo stesso giorno. Due variabili insieme = debug impossibile

---

## 5. Sequenza go-live (giorno X, mattina — MAI venerdì/weekend)

1. ✅ Verifica pre-flight tutta spuntata
2. Smoke test finale su `<progetto>.vercel.app`: home, /offerte, dettaglio offerta, blog, api/jobs
3. GoDaddy: cambio A `@` → `76.76.21.21`
4. GoDaddy: elimina A `www`, crea CNAME `www` → `cname.vercel-dns.com`
5. Attesa propagazione: 10–30 min (TTL 600s). Check: `nslookup jobcourier.ch 8.8.8.8`
6. Vercel emette SSL automatico (Let's Encrypt) quando vede il DNS — se resta "pending" >1h vedi §6.3
7. **Matrice di verifica** (tutta, nessuna esclusa):
   - [ ] `https://jobcourier.ch` → 200, sito nuovo, lucchetto SSL valido
   - [ ] `https://www.jobcourier.ch` → 200 o redirect coerente (impostare www↔apex in Vercel Domains)
   - [ ] `https://jobroom.jobcourier.ch` → piattaforma Arca24 ancora su ✅
   - [ ] `https://crm.jobcourier.ch` → ancora su ✅
   - [ ] Invio/ricezione email @jobcourier.ch (test con Laura) ✅
   - [ ] 5 URL vecchie a campione → 301 corretti (es. `/prezzi/`, `/de/`, un post blog)
   - [ ] `/api/jobs` risponde
   - [ ] Nessun mixed content in console browser
8. Search Console: submit `https://www.jobcourier.ch/sitemap.xml` + "Richiedi indicizzazione" su home e pagine chiave
9. Monitoraggio giorno 1–3: GSC → Copertura (spike di 404/soft-404 = redirect mancanti, aggiungerli e redeploy), Vercel Analytics/logs
10. Hostpoint: **NON toccare, NON disdire** per 4 settimane minimo (paracadute)

---

## 6. Playbook errori — cosa fare se qualcosa va storto

### 6.1 ROLLBACK TOTALE (il tasto rosso — sempre disponibile)
Sintomo: qualsiasi cosa gravemente rotta e non diagnosticabile in <30 min.
```
GoDaddy → DNS:
  A @   → 217.26.61.124   (ripristina)
  www   → elimina CNAME, ricrea A → 217.26.61.124
```
Tempo recupero: ~10 min (TTL 600s). Il WordPress su Hostpoint è rimasto intatto e riprende a servire come se nulla fosse. **Per questo non si disdice Hostpoint.**

### 6.2 Sito raggiungibile a metà (alcuni utenti vecchio, altri nuovo)
Causa: propagazione DNS in corso. NON è errore. Attendere fino a TTL + margine (1h max con 600s). Non fare altri cambi nel mentre — mai correggere durante propagazione.

### 6.3 SSL "pending" su Vercel >1 ora
Causa tipica: record sbagliato (typo in cname.vercel-dns.com) o CAA restrittivo.
Check: `nslookup -type=CAA jobcourier.ch` — se esiste record CAA senza letsencrypt.org, aggiungere `0 issue "letsencrypt.org"`. (Verificato 26/07: **nessun record CAA presente** → non dovrebbe accadere.)
Nel mentre il sito può dare avviso certificato → se >2h, rollback §6.1.

### 6.4 Email smettono di funzionare
Causa possibile: cancellato/modificato per errore MX o SPF durante l'edit.
Fix: ripristinare da questo doc (§2 tabella VIETATO) — valori esatti:
- MX `@` → `jobcourier-ch.mail.protection.outlook.com` (priorità 0)
- TXT `@` → `v=spf1 include:spf.protection.outlook.com -all`
- CNAME `autodiscover` → `autodiscover.outlook.com`
Nota: cambio A/www NON può rompere le email — se si rompono, è stato toccato altro.

### 6.5 jobroom/crm giù
Causa possibile: CNAME toccato per errore.
Fix: `jobroom` → `jobcourier.arca24.careers` · `crm` → `jobcourierperm.arca24.careers`
Anche qui: lo switch A/www non li tocca. Se giù il 3 agosto sera, è il rilascio Arca24, non il DNS — chiamare Francesca Strada (Arca24, +41 91 210 89 31).

### 6.6 Calo traffico organico nei giorni dopo
- GSC → Copertura → esportare 404/soft-404 → aggiungere 301 mancanti in vercel.json → push (deploy auto ~1 min)
- Calo <15% prima settimana con redirect a posto = fisiologico, recupera
- Calo >30% = redirect map incompleta, audit completo urgente

### 6.7 API /api/jobs non risponde in produzione
Vercel → Deployment → Functions logs. Causa tipica: root directory sbagliata o runtime. Testabile PRIMA su .vercel.app — per questo è nel pre-flight. Se rotto solo su dominio custom: Vercel → Domains → verifica assegnazione al deployment di produzione.

### 6.8 Serve un contenuto del sito vecchio dopo lo switch
WP non più pubblico ma vivo su Hostpoint. Accesso: file hosts locale → `217.26.61.124 www.jobcourier.ch` → browser vede il vecchio sito. Oppure Hostpoint → Explorer/phpMyAdmin. (Ricordarsi di togliere la riga hosts dopo.)

---

## 7. Decisioni aperte (input Gabriele/Laura)

1. **Sottodominio jobroom**: la mail 26/07 di G proponeva nuovo sottodominio → posizione nostra e di Mara (Erabox): NO, si mantiene. In attesa chiusura formale nel thread "lavori per JC".
2. **Destinazione redirect DE/FR**: home o categorie blog corrispondenti? (il nuovo sito ha blog 4 lingue ma non le pagine corporate DE/FR)
3. **Chi ha accesso GSC oggi** (TXT google-site-verification esistente — chi l'ha creato? Probabile Mara/Erabox o Arca24)
4. **Data go-live**: proposta ≥5 agosto (dopo rilascio Arca24 del 3, mai stesso giorno), mar/mer/gio mattina
5. **Disdetta Hostpoint**: valutare solo dopo 4+ settimane di stabilità (costo mensile basso = assicurazione)

---

## 8. Contatti utili

| Chi | Ruolo | Contatto |
|---|---|---|
| Laura Ballinari | Business Strategist JC, account Hostpoint/GoDaddy | laura@jobcourier.ch, 077 261 39 39 |
| Gabriele Molteni | JC | g.molteni@jobcourier.ch |
| Francesca Strada | Arca24 Client Success (piattaforma jobroom/crm) | f.strada@arca24.com, +41 91 210 89 31 |
| Mara Casartelli | Erabox (SEO, autrice sito WP "marahouse") | m.casartelli@erabox.ch |
| Supporto Hostpoint | | 0844 040404 |
