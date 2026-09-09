import { isArca24Enabled, fetchJobDetail as fetchArca24JobDetail } from './_arca24.js';

/**
 * Sector and role for a handful of ads, in one request.
 *
 * The list scrape carries neither — the portal exposes them only on an ad's own page —
 * so cards fall back to guessing from the title, and a title the keyword rules do not
 * match reads "Altro" while the ad itself says "Assicurazioni". The values exist one
 * request per ad away; this endpoint pays that cost once, for the cards a visitor is
 * actually looking at.
 *
 * Three things keep it off the critical path:
 *
 *  - It is not the list. `/api/jobs` answers unchanged and the page paints from it; this
 *    is fetched afterwards and only relabels cards already on screen. Nothing waits on it.
 *  - It answers with ids, sector and role and nothing else — a few hundred bytes against
 *    the ad's full page — so the response is cheap to send and to parse.
 *  - An ad's sector and role never change once published, so the answer is cacheable for
 *    a day rather than for the five minutes the ad list gets. Sorting the ids makes the
 *    cache key stable no matter what order the caller asks in, so two visitors on the
 *    same page share one entry.
 */

// One page of cards. The client asks only for what is on screen, but a caller is not
// trusted to keep it that way: past this the fan-out would cost more upstream requests
// than the page it serves is worth.
const MAX_IDS = 20;

// The whole cost is one upstream request per id, against a portal that answers in ~1-2s.
// Well under MAX_IDS, so the batch resolves in roughly the time of its slowest member.
const BATCH_SIZE = 8;

/**
 * Values that carry no information, so they are not worth a byte of the response.
 *
 * Upstream states a real sector on a minority of ads — measured 09/09/2026, 2 of the
 * first 10 — and writes the placeholder on the rest. Sending it back would cache and
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

export async function collectTaxonomy(ids, fetchDetail) {
  const out = {};
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);
    const details = await Promise.all(
      // A single unreachable ad must not empty the whole batch: the others still relabel
      // their cards, and the one that failed keeps the inference it already had.
      batch.map(id => fetchDetail(id).catch(() => null))
    );
    batch.forEach((id, n) => {
      const d = details[n];
      if (!d) return;
      const sector = meaningful(d.sector);
      const role = meaningful(d.role);
      // Nothing worth sending is nothing sent — the client keeps its own inference.
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
    res.status(200).json(await collectTaxonomy(ids, fetchArca24JobDetail));
  } catch (error) {
    console.error('Error fetching job taxonomy:', error);
    // A failure here costs a label, not a page. Say so quietly and let the cards keep
    // the inference they already have, rather than caching an error for a day.
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({});
  }
}
