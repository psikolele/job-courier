/**
 * localeRegion — resolves a free-text job location into a Swiss canton and a
 * language region ('it' | 'de' | 'fr').
 *
 * Pure module: no React, no Node. Safe to import from client code and tests.
 *
 * Calibrated on the live jobroom feed (150 jobs, 10 pages). The upstream
 * `Sede:` field is always shaped `"Svizzera, <A>, <B>[, <C>]"` where the canton
 * token can sit in any position and appears as:
 *   - a Title-Case abbreviation  ("Baden, Ag" / "Lugano, Ti")
 *   - a full name in DE/IT/FR    ("Baden, Aargau" / "Lucerna, Rothenburg")
 *   - not at all, when the string is truncated at 40 chars
 *     ("Rapperswil-Jona, Freienbach, S")
 * so we scan every token instead of assuming a position.
 */

/** Base language of each canton, used when no city-level override applies. */
export const CANTON_LANGUAGE = {
    AG: 'de', AI: 'de', AR: 'de', BE: 'de', BL: 'de', BS: 'de',
    FR: 'fr', GE: 'fr', GL: 'de', GR: 'de', JU: 'fr', LU: 'de',
    NE: 'fr', NW: 'de', OW: 'de', SG: 'de', SH: 'de', SO: 'de',
    SZ: 'de', TG: 'de', TI: 'it', UR: 'de', VD: 'fr', VS: 'fr',
    ZG: 'de', ZH: 'de',
};

/** Cantons per UI language, used by the geographic fallback (see useShowcaseJobs). */
export const LANGUAGE_REGIONS = {
    it: ['TI', 'GR'],
    de: ['ZH', 'BE', 'LU', 'UR', 'SZ', 'OW', 'NW', 'GL', 'ZG', 'SO', 'BS', 'BL',
         'SH', 'AR', 'AI', 'SG', 'AG', 'TG', 'GR', 'VS', 'FR'],
    fr: ['GE', 'VD', 'NE', 'JU', 'FR', 'VS', 'BE'],
};

/** Canton names and abbreviations, normalized. Keys must be lowercase + unaccented. */
const CANTON_TOKENS = {
    // abbreviations
    ag: 'AG', ai: 'AI', ar: 'AR', be: 'BE', bl: 'BL', bs: 'BS', fr: 'FR',
    ge: 'GE', gl: 'GL', gr: 'GR', ju: 'JU', lu: 'LU', ne: 'NE', nw: 'NW',
    ow: 'OW', sg: 'SG', sh: 'SH', so: 'SO', sz: 'SZ', tg: 'TG', ti: 'TI',
    ur: 'UR', vd: 'VD', vs: 'VS', zg: 'ZG', zh: 'ZH',
    // German
    aargau: 'AG', 'appenzell ausserrhoden': 'AR', 'appenzell innerrhoden': 'AI',
    bern: 'BE', 'basel-landschaft': 'BL', baselland: 'BL', 'basel-stadt': 'BS',
    basel: 'BS', freiburg: 'FR', genf: 'GE', glarus: 'GL', graubunden: 'GR',
    jura: 'JU', luzern: 'LU', neuenburg: 'NE', nidwalden: 'NW', obwalden: 'OW',
    'st. gallen': 'SG', 'st gallen': 'SG', 'sankt gallen': 'SG',
    schaffhausen: 'SH', solothurn: 'SO', schwyz: 'SZ', thurgau: 'TG',
    tessin: 'TI', uri: 'UR', waadt: 'VD', wallis: 'VS', zug: 'ZG', zurich: 'ZH',
    // Italian
    argovia: 'AG', 'appenzello esterno': 'AR', 'appenzello interno': 'AI',
    berna: 'BE', 'basilea campagna': 'BL', 'basilea citta': 'BS', basilea: 'BS',
    friburgo: 'FR', ginevra: 'GE', glarona: 'GL', grigioni: 'GR', giura: 'JU',
    lucerna: 'LU', nidvaldo: 'NW', obvaldo: 'OW', 'san gallo': 'SG',
    sciaffusa: 'SH', soletta: 'SO', svitto: 'SZ', turgovia: 'TG', ticino: 'TI',
    vallese: 'VS', zugo: 'ZG', zurigo: 'ZH',
    // French
    argovie: 'AG', berne: 'BE', 'bale-campagne': 'BL', 'bale-ville': 'BS',
    bale: 'BS', fribourg: 'FR', geneve: 'GE', glaris: 'GL', grisons: 'GR',
    lucerne: 'LU', neuchatel: 'NE', nidwald: 'NW', obwald: 'OW',
    'saint-gall': 'SG', schaffhouse: 'SH', soleure: 'SO', schwytz: 'SZ',
    thurgovie: 'TG', valais: 'VS', vaud: 'VD', zoug: 'ZG',
};

