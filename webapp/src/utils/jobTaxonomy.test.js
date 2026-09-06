import { describe, it, expect } from 'vitest';
import { deriveSector, deriveRole, sectorLabel, roleLabel } from './jobTaxonomy';

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

    it('agrees with the raw helpers used by the cards', () => {
        const job = { title: 'Autista camion', sector: 'Non specificato', role: 'Non specificato' };
        expect(sectorLabel(job)).toBe(deriveSector(job.title, job.sector));
        expect(roleLabel(job)).toBe(deriveRole(job.role, job.title));
    });
});
