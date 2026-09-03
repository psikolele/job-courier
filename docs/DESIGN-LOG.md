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
