# Loader "Monogram Draw" — Design & Analisi

**Data:** 2026-06-15
**Progetto:** Job Courier (jobcourier.ch)
**Autore:** Claude Code + Emanuele Serra
**Stato:** Design approvato in parte (3 decisioni chiave registrate) — in attesa review spec
**Branch:** `feature/blog-section`

---

## 1. Obiettivo

Creare un'animazione **loader** brandizzata che compare ad **ogni cambio pagina** del sito Job Courier.
Il loader si progetta/renderizza in **Remotion** (studio di design) e si spedisce in produzione come
componente runtime **CSS/framer-motion leggero**. L'animazione scelta è il **Monogram Draw**: il
monogramma JC si rivela su sfondo navy, scatta il quadrato fuchsia, appare il wordmark `JOBCOURIER.CH`.

---

## 2. Analisi a monte (ricerca eseguita)

### 2.1 Brand Identity (Brand Guidelines v1.0)
- **Palette:** Navy `#050B2B`, Fuchsia `#FF1F7A`, White `#FFFFFF`, Gray `#F6F7FB`. Il fuchsia è
  **accento preciso**, mai dominante su grandi aree.
- **Direzione ufficiale:** `MINIMAL · PREMIUM · EDITORIALE`. Principio: *"La coerenza è prioritaria
  rispetto all'effetto grafico."*
- **Divieti:** gradient, effetti 3D, glow invasivi, decori, font non-brand, layout affollati.
- **Segni distintivi:** dot fuchsia (marchio del wordmark), numerazioni forti, linee/frecce sottili
  fuchsia, micro-indicatori (`00/07`, dots di progressione), quadrato fuchsia.
- **Font:** Satoshi (Black 900 — display/H1), Playfair Display Italic (H2 editoriale), Inter (body).

### 2.2 Logo
- `webapp/public/logo-full.svg` — monogramma JC + wordmark + quadrato fuchsia (lockup orizzontale).
- `webapp/public/logo-square.svg` — **monogramma JC** (J + arco "courier" + quadrato/poligono fuchsia),
  usato come icona/favicon. È la base del Monogram Draw.
- Colori reali nei file: navy `#0c1032`, fuchsia `#d22f69` / `#e1337b` (leggermente diversi dai token
  brand; in produzione si usano i token `--brand-navy` / `--brand-fuchsia`).

### 2.3 Idioma di moto già esistente nel codice (riuso obbligatorio)
In `webapp/src/index.css` esiste già il linguaggio d'animazione del brand:
- `jcMoveDot` / `jcMoveDotCCW` — dot fuchsia 6px con glow (`box-shadow: 0 0 8px rgba(255,31,122,.85)`)
  che percorre il perimetro di un rettangolo (4s linear). Componente: `components/ui/moving-dot-card.jsx`.
- Linee sottili a 12px dai bordi, counter formato svizzero `777'000+`, `marquee` 40s, `shiny-animation`.

Il loader **estende** questo idioma (glow contenuto, fuchsia puntuale), non ne inventa uno nuovo.

### 2.4 Psicologia delle modifiche di Gabriele (da meeting log + MEMORY.md)
Profilo coerente emerso dai meeting (27/03, 10/04, 20/05, 26/05) e dai task:
- **Premium/credibile, mai giocoso** — niente estetica startup/crypto/gaming.
- **Rimozione del rumore** — odia le bordature esterne, preferisce righe 1px appena percettibili.
- **Velocità** — ha chiesto esplicitamente di *velocizzare* lo slider homepage.
  → Implicazione vincolante: il loader deve essere **rapido (~700ms) e discreto**. Un loader lento o
  vistoso contraddirebbe tutta la sua direzione.
- **Conversione** — registration wall, popup 2s: ogni elemento ha uno scopo.
- **Standardizzazione** — un solo stile per bottoni/elementi.

