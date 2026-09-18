# Candidatura Spontanea — Company Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the already-built "Candidatura spontanea" button on the company detail page (`AziendaDettaglio.jsx`) actually show in production, by extracting `brand_title`, `brand_description`, and `spontaneous_url` from the real Arca24 "viso" HTML instead of the hardcoded empty strings currently returned.

**Architecture:** Two small, additive changes to existing files, no new files. `_externalApply.js` gets a second extractor function (`findExternalApplyCompanyHref`), sibling to the existing `findExternalApplyHref`, for the company-page apply button whose real target lives only in an embedded JSON payload (`/job/externalLinkCompany.php?redirect=...`), not in a static DOM anchor. `_arca24.js`'s `parseCompanyDetailFromHtml` then uses it, plus two new cheerio selectors, to populate the three fields it currently hardcodes empty. No frontend changes — `AziendaDettaglio.jsx`'s existing rendering gate is correct as-is and just needs real data.

**Tech Stack:** Node.js (Vercel serverless functions), cheerio (server-side HTML parsing), vitest (tests). No new dependencies.

---

## Ground truth (verified live, 18/09/2026)

Fetched `https://jobroom.jobcourier.ch/it/careers/3244683-adecco/profile` server-side (same UA/headers `_arca24.js` uses) and inspected the raw HTML. It contains, today, for every company with a "Lavora con noi" band configured:

- Two `h2.md-title` elements: the first is the company **name**, nested inside `[itemprop="hiringOrganization"]` — must be excluded. The second, with an extra `alignCenter` class, is the **band heading** ("Lavora con noi").
- One `.md-body-1.biggerfont` element: the band's body paragraph.
- The "Candidatura spontanea" button has **no static href** — it's a Vue router-link pointing at the current page itself. Its real destination lives only in a JSON blob embedded in a `<script>` tag on the page, as an object shaped like `{"label":"Candidatura spontanea","action":{"link":"/job/externalLinkCompany.php?redirect=<url-encoded target>&company_name=<slug>&company_id=<id>&language=it_IT"}}` — a root-relative path (no scheme/host), unlike the job-apply payload which carries an absolute URL under the key `"url"` instead of `"link"`.

This is why `_arca24.js` never populates these fields today: nobody ever wired up a reader for that JSON blob for the *company* page (only the *job ad* page has one, in `_externalApply.js`).

---

## Task 1: `findExternalApplyCompanyHref` in `_externalApply.js`

**Files:**
- Modify: `webapp/api/_externalApply.js`
- Test: `webapp/api/_externalApply.test.js`

### Step 1: Write the failing tests

Append this to the end of `webapp/api/_externalApply.test.js`:

```js
describe('findExternalApplyCompanyHref', () => {
    // Trimmed copy of the real payload served for Adecco (id 3244683) on 18.09.2026 —
    // the company-page apply button is built the same way the job-ad one is (see
    // findExternalApplyHref above): from JSON, not from a static anchor. Unlike the
    // job-ad payload, the link here is root-relative (no scheme/host) and lives under
    // the key `link`, not `url`.
    const PAGINA_AZIENDA_VISO = `<!doctype html><html><body><div id="app"></div><script>
window.__DATA__ = {"actions":[{"label":"Annunci dell'azienda","action":{"link":"/it/careers/3244683-adecco/jobs"}},
{"icon":"arrow-up-right-from-square","label":"Candidatura spontanea","fluo":true,"action":{"link":"/job/externalLinkCompany.php?redirect=https%3A%2F%2Fwww.adecco.com%2Fit-ch%2Fcandidatura-spontanea%3Futm_source%3Dvisojobcourier&company_name=adecco&company_id=3244683&language=it_IT"}}]};
</script></body></html>`;

    const PAGINA_SENZA_BOTTONE = `<!doctype html><html><body><div id="app"></div><script>
