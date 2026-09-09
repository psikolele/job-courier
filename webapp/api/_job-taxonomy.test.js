import { describe, it, expect, vi } from 'vitest';
import { parseIds, collectTaxonomy } from './job-taxonomy.js';

describe('parseIds', () => {
    it('reads the numeric id out of either spelling', () => {
        expect(parseIds('6747308-senior-actuary,6741422')).toEqual(['6747308', '6741422']);
    });

    it('drops duplicates so an ad is never fetched twice', () => {
        expect(parseIds('6747308,6747308-senior-actuary,6747308')).toEqual(['6747308']);
    });

    it('drops anything without a numeric id rather than fetching it', () => {
        expect(parseIds('abc,,  ,6741422')).toEqual(['6741422']);
    });

    // The client asks only for what is on screen; a caller that ignores that must not be
    // able to turn one request into an unbounded fan-out upstream.
    it('caps the batch at 20 ids', () => {
        const many = Array.from({ length: 50 }, (_, i) => String(1000000 + i)).join(',');
        expect(parseIds(many)).toHaveLength(20);
    });

    it('returns nothing for an empty parameter', () => {
        expect(parseIds(undefined)).toEqual([]);
        expect(parseIds('')).toEqual([]);
    });
});

describe('collectTaxonomy', () => {
    const detail = (id, sector, role) => ({ id, sector, role });

    it('returns only sector and role, keyed by id', async () => {
        const fetchDetail = vi.fn(async (id) =>
            detail(id, 'Assicurazioni', 'Contabilità/Banca/Finanza'));

        expect(await collectTaxonomy(['6747308'], fetchDetail)).toEqual({
            '6747308': { sector: 'Assicurazioni', role: 'Contabilità/Banca/Finanza' },
        });
    });

    // Upstream states a real sector on a minority of ads and writes a placeholder on the
    // rest — 8 of the first 10 read "Altro" on 09/09/2026. Returning that would cache
    // "we don't know" once per ad and tell the card nothing it did not already assume.
    it.each(['Non specificato', 'Altro', 'Other', ''])(
        'omits an ad whose own page says %j — the card keeps its inference',
        async (placeholder) => {
            const fetchDetail = async (id) => detail(id, placeholder, placeholder);
            expect(await collectTaxonomy(['6747308'], fetchDetail)).toEqual({});
        });

    it('keeps the half that means something', async () => {
        const fetchDetail = async (id) => detail(id, 'Assicurazioni', 'Altro');
        expect(await collectTaxonomy(['6747308'], fetchDetail)).toEqual({
            '6747308': { sector: 'Assicurazioni', role: null },
        });
    });

    it('lets the rest of the batch through when one ad fails', async () => {
        const fetchDetail = async (id) => {
            if (id === '2') throw new Error('upstream down');
            return detail(id, 'IT', 'Sviluppatore');
        };
        const out = await collectTaxonomy(['1', '2', '3'], fetchDetail);
        expect(Object.keys(out)).toEqual(['1', '3']);
    });

    it('asks upstream exactly once per ad', async () => {
        const fetchDetail = vi.fn(async (id) => detail(id, 'IT', 'Sviluppatore'));
        await collectTaxonomy(['1', '2', '3', '4', '5'], fetchDetail);
        expect(fetchDetail).toHaveBeenCalledTimes(5);
    });

    // The whole cost is one upstream request per ad, so they go out concurrently: a
    // sequential loop over 15 ads at ~1s each would outlive the function's own budget.
    it('runs a batch concurrently rather than one after another', async () => {
        let inFlight = 0;
        let peak = 0;
        const fetchDetail = async (id) => {
            inFlight += 1;
            peak = Math.max(peak, inFlight);
            await new Promise(r => setTimeout(r, 5));
            inFlight -= 1;
            return detail(id, 'IT', 'Sviluppatore');
        };
        await collectTaxonomy(['1', '2', '3', '4', '5', '6', '7', '8'], fetchDetail);
        expect(peak).toBe(8);
    });
});
