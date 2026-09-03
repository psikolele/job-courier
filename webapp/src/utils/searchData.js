/**
 * Single source of truth for what the search form offers and what it sends.
 *
 * It used to be three: this file, `Hero.jsx` and `Filters.jsx` each carried their own copy
 * of the canton and sector tables, and all three had drifted the same way — see the notes
 * on the ids below. Anything that searches imports from here now.
 */

/**
 * Cantons no longer carry an upstream `regionId`.
 *
 * They used to, for nine of twenty-six, and that table was the bug: `3095` for Argovia is
 * in no upstream index, so every Argovia search resolved to no route and answered empty,
 * and the seventeen cantons with no id at all did the same — including six the portal
 * does list (Obvaldo, Sciaffusa, Soletta, Turgovia, Vaud, Zugo). A hand-kept mirror of
 * someone else's ids drifts silently; the failure it produces is an empty page, not an
 * error, so nothing announces it.
 *
 * The canton's name and code are sent instead and the API resolves the facet against the
 * portal's own index (`resolveRegionFacet`). Existing links carrying `?region=…` still
 * work — the API validates that id against the index before using it.
 */
export const CANTONS = [
    { name: 'Appenzello Esterno', value: 'AR' },
    { name: 'Appenzello Interno', value: 'AI' },
    { name: 'Argovia', value: 'AG' },
    { name: 'Basilea', value: 'BS' },
    { name: 'Basilea Campagna', value: 'BL' },
    { name: 'Berna', value: 'BE' },
    { name: 'Friburgo', value: 'FR' },
    { name: 'Ginevra', value: 'GE' },
    { name: 'Giura', value: 'JU' },
    { name: 'Glarona', value: 'GL' },
    { name: 'Grigioni', value: 'GR' },
    { name: 'Lucerna', value: 'LU' },
    { name: 'Neuchâtel', value: 'NE' },
    { name: 'Nidvaldo', value: 'NW' },
    { name: 'Obvaldo', value: 'OW' },
    { name: 'San Gallo', value: 'SG' },
    { name: 'Sciaffusa', value: 'SH' },
    { name: 'Soletta', value: 'SO' },
    { name: 'Svitto', value: 'SZ' },
    { name: 'Ticino', value: 'TI' },
    { name: 'Turgovia', value: 'TG' },
    { name: 'Uri', value: 'UR' },
    { name: 'Vallese', value: 'VS' },
    { name: 'Vaud', value: 'VD' },
    { name: 'Zugo', value: 'ZG' },
    { name: 'Zurigo', value: 'ZH' },
];

/**
 * Sectors, reconciled against the portal's own role index on 03.09.2026.
 *
 * Four entries named roles the portal does not list — "Controllo e certificazione qualità"
 * (231), "Ristorazione/Hotellerie" (220), "Sicurezza/Vigilanza" (233) and "Vendita al
 * dettaglio" (902). They sat in the dropdown, took a click, and returned an empty page
 * every time, because a role the index cannot resolve has no route. They are gone.
 *
 * Eight roles the portal does list were missing from the dropdown and are added here.
 *
 * The `role` slug each entry used to carry was dead weight: the API never forwarded it —
 * `role_id` is what picks the facet — so it only made the URL longer.
 */
export const SECTORS = [
    { name: 'Acquisti/Approvvigionamento', id: '230' },
    { name: 'Amministrazione/Paghe e contributi', id: '213' },
    { name: 'Architettura/Paesaggio/Urbanistica', id: '904' },
    { name: 'Centralino/Segreteria/Servizi generali', id: '901' },
    { name: 'Commerciale/Vendite', id: '234' },
    { name: 'Costruzioni/Mestieri', id: '215' },
    { name: 'Customer Service', id: '216' },
    { name: 'Facility Management/Pulizie', id: '235' },
    { name: 'Finanza/Contabilità/Revisione', id: '212' },
    { name: 'Gestione immobiliare', id: '229' },
    { name: 'Ingegneria/Progettazione', id: '219' },
    { name: 'IT/Technology', id: '236' },
    { name: 'Logistica/Magazzino', id: '224' },
    { name: 'Marketing/Relazioni esterne', id: '226' },
    { name: 'Medicina/Salute', id: '221' },
    { name: 'Produzione/Operations', id: '227' },
    { name: 'Project/Program Management', id: '228' },
    { name: 'Ricerca e sviluppo', id: '232' },
    { name: 'Risorse umane', id: '222' },
    { name: 'Servizi finanziari/Gestione patrimoniale', id: '903' },
    { name: 'Trasporti', id: '900' },
    { name: 'Altro', id: '237' },
];

/**
 * Build the query the offers page and the API both read.
 *
 * The canton goes out as its name *and* its two-letter code: the API resolves the name to
 * an upstream facet, and needs the code to recognise the ads that write their canton as
 * "Locarno, Ti" rather than "Ticino" when it has to filter a pool itself.
 */
export const buildSearchParams = ({ keyword, selectedSector, selectedCanton }) => {
    const params = new URLSearchParams();

    if (selectedCanton) {
        const canton = CANTONS.find(c => c.value === selectedCanton);
        params.set('country', '214');
        params.set('location', canton ? canton.name : selectedCanton);
        params.set('canton', selectedCanton);
    } else {
        params.set('global', '1');
    }

    if (keyword) params.set('keyword', keyword);
    if (selectedSector) params.set('role_id', selectedSector);

    return params;
};

/** Re-select the canton in the form from whatever shape the URL carries. */
export const getCantonValueFromParams = (regionId, location, canton) => {
    if (canton && CANTONS.some(c => c.value === canton)) return canton;
    if (location) {
        const c = CANTONS.find(c => c.name.toLowerCase() === String(location).toLowerCase());
        if (c) return c.value;
    }
    // Links made before cantons stopped carrying ids, and anything the portal itself
    // linked, still arrive as `?region=…`.
    if (regionId) {
        const legacy = LEGACY_REGION_IDS[String(regionId)];
        if (legacy) return legacy;
    }
    return '';
};

/** Only for reading old links; nothing builds these any more. */
const LEGACY_REGION_IDS = {
    '3105': 'BS', '3099': 'BE', '3101': 'GE', '3103': 'GR', '3107': 'LU',
    '3110': 'OW', '3106': 'SG', '3111': 'SH', '3113': 'SO', '3115': 'TI',
    '3114': 'TG', '3118': 'VD', '3119': 'ZG', '3120': 'ZH',
};
