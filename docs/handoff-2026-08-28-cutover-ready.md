# Handoff: cutover jobcourier.ch — ESEGUITO il 29 Agosto 2026

> **✅ D1 FATTO — 29/08/2026, ~09:40 CEST.** `jobcourier.ch` e `www.jobcourier.ch` sono sul progetto
> `jobcourier24-4812/job-courier`. Nessun buco di servizio: il DNS non è stato cambiato (i legacy
> `76.76.21.21` / `cname.vercel-dns.com` restano), è cambiata solo la proprietà dell'hostname lato Vercel.
> Verifiche post-swap tutte verdi — www 200, apex 308→www, HSTS senza `includeSubDomains`, offerta e
> canonical azienda corretti, vetrina 16, Deployment Protection OFF su tutte le rotte controllate.
>
> **Le due incognite del piano, ora risolte:**
> 1. *Vercel riverifica da solo i domini pending?* **No.** I TXT sono rimasti nel DNS propagati senza che
>    succedesse nulla; il trasferimento è partito solo col Refresh esplicito nel pannello del progetto nuovo.
> 2. *Che aspetto ha il passaggio?* Sequenza osservata sul progetto nuovo:
>    `Verification Required` → `No Deployment` (transitorio, non è un guasto) → `DNS Change Recommended`.
>    Quest'ultimo è lo stato **sano**: è la raccomandazione di passare ai nuovi IP, non un errore.
>    Specularmente, il progetto vecchio è passato a `Verification Required`.
>
> ⚠️ **Trappola diagnostica:** il campo `domains[]` dell'API di un progetto elenca le associazioni **anche
> quando non sono più verificate**. Durante questo cutover il progetto vecchio ha continuato a elencare
> entrambi i domini per tutto il tempo, mentre la sua UI diceva già `Verification Required`. Non usarlo per
> stabilire chi serve il traffico — usare la UI, o gli stati dei due progetti a confronto.
>
> I TXT `_vercel` sono stati lasciati nel DNS di proposito: costano nulla e tolgono un passaggio se
> servisse rifare una verifica.

---

## (storico) Handoff: cutover pronto all'esecuzione (28 Agosto 2026)

**Perché questo file esiste:** la sessione che ha preparato tutto era diventata pesante (dump JSON ripetuti, un incidente di test che ha mandato mail/Telegram reali, troubleshooting non correlato). Per eseguire lo swap del dominio — l'unica parte irreversibile — meglio partire puliti. Questo file è autosufficiente: non serve rileggere la sessione precedente né tutto `docs/analisi-cutover-2026-08-27.md` per agire, solo per il dettaglio dei rischi scartati/confermati.

**Documento di riferimento completo:** [docs/analisi-cutover-2026-08-27.md](analisi-cutover-2026-08-27.md) — piano originale + tutte le correzioni del 28/08 in coda. Questo handoff ne è il riassunto operativo.

---

## Stato: tutto pronto tranne due cose

**Fatto e verificato dal vivo il 28/08:**
- Fase A (pre-hardening codice): A1-A3 fatti, commit `7762f98`. A4 facoltativo, non fatto.
- Gate C2, C3, C4, C5, C6: tutti verdi (dettaglio sotto).
- C7: **Ramo A confermato** — `jobcourier.ch` e `www.jobcourier.ch` aggiunti al progetto nuovo mentre erano ancora sul vecchio, stato `Verification Required`. Nessuno spostamento di traffico: verificato subito dopo, produzione invariata.
- B1 (Pro vs Hobby): **deciso**, vedi sotto.
- Guardiano di monitoraggio: attivo, tre rami (vedi sezione dedicata).

**Manca, in ordine:**
1. **C1** — forzare una build pulita sul progetto nuovo via `VERCEL_DEPLOY_HOOK_URL`, cercare `[SNAPSHOT-REJECTED]`/`[SNAPSHOT-EXPIRED]` nei log. Mai eseguito (il valore dell'hook è un segreto, va lanciato dal pannello o chiesto all'utente).
2. **I due TXT non sono ancora su GoDaddy** — deliberatamente. Vedi perché sotto: **la verifica del TXT è il cutover stesso**, non una preparazione.

---

## ⚠️ Il punto più importante: la verifica del TXT = D1

Dalla documentazione Vercel (`POST /v9/domains/{domain}/claim`), testuale:

> *"If the TXT record is verified, the domain ownership will be transferred to the caller's team, even if the domain is currently owned by another user or team."*

**Mettere il TXT e completarne la verifica trasferisce il dominio.** Non è reversibile con un semplice "aspetta e vedi" — è il passo D1 del piano. Il pulsante "Refresh" nel pannello del progetto nuovo, una volta che il TXT è propagato, esegue lo swap.