/**
 * City → canton. Only needed when no canton token survives (40-char truncation)
 * plus the main cities, which makes the resolver robust if upstream changes shape.
 */
const CITY_CANTON = {
    // observed truncations in the live feed
    bellach: 'SO', lommiswil: 'SO', selzach: 'SO', deitingen: 'SO',
    derendingen: 'SO', luterbach: 'SO', oensingen: 'SO', kestenholz: 'SO',
    niederbipp: 'BE', 'rapperswil-jona': 'SG', freienbach: 'SZ',
    rothenburg: 'LU', baar: 'ZG',
    // main cities, for resilience
    winterthur: 'ZH', uster: 'ZH', dietikon: 'ZH', schlieren: 'ZH',
    adliswil: 'ZH', wallisellen: 'ZH', kilchberg: 'ZH', bulach: 'ZH',
    bubikon: 'ZH', ruti: 'ZH', rafz: 'ZH', fehraltorf: 'ZH', bruttisellen: 'ZH',
    oberuzwil: 'SG', weinfelden: 'TG', raperswilen: 'TG', ebikon: 'LU',
    thun: 'BE', biel: 'BE', bienne: 'BE', interlaken: 'BE', burgdorf: 'BE',
    herzogenbuchsee: 'BE', ligerz: 'BE', moutier: 'BE', tavannes: 'BE',
    'saint-imier': 'BE', 'la neuveville': 'BE', tramelan: 'BE',
    emmen: 'LU', kriens: 'LU', horw: 'LU', hitzkirch: 'LU', dagmersellen: 'LU',
    sursee: 'LU', altdorf: 'UR', goschenen: 'UR', sarnen: 'OW', stans: 'NW',
    glarus: 'GL', cham: 'ZG', zugerberg: 'ZG', hunenberg: 'ZG',
    rotkreuz: 'ZG', risch: 'ZG', 'risch-rotkreuz': 'ZG',
    olten: 'SO', grenchen: 'SO', zuchwil: 'SO', egerkingen: 'SO',
    gunzgen: 'SO', hagendorf: 'SO', allschwil: 'BL', liestal: 'BL',
    muttenz: 'BL', reinach: 'BL', munchenstein: 'BL', pratteln: 'BL',
    herisau: 'AR', appenzell: 'AI', wil: 'SG', rorschach: 'SG', buchs: 'SG',
    bazenheid: 'SG', 'rapperswil': 'SG', gossau: 'SG', altstatten: 'SG',
    aarau: 'AG', baden: 'AG', brugg: 'AG', lenzburg: 'AG', wohlen: 'AG',
    rupperswil: 'AG', schafisheim: 'AG', oberentfelden: 'AG',
    unterentfelden: 'AG', suhr: 'AG', birr: 'AG', rothrist: 'AG',
    vordemwald: 'AG', sarmenstorf: 'AG', fahrwangen: 'AG', munchwilen: 'AG',
    windisch: 'AG', rufenach: 'AG', erlinsbach: 'AG',
    frauenfeld: 'TG', amriswil: 'TG', kreuzlingen: 'TG', arbon: 'TG',
    lugano: 'TI', bellinzona: 'TI', locarno: 'TI', mendrisio: 'TI',
    chiasso: 'TI', ascona: 'TI', biasca: 'TI', novazzano: 'TI',
    luganese: 'TI', bellinzonese: 'TI', sottoceneri: 'TI', sopraceneri: 'TI',
    mendrisiotto: 'TI', locarnese: 'TI', malcantone: 'TI',
    agno: 'TI', croglio: 'TI', taverne: 'TI', stabio: 'TI', losone: 'TI',
    chur: 'GR', davos: 'GR', ilanz: 'GR', poschiavo: 'GR', roveredo: 'GR',
    lausanne: 'VD', montreux: 'VD', nyon: 'VD', vevey: 'VD', yverdon: 'VD',
    morges: 'VD', renens: 'VD', 'yverdon-les-bains': 'VD', aigle: 'VD',
    carouge: 'GE', meyrin: 'GE', vernier: 'GE', lancy: 'GE',
    'petit-lancy': 'GE', 'grand-lancy': 'GE',
    sion: 'VS', martigny: 'VS', monthey: 'VS', sierre: 'VS', brig: 'VS',
    visp: 'VS', naters: 'VS', zermatt: 'VS',
    'la chaux-de-fonds': 'NE', 'chaux de fonds': 'NE', 'le locle': 'NE',
    delemont: 'JU', porrentruy: 'JU',
    bulle: 'FR', romont: 'FR', murten: 'FR', dudingen: 'FR', tafers: 'FR',
    schaffhausen: 'SH',
};

