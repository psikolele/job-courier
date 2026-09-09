import { describe, it, expect, vi } from 'vitest';
import { parseIds, collectTaxonomy, readTaxonomy } from './job-taxonomy.js';

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
    const reads = (sector, role) => async () => ({ sector, role });

    it('returns only sector and role, keyed by id', async () => {
        const read = vi.fn(reads('Assicurazioni', 'Contabilità/Banca/Finanza'));

        expect(await collectTaxonomy(['6747308'], read)).toEqual({
            '6747308': { sector: 'Assicurazioni', role: 'Contabilità/Banca/Finanza' },
        });
    });

    // Upstream states a real sector on a minority of ads and writes a placeholder on the
    // rest — 8 of the first 10 read "Altro" on 09/09/2026. Returning that would cache
    // "we don't know" once per ad and tell the card nothing it did not already assume.
    it.each(['Non specificato', 'Altro', 'Other', ''])(
        'omits an ad whose own page says %j — the card keeps its inference',
        async (placeholder) => {
            expect(await collectTaxonomy(['6747308'], reads(placeholder, placeholder))).toEqual({});
        });

    it('keeps the half that means something', async () => {
        expect(await collectTaxonomy(['6747308'], reads('Assicurazioni', 'Altro'))).toEqual({
            '6747308': { sector: 'Assicurazioni', role: null },
        });
    });

    it('lets the rest of the batch through when one ad fails', async () => {
        const read = async (id) => {
            if (id === '2') throw new Error('upstream down');
            return { sector: 'IT', role: 'Sviluppatore' };
        };
        const out = await collectTaxonomy(['1', '2', '3'], read);
        expect(Object.keys(out)).toEqual(['1', '3']);
    });

    it('asks upstream exactly once per ad', async () => {
        const read = vi.fn(reads('IT', 'Sviluppatore'));
        await collectTaxonomy(['1', '2', '3', '4', '5'], read);
        expect(read).toHaveBeenCalledTimes(5);
    });

    // The whole cost is one upstream request per ad, so they go out concurrently: a
    // sequential loop over 15 ads at ~1s each would outlive the function's own budget.
    it('runs a batch concurrently rather than one after another', async () => {
        let inFlight = 0;
        let peak = 0;
        const read = async () => {
            inFlight += 1;
            peak = Math.max(peak, inFlight);
            await new Promise(r => setTimeout(r, 5));
            inFlight -= 1;
            return { sector: 'IT', role: 'Sviluppatore' };
        };
        await collectTaxonomy(['1', '2', '3', '4', '5', '6', '7', '8'], read);
        expect(peak).toBe(8);
    });
});

// Measured 09/09/2026 on 15 live ads (3.3 MB of HTML): a cheerio parse of the same pages
// cost 844 ms of active CPU, these regexes under 1 ms. Vercel bills active CPU, so the
// reader must stay off the DOM — these cases pin the two markup shapes it has to handle.
describe('readTaxonomy', () => {
    const page = (body) => async () => body;

    it('reads a span-wrapped value', async () => {
        const html = '<span itemprop="industry">Assicurazioni</span>'
            + '<span itemprop="occupationalCategory">Contabilità/Banca/Finanza</span>';
        expect(await readTaxonomy('1', page(html)))
            .toEqual({ sector: 'Assicurazioni', role: 'Contabilità/Banca/Finanza' });
    });

    it('reads a meta content attribute', async () => {
        const html = '<meta itemprop="industry" content="Informatica">'
            + '<meta itemprop="occupationalCategory" content="Sviluppatore">';
        expect(await readTaxonomy('1', page(html)))
            .toEqual({ sector: 'Informatica', role: 'Sviluppatore' });
    });

    it('drops the placeholder the portal writes on most ads', async () => {
        const html = '<span itemprop="industry">Altro</span>'
            + '<span itemprop="occupationalCategory">Altro</span>';
        expect(await readTaxonomy('1', page(html))).toEqual({ sector: null, role: null });
    });

    it('returns nulls rather than throwing on a page without the microdata', async () => {
        expect(await readTaxonomy('1', page('<html><body>niente</body></html>')))
            .toEqual({ sector: null, role: null });
    });

    it('asks for the ad by its bare numeric id', async () => {
        let asked = null;
        await readTaxonomy('6747308', async (path) => { asked = path; return ''; });
        expect(asked).toBe('/it/careers/jobad/6747308');
    });
});
