import { describe, it, expect } from 'vitest';
import { formatLocation } from './formatLocation';

describe('formatLocation', () => {
    it('drops the country, which is always Switzerland', () => {
        expect(formatLocation('Svizzera, Ticino, Mendrisio')).toBe('Ticino, Mendrisio');
    });

    it('spells out a two-letter canton code', () => {
        // Upstream writes these lowercase-titlecased ("Ag"), which read as a typo.
        expect(formatLocation('Svizzera, Baden, Ag')).toBe('Baden, Argovia');
        // Town and canton are the same place here, so it is said once — see the
        // duplicate-collapsing test below.
        expect(formatLocation('Svizzera, Lucerne, Lu')).toBe('Lucerna');
    });

    it('translates a canton named in German or French', () => {
        expect(formatLocation('Svizzera, Sarnen, Obwalden')).toBe('Sarnen, Obvaldo');
        expect(formatLocation('Svizzera, Stans, Nidwalden')).toBe('Stans, Nidvaldo');
        expect(formatLocation('Svizzera, Sempach, Luzern')).toBe('Sempach, Lucerna');
        expect(formatLocation('Svizzera, Bubendorf, Baselland')).toBe('Bubendorf, Basilea Campagna');
        expect(formatLocation('Svizzera, Delémont, Jura')).toBe('Delémont, Giura');
    });

    it('strips a postcode', () => {
        expect(formatLocation('Svizzera, 4600 Olten')).toBe('Olten');
    });

    it('leaves a town alone when upstream names no canton', () => {
        // Guessing the canton from the town would mean mirroring ~2000 municipalities;
        // the honest output is the town on its own.
        expect(formatLocation('Svizzera, Emmen')).toBe('Emmen');
        expect(formatLocation('Svizzera, Illnau')).toBe('Illnau');
    });

    it('never mistakes a town for a canton code', () => {
        // "Zug" is both a canton and its capital; a bare town must not be rewritten
        // into a canton name it did not carry.
        expect(formatLocation('Svizzera, Chiasso')).toBe('Chiasso');
    });

    it('keeps a canton already written in Italian', () => {
        expect(formatLocation('Svizzera, Bellinzona, Ticino')).toBe('Bellinzona, Ticino');
    });


    it('normalises a canton written first, which the feed also does', () => {
        // Randstad ads arrive as "Ticino, Chiasso, Bellinzona" — canton leading.
        // Left untranslated, one Italian list showed both "Tessin" and "Ticino".
        expect(formatLocation('Svizzera, Tessin, Mendrisio')).toBe('Ticino, Mendrisio');
        expect(formatLocation('Svizzera, Waadt, Nyon')).toBe('Vaud, Nyon');
        expect(formatLocation('Svizzera, Ticino, Chiasso, Bellinzona')).toBe('Ticino, Chiasso, Bellinzona');
    });

    it('does not rewrite a leading town that shares its canton name', () => {
        // Zug, Basel, Zurigo and friends name both a canton and its capital. In
        // leading position the part is the town, so it must stay the town.
        expect(formatLocation('Svizzera, Zug, Baar')).toBe('Zug, Baar');
        expect(formatLocation('Svizzera, Basel, Riehen')).toBe('Basel, Riehen');
    });

    it('says a place once when town and canton are the same place', () => {
        expect(formatLocation('Svizzera, Zürich, Zürich')).toBe('Zurigo');
        expect(formatLocation('Svizzera, Genève, Genève')).toBe('Ginevra');
        expect(formatLocation('Svizzera, Zug, Zug')).toBe('Zugo');
    });

    it('handles empty and missing input', () => {
        expect(formatLocation('')).toBe('');
        expect(formatLocation(null)).toBe('');
        expect(formatLocation('Svizzera')).toBe('');
    });
});
