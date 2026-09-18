# Issue 05 — Manual company-description/website override file

**Label:** afk
**Depends on:** none (independent file from all other issues — merge point is `company-detail.js`, never `_arca24.js`)

## Slice

Backend: new static data file + a merge step in the API handler. Crosses: data file, handler logic, response shape — ends in a real, testable end-to-end behavior (an overridden company shows hand-written content; a non-overridden one is untouched).

## Context

Per alignment, hand-written content for a company missing real Arca24 data must live in a static file, gap-filling only (never overwrites a real value), with **zero build-time or request-time cost beyond reading a local module** — no JSON-file `import assert`, no new dependency. Follow the existing convention for hand-maintained static data in this API folder: `webapp/api/_orphan-employers-snapshot.js` is a plain `.js` module exporting a literal — do the same here, not a `.json` file.

## Acceptance criteria

- `webapp/api/_company-overrides.js` exports a plain object, e.g. `export const overrides = {};`, keyed by company `id` (string), each value optionally `{ description?: string, website?: string }`.
- In `webapp/api/company-detail.js`'s handler, after `detail` is obtained (from either the legacy path or `fetchArca24CompanyDetail`), merge: `detail.brand_description = detail.brand_description || overrides[detail.id]?.description || '';` and the same pattern for `website`. A real, non-empty value from Arca24 is never replaced.
- With an empty `overrides` object (the shipped state), the response is byte-identical to before this change for every company.
- With a test override entry present (added only in the test, not shipped), a company whose real `brand_description`/`website` is empty picks up the override value; a company whose real value is non-empty ignores the override entirely.

## First failing test

New file `webapp/api/company-detail.test.js` (none exists today — confirmed by listing `webapp/api/`). Mock the module's dependency on `_company-overrides.js` (e.g. `vi.mock('./_company-overrides.js', () => ({ overrides: { '999': { description: 'Test override', website: 'https://example.com' } } }))`) and on `_arca24.js`'s `isArca24Enabled`/`fetchCompanyDetail` (mirror the mocking style already used in `_arca24.test.js` for `node-fetch`), then:

```js
it('usa il testo di override solo quando il dato reale è vuoto', async () => {
  // arrange fetchArca24CompanyDetail to resolve { id: '999', brand_description: '', website: '', ... }
  // act: call the handler with req.query = { id: '999', slug: '' }
  // assert: res.json was called with brand_description: 'Test override', website: 'https://example.com'
});

it('non sovrascrive un valore reale con loverride', async () => {
  // arrange fetchArca24CompanyDetail to resolve { id: '999', brand_description: 'Testo vero', website: '', ... }
  // assert: brand_description stays 'Testo vero', website picks up the override
});
```

Run `cd webapp && npx vitest run api/company-detail.test.js` first to confirm both fail (file/tests don't exist yet).

## Files

- Create: `webapp/api/_company-overrides.js`
- Modify: `webapp/api/company-detail.js` (handler, right before `res.status(200).json(...)`, both the Arca24 branch and the legacy branch)
- Create: `webapp/api/company-detail.test.js`

## Out of scope

- Populating `_company-overrides.js` with any real company's content — ships as `{}`.
- Any UI change (issue 06 reads the resulting `website` field, this issue only makes it correctly present in the API response).
- Touching `_arca24.js` — the merge lives entirely in `company-detail.js`.

## Estimated context

Small-medium — new test file from scratch (no existing pattern for mocking this specific handler), but the merge logic itself is a few lines.
