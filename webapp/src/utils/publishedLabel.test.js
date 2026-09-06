import { describe, it, expect } from 'vitest';
import { splitPublishedLabel } from './publishedLabel';

const NOW = Date.UTC(2026, 7, 10, 9, 30); // 10/08/2026

describe('splitPublishedLabel', () => {
    it('splits the upstream marker off the date', () => {
        expect(splitPublishedLabel('10/08/2026 Nuovo!', NOW)).toEqual({ date: '10/08/2026', isNew: true });
    });

    it('accepts the marker in the other feed languages', () => {
        for (const label of ['10/08/2026 New', '10/08/2026 Neu!', '10/08/2026 Nouveau']) {
            expect(splitPublishedLabel(label, NOW).isNew).toBe(true);
        }
    });

    it('leaves an older date unbadged', () => {
        expect(splitPublishedLabel('20/07/2026', NOW)).toEqual({ date: '20/07/2026', isNew: false });
    });

    it('badges today even when upstream drops the marker', () => {
        expect(splitPublishedLabel('10/08/2026', NOW)).toEqual({ date: '10/08/2026', isNew: true });
    });

    it('drops an unrecognised suffix instead of badging it', () => {
        expect(splitPublishedLabel('20/07/2026 Sponsorizzato', NOW)).toEqual({ date: '20/07/2026', isNew: false });
    });

    it('keeps unparseable text as-is', () => {
        expect(splitPublishedLabel('data non disponibile', NOW)).toEqual({ date: 'data non disponibile', isNew: false });
    });

    it('survives a missing date', () => {
        expect(splitPublishedLabel(null, NOW)).toEqual({ date: '', isNew: false });
        expect(splitPublishedLabel('', NOW)).toEqual({ date: '', isNew: false });
    });
    it('legge il giorno sul calendario locale, non su quello UTC', () => {
        // 06/09/2026 00:30 in Svizzera (CEST) e' ancora il 05/09 a Greenwich.
        const mezzanotteSvizzera = new Date(2026, 8, 6, 0, 30).getTime();
        expect(splitPublishedLabel('06/09/2026', mezzanotteSvizzera).isNew).toBe(true);
        expect(splitPublishedLabel('05/09/2026', mezzanotteSvizzera).isNew).toBe(false);
    });
});
