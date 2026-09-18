/**
 * Hand-written `brand_description`/`website` fill-ins for employers whose upstream
 * "Lavora con noi" band doesn't carry one — gap-filling only, keyed by company `id`
 * (string). Applied in `company-detail.js`'s `applyOverrides()`, the only reader of
 * this file; a real Arca24 value is never replaced, only an empty one filled in.
 *
 * Ships empty. Populating an entry for a specific company is a separate, explicit,
 * hand-done task — never generated, at build time or request time (see the
 * 2026-09-19 DESIGN-LOG.md entry for why: reliability budget, no fabricated text on
 * a paying client's page).
 */
export const overrides = {};