window.__DATA__ = {"actions":[{"label":"Annunci dell'azienda","action":{"link":"/it/careers/3244683-adecco/jobs"}}]};
</script></body></html>`;

    const trova = (html, id) => findExternalApplyCompanyHref(html, cheerio.load(html), id);

    it('legge il link dal payload JSON della pagina azienda', () => {
        const href = trova(PAGINA_AZIENDA_VISO, '3244683');
        expect(href).toContain('externalLinkCompany.php');
        const target = new URL(href, 'https://jobroom.jobcourier.ch').searchParams.get('redirect');
        expect(decodeURIComponent(target)).toBe('https://www.adecco.com/it-ch/candidatura-spontanea?utm_source=visojobcourier');
    });

    it('non spedisce il candidato da un\'altra azienda quando company_id non combacia', () => {
        expect(trova(PAGINA_AZIENDA_VISO, '9999999')).toBe('');
    });

    it('senza id resta il comportamento di sempre', () => {
        expect(trova(PAGINA_AZIENDA_VISO)).toContain('externalLinkCompany.php');
    });

    it('nessun bottone candidatura spontanea sulla pagina: nessun link', () => {
        expect(trova(PAGINA_SENZA_BOTTONE, '3244683')).toBe('');
    });

    it('regge una pagina vuota o assente', () => {
        expect(findExternalApplyCompanyHref('', null)).toBe('');
        expect(findExternalApplyCompanyHref(null, null)).toBe('');
    });
});
```

In `webapp/api/_externalApply.test.js`, update the existing import line (currently `import { findExternalApplyHref } from './_externalApply.js';`) to:

```js
import { findExternalApplyHref, findExternalApplyCompanyHref } from './_externalApply.js';
```

### Step 2: Run tests to verify they fail

Run: `cd webapp && npx vitest run api/_externalApply.test.js`
Expected: FAIL — `findExternalApplyCompanyHref is not a function` (or similar import error), since it doesn't exist yet.

### Step 3: Implement `findExternalApplyCompanyHref`

In `webapp/api/_externalApply.js`, the current `parametro` helper assumes an absolute URL:

```js
function parametro(url, nome) {
  try {
    return new URL(url).searchParams.get(nome);
  } catch {
    return null;
  }
}
```

The company-page payload's link is root-relative (no scheme/host), so `new URL(url)` alone would throw for every candidate and silently fall through the `catch`. Give it a dummy base so relative URLs still parse — an absolute input ignores the base entirely, so this doesn't change behavior for the existing job-apply case:

```js
function parametro(url, nome) {
  try {
    return new URL(url, 'https://x.invalid').searchParams.get(nome);
  } catch {
    return null;
  }
}
```

Then add the new exported function, right after `findExternalApplyHref`:

```js
/**
 * The apply link of the "Candidatura spontanea" button on a company profile page.
 *
 * Same problem as `findExternalApplyHref`, different endpoint and shape: the
 * company page's button action carries its target under `link` as a root-relative
 * path (`/job/externalLinkCompany.php?redirect=...`), not under `url` as an
 * absolute one. `id` here is the company id (`company_id` in the payload), not a
 * job id — a mismatch means the payload identified its own company and it isn't
 * the one asked for, so nothing is returned rather than another employer's link.
 */
export function findExternalApplyCompanyHref(html, $, id) {
  const anchor = $ ? $('a[href*="externalLinkCompany.php"]').first() : null;
  const fromAnchor = anchor && anchor.length > 0 ? anchor.attr('href') : '';
  if (fromAnchor) return fromAnchor;

  const trovati = (String(html || '').match(/\/job\/externalLinkCompany\.php\?[^"'\s\\]*/gi) || [])
    .map((u) => u.replace(/&amp;/gi, '&'));
  if (trovati.length === 0) return '';

  if (id !== undefined && id !== null && String(id) !== '') {
    const mio = trovati.find((u) => parametro(u, 'company_id') === String(id));
    if (mio) return mio;
    if (trovati.some((u) => parametro(u, 'company_id') !== null)) return '';
  }

  return trovati[0];
}
```

### Step 4: Run tests to verify they pass

