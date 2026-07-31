import { describe, it, expect } from 'vitest';
import { resolveLocation, regionForLang, normalizeLoc } from './localeRegion';

/**
 * Every distinct `Sede:` string returned by the live jobroom feed
 * (10 pages, 150 jobs, captured 2026-07-29). Not the mocks in Filters.jsx —
 * those are 100% Ticino and would give false confidence.
 */
const LIVE_LOCATIONS = [
    ['Svizzera, Aarau, Aargau', 'AG', 'de'],
    ['Svizzera, Aarau, Ag', 'AG', 'de'],
    ['Svizzera, Aargau, Aargau', 'AG', 'de'],
    ['Svizzera, Adliswil, Zh', 'ZH', 'de'],
    ['Svizzera, Allschwil, Bl', 'BL', 'de'],
    ['Svizzera, Amriswil, Tg', 'TG', 'de'],
    ['Svizzera, Ascona, Ti', 'TI', 'it'],
    ['Svizzera, Bachenbülach, Zh', 'ZH', 'de'],
    ['Svizzera, Baden, Aargau', 'AG', 'de'],
    ['Svizzera, Baden, Ag', 'AG', 'de'],
    ['Svizzera, Basel, Basel', 'BS', 'de'],
    ['Svizzera, Basel, Basel-Stadt', 'BS', 'de'],
    ['Svizzera, Basel, Bs', 'BS', 'de'],
    ['Svizzera, Baselland, Bl', 'BL', 'de'],
    ['Svizzera, Basilea Campagna, Baselland', 'BL', 'de'],
    ['Svizzera, Bellach, Lommiswil, Selzach, S', 'SO', 'de'],
    ['Svizzera, Bellinzonese, Ti', 'TI', 'it'],
    ['Svizzera, Bern, Be', 'BE', 'de'],
    ['Svizzera, Birr, Aargau', 'AG', 'de'],
    ['Svizzera, Birr, Ag', 'AG', 'de'],
    ['Svizzera, Brugg, Aargau', 'AG', 'de'],
    ['Svizzera, Brugg, Rüfenach, Windisch, Ag', 'AG', 'de'],
    ['Svizzera, Brüttisellen, Zh', 'ZH', 'de'],
    ['Svizzera, Buchs, Aargau', 'AG', 'de'],
    ['Svizzera, Burg, Ag', 'AG', 'de'],
    ['Svizzera, Cham, Zg', 'ZG', 'de'],
    ['Svizzera, Chaux de fonds, Ne', 'NE', 'fr'],
    ['Svizzera, Dagmersellen, Lu', 'LU', 'de'],
    ['Svizzera, Deitingen, Derendingen, Luterb', 'SO', 'de'],
    ['Svizzera, Egerkingen, So', 'SO', 'de'],
    ['Svizzera, Egerkingen, Solothurn', 'SO', 'de'],
    ['Svizzera, Emmen LU, Luzern', 'LU', 'de'],
    ['Svizzera, Erlinsbach AG, Aargau', 'AG', 'de'],
    ['Svizzera, Fahrwangen, Ag', 'AG', 'de'],
    ['Svizzera, Fribourg, Fr', 'FR', 'fr'],
    ['Svizzera, Ginevra, Genève', 'GE', 'fr'],
    ['Svizzera, Gunzgen, So', 'SO', 'de'],
    ['Svizzera, Göschenen, Ur', 'UR', 'de'],
    ['Svizzera, Herzogenbuchsee, Bern', 'BE', 'de'],
    ['Svizzera, Hitzkirch, Lu', 'LU', 'de'],
    ['Svizzera, Horw, Lu', 'LU', 'de'],
    ['Svizzera, Hägendorf, So', 'SO', 'de'],
    ['Svizzera, Hünenberg, Zug', 'ZG', 'de'],
    ['Svizzera, Ilanz, Graubünden', 'GR', 'de'],
    ['Svizzera, Interlaken, Be', 'BE', 'de'],
    ['Svizzera, Kilchberg, Zh', 'ZH', 'de'],
    ['Svizzera, La Chaux-de-Fonds, Ne', 'NE', 'fr'],
    ['Svizzera, Lenzburg, Aargau', 'AG', 'de'],
    ['Svizzera, Ligerz, Be', 'BE', 'de'],
    ['Svizzera, Locarno, Ti', 'TI', 'it'],
    ['Svizzera, Lucerna, Luzern', 'LU', 'de'],
    ['Svizzera, Lucerna, Rothenburg', 'LU', 'de'],
    ['Svizzera, Luganese, Ti', 'TI', 'it'],
    ['Svizzera, Luzern, Lu', 'LU', 'de'],
    ['Svizzera, Martigny, Valais', 'VS', 'fr'],
    ['Svizzera, Martigny, Vs', 'VS', 'fr'],
    ['Svizzera, Mendrisio, Ti', 'TI', 'it'],
    ['Svizzera, Monthey, Valais', 'VS', 'fr'],
    ['Svizzera, Monthey, Vs', 'VS', 'fr'],
    ['Svizzera, Münchenstein, Bl', 'BL', 'de'],
    ['Svizzera, Münchwilen, Ag', 'AG', 'de'],
    ['Svizzera, Novazzano, Ti', 'TI', 'it'],
    ['Svizzera, Oberentfelden, Aargau', 'AG', 'de'],
    ['Svizzera, Oensingen, Niederbipp, Kestenh', 'SO', 'de'],
    ['Svizzera, Olten, Solothurn', 'SO', 'de'],
    ['Svizzera, Petit-Lancy, Ge', 'GE', 'fr'],
    ['Svizzera, Pfäffikon SZ, Sz', 'SZ', 'de'],
    ['Svizzera, Rapperswil-Jona, Freienbach, S', 'SG', 'de'],
    ['Svizzera, Reinach, Ag', 'AG', 'de'],
    ['Svizzera, Rothrist, Vordemwald, Ag', 'AG', 'de'],
    ['Svizzera, Rupperswil, Aargau', 'AG', 'de'],
    ['Svizzera, Sarmenstorf, Ag', 'AG', 'de'],
    ['Svizzera, Schafisheim, Aargau', 'AG', 'de'],
    ['Svizzera, Schlieren, Zh', 'ZH', 'de'],
    ['Svizzera, Schwyz, Sz', 'SZ', 'de'],
    ['Svizzera, Sierre, Vs', 'VS', 'fr'],
    ['Svizzera, Sion, Valais', 'VS', 'fr'],
    ['Svizzera, Sion, Vs', 'VS', 'fr'],
    ['Svizzera, Solothurn, So', 'SO', 'de'],
    ['Svizzera, Stans, Nw', 'NW', 'de'],
    ['Svizzera, Suhr AG, Aargau', 'AG', 'de'],
    ['Svizzera, Suhr, Aargau', 'AG', 'de'],
    ['Svizzera, Thun, Be', 'BE', 'de'],
    ['Svizzera, Ticino, Bellinzona', 'TI', 'it'],
    ['Svizzera, Ticino, Bellinzona, Bellinzona', 'TI', 'it'],
    ['Svizzera, Ticino, Lugano', 'TI', 'it'],
    ['Svizzera, Ticino, Lugano, Lugano', 'TI', 'it'],
    ['Svizzera, Ticino, Mendrisio, Lugano', 'TI', 'it'],
    ['Svizzera, Unterentfelden, Aargau', 'AG', 'de'],
    ['Svizzera, Vaud, Lausanne', 'VD', 'fr'],
    ['Svizzera, Wallisellen, Zh', 'ZH', 'de'],
    ['Svizzera, Wohlen, Ag', 'AG', 'de'],
    ['Svizzera, Zuchwil, So', 'SO', 'de'],
    ['Svizzera, Zuchwil, Solothurn', 'SO', 'de'],
    ['Svizzera, Zug, Zg', 'ZG', 'de'],
    ['Svizzera, Zugerberg, Zg', 'ZG', 'de'],
    ['Svizzera, Zugo, Baar', 'ZG', 'de'],
    ['Svizzera, Zurich, Zh', 'ZH', 'de'],
    ['Svizzera, Zurigo, Zh', 'ZH', 'de'],
    ['Svizzera, Zürich, Zh', 'ZH', 'de'],
    ['Svizzera, Zürich, Zürich', 'ZH', 'de'],
];

