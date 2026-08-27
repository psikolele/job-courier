**Stack operativo:** analisi multi-agente (14 agenti, workflow "jc-vercel-cutover-analysis"), rilevamento su Opus 5, piano/rischi/verifica/sintesi su Sonnet 5 — vedi nota metodologica in fondo

undefined

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