**Ignoto e non verificabile in anticipo:** non è documentato se Vercel riverifichi da solo i domini in `Verification Required`, o solo su richiesta esplicita. Se lo facesse in autonomo, il solo inserimento del TXT — senza toccare nulla nel pannello — basterebbe a far partire il trasferimento. Non scoprirlo sul dominio del cliente: **non inserire i TXT finché non si è pronti a eseguire lo swap nella stessa finestra**, con entrambe le dashboard aperte e sotto osservazione.

---

## I due record TXT (pronti, da inserire solo al momento del cutover)

| Tipo | Nome | Valore |
|---|---|---|
| TXT | `_vercel` | `vc-domain-verify=jobcourier.ch,88801d0f6b5471f33e19` |
| TXT | `_vercel` | `vc-domain-verify=www.jobcourier.ch,c98794f5e66500b61c7b` |

Stesso nome, valori diversi — sono due record distinti, non uno che sostituisce l'altro. Su GoDaddy (`jobcourier.ch`, DNS management).

**Non toccare** i record che Vercel propone in alternativa (`A @ 216.198.79.1`, `CNAME www 45ffe703adc5a495.vercel-dns-017.com.`) — sono per l'espansione del range IP di Vercel, i legacy `76.76.21.21` e `cname.vercel-dns.com` restano validi e sono quelli su cui gira oggi il sito. Cambiarli è il cutover, non la preparazione.

> **Post-cutover (29/08): l'avviso `DNS Change Recommended` resta e va lasciato stare.** È *recommended*,
> non *required*: Vercel scrive esplicitamente che i legacy continuano a funzionare, e non ha annunciato
> una dismissione. Il beneficio è suo (espansione del range IP), non nostro — stesso edge, stesse
> prestazioni. Cambiarli sposterebbe il percorso reale del traffico, con propagazione e TTL di mezzo,
> mentre il cutover del 29/08 il DNS non l'ha toccato affatto ed è per questo che non ha avuto buchi.
> Da rifare solo se Vercel annuncia la dismissione dei legacy o se emergono problemi di performance
> attribuibili all'edge, e in quel caso come operazione a sé — con il vantaggio che lì il rollback è
> banale: si rimettono i record di prima.

**Dopo l'inserimento, aspettare almeno 10 minuti** prima di chiedere la verifica: `_vercel.jobcourier.ch` risultava NXDOMAIN il 28/08, e la zona ha cache negativa da 600s. Chiedere subito fallisce e basta, non è un guasto.

---

## Runbook del giorno del cutover

**Prima di iniziare — C1:**
```
Forzare deploy hook del progetto nuovo (pannello Vercel o valore VERCEL_DEPLOY_HOOK_URL)
Controllare i log: nessun [SNAPSHOT-REJECTED] / [SNAPSHOT-EXPIRED]
```
**C1 eseguito il 29/08** (redeploy pulito del progetto nuovo, `3aJM6LiZQ`, Ready in 1m 4s). Esito: entrambi i token compaiono, **e vanno bene** — i log del deploy notturno di produzione sullo stesso commit mostrano gli stessi contatori identici, quindi non è una regressione del progetto nuovo. `[SNAPSHOT-REJECTED]` con `pagesFailed: 0` è il falso positivo descritto sopra.

Da rilanciare l'hook solo se compare qualcosa di **diverso** da questi due token, o se `pagesFailed` è alto.

**D1 — lo swap:**
1. Inserire i due TXT su GoDaddy (tabella sopra).
2. Aspettare 10+ minuti.
3. Nel pannello del progetto nuovo (`jobcourier24-4812/job-courier` → Domains), premere Refresh sui due domini finché passano a verificati.
4. Questo È il trasferimento — a questo punto il dominio è sul progetto nuovo.

**Subito dopo — verifica 60-120 secondi:**
```bash
curl -sI https://www.jobcourier.ch/                          # atteso: 200, Server: Vercel
curl -sI https://jobcourier.ch/                               # atteso: 308, Location: https://www.jobcourier.ch/
curl -s https://www.jobcourier.ch/offerta/6744089 | grep -o '<title>[^<]*'
curl -s https://www.jobcourier.ch/azienda/adecco | grep -o 'canonical" href="[^"]*"'
curl -sI https://www.jobcourier.ch/ | grep -i strict-transport   # atteso: max-age=63072000 SENZA includeSubDomains/preload — se compare, correggere subito (vedi nota HSTS sotto)
curl -s https://www.jobcourier.ch/aziende-che-assumono | grep -oE '/azienda/[a-z0-9-]*' | sort -u | wc -l   # atteso: ~16 (vedi nota sotto)
```
Verificare anche Deployment Protection ancora OFF su `/`, `/api/companies?withJobs=1`, `/offerta/:id`, `/azienda/:slug` — nessun 302 verso `sso-api`.

