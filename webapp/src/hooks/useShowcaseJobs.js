import { useMemo } from 'react';
import { resolveLocation, regionForLang } from '../utils/localeRegion';

export const SHOWCASE_TARGET = 12;

/**
 * Hard anti-monopoly cap: a company never occupies more than this many slots,
 * even when that leaves the showcase short of SHOWCASE_TARGET. The feed
 * currently carries very few companies, so this genuinely limits the card
 * count — that is the intended trade-off, not a bug.
 */
export const SHOWCASE_CAP = 2;

/**
 * Company identity for the anti-monopoly cap. Legal suffixes are stripped so
 * "Adecco" and "Adecco Risorse Umane SA" collapse into a single bucket.
 */
export function companyKey(job) {
    const raw = job?.company?.name || job?.company || '';
    return String(raw)
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/\b(sa|sagl|ag|gmbh|sarl|s\.?a\.?r\.?l|ltd|spa|srl|svizzera|suisse|schweiz|switzerland)\b/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim() || 'sconosciuta';
}

/** Keep at most `cap` jobs per company, preserving the incoming order. */
function capPerCompany(jobs, cap) {
    const counts = new Map();
    const out = [];
    for (const job of jobs) {
        const key = job.__companyKey;
        const n = counts.get(key) || 0;
        if (n >= cap) continue;
        counts.set(key, n + 1);
        out.push(job);
    }
    return out;
}

/**
 * Build the showcase list for a UI language.
 *
 * Pipeline (order matters):
 *   1. tag each job with its language region and company key
 *   2. partition into in-region / out-of-region, preserving feed order
 *      (the upstream feed is latest-first; `published_at` is identical on every
 *      job, so feed position is the only usable recency signal)
 *   3. concatenate in-region first, then out-of-region
 *   4. apply the per-company cap, raising it only if the target cannot be met
 *
 * Jobs whose canton cannot be resolved are wildcards: they stay in-region
 * rather than being dropped.
 *
 * The cap is hard: with few companies in the feed the showcase simply shows
 * fewer cards rather than letting one company dominate it.
 */
export function buildShowcase(jobs, uiLang, { target = SHOWCASE_TARGET, cap = SHOWCASE_CAP } = {}) {
    const list = Array.isArray(jobs) ? jobs : [];
    if (list.length === 0) {
        return { jobs: [], appliedCap: cap, inRegionCount: 0, region: regionForLang(uiLang) };
    }

    const region = regionForLang(uiLang);

    const tagged = list.map(job => {
        const { canton, lang } = resolveLocation(job.location);
        return { ...job, __canton: canton, __lang: lang, __companyKey: companyKey(job) };
    });

    const inRegion = tagged.filter(j => j.__lang === region || j.__lang === null);
    const outRegion = tagged.filter(j => j.__lang !== region && j.__lang !== null);
    const ordered = [...inRegion, ...outRegion];

    const selected = capPerCompany(ordered, cap).slice(0, target);
    return {
        jobs: selected,
        appliedCap: cap,
        inRegionCount: selected.filter(j => j.__lang === region || j.__lang === null).length,
        region,
    };
}

/**
 * React wrapper around buildShowcase. Recomputes only when the feed or the UI
 * language changes.
 */
export default function useShowcaseJobs(jobs, uiLang, options) {
    const target = options?.target ?? SHOWCASE_TARGET;
    const cap = options?.cap ?? SHOWCASE_CAP;
    return useMemo(
        () => buildShowcase(jobs, uiLang, { target, cap }),
        [jobs, uiLang, target, cap]
    );
}