describe('resolveLocation — live feed strings', () => {
    it.each(LIVE_LOCATIONS)('%s → %s / %s', (input, canton, lang) => {
        const got = resolveLocation(input);
        expect(got.canton).toBe(canton);
        expect(got.lang).toBe(lang);
    });

    it('resolves every live location (no nulls)', () => {
        const unresolved = LIVE_LOCATIONS
            .map(([loc]) => [loc, resolveLocation(loc).canton])
            .filter(([, canton]) => canton === null);
        expect(unresolved).toEqual([]);
    });
});

describe('resolveLocation — multilingual cantons split by city', () => {
    it('Oberwallis is German even though Valais defaults to French', () => {
        expect(resolveLocation('Svizzera, Brig, Vs')).toMatchObject({ canton: 'VS', lang: 'de' });
        expect(resolveLocation('Svizzera, Visp, Valais')).toMatchObject({ canton: 'VS', lang: 'de' });
        expect(resolveLocation('Svizzera, Sion, Vs')).toMatchObject({ canton: 'VS', lang: 'fr' });
    });

    it('Jura bernois is French even though Bern defaults to German', () => {
        expect(resolveLocation('Svizzera, Moutier, Be')).toMatchObject({ canton: 'BE', lang: 'fr' });
        expect(resolveLocation('Svizzera, Thun, Be')).toMatchObject({ canton: 'BE', lang: 'de' });
    });

    it('Italian-speaking Grigioni valleys are Italian', () => {
        expect(resolveLocation('Svizzera, Poschiavo, Gr')).toMatchObject({ canton: 'GR', lang: 'it' });
        expect(resolveLocation('Svizzera, Roveredo, Grigioni')).toMatchObject({ canton: 'GR', lang: 'it' });
        expect(resolveLocation('Svizzera, Davos, Gr')).toMatchObject({ canton: 'GR', lang: 'de' });
    });

    it('German-speaking Sensebezirk is German even though Fribourg defaults to French', () => {
        expect(resolveLocation('Svizzera, Murten, Fr')).toMatchObject({ canton: 'FR', lang: 'de' });
        expect(resolveLocation('Svizzera, Bulle, Fr')).toMatchObject({ canton: 'FR', lang: 'fr' });
    });
});

