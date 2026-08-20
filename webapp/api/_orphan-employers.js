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
import { fetchHtml, fetchJobDetail, parseJobsFromHtml, normalizeCompanyName, RESERVED_COMPANY } from './_arca24.js';

const LANG = 'it';

// A listing page holds 15 ads, so 120 pages ≈ the 1800 most recent ads. The whole
// catalogue was 8006 ads on 20.08.2026, i.e. 534 requests, and scanning it all is not
// worth it: the case to cover is an employer who has just published and would otherwise
// be missing from the showcase, and a fresh ad sits at the top of the date ordering.
export const DEFAULT_PAGES = 120;
export const DEFAULT_CONCURRENCY = 6;
// Runaway guard: if the portal ever stopped linking companies at all, every row would look
// anonymous and this would open one detail page per ad. The cap keeps the rebuild bounded.
export const DEFAULT_MAX_DETAILS = 150;

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
