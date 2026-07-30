import { describe, it, expect } from 'vitest';
import { buildShowcase, companyKey } from './useShowcaseJobs';

const job = (id, company, location) => ({ id, company: { name: company }, location });

describe('companyKey', () => {
    it('collapses legal suffixes and sub-brands onto one bucket', () => {
        expect(companyKey(job(1, 'Adecco', 'x'))).toBe(companyKey(job(2, 'Adecco SA', 'x')));
        expect(companyKey(job(1, 'Randstad Svizzera SA', 'x'))).toBe('randstad');
        expect(companyKey(job(1, 'Aposto Personal GmbH', 'x'))).toBe('aposto personal');
    });

    it('accepts the flat company shape used by Filters.jsx', () => {
        expect(companyKey({ company: 'Manpower' })).toBe('manpower');
    });

    it('never returns an empty key', () => {
        expect(companyKey({})).toBe('sconosciuta');
    });
});

describe('buildShowcase — language filtering', () => {
    const feed = [
        job(1, 'A', 'Svizzera, Lugano, Ti'),
        job(2, 'B', 'Svizzera, Zürich, Zh'),
        job(3, 'C', 'Svizzera, Sion, Vs'),
        job(4, 'D', 'Svizzera, Locarno, Ti'),
        job(5, 'E', 'Svizzera, Bern, Be'),
        job(6, 'F', 'Svizzera, Genève, Ge'),
    ];

    it('puts the matching language region first for Italian', () => {
        const { jobs } = buildShowcase(feed, 'it', { target: 6 });
        expect(jobs.slice(0, 2).map(j => j.id)).toEqual([1, 4]);
    });

    it('treats English exactly like Italian', () => {
        const itIds = buildShowcase(feed, 'it', { target: 6 }).jobs.map(j => j.id);
        const enIds = buildShowcase(feed, 'en', { target: 6 }).jobs.map(j => j.id);
        expect(enIds).toEqual(itIds);
    });

    it('puts German-speaking cantons first for German', () => {
        const { jobs } = buildShowcase(feed, 'de', { target: 6 });
        expect(jobs.slice(0, 2).map(j => j.id)).toEqual([2, 5]);
    });

    it('puts French-speaking cantons first for French', () => {
        const { jobs } = buildShowcase(feed, 'fr', { target: 6 });
        expect(jobs.slice(0, 2).map(j => j.id)).toEqual([3, 6]);
    });

    it('keeps unresolved locations in-region as wildcards, never drops them', () => {
        const withUnknown = [...feed, job(7, 'G', 'Svizzera')];
        const { jobs } = buildShowcase(withUnknown, 'de', { target: 7 });
        expect(jobs.map(j => j.id)).toContain(7);
    });
});

describe('buildShowcase — anti-monopoly cap', () => {
    const monopoly = Array.from({ length: 20 }, (_, i) =>
        job(i + 1, 'Adecco', 'Svizzera, Lugano, Ti')
    );

    it('caps a single company at 2 when the target can still be met', () => {
        const varied = [
            ...monopoly.slice(0, 10),
            job(101, 'Manpower', 'Svizzera, Lugano, Ti'),
            job(102, 'Manpower', 'Svizzera, Locarno, Ti'),
            job(103, 'Randstad', 'Svizzera, Ascona, Ti'),
            job(104, 'Randstad', 'Svizzera, Mendrisio, Ti'),
        ];
        const { jobs, appliedCap } = buildShowcase(varied, 'it', { target: 6 });
        expect(appliedCap).toBe(2);
        expect(jobs).toHaveLength(6);
        const perCompany = {};
        jobs.forEach(j => { perCompany[companyKey(j)] = (perCompany[companyKey(j)] || 0) + 1; });
        expect(Object.values(perCompany).every(n => n <= 2)).toBe(true);
    });

    it('holds the cap at 2 even when that leaves the showcase short', () => {
        // 3 companies × cap 2 = 6 cards, so a target of 9 cannot be met.
        // The cap wins: we show 6 cards rather than letting a company take more.
        const feed = [
            ...Array.from({ length: 5 }, (_, i) => job(i + 1, 'Adecco', 'Svizzera, Lugano, Ti')),
            ...Array.from({ length: 5 }, (_, i) => job(i + 11, 'Manpower', 'Svizzera, Locarno, Ti')),
            ...Array.from({ length: 5 }, (_, i) => job(i + 21, 'Randstad', 'Svizzera, Ascona, Ti')),
        ];
        const { jobs, appliedCap } = buildShowcase(feed, 'it', { target: 9 });
        expect(appliedCap).toBe(2);
        expect(jobs).toHaveLength(6);
    });

    it('never lets one company exceed 2 slots, in any language', () => {
        const feed = Array.from({ length: 60 }, (_, i) =>
            job(i + 1, 'Adecco', ['Svizzera, Lugano, Ti', 'Svizzera, Zürich, Zh', 'Svizzera, Sion, Vs'][i % 3])
        );
        for (const lang of ['it', 'en', 'de', 'fr']) {
            const { jobs } = buildShowcase(feed, lang, { target: 12 });
            expect(jobs.length, lang).toBeLessThanOrEqual(2);
        }
    });

    it('gives in-region jobs the cap slots before out-of-region ones', () => {
        const feed = [
            job(1, 'Adecco', 'Svizzera, Zürich, Zh'),
            job(2, 'Adecco', 'Svizzera, Lugano, Ti'),
            job(3, 'Adecco', 'Svizzera, Locarno, Ti'),
            job(4, 'Adecco', 'Svizzera, Bern, Be'),
        ];
        const { jobs } = buildShowcase(feed, 'it', { target: 2 });
        expect(jobs.map(j => j.id)).toEqual([2, 3]);
    });

    it('returns a full, stable card count when enough companies are present', () => {
        const feed = [
            ...Array.from({ length: 8 }, (_, i) => job(i + 1, `C${i}`, 'Svizzera, Lugano, Ti')),
            ...Array.from({ length: 8 }, (_, i) => job(i + 21, `D${i}`, 'Svizzera, Zürich, Zh')),
            ...Array.from({ length: 8 }, (_, i) => job(i + 41, `E${i}`, 'Svizzera, Genève, Ge')),
        ];
        for (const lang of ['it', 'en', 'de', 'fr']) {
            expect(buildShowcase(feed, lang, { target: 12 }).jobs).toHaveLength(12);
        }
    });
});

describe('buildShowcase — degenerate input', () => {
    it('handles an empty feed', () => {
        expect(buildShowcase([], 'it').jobs).toEqual([]);
    });

    it('handles null', () => {
        expect(buildShowcase(null, 'de').jobs).toEqual([]);
    });

    it('never returns more than the target', () => {
        const feed = Array.from({ length: 100 }, (_, i) => job(i, `C${i}`, 'Svizzera, Lugano, Ti'));
        expect(buildShowcase(feed, 'it', { target: 12 }).jobs).toHaveLength(12);
    });
});
