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
