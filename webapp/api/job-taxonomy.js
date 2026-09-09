import { isArca24Enabled, fetchHtml } from './_arca24.js';

/**
 * Sector and role for a handful of ads, in one request.
 *
 * The list scrape carries neither — the portal exposes them only on an ad's own page —
 * so cards fall back to guessing from the title, and a title the keyword rules do not
 * match reads "Altro" while the ad itself says "Assicurazioni". The values exist one
 * request per ad away; this endpoint pays that cost once, for the cards a visitor is
 * actually looking at.
 *
 * Four things keep it cheap enough to be worth having:
 *
 *  - It is not the list. `/api/jobs` answers unchanged and the page paints from it; this
 *    is fetched afterwards and only relabels cards already on screen. Nothing waits on it.
 *  - It reads the two microdata values off the raw HTML instead of building a DOM. That
 *    is not a micro-optimisation: measured 09/09/2026 on 15 live ads, 3.3 MB of HTML,
 *    `fetchJobDetail` (cheerio, full parse, sanitised description) cost 844 ms of active
 *    CPU while the two regexes below cost under 1 ms for the same values. Vercel bills
 *    active CPU, and a second of it per request against a ~7 min/day budget is not a
 *    rounding error. Do not swap this back to a DOM parse for tidiness.
 *  - It answers with ids, sector and role and nothing else — under 200 bytes against the
 *    ad's 230 KB page.
 *  - An ad's sector and role never change once published, so it is cached for a day
 *    rather than the five minutes the ad list gets, and the ids are sorted so two
 *    visitors on the same page share one entry instead of minting two.
 */

// One page of cards. The client asks only for what is on screen, but a caller is not
// trusted to keep it that way: past this the fan-out would cost more upstream requests
// than the page it serves is worth.
const MAX_IDS = 20;

// The cost is now one upstream request per id and almost no CPU, so the batch resolves
// in roughly the time of its slowest member.
const BATCH_SIZE = 8;

/**
 * Values that carry no information, so they are not worth a byte of the response.
 *
 * Upstream states a real sector on a minority of ads — measured 09/09/2026, 2 of the
 * first 15 — and writes the placeholder on the rest. Sending it back would cache and
 * transmit "we don't know" once per ad, and the client would have to know to ignore it
 * anyway: `src/utils/jobTaxonomy.js` already skips exactly these strings so a card can
 * fall back to its title. Kept in step with that list; the two are deliberately not
 * shared, because api/ must not import from src/.
 */
const NO_VALUE = new Set(['Non specificato', 'Altro', 'Other', 'other', '']);

const meaningful = (value) => {
  const v = String(value ?? '').trim();
  return v && !NO_VALUE.has(v) ? v : null;
};

/**
 * Read one microdata property out of the raw page.
 *
 * Both spellings the portal uses are covered: `<meta itemprop="x" content="…">` and
 * `<span itemprop="x">…</span>`. Each property appears exactly once per page — verified
 * 09/09/2026, including on ads whose sidebar lists related vacancies — so the first
 * match is the ad's own and there is nothing to disambiguate.
 */
const readProp = (html, prop) => {
  // Find the tag first, then look inside it. Trying to express "the tag, and maybe its
  // content attribute" as one pattern needs an optional group sitting behind `[^>]*?`,
  // which happily skips it — the attribute was never captured and every <meta> spelling
  // read as empty. Two steps are both correct and easier to read.
  const tag = new RegExp(`<[^>]*itemprop=["']${prop}["'][^>]*>`, 'i').exec(html);
  if (!tag) return '';

  const attr = /content=["']([^"']*)["']/i.exec(tag[0]);
  if (attr) return attr[1].trim();

  // A <span>: the value is the text that follows the opening tag.
  const text = /^([^<]*)/.exec(html.slice(tag.index + tag[0].length));
  return text ? text[1].trim() : '';
};

/** `6747308-senior-actuary-life-expert` and `6747308` name the same ad. */
const numericId = (value) => {
  const s = String(value ?? '').trim();
  const m = s.match(/^(\d+)/);
  return m ? m[1] : '';
};

export function parseIds(raw) {
  return [...new Set(
    String(raw ?? '')
      .split(',')
      .map(numericId)
      .filter(Boolean)
  )].slice(0, MAX_IDS);
}

/** The ad's page. The bare numeric id resolves without the slug — verified 09/09/2026. */
export async function readTaxonomy(id, getHtml = fetchHtml) {
  const html = await getHtml(`/it/careers/jobad/${id}`);
  return {
    sector: meaningful(readProp(html, 'industry')),
    role: meaningful(readProp(html, 'occupationalCategory')),
  };
}

export async function collectTaxonomy(ids, read = readTaxonomy) {
  const out = {};
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      // A single unreachable ad must not empty the whole batch: the others still relabel
      // their cards, and the one that failed keeps the inference it already had.
      batch.map(id => read(id).catch(() => null))
    );
    batch.forEach((id, n) => {
      if (!results[n]) return;
      // Filtered here too, not only in the reader: "do not ship a placeholder" is this
      // function's contract with the client, and it should hold whatever the reader hands
      // it. Nothing worth sending is nothing sent — the card keeps its own inference.
      const sector = meaningful(results[n].sector);
      const role = meaningful(results[n].role);
      if (sector || role) out[id] = { sector, role };
    });
  }
  return out;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Accept, Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const ids = parseIds(req.query?.ids).sort();
  if (ids.length === 0) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(400).json({ error: 'Missing ids parameter' });
    return;
  }

  try {
    if (!await isArca24Enabled()) {
      // The old portal exposes sector and role on its list rows, so its cards already
      // carry them and there is nothing to add here.
      res.setHeader('Cache-Control', 's-maxage=86400');
      res.status(200).json({});
      return;
    }

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    res.status(200).json(await collectTaxonomy(ids));
  } catch (error) {
    console.error('Error fetching job taxonomy:', error);
    // A failure here costs a label, not a page. Say so quietly and let the cards keep
    // the inference they already have, rather than caching an error for a day.
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({});
  }
}
