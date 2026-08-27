# Handoff: migrazione Job Courier verso account Vercel dedicato (27 Agosto 2026)

**Stack operativo:** Claude Sonnet 5, effort basso, caveman mode full · tool: Gmail MCP, Claude in Chrome (browser reale, non Browser pane), Bash/Edit · commit `06c748a` pushato su `main`

## Contesto: perché questa migrazione

**27/08 mattina:** team Vercel `kraken-solutions` (Hobby/free) ha sforato 300% della quota gratuita Fluid Active CPU (4h/mese) → account pausato → **tutti i siti del team offline**, incluso Job Courier. L'utente ha già pagato upgrade a Pro ($24.40, ricevuta #2949-1681) per sbloccare velocemente — i siti sono tornati su prima che io intervenissi.

**Causa reale individuata (non un bug):** il team `kraken-solutions` è condiviso tra JC e altri progetti Kraken (kraken-solution blog, lead-cognati-web, jc-crm). Analisi Observability su `job-courier-webapp` (ultimi 7gg, ordinato per Active CPU):

| Route | Invocazioni | CPU attiva | P75 durata |
|---|---|---|---|
| `/api/companies` | 2.3K | 1h | 5s |
| `/api/jobs` | 6.1K | 52m | 1.83s |
| `/api/sitemap-jobs.xml` | 302 | 34m | 14s |
| `/api/job-detail` | 21K | 26m | 2.01s |

`/api/companies` e `/api/sitemap-jobs.xml` fanno scraping live su Arca24 per natura del progetto (non esiste sorgente statica per annunci che ruotano/scadono) — costo intrinseco, non errore. Già mitigato in [webapp/api/sitemap-jobs.xml.js](../webapp/api/sitemap-jobs.xml.js): `ARCA24_LISTING_PAGES` 5→3, `JOBROOM_LISTING_PAGES` 20→12, cache TTL 1800s→3600s. Non toccato `companies.js` (già ottimizzato con logica di resilienza deliberata — vedi commenti nel file, e `00_Wiki/job-courier/arca24-company-index.md` / `jobroom-feed-resilience.md`).

## Decisione presa (dopo brainstorming con l'utente)

**JC è l'unico progetto Kraken con profitto reale — priorità assoluta: sempre online, mai più dipendente dalla quota condivisa con progetti secondari.**

Opzioni valutate:
- ~~A: restare sul team attuale, io pago e rifatturo~~ — non risolve l'isolamento risorse
- ~~B: nuovo team (stesso account/login), transfer nativo Vercel~~ — tecnicamente il più economico (30-60 min, zero downtime, dominio non lascia mai il progetto) ma l'utente vuole separazione totale dell'account, non solo del team
- **C SCELTA: account Vercel ex-novo, mail dedicata solo a JC, migrazione cross-account** — l'utente ha esplicitamente accettato il maggior effort e un downtime di 10-15 min, perché:
  1. Vuole delegare la fatturazione al cliente (carta loro) senza mai avere due piani a pagamento sul proprio account personale
  2. Se in futuro cede la proprietà del progetto al cliente, la migrazione è comunque obbligatoria — meglio farla ora a bassa pressione che sotto data-deadline
  3. Resta owner della nuova mail → accesso Vercel garantito in ogni momento, nessuna dipendenza da terzi per interventi urgenti

**Nota sul vincolo MCP:** il connettore Vercel in Claude Desktop tiene una sessione OAuth per volta, non si sdoppia su due account contemporaneamente. Non è un blocco: per task di ispezione dashboard si può sempre usare il browser (Claude in Chrome) con login/logout o profili separati — è quello che si è fatto oggi per leggere l'usage dashboard, dato che il tool MCP Vercel disponibile in questa sessione (connector `1e98ce59-...`) non espone `list_projects`/`list_teams`, solo azioni puntuali (buy_pro, pause/unpause_project, get_web_analytics, ecc.).

## Piano di migrazione concordato (da eseguire nella prossima sessione)

1. **Utente crea nuova casella mail** dedicata (fuori da Claude) — non ancora fatto a fine sessione
2. **Utente apre account Vercel nuovo** con quella mail, resta su Hobby per iniziare
3. **Import progetto**: repo GitHub `psikolele/job-courier` collegato al nuovo account (nuova installazione GitHub App Vercel, o autorizzazione aggiuntiva sullo stesso repo)
4. **Copia env vars** dal progetto attuale (`kraken-solutions/job-courier-webapp`) al nuovo — manuale, nessun transfer automatico cross-account
5. **Deploy di verifica** sul nuovo progetto (URL `.vercel.app` di default) — controllare che build passi, cron `/api/rebuild` (02:00 giornaliero, vedi `vercel.json`) sia configurato, `/api/companies` e `/api/sitemap-jobs.xml` rispondano
6. **Dominio jobcourier.ch**: aggiungere al progetto nuovo **senza toccare ancora DNS** su GoDaddy, verificare che Vercel lo accetti (TXT/CNAME di verifica)
7. **Cutover DNS** su GoDaddy solo a verifica ok — utente ha accettato 10-15 min di downtime accettabile durante propagazione
8. **Tenere il progetto vecchio attivo 24-48h** come rete di sicurezza prima di spegnerlo/rimuoverlo dal team `kraken-solutions`
9. Solo dopo migrazione stabile: valutare upgrade a Pro sul nuovo account (carta cliente) — **prima monitorare 30gg su Hobby** per vedere se il fix CPU di oggi basta da solo

## File toccati oggi

- [webapp/api/sitemap-jobs.xml.js](../webapp/api/sitemap-jobs.xml.js) — commit `06c748a`, pushato su `main` (già in produzione)
- Nessun altro file toccato

## Cose da NON dimenticare nella prossima sessione

- **Controllare se il progetto usa Storage Vercel** (KV/Postgres/Blob) prima di dare per scontato che l'import cross-account sia solo codice+env vars — lo storage NON segue un import GitHub, va ricreato/ripopolato a parte
- **Impostare alert di spesa/uso Vercel** sul nuovo account con la mail dell'utente in copia — è la mancanza che ha reso invisibile lo sforamento del 27/08 fino a sito già giù
- Verificare che tutte le integrazioni esterne (Google Search Console, GA4, AdSense, Arca24 se richiede whitelist IP/referrer) non abbiano hardcoded riferimenti al vecchio `.vercel.app` o project-ID