**Nota sul numero di aziende in vetrina (corretta 29/08):** il valore atteso qui era 33, misurato quando la sonda `has_jobs` era rotta e marcava "che assume" l'intero roster. Il 29/08 la sonda è stata portata sulla forma di URL corretta: il numero sano è ora **una frazione del roster** — 16 su 34 alla misura del 29/08, con 0 unknown. Il segnale di guasto non è più un numero preciso ma una relazione: **se le aziende in vetrina sono tante quante il roster (34), la sonda è di nuovo rotta.** Dettaglio in `00_Wiki/job-courier/arca24-company-index.md`, regola 3.

`[SNAPSHOT-REJECTED]` continuerà a comparire a ogni build: dal 29/08 è un falso positivo atteso, non un guasto da inseguire durante il cutover — stessa pagina wiki.

**Nota sul redirect apex→www:** aggiungendo i due domini insieme, Vercel ha già creato da solo il 308 apex→www sul progetto nuovo (visto nel pannello il 28/08). Non dovrebbe servire ricrearlo — ma va **riverificato con il curl sopra**, non dato per scontato.

**Nota HSTS:** l'header non è in `vercel.json` (lo applica la piattaforma), e la forma severa `includeSubDomains; preload` è legata solo agli alias `.vercel.app`. Un dominio custom dovrebbe prendere la versione nuda da solo. Se invece compare `includeSubDomains` dopo lo swap, va corretto subito: forzerebbe HTTPS su `jobroom.` e `crm.` (host Arca24) — verificato che oggi reggono HTTPS valido, ma `preload` è una porta a senso unico da evitare comunque.

**Se qualcosa non torna — rollback (secondi/minuti, preferito):**
Riassegnare `jobcourier.ch` e `www.jobcourier.ch` al progetto vecchio (`kraken-solutions/job-courier-webapp`). Ripetere lo stesso set di curl con le aspettative del vecchio progetto — verificare, non assumere che redirect/HSTS lì siano rimasti intatti.

**Rollback nucleare (solo se Vercel→Vercel non è disponibile):** DNS su GoDaddy verso Hostpoint (`217.26.61.124`), 10-20 min per TTL. Hostpoint verificato vivo su HTTPS il 28/08 (`200`, `Server: Apache`, al primo tentativo).

---

## Dopo il cutover (T+1h — T+48h)

1. **Smoke test allargato:** home, `/offerte`, `/faq`, un redirect `/de/:path*`, uno `/fr/:path*`, un redirect IT (es. `/prezzi`), `/sitemap.xml`, `/api/sitemap-jobs.xml`, `/robots.txt`, `/ads.txt`. Tenere Observability del progetto nuovo aperta 15-30 min — atteso: prima chiamata a `/api/companies?withJobs=1` ~28s a freddo, non è un guasto.
2. **Rimuovere `CRON_SECRET`/`VERCEL_DEPLOY_HOOK_URL` dalle env del progetto vecchio** — blocca il cron notturno e il doppio scraping Arca24, senza toccare il repo o cancellare il progetto.
3. **Congelare push non necessari su `main` per 24-48h**: finché entrambi i progetti restano agganciati allo stesso repo, ogni push fa 2 build = 2 scan Arca24 completi.
4. **Esportare/screenshottare Observability del progetto vecchio** (CPU per rotta, 7-30gg) prima che diventi irrecuperabile.
5. Solo dopo 2-4 settimane di stabilità confermata: scollegare la Git integration del vecchio, tenerlo dormiente prima di un'eventuale eliminazione.

---

## B1 — decisione presa il 28/08, da eseguire dopo il cutover

**Restare su Hobby**, non attivare Pro preventivamente. Trigger d'azione: **60% della quota** Fluid Active CPU (non 85%) — al ritmo proiettato (~11 CPU-ore/mese contro 4h di quota) dà ~4 giorni di margine fino al 100%, contro ~1,5 giorni con l'85%.

**Carta di pagamento sull'account `jobcourier24-4812`: da aggiungere DOPO il cutover** — scelta esplicita dell'utente, non ancora fatta al 28/08. Finché manca, l'upgrade a Pro al momento del trigger richiede sia l'inserimento carta sia l'eventuale allineamento con Gabriele su chi paga: tempo che si sottrae al margine dei 4 giorni.