Run: `cd webapp && npx vitest run api/_externalApply.test.js`
Expected: PASS, all tests in the file including the new `describe('findExternalApplyCompanyHref')` block.

### Step 5: Commit

```bash
git add webapp/api/_externalApply.js webapp/api/_externalApply.test.js
git commit -m "feat(company-page): add findExternalApplyCompanyHref for spontaneous-application button

The button's real target lives only in an embedded JSON payload
(/job/externalLinkCompany.php), not a static anchor — same problem
findExternalApplyHref already solves for job ads, different endpoint
and payload shape (root-relative link, company_id instead of
job_post_id).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 2: Wire real data into `parseCompanyDetailFromHtml`

**Files:**
- Modify: `webapp/api/_arca24.js:13` (import) and `webapp/api/_arca24.js:1181-1210` (`parseCompanyDetailFromHtml`)
- Test: `webapp/api/_arca24.test.js`

### Step 1: Write the failing tests

Append this to the `describe('parseCompanyDetailFromHtml')` block in `webapp/api/_arca24.test.js` (after the existing two `it(...)` blocks, before the closing `});` at line 285):

```js
  // Trimmed copy of the real markup for a company with a "Lavora con noi" band
  // (Adecco, id 3244683, verified live 18.09.2026). Two h2.md-title on purpose:
  // the first is the company name inside [itemprop="hiringOrganization"] and must
  // be excluded, the second (with alignCenter) is the band heading.
  const BANDA_CON_BOTTONE = `
    <h1>Adecco Annunci totali: 4317</h1>
    <div itemprop="hiringOrganization"><h2 class="md-title">Adecco</h2></div>
    <h2 class="alignCenter nomargin md-title">Lavora con noi</h2>
    <p class="alignCenter"><span class="md-body-1 biggerfont">Vuoi entrare a far parte del nostro team? Consulta le nostre posizioni aperte o inviaci la tua candidatura compilando il form online, saremo lieti di ricevere il tuo CV!</span></p>
    <script>
    window.__DATA__ = {"actions":[{"label":"Candidatura spontanea","action":{"link":"/job/externalLinkCompany.php?redirect=https%3A%2F%2Fwww.adecco.com%2Fit-ch%2Fcandidatura-spontanea%3Futm_source%3Dvisojobcourier&company_name=adecco&company_id=3244683&language=it_IT"}}]};
    </script>`;

  const BANDA_SENZA_BOTTONE = `
    <h1>Adecco Annunci totali: 4317</h1>
    <div itemprop="hiringOrganization"><h2 class="md-title">Adecco</h2></div>
    <h2 class="alignCenter nomargin md-title">Lavora con noi</h2>
    <p class="alignCenter"><span class="md-body-1 biggerfont">Vuoi entrare a far parte del nostro team?</span></p>`;

  it('estrae titolo, testo e link della candidatura spontanea quando la banda esiste', () => {
    const detail = parseCompanyDetailFromHtml(BANDA_CON_BOTTONE, '3244683', 'adecco');
    expect(detail.brand_title).toBe('Lavora con noi');
    expect(detail.brand_description).toContain('Vuoi entrare a far parte del nostro team');
    expect(detail.spontaneous_url).toContain('https://jobroom.jobcourier.ch/job/externalLinkCompany.php');
    expect(decodeURIComponent(new URL(detail.spontaneous_url).searchParams.get('redirect')))
      .toBe('https://www.adecco.com/it-ch/candidatura-spontanea?utm_source=visojobcourier');
  });

  it('non prende il nome azienda come titolo della banda', () => {
    const detail = parseCompanyDetailFromHtml(BANDA_CON_BOTTONE, '3244683', 'adecco');
    expect(detail.brand_title).not.toBe('Adecco');
  });

  it('banda presente ma nessun bottone candidatura spontanea: titolo e testo si, link vuoto', () => {
    const detail = parseCompanyDetailFromHtml(BANDA_SENZA_BOTTONE, '3244683', 'adecco');
    expect(detail.brand_title).toBe('Lavora con noi');
    expect(detail.brand_description).toContain('Vuoi entrare a far parte del nostro team');
    expect(detail.spontaneous_url).toBe('');
  });

  it('nessuna banda sulla pagina: tutti e tre i campi vuoti, nessun errore', () => {
    const detail = parseCompanyDetailFromHtml('<h1>FISIOTERAPIA IGEA SAGL Annunci totali:</h1>', '3244807', '');
    expect(detail.brand_title).toBe('');
    expect(detail.brand_description).toBe('');
    expect(detail.spontaneous_url).toBe('');
  });

  it('company_id nel link non combacia con lid richiesto: link scartato', () => {
    const detail = parseCompanyDetailFromHtml(BANDA_CON_BOTTONE, '9999999', 'altra-azienda');
    expect(detail.spontaneous_url).toBe('');
  });
