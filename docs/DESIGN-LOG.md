# Design Log

Decisions and rejected alternatives, one entry per design fork. Append-only.

---

## 2026-09-03 — Offerte page: split-view layout (Sprint 3)

**Context:** Gabriele (client) flagged the desktop offerte split-view as having "too much internal scroll" and cutting the last list card in half. Aligned via `/ae-align` before any code — see `docs/plans/2026-09-03-meeting-gabri-piano-implementazione.md` Task 3.1.

**Shared design concept:** Detail column (right) renders at natural height — no fixed height, no `overflow:hidden`, no `sticky`. That height sets the row. List column (left) shows only whole cards within that height — 5 initially, "Carica altro" reveals 5 more from the already-fetched `jobs` array (no new API call). If the list outgrows the detail's height, whitespace under the detail panel is accepted, not a defect. One scroll only: the page's.

**Budgeted resource:** visual consistency with the rest of the site — not payload, not latency. At any fork, the existing pattern wins over a novel-but-cleverer one.

### Rejected: real server-side pagination for "Carica altro"
- **Considered because:** initial user framing was "carica altro... così anche il payload ci gioca" — smaller initial network payload.
- **Rejected because:** `webapp/api/jobs.js` doesn't paginate a database — it scrapes Arca24's own listing pages (15 jobs/page upstream, 3 concurrent requests, per-page timeout, a stride-sampling algorithm tuned by measurement against live upstream behavior — see comments at `api/jobs.js:24-58`). A 5-job granularity doesn't exist natively upstream; building it would mean re-deriving offset/caching logic in a module whose pagination/sampling code has broken the companies showcase multiple times before (18/08, 29/08, 07/08 — see project memory). The actual bottleneck today is upstream scrape latency (~1s for the first page), not JSON transfer bytes for ~10 extra job objects — so the payload win would be marginal even if built.
- **Kept open:** re-propose as a separate, backend-scoped task only if network payload is measured as an actual bottleneck (Network tab, not assumption).

### Rejected: infinite scroll instead of a "Carica altro" button
- **Considered because:** it's a common pattern for revealing more list items without a click.
- **Rejected because:** client explicitly specified a button ("bottone carica altro"), and it keeps the "one scroll, page-level only" concept simpler — infinite scroll auto-triggering on viewport intersection is a second implicit scroll behavior layered on top of the page scroll, which is exactly what this redesign is removing elsewhere.

### Rejected: keep `sticky` on the detail column
- **Considered because:** it's the current behavior — detail pane stays pinned while the list scrolls past it.
- **Rejected because:** once list and detail share the same height (matched, capped by the 5-cards-then-load-more rule) and the page has one unified scroll, there's nothing left for the detail pane to "stay ahead of" — both columns start and end together. Sticky becomes dead code under the new model.

---

## 2026-09-17 — Offerte page: independent scroll (reverses 2026-09-03, same client)

**Context:** Gabriele reviewed the offerte split-view live in the 17/09 afternoon meeting (recording, see `docs/meeting-gabriele-2026-09-17.md`) and asked for two independent scrolls, list and detail: *"gli darei i due scroll indipendenti perché a me permette di scrollare da una parte e mantenendolo davanti l'offerta di lavoro"* — the exact opposite of the concept above, requested by the same client for what reads as the same underlying need (read one offer without losing your place in the list). Aligned via `/ae-align` before any code.

**Shared design concept:** Reintroduce independent scroll for list and detail columns (desktop only, `isMobile` unchanged) — but the two defects the 03/09 fix protected against are non-negotiable and now covered by regression tests written before the layout changes: (1) the list must never show a partial/cut card, at any scroll position or column height; (2) the page must not read as "too many scrolls" — exactly two, list and detail, each visually self-evident, not a third hidden one. Ad slots (`AdSlot`) get visually smaller within the meeting's "less invasive" ask, but never below the `minHeight` AdSense reserves for fill (Google CLS/fill mechanics, not arbitrary — see `AdSlot.jsx` comments). Company logos become links wherever currently not (`AziendeCheAssumono.jsx`, offer detail). Source of truth for every ambiguity is Gabriele's literal wording in the 17/09 transcript, not the agent's taste — no metrics exist for this slice.

**Budgeted resource:** literal conformance to the client's most recent spoken request, arbitrated against the two named regression constraints — not aesthetics, not data (none exists for this slice).

### Rejected: keep the 03/09 single-page-scroll concept, decline the new request
- **Considered because:** it's the settled, tested, already-aligned decision — reopening it invites the exact defects it fixed.
- **Rejected because:** the client's 17/09 request is explicit and more recent; treating a client decision as immutable once merged isn't what alignment is for. Handled instead by carrying the 03/09 constraints forward as regression tests on the new implementation, rather than by refusing the new request outright.

### Rejected: shrink `AdSlot` below Google's reserved `minHeight`
- **Considered because:** "meno invasive" was said in the same breath as the scroll request, and the naive read is "just make them smaller."
- **Rejected because:** the reserved height exists so a not-yet-filled unit doesn't collapse to zero and get skipped by Google's fill algorithm (see `AdSlot.jsx` comment on the 07.09 production measurement, and the 14/09 Auto Ads revenue incident in project memory). Shrinking below it risks revenue, not just layout — same class of risk already realized once this month.