/**
 * City-level language overrides inside the four multilingual cantons.
 * Laura's decision: split by city, not whole canton — fewer false positives.
 */
const CITY_LANGUAGE = {
    // Grigioni — Italian-speaking valleys (Moesa, Bregaglia, Poschiavo, Calanca)
    poschiavo: 'it', brusio: 'it', bregaglia: 'it', vicosoprano: 'it',
    castasegna: 'it', mesocco: 'it', roveredo: 'it', 'san vittore': 'it',
    grono: 'it', cama: 'it', lostallo: 'it', soazza: 'it', moesa: 'it',
    mesolcina: 'it', calanca: 'it', 'val calanca': 'it', 'val bregaglia': 'it',
    // Valais — German-speaking Oberwallis (canton defaults to fr)
    brig: 'de', 'brig-glis': 'de', visp: 'de', naters: 'de', zermatt: 'de',
    'saas-fee': 'de', leuk: 'de', raron: 'de', fiesch: 'de', glis: 'de',
    gampel: 'de', turtmann: 'de', susten: 'de', steg: 'de', oberwallis: 'de',
    // Bern — French-speaking Jura bernois (canton defaults to de)
    bienne: 'fr', 'biel/bienne': 'fr', moutier: 'fr', tavannes: 'fr',
    'saint-imier': 'fr', 'la neuveville': 'fr', tramelan: 'fr',
    courtelary: 'fr', reconvilier: 'fr', sonceboz: 'fr', corgemont: 'fr',
    // Fribourg — German-speaking Sensebezirk / Seebezirk (canton defaults to fr)
    murten: 'de', dudingen: 'de', tafers: 'de', kerzers: 'de', wunnewil: 'de',
    schmitten: 'de', bosingen: 'de', uberstorf: 'de', plaffeien: 'de',
    guin: 'de',
};

const COUNTRY_TOKENS = new Set([
    'svizzera', 'switzerland', 'suisse', 'schweiz', 'ch', 'svizra',
]);

/** Cantons whose language depends on the city (see CITY_LANGUAGE). */
const MULTILINGUAL_CANTONS = new Set(['GR', 'VS', 'BE', 'FR']);

/** Lowercase, strip diacritics, collapse whitespace. */
export function normalizeLoc(value) {
    if (!value) return '';
    return String(value)
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}

