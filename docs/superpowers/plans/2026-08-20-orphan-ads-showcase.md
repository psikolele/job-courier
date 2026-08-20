# Aziende con annunci scollegati in vetrina — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** far comparire in vetrina le aziende che hanno annunci online ma non agganciati alla propria anagrafica Arca24, riconoscendole dal nome che l'annuncio dichiara nei dati strutturati.

**Architecture:** un generatore a build-time scandaglia le pagine recenti del listing globale, isola gli annunci che nel listing non portano alcun link azienda, ne apre il dettaglio per leggere `itemprop="hiringOrganization"` e scrive un file di nomi normalizzati. `fetchCompanies` legge quel file e passa i nomi a `withHasJobs`, che li tratta come già dimostrati hiring, esattamente come oggi fa con gli id provenienti dal feed. Nessuna richiesta in più sul percorso che la home aspetta.

**Tech Stack:** Node 20 ESM, cheerio, vitest. Nessuna dipendenza nuova.

---

## Contesto: perché serve

Caso Dinamic Hub (id `3244828`), 20/08/2026. L'annuncio `6740371` è online e valido fino al 14/11, ma:

- nella riga del listing globale **non c'è alcun link azienda**, quindi `parseJobsFromHtml` la classifica `Azienda Riservata` (`_arca24.js:192`);
- nella pagina di dettaglio il nome esiste, ma solo dentro un blocco `class="hidden"` con `itemprop="hiringOrganization"`, che `parseJobDetailFromHtml` legge (`_arca24.js:260`);
- `company/jobs?uiid=3244828` risponde **senza `.resultstring`**, perché elenca solo gli annunci agganciati all'anagrafica. La sonda `probeHasJobs` risponde quindi `false` e la vetrina esclude l'azienda.

Vincolo misurato, da non riaprire: la ricerca upstream **non** indicizza quel nome nascosto. `?keyword=Dinamic Hub` restituisce zero risultati, quindi la scorciatoia "una query per azienda non hiring" non funziona. L'unica via è passare dagli annunci.

Costo del listing: `/it/careers/latest_jobs?page=N` risponde 200 con 15 annunci per pagina, 8006 annunci totali al 20/08. Scandagliare tutto sarebbe 534 richieste. Il piano ne scandaglia 120 (i 1800 annunci più recenti), che coprono il caso d'uso reale — un'azienda nuova che ha appena pubblicato — e restano dentro il tempo di una build.

## File Structure

| File | Responsabilità |
|---|---|
| `webapp/api/_arca24.js` (modifica) | esporta `normalizeCompanyName`; `withHasJobs` e `fetchCompanies` accettano e propagano i nomi noti |
| `webapp/api/_orphan-employers.js` (nuovo) | scansione listing + lettura dettagli, produce i nomi dei datori con annunci scollegati |
| `webapp/api/_orphan-employers-snapshot.js` (nuovo, generato) | l'elenco dei nomi normalizzati, rigenerato a ogni build |
| `webapp/scripts/generate-orphan-employers-snapshot.mjs` (nuovo) | genera il file sopra, fallisce in silenzio lasciando il committato |
| `webapp/api/jobs.js` (modifica) | `enrichReservedCompanies` allinea anche slug, dominio e logo, non solo il nome |
| `webapp/api/_orphan-employers.test.js` (nuovo) | test della scansione |
| `webapp/api/_arca24.test.js` (modifica) | test di `normalizeCompanyName` e del match per nome |
| `webapp/api/jobs.test.js` (modifica) | test dell'enrich completo |

---

### Task 1: Normalizzazione dei nomi azienda

Il nome nell'indice aziende e quello nel microdato dell'annuncio non coincidono carattere per carattere: l'indice arriva doppiamente encodato (`S &amp;amp; M beauty SA`) e le forme societarie variano (`SA`, `S.A.`, `Sagl`). Il confronto va fatto su una forma normalizzata, mai sulla stringa grezza.

