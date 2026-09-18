# Issue 03 — Company name+logo clickable in standalone offer sidebar

**Label:** afk
**Depends on:** 01 (needs `CompanyLink` to exist; different file, so parallel with issue 02 once 01 lands)

## Slice

Frontend wiring only — reuse `CompanyLink` (issue 01) in `OffertaDettaglio.jsx`'s sidebar. Crosses: one page's sidebar block.

## Acceptance criteria

- The standalone offer page (`/offerta/:id`) sidebar shows company name+logo as one link to `/azienda/:slug`, same component/hover as issues 01-02.
- Reserved employers render plain, exactly as today (the existing `job.company?.slug ? <Link>...</Link> : <div>...</div>` branch for the logo-only case is replaced by `CompanyLink`'s own branch, not left duplicated alongside it).

## First failing test

No component-test infra (see issue 01). Browser-verified: open `/offerta/:id` for a known slugged company, confirm the sidebar name+logo navigate to `/azienda/:slug` on click; open one for a reserved employer, confirm plain non-clickable rendering.

## Files

- Modify: `webapp/src/pages/OffertaDettaglio.jsx` (~L290-328 — the logo block and the `<h3>{job.company?.name}</h3>` right below it)

## Out of scope

- Detail pane, list card (issues 01, 02).
- `website`/description (issues 04-06).

## Estimated context

Small — one page, reuses an already-built component.