describe('resolveLocation — formats the current feed does not emit', () => {
    it('finds the city next to a postcode', () => {
        expect(resolveLocation('Switzerland, 6003 Luzern')).toMatchObject({ canton: 'LU', lang: 'de' });
        expect(resolveLocation('Svizzera, 6900 Lugano')).toMatchObject({ canton: 'TI', lang: 'it' });
        expect(resolveLocation('Suisse, 1950 Sion')).toMatchObject({ canton: 'VS', lang: 'fr' });
    });

    it('handles the dev mock strings used by Filters.jsx', () => {
        expect(resolveLocation('Mezzovico TI, Svizzera').canton).toBe('TI');
        expect(resolveLocation('Sottoceneri, Svizzera').canton).toBe('TI');
        expect(resolveLocation('Schönbühl BE, Svizzera').canton).toBe('BE');
        expect(resolveLocation('Lugano TI, Svizzera').canton).toBe('TI');
    });
});

describe('resolveLocation — unknown input is a wildcard, not an error', () => {
    it.each([
        'Svizzera',
        'Switzerland',
        '',
        null,
        undefined,
        'Como, Italia',
    ])('%s → null canton', (input) => {
        expect(resolveLocation(input).canton).toBeNull();
    });
});

describe('normalizeLoc', () => {
    it('strips diacritics and lowercases', () => {
        expect(normalizeLoc('Zürich, Genève, Bachenbülach'))
            .toBe('zurich, geneve, bachenbulach');
    });
});

describe('regionForLang', () => {
    it('maps English onto Italian', () => {
        expect(regionForLang('en')).toBe('it');
        expect(regionForLang('en-GB')).toBe('it');
    });

    it('passes through the three Swiss languages', () => {
        expect(regionForLang('it')).toBe('it');
        expect(regionForLang('de')).toBe('de');
        expect(regionForLang('fr')).toBe('fr');
    });

    it('falls back to Italian for anything unknown', () => {
        expect(regionForLang('xx')).toBe('it');
        expect(regionForLang(undefined)).toBe('it');
    });
});
