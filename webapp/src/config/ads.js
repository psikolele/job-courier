/**
 * AdSense ad-unit ids, one per placement.
 *
 * These are the `data-ad-slot` values Google issues when a display unit is
 * created in the AdSense account — they are not something we can invent. Until
 * a placement has its id here, `AdSlot` renders nothing at all: an empty box
 * labelled "Annuncio" with no ad in it would be a fake ad, and a placeholder
 * shaped like a job card is the exact pattern Google penalises.
 *
 * The publisher id lives in components/AdsenseGate.jsx, which also loads the
 * script (never on the homepage — decided in the 03.09 meeting).
 */
export const AD_SLOTS = {
    /** Between offer cards in the /offerte list, one every three cards. */
    offerteList: '',
    /** Top of a single offer's detail — wide and short. */
    offertaTop: '',
    /** Foot of a single offer's detail. */
    offertaBottom: '',
};

export const hasAdSlot = (name) => Boolean(AD_SLOTS[name]);