### 2.5 Realtà tecnica
- SPA **React 19 + Vite 7 + React Router v7**; stack già con **framer-motion 12** + **gsap 3.14**.
- I cambi rotta sono **istantanei** (nessuna rete per la pagina; solo i fetch dati *dentro*
  `Offerte`/`OffertaDettaglio`). Il loader è quindi un **overlay di transizione brandizzato**
  (performance percepita + momento di brand), non un'attesa di rete reale.
- Aggancio naturale: `App.jsx`, accanto a `<ScrollToTop>`, su cambio `pathname`.
- **Remotion NON è installato** nello stack web → resta in un progetto separato.

### 2.6 Changelog / Second Brain
- `docs/MEMORY.md` (wiki persistente) e claude-mem (50+ osservazioni giugno) confermano: nessun loader
  di transizione globale esiste oggi; le pagine hanno solo loading state locali (`Offerte`, `Filters`,
  `OffertaDettaglio`, `BlogArticolo`).

---

## 3. Decisioni registrate (utente, 2026-06-15)

| # | Decisione | Scelta |
|---|-----------|--------|
| 1 | Ruolo di Remotion | **Studio di design + runtime CSS leggero** (Strada A) |
| 2 | Concept del loader | **Monogram Draw** |
| 3 | Trigger al cambio pagina | **Durata fissa breve** (~700ms) |

Alternative valutate e scartate: `@remotion/player` embeddato (peso bundle + mount-cost contro il
"veloce" di Gabriele); render → WebM/GIF overlay (limiti alpha Safari, meno controllo).
Concept scartati: "Courier Dot / The Delivery" (dot che percorre una rotta) e "Pulse + Progress".

---

## 4. Architettura

```
remotion/                         # progetto Remotion separato — lo "studio"
├── package.json                  # @remotion/cli (npx remotion studio / render)
├── remotion.config.ts
└── src/
    ├── index.ts                  # registerRoot
    ├── Root.tsx                  # <Composition> 700ms @ 30fps (21 frame); 512x512 + variante wide
    ├── JobCourierLoader.tsx      # composition: monogramma + quadrato fuchsia + wordmark
    └── tokens.ts                 # navy/fuchsia/white, durate, easing (sorgente condivisa coi token CSS)
   # output build: public/loader-preview.mp4  (per approvazione Gabriele + social/hero)

webapp/src/components/ui/
└── RouteLoader.jsx               # runtime PRODUZIONE — CSS/framer-motion, ZERO dipendenze Remotion

webapp/src/index.css              # @keyframes del Monogram Draw (estende l'idioma jc-dot)
webapp/src/App.jsx                # aggancio overlay su cambio pathname
```

**Sync Remotion ↔ runtime:** i due ambienti condividono gli stessi valori (token colore, durate fasi,
easing) documentati in questo spec e in `tokens.ts`. Remotion è la fonte visiva/di anteprima; il runtime
CSS ne è la trascrizione fedele. Non c'è import di codice Remotion nel bundle web.

---

## 5. Animazione (Monogram Draw)

### 5.1 Timeline (~700ms, una volta per cambio rotta)
| ms | frame @30fps | evento |
|----|--------------|--------|
| 0–250   | 0–7   | reveal del monogramma JC (white su navy) via **mask-wipe direzionale** |
| 250–380 | 7–11  | quadrato fuchsia: scale `0 → 1.15 → 1` (overshoot leggero) |
| 380–520 | 11–16 | wordmark `JOBCOURIER.CH` fade-up (+6px → 0), `.CH` in fuchsia |
| 520–620 | 16–19 | hold |
| 620–700 | 19–21 | exit: fade-out dell'overlay |

Easing: `cubic-bezier(.6,0,.2,1)` per reveal/scatto; lineare per i fade.

