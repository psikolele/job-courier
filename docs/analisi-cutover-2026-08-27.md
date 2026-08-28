**Stack operativo:** analisi multi-agente (14 agenti, workflow "jc-vercel-cutover-analysis"), rilevamento su Opus 5, piano/rischi/verifica/sintesi su Sonnet 5 — vedi nota metodologica in fondo

> ## ⚠️ Nota di recupero (28/08/2026)
>
> Il corpo di questo documento era andato **perso**: il file conteneva la stringa letterale `undefined`
> al posto dell'intera sintesi, quindi i riferimenti a "§3" e ai "gate C1-C7" puntavano al nulla.
> Recuperato dal journal del workflow
> (`…/subagents/workflows/wf_80cc9070-8c6/journal.jsonl`, evento `result` dell'agente di sintesi)
> e reinserito **verbatim**, senza riscritture.
>
> **Regola che ne esce:** l'output di un workflow non e' salvato finche' non lo si rilegge dal file
> scritto. Dopo aver scritto un documento che nasce da `Workflow`, controllare che il corpo ci sia
> davvero — un `undefined` non fa fallire niente e passa la review.
>
> ### Stato di esecuzione al 28/08/2026 — cosa e' gia' fatto
>
> | Passo | Stato |
> |---|---|
> | **A1** rename dei 3 `.test.js` in `_*.test.js` | ✅ fatto, commit `7762f98` |
> | **A2** `maxDuration` esplicito su `job-detail` e `sitemap-jobs.xml` | ✅ fatto, commit `7762f98` |
> | **A3** `s-maxage` di `/api/companies` 300s → 1800s | ✅ fatto, commit `7762f98` |
> | **A4** dedup doppia chiamata `/api/jobs` in `Offerte.jsx` | ❌ non fatto (era facoltativo) |
> | **B1** decisione Pro vs Hobby | ❌ **APERTA — gate bloccante, non superare senza risposta** |
> | **B2** alert di uso/spesa | ⚠️ parziale: non esiste un alert di *spesa* (nessuna API pubblica per i consumi, Alerts nativi solo su Pro). Al suo posto gira un guardiano n8n che controlla il **sito servito** ogni 30 min e avvisa su mail + Telegram |
> | **C1-C7** pre-flight | ❌ non iniziati |
> | **D** cutover | ❌ non iniziato — `jobcourier.ch` ancora sul progetto vecchio |
> | §6 correzione `GOLIVE-PLAN.md` + nota in `CLAUDE.md` | ✅ fatto 28/08 |
> | §6 rotazione PAT GitHub nel remote | ⚠️ canale chiuso passando a SSH, i 4 PAT esistenti **non** sono stati revocati |
>
> Verificato dal vivo il 28/08: entrambi i progetti sono sul commit `bf1117b` e Ready; il progetto nuovo
> ha solo `job-courier.vercel.app` in Domains (C7/D mai iniziati) e le due sole env `CRON_SECRET` +
> `VERCEL_DEPLOY_HOOK_URL`. Confermato inoltre il rischio n°1 della lista non verificata: in
> `vercel.json` **non c'e' nessuna regola apex→www** tra i 122 redirect — e' configurazione di progetto,
> non segue il repo, e va ricreata a mano al passo D2.

# Analisi architetturale — cutover jobcourier.ch verso il progetto Vercel nuovo

## 1. Raccomandazione

Eseguire un **cutover a swap singolo e atomico** (rimuovi da `kraken-solutions/job-courier-webapp`, aggiungi a `jobcourier24-4812/job-courier`, in sequenza immediata — meccanica del Piano 1/Piano 3), **non** lo split www/apex in due fasi del Piano 2. Prima dello swap, eseguire l'intero pre-hardening del Piano 3 (rename dei 3 file `.test.js`, `maxDuration` esplicito, alzare `s-maxage` su `/api/companies`) e soprattutto **decidere esplicitamente Pro vs Hobby sul progetto nuovo**: il rischio confermato con verifica avversariale (CPU ~11-12,5h/mese contro 4h incluse Hobby, quota esaurita in 10-12 giorni) è l'unico che determina se il dominio del cliente sopravvive al primo weekend, e nessuno dei tre piani lo risolve col solo cutover — solo il Piano 3 lo mette come gate bloccante prima di muovere il dominio. Il Piano 2 va scartato: si fonda su un meccanismo mai verificato (Domains come risorse indipendenti spostabili in tempi diversi tra due account), produce più downtime cumulativo (2 swap invece di 1) per un beneficio SEO reale prossimo a zero (l'apex è solo un redirect 308 verso www, valore di indicizzazione trascurabile), e allunga la finestra di doppio build/doppio scraping Arca24 proprio nei giorni in cui va ridotta.

## 2. I fatti che decidono

- **Zero modifiche DNS necessarie.** A `@` → `76.76.21.21`, CNAME `www` → `cname.vercel-dns.com` sono target Vercel generici, identici e già funzionanti per entrambi i progetti (verificato con `--resolve`). Il cutover è interamente control-plane Vercel (remove/add dominio), non un'operazione DNS. GoDaddy non va toccato.
- **CPU quota Hobby: rischio CONFERMATO con verifica avversariale.** Baseline misurata 172 min CPU/7gg = 12,45 CPU-ore/mese; la mitigazione già shippata (`06c748a`, `webapp/api/sitemap-jobs.xml.js`) copre solo la fetta sitemap (~20% del totale) e porta il pavimento a ~11 CPU-ore/mese — ancora 2,8x la quota Hobby (4h/mese dichiarata). Le altre tre route pesanti (companies, jobs, job-detail = 80% del costo) hanno già caching CDN (`companies.js:141`, `jobs.js:518`, `job-detail.js:15`): non c'è un fix a costo zero non ancora applicato che spieghi via il numero.
- **Il progetto nuovo non ha una via d'uscita rapida in caso di sforamento**: solo `CRON_SECRET` e `VERCEL_DEPLOY_HOOK_URL` come env, nessun piano Pro già attivo su quell'account (a differenza del 27/08, dove l'upgrade era disponibile sullo stesso account).
- **Due impostazioni per-dominio non seguono il repo**: redirect apex→www (308, nessuna regola `has`/host-based nei 122 redirect di `vercel.json`) e HSTS (`max-age=63072000` **senza** `includeSubDomains`/`preload` in produzione, mentre l'alias `.vercel.app` del progetto nuovo applica il default con `includeSubDomains; preload` — da NON ereditare, romperebbe `jobroom.`/`crm.` che sono host Arca24).
- **Vetrina 33 vs 24 aziende: rischio CONFUTATO come "difetto di build".** Il generatore snapshot fa una lettura live indipendente con floor di salute (`generate-companies-snapshot.mjs:52-56`) che scarta run degradate senza mai sovrascrivere lo snapshot buono; verificato oggi: 33/33 su entrambi i progetti, sia via API sia via pagina statica. Resta un piccolo rischio runtime separato (il ramo "roster pieno" di `/api/companies` senza `withJobs=1` non ha lo stesso floor — solo `roster.length===0`), ma non è un rischio di migrazione.
- **Scadenza snapshot 7gg: rischio CONFUTATO.** Ogni build (anche il cron notturno) rigenera lo snapshot dentro il proprio sandbox con `generatedAt` fresco; verificato nei build log reali (deploy notturno e deploy manuale odierno, entrambi con 33 aziende / 4-5 orfani, nessun `[SNAPSHOT-REJECTED]`). La data nel file committato in git è irrilevante a runtime.
- **Deployment Protection riattivata dall'aggiunta del dominio: rischio CONFUTATO.** `ssoProtection` è un campo di progetto indipendente dall'endpoint domini nell'API Vercel; nessun legame documentato. Verificare comunque dal vivo subito dopo l'add (costo zero).
- **Asset hash identici oggi** tra i due progetti (stesso repo/branch, stesso commit in produzione) — il footgun `max-age=31536000, immutable` su `/assets/*` non morde finché resta così.
- **Rollback preferito: Vercel→Vercel** (riassegnare i domini al progetto vecchio, secondi/minuti, zero DNS), non il rollback DNS verso Hostpoint (piano C, 10-20 min per TTL 600s, e dipende da Hostpoint che risponde su HTTPS — oggi verificato ma con un primo tentativo andato in timeout 20s per server freddo, e con HSTS a 2 anni un Hostpoint muto su 443 produce un errore di connessione, non il vecchio sito).

## 3. Piano passo-passo

### Fase A — Pre-hardening di codice (T-2/3 giorni, tocca entrambi i progetti perché stesso repo)

**A1.** Rinominare `webapp/api/companies.test.js`, `jobs.test.js`, `shell-ssr.test.js` in `_*.test.js` (o spostarli fuori da `api/`). Commit + push su main.
- GATE: `curl -s -o /dev/null -w '%{http_code}' https://job-courier.vercel.app/api/companies.test` → `404` non `500`; build log mostra 9 funzioni deployate, non 12.
- ROLLBACK: `git revert` del commit, push — zero impatto dominio live.

**A2.** Stesso commit o successivo: `maxDuration` esplicito per `api/job-detail.js` e `api/sitemap-jobs.xml.js` nel blocco `functions` di `webapp/vercel.json` (uniche due route pesanti oggi senza tetto dichiarato, P75 14s misurato sulla seconda).
- GATE: deploy verde, `vercel.json` valida.
- ROLLBACK: `git revert`.

**A3.** Alzare `s-maxage` di `/api/companies` (`companies.js:141`) da 300s a 900-1800s (lo `swr=86400` già copre la latenza percepita).
- GATE: `curl -sI https://job-courier.vercel.app/api/companies | grep -i cache-control` mostra il nuovo valore lato edge (verificabile solo indirettamente, Vercel riscrive `Cache-Control` al client — controllare `X-Vercel-Cache`/`Age` su richieste ripetute).
- ROLLBACK: `git revert`.

**A4 (facoltativo, stesso sforzo).** Deduplicare la doppia chiamata `/api/jobs` in `Offerte.jsx:168` e `:184`.
- ROLLBACK: `git revert`.

### Fase B — Decisione di capacità (T-2 giorni, BLOCCANTE)

**B1.** Con i fix A1-A3 applicati, ricalcolare la proiezione CPU (pavimento atteso ~10-11h/mese, ancora >2x quota Hobby dichiarata 4h/mese). Decisione esplicita e scritta: upgrade a Pro sul team `jobcourier24-4812` **prima** del cutover, oppure accettare il rischio con alert attivi e piano di rollback pronto.
- GATE: decisione documentata (Pro attivato, o rischio accettato per iscritto con soglia di intervento).
- Questa è una **decisione che spetta all'umano** (vedi §6) — non procedere alla Fase C senza risposta.

**B2.** Impostare alert di uso/spesa (Fluid Active CPU) sul team nuovo, qualunque sia l'esito di B1.
- GATE: alert configurato e verificabile nel pannello team.

### Fase C — Pre-flight immediatamente prima del cutover (T-2h/T-30min)

**C1.** Forzare una build pulita sul progetto nuovo via il suo `VERCEL_DEPLOY_HOOK_URL` (non un push su main, per non raddoppiare lo scrape su entrambi i progetti). Cercare nei log `[SNAPSHOT-REJECTED]` / `[SNAPSHOT-EXPIRED]`.
- GATE: nessuna delle due stringhe, oppure rigenerazione riuscita con `generatedAt` odierno.
- ROLLBACK: nessuno — se rifiutato, rilanciare il deploy hook, non muovere il dominio.

**C2.** Contare i link azienda: `curl -s https://job-courier.vercel.app/aziende-che-assumono | grep -oE '/azienda/[a-z0-9-]*' | sort -u | wc -l` deve dare 33 (confrontare con lo stesso comando su `www.jobcourier.ch`).
- GATE: numeri uguali. Se inferiore, NON procedere — rilanciare il deploy hook (episodio noto di scrape transitorio, non deterministico).

**C3.** Confermare stesso commit in produzione su entrambi: `curl -s https://www.jobcourier.ch/ | grep -oE '/assets/index-[A-Za-z0-9]+\.(js|css)'` confrontato con lo stesso su `job-courier.vercel.app`.
- GATE: hash identici. Se divergono: promuovere manualmente il deployment giusto sul progetto indietro PRIMA di continuare (altrimenti rischio 404 cachato un anno su `/assets/*`).

**C4.** Documentare per iscritto (non a memoria) le due impostazioni Domains del progetto vecchio che non seguono il repo:
- `curl -I https://jobcourier.ch/` → atteso `308`, `Location: https://www.jobcourier.ch/`, nessun `X-Vercel-Cache`.
- `curl -sI https://www.jobcourier.ch/ | grep -i strict-transport` → atteso `max-age=63072000` **senza** `includeSubDomains` **senza** `preload`.
- GATE: entrambi i valori scritti in un file PRIMA di toccare la tab Domains del vecchio (dopo la rimozione, non sono più leggibili da nessuna dashboard).

**C5.** Riverificare Hostpoint vivo su HTTPS: `curl -sS -o /dev/null -D - -m 60 --resolve www.jobcourier.ch:443:217.26.61.124 https://www.jobcourier.ch/`.
- GATE: `200`, nessun errore TLS senza `-k`. (Atteso: primo tentativo può andare in timeout ~20s per server freddo, riprovare.)

**C6.** Riverificare Deployment Protection OFF su tutte le rotte chiave del progetto nuovo: `/`, `/api/companies?withJobs=1`, `/offerta/<id>`, `/azienda/<slug>` → tutte `200`, zero `302` verso `vercel.com/sso-api`.
- GATE: nessun 302 su nessuna delle 4 rotte.

**C7 (opzionale — solo se si vuole ridurre la finestra di swap, non testato da qui).** Provare ad aggiungere `jobcourier.ch` sul progetto nuovo mentre è ancora sul vecchio. Se Vercel propone un TXT `_vercel.jobcourier.ch` da verificare (ramo A), crearlo su GoDaddy e **attendere almeno 10 minuti** prima di richiedere la verifica (negative-cache TTL della zona = 600s). Se Vercel rifiuta l'aggiunta finché il dominio è altrove (ramo B), procedere direttamente alla Fase D con lo swap remove-poi-add.
- GATE: ramo (A o B) annotato prima di fissare l'orario esatto del cutover — i due rami hanno finestre di rischio diverse.

### Fase D — Cutover (finestra critica, minuti)

**D1.** Rimuovere `jobcourier.ch` e `www.jobcourier.ch` dal progetto vecchio; aggiungerli immediatamente al progetto nuovo (ramo A: già verificati, attivazione quasi istantanea; ramo B: le due azioni in sequenza immediata, tab già aperte).

**D2.** Subito dopo, ricreare sul progetto nuovo il redirect apex→www e allineare l'HSTS ai valori annotati al passo C4.

**D3 — verifica nei primi 60-120 secondi:**
```
curl -sI https://www.jobcourier.ch/                         → 200, Server: Vercel
curl -sI https://jobcourier.ch/                              → 308, Location: https://www.jobcourier.ch/
curl -s https://www.jobcourier.ch/offerta/6744089 | grep -o '<title>[^<]*'
curl -s https://www.jobcourier.ch/azienda/adecco | grep -o 'canonical" href="[^"]*"'
curl -sI https://www.jobcourier.ch/ | grep -i strict-transport
curl -s https://www.jobcourier.ch/aziende-che-assumono | grep -oE '/azienda/[a-z0-9-]*' | sort -u | wc -l   → 33
```
Verificare anche che Deployment Protection sia ancora OFF (l'add-domain non è testato per questo, verifica reattiva obbligatoria).
- ROLLBACK (il più importante): riassegnare `jobcourier.ch` e `www.jobcourier.ch` al progetto vecchio. Secondi/minuti, zero DNS. Ripetere lo stesso set di curl con le aspettative del vecchio progetto (redirect/HSTS lì presumibilmente intatti — verificare, non assumere).
- ROLLBACK NUCLEARE (piano C, solo se il rollback Vercel→Vercel non è disponibile): DNS su GoDaddy verso Hostpoint (217.26.61.124), 10-20 min, precondizione = gate C5 verde poco prima.

### Fase E — Stabilizzazione (T+1h — T+48h)

**E1.** Smoke test allargato: home, `/offerte`, `/faq`, un redirect `/de/:path*`, uno `/fr/:path*`, un redirect IT puntuale (es. `/prezzi` → 2 hop → `/soluzioni-e-tariffe`), `/sitemap.xml`, `/api/sitemap-jobs.xml`, `/robots.txt`, `/ads.txt`. Tenere aperta Observability del nuovo per 15-30 min (atteso: prima `/api/companies?withJobs=1` ~28s a freddo, non diagnosticarlo come guasto).

**E2.** Rimuovere `CRON_SECRET`/`VERCEL_DEPLOY_HOOK_URL` dalle env del progetto vecchio (blocca cron notturno e doppio scrape senza toccare il repo) — non cancellare il progetto.

**E3.** Congelare i push non necessari su `main` per 24-48h: finché entrambi i progetti restano agganciati allo stesso repo, ogni push = 2 build = 2 scan Arca24 completi.

**E4.** Esportare/screenshottare Observability del progetto vecchio (CPU per rotta, 7-30gg) come baseline storica prima che diventi irrecuperabile.

**E5 (solo dopo 2-4 settimane di stabilità confermata).** Scollegare Git integration del vecchio; tenerlo dormiente ancora qualche settimana prima di un'eventuale eliminazione.

## 4. Rischi confermati con mitigazione

**Quota Fluid Active CPU Hobby esaurita in ~10-12 giorni (CONFERMATO).**
- Baseline: 172 min CPU/7gg ≈ 12,45 CPU-ore/mese; post-mitigazione `06c748a` ≈ 11 CPU-ore/mese; quota Hobby dichiarata 4h/mese → esaurimento in ~10-11 giorni di traffico reale.
- Il progetto nuovo non ha un piano Pro già attivo come via d'uscita rapida (a differenza del 27/08).
- Mitigazione, in ordine di rapporto risultato/sforzo: (a) decisione Pro-vs-Hobby ESPLICITA prima del cutover (Fase B, bloccante); (b) `maxDuration` esplicito su `job-detail`/`sitemap-jobs.xml` (Fase A2); (c) `s-maxage` più lungo su `/api/companies` (Fase A3); (d) alert di uso al 50%/80% attivati prima di spostare il dominio (Fase B2) — senza alert il primo segnale è il sito offline scoperto dal cliente, come il 27/08.
- Nota: isolare il progetto su un team Hobby dedicato NON risolve nulla — il traffico che esaurisce la quota è di Job Courier stesso, non contaminazione da altri progetti Kraken.

## 5. Cosa resta ignoto — non va indovinato

Da verificare sul momento, mai assunto:
- Se `maxDuration: 120` di `/api/companies` sia onorato su Hobby o clampato (la build accetta il valore, non prova che regga a runtime).
- Il tetto di funzioni per deployment su Hobby (12 misurate oggi, limite di piattaforma non reperibile in doc).
- Se `regions: ['fra1']` sia selezionabile su Hobby (ridurrebbe la CPU spostando le lambda vicino ad Arca24, oggi in `iad1`).
- Cosa risponde `www.jobcourier.ch` esattamente nella finestra di swap (atteso `DEPLOYMENT_NOT_FOUND`, non verificato eseguendolo).
- Se il ramo A (TXT pre-verificabile) o B (aggiunta rifiutata) si applichi — va scoperto con C7, non assunto.
- Se l'HSTS del progetto vecchio verrà riapplicato automaticamente dalla piattaforma sul nuovo, o se serva sempre l'intervento manuale.
- Altre impostazioni Domains del vecchio oltre a redirect/HSTS (altri alias, certificati custom) — leggibili solo dal pannello `kraken-solutions`.
- Firewall/WAF, Attack Challenge Mode, Skew Protection, Image Optimization, Web Analytics attivi a livello progetto sul vecchio — non deducibili dal repo, non replicati da un import GitHub.
- Consumo CPU attuale sul team nuovo e se siano già impostati alert (verificarlo, non presumerlo fatto).
- Whitelist IP/Referer di Arca24 legate al progetto vecchio (nessuna evidenza nel codice, ma la verifica passa solo da Laura/Gabriele — nessun contatto diretto con Arca24).
- Chi ha accesso in scrittura alla zona DNS GoDaddy oggi, e stato contrattuale Hostpoint (per quanto resta pagato/attivo come rete di sicurezza).
- Cosa c'è nelle impostazioni Domains del vecchio oltre a quanto osservato — va annotato PRIMA di rimuovere il dominio (C4), perché dopo non è più leggibile da nessuna dashboard.

## 6. Decisioni che spettano all'umano

- **Pro vs Hobby sul progetto nuovo** — decisione di costo/business, non tecnica; blocca la Fase C se non presa (§3 Fase B).
- **Timing esatto della finestra di cutover** e chi la esegue (uno o due operatori sulle due dashboard).
- **Ramo A vs B** del claim TXT (C7) — dipende dalla risposta di Vercel al momento, non prevedibile da qui.
- **Quando spegnere definitivamente il progetto vecchio** (oltre le 2-4 settimane minime di rete di sicurezza indicate).
- **Se accettare temporaneamente il rischio CPU residuo su Hobby con soli alert**, oppure bloccare il cutover fino a upgrade Pro confermato.
- **Rotazione del Personal Access Token GitHub** in chiaro nel remote del worktree — fuori scope del cutover ma da fare prima di collegare il repo a un secondo account Vercel (segnalare come task separato, non incorporare nel cutover).
- **Correzione di `docs/GOLIVE-PLAN.md` e della nota "GO-LIVE DOMINIO" in `CLAUDE.md`** — entrambi dichiarano ancora produzione su Hostpoint e un cambio DNS non più valido; chi interviene sotto pressione durante un incidente li leggerebbe per primi. Decidere chi e quando li corregge, separatamente da questo cutover.

---

## Nota metodologica

Rilevamento (5 aree: infra, SEO, DNS live, integrazioni, costi) eseguito con Opus 5 in una prima corsa,
interrotta dal limite di sessione prima delle fasi piano/rischi/verifica/sintesi. Quelle fasi sono state
rilanciate — stesso workflow, `resumeFromRunId` — su Sonnet 5 dopo lo switch modello richiesto dall'utente
per scalare l'impegno. Il rilevamento è tornato dalla cache (zero costo aggiuntivo); solo piano/rischi/
verifica/sintesi sono girati live su Sonnet.

**Verifica avversariale parziale per esplicito limite di scala:** 19 rischi individuati dalla fase
avversariale, solo 4 verificati indipendentemente (1 confermato: quota CPU Hobby; 3 confutati: scadenza
snapshot, vetrina 33 vs 24, Deployment Protection riattivata dall'aggiunta dominio). **I restanti 15 rischi
NON sono stati verificati** e vanno trattati come ipotesi da controllare sul campo, non come fatti:

- Redirect apex→www non ricreato sul progetto nuovo
- Deploy hook rimasto puntato al progetto vecchio
- Doppio build sullo stesso repo → doppio scraping Arca24, rischio throttling nella finestra di sicurezza
- `maxDuration:120` di `/api/companies` clampato dal tetto reale del piano Hobby
- Retry Vetrini a 4s/35s amplifica il carico origin proprio quando Arca24 è lento
- Asset con hash diversi tra i due progetti se il cutover avviene su commit divergenti
- Rotte SSR (`/offerta/:id`, `/azienda/:slug`) rispondono 500 se un self-fetch interno viene bloccato
- Funzioni `.test.js` pubbliche saturano il tetto funzioni di Hobby
- HSTS ereditato dal default `.vercel.app` (`includeSubDomains;preload`) sul dominio custom
- Cron del progetto vecchio resta vivo dopo il presunto spegnimento
- Finestra `DEPLOYMENT_NOT_FOUND` durante lo swap del dominio tra account diversi
- Rollback verso Hostpoint fallisce per server freddo o per HSTS
- Verifica TXT `_vercel` bloccata dalla cache negativa DNS (TTL 600s)
- Cache CDN fredda al cutover scambiata per un guasto della migrazione
- Test di consenso/AdSense sull'alias `.vercel.app` durante la finestra di cutover

Il piano in §3 li tratta comunque con gate difensivi (es. C1-C7), ma nessuno di questi 15 ha avuto una
conferma indipendente della sua gravità reale — solo la fase di piano li ha usati come input.

---

## Addendum (28/08): GitHub App condivisa tra i due account Vercel — accettato come rischio noto

Durante la sessione, due mail Vercel (27/08 16:57-17:04) hanno segnalato tentativi di deploy bloccati
cross-account: uno attribuito a `jobcourier24@gmail.com` sul progetto `kraken-solution` (team vecchio),
uno via CLI attribuito a `61227821+psikolele@users.noreply.github.com` sul team `Kraken Solutions`.

**Causa verificata** (non dedotta): `github.com/settings/installations/98684449` mostra **una sola app
"Vercel"**, installata da 8 mesi, scope **"All repositories"** sull'account GitHub personale `psikolele`.
Non esistono due installazioni separate per i due team Vercel — ne condividono una sola, perche' il repo
`job-courier` vive sotto l'account GitHub personale dell'utente, e una GitHub App e' installata per-account,
non per-team-Vercel.

**Implicazione per la migrazione:** l'isolamento ottenuto con l'account Vercel dedicato (`jobcourier24-4812`)
e' reale per CPU/billing/dominio, ma **non per GitHub**. Qualunque evento (push, PR, deploy hook, Action)
su un qualsiasi repo dell'account puo' generare notifiche o tentativi cross-team, perche' entrambi i team
Vercel sono agganciati alla stessa installazione condivisa.

**Decisione presa (28/08):** accettare questo come rischio noto e monitorato, non risolverlo ora.
Restringere lo scope dell'app a "Only select repositories" isolerebbe il nuovo account ma **romperebbe
i deploy del team vecchio** (kraken-solution-site e altri progetti Kraken), perche' lo scope e' condiviso
tra tutti i team collegati, non configurabile per-team. Le uniche vie per un isolamento GitHub completo —
spostare `job-courier` in un account/org GitHub separato, o vivere con il rischio — restano fuori scope
per questa sessione.

**Non approvare** richieste di membership automatiche che Vercel genera tra i due team in seguito a questo
tipo di evento: accettarle fonderebbe l'accesso che la migrazione vuole tenere separato.

**Nota collaterale, non urgente:** durante la verifica e' stata accettata una richiesta di permessi
dell'app Vercel su GitHub (Actions: read, Workflows: read&write) — aggiornamento generico di piattaforma
documentato nel changelog pubblico Vercel, non collegato all'incidente cross-account.

---

## Pre-flight eseguito il 28/08/2026 — gate C2, C3, C4, C5, C6

Eseguiti dal vivo, prima di qualunque modifica ai domini. **C1 non eseguito** (serve il valore di
`VERCEL_DEPLOY_HOOK_URL`, che e' un segreto del progetto). **C7 non eseguito**: la scrittura nel campo
dominio del pannello Vercel e' bloccata dal classificatore del harness — e' un passo da fare a mano.

| Gate | Esito |
|---|---|
| **C2** link azienda nuovo vs prod | ✅ 33 = 33 |
| **C3** hash asset identici | ✅ `index-3Q1DE9NH.js` + `index-DY35QCrf.css` su entrambi |
| **C4** valori Domains del vecchio | ✅ catturati, vedi sotto |
| **C5** Hostpoint vivo su HTTPS | ✅ `200`, `Server: Apache`, **al primo tentativo** (l'analisi avvisava di un possibile timeout a freddo: non si e' verificato) |
| **C6** Deployment Protection OFF | ✅ `/`, `/api/companies?withJobs=1`, `/offerta/:id`, `/azienda/:slug` tutte `200`, zero redirect verso `sso-api` |

### C4 — i due valori da ricreare a mano al passo D2

Da qui in poi questi non sono piu' leggibili da nessuna dashboard una volta rimosso il dominio dal
progetto vecchio. Misurati il 28/08:

```
curl -I https://jobcourier.ch/
  HTTP/1.1 308 Permanent Redirect
  Location: https://www.jobcourier.ch/
  Strict-Transport-Security: max-age=63072000

curl -I https://www.jobcourier.ch/
  HTTP/1.1 200 OK
  Strict-Transport-Security: max-age=63072000
```

**Redirect da ricreare:** apex `jobcourier.ch` → `https://www.jobcourier.ch/`, **308 permanente**.

**Sull'HSTS, correzione all'analisi.** Il rischio "ereditare `includeSubDomains; preload`" e' piu'
piccolo di come era stato scritto. Verificato: l'header **non** e' in `vercel.json` (che definisce solo
X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, CSP-Report-Only e due
Cache-Control) — lo applica la piattaforma, e la versione severa e' legata ai domini `.vercel.app`, che
stanno gia' nella preload list dei browser:

```
job-courier.vercel.app  →  max-age=63072000; includeSubDomains; preload
www.jobcourier.ch       →  max-age=63072000
```

Un dominio custom prende quindi la versione nuda da sola. **Resta da verificare dopo D1, non prima**:
se dopo lo swap comparisse `includeSubDomains`, va corretto subito, perche' forzerebbe HTTPS su
`jobroom.` e `crm.` (host Arca24). Controllati oggi: entrambi servono HTTPS valido, quindi non si
romperebbero all'istante — ma `preload` e' una porta a senso unico e va evitata comunque.

---

## C7 eseguito il 28/08/2026 — **RAMO A**: pre-verifica possibile

Aggiunti `jobcourier.ch` e `www.jobcourier.ch` al progetto nuovo mentre sono **ancora sul progetto
vecchio**. Vercel li accetta e li mette in `Verification Required` — quindi la pre-verifica si puo' fare
in anticipo e il passo D si riduce a uno swap di secondi. Produzione verificata subito dopo l'aggiunta:
`200`, apex→www `308`, 33 aziende, API a `200` in 0,18s. **Nessuno spostamento di traffico.**

Messaggio di Vercel: *"This domain is linked to another Vercel account. To use it with this project,
add a TXT record at `_vercel.jobcourier.ch` to verify ownership. You can remove it after verification
completes."*

### I due record TXT da creare su GoDaddy

Stesso nome, **valori diversi**: sono due record distinti, non uno che sostituisce l'altro.

| Tipo | Nome | Valore |
|---|---|---|
| TXT | `_vercel` | `vc-domain-verify=jobcourier.ch,88801d0f6b5471f33e19` |
| TXT | `_vercel` | `vc-domain-verify=www.jobcourier.ch,c98794f5e66500b61c7b` |

Stato DNS prima dell'inserimento (28/08): `_vercel.jobcourier.ch` → **NXDOMAIN**. E' esattamente la
cache negativa che impone di **attendere almeno 10 minuti** (TTL 600s della zona) prima di premere
Refresh: chiedere la verifica subito fallisce e basta, non e' un guasto.

### Cosa NON toccare

Vercel propone dei record nuovi perche' sta ampliando il suo range IP — **ignorarli adesso**:

```
A     @     216.198.79.1                              ← NON inserire ora
CNAME www   45ffe703adc5a495.vercel-dns-017.com.      ← NON inserire ora
```

La pagina stessa dice che i legacy `cname.vercel-dns.com` e `76.76.21.21` continuano a funzionare, ed
e' su quelli che il dominio gira oggi (verificato: apex `76.76.21.21`, www `cname.vercel-dns.com`).
Cambiarli **e'** il cutover, non la sua preparazione. In questa fase si aggiunge solo il TXT.

### Correzione al piano: D2 e' meno lavoro del previsto

Aggiungendo apex e www insieme, **Vercel ha creato da solo il redirect `308` apex→www** (visibile nella
riga `jobcourier.ch` del pannello nuovo). Il passo D2 diceva di ricrearlo a mano: non serve, ma va
**riverificato dopo lo swap** con `curl -I https://jobcourier.ch/`, non dato per fatto.

### ⚠️ Correzione critica (28/08): la verifica **e'** il cutover, non la sua preparazione

Dalla documentazione Vercel, `POST /v9/domains/{domain}/claim`, testuale:

> *"If the TXT record is verified, the domain ownership will be transferred to the caller's team,
> **even if the domain is currently owned by another user or team**."*

Quindi **mettere il TXT e completare la verifica trasferisce il dominio**, staccandolo dal team vecchio.
Non e' un passo preparatorio reversibile: e' il passo D1. Il "Refresh" nel pannello del progetto nuovo,
con il TXT propagato, esegue il cutover.

**Ignoto e consequenziale:** non risulta dalla documentazione se Vercel riverifichi **da solo in
background** i domini in stato `Verification Required`, o solo su richiesta esplicita. Se lo facesse,
il solo inserimento del TXT basterebbe a far partire il trasferimento, senza che nessuno prema niente.
Non e' stato verificato — e non va scoperto sul dominio di un cliente.

**Conseguenza sulla sequenza.** I due record TXT **non vanno inseriti** finche' non si e' pronti al
cutover vero, cioe' finche' non e' chiuso il gate **B1** (Pro vs Hobby). Aggiungere i domini in stato
`Verification Required` e' invece sicuro e reversibile: non sposta traffico, non tocca il progetto
vecchio (verificato il 28/08: `job-courier-webapp` elenca ancora entrambi i domini e serve la
produzione normalmente), e i domini possono restare in quello stato a tempo indefinito.

Sequenza corretta: **B1 deciso → TXT inseriti → attesa propagazione → verifica = cutover → D2/D3**.
Non l'inverso.
