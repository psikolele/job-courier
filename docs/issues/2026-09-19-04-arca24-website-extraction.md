# Issue 04 — Extract real `website` in the Arca24 company parser

**Label:** afk
**Depends on:** none (independent file from all UI issues)

## Slice

Backend: one more cheerio selector in an already-touched function, same shape as the 2026-09-18 `brand_title`/`brand_description` fix. Crosses: parser + its unit tests — ends in a real, non-empty `website` field on the API response.

## Context

`parseCompanyDetailFromHtml` in `webapp/api/_arca24.js` currently hardcodes `website: ''` always — this is NOT, despite how it was described verbally during alignment, an "already extracted but unused" field. It has never been parsed by the active (Arca24) code path. The non-Arca24 legacy parser (`webapp/api/company-detail.js`) does extract a real `website`, from a different HTML shape (`externalLinkCompany.php`'s `redirect` query param) — that path is correct already and **out of scope**, don't touch it.

Verified live (18/09/2026, `https://jobroom.jobcourier.ch/it/careers/3244683-adecco/profile`, same fetch headers `_arca24.js` uses): the "Lavora con noi" band, when present, renders a plain anchor under a "Sito web" label — a real `<a href="...">`, not a JSON-payload action like the button. Real markup:

```html
<span class="md-body-1"><span>Sito web </span></span>
<span class="md-body-2"><a href="https://www.adecco.com/it-ch/candidatura-spontanea" target="_blank"> www.adecco.com/it-ch/candidatura-spontanea</a></span>
```

Both spans are siblings inside the same `<p>`. `span.md-body-1` alone is not a unique selector — it's also the class used by the "Vuoi entrare a far parte..." band paragraph (see the existing `brand_description` selector, `.md-body-1.biggerfont` — note the extra `.biggerfont` class that disambiguates it). The "Sito web" label span carries no such distinguishing class, so disambiguate by text content instead.

## Acceptance criteria

- `parseCompanyDetailFromHtml(html, id, slug)` returns a non-empty `website` (the raw `href`, no resolution needed — it's already an absolute third-party URL, unlike `spontaneous_url` which needed `resolveArca24Url`) when the page's band carries a "Sito web" line.
- Returns `website: ''` (not a thrown error) when the band exists but carries no "Sito web" line, and when there's no band at all.
- Does not confuse the "Sito web" anchor with the "Candidatura spontanea" button's own link, or with any other anchor on the page (e.g. the "Annunci dell'azienda" button, which for the same company can point to a URL on the same real domain in some upstream configurations — don't just grab "the first external-looking anchor").
- No change to `brand_title`, `brand_description`, `spontaneous_url`, or anything else this function already returns.

## First failing test

Add to the `describe('parseCompanyDetailFromHtml')` block in `webapp/api/_arca24.test.js`, extending the existing `BANDA_CON_BOTTONE` fixture (or a sibling constant) with the real "Sito web" markup above:

```js
it('estrae il sito web reale della banda quando c\'è', () => {
  const html = BANDA_CON_BOTTONE.replace(
    '</script>',
    // (adjust to fit wherever the fixture's band paragraph closes — must land
    // inside the same textBlock region as brand_title/brand_description, per
    // the real markup shape above)
    '</script>'
  ) + `
    <span class="md-body-1"><span>Sito web </span></span>
    <span class="md-body-2"><a href="https://www.adecco.com/it-ch/candidatura-spontanea" target="_blank"> www.adecco.com/it-ch/candidatura-spontanea</a></span>`;
  const detail = parseCompanyDetailFromHtml(html, '3244683', 'adecco');
  expect(detail.website).toBe('https://www.adecco.com/it-ch/candidatura-spontanea');
});

it('nessuna riga Sito web: website resta vuoto, nessun errore', () => {
  const detail = parseCompanyDetailFromHtml(BANDA_SENZA_BOTTONE, '3244683', 'adecco');
  expect(detail.website).toBe('');
});
```

Run `cd webapp && npx vitest run api/_arca24.test.js -t "sito web"` first to confirm it fails (current code always returns `''`, so the first test above fails; the second already passes trivially — note that in the report, don't treat it as a sign of anything wrong).

## Files

- Modify: `webapp/api/_arca24.js` (`parseCompanyDetailFromHtml`, the block right after `brand_description`)
- Modify: `webapp/api/_arca24.test.js`

## Out of scope

- The legacy parser (`webapp/api/company-detail.js`) — already correct, don't touch.
- Resolving the URL against `ARCA24_HOST` — it's already absolute, don't wrap it in `resolveArca24Url`.
- Anything about the override file or `AziendaDettaglio.jsx` UI (issues 05, 06).

## Estimated context

Small — same file/function touched 2026-09-18, one more selector, mirrors an established pattern exactly.
