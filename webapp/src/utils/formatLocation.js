// How an offer's location is printed on a card or a detail header.
//
// This lived inline, three identical times (Filters, Offerte, OffertaDettaglio),
// and did one thing: drop the country. What arrived from upstream kept its own
// spelling, and upstream is not consistent — the same list carries "Baden, Ag",
// "Sempach, Luzern", "Lucerne, Lu", "4600 Olten" and a bare "Emmen". On an
// Italian page that reads as four different conventions and one apparent typo.
//
// So the canton is normalised to the name the rest of the site already uses (the
// Italian names in searchData's CANTONS, which is what the search select shows in
// every language). A postcode is dropped: it is noise next to a town name.
//
// What is deliberately NOT done: inferring a canton for the offers that name only
// a town. That needs a table of ~2000 municipalities — a mirror of someone else's
// data, of exactly the kind whose silent drift is documented in searchData.js. A
// town on its own is printed as a town on its own.

// Canton names as the site writes them, keyed by their code, plus the German,
// French and English spellings upstream actually sends. Twenty-six entries that
// do not change — unlike the upstream facet ids this file deliberately avoids.
const CANTON_BY_ALIAS = new Map();

const CANTON_TABLE = [
    ['AG', 'Argovia', ['aargau', 'argovie']],
    ['AI', 'Appenzello Interno', ['appenzell innerrhoden', 'appenzell rhodes-interieures']],
    ['AR', 'Appenzello Esterno', ['appenzell ausserrhoden', 'appenzell rhodes-exterieures']],
    ['BE', 'Berna', ['bern', 'berne']],
    ['BL', 'Basilea Campagna', ['basel-landschaft', 'baselland', 'bale-campagne']],
    ['BS', 'Basilea', ['basel-stadt', 'basel', 'bale-ville', 'bale']],
    ['FR', 'Friburgo', ['freiburg', 'fribourg']],
    ['GE', 'Ginevra', ['genf', 'geneve', 'geneva']],
    ['GL', 'Glarona', ['glarus', 'glaris']],
    ['GR', 'Grigioni', ['graubunden', 'graubuenden', 'grisons']],
    ['JU', 'Giura', ['jura']],
    ['LU', 'Lucerna', ['luzern', 'lucerne']],
    ['NE', 'Neuchâtel', ['neuenburg', 'neuchatel']],
    ['NW', 'Nidvaldo', ['nidwalden', 'nidwald']],
    ['OW', 'Obvaldo', ['obwalden', 'obwald']],
    ['SG', 'San Gallo', ['st. gallen', 'st gallen', 'sankt gallen', 'saint-gall']],
    ['SH', 'Sciaffusa', ['schaffhausen', 'schaffhouse']],
    ['SO', 'Soletta', ['solothurn', 'soleure']],
    ['SZ', 'Svitto', ['schwyz']],
    ['TG', 'Turgovia', ['thurgau', 'thurgovie']],
    ['TI', 'Ticino', ['tessin']],
    ['UR', 'Uri', []],
    ['VD', 'Vaud', ['waadt']],
    ['VS', 'Vallese', ['wallis', 'valais']],
    ['ZG', 'Zugo', ['zug']],
    ['ZH', 'Zurigo', ['zurich', 'zuerich']],
];

// Accents and case are stripped for lookup so "Genève" and "Geneve" both land.
const normaliseKey = (value) => String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

for (const [code, italian, aliases] of CANTON_TABLE) {
    CANTON_BY_ALIAS.set(normaliseKey(code), italian);
    CANTON_BY_ALIAS.set(normaliseKey(italian), italian);
    for (const alias of aliases) CANTON_BY_ALIAS.set(normaliseKey(alias), italian);
}

const COUNTRY = /^(svizzera|switzerland|suisse|schweiz|schweizer|ch)$/i;

/**
 * A canton name only where upstream put one.
 *
 * Only the LAST part is considered. "Zug" and "Basel" name both a canton and its
 * capital, so treating any part as a canton would rewrite the town "Zug" into the
 * canton "Zugo" — inventing a location the ad never claimed. The trailing part is
 * where upstream writes the canton when it writes one at all.
 */
const cantonName = (part) => CANTON_BY_ALIAS.get(normaliseKey(part)) || null;

/** Swiss postcodes are four digits, and always lead the town they belong to. */
const stripPostcode = (part) => part.replace(/^\d{4}\s+/, '').trim();

export const formatLocation = (loc) => {
    if (!loc) return '';

    const parts = String(loc)
        .split(',')
        .map(p => p.trim())
        .filter(p => p && !COUNTRY.test(p))
        .map(stripPostcode)
        .filter(Boolean);

    if (parts.length === 0) return '';

    const last = parts.length - 1;
    const canton = parts.length > 1 ? cantonName(parts[last]) : null;
    if (canton) parts[last] = canton;

    return parts.join(', ');
};

export default formatLocation;
