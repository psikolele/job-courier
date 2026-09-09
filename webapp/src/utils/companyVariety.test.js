import { describe, it, expect } from 'vitest';
import { promoteCompanyVariety, companyBucket, LIST_COMPANY_CAP } from './companyVariety';

const job = (id, name) => ({ id, company: { name } });

describe('promoteCompanyVariety', () => {
    it('puts at most `cap` ads per employer on the first screen', () => {
        const jobs = [
            ...Array.from({ length: 6 }, (_, i) => job(`m${i}`, 'Manpower')),
            job('a0', 'Adecco'),
            job('r0', 'Randstad Svizzera SA'),
        ];
        const out = promoteCompanyVariety(jobs, 3);
        expect(out.slice(0, 5).map(j => j.id)).toEqual(['m0', 'm1', 'm2', 'a0', 'r0']);
    });

    it('drops nothing — the overflow follows behind, in order', () => {
        const jobs = Array.from({ length: 6 }, (_, i) => job(`m${i}`, 'Manpower'));
        const out = promoteCompanyVariety(jobs, 3);
        expect(out.map(j => j.id)).toEqual(['m0', 'm1', 'm2', 'm3', 'm4', 'm5']);
        expect(out).toHaveLength(jobs.length);
    });

    it('collapses legal suffixes into one employer', () => {
        expect(companyBucket(job(1, 'Adecco'))).toBe(companyBucket(job(2, 'Adecco SA')));
        const out = promoteCompanyVariety(
            [job(1, 'Adecco'), job(2, 'Adecco SA'), job(3, 'Adecco Svizzera SA'), job(4, 'Orienta SA')],
            2,
        );
        expect(out.map(j => j.id)).toEqual([1, 2, 4, 3]);
    });

    it('exempts anonymous ads — they are not one employer', () => {
        const jobs = [
            ...Array.from({ length: 5 }, (_, i) => job(`r${i}`, 'Azienda Riservata')),
            job('a0', 'Adecco'),
        ];
        const out = promoteCompanyVariety(jobs, 3);
        expect(out.map(j => j.id)).toEqual(['r0', 'r1', 'r2', 'r3', 'r4', 'a0']);
    });

    it('is stable for a list that already varies', () => {
        const jobs = [job(1, 'Adecco'), job(2, 'Manpower'), job(3, 'Orienta SA')];
        expect(promoteCompanyVariety(jobs, LIST_COMPANY_CAP)).toEqual(jobs);
    });

    it('tolerates an empty or absent list', () => {
        expect(promoteCompanyVariety([])).toEqual([]);
        expect(promoteCompanyVariety(undefined)).toEqual([]);
    });
});