```

### Step 2: Run tests to verify they fail

Run: `cd webapp && npx vitest run api/_arca24.test.js -t "parseCompanyDetailFromHtml"`
Expected: FAIL — `brand_title`/`brand_description`/`spontaneous_url` come back as `''` (or whatever the current hardcoded/meta-description value is) for the first four new tests.

### Step 3: Implement the extraction

In `webapp/api/_arca24.js:13`, change the import to also pull in the new function:

```js
import { findExternalApplyHref, findExternalApplyCompanyHref } from './_externalApply.js';
```

Then replace the body of `parseCompanyDetailFromHtml` (currently `webapp/api/_arca24.js:1181-1210`):

```js
export function parseCompanyDetailFromHtml(html, id, slug) {
  const $ = cheerio.load(html);

  const heading = $('h1, h2').first().text().replace(/\s+/g, ' ').trim();
  // The count is missing, not zero, when the employer has no open position — so the
  // digits are optional here, or the label itself ends up glued to the company name.
  const name = heading.replace(/Annunci totali\s*:\s*\d*\s*$/, '').trim() || null;

  const jobs = parseJobsFromHtml(html);
  const location = jobs[0]?.location || '';

  return {
    id,
    name,
    slug: slug || slugify(name || ''),
    logo: $('[itemprop="image"]').first().attr('content') || companyLogo(id, name || ''),
    location,
    sector: '',
    brand_title: '',
    brand_description: $('[itemprop="description"]').first().text().replace(/\s+/g, ' ').trim(),
    website: '',
    spontaneous_url: '',
    // Same reason the fetch above stopped using it: `company/profile?uiid=` lands on an
    // arbitrary employer, so this link — the "vai al profilo" the visitor clicks — has to
    // carry the id in the path too. Falls back to the old shape only when there is no slug
    // to build one with, which is the case where nothing better exists.
    jobroom_url: `${ARCA24_HOST}${companyProfilePath(id, slug, name)}`,
    jobs,
  };
}
```

with:

```js
export function parseCompanyDetailFromHtml(html, id, slug) {
  const $ = cheerio.load(html);

  const heading = $('h1, h2').first().text().replace(/\s+/g, ' ').trim();
  // The count is missing, not zero, when the employer has no open position — so the
  // digits are optional here, or the label itself ends up glued to the company name.
  const name = heading.replace(/Annunci totali\s*:\s*\d*\s*$/, '').trim() || null;

  const jobs = parseJobsFromHtml(html);
  const location = jobs[0]?.location || '';

  // The "Lavora con noi" band, when the employer has one configured, renders as a
  // second `h2.md-title` — the first is always the company name itself, nested
  // inside `[itemprop="hiringOrganization"]`, and must be excluded or the band
  // title would just repeat the company name.
  const brand_title = $('h2.md-title')
    .filter((_, el) => $(el).parents('[itemprop="hiringOrganization"]').length === 0)
    .first().text().replace(/\s+/g, ' ').trim();
  const brand_description = $('.md-body-1.biggerfont').first().text().replace(/\s+/g, ' ').trim();

  // The "Candidatura spontanea" button has no static href — see findExternalApplyCompanyHref.
  let spontaneous_url = '';
  const spontaneousHref = findExternalApplyCompanyHref(html, $, id);
  if (spontaneousHref) {
    try { spontaneous_url = new URL(spontaneousHref, ARCA24_HOST).toString(); } catch {}
  }

  return {
    id,
    name,
    slug: slug || slugify(name || ''),
    logo: $('[itemprop="image"]').first().attr('content') || companyLogo(id, name || ''),
    location,
    sector: '',
    brand_title,
    brand_description,
    website: '',
    spontaneous_url,
    // Same reason the fetch above stopped using it: `company/profile?uiid=` lands on an
    // arbitrary employer, so this link — the "vai al profilo" the visitor clicks — has to
    // carry the id in the path too. Falls back to the old shape only when there is no slug
    // to build one with, which is the case where nothing better exists.
    jobroom_url: `${ARCA24_HOST}${companyProfilePath(id, slug, name)}`,
    jobs,
  };
}
```

(`website` stays `''` on purpose — the frontend, `AziendaDettaglio.jsx`, never reads it.)

### Step 4: Run tests to verify they pass

Run: `cd webapp && npx vitest run api/_arca24.test.js`
Expected: PASS — every test in the file, including all five new ones and the two pre-existing `parseCompanyDetailFromHtml` tests (unaffected, since their minimal fixtures have no `h2.md-title`/`.md-body-1.biggerfont`/`externalLinkCompany.php` to match).

### Step 5: Run the full test suite

Run: `cd webapp && npx vitest run`
Expected: PASS — no regressions elsewhere (nothing else calls `parseCompanyDetailFromHtml` or reads its `brand_title`/`brand_description`/`spontaneous_url` fields except `AziendaDettaglio.jsx`, which is not covered by this suite's unit tests and is verified manually in Task 3).

### Step 6: Commit

```bash
git add webapp/api/_arca24.js webapp/api/_arca24.test.js
git commit -m "fix(company-page): extract brand_title/brand_description/spontaneous_url from Arca24 HTML

