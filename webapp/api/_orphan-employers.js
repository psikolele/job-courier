// Employers that have ads online but whose ads are not attached to their own Arca24 record.
//
// Verified live on 20.08.2026 with Dinamic Hub (company id 3244828, ad 6740371, valid
// through 14.11): the ad is published, but nothing links it back to the employer profile.
// `company/jobs?uiid=3244828` lists only the ads that ARE linked, so it renders an empty
// page, `probeHasJobs` reads exactly that page and answers false, and the home showcase
// drops an employer that is in fact hiring. On the global listing the same ad carries no
// company link either, so `parseJobsFromHtml` falls back to RESERVED_COMPANY.
//
// The employer's name does exist, but only on the ad's detail page, inside the hidden
// `itemprop="hiringOrganization"` microdata block — `parseJobDetailFromHtml` already reads
// it. There is no cheaper route: measured on 20.08.2026, the upstream search does not index
// that hidden name (`?keyword=Dinamic Hub` returns zero results), so no per-company query
// can find these employers. The only way in is through the ads themselves, which is why
// this module scans listing pages and opens the anonymous ones.
//
// Cost is paid at build time only (the snapshot rebuild), never on a user request.
//
// The scan reports how much of itself actually completed. Individual failures are
// tolerated — a build must not die because one page timed out — but they are counted and
// returned, because the output of this module gets committed to a snapshot: a run where
// 118 of 120 pages failed produces a short list that is otherwise indistinguishable from a
// complete one, and this project has already shipped a degraded roster once for exactly
// that reason (10.08.2026). Deciding what is acceptable is the caller's job, not this
// module's; here we only report what happened.
import { fetchHtml, fetchJobDetail, parseJobsFromHtml, normalizeCompanyName, RESERVED_COMPANY } from './_arca24.js';

const LANG = 'it';

// A listing page holds 15 ads, so 120 pages ≈ the 1800 most recent ads. The whole
// catalogue was 8006 ads on 20.08.2026, i.e. 534 requests, and scanning it all is not
// worth it: the case to cover is an employer who has just published and would otherwise
// be missing from the showcase, and a fresh ad sits at the top of the date ordering.
export const DEFAULT_PAGES = 120;

// Same number as `PROBE_CONCURRENCY` in _arca24.js, but not the same evidence: that figure
// was measured on a burst of ~33 requests, whereas this scan sustains 6-wide across up to
// 270 requests. Sustained 6-wide at this volume is NOT covered by the 07.08.2026
// measurement. The risk being managed is not latency — nobody is waiting on a build — it
// is the portal classifying us as a scraper part-way through a build.
export const DEFAULT_CONCURRENCY = 6;

// Runaway guard, not a target: today's roster is ~33 employers and the observed rate of
// anonymous ads is roughly 1 in 120, so a legitimate scan finds a handful and 150 is far
// above any real result. The cap exists for the day the portal stops linking companies at
// all, when every row would look anonymous and this would open one detail page per ad.
export const DEFAULT_MAX_DETAILS = 150;

/**
 * Scans the recent listing pages, opens the ads that carry no company, and returns the
 * normalized employer names read from their detail pages.
 *
 * @returns {Promise<{names: string[], pagesRequested: number, pagesFailed: number,
 *   detailsRequested: number, detailsFailed: number, truncated: boolean}>}
 *   `names` is de-duplicated and normalized via `normalizeCompanyName`. The counters
 *   describe how complete the scan was; `truncated` is true when the `maxDetails` cap
 *   actually bit, i.e. anonymous ads were found and left unopened.
 */
export async function collectOrphanEmployerNames({
  pages = DEFAULT_PAGES,
  concurrency = DEFAULT_CONCURRENCY,
  maxDetails = DEFAULT_MAX_DETAILS,
} = {}) {
  // Guard the loop arithmetic once, here. A concurrency of 0 would step the loop by zero
  // and spin forever issuing no requests; a negative one would walk `start` backwards and
  // never reach `pages`. Either would surface in CI as a build that hangs with no
  // diagnostic. A negative `maxDetails` would turn `slice(0, maxDetails)` into "drop the
  // last N" instead of a cap, and mis-report the truncation along with it.
  const pageCount = Math.max(0, Math.floor(Number(pages) || 0));
  const batchSize = Math.max(1, Math.floor(Number(concurrency) || 0));
  const detailCap = Math.max(0, Math.floor(Number(maxDetails) || 0));

  const orphanIds = [];
  const seenIds = new Set();
  let pagesRequested = 0;
  let pagesFailed = 0;

  for (let start = 1; start <= pageCount; start += batchSize) {
    const batch = Array.from(
      { length: Math.min(batchSize, pageCount - start + 1) },
      (_, i) => start + i
    );
    pagesRequested += batch.length;
    const htmls = await Promise.all(
      batch.map((page) =>
        // A timeout or a reset connection is worth one more try: nobody is waiting on a
        // build, and a lost page silently removes fifteen ads from the scan.
        fetchHtml(`/${LANG}/careers/latest_jobs?page=${page}`, { attempts: 2 }).catch(() => null)
      )
    );

    let adsInBatch = 0;
    let failedInBatch = 0;
    for (const html of htmls) {
      if (!html) { failedInBatch++; continue; }
      for (const job of parseJobsFromHtml(html)) {
        adsInBatch++;
        if (job.company?.name !== RESERVED_COMPANY) continue;
        if (!job.jobroom_id || seenIds.has(job.jobroom_id)) continue;
        seenIds.add(job.jobroom_id);
        orphanIds.push(job.jobroom_id);
      }
    }
    pagesFailed += failedInBatch;

    // The listing ran dry: past the end of the catalogue there is nothing left to find, so
    // spending the rest of the page budget is pure load on the portal. Same stop condition
    // as `fetchCompaniesFromJobFeed`. A batch that returned no ads only because its fetches
    // failed is not "dry" — that must not be mistaken for the end of the listing.
    if (adsInBatch === 0 && failedInBatch === 0) break;
  }

  const names = new Set();
  const targets = orphanIds.slice(0, detailCap);
  const truncated = orphanIds.length > targets.length;
  if (truncated) {
    console.warn(`orphan employers: ${orphanIds.length} anonymous ads found, opened the first ${targets.length}.`);
  }

  let detailsFailed = 0;
  for (let start = 0; start < targets.length; start += batchSize) {
    const batch = targets.slice(start, start + batchSize);
    const details = await Promise.all(batch.map((id) => fetchJobDetail(id).catch(() => null)));
    for (const detail of details) {
      if (!detail) { detailsFailed++; continue; }
      const name = normalizeCompanyName(detail?.company?.name);
      if (name) names.add(name);
    }
  }

  return {
    names: [...names],
    pagesRequested,
    pagesFailed,
    detailsRequested: targets.length,
    detailsFailed,
    truncated,
  };
}
