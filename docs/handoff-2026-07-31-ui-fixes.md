# Handoff — 31 luglio 2026 (batch UI, pomeriggio)

**Modello:** Claude Sonnet 5 (`claude-sonnet-5`) · caveman mode `full` attivo · reasoning effort non esposto in sessione (default harness)
**Branch:** `claude/site-final-updates-ed071a` (pushato su origin, preview Vercel git-integration in corso)
**Focus:** 4 fix mirati su regressioni/UX segnalate dal cliente dopo screenshot del sito live

---

## 0. Metodo — Karpathy (pensa prima di editare, cambi chirurgici)

Ogni fix richiesto è arrivato via screenshot, non via riferimento a componente. Prima di toccare codice: **verificato quale file genera davvero quel pixel**, non assunto dal nome della sezione ("Screen 1" nel messaggio utente ≠ Hero.jsx, era in realtà `Offerte.jsx`). Grep letterale del testo nello screenshot ("ULTIMI ANNUNCI PUBBLICATI", "TROVA OFFERTE") non ha trovato match in nessun commit della history — segno che lo screenshot proviene da un deploy Vercel leggermente diverso (copy cambiato in un batch i18n successivo), non da questo branch. Deciso di procedere sulla struttura visiva (layout identico: eyebrow + h1 + search widget + lista job) ignorando il mismatch testuale, che è cosmetico e non blocca il fix richiesto (dimensione font, non contenuto).

Le 4 modifiche sono state delegate a 4 subagent paralleli (uno per file, zero sovrapposizione), ognuno con line number, snippet attuale e snippet target già scritti nel prompt — nessuna riscrittura alla cieca, ogni subagent ha girato eslint sul proprio file prima di dichiarare fatto.

## 1. Offerte.jsx — heading troppo grande, nessuna riga fucsia

**File:** `webapp/src/pages/Offerte.jsx:288-299`
Prima: `<h1 fontSize:44>` fisso, una riga sola ("{jobs.length} annunci live").
Dopo: due `<h1>` separati, `fontSize: clamp(24px, 5vw, 34px)` (scala con viewport, niente breakpoint JS) — riga 1 navy bold ("{jobs.length} annunci"), riga 2 italic fuchsia font-editorial ("live"), stesso pattern già usato in `Hero.jsx` per h1/h1-sub (coerenza brand, non un pattern nuovo inventato).

## 2. Pricing.jsx — hover sidebar non funzionava più (regressione)

**File:** `webapp/src/pages/Pricing.jsx`
Causa: il pannello "Perché sceglierlo" leggeva solo `selectedPlan` (settato da `onClick`). L'hover era stato tolto in un refactor precedente senza che nessuno se ne accorgesse — nessun errore, solo comportamento perso.
Fix: nuovo state `hoveredPlan`, `activePlan = data.plans[hoveredPlan ?? selectedPlan ?? 1]`, `onMouseEnter/onMouseLeave` sulle card. Click continua a "bloccare" la selezione (nastro "SELEZIONATO" invariato, legge solo `selectedPlan`) — hover è solo un'anteprima temporanea sopra, non sostituisce il click.

## 3. AdBanner.jsx — Supsi accantonato, Ated full-width

**File:** `webapp/src/components/AdBanner.jsx:350-353, 423`
Supsi commentato (non cancellato — richiesta esplicita di tenerlo in memoria per riattivarlo dopo). Grid `md:grid-cols-2` reso condizionale a `isTop`: la riga bottom ora ha un solo elemento (Ated/FormaBanner) quindi `grid-cols-1` lo fa occupare tutta la larghezza automaticamente. **Nessuna generazione immagine con kie.ai è servita** — il banner Ated è già costruito con percentuali/`cqw` (container query units) sulle sue sezioni interne, non è un'immagine flat: allargare il contenitore scala tutto proporzionalmente mantenendo stile e grafica identici.

## 4. index.css — numeri statistiche illeggibili su mobile

**File:** `webapp/src/index.css:268-297`
`.jc-spotlight-text` (i contatori "120'000+" / "3'000+" nel pannello aziende di Hero.jsx) aveva `font-size: 2.2rem` fisso. Su mobile stretto (2 card affiancate in un box da ~320px) il numero si schiacciava. Fix: `clamp(1.35rem, 6vw, 2.2rem)` — scala con la viewport reale invece di un breakpoint fisso, quindi compatibile con qualunque schermo, non solo i preset testati. Aggiunto anche breakpoint `max-width:480px` per compattare padding/label.

## Verifica eseguita

- Dev server locale (`npm run dev`, porta auto-assegnata): letto DOM via `read_page`/`javascript_tool`, non screenshot (pane non compositava in questo ambiente headless).
- Confermato via DOM: heading Offerte in due righe; hover su card Pricing cambia il tag della sidebar da "02/VOLUME" a "01/OCCASIONALE"; Supsi assente dal DOM, Ated singolo a piena larghezza (356px su viewport 375px = 95% container); `getComputedStyle` su `.jc-spotlight-text` = 22.5px a 375px di viewport (era 35.2px fisso).
- `npm run build` completato senza errori (2303 moduli, 4.41s).
- `eslint` sui 4 file: 0 errori nuovi — i 3 errori `no-unused-vars` su `motion` sono pre-esistenti (confermato via `git stash` da ogni subagent prima di editare), non introdotti da questa sessione.

## Deploy

Push su `claude/site-final-updates-ed071a` (origin) eseguito **dopo conferma esplicita dell'utente** — Vercel git-integration dovrebbe generare una preview automaticamente. Nessun deploy manuale via CLI Vercel (per evitare il rischio già documentato in memoria: push di sessione diversa su branch tracciato da git-integration può sovrascrivere un deploy manuale locale mai pushato).

## Cosa resta

- Riattivare Supsi quando il cliente conferma il nuovo layout Ated full-width (basta decommentare la riga in `bottomSlots`).
- Verificare la preview Vercel una volta pronta (URL non ancora noto al momento di scrivere questo handoff — il push è appena partito).
- Il mismatch testuale Offerte.jsx (screenshot cliente vs copy attuale del branch) andrebbe chiarito con Laura/Gabriele se rilevante, ma non blocca questi 4 fix (erano richieste di stile/layout, non di copy).
