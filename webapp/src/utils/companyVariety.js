/**
 * Reorder a job list so no single employer owns the first screen.
 *
 * The catalogue upstream is wildly lopsided — measured 09/09/2026, a 15-page sample
 * held 171 ads from 8 employers, 124 of them Adecco — and `latest_jobs` serves them
 * in per-company blocks. Sorting by date does not break those blocks up, because the
 * date has day granularity and the sort is stable: the whole Manpower block dated
 * today lands in front, and `/offerte` opened on five Manpower cards.
 *
 * Promotion, not filtering. The first `cap` ads of each employer move to the front,
 * keeping their relative order; everything else follows behind, also in order. No ad
 * is dropped — with 8 employers a hard cap would cut "tutte le offerte" from 45 to
 * 18, which reads as an empty portal rather than a varied one.
 *
 * Anonymous ads ("Azienda Riservata") are not one employer but the absence of one,
 * so they are exempt: bucketing them together would promote two and bury the rest.
 * Same reasoning as `useShowcaseJobs`'s `companyKey`.
 */
export const LIST_COMPANY_CAP = 3;

const RESERVED = 'azienda riservata';

/** Employer identity for the promotion, with legal suffixes stripped. */
export function companyBucket(job) {
  const raw = job?.company?.name || job?.company || '';
  const normalised = String(raw)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\b(sa|sagl|ag|gmbh|sarl|ltd|spa|srl|svizzera|suisse|schweiz|switzerland)\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
  return normalised || 'sconosciuta';
}

export function promoteCompanyVariety(jobs, cap = LIST_COMPANY_CAP) {
  const list = Array.isArray(jobs) ? jobs : [];
  if (list.length === 0) return list;

  const counts = new Map();
  const head = [];
  const tail = [];

  for (const job of list) {
    const key = companyBucket(job);
    if (key === RESERVED) { head.push(job); continue; }
    const n = counts.get(key) || 0;
    if (n < cap) {
      counts.set(key, n + 1);
      head.push(job);
    } else {
      tail.push(job);
    }
  }

  return [...head, ...tail];
}
