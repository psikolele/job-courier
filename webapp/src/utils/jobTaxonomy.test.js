import { describe, it, expect } from 'vitest';
import { deriveSector, deriveRole, sectorLabel, roleLabel, jobIdKey, withDetailTaxonomy } from './jobTaxonomy';

// The list scrape hardcodes "Non specificato" for both fields (see api/_arca24.js),
// so every consumer must treat that string as absent rather than as a value.
describe('sectorLabel / roleLabel', () => {
    const upstreamBlank = {
        title: 'Fachstellenleiter Fertigung 100% (d/m/w)',
        sector: 'Non specificato',
        role: 'Non specificato',
    };

    it('never surfaces the upstream placeholder', () => {
        expect(sectorLabel(upstreamBlank)).not.toMatch(/non specificato/i);
        expect(roleLabel(upstreamBlank)).not.toMatch(/non specificato/i);
    });

    it('infers the role from the title when upstream has none', () => {
        // "Fachstellenleiter" contains "leiter" -> Responsabile, which is what the
        // card in the list already shows for this very offer.
        expect(roleLabel(upstreamBlank)).toBe('Responsabile');
    });

    it('falls back to Altro when neither the field nor the title says anything', () => {
        const opaque = { title: 'Mitarbeiter/in', sector: '', role: '' };
        expect(sectorLabel(opaque)).toBe('Altro');
    });

    it('keeps a real upstream value untouched', () => {
        const real = { title: 'Qualcosa', sector: 'Medicina', role: 'Infermiere' };
        expect(sectorLabel(real)).toBe('Medicina');
        expect(roleLabel(real)).toBe('Infermiere');
    });

    it('survives a missing job object', () => {
        expect(sectorLabel(null)).toBe('Altro');
        expect(roleLabel(undefined)).toBe('Altro');
    });

    // Titles copied from the live feed on 07.09.2026, when the unfiltered /offerte
    // listing showed "SETTORE: ALTRO / RUOLO: ALTRO" on card after card. The listing
    // is four languages deep; these keep the non-Italian ones honest.
    describe('the tags a card actually prints', () => {
        const card = (title) => ({ title, sector: 'Non specificato', role: 'Non specificato' });

        it.each([
            // Accents: the keyword lists spell these without one, and used to miss.
            ['Aide-électricien / aide-électricienne (H/F/D) - Tirage de câbles', 'Costruzioni', 'Installatore'],
            ['Polymécanicien(ne) Tournage 100%', 'Costruzioni', 'Meccanico'],
            // Already worked, and must keep working now that matching folds accents:
            // every accented keyword was rewritten unaccented to stay reachable.
            ['Ingénieur en génie civil 100%', 'Ingegneria', 'Ingegnere'],
            ['Maçon / Maurer (m/w/d)', 'Costruzioni', 'Muratore'],
            ['Gärtner/in 100%', 'Costruzioni', 'Giardiniere'],
            ['Kranführer (m/w/d)', 'Costruzioni', 'Gruista'],
            ['Einkäufer/in 80-100%', 'Amministrazione', 'Responsabile Acquisti'],
            ['Verkäufer/in Detailhandel', 'Commerciale', 'Venditore'],
            ['Sekretär/in 60%', 'Amministrazione', 'Segretario'],
        ])('%s -> %s / %s', (title, sector, role) => {
            expect(sectorLabel(card(title))).toBe(sector);
            expect(roleLabel(card(title))).toBe(role);
        });

        // Accent-folding must not make a keyword match something it never did: the
        // guard is that folding only strips marks, it does not loosen the words.
        it('still says Altro when the title genuinely carries no signal', () => {
            expect(sectorLabel(card('Opérateur/trice 100% CDI'))).toBe('Altro');
        });
    });

    it('agrees with the raw helpers used by the cards', () => {
        const job = { title: 'Autista camion', sector: 'Non specificato', role: 'Non specificato' };
        expect(sectorLabel(job)).toBe(deriveSector(job.title, job.sector));
        expect(roleLabel(job)).toBe(deriveRole(job.role, job.title));
    });
});

// Reported from production on 09/09/2026: the /offerte detail pane printed "Altro /
// Altro" for an ad whose own page states "Assicurazioni / Contabilità/Banca/Finanza".
// The pane had already fetched those values and was reading the list entry instead.
describe('withDetailTaxonomy', () => {
    const listEntry = {
        id: '6747308-senior-actuary-life-expert-m-f-d-zurich',
        jobroom_id: '6747308-senior-actuary-life-expert-m-f-d-zurich',
        title: 'Senior Actuary Life Expert (m/f/d)',
        sector: 'Non specificato',
        role: 'Non specificato',
    };
    const detail = { id: '6747308', sector: 'Assicurazioni', role: 'Contabilità/Banca/Finanza' };

    it('prints what the ad states, not what the title suggests', () => {
        // Without the detail the title matches no keyword rule, so both fall back.
        expect(sectorLabel(listEntry)).toBe('Altro');
        expect(roleLabel(listEntry)).toBe('Altro');

        const shown = withDetailTaxonomy(listEntry, detail);
        expect(sectorLabel(shown)).toBe('Assicurazioni');
        expect(roleLabel(shown)).toBe('Contabilità/Banca/Finanza');
    });

    it('matches the two id spellings of the same ad', () => {
        expect(jobIdKey(listEntry.id)).toBe(jobIdKey(detail.id));
    });

    it('ignores a detail belonging to another ad', () => {
        const other = { id: '9999999', sector: 'Costruzioni', role: 'Muratore' };
        expect(withDetailTaxonomy(listEntry, other)).toBe(listEntry);
    });

    it('keeps the inference when the detail states nothing', () => {
        const blank = { id: '6747308', sector: '', role: null };
        expect(withDetailTaxonomy(listEntry, blank).sector).toBe('Non specificato');
    });

    it('is a no-op without a detail', () => {
        expect(withDetailTaxonomy(listEntry, null)).toBe(listEntry);
    });

    it('does not collapse synthetic ids into one another', () => {
        expect(jobIdKey('job-12')).not.toBe(jobIdKey('job-13'));
    });
});
