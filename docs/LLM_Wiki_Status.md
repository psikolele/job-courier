# LLM Wiki: Job Courier Redesign (Aggiornato: 18 Agosto 2026)

## Vetrina aziende crollata a un solo logo + snapshot SEO inguardabile (18 Agosto 2026) — ✅ *COMPLETED, in prod*

**Commit:** `db59459`, `3e39a93` su `main`
**Stack operativo:** Claude Opus 5, effort medio, caveman mode full · tool: Bash/Read/Edit, browser pane (`mcp__Claude_Browser__*`) per la verifica dal vivo, Gmail MCP per la bozza · 45 minuti

* **Sintomo cliente:** la sezione "Aziende e Recruiter che si affidano a Job Courier" mostrava **una sola azienda** (Adecco), con la tile CTA navy stirata su tutta la riga rimasta vuota — e un blocco di testo grezzo visibile un istante prima del caricamento di ogni pagina.
* **Causa 1 — formato link aziende cambiato a monte.** Il portale è passato da `company/profile?uiid=<id>` a `/it/careers/<id>-<slug>/profile`. `parseCompanyRef` conosceva solo i due formati vecchi, quindi l'indice aziende tornava **zero record**; è sopravvissuta la sola Adecco, l'unica ancora linkata alla vecchia maniera dentro `latest_jobs`. Stesso bug faceva leggere come "Azienda Riservata" annunci con azienda pubblica. Fix: il parser legge tutti e tre i formati, e **il selettore CSS vive accanto al parser** (`COMPANY_LINK_SELECTOR`) — il disallineamento fra i due è esattamente ciò che ha svuotato il roster *senza produrre un solo errore*.
* **Causa 2 — la paginazione dell'indice è client-side, e leggevamo un terzo del roster anche prima.** `jobs_by_company` renderizza 15 aziende in `.resultstring` ma ne consegna **32 nel payload JSON della stessa risposta**: i controlli "2" e "3" sono `<button>` senza `href`, spostano solo un hash (`#by-page=2`) e ri-affettano dati già arrivati. `parseCompaniesFromPayload` legge il blob (titoli **doppiamente encodati**: `S &amp;amp; M beauty SA`). Risultato: roster **1 → 32**, aziende che assumono **1 → 12**.
* ⚠️ **Errore di diagnosi da non ripetere.** `?page=2` risponde **410** e da lì avevo concluso che Arca24 avesse rotto la paginazione, arrivando a scrivere la mail di segnalazione a Laura e Gabriele. È l'utente ad avermi fermato ("se clicco sul 2 mi apre la seconda pagina, prova anche tu"). Il 410 è **corretto**: `?page=2` non è una richiesta che un click produce mai. Regola: su questo portale (SPA Vue) il markup renderizzato è un sottoinsieme di quello che arriva — prima di attribuire un guasto a monte, riprodurre l'azione nel browser e leggere il traffico di rete. In memoria come `feedback_verify_upstream_before_blaming`.
* **Snapshot di riserva scaduto lo stesso giorno.** `api/_companies-snapshot.js` è valido 7 giorni (`SNAPSHOT_MAX_AGE_MS`) ed era del 10/08: ha smesso di coprire il buco proprio il 17-18. Rigenerato (12 aziende). **Soglia di salute ora doppia** in `api/companies.js`: `hiring >= 8` **oppure** `roster >= 12`, perché quante aziende assumono è stagionale mentre "l'indice si è letto o no" non lo è — con la sola soglia sugli hiring, un'azienda che chiude l'ultima posizione avrebbe fissato il sito su uno snapshot che continuava a pubblicizzarla.
* **Snapshot SEO dentro `#root` vestito da JobCourier.** `snapshotBody()` in `api/_ssr.js` è ciò che un visitatore vede finché React non monta, ed era un h1 nero maiuscolo sopra un elenco puntato di URL su fondo bianco: leggeva come sito rotto, non come sito che carica. Ora ha barra brand, occhiello "Caricamento", titolo editorial e link impaginati. **Stessi testi, stessi link, stesso ordine** — nulla cambia per un crawler, cambia solo la presentazione. Punto unico: tutte le route SSR (`shell-ssr`, `offerta-ssr`, `azienda-ssr`, prerender) passano da lì.
* **Test:** 230 passano (5 nuovi: formato a path, roster dal payload, roster pieno con pochi hiring servito come `live`).
* **Non fatto di proposito:** nessuna mail al cliente. La bozza preparata conteneva la segnalazione sbagliata ad Arca24 ed è stata scartata su indicazione dell'utente — il fix è invisibile lato cliente e non richiede comunicazione.

---

## Sistema SEO dinamico per il blog + fix Ahrefs (17 Agosto 2026) — ✅ *COMPLETED, deploy manuale in prod*