**Files:**
- Modify: `webapp/api/_arca24.js` (aggiungere **dopo** `RESERVED_COMPANY`, riga 912: la costante serve alla funzione e in JS un `const` non è utilizzabile prima della sua riga)
- Test: `webapp/api/_arca24.test.js`

- [ ] **Step 1: Write the failing test**

In coda a `webapp/api/_arca24.test.js`:

```js
import { normalizeCompanyName } from './_arca24.js';

describe('normalizeCompanyName', () => {
  it('ignora maiuscole, spazi e punteggiatura', () => {
    expect(normalizeCompanyName('Dinamic Hub')).toBe('dinamic hub');
    expect(normalizeCompanyName('  DINAMIC   HUB  ')).toBe('dinamic hub');
  });

  it('decodifica le entità, anche doppie', () => {
    expect(normalizeCompanyName('S &amp;amp; M beauty SA')).toBe('s & m beauty');
  });

  it('toglie la forma societaria in coda', () => {
    expect(normalizeCompanyName('Work & Work SA')).toBe('work & work');
    expect(normalizeCompanyName('Work & Work S.A.')).toBe('work & work');
    expect(normalizeCompanyName('Nene e Associati Sagl')).toBe('nene e associati');
  });

  it('restituisce stringa vuota per input non utile', () => {
    expect(normalizeCompanyName('')).toBe('');
    expect(normalizeCompanyName(undefined)).toBe('');
    expect(normalizeCompanyName('Azienda Riservata')).toBe('');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd webapp && npx vitest run api/_arca24.test.js -t normalizeCompanyName`
Expected: FAIL, `normalizeCompanyName is not a function`

- [ ] **Step 3: Write minimal implementation**

In `webapp/api/_arca24.js`, subito dopo la riga 912 (`export const RESERVED_COMPANY = 'Azienda Riservata';`):

```js
// I due lati del confronto arrivano da sorgenti diverse: l'indice aziende consegna i
// titoli doppiamente encodati (`S &amp;amp; M beauty SA`), il microdato dell'annuncio li
// consegna puliti. Le forme societarie compaiono in una fonte e non nell'altra, quindi
// vanno tolte da entrambe o il confronto fallisce su aziende che sono la stessa.
//
// `Azienda Riservata` non è un datore: è il segnaposto che il listing usa quando la riga
// non porta azienda, e mapparlo darebbe un nome finto a tutti gli annunci scollegati.
const COMPANY_SUFFIXES = /\s+(s\.?\s?a\.?|s\.?a\.?g\.?l\.?|s\.?r\.?l\.?|ag|gmbh|sarl|inc|ltd)\.?$/;

export function normalizeCompanyName(value) {
  let out = String(value ?? '');
  // Due passate: l'indice consegna `&amp;amp;`, che una sola decodifica lascia `&amp;`.
  for (let i = 0; i < 2; i++) {
    out = out
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }
  out = out.toLowerCase().replace(/\s+/g, ' ').trim();
  if (!out || out === RESERVED_COMPANY.toLowerCase()) return '';
  return out.replace(COMPANY_SUFFIXES, '').trim();
}
```

Verificato il 20/08/2026: `RESERVED_COMPANY` è dichiarato a riga 912, quindi `normalizeCompanyName` va **sotto** di essa. Metterla accanto a `slugify` (riga 370) produce un `ReferenceError` a runtime, non un errore di lint: i test lo prenderebbero, ma solo quelli che esercitano il ramo con nome vuoto.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd webapp && npx vitest run api/_arca24.test.js -t normalizeCompanyName`
Expected: PASS, 4 test

- [ ] **Step 5: Commit**

```bash
git add webapp/api/_arca24.js webapp/api/_arca24.test.js
git commit -m "feat(arca24): add normalizeCompanyName for cross-source employer matching"
```

---

### Task 2: Raccolta dei datori con annunci scollegati

**Files:**
- Create: `webapp/api/_orphan-employers.js`
- Test: `webapp/api/_orphan-employers.test.js`

- [ ] **Step 1: Write the failing test**

Crea `webapp/api/_orphan-employers.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./_arca24.js', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, fetchHtml: vi.fn(), fetchJobDetail: vi.fn() };
});