### Rejected: folding "unify company description" (unblocked same day by Laura's email) into this slice
- **Considered because:** it surfaced in the same session and touches an adjacent page (`AziendaDettaglio.jsx`).
- **Rejected because:** different requirements source (an email link, not the meeting transcript), different budgeted resource, no shared code path established yet — bundling it would mean two design concepts arbitrated by two different resources in one slice. Tracked separately in `docs/meeting-gabriele-2026-09-17.md`.

### Rejected: extending this slice to mobile
- **Considered because:** consistency — why would mobile not also get a scroll improvement.
- **Rejected because:** Gabriele's request was specific to the two-column desktop layout; mobile already uses a different pattern (tab switch between list and detail, `isMobile` branch) that the request never addressed. Out of scope until asked for.

---

## 2026-09-19 — Company page: linkable name+logo, external site link, curated description fallback

**Context:** Gabriele, reviewing production screenshots (job listing card, job detail sidebar, split-view detail pane), asked why the company name text isn't clickable anywhere — only the logo is (17/09 fix) — and proposed going further: show the company's own external website, and a short description "presa dal sito e rielaborata" when we don't have one. This is the "unify company description" item explicitly deferred out of the 2026-09-17 entry above, now unblocked and picked up on its own. Aligned via `/ae-align` before any code.

**Shared design concept:** The company page is where everything we know about an employer collects (ads, "Lavora con noi" band, now also the external site) — and it becomes reachable from every place that today shows only the logo (name+logo merged into one link, one shared hover treatment). Any extra content (site, description) comes only from data Arca24 already provides when it provides it; where it doesn't, the field stays empty until hand-written in a dedicated session — never generated automatically, at build time or request time.

**Budgeted resource:** company-page reliability/latency. Tiebreaker: whenever a choice trades "more content" against "one more runtime fetch/dependency," zero-runtime-fetch wins, even if that means showing less.

**Constraints:** no recurring paid API for text generation; `_arca24.js` touched only to read the already-parsed-but-unused `website` field, nothing else; manual overrides live in a new static `webapp/api/_company-overrides.json` keyed by company `id`, read and merged only where the real field is empty — never overrides real data.

### Rejected: fetch the company's external site at request time to build the description live
- **Considered because:** it's the most literal reading of "presa dal sito e rielaborata" — go get it fresh each time.
- **Rejected because:** reliability/latency is the budgeted resource here; a slow or down third-party site would degrade or break a page this session explicitly does not want fragile. Same category of risk this project has already been burned by more than once with upstream scraping (see `arca24-company-index.md`, `jobroom-feed-resilience.md`).

### Rejected: auto-generate a description for every company missing `brand_description`, via a paid rewriting API
- **Considered because:** it would cover all ~34 companies uniformly with zero manual work.
- **Rejected because:** explicit constraint against recurring paid API cost, and against ever showing invented text about a paying client company. Falls back to "empty until hand-written" instead — slower coverage, zero fabrication risk.

### Rejected: keep waiting for Laura to supply real per-company descriptions
- **Considered because:** it was the original plan (see the 2026-09-17 deferral above and `docs/meeting-gabriele-2026-09-17.md`).
- **Rejected because:** blocked for months with no resolution in sight; the `website` field and real `brand_description` (fixed 2026-09-18) already cover some companies for free, and a manual-override file covers the rest without an external dependency on Laura's timeline.

### Deferred, not rejected: vetrina tiles (`Vetrini.jsx`) and a broader company-page redesign
- **Considered because:** raised as adjacent ideas during alignment, not ruled out.
- **Deferred because:** neither was part of the concrete ask (clickable name+logo, external site, description fallback); no shared code path or budgeted resource established for either yet. Revisit as its own aligned slice if requested.

---

## 2026-09-19 (later) — Company descriptions: `about` field, AI-drafted, human-reviewed, static

**Context:** production measurement showed the Arca24 band text is one identical 169-char boilerplate for all 34 employers: 0/34 real descriptions. The override `description` path could never fire (it was gated on `brand_description` being empty, and it never is).

**Decision (user-approved 2026-09-19):** loosens the "never auto-generated" rule above in one bounded way — descriptions are *drafted offline once* by Claude from each company's own public site (rewritten, facts only from that site, no superlatives), *reviewed by a person*, then committed as static text in `webapp/api/_company-overrides.js` (`about`, 28 companies with a site). Still no runtime fetch, no recurring paid API, no generation at build or request time. The 6 companies without a site get no block (no invention).

**Design fix:** new response field `about`, separate from `brand_description`; new "L'azienda" block above "Lavora con noi". The boilerplate stays only as the intro of the spontaneous-application block. Override file is `.js`, not the `.json` planned above.

**Known limits:** text is Italian-only (label is translated in it/en/de/fr, body is not); `about` is not in SSR (`api/azienda-ssr.js`) yet; JARM (owner of challengetires.com, confirmed from its terms) and S & M beauty (linked salon page does not name the company; drafted as "collegata al salone DESSANGE di Lugano") are the two lower-confidence entries; some `website` values are deep links (Adecco, Manpower `/en`, S & M beauty).

**Update (translations):** `about` in `_company-overrides.js` is now `{ it, en, de, fr }` (28 × 3 translations written by Claude from the reviewed Italian text, same facts, no additions). API returns `about` (Italian, used by the server snapshot) plus `about_i18n` (the other languages); the page picks `about_i18n[lang]` and falls back to Italian. The server-rendered snapshot stays Italian-only. Translations are not human-reviewed like the Italian drafts were; Laura can check DE/FR if wanted.
