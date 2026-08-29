// Decides whether one run of collectOrphanEmployerNames is trustworthy enough to overwrite
// the committed snapshot. Pure on purpose, and in its own module rather than exported from
// the generator: importing the generator executes its top-level scan, so a test that pulled
// `assessScan` out of it would hit the live Arca24 portal on import.
//
// The scan in api/_orphan-employers.js swallows individual failures and reports counters;
// this is where those counters get turned into a verdict. Underscore prefix matches the
// convention for non-endpoint modules in api/.
import { DEFAULT_PAGES } from '../api/_orphan-employers.js';

export const MAX_FAILED_RATIO = 0.2;

// A genuine "no orphans right now" is indistinguishable, from a single run, from a scan
// that quietly went nowhere (see the comment on the zero-names check below). Rather than
// trust — or freeze on — one run, an empty result has to repeat CLEAN_ZERO_THRESHOLD times
// in a row, each one clean enough that a broken-scan explanation is unreachable, before it
// is allowed to overwrite the committed list. Three, not one: one clean zero is still a
// coincidence a portal hiccup could produce; three in a row, each having spent the full
// page budget with nothing failed and nothing truncated, is a pattern a quietly-broken scan
// cannot fake build after build.
export const CLEAN_ZERO_THRESHOLD = 3;

/**
 * How many of the committed employers the new scan no longer names.
 *
 * Exported because the generator logs the same figure in its delta line: one definition,
 * so the number that rejects a run and the number printed in the log cannot drift apart.
 */
export function countRemoved(committedNames = [], names = []) {
  const found = new Set(names);
  return committedNames.filter((n) => !found.has(n)).length;
}

/**
 * A zero-names run is "clean" when nothing about the run itself can explain the zero away:
 * the full page budget was spent, not one page or detail fetch failed, and nothing was left
 * unopened by the detail cap. Deliberately stricter than the MAX_FAILED_RATIO gates above —
 * those tolerate a *degraded* run finding real employers, but a run that found none has no
 * such alibi available, so any failure at all keeps it out of the streak.
 */
function isCleanZero(scan) {
  const { pagesRequested, pagesFailed, detailsFailed, truncated } = scan;
  return pagesRequested === DEFAULT_PAGES && pagesFailed === 0 && detailsFailed === 0 && !truncated;
}

/**
 * @param {{names: string[], pagesRequested: number, pagesFailed: number,
 *          detailsRequested: number, detailsFailed: number, truncated: boolean}} scan
 * @param {string[]} [committedNames] the list currently committed, as the baseline
 * @param {number} [consecutiveCleanZero] the streak carried over from the committed
 *   snapshot (see api/_orphan-employers-snapshot.js) — 0 when there is none in progress
 * @returns {{reason: string|null, pending: boolean, consecutiveCleanZero: number}}
 *   `reason: null` means the scan is trusted: the caller should overwrite `names` and
 *   `generatedAt`, and persist the returned `consecutiveCleanZero` (always 0 in this case).
 *   A non-null `reason` with `pending: false` is an outright rejection — the committed
 *   `names`/`generatedAt` must be left alone, but `consecutiveCleanZero` still needs
 *   persisting since it may have just been reset off of an in-progress streak.
 *   A non-null `reason` with `pending: true` is a clean zero short of the threshold: same
 *   rule — `names`/`generatedAt` untouched, `consecutiveCleanZero` persisted — the only
 *   difference from an outright rejection is what the build log should say about it.
 */