import { fetchHtml, fetchJobDetail } from './_arca24.js';
import { collectOrphanEmployerNames } from './_orphan-employers.js';

/** Una riga di listing come la rende il portale: con o senza link azienda. */
const row = (id, title, companyHref) => `
  <div class="resultstring">
    <a href="/it/careers/jobad/${id}-${title}">${title}</a>
    ${companyHref ? `<a href="${companyHref}">Adecco</a>` : ''}
    <div class="valueCell">Svizzera, Ticino, Bellinzona</div>
  </div>`;

beforeEach(() => {
  vi.mocked(fetchHtml).mockReset();
  vi.mocked(fetchJobDetail).mockReset();
});

describe('collectOrphanEmployerNames', () => {
  it('apre solo gli annunci senza azienda nel listing e ne legge il nome', async () => {
    vi.mocked(fetchHtml).mockResolvedValue(
      row('6740371', 'pulizie', null) + row('6742220', 'ebeniste', '/it/careers/3244683-adecco/profile')
    );
    vi.mocked(fetchJobDetail).mockResolvedValue({ company: { name: 'Dinamic Hub' } });

    const names = await collectOrphanEmployerNames({ pages: 1, concurrency: 1 });

    expect(names).toEqual(['dinamic hub']);
    expect(vi.mocked(fetchJobDetail)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(fetchJobDetail)).toHaveBeenCalledWith('6740371');
  });

  it('scarta i dettagli che restano anonimi', async () => {
    vi.mocked(fetchHtml).mockResolvedValue(row('6740371', 'pulizie', null));
    vi.mocked(fetchJobDetail).mockResolvedValue({ company: { name: 'Azienda Riservata' } });

    expect(await collectOrphanEmployerNames({ pages: 1, concurrency: 1 })).toEqual([]);
  });

  it('non duplica lo stesso datore trovato su più annunci', async () => {
    vi.mocked(fetchHtml).mockResolvedValue(row('1', 'a', null) + row('2', 'b', null));
    vi.mocked(fetchJobDetail).mockResolvedValue({ company: { name: 'Dinamic Hub' } });

    expect(await collectOrphanEmployerNames({ pages: 1, concurrency: 1 })).toEqual(['dinamic hub']);
  });

  it('una pagina che fallisce non ferma la scansione', async () => {
    vi.mocked(fetchHtml)
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValueOnce(row('6740371', 'pulizie', null));
    vi.mocked(fetchJobDetail).mockResolvedValue({ company: { name: 'Dinamic Hub' } });

    expect(await collectOrphanEmployerNames({ pages: 2, concurrency: 1 })).toEqual(['dinamic hub']);
  });

  it('rispetta il tetto di dettagli aperti', async () => {
    vi.mocked(fetchHtml).mockResolvedValue(
      row('1', 'a', null) + row('2', 'b', null) + row('3', 'c', null)
    );
    vi.mocked(fetchJobDetail).mockImplementation(async (id) => ({ company: { name: `Azienda ${id}` } }));

    const names = await collectOrphanEmployerNames({ pages: 1, concurrency: 1, maxDetails: 2 });

    expect(names).toHaveLength(2);
    expect(vi.mocked(fetchJobDetail)).toHaveBeenCalledTimes(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd webapp && npx vitest run api/_orphan-employers.test.js`
Expected: FAIL, `Failed to resolve import "./_orphan-employers.js"`

- [ ] **Step 3: Write minimal implementation**

Crea `webapp/api/_orphan-employers.js`:

```js
// I datori che hanno annunci online ma non agganciati alla propria anagrafica Arca24.
//
// Perché esistono: la sonda `probeHasJobs` legge `company/jobs?uiid=<id>`, che elenca solo
// gli annunci collegati alla scheda azienda. Un annuncio pubblicato senza quel collegamento
// è invisibile lì — misurato il 20/08/2026 su Dinamic Hub (azienda 3244828, annuncio
// 6740371, valido fino al 14/11): pagina azienda vuota, annuncio regolarmente online.
//
// Dove sta il nome: nella riga di listing non c'è, e `parseJobsFromHtml` ripiega su
// "Azienda Riservata". Nella pagina di dettaglio c'è, dentro un blocco `class="hidden"`
// con `itemprop="hiringOrganization"` che Arca scrive per i motori di ricerca. È l'unica
// fonte: la ricerca upstream non indicizza quel campo (`?keyword=Dinamic Hub` → zero
// risultati, verificato il 20/08/2026), quindi non esiste una query che li trovi.
//
// Costo: una richiesta per pagina di listing più una per annuncio anonimo. Girano a
// build-time, mai su una richiesta utente.
import { fetchHtml, fetchJobDetail, parseJobsFromHtml, normalizeCompanyName, RESERVED_COMPANY } from './_arca24.js';

const LANG = 'it';

// 15 annunci per pagina: 120 pagine sono i 1800 annunci più recenti. Il catalogo intero
// (8006 al 20/08/2026) sarebbe 534 richieste, e non serve: il caso da coprire è l'azienda
// nuova che ha appena pubblicato, che sta in cima all'ordinamento per data.
export const DEFAULT_PAGES = 120;
export const DEFAULT_CONCURRENCY = 6;

// Guardia contro il caso in cui il portale smetta di linkare le aziende nel listing: senza
// tetto, una pagina interamente anonima trasformerebbe la scansione in migliaia di aperture.
export const DEFAULT_MAX_DETAILS = 150;

/**
 * Nomi normalizzati dei datori che hanno almeno un annuncio non agganciato all'anagrafica.
 * Le pagine che falliscono vengono saltate: una scansione parziale vale più di nessuna.
 */
export async function collectOrphanEmployerNames({
  pages = DEFAULT_PAGES,
  concurrency = DEFAULT_CONCURRENCY,
  maxDetails = DEFAULT_MAX_DETAILS,
} = {}) {
  const orphanIds = [];
  const seenIds = new Set();

  for (let start = 1; start <= pages; start += concurrency) {
    const batch = Array.from(
      { length: Math.min(concurrency, pages - start + 1) },
      (_, i) => start + i
    );
    const htmls = await Promise.all(
      batch.map((page) =>
        fetchHtml(`/${LANG}/careers/latest_jobs?page=${page}`).catch(() => null)
      )
    );
    for (const html of htmls) {
      if (!html) continue;
      for (const job of parseJobsFromHtml(html)) {
        if (job.company?.name !== RESERVED_COMPANY) continue;
        if (!job.jobroom_id || seenIds.has(job.jobroom_id)) continue;
        seenIds.add(job.jobroom_id);
        orphanIds.push(job.jobroom_id);
      }
    }
  }

  const names = new Set();
  const targets = orphanIds.slice(0, maxDetails);
  if (orphanIds.length > targets.length) {
    console.warn(`orphan employers: ${orphanIds.length} annunci anonimi, aperti i primi ${targets.length}.`);
  }

  for (let start = 0; start < targets.length; start += concurrency) {
    const batch = targets.slice(start, start + concurrency);
    const details = await Promise.all(batch.map((id) => fetchJobDetail(id).catch(() => null)));
    for (const detail of details) {
      const name = normalizeCompanyName(detail?.company?.name);
      if (name) names.add(name);
    }
  }

  return [...names];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd webapp && npx vitest run api/_orphan-employers.test.js`
Expected: PASS, 5 test

- [ ] **Step 5: Commit**

```bash
git add webapp/api/_orphan-employers.js webapp/api/_orphan-employers.test.js
git commit -m "feat(arca24): collect employers whose ads are not linked to their profile"
```

---

### Task 3: Snapshot generato a build-time

**Files:**
- Create: `webapp/scripts/generate-orphan-employers-snapshot.mjs`
- Create: `webapp/api/_orphan-employers-snapshot.js`
- Modify: `webapp/package.json:8` (script `build`)

- [ ] **Step 1: Creare il file committato di partenza**

Crea `webapp/api/_orphan-employers-snapshot.js` con il caso già verificato dentro, così la funzionalità è utile dal primo deploy anche prima della prima generazione:

```js
// Generated by scripts/generate-orphan-employers-snapshot.mjs — do not edit by hand.
//
// Datori con almeno un annuncio online non agganciato alla propria anagrafica Arca24.
// Nomi normalizzati con normalizeCompanyName. Letto da api/_arca24.js per marcare hiring
// aziende che la sonda su `company/jobs` non può vedere. Vedi api/_orphan-employers.js.
export const generatedAt = '2026-08-20T00:00:00.000Z';
export const names = [
  "dinamic hub"
];
```

- [ ] **Step 2: Scrivere il generatore**

Crea `webapp/scripts/generate-orphan-employers-snapshot.mjs`:

```js
// Aggiorna api/_orphan-employers-snapshot.js. Eseguito prima di vite build.
//
// Qualunque errore lascia in pace il file committato: un elenco vecchio di un giorno vale
// qualcosa, uno vuoto toglie dalla vetrina aziende che ci stavano legittimamente.
import { writeFileSync } from 'node:fs';
import { collectOrphanEmployerNames } from '../api/_orphan-employers.js';

const OUT = new URL('../api/_orphan-employers-snapshot.js', import.meta.url);

try {
  const names = await collectOrphanEmployerNames();

  // Zero non si distingue da "scansione fallita in silenzio", e sovrascrivere con zero
  // significherebbe perdere i datori già noti. Chi ha davvero smesso di pubblicare esce
  // comunque dalla vetrina: il match per nome vale solo se l'azienda è nel roster e il
  // roster viene ricalcolato a ogni richiesta.
  if (names.length === 0) {
    throw new Error('nessun datore con annunci scollegati: sospetto scansione fallita');
  }

  const body = `// Generated by scripts/generate-orphan-employers-snapshot.mjs — do not edit by hand.
//
// Datori con almeno un annuncio online non agganciato alla propria anagrafica Arca24.
// Nomi normalizzati con normalizeCompanyName. Letto da api/_arca24.js per marcare hiring
// aziende che la sonda su \`company/jobs\` non può vedere. Vedi api/_orphan-employers.js.
export const generatedAt = '${new Date().toISOString()}';
export const names = ${JSON.stringify(names, null, 2)};
`;
  writeFileSync(OUT, body);
  console.log(`orphan employers snapshot: ${names.length} datori`);
} catch (error) {
  console.warn(`orphan employers snapshot: non aggiornato (${error.message}) — resta quello committato.`);
}
```

- [ ] **Step 3: Agganciare alla build**

In `webapp/package.json`, riga 8, sostituire il valore di `"build"` con:

```json
"build": "node scripts/generate-sitemap.mjs && node scripts/generate-companies-snapshot.mjs && node scripts/generate-orphan-employers-snapshot.mjs && node scripts/generate-jobs-snapshot.mjs && node scripts/generate-blog-snapshot.mjs && vite build && node scripts/prerender-canonicals.mjs"
```

- [ ] **Step 4: Eseguire il generatore contro il portale vero**

Run: `cd webapp && node scripts/generate-orphan-employers-snapshot.mjs`
Expected: `orphan employers snapshot: N datori` con N ≥ 1, e `dinamic hub` presente nel file.

Verifica: `grep -c '"' api/_orphan-employers-snapshot.js` e `grep -i "dinamic hub" api/_orphan-employers-snapshot.js`

Se la riga di Dinamic Hub non c'è, l'annuncio è uscito dalle 120 pagine scandagliate o non è più online: controllare `https://jobroom.jobcourier.ch/it/careers/jobad/6740371-addetta-alle-pulizie-bellinzona` prima di alzare `DEFAULT_PAGES`.

- [ ] **Step 5: Commit**

```bash
git add webapp/scripts/generate-orphan-employers-snapshot.mjs webapp/api/_orphan-employers-snapshot.js webapp/package.json
git commit -m "feat(build): generate the orphan-employers snapshot before each build"
```

---

### Task 4: Match per nome dentro withHasJobs

**Files:**
- Modify: `webapp/api/_arca24.js:753-776` (`withHasJobs`) e `webapp/api/_arca24.js:778-838` (`fetchCompanies`)
- Test: `webapp/api/_arca24.test.js`

- [ ] **Step 1: Write the failing test**

In coda a `webapp/api/_arca24.test.js`:

```js
import { withHasJobs } from './_arca24.js';

describe('withHasJobs con nomi noti', () => {
  it('marca hiring chi è nei nomi noti, senza sondarlo', async () => {
    const companies = [
      { id: '3244828', name: 'Dinamic Hub' },
      { id: '9999999', name: 'Nessun Annuncio' },
    ];

    const out = await withHasJobs(companies, new Set(), new Set(['dinamic hub']));

    expect(out.find((c) => c.id === '3244828').has_jobs).toBe(true);
  });

  it('confronta sulla forma normalizzata, non sulla stringa grezza', async () => {
    const out = await withHasJobs(
      [{ id: '1', name: 'Work &amp;amp; Work SA' }],
      new Set(),
      new Set(['work & work'])
    );

    expect(out[0].has_jobs).toBe(true);
  });
});
```

Nota: `withHasJobs` non è esportato oggi. Lo Step 3 lo esporta.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd webapp && npx vitest run api/_arca24.test.js -t "nomi noti"`
Expected: FAIL, `withHasJobs is not a function`

- [ ] **Step 3: Write minimal implementation**

In `webapp/api/_arca24.js`, sostituire la firma e il preambolo di `withHasJobs` (riga 753, oggi `async function withHasJobs(companies, known = new Set()) {`, senza `export`) con:

```js
/**
 * `known` holds ids already proven to be hiring, so they cost no request. Everyone the
 * job feed named is in it by definition: the feed is a list of open positions, so an
 * employer appearing there has at least the ad that put it there.
 *
 * `knownNames` does the same job for employers the probe structurally cannot see: their
 * ads exist but carry no link back to the profile, so `company/jobs` renders nothing for
 * them. They are matched on the normalized name because that is the only identifier the
 * two sides share — see api/_orphan-employers.js for how the list is built.
 */
export async function withHasJobs(companies, known = new Set(), knownNames = new Set()) {
  const out = [];
  const toProbe = [];
  for (const c of companies) {
    if (known.has(c.id) || knownNames.has(normalizeCompanyName(c.name))) {
      out.push({ ...c, has_jobs: true });
    } else {
      toProbe.push(c);
    }
  }
```

Il resto del corpo della funzione resta invariato.

Poi, in `fetchCompanies` (riga 838 circa), sostituire:

```js
  const withStatus = withJobStatus ? await withHasJobs(companies, fromFeed) : companies;
```

con:

```js
  const withStatus = withJobStatus
    ? await withHasJobs(companies, fromFeed, new Set(orphanEmployerNames))
    : companies;
```

e aggiungere l'import in cima al file, accanto agli altri:

```js
import { names as orphanEmployerNames } from './_orphan-employers-snapshot.js';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd webapp && npx vitest run api/_arca24.test.js`
Expected: PASS, tutti i test del file

- [ ] **Step 5: Verificare che non si sia creato un ciclo di import**

`_orphan-employers.js` importa da `_arca24.js`, e ora `_arca24.js` importa dallo snapshot. Lo snapshot non importa nulla, quindi il ciclo non esiste. Confermarlo eseguendo l'intera suite:

Run: `cd webapp && npm test`
Expected: PASS, 232 test o più, nessun errore di modulo

- [ ] **Step 6: Commit**

```bash
git add webapp/api/_arca24.js webapp/api/_arca24.test.js
git commit -m "feat(showcase): treat employers with unlinked ads as hiring"
```

---

### Task 5: Allineare slug, dominio e logo nell'enrich

Difetto emerso durante la diagnosi del 20/08: sulla ricerca, l'annuncio `6740371` torna con `name: "Dinamic Hub"` ma `slug: "azienda-riservata"` e `domain: "aziendariservata.ch"`. Il passaggio di arricchimento recupera il nome e lascia indietro il resto, quindi il link alla scheda azienda punta a uno slug che non esiste.

**Files:**
- Modify: `webapp/api/jobs.js:62-93` (`enrichReservedCompanies`)
- Test: `webapp/api/jobs.test.js`

- [ ] **Step 1: Leggere l'implementazione attuale**

Run: `cd webapp && sed -n '60,95p' api/jobs.js`

Serve per vedere come il ramo `jobs.map` ricompone l'oggetto: il prossimo step lo sostituisce e va scritto sopra il codice reale, non sopra un'ipotesi.

- [ ] **Step 2: Write the failing test**

In coda a `webapp/api/jobs.test.js`:

```js
import { enrichReservedCompanies } from './jobs.js';

describe('enrichReservedCompanies', () => {
  it('allinea slug e dominio, non solo il nome', async () => {
    const jobs = [{
      id: '6740371',
      company: { name: 'Azienda Riservata', slug: 'azienda-riservata', domain: 'aziendariservata.ch', logo: '' },
    }];

    const out = await enrichReservedCompanies(jobs);

    expect(out[0].company.name).toBe('Dinamic Hub');
    expect(out[0].company.slug).toBe('dinamic-hub');
    expect(out[0].company.domain).toBe('dinamichub.ch');
  });
});
```

`jobs.js` importa il dettaglio come `fetchJobDetail as fetchArca24JobDetail` (riga 10), quindi il mock va messo sul nome **esportato**, che è `fetchJobDetail`. Se il file di test non lo mocka già, aggiungere in cima:

```js
vi.mock('./_arca24.js', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, fetchJobDetail: vi.fn(async () => ({ company: { name: 'Dinamic Hub', slug: 'dinamic-hub', logo: '', arca24_id: null } })) };
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd webapp && npx vitest run api/jobs.test.js -t enrichReservedCompanies`
Expected: FAIL, `slug` è ancora `azienda-riservata`

- [ ] **Step 4: Write minimal implementation**

Nel `jobs.map` di `enrichReservedCompanies`, ricomporre l'azienda per intero invece del solo nome:

```js
  return jobs.map(job => {
    const detail = byId.get(job.id);
    const name = detail?.company?.name;
    if (!name || name === 'Azienda Riservata') return job;

    // Il nome da solo non basta: slug e dominio restano quelli del segnaposto e il link
    // alla scheda azienda punta a una pagina che non esiste.
    return {
      ...job,
      company: {
        ...job.company,
        name,
        slug: detail.company.slug || slugify(name),
        domain: name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.ch',
        logo: detail.company.logo || job.company.logo,
        arca24_id: detail.company.arca24_id ?? job.company.arca24_id,
      },
    };
  });
```

Se `slugify` non è già importato in `jobs.js`, aggiungerlo all'import esistente da `./_arca24.js`.

- [ ] **Step 5: Run test to verify it passes**

Run: `cd webapp && npx vitest run api/jobs.test.js`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add webapp/api/jobs.js webapp/api/jobs.test.js
git commit -m "fix(jobs): carry slug, domain and logo when resolving an anonymous employer"
```

---

### Task 6: Verifica dal vivo e documentazione

**Files:**
- Modify: `docs/LLM_Wiki_Status.md`
- Modify: `00_Wiki/job-courier/arca24-company-index.md` (fuori dal repo)

- [ ] **Step 1: Suite completa**

Run: `cd webapp && npm test`
Expected: PASS, tutti i test

- [ ] **Step 2: Verifica locale del roster**

Run:

```bash
cd webapp && node -e "import('./api/_arca24.js').then(async m => { const l = await m.fetchCompanies({ withJobStatus: true }); const d = l.find(c => /dinamic/i.test(c.name)); console.log('roster', l.length, 'hiring', l.filter(c => c.has_jobs === true).length); console.log('dinamic hub:', JSON.stringify(d)); })"
```

Expected: roster ~33, hiring ~13, e `Dinamic Hub` con `has_jobs: true`.

Se `has_jobs` resta `false`: il nome nello snapshot e quello nell'indice non normalizzano uguale. Stampare i due valori passati attraverso `normalizeCompanyName` e confrontarli prima di toccare altro.

- [ ] **Step 3: Deploy e verifica in produzione**

Dopo il merge su `main` e il deploy:

```bash
curl -s "https://www.jobcourier.ch/api/companies?withJobs=1" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const l=JSON.parse(s);console.log('roster',l.length,'hiring',l.filter(c=>c.has_jobs===true).length);console.log(l.filter(c=>/dinamic/i.test(c.name)))})"
```

Expected: `has_jobs: true` su Dinamic Hub, roster invariato, hiring salito di uno.

Poi aprire la home e contare i loghi in vetrina: deve comparire anche Dinamic Hub, senza logo (l'immagine a monte non è caricata) ma con il nome.

- [ ] **Step 4: Aggiornare la wiki**

In `docs/LLM_Wiki_Status.md`, voce nuova in cima con: il caso Dinamic Hub, il fatto che `company/jobs` risponde alla domanda stretta "annunci agganciati" e non "annunci", la sorgente del nome (`itemprop="hiringOrganization"` in blocco `hidden`), il vincolo misurato che la ricerca upstream non indicizza quel campo, e il tetto delle 120 pagine con la ragione.

In `00_Wiki/job-courier/arca24-company-index.md`, correggere il passo 3 della sequenza di verifica: una pagina azienda vuota **non** significa che l'azienda non abbia annunci, significa che non ne ha di agganciati. Aggiungere il controllo incrociato sull'annuncio, se se ne conosce uno.

- [ ] **Step 5: Commit**

```bash
git add docs/LLM_Wiki_Status.md
git commit -m "docs: record why an empty company page is not an empty employer"
```

---

## Cosa questo piano non fa, di proposito

- **Non scandaglia l'intero catalogo.** 120 pagine su 534. Un annuncio scollegato più vecchio di ~1800 annunci non viene visto. Alzare `DEFAULT_PAGES` è una riga, ma va fatto con in mano una misura del tempo di build, non a intuito.
- **Non tocca il criterio della vetrina.** Resta "ha annunci aperti". Cambia solo la capacità di accorgersene. Se dal confronto con Laura emerge che in Arca esiste un flag vetrina indipendente dagli annunci, quello è un altro piano e sostituisce il criterio, non questo meccanismo.
- **Non rimedia al logo mancante.** Dinamic Hub comparirà senza immagine finché il logo non viene caricato a monte. È stato chiesto al cliente.
- **Non introduce richieste sul percorso della home.** Tutto il costo sta nella build. Se un giorno servisse in tempo reale, il posto giusto è il pool già esistente in `jobs.js`, non questa scansione.