parseCompanyDetailFromHtml hardcoded these three fields empty, so the
already-built 'Candidatura spontanea' button on AziendaDettaglio.jsx
never showed in production even though upstream carries the data for
every company with a 'Lavora con noi' band configured.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3: Verify live in the browser

**Files:** none (verification only, no code changes)

- [ ] **Step 1: Start the dev server**

Use the preview tool to start the `webapp` dev server (Vite) — it does not serve `/api/*`, so this step only confirms the page shell and lets you reach production's API from the browser's Network tab if needed. The real check is against production directly, since `/api/company-detail` is a Vercel serverless function.

- [ ] **Step 2: Open the real company page in the browser**

Navigate to `https://jobcourier.ch/azienda/3244683` (Adecco — confirmed to have a "Lavora con noi" band as of 18/09/2026).

- [ ] **Step 3: Confirm the section renders**

Use `read_page` or `get_page_text` to confirm the page now shows a "Lavora con noi" (or whatever `brand_title` came back as) section with a "Candidatura spontanea" button, where before the fix it showed nothing between the header and "Annunci attivi".

- [ ] **Step 4: Click the button and confirm the destination**

Click the "Candidatura spontanea" button (or read its resolved `href` via `read_page`) and confirm it points at `https://jobroom.jobcourier.ch/job/externalLinkCompany.php?redirect=...adecco.com...` — not a 404, not another company's page.

- [ ] **Step 5: Spot-check a company with no band**

Pick a company id known to have no "Lavora con noi" configured (any employer whose `jobroom_url` profile page you load via `curl` shows no `md-body-1.biggerfont` — check with the same raw-HTML technique used during brainstorming) and confirm its JobCourier company page still renders cleanly with no empty gap or broken section where the band would be — same as before this fix, since `brand_title`/`brand_description` both come back empty for it.

No commit for this task — it's verification of Tasks 1–2, already committed.
