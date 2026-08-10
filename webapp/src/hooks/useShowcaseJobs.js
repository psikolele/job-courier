import { useMemo } from 'react';
import { resolveLocation, regionForLang } from '../utils/localeRegion';

/**
 * Upper bound on cards. What actually renders is whatever the per-company cap
 * allows: with the current feed that is a stable 8 in every language, because
 * two of the five companies in the pool have a single ad each.
 */
export const SHOWCASE_TARGET = 10;

/**
 * Hard anti-monopoly cap: a company never occupies more than this many slots,
 * even when that leaves the showcase short of SHOWCASE_TARGET. The feed
 * currently carries very few companies, so this genuinely limits the card
 * count — that is the intended trade-off, not a bug.
 */
export const SHOWCASE_CAP = 2;

/**
 * Ceiling on how many anonymous ads may occupy the showcase at once. They are
 * exempt from the per-company cap (see `companyKey`) and there are enough of
 * them to fill every slot, which would be its own kind of monotony: ten cards
 * all headed "Azienda Riservata".
 */
export const RESERVED_CAP = 4;

const RESERVED_PREFIX = 'riservata:';

/**
 * Company identity for the anti-monopoly cap. Legal suffixes are stripped so
 * "Adecco" and "Adecco Risorse Umane SA" collapse into a single bucket.
 *
 * "Azienda Riservata" is the exception, and gets one bucket per ad. It is not
 * an employer — it is the absence of one, the label `api/jobs` falls back to
 * when a company asked not to be named — so the dozens of ads carrying it come
 * from dozens of different employers. Bucketing them together made the cap
 * treat them as a single company and let two through: on 10.08.2026 that is
 * what kept the Italian showcase on ads from 22/07 while five anonymous Ticino
 * ads posted that same day sat in the pool unshown.
 */
export function companyKey(job) {
    const raw = job?.company?.name || job?.company || '';
    const normalised = String(raw)
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/\b(sa|sagl|ag|gmbh|sarl|s\.?a\.?r\.?l|ltd|spa|srl|svizzera|suisse|schweiz|switzerland)\b/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim() || 'sconosciuta';

    if (normalised === 'azienda riservata') return `${RESERVED_PREFIX}${job?.id ?? Math.random()}`;
    return normalised;
}

/**
 * Publication date, newest-first sortable. Upstream writes `31/07/2026`, and
 * `10/08/2026 Nuovo!` for anything posted today, so the day is read off the
 * front and the badge ignored. Returns `null` when there is no usable date;
 * those keep their feed position rather than being pushed anywhere.
 */
export function publishedAt(job) {
    const match = String(job?.published_at || '').match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
    if (!match) return null;
    const [, d, m, y] = match;
    const time = Date.UTC(Number(y), Number(m) - 1, Number(d));
    return Number.isNaN(time) ? null : time;
}

/**
 * Newest first, stable for everything that cannot be dated.
 *
 * This used to be feed order alone, because every ad upstream carried the same
 * `published_at` and position was the only recency signal there was. The dates
 * are real now — a single pool read on 10.08.2026 held ads from 20/07 through
 * that morning — so leaving them unsorted is what put month-old ads in front of
 * ones posted hours earlier.
 */
function newestFirst(jobs) {
    return jobs
        .map((job, i) => ({ job, i, at: publishedAt(job) }))
        .sort((a, b) => {
            if (a.at === b.at) return a.i - b.i;
            if (a.at === null) return 1;
            if (b.at === null) return -1;
            return b.at - a.at;
        })
        .map(({ job }) => job);
}

/** Keep at most `cap` jobs per company, preserving the incoming order. */
function capPerCompany(jobs, cap, reservedCap = RESERVED_CAP) {
    const counts = new Map();
    let reserved = 0;
    const out = [];
    for (const job of jobs) {
        const key = job.__companyKey;
        if (key.startsWith(RESERVED_PREFIX)) {
            if (reserved >= reservedCap) continue;
            reserved += 1;
        } else {
            const n = counts.get(key) || 0;
            if (n >= cap) continue;
            counts.set(key, n + 1);
        }
        out.push(job);
    }
    return out;
}

/**
 * Build the showcase list for a UI language.
 *
 * Pipeline (order matters):
 *   1. tag each job with its language region and company key
 *   2. partition into in-region / out-of-region
 *   3. sort each side newest-first, then concatenate in-region before the rest
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

    const inRegion = newestFirst(tagged.filter(j => j.__lang === region || j.__lang === null));
    const outRegion = newestFirst(tagged.filter(j => j.__lang !== region && j.__lang !== null));
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
