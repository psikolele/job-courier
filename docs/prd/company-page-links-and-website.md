# PRD — Company name/logo links + external site + description fallback

## 1. Problem

The company's name is never clickable anywhere on the site — only its logo is, and only where a slug exists (job list card, split-view detail pane, standalone offer page sidebar). A candidate reading a job ad who wants to know more about the employer has no obvious way in; a company's own website is nowhere on their JobCourier page even when Arca24 exposes it. Gabriele raised this directly from production screenshots.

## 2. Shared design concept

The company page is where everything we know about an employer collects (ads, "Lavora con noi" band, now also the external site) — and it becomes reachable from every place that today shows only the logo (name+logo unified, one link, shared elegant hover). Any extra content (site, description) comes only from data Arca24 already provides when it provides it; where it doesn't, the field stays empty until hand-written in a dedicated session — never generated automatically, at build time or request time.

## 3. Budgeted resource

Company-page reliability/latency. **Rule:** when two options are viable, pick the one that spends less runtime-fetch risk — a request-time dependency on a third-party site always loses to a pre-computed or absent field.

## 4. Proposed solution

- **Shared link component** (`CompanyLink`, new): wraps logo + name as one `<Link>` to `/azienda/:slug`, one hover treatment, falls back to plain (non-clickable) rendering when there's no slug (reserved employers). Wired into the 3 places that today link only the logo.
- **`website` extraction** (`_arca24.js`): the upstream "Lavora con noi" band carries a plain `<a>` under a "Sito web" label — a direct anchor, not a JSON-payload action like the button — parsed the same way `brand_title`/`brand_description` already are. **Correction from alignment:** this field is not "already extracted and unused" as scoped verbally — it's currently hardcoded `''` in the active Arca24 parser, same as `brand_title` was until 2026-09-18. Same class of fix, one more selector, no new risk shape.
- **Manual override file** (`webapp/api/_company-overrides.js`, new): a hand-maintained `{ [companyId]: { description?, website? } }` map, merged into the API response only where the real field is empty. Never overwrites real data.
- **`AziendaDettaglio.jsx`**: renders the website link (real or override) alongside the existing band/button.

## 5. User stories

1. As a candidate viewing the offer split-view pane, I can click the company name (not just the logo) to reach its company page.
2. As a candidate viewing the offer list, I can click a card's company name to reach its company page.
3. As a candidate viewing a standalone offer page, I can click the sidebar company name to reach its company page.
4. As a candidate on any of the above, when the employer is reserved ("Azienda Riservata", no slug), I see plain text — no dead link, no broken hover.
5. As a candidate on any of the above, name+logo share one visual hover cue so it reads as one clickable unit, not two.
6. As a candidate on the company page, when Arca24 exposes the employer's own website, I can see and click it.
7. As a candidate on the company page, when no real website/description exists, I see nothing fabricated — no placeholder, no guessed text.
8. As the operator, I can add a hand-written description/website for a specific company by editing one static file, with no rebuild-time dependency on a third-party fetch.
9. As the operator, my hand-written override never overwrites a real Arca24 value that later becomes available (real data always wins).
10. As a non-Italian visitor, the new "visit website" label is translated in all 4 site languages (it/en/de/fr).
11. As the operator, the existing candidatura-spontanea flow (2026-09-18 fix) keeps working unmodified — this work only adds fields/links alongside it.
12. As the operator, no page in this slice makes a new request to a third-party domain at request time — verified by reading the diff, not just by running it once.

## 6. Decisions already taken (see `DESIGN-LOG.md`, 2026-09-19 entry)

- Zero-runtime-fetch wins whenever content-richness and reliability trade off.
- No recurring paid API for text generation.
- `_arca24.js` touched only for the `website` selector — no other change.
- Overrides live in a new static file, keyed by company `id`, gap-filling only.
- Reused instead of rebuilt: the 2026-09-18 `brand_title`/`brand_description` extraction pattern (same textBlock region, same cheerio approach) — `website` is a fourth field off the same band, not a new subsystem.

## 7. Rejected alternatives (see `DESIGN-LOG.md` for full reasoning)

- Fetch the company's external site at request time to build a description live — rejected, breaks the reliability budget.
- Auto-generate missing descriptions via a paid rewriting API — rejected, recurring cost + fabrication risk on a paying client's page.
- Keep waiting on Laura for real per-company descriptions — rejected, blocked for months with no ETA; real data + override file cover it without that dependency.
- Vetrina tiles (`Vetrini.jsx`) and a full company-page redesign — deferred, not part of this ask.

## 8. Affected modules

- `webapp/src/components/CompanyLink.jsx` (new)
- `webapp/src/pages/Offerte.jsx` (detail pane ~L717-804, list card ~L580-620)
- `webapp/src/pages/OffertaDettaglio.jsx` (sidebar ~L290-328)
- `webapp/src/pages/AziendaDettaglio.jsx` (website link rendering)
- `webapp/api/_arca24.js` (`parseCompanyDetailFromHtml` — `website` selector)
- `webapp/api/_arca24.test.js`
- `webapp/api/_company-overrides.js` (new)
- `webapp/api/company-detail.js` (merge overrides into the response)
- `webapp/api/company-detail.test.js` (new, if none exists — verify)
- `webapp/src/locales/{it,en,de,fr}.json` (`company.visit_website` key)

## 9. Out of scope

- Any request-time fetch of a third-party site, anywhere.
- `Vetrini.jsx` / vetrina tiles.
- Redesigning `AziendaDettaglio.jsx`'s layout beyond adding the website link.
- The legacy (non-Arca24) parser in `webapp/api/company-detail.js` beyond the override-merge step — its own `website`/`brand_description` extraction is already correct and untouched.
- Populating the override file with real content for any specific company — this PRD ships the mechanism, empty.

## 10. Open questions

- None blocking. The override file ships empty (`{}`); populating it for a specific company is a future, separate, on-request task (per alignment: hand-written only, on explicit ask).