### 5.2 Tecnica di reveal del logo — DECISIONE: **mask-wipe**
Il logo reale è un **fill complesso** (path multi-subpath), non uno stroke singolo. Due tecniche:
- **Mask-wipe direzionale** ✅ *(scelta)* — si rivela il fill navy/bianco con una maschera animata
  (`clip-path` o `<mask>` SVG). Più pulito e premium su fill complessi; nessun artefatto di tracciamento.
- **Stroke-then-fill** *(alternativa)* — outline dei path con stroke + `stroke-dashoffset`, poi fill.
  Dà l'effetto "penna" ma su path multi-subpath può risultare visivamente affollato.
  Tenere come fallback se Gabriele preferisce esplicitamente l'effetto disegno-a-mano.

### 5.3 Composizione visiva
- Sfondo: navy pieno `--brand-navy` (versione logo "su scuro": monogramma bianco + accenti fuchsia).
- Monogramma JC centrato (~120–150px), wordmark sotto (lockup verticale). Wordmark **incluso** (rafforza
  riconoscibilità) ma reso configurabile via prop `showWordmark`.
- Micro-indicatore opzionale `00 / 01` in alto a destra (coerente coi micro-indicatori brand) —
  configurabile, default off per massima sobrietà.
- Glow fuchsia limitato al valore già in uso (`0 0 8–10px rgba(255,31,122,.85–.9)`), nessun gradient.

---

## 6. Integrazione runtime

- `RouteLoader.jsx`: overlay full-screen (`position: fixed`, `inset:0`, `z-index` sopra navbar/footer),
  sfondo `--brand-navy`. Visibile per **700ms a durata fissa**, poi smonta.
- `App.jsx`: `useEffect` su `pathname` (pattern identico a `ScrollToTop`) che attiva il loader ad ogni
  cambio rotta. Stato gestito con un piccolo hook `useRouteLoader()` (timer 700ms, cleanup su unmount).
- Niente blocco permanente di scroll/eventi: l'overlay copre visivamente ma si rimuove a fine durata;
  durante i 700ms `pointer-events` sull'overlay per evitare click fantasma.
- Prima navigazione/refresh: il loader può fungere anche da splash iniziale (stessa animazione).

---

## 7. Accessibilità

- `prefers-reduced-motion: reduce` → niente mask-wipe/scatto: solo **fade istantaneo** del logo statico
  (≤150ms), nessun movimento. Niente flash luminosi.
- Overlay con `aria-hidden="true"` (decorativo) e `aria-busy` sul container app durante la transizione.
- Contrasto: monogramma bianco su navy = AAA. Durata breve = nessun trigger fotosensibilità.

---

## 8. Vincoli brand — checklist di conformità

- [x] Solo navy + fuchsia + white.
- [x] Fuchsia come accento puntuale (quadrato + `.CH` + glow dot esistente), mai area dominante.
- [x] Zero gradient, zero 3D, glow ≤ valore già in uso nel brand.
- [x] Durata breve (~700ms) = il "veloce" richiesto da Gabriele.
- [x] Estende l'idioma `jc-dot` esistente (coerenza > effetto).
- [x] Tipografia Satoshi Black per il wordmark.

---

## 9. Out of scope (YAGNI)

- Loader diversi per pagina (un solo loader uniforme).
- Progress bar legata a rete reale (trigger = durata fissa, non data-tied).
- Suoni / feedback aptico.
- Embedding `@remotion/player` in produzione.

---

## 10. Prossimi passi

1. Review di questo spec (utente).
2. `writing-plans` → piano d'implementazione dettagliato:
   - Setup progetto `remotion/` + composition `JobCourierLoader.tsx` + render `loader-preview.mp4`.
   - `RouteLoader.jsx` + `@keyframes` in `index.css` + hook `useRouteLoader`.
   - Aggancio in `App.jsx` + `prefers-reduced-motion`.
   - Test (vitest) sul mount/unmount del loader e sul timer.
3. Approvazione MP4 di anteprima da parte di Gabriele prima del merge.
