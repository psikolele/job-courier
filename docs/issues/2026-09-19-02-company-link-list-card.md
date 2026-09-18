# Issue 02 — Company name+logo clickable in offer list cards

**Label:** afk
**Depends on:** 01 (same file, `Offerte.jsx`, and reuses `CompanyLink`)

## Slice

Frontend wiring only — reuse `CompanyLink` (issue 01) in the list row of `Offerte.jsx`. Crosses: one page's list-rendering section.

## Acceptance criteria

- Each card in the offer list shows company name+logo as one link to `/azienda/:slug`, same hover treatment as issue 01, via the shared `CompanyLink` component (no re-implementation of the link/hover logic).
- Reserved employers render plain, exactly as today.
- List scrolling/selection behavior (clicking a card to select it in the detail pane) is unaffected — the `CompanyLink` click must not also trigger card selection when only the company name/logo is clicked (verify: clicking the company name inside a card navigates to the company page, NOT just selects the card in the split view).

## First failing test

No component-test infra (see issue 01). Browser-verified: open `/offerte`, in the list column click a card's company name — must navigate to `/azienda/:slug`, not merely select that card in the detail pane. Click elsewhere on the same card (title, location chip) — must still select it in the detail pane as before.

## Files

- Modify: `webapp/src/pages/Offerte.jsx` (list row, ~L580-620 — the company name span and its nearby logo)

## Out of scope

- Detail pane, sidebar (issues 01, 03).
- `website`/description (issues 04-06).

## Estimated context

Small — one page, one already-designed component to reuse, plus the click-event-bubbling check above (the one real risk in this issue).
