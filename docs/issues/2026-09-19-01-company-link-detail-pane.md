# Issue 01 — Company name+logo clickable in offer detail pane

**Label:** afk
**Depends on:** none

## Slice

Frontend component (new) + wiring into `Offerte.jsx`'s split-view detail pane header. Crosses: new shared UI component, one page's rendering.

## Acceptance criteria

- In the split-view detail pane (`Offerte.jsx`, header above the job title), the company name and logo are wrapped in a single link to `/azienda/:slug` when `selectedJob.company.slug` exists.
- Hovering either the name or the logo triggers the same visual cue (both are part of one hit target, not two separately-hovering elements).
- When `selectedJob.company.slug` is absent (reserved employer), name+logo render exactly as today — plain, non-clickable, no hover treatment, no dead link.
- No change to any other part of the detail pane (apply button, meta chips, ad slots).

## First failing test

No component-test infrastructure exists in this repo (`webapp/package.json` has no `@testing-library/react` or jsdom environment — confirmed by grep, not assumed). Acceptance is browser-verified, matching this project's established practice for UI (see `feedback_verify_frontend_in_browser` in project memory): start the dev server, open `/offerte`, select a job with a known slugged company (e.g. any Randstad/Adecco ad), confirm via `read_page`/`computer` click that (a) the name is now inside the same `<a>`/`Link` as the logo, (b) clicking it navigates to `/azienda/<slug>`, (c) a reserved-employer ad ("Azienda Riservata") still renders plain text with no wrapping link — read its DOM directly, don't assume from one example.

## Files

- Create: `webapp/src/components/CompanyLink.jsx`
- Modify: `webapp/src/pages/Offerte.jsx` (~L717-804, the `selectedJob` header block: the fuchsia label at ~L719-723 and the logo block at ~L771-803)

## Design for `CompanyLink`

Props: `{ name, logo, slug, size }` (size to cover both the ~72px detail-pane logo and the smaller list-card one, needed by issue 02). Renders `<Link to={\`/azienda/${slug}\`}>` wrapping logo+name with a shared hover class when `slug` is truthy; renders a plain `<div>`/fragment with the same visual layout, no link, when `slug` is falsy. Hover treatment: reuse the existing pattern already in the codebase (`Vetrini.jsx`'s `group-hover:text-[var(--brand-fuchsia)]` on the "vedi tutte le aziende" CTA) — group-hover on the wrapping `<Link>`, color transition on the name text, subtle logo opacity/grayscale-to-color shift on hover (mirroring the existing card hover: `grayscale group-hover:grayscale-0` already used in `Vetrini.jsx` tile logos).

## Out of scope

- Wiring into the list card or the standalone offer sidebar (issues 02, 03).
- Anything about `website`/description (issues 04-06).
- Changing what happens when the link is clicked beyond navigation (no new modal, no tracking).

## Estimated context

Small — one new ~40-line component, one page edited in a single well-bounded region.