export function assessScan(scan, committedNames = [], consecutiveCleanZero = 0) {
  const { names, pagesRequested, pagesFailed, detailsRequested, detailsFailed, truncated } = scan;

  // Ordered from the most certain diagnosis to the least. `names.length === 0` is the
  // weakest inference of the six — it is a symptom shared by every failure below — so it
  // runs last among the scan-health checks, otherwise it masks four diagnoses that name
  // the actual cause.

  // The scan gave up before spending its page budget. Measured 20.08.2026 the catalogue was
  // 8006 ads at 15 per listing page — about 534 pages against a budget of 120 — so stopping
  // early cannot mean "reached the end of the catalogue" today: it means the listing stopped
  // answering. This also covers an empty first page and the pages: 0 case, where the ratio
  // checks below would be 0/0 (NaN) and would sail past every threshold unnoticed. No magic
  // number here on purpose: if the catalogue ever really shrinks under the budget, this
  // fires loudly and a human lowers DEFAULT_PAGES deliberately, which is the right way to
  // find that out.
  if (pagesRequested < DEFAULT_PAGES) {
    return {
      reason: `scansione ferma a ${pagesRequested} pagine su ${DEFAULT_PAGES}: il listing non sta rispondendo`,
      pending: false,
      consecutiveCleanZero: 0,
    };
  }

  // Failures are swallowed by design, so the only signal that a run was thin is the ratio.
  // Each lost listing page silently removes fifteen ads from the scan.
  if (pagesRequested > 0 && pagesFailed / pagesRequested > MAX_FAILED_RATIO) {
    return {
      reason: `${pagesFailed} pagine fallite su ${pagesRequested}: scansione degradata`,
      pending: false,
      consecutiveCleanZero: 0,
    };
  }

  // Detail failures are the nastier half: they lose employers one at a time while
  // pagesFailed stays at zero, so a run where half the details fail reports healthy pages, a
  // healthy page ratio, and half the names.
  if (detailsRequested > 0 && detailsFailed / detailsRequested > MAX_FAILED_RATIO) {
    return {
      reason: `${detailsFailed} dettagli falliti su ${detailsRequested}: scansione degradata`,
      pending: false,
      consecutiveCleanZero: 0,
    };
  }

  // The detail cap bit, so the module knows for a fact that anonymous ads were left
  // unopened. A knowingly partial list must never be committed.
  if (truncated) {
    return {
      reason: 'scansione troncata dal tetto sui dettagli: risultato parziale',
      pending: false,
      consecutiveCleanZero: 0,
    };
  }

  // An empty result and a scan that quietly went nowhere look exactly the same from a
  // single run. A run that also carries any failure or truncation is rejected outright, no
  // streak credit — those are exactly the shapes a broken scan produces. A run with none of
  // that alibi-shaped noise (isCleanZero) is real evidence, so it counts toward
  // CLEAN_ZERO_THRESHOLD instead of being discarded: only once that many clean zeros have
  // repeated back to back is the emptiness trusted enough to overwrite every employer we
  // already know about.
  if (names.length === 0) {
    if (!isCleanZero(scan)) {
      return {
        reason: 'nessun datore con annunci scollegati: sospetto scansione fallita',
        pending: false,
        consecutiveCleanZero: 0,
      };
    }
    const streak = consecutiveCleanZero + 1;
    if (streak >= CLEAN_ZERO_THRESHOLD) {
      return { reason: null, pending: false, consecutiveCleanZero: 0 };
    }
    return {
      reason: `nessun datore con annunci scollegati, corsa pulita ${streak}/${CLEAN_ZERO_THRESHOLD}: in attesa di conferma`,
      pending: true,
      consecutiveCleanZero: streak,
    };
  }

  // Partial collapse. Every check above answers "did the scan start"; none answers "did it
  // come back with a plausible amount". A run losing 19% of its pages AND 19% of its details
  // clears all of them and can still return three of six employers — that is the 18.08.2026
  // shape exactly: not zero, just fewer, overwriting the good file with it.
  //
  // A shrink on a clean scan is real news — an employer linked their ads properly, or
  // stopped publishing — and must pass. A shrink on a lossy scan is indistinguishable from
  // the losses having eaten the difference, so the committed file is the better answer.
  // No ratio, because on a population of six any ratio is a guess.
  //
  // REJECTED, and it will be proposed again: writing union(committed, names) instead.
  // A name in this file makes the consumer mark that employer as hiring while BYPASSING the
  // live probe. Under a union a name can never leave, so an employer who stops publishing
  // stays advertised as hiring forever and the file's error only grows toward false
  // positives. Losing a name is cheap — that employer falls back to the probe, exactly as
  // today. Inventing one is not.
  // Measured in membership, not in length: a lossy run that drops `dinamic hub` while
  // picking up some other employer keeps the count identical and would otherwise sail
  // through, overwriting the file with a name swapped out.
  //
  // Coupling worth knowing about before touching DEFAULT_PAGES: api/_orphan-employers.js
  // records that a listing page past the end of the catalogue answers 404, so `fetchHtml`
  // rejects and `pagesFailed` climbs even against a healthy portal. Today the catalogue is
  // ~534 pages against a budget of 120, so that cannot happen. Raise the budget past the
  // real depth of the catalogue — which is exactly what the `pagesRequested < DEFAULT_PAGES`
  // guard above invites when the catalogue shrinks — and `pagesFailed > 0` becomes
  // permanently true, every removal is rejected forever, and the file quietly freezes with
  // only a `[SNAPSHOT-REJECTED]` line per build to show for it.
  const baseline = committedNames?.length ?? 0;
  const removed = countRemoved(committedNames, names);
  if (baseline > 0 && removed > 0 && (pagesFailed > 0 || detailsFailed > 0)) {
    return {
      reason: `${removed} datori spariti rispetto ai ${baseline} committati, con perdite (${pagesFailed} pagine, ${detailsFailed} dettagli): calo non distinguibile dalle perdite`,
      pending: false,
      consecutiveCleanZero: 0,
    };
  }

  return { reason: null, pending: false, consecutiveCleanZero: 0 };
}