**Commit:** `e31c851` su `main` (pushato dopo il deploy manuale dell'utente, per allineare il tracciamento)
**Modello:** Claude Sonnet 5, caveman mode full

* **Ahrefs Site Audit MCP: "Insufficient plan".** Il connettore API non copre Site Audit su questo account. Dati presi dalla UI web Ahrefs via browser (login diretto dell'utente, non tramite credenziali gestite da Claude) — crawl del 17/08, health score 80/100, progetto `10208912`.
* **Causa radice del cluster di issue più grosso: blog senza SSR.** 56 URL blog (2 categorie + 12 articoli × 4 lingue) servivano shell vuota pre-JS — solo canonical iniettato, mai title/H1/description/JSON-LD. Stesso pattern già risolto per `/offerta` e `/azienda` (vedi entry Canonical del 10/08 sotto), mai esteso al blog. Causava: `H1 tag missing` (57), `Meta description missing` (54), `X card missing` (54), gran parte di `Orphan page` (72) e `Missing reciprocal hreflang` (52).
* **Sistema costruito (non solo un fix una tantum):** `scripts/generate-blog-snapshot.mjs`, eseguito a ogni `npm run build`, legge `src/data/blog/*` e genera `api/_blog-snapshot.js` con title/H1/testo/JSON-LD/hreflang per ogni pagina. `api/shell-ssr.js` serve quello snapshot sulle rotte blog. **Un nuovo articolo (o traduzione) aggiunto ai dati ottiene SEO completa al prossimo deploy, senza toccare codice** — è la risposta diretta alla richiesta "sito sempre dinamico, serve un sistema che si aggiorni da solo".
* **Bug hreflang reale trovato durante il lavoro:** `/blog/recruiting` è la stessa URL in tutte e 4 le lingue (`categories.js`: stesso segmento). Generator e sitemap dichiaravano comunque 4 hreflang reciproci sulla stessa pagina — esattamente l'issue Ahrefs "referenced for more than one language". Fix: raggruppamento per URL reale, non per lingua.
* **Sitemap: EN/DE/FR del blog non avevano una `<loc>` propria**, esistevano solo come hreflang alternate dentro l'entry IT — non scopribili direttamente. Ora ogni lingua ha la sua entry (60 URL contro 14 prima).
* **Title clamp su `/offerta/:id`**: il titolo annuncio arriva illimitato dal feed (issue Ahrefs "Title too long", 130 URL). Clampato il titolo annuncio, non il suffisso brand.
* **Non toccato:** orphan page residue su `/offerta`/`/azienda` — dipendono dal cron notturno delle 04:00 CEST (`api/rebuild.js`, già esistente) che rigenera gli hub statici; lag fisiologico tra pubblicazione annuncio e rebuild, non un bug. Mojibake UTF-8 nei JSON-LD — verificato non riproducibile (già chiuso il 15/08).
* ⚠️ **Deploy manuale in produzione fatto dall'utente prima del commit** — verificare che sia stato fatto da questo stesso stato del codice (worktree `gradient-border-animation-d37323`, branch `claude/seo-dynamic-pages-system-819dde`) e non da un `vercel --prod` con modifiche diverse in mezzo. Vedi `feedback_git_push_vs_vercel_cli_deploy` in memoria per il motivo per cui questo va sempre controllato.

---


> ⚠️ **Avvertenza sull'attendibilità di questo wiki.** Ri-verificato il 02/08/2026, e la
> verifica precedente era imprecisa: `IMPLEMENTATION_PLAN_2026-06-25.md`,
> `MEETING_SUMMARY_2026-06-25.md` e `GMAIL_DRAFT_GABRIELE.txt` esistono **solo sul disco
> locale e non sono tracciati da git** — quindi non ci sono in un clone del repo né in un
> worktree. `handoff-2026-06-25.md` non esiste affatto. Esistono e sono tracciati:
> `ROLLBACK-LOG.md`, `GOLIVE-PLAN.md`, `old-urls-snapshot.txt`, tutti gli `handoff-*.md`
> dal 06-01 in poi.
>
> Prima di citare un file da qui, controllare che ci sia davvero **e che sia committato**:
> `git ls-files --error-unmatch <path>`. Il wiki non è fonte di verità, e nemmeno il
> filesystem locale — lo è il repo.

## Annunci esclusi da home page + tile "vedi tutte le aziende" (9-11 Agosto 2026) — ✅ *COMPLETED*

**Commit:** `02f85e1`, `f268aec`, `13b7ce2` su `main`
**Modello:** Claude Sonnet 5, caveman mode full · 60 minuti (insieme alle due sessioni sotto)

* **AdSense Auto ads escluso dalla home.** I banner house rimossi da `Home.jsx` non erano la causa del banner ancora visibile in home dopo il deploy: era Auto ads di Google (account senza slot manuali, vedi `docs/handoff-adsense-2026-08-07.md`), impostazione lato dashboard, non nel repo. Fix: AdSense → Annunci → Pagine escluse → `jobcourier.ch` ("Solo questa pagina", match automatico con/senza `www`). Applicato dal vivo con la sessione Google già autenticata dell'utente — non tramite codice o CLI.
* **Tile "Vedi tutte le aziende" chiude la griglia loghi.** `Vetrini.jsx` mostra il roster live di aziende che assumono (conteggio cambia ogni giorno) in una griglia 2/3/4/5 colonne responsive: un resto non multiplo delle colonne lasciava un logo solo, isolato, nell'ultima riga (screenshot cliente). Aggiunta una tile CTA finale verso `/aziende-che-assumono` che riempie esattamente le colonne rimaste (o l'intera riga se il conteggio è multiplo esatto) — span calcolato in JS dal conteggio colonne live via `matchMedia`-style breakpoint tracking, non un valore CSS fisso.
* **Altezza tile: niente aspect-ratio a occhio.** I box quadrati risultano ~256px anziché 233px teorici (il contenuto logo+etichetta eccede l'`aspect-square`). Condividere la stessa riga grid dà l'altezza esatta gratis via `align-items: stretch`; per il caso raro senza vicino (conteggio esatto multiplo delle colonne) misurata via `ResizeObserver` su un tile reale e applicata come fallback esplicito.
* Verificato dal vivo su produzione l'11/08: 11 tile totali, riga propria a larghezza piena, 256px = 256px, bordo destro allineato al grid.

---

## Sezione aziende partner: quattro guasti concatenati (10 Agosto 2026) — ✅ *COMPLETED*

**Commit:** `bfedaa8`, `72ad582`, `708cebc`, `2977998`, `f250aa3`, `d3ef2d3`, `2547030`, `c4251b3` su `main`

* **Scraper orario jobroom ritirato.** Falliva ogni run (exit 1, mail di errore) — la pagina serve uno stub da 718 byte senza il warm-up cookie che questo script non fa mai, e comunque nessuno legge più il suo JSON: il sito serve le offerte live da `api/jobs.js`/`_arca24.js`.
* **Un run a freddo poteva nascondere l'intera sezione.** `/api/companies?withJobs=1` misurato fino a 93s a freddo; se scadeva il probe, la sezione spariva per 5 minuti (cache CDN `s-maxage=300` applicata anche a risposte degradate) senza secondo tentativo. Fix: tiene l'ultimo roster buono, cache 30s sulle risposte degradate, retry del componente a +4s/+35s.
* **Precalcolo in build.** Lettura prod (edge cache, ~0.2s) invece di rileggerla da prod stessa in loop — impossibile, il probe live ha già solo 4s di budget e la sua risposta è già uno stand-in. Calcolato in build contro `company/jobs` (46s pieno), non più contro `profile` (150s+, metà aziende non probate).
* **Le pagine azienda avevano smesso di elencare annunci.** `careers/company/profile` risponde 200 con l'intestazione ma zero `.resultstring`: gli annunci ora arrivano via script. `careers/company/jobs` li rende ancora (Adecco 15, Manpower 4, PKB 1 sullo stesso run che vedeva zero su profile) — probe letto da lì, identità dal profilo, in parallelo.
* **"Azienda Riservata" in cima alla home erano annunci reali, non anonimi davvero.** Le pagine azienda non portano il link/company della riga, quindi ogni annuncio del pool vetrina arrivava anonimo — anche quelli di Randstad. Nome recuperato dal profilo aziendale via uiid, senza sovrascrivere un nome che la riga aveva già dato.
* **Ordine e cap per azienda.** `companyKey` raggruppava tutti gli anonimi come "un'azienda sola" (cap 2 → solo 2 mostrati su decine); ora bucket separati con tetto proprio di 4. Ordinamento per data reale via `published_at` (prima cadeva nel mapping di `Filters`, quindi tornava all'ordine feed nonostante il sort).

---

## Canonical URL: 107 pagine duplicate secondo Ahrefs (10 Agosto 2026) — ✅ *COMPLETED, backlog aperto*

**Commit:** `c179db1`, `96f55f1`, `c09290f`, `6a9c9fb` su `main` · **Backlog dettagliato:** `00_Wiki/job-courier/seo-audit-backlog-2026-08-10.md`

* **Ogni route SPA veniva riscritta su `index.html`, senza canonical finché il bundle non bootava.** Ahrefs vede lo stesso shell, stesso title, nessun canonical su `/`, `/offerte`, `/faq`, blog — report "Duplicate pages without canonical", 107 URL. Fix: route fisse prerenderizzate in build (`scripts/prerender-canonicals.mjs`); route blog dinamiche via `api/shell-ssr.js`; `serveFallback()` mantiene il canonical (un crawl in burst che fa timeout su annuncio/azienda finiva lì).
* **Home canonicalizzata da `index.html` stesso** (Vercel la serve da filesystem prima dei rewrite, quindi il rewrite su una copia prerenderizzata non scattava mai) **e nella forma con slash finale** (`/`, come sitemap e URL indicizzata — prima era senza, stringhe diverse per l'audit anche se stessa pagina).
* **Shell blog non più cacheata tra deploy.** Asset hashati esistono solo nel deploy che li ha creati; una copia cache HTML chiedeva un bundle sparito (404 in produzione). `index.html` era già `no-store` per questo, la function che serve le route blog ora fa lo stesso.
* **Risultato:** dalle 107 duplicate a zero sul crawl delle 16:17 (crawl precedente 14:25, Ahrefs progetto `10208912`). **Resta aperto**, dettagliato nel backlog: shell SPA senza H1/description/testo per i crawler (107 pagine, P0), 84 pagine indicizzabili fuori sitemap, pagine orfane, 251 pagine lente, title/description fuori misura, hreflang senza return-tag, escape doppio nei titoli SSR aziende con `&` nel nome.
* ⚠️ **Curl a raffica sul dominio fa scattare il Vercel Security Checkpoint** (403 anche su `robots.txt`, qualche minuto) — falso "Robots.txt is not accessible" al crawl delle 14:25, e ricapitato in questa stessa sessione durante la verifica finale. `sleep 2` tra le richieste, o usare un browser reale, se si verifica a mano.

---

## 0. Outage jobroom: le offerte spariscono il giorno dopo il go-live (2 Agosto 2026) — ✅ *MITIGATO, causa a monte aperta*

**Handoff completo:** [`docs/handoff-2026-08-02.md`](handoff-2026-08-02.md) · **Commit:** `a2dd371`, `697664b`, `e935ec1`, `6589c0d`
**Modello:** Claude Opus 5 (`claude-opus-5`), caveman mode full · 120 minuti

* **Il guasto è a monte, non nel nostro codice.** `latest-and-all-job-ads.php` serve la sua shell ma risponde "Non ci sono risultati" a qualsiasi filtro — Svizzera, mondiale, nessun filtro — verificato in browser reale con JS completo. Nel markup è comparso `arca24_partner=jobcourier`, assente il giorno prima: verosimilmente la migrazione Arca24 del 3 agosto, partita in anticipo.
* **⚠️ Diagnosi iniziale sbagliata, registrata perché è l'errore da non ripetere.** Avevo concluso "catalogo vuoto". Falso: aprendo `employer/view-company.php?id=...` **gli annunci ci sono tutti**. Rotta era solo la ricerca generale. Prima di dichiarare un catalogo vuoto, aprire una scheda azienda.
* **Il fix cambia la sorgente, non il parser.** Le schede azienda usano lo stesso identico markup della ricerca (`.singleResult`, `.dataContainer`, `view-job.php`): `parseJobsFromHtml` non modificato ne estrae 15 al primo colpo. Riusate `fetchCompanyListHtml`/`parseCompaniesFromHtml` (da `companies.js`) e `warmUpSessionCookies` (da `company-detail.js`), solo esportate. Nessuna infrastruttura ricreata.
* **Misure prima di scegliere i parametri:** 35 aziende in lista, **solo 12 con annunci**, sparse nell'elenco — leggerne un prefisso perde offerte reali — per **120 annunci totali**, ~11s a concorrenza 6. Interleaving round-robin, non concatenazione: i conteggi per azienda sono sbilanciatissimi e concatenare avrebbe riprodotto la vetrina monomarca appena risolta da `0c72fcf`.
* **Si autodisattiva.** Parte solo se la ricerca non restituisce abbastanza offerte; quando Arca24 ripristina smette da solo. Nessun flag da ricordare.
* **7 problemi trovati da due giri di review avversariale + stress test, tutti corretti.** I tre seri: (a) il fallback rispondeva anche alle **ricerche filtrate** — `keyword=%00%FF` restituiva 45 offerte a caso, confermato dal vivo, dati sbagliati e non assenti; (b) **ripresa parziale** non gestita — il trigger era `length === 0`, quindi una ricerca che riparte con 3 offerte avrebbe lasciato il sito con 3 offerte per tutta la Svizzera a tempo indeterminato, con l'aria del dato vero; (c) `/api/companies` rispondeva **502 + `no-store`** su stub, quindi ogni visita generava 3 retry contro un host che ci stava già rifiutando.
* **⚠️ L'anti-bot di jobroom è reale e si attiva.** ~500 richieste durante lo stress test e la piattaforma ha iniziato a rispondere **99 byte** (`localStorage.clear(); location.reload()`) invece di 145 KB, warm-up compreso — blocco totale. Colpito solo l'IP di sviluppo, **non** quelli di Vercel (verificato: `/api/companies` in produzione continuava a rispondere). Rientrato in ~2 ore. Da qui il TTL di 40 minuti sul solo percorso fallback: da ~420 a ~53 richieste/ora.
* **Scelta deliberata: i filtri restano vuoti durante l'outage.** Filtrare lato nostro il pool significherebbe filtrare ~120 offerte su 6.639 reali e far concludere all'utente "in Ticino ci sono 3 posti". Uno zero onesto batte un numero sbagliato che sembra vero. Da rivalutare oltre i due giorni.
* **La soluzione vera è il feed XML Arca24:** 6.639 offerte, 17 aziende (contro le 4 visibili sfogliando l'HTML), date reali. L'URL ricevuto il 30/07 era pre-firmato a 30 minuti ed è scaduto — **serve un indirizzo permanente**, chiesto nella mail per Laura e Gabriele. Risolverebbe l'outage e tre limiti storici insieme.

---

## 1. GO-LIVE ESEGUITO: jobcourier.ch passa a Vercel (31 Luglio 2026, sera) — ✅ *COMPLETED*

**Registro operazioni:** [`docs/ROLLBACK-LOG.md`](ROLLBACK-LOG.md) (OP-01 → OP-08) · **Piano:** [`docs/GOLIVE-PLAN.md`](GOLIVE-PLAN.md)
**Modello:** Claude Opus 5 (`claude-opus-5`), caveman mode full · 120 minuti

* **Switch DNS su GoDaddy, due sole modifiche:** `A @` da `217.26.61.124` a `76.76.21.21`, e `A www` eliminato in favore di `CNAME www → cname.vercel-dns.com`. MX, `jobroom`, `crm`, TXT SPF/DKIM/DMARC e nameserver non toccati — verificati intatti dopo.
* **SSL emesso in ~12 minuti.** Nella finestra intermedia l'apex funzionava già (308 → www, `Server: Vercel`) mentre `www` dava `SEC_E_WRONG_PRINCIPAL`: certificato non ancora emesso, comportamento atteso e coperto dal playbook §6.3, che tollera fino a 1 ora.
* **Redirect verificati uno per uno, non a campione.** Tutte e **211 le URL** di `docs/old-urls-snapshot.txt` testate sul deployment: 211/211 arrivano a 200, nessuna orfana, nessun soft-404.
* **`main` non era la produzione.** Il deploy live veniva da `claude/site-final-updates-ed071a`, tre commit avanti a `main`: il primo push su `main` avrebbe fatto regredire il sito. Sanato con fast-forward prima di toccare il DNS. **È la terza volta che questo pattern si presenta** (vedi sezioni 2 e 3) — prima di ogni push su `main`, confrontare i branch remoti.
* **Fix SEO canonical.** Apex e www rispondevano entrambi 200 senza `<link rel="canonical">`: duplicate content sulle 213 URL indicizzate, tutte su www. Aggiunto canonical + og:url derivati dal pathname nell'Helmet di `App.jsx`, e rimosso l'`og:url` statico da `index.html` (react-helmet-async non sostituisce i tag che non ha creato → ne comparivano due).
* **Redirect apex → www a 308** configurato in Vercel Domains: www resta il dominio servito, coerente con sitemap, robots.txt e le URL indicizzate.
* **⚠️ Backup DB: il sito è andato 503 per ~7 minuti.** Il dump di `uzohucip_wp1` è quasi 1 GB e su hosting condiviso ha saturato la capacità. Aggravante: il primo click su DOWNLOAD non scriveva nulla su disco dopo 60s, ho ricliccato, e sono partiti **due dump da 1 GB in parallelo**. Su Hostpoint un dump grosso può metterci minuti prima del primo byte — controllare i file `*.crdownload`, non l'assenza del file finale. Il backup file completo (9.2 GB) è stato rimandato a **dopo** lo switch, quando Hostpoint non serviva più traffico pubblico.
* **Vetrina home con cap 2 offerte per azienda** portata in produzione con un cherry-pick chirurgico da `claude/offerte-vetrina-lingua-cantone-d4d073`: quel branch divergeva da un `main` precedente all'i18n batch2, e un merge diretto avrebbe toccato 37 file reintroducendo regressioni già risolte. Portati solo hook, utility e 5 patch mirate; esclusi i suoi `Offerte.jsx`, `index.css` e i locale stantii (246 chiavi contro 342).
* **Rollback sempre disponibile:** WordPress su Hostpoint intatto e non disdetto, ripristino DNS in ~10 minuti con TTL 600s. Non toccare per almeno 4 settimane.
* **Rimasto in sospeso:** submit sitemap su Search Console.

---

## 2. i18n: regressione EN/DE/FR, recupero branch, sistematizzazione (31 Luglio 2026) — 🟡 *IN PROGRESS*

**Handoff completo:** [`docs/handoff-2026-07-31.md`](handoff-2026-07-31.md)
**Modello:** Claude Opus 5 (`claude-opus-5`), caveman mode full · 2 sessioni

* **Regressione silenziosa scoperta e fixata.** I commit che riversavano il copy dai DOCX cliente (`7c71136`, `a6b0af6`, `8151e94`) avevano sostituito chiamate `t()` con testo italiano letterale. i18next non segnala nulla in questo caso — nessun errore, la chiave semplicemente smette di essere chiamata. Hero e ComeFunziona riagganciati, `come_funziona.*` riscritto sul copy DOCX attuale in 4 lingue (prima EN/DE/FR avevano il copy *pre-revisione*).
* **Trovato per caso mentre si verificava il fix: `main` era di nuovo indietro.** `origin/integration/golive-plus-ballinari` conteneva 8 commit mai arrivati su `main`, il più recente delle 14:32 del 28/07. Per ~30 ore la produzione ha servito la pagina Contatti pre-27.07 mentre Laura la credeva già online. Merge recuperato (`994736c`), namespace disgiunti verificati con `git merge-tree` prima di toccare main, 0 conflitti.
* **Scoperta strutturale:** convivono 3 pattern i18n diversi nel codice (`t()`+JSON, oggetti inline `labelEn/labelDe/labelFr`, ternari `isIt?:`). Una stringa IT letterale non si distingue a colpo d'occhio da una tradotta — causa strutturale delle regressioni ricorrenti.
* **i18n sistematico su tutto il sito, in due sessioni misurate.** Metodo: script estrattore (trova le stringhe IT senza leggere i sorgenti interi) → applier che dichiara quante volte ogni sostituzione *deve* colpire e rifiuta di scrivere se il conteggio non torna (rifiutati 10 file su 24 al primo giro, sempre per un motivo reale — occorrenze multiple legittime tipo `Sede:` in card+dettaglio) → locale scritti via script → build/lint confrontati pre/post (non "zero errori", ma stesso numero di prima) → verifica live leggendo `i18n.t()` risolto a runtime, non il DOM (3 falsi negativi presi leggendo il DOM in questa sessione).
* **Risultato:** locale passati da 119 chiavi con buchi a **300 chiavi × 4 lingue in parità totale**. Verificato in produzione su home, come-funziona, offerte, contatti, FAQ, footer, 404.
* **Fix collaterale:** 13 link verso il portale jobroom erano fissi su `lan=it&language=it` — un utente FR cliccava "Publier une annonce" e atterrava sul portale in italiano. Centralizzato in `utils/jobroomLang.js`.
* **Resta fuori:** FAQ body (32 Q&A, ~6.5k tok, non previsto nel censimento iniziale), settori/cantoni Hero+Filters (chiavi Arca24, aspettano Laura), pagine legali (rischio conformità su traduzione automatica, non tradotte di proposito). Mail inviata a Laura/Gabriele il 29/07 con 4 domande decisionali, risposta non ancora arrivata.

---

## 3. Go-Live: integrazione branch e correzioni SEO (28 Luglio 2026) — ✅ *COMPLETED*

**Handoff completo:** [`docs/handoff-2026-07-28.md`](handoff-2026-07-28.md) · **Registro operazioni:** [`docs/ROLLBACK-LOG.md`](ROLLBACK-LOG.md)
**Modello:** Claude Opus 5 (`claude-opus-5`), caveman mode full · 60 minuti

* **`main` era indietro rispetto alla produzione.** Il lavoro di luglio viveva su due branch mai mergiati (modifiche Ballinari + piano go-live). Un push su `main` avrebbe fatto regredire il sito live. Integrati e allineati (merge `ebb3056`).
* **I 121 redirect erano inerti.** Le 211 URL WordPress indicizzate finiscono tutte con lo slash, le regole erano scritte tutte senza: nessun match, quindi soft-404 di massa al go-live. Fix `"trailingSlash": false` (`05d51c2`). Bug invisibile in locale perché `vite dev` non applica i redirect di `vercel.json`.
* **Soft-404 eliminato.** Rimosso il rewrite catch-all, sostituito con 14 rewrite espliciti + `webapp/public/404.html` statico: gli URL inesistenti ora rispondono **404 vero** invece di 200 (`5f355cc`). ⚠️ Conseguenza: una nuova `<Route>` in `App.jsx` va aggiunta anche ai `rewrites` di `vercel.json`, altrimenti 404 da URL diretta.
* **Pre-flight DNS/Vercel.** Domini `jobcourier.ch` e `www` aggiunti al progetto Vercel; TTL del record `A www` abbassato da 1 ora a 600 s su GoDaddy. Nessuno dei due tocca il traffico: il sito pubblico è ancora il WordPress su Hostpoint, verificato prima e dopo.
* **`.env` non era ignorato da git** in nessuno dei due `.gitignore`. Aggiunte le regole + `.env.example` (`e0a22e0`).
* **Data go-live spostata a venerdì 31 luglio**, prima del rilascio Jobroom del 3 agosto (deciso con Gabriele).
* **La nuova piattaforma Arca24 romperà gli scraper:** struttura URL completamente diversa (`/it/careers/latest_jobs` invece di `/job/latest-and-all-job-ads.php`). L'host `viso-` sembra però un ambiente di collaudo — chiedere ad Arca24 quello definitivo prima di migrare.

---

## 📌 Stato Attuale: Operazioni Completate

### 1. Handoff Refinements & Pricing Redesign (Giugno 2026) — ✅ *COMPLETED*
* **DotCard Animation & Responsiveness**: Risolto il conflitto con Flexbox introducendo un contenitore assoluto `.jc-dot-border-container` (85% di larghezza/altezza, centrato) per racchiudere il pallino `.jc-dot-dot`. Riscritto `@keyframes moveDot` con coordinate percentuali `left`/`top` e allineamento `transform: translate(-50%, -50%)` per seguire i bordi della card in modo perfettamente responsivo. Rilevamento automatico della lunghezza del testo del contatore (se > 7 caratteri, ad esempio `120'000+`) per ridurre la dimensione del font a `1.9rem` (invece di `2.4rem`), eliminando i problemi di clipping laterale.
* **Footer Login Modal Trigger**: Risolto il problema del link non funzionante `#login` nel Footer passando la prop `setShowLoginModal` da `App.jsx` a `<Footer />` e aggiungendo un gestore `onClick` per intercettare i click con `href === '#login'`, che apre direttamente il modal del login.
* **API Cookie Parsing Fix**: Corretto il crash del backend in `webapp/api/job-detail.js:38` (dovuto alla deprecazione/assenza di `headers.raw()` in `node-fetch` v3). Ora viene utilizzato `sessionResponse.headers.get('set-cookie')` ed estratto il token di sessione con una regex robusta `/,(?=\s*[a-zA-Z0-9_]+=)/` per prevenire divisioni errate sulle virgole interne alle date di scadenza dei cookie.
* **Redesign della Pagina Pricing**: Completato il restyling completo di `Pricing.jsx` nello stile visuale "Organic Tech". Strutturato in 2 tab navigabili: `Aziende & PMI` (con 3 card di prezzo: Job Post Basic a CHF 249, Pack 5 Boost a CHF 890 con fucsia highlight, e Piano Continuo da CHF 1'200; affiancate da una sidebar con i vantaggi di brand) e `Agenzie di selezione` (con una schermata di invito a richiedere offerte personalizzate per volumi massivi tramite bottone verso `/contatti`).

### 2. Brand Identity & Visual Alignment (Maggio 2026) — ✅ *COMPLETED*
* **Palette Istituzionale**: Applicazione rigorosa dei colori ufficiali da Brand Guidelines:
  * Primary Navy: `#050B2B`
  * Accent Fuchsia: `#FF1F7A`
  * White: `#FFFFFF`
  * Light Gray: `#F6F7FB`
* **Loghi ad Alta Risoluzione**:
  * Sostituiti tutti i vecchi asset raster a bassa risoluzione con i nuovi file ufficiali HD: `logo-full.png` (esteso, **625x278px**) e `logo-square.png` (**1000x1000px**).
  * Ripristinati i tag immagine (`motion.img`) in Navbar e Footer con un'altezza ottimizzata di `h-12 md:h-15` (48px-60px), assicurando una visualizzazione imponente, nitida e priva di margini trasparenti superflui anche su schermi Retina/4K.
  * Favicon aggiornata con successo all'asset ad alta risoluzione `/logo-square.png`.

### 3. Sistema di Interazione: Hover-Glow Dinamico (Maggio 2026) — ✅ *COMPLETED*
* **Componente `AnimatedButton`**: Sviluppato un pulsante a puntatore magnetico tracciato da cursore (60fps fluido), esente da lag da griglia grazie a proprietà CSS accelerate via hardware.
* **Regole di Contrasto Dinamico (Speculari)**:
  * **SU BOTTONI BLU/NAVY (e Outline su Sfondo Blu)**: l'effetto hover proietta un glow **Fucsia di Brand (`#FF1F7A`)**. All'hover il testo dei pulsanti outline (es. *"Come funziona"*, *"Soluzioni e tariffe"*) rimane rigidamente **Bianco (`#FFFFFF`)** per evitare impasti cromatici e garantire leggibilità 1:1.
  * **SU BOTTONI FUCHSIA**: l'effetto hover proietta un glow **Blu/Navy di Brand (`#050B2B`)**, preservando il testo bianco brillante ed esaltando il contrasto.
* **Integrazione Globale**: Sostituiti tutti i bottoni tradizionali/link all'interno delle modali critiche dell'applicazione per garantire uniformità:
  * `Navbar.jsx` (Navy CTA)
  * `Hero.jsx` (Selettori di ricerca, CTA ed outline *"Altri Link"*)
  * `ApplyRedirectModal.jsx` (CTAs di candidatura esterna)
  * `RegistrationWallModal.jsx` (CTA paywall di registrazione)

### 4. Debugging & Stabilità a Runtime — ✅ *COMPLETED*
* **Hotfix ReferenceError**: Risolto crash a runtime sul deploy di produzione (`style is not defined`) in `animated-button.jsx` inserendo la destrutturazione di `style` nella firma di `HoverButton` ed eseguendo il merge corretto con l'oggetto di stile interno, prevenendo sovrascritture causate dallo spread operator (`...props`).

### 5. Hero, Navbar & UI Layout (Aprile 2026) — ✅ *COMPLETED*
* **Navbar Sempre Visibile**: Rimosso lo stato trasparente allo scroll di partenza. Navbar sempre attiva con sfondo `white/98`, shrinkage di altezza `72px -> 60px` ed attivazione progressiva di ombra all'aumentare dello scroll.
* **Spazi Pubblicitari (AdSlots)**: Eliminata la vecchia sezione CTA ridondante e sostituita con due ampi spazi AdSlot flex-row 50%/50% a caricamento lazy per massimizzare la monetizzazione.
* **Blog 50/50 Split**: Layout "Clinical Boutique" totalmente bianco spezzato in due colonne asincrone (Candidati a sx con carosello 5s, Aziende a dx con carosello 5.3s).

### 7. Notion CRM Integration & Snapshot Rebuild (Luglio 2026) — ✅ *COMPLETED*
* **Importazione e Allineamento Categoria**: Sviluppato lo script di sincronizzazione `sync_categories_to_notion.py` che ha mappato e importato le categorie `Temp`, `Perm` e `Temp e Perm` dal file Excel `.raw/20260629_Agenzie_CH_aggiornate_2026.xlsx` su Notion (353 pagine Notion aggiornate con un match rate del 98.5% e 0 errori).
* **Vercel Blob Snapshot Cache**: Configurato il Vercel Blob store `jc-crm-blob` per ospitare lo snapshot cache JSON contenente tutte le **6.138 aziende e contatti** raggruppati lato server Next.js. Questo bypassa i limiti di rate-limiting di Notion e ottimizza il caricamento della pipeline e delle tabelle a schermo.
* **Middleware Rebuild Protection**: Modificato `middleware.ts` per consentire all'endpoint `/api/companies/rebuild` di bypassare NextAuth se l'header `x-rebuild-secret` corrisponde alla variabile d'ambiente `REBUILD_SECRET`.
* **Automazione Cron Job su n8n**: Sviluppato lo script `deploy_rebuild_cron.mjs` ed attivato il workflow cron job `"JC CRM - Rebuild Snapshot Cron"` (ID: `TtIVXWWuyfAgawl6`) su `emanueleserra.app.n8n.cloud` per innescare la ricostruzione automatica dello snapshot in Vercel Blob ogni 15 minuti.
* **Audit di Verifica & Esportazione**: Creato lo script di controllo `verify_and_export.py` che ha confermato un'unione dei dati con copertura superiore al 98.5% rispetto a tutti i file di input storici e generato il file Excel consolidato `Notion_CRM_Export_Gabriele.xlsx` (6.138 righe) pronto per Gabriele.

### 6. LLM-Enhanced Job Matching — 3-Phase Plan (Giugno 2026) — 🔴 *IN PROGRESS*

**Handoff:** `docs/handoff-2026-06-25.md` | **Piano:** `docs/IMPLEMENTATION_PLAN_2026-06-25.md` | **Meeting:** `docs/MEETING_SUMMARY_2026-06-25.md`

**Contesto:** 2 sessioni meeting Otter.ai (49 min totali, 25 giugno). Session 1 = LinkedIn automation strategy. Session 2 = Database + email automation design. Entrambe mappate direttamente su Job Courier come blueprint architetturale.

#### Phase 1 — Foundation (NOW, 2-3 settimane, target 15 luglio)
* **P1.1 Tassonomia Normalizzata:** Centralizzare enums cantoni→regionId, settori→sectorId in `utils/taxonomy.js`. Cross-reference ISCO-08/O*NET. 26 cantoni svizzeri + 15+ settori. Effort: 1 settimana.
* **P1.2 Search Indexing (Elasticsearch):** Sostituire scraping HTML raw (3 page concurrent, 45 jobs max) con Elasticsearch index. Sub-100ms retrieval, full-text + filtri. Docker-compose per ES 8.11.0. Pipeline: Scraper → Indexer → API. Effort: 1.5 settimane.
* **P1.3 Faceted Navigation:** Conteggi live per cantone/settore/livello esperienza. Salary range slider. Aggregation queries ES. Componente `FacetedSearch.jsx`. Effort: 1 settimana.
* **Checkpoint Phase 1:** Staging deploy con 10k+ offerte indicizzate, ricerca <100ms, filtri funzionanti.

#### Phase 2 — Semantic Matching (4-6 settimane, target fine agosto)
* **P2.1 Vector Embeddings:** 768-dim embeddings per job descriptions. OpenAI `text-embedding-3-small` ($0.02/1M tokens) o HuggingFace `paraphrase-multilingual-mpnet-base-v2` (gratuito, supporta IT+DE). Hybrid search keyword+vector (30%/70% weight).
* **P2.2 LLM Query Understanding:** Claude API per parsing query strutturato → skills, experience_level, location, remote_preference. Costo ~$0.10-0.50/1k queries.
* **P2.3 Skills Graph:** Grafo bidirezionale skill con distanza (adjacent=0.5, similar=0.7). 500+ skills target. Auto-expand query "React" → include "Vue", "Angular".
* **P2.4 LLM Ranking + Explainability:** Claude re-rank top-20 con match score 0-10 + reasoning. UI `JobCardWithReasoning.jsx`.

#### Phase 3 — Personalization (6-8 settimane, target fine ottobre)
* **P3.1 Candidate Profiles:** Search history, click tracking, application signals, saved jobs.
* **P3.2 Unified Recommendation Model:** SilverTorch pattern — retrieval+ranking in single stage (23.7x faster).
* **P3.3 Dual-Perspective Reasoning:** Match under hard constraints (certificazione, visa, location) + soft signals.

#### Discriminanti Chiave (da Session 2 meeting)
| Discriminante | Impatto |
|---------------|---------|
| **Lingua** (IT/DE/FR/EN) | Template email, lingua job alerts |
| **Cantone** (26 CH) | Filtro regionale, regionId mapping |
| **Tipo Azienda** (Corporate vs Staffing) | Contenuto outreach diverso |
| **Tipo Impiego** (Permanent/Temporary/Contract) | Value proposition diversa |
| **Livello Esperienza** (Junior/Mid/Senior) | Matching candidato-offerta |

#### Assegnazioni
* **Emanuele S.:** Phase 1 (ES setup, tassonomia, UI filtri) — 3.5 settimane
* **Michele:** Phase 2 (embeddings, LLM query, skills graph) — 5 settimane post-Phase 1

#### Costi Stimati
| Componente | Costo |
|-----------|-------|
| Elasticsearch Cloud | ~$500/mese |
| OpenAI Embeddings | ~$200 (una tantum, 10k jobs) |
| Claude API (query+ranking) | ~$150/mese |
| **Totale** | **~$850/mese** |

#### Blockers per Gabriele (in attesa feedback)
1. Risorse: Emanuele + Michele 100% dedicati?
2. Infrastruttura: ES cloud vs self-hosted?
3. Budget API: Claude + OpenAI approvato?
4. Scope Phase 1 lock
5. Timeline OK?
6. Standup frequency?

**Mail bozza pronta:** `GMAIL_DRAFT_GABRIELE.txt` → `g.molteni@jobcourier.ch` (CC: emanuele.serra, michele). Mail NON ancora inviata (Gmail MCP non disponibile il 25/06).

### 8. Modifiche Sito richieste da Laura (26 Luglio 2026) — ✅ *10/10 FATTE*
* **Dettaglio completo:** `docs/MODIFICHE_SITO_2026-07-26.md`
* **Nuove pagine interne:** `/aziende-che-assumono` + `/azienda/:slug` con scraper `api/companies.js` e `api/company-detail.js` (sostituiscono il link esterno a jobroom). Le 11 aziende su jobroom sono profili vetrina con 0 annunci attivi.
* **Bug corretti strada facendo:** "Trova candidati" puntava alla pagina candidati invece della registrazione azienda; il banner Ated (`FormaBanner`) non veniva mai renderizzato; hero companies duplicava il testo dei candidati.
* Go-live target: 30.07–03.08.2026. Check finale vdc: mer 29 (16-19:30) o gio (11-12).
* Copre: titoli Home, link menu Azienda, sezione Aziende Partner, sezione Formazione continua (Ated+Supsi separata da ASFL/BLC), titoli blog, copia statica pagina "Aziende che assumono", 4 immagini "Come funziona", testi pagina Soluzioni, correzioni legali Cookie Policy (JobCourier Sagl, Riva San Vitale, privacy@jobcourier.ch).
* **Pagina Contatti — completata e verificata in produzione il 31/07.** Era stata implementata il 28/07 (`d909ac0`) ma finita su un branch mai arrivato su `main`; recuperata durante la sessione i18n del 29/07 (vedi sezione 0). Sezione candidati, box FAQ, Nome/Cognome separati, tendina Oggetto a 4 voci, testo GDPR — tutto confermato live in tutte e 4 le lingue.

---

## 🚀 Prossime Operazioni & Task Rimasti (Missing Tasks)

### 🔴 Aperti dal go-live e dall'outage (agosto 2026)

0. **Feed XML completo Arca24 — la priorità.** 6.639 offerte, 17 aziende, date reali, contro le poche centinaia di 4 aziende con date identiche che si ottengono sfogliando l'HTML. L'URL ricevuto il 30/07 era pre-firmato a 30 minuti ed è scaduto: serve un **indirizzo permanente**, da chiedere ad Arca24 tramite Laura e Gabriele. Risolve l'outage di agosto e tre limiti storici in un colpo. Chiesto nella mail del 03/08.
0b. **Ricerca jobroom da ripristinare** (lato Arca24). Quando torna, verificare che il fallback si spenga da solo: `curl /api/jobs?singlePage=1` e controllare che le aziende tornino ad essere quelle della ricerca.
0c. **Search Console:** submit `sitemap.xml` + richiesta indicizzazione su home e pagine chiave. In sospeso dal go-live del 31/07. Monitorare 404/soft-404 nei giorni successivi.
0d. **Backup file completo Hostpoint** (9.2 GB): avviato il 01/08 alle 01:09, verificare che sia stato completato e scaricarlo. I due dump DB sono già su disco ma **nella cartella Download** — vanno spostati in un archivio stabile.
0e. **Filtri di ricerca vuoti durante l'outage:** scelta deliberata (meglio zero onesto che un campione del 2% presentato come risultato). Se l'outage supera i due giorni, aggiungere un messaggio esplicito "ricerca temporaneamente limitata".
0f. **Test email @jobcourier.ch con Laura:** MX non è stato toccato dallo switch DNS, ma manca la conferma di un invio/ricezione reale.

### Backlog prodotto

1. **Paywall Incrementale a 3 Click**:
   * Sviluppare nello state globale (o local storage) il contatore di click sugli annunci: giunto al terzo click, l'utente visualizza `RegistrationWallModal` per costringerlo alla registrazione gratuita.

2. **Template Dettaglio Annuncio Interno**:
   * Completare la rotta `/offerta/:id` in sostituzione dei redirect esterni diretti di JobRoom. Il template deve presentare le informazioni strutturate dell'offerta e mostrare come unica CTA il pulsante *"Candidati Ora"* (gestito tramite `ApplyRedirectModal`).

3. **Integrazione Componente Vetrini**:
   * Integrare il componente `<Vetrini />` per le aziende premium direttamente in homepage sotto la sezione delle statistiche o del manifesto.

4. **Sezione Referenze / Testimonianze**:
   * Creare una sezione dedicata in fondo alla homepage per accogliere due grandi card per i testimonial/referenze aziendali.

5. **Uniformità Dimensioni H1**:
   * Controllare che l'animazione GSAP / CSS di ridimensionamento degli H1 Candidati e Aziende mantenga dimensioni rigorosamente speculari e simmetriche anche a riposo.

---

## 📝 Notion Documentation Standard

Tutte le sessioni create su Notion (es. "Sessioni di Lavoro" o "Devlog") **DEVONO** seguire il seguente template di struttura a blocchi (ispirato allo stile "Premium/Clinical"):

1. **Paragraph**: `🚀 [Tipo] [Nome Progetto] — [Titolo Sessione]`
2. **Heading 2**: `🎯 Obiettivo della sessione`
3. **Paragraph**: `**Conclusione:** [Testo del riassunto]`
4. **Paragraph**: `**📋 Attività svolte:**`
5. **Bulleted List**: Elenco dei compiti completati
6. **Divider**
7. **Heading 2**: `✅ Risultati raggiunti`
8. **Paragraph (Opzionale)**: Sottotitolo in bold es. `**UI/UX Components:**`
9. **Bulleted List**: Elenco dei risultati
10. **Divider**
11. **Heading 2**: `📋 Prossimi passi`
12. **Bulleted List**: Elenco dei prossimi passi