**Il 60% va letto a mano**, nessuna API pubblica espone il consumo Vercel (confermato anche via MCP `web_fetch_vercel_url`, fallisce sulla pagina Usage). Pannello: `vercel.com/jobcourier24-4812/~/usage`, sezione Fluid Active CPU. Baseline pre-cutover (28/08): 1m14s/4h — quasi zero perché il dominio non era ancora lì; la curva vera parte solo da D1.

**Promemoria automatico già attivo** (vedi sotto, terzo ramo del guardiano n8n) ogni 2 giorni su mail+Telegram — ricorda di controllare, non legge il dato.

**Routine cloud programmata:** `trig_01LySkcuzmdaGNWQmwhAk4Dz` (https://claude.ai/code/routines/trig_01LySkcuzmdaGNWQmwhAk4Dz), esecuzione unica il **3 settembre 2026, 07:07 UTC**. Campiona gli header cache dei due endpoint pubblici e legge lo storico esecuzioni/deployment via MCP n8n+Vercel — non legge la % CPU (nessuna API), ricorda di controllarla a mano.

---

## Guardiano n8n — attivo, tre rami

Workflow `g15tqVsAWtcOc48z` (https://emanueleserra.app.n8n.cloud/workflow/g15tqVsAWtcOc48z), progetto personale n8n.

| Ramo | Frequenza | Cosa controlla |
|---|---|---|
| Disponibilità | ogni 30 min | `/api/companies`, `/api/jobs` rispondono 200 e sopra soglia (15/15) |
| Identità azienda | 1×/giorno, rotazione | `/api/company-detail` risponde con l'azienda corretta, non un'altra (nato dal guasto Rapelli del 28/08) |
| Promemoria CPU | ogni 2 giorni | nudge fisso mail+Telegram per controllare a mano la quota — non legge il dato |

Due canali paralleli (mail `serra.emanuele09@gmail.com` + Telegram bot dedicato `@JCour_Alert_Bot`), ciascuno `onError: continueRegularOutput` — uno rotto non zittisce l'altro. Tutti e tre i rami collaudati con invio reale il 28/08.

**Attenzione se lo si modifica:** il tool `test_workflow` del connettore n8n non pinna sempre in automatico i nodi con credenziali come dichiarato — passare sempre `pinData` esplicito su mail/Telegram, altrimenti parte un invio vero (successo il 28/08, corretto rapidamente ma da evitare).

---

## Cose note ma non ancora fatte (fuori dallo scope stretto del cutover)

- **Rotazione dei 4 Personal Access Token GitHub** nel remote del worktree — canale ora chiuso passando a SSH, ma i PAT non sono stati revocati. Da fare prima di collegare il repo a un secondo account Vercel, se non già fatto.
- **GitHub App Vercel condivisa** tra i due team (`kraken-solutions` e `jobcourier24-4812`) — un'unica installazione scope "All repositories" sull'account GitHub personale, perché il repo vive lì. Accettato come rischio noto il 28/08, non risolvere restringendo lo scope (romperebbe i deploy del team vecchio). Non approvare richieste di membership automatiche che Vercel genera tra i due team.

## Cosa resta ignoto — da verificare sul momento, mai assunto

- Se `maxDuration: 120` di `/api/companies` sia onorato su Hobby o clampato.
- Il tetto reale di funzioni per deployment su Hobby (12 misurate, limite di piattaforma non documentato).
- Se `regions: ['fra1']` sia selezionabile su Hobby (ridurrebbe CPU avvicinando le lambda ad Arca24, oggi in `iad1`).
- Se Vercel riverifica da solo i domini pending (vedi sopra) — la ragione per cui i TXT restano fuori finché non si è pronti.
- Whitelist IP/Referer di Arca24 legate al progetto vecchio — nessuna evidenza nel codice, verifica passa solo da Laura/Gabriele.

---

## Riferimenti rapidi

- Progetto vecchio: `kraken-solutions/job-courier-webapp` — team `team_ZTpMoGta7Rtoy6qaALRqZAIs`, progetto `prj_4w6RBUceYNrkjS3Q4bhkQvj5rdEV`
- Progetto nuovo: `jobcourier24-4812/job-courier`
- Analisi completa: [docs/analisi-cutover-2026-08-27.md](analisi-cutover-2026-08-27.md)
- Handoff precedenti: [docs/handoff-2026-08-27-vercel-migration.md](handoff-2026-08-27-vercel-migration.md), [docs/handoff-2026-08-28-vercel-migration-part2.md](handoff-2026-08-28-vercel-migration-part2.md)
- Guardiano n8n: https://emanueleserra.app.n8n.cloud/workflow/g15tqVsAWtcOc48z
- Routine verifica CPU (3 settembre): https://claude.ai/code/routines/trig_01LySkcuzmdaGNWQmwhAk4Dz
