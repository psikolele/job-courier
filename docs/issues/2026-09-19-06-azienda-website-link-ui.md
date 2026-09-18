# Issue 06 — Show the company's external website on the company page

**Label:** afk
**Depends on:** 04 (real `website` from Arca24), 05 (override fallback) — needs both merged so the field it reads is trustworthy end-to-end; different file from both, so only a data dependency, not a file conflict.

## Slice

Frontend: one new UI element in `AziendaDettaglio.jsx` reading a field the API now populates for real. Crosses: API field (already done by 04+05) → UI render → visible, clickable link.

## Acceptance criteria

- On `/azienda/:slug`, when `detail.website` is non-empty (real or override), a link is shown (e.g. near the header or inside the existing "Lavora con noi" band, next to or above the "Candidatura spontanea" button — reuse the existing section's visual style, don't invent a new card/box for one link).
- When `detail.website` is empty, nothing renders for it — no empty label, no broken layout gap.
- The link opens in a new tab (`target="_blank" rel="noopener noreferrer"`, matching the existing `spontaneous_url` anchor's own attributes in the same file).
- Label text comes from a new i18n key `company.visit_website`, added to all 4 locale files (`it`, `en`, `de`, `fr`) — not hardcoded Italian.

## First failing test

No component-test infra (see issue 01). Browser-verified: with issue 04 shipped, open `/azienda/3244683` (Adecco — has a real "Sito web" line as of 18/09/2026) and confirm the website link renders and points to the right URL; open a company page for an employer with no band at all and confirm nothing renders for this section (no broken layout).

## Files

- Modify: `webapp/src/pages/AziendaDettaglio.jsx` (inside or near the existing "Lavora con noi" block, ~L254-283)
- Modify: `webapp/src/locales/it.json`, `en.json`, `de.json`, `fr.json` (add `company.visit_website`)

## Out of scope

- Redesigning the "Lavora con noi" band's layout beyond adding this one link.
- Anything in `Offerte.jsx`/`OffertaDettaglio.jsx` (issues 01-03).

## Estimated context

Small — one page, one new small conditional block, 4 one-line locale additions.