/** Split a location string into normalized, meaningful tokens. */
function tokenize(location) {
    return normalizeLoc(location)
        .split(',')
        .map(t => t.replace(/[.]+$/, '').trim())
        .filter(t => t.length > 0 && !COUNTRY_TOKENS.has(t));
}

const TRAILING_CODE = /^(.+?)\s+(ag|ai|ar|be|bl|bs|fr|ge|gl|gr|ju|lu|ne|nw|ow|sg|sh|so|sz|tg|ti|ur|vd|vs|zg|zh)$/;

/**
 * A token may carry a trailing canton code ("emmen lu", "pfaffikon sz",
 * "suhr ag", "mezzovico ti"). Return the token without it so city lookups match.
 */
function stripTrailingCantonCode(token) {
    const m = token.match(TRAILING_CODE);
    return m ? m[1].trim() : token;
}

/** Canton carried as a trailing code inside a token, or null. */
function trailingCantonCode(token) {
    const m = token.match(TRAILING_CODE);
    return m ? CANTON_TOKENS[m[2]] : null;
}

/**
 * Resolve a free-text location into `{ canton, lang, city }`.
 * Returns nulls when nothing matches — callers must treat that as a wildcard,
 * never as a reason to drop the job.
 */
export function resolveLocation(location) {
    const tokens = tokenize(location);
    if (tokens.length === 0) return { canton: null, lang: null, city: null };

    const bare = tokens.map(stripTrailingCantonCode);

    // 1. Canton token, scanning right to left (the canton usually trails).
    //    A whole-token match wins over a code embedded in a longer token, so
    //    "Emmen LU, Luzern" and "Mezzovico TI, Svizzera" both resolve.
    let canton = null;
    for (let i = tokens.length - 1; i >= 0 && !canton; i--) {
        canton = CANTON_TOKENS[tokens[i]] || null;
    }
    for (let i = tokens.length - 1; i >= 0 && !canton; i--) {
        canton = trailingCantonCode(tokens[i]);
    }

    // 2. No canton token (truncated string) — fall back to the city dictionary,
    //    left to right so the primary location wins over secondary ones.
    let city = null;
    if (!canton) {
        for (let i = 0; i < bare.length && !canton; i++) {
            if (CITY_CANTON[bare[i]]) {
                canton = CITY_CANTON[bare[i]];
                city = bare[i];
            }
        }
    }

    // 2b. Last resort: match single words inside a token. Covers formats that
    //     pack a postcode or a street next to the city ("6003 Luzern"), which
    //     the current feed never emits but other sources might.
    if (!canton) {
        for (let i = 0; i < bare.length && !canton; i++) {
            for (const word of bare[i].split(/[^a-z0-9-]+/)) {
                if (word.length < 3) continue;
                if (CITY_CANTON[word]) { canton = CITY_CANTON[word]; city = word; break; }
                if (CANTON_TOKENS[word]) { canton = CANTON_TOKENS[word]; break; }
            }
        }
    }

    if (!canton) return { canton: null, lang: null, city: null };

    // 3. Language: city-level override inside multilingual cantons, else base.
    let lang = CANTON_LANGUAGE[canton] || null;
    if (MULTILINGUAL_CANTONS.has(canton)) {
        for (const token of bare) {
            const override = CITY_LANGUAGE[token];
            if (override) {
                lang = override;
                city = city || token;
                break;
            }
        }
    }

    return { canton, lang, city };
}

/** Convenience wrapper: language region of a location, or null if unknown. */
export function resolveLangRegion(location) {
    return resolveLocation(location).lang;
}

/** UI language → language region. English mirrors Italian (Laura's decision). */
export function regionForLang(uiLang) {
    const base = String(uiLang || 'it').slice(0, 2).toLowerCase();
    if (base === 'en') return 'it';
    return ['it', 'de', 'fr'].includes(base) ? base : 'it';
}

/** Cantons considered adjacent/acceptable for a UI language (fallback level 2). */
export function cantonsForLang(uiLang) {
    return LANGUAGE_REGIONS[regionForLang(uiLang)] || [];
}
