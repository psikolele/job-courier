// Keyword-based sector/role inference for job cards.
//
// Arca24's list scrape never carries real sector/role (both hardcoded "Non
// specificato" — see api/_arca24.js parseJobsFromHtml). Only the detail page
// has them (itemprop microdata). So the homepage showcase (Filters.jsx) and
// the /offerte listing (Offerte.jsx) both fall back to guessing from the
// title. Kept in one place so both stay in sync and so
// scripts/audit-sector-keywords.mjs can test the exact same rules against
// live titles.
//
// Coverage is intentionally not 100% — regex keywords can't cover every
// synonym or ambiguous abbreviation. Run `npm run audit:keywords` to see
// which live titles still fall through, and extend the lists below.

const SKIP_VALUES = ['Non specificato', 'Other', 'Altro', 'ALTRO', 'other', ''];

/**
 * Lowercase and strip diacritics before matching.
 *
 * The feed is four languages deep and writes accents where the keyword lists below
 * did not: "électricien" never matched the `electricien` keyword, "polymécanicien"
 * never matched `mechanik`, and both showed up as "Altro" on the cards while their
 * unaccented twins matched fine. Every accented literal in the lists has been
 * rewritten without its accent to match — keep it that way, or a keyword written
 * with one will silently never fire.
 */
const fold = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export const deriveSector = (title, sector) => {
    if (sector && !SKIP_VALUES.includes(sector)) return sector;
    if (!title) return null;
    const t = fold(title);
    if (/trasport|autista|camion|courier|spediz|logist|magazz|magazin|lagerist|disponent|driver|corriere|chauffeur|fahrer/.test(t)) return 'Logistica';
    if (/inferm|medic|farmac|salute|dental|fisio|cura|health|clinica|pflege|soins|infirmier|aide.soignant|auxiliaire de sant|\bmpa\b/.test(t)) return 'Medicina';
    if (/sviluppa|programm|developer|software|engineer|devops|cloud|\.net|java|python|frontend|backend|fullstack/.test(t)) return 'IT';
    if (/contab|finanz|paghe|banca|audit|fiscal|revisio|accounting|treuhand|comptab/.test(t)) return 'Finanza';
    if (/vendita|commerc|sales|account|business dev|verkauf|vente|detailhandel|vertrieb|kundenbetreu|kundendienst/.test(t)) return 'Commerciale';
    if (/amministr|segret|assistente|reception|back.?office|sekretar|secretariat|controller|einkauf/.test(t)) return 'Amministrazione';
    if (/ingenieur|konstrukteur|dessinateur|genie civil|entwicklungsingenieur/.test(t)) return 'Ingegneria';
    if (/costruzion|edil|parchett|muratore|idraulic|elettr|carpent|impianti|architett|projekt|installateur|electricien|monteur|elektrik|chauffage|heizung|zimmermann|schreiner|menuisier|macon|maurer|maler|dachdecker|schweisser|mechanik|polymechanik|mecanicien|automatiker|kranfuhrer|strassenbauer|carrosserie|klempner|schlosser|gartner|paysagiste|bauleiter/.test(t)) return 'Costruzioni';
    if (/ristora|chef|cuoc|camerier|pasticcier|hotell|cuisin|kellner|koch|boulanger/.test(t)) return 'Ristorazione';
    if (/marketing|social media|communic|brand|digital/.test(t)) return 'Marketing';
    if (/risorse umane|\bhr\b|human resource|selezione|reclutament|personalwesen/.test(t)) return 'HR';
    if (/puliz|nettoy|reinigung|facility|cleaning/.test(t)) return 'Servizi Generali';
    return null;
};

export const deriveRoleFromTitle = (title) => {
    if (!title) return null;
    const t = fold(title);
    if (/autista|driver|chauffeur|fahrer/.test(t)) return 'Autista';
    if (/installateur|installator|monteur|elektrik|electricien/.test(t)) return 'Installatore';
    if (/schweisser|soudeur/.test(t)) return 'Saldatore';
    if (/schreiner|menuisier|zimmermann|falegname/.test(t)) return 'Falegname';
    if (/macon|maurer|muratore/.test(t)) return 'Muratore';
    if (/\bmaler\b|peintre|imbianchino/.test(t)) return 'Imbianchino';
    if (/mechanik|meccanic|mecanicien/.test(t)) return 'Meccanico';
    if (/kranfuhrer|gruista/.test(t)) return 'Gruista';
    if (/gartner|paysagiste|giardin/.test(t)) return 'Giardiniere';
    if (/konstrukteur|dessinateur|projeteur|progettista/.test(t)) return 'Progettista';
    if (/ingenieur|ingegnere/.test(t)) return 'Ingegnere';
    if (/tecnic|technician|tester|technicien|techniker|technik/.test(t)) return 'Tecnico';
    if (/specialist/.test(t)) return 'Specialista';
    if (/responsabile|manager|leiter/.test(t)) return 'Responsabile';
    if (/einkauf|acquisti/.test(t)) return 'Responsabile Acquisti';
    if (/controller/.test(t)) return 'Controller';
    if (/consulente|consultant|berater/.test(t)) return 'Consulente';
    if (/addett|employe|mitarbeiter/.test(t)) return 'Addetto';
    if (/operai|ouvrier|arbeiter/.test(t)) return 'Operaio';
    if (/camerier|serveur|kellner/.test(t)) return 'Cameriere';
    if (/cuoc|cuisinier|koch|boulanger/.test(t)) return 'Cuoco';
    if (/segreta|secretaire|sekretar/.test(t)) return 'Segretario';
    if (/contabil|comptable|buchhalter/.test(t)) return 'Contabile';
    if (/vendit|commercial|verkaufer|kundenbetreu/.test(t)) return 'Venditore';
    if (/magazzin|magazin|lagerist|disponent/.test(t)) return 'Magazziniere';
    if (/inferm|nurse|pflege|infirmier|aide.soignant/.test(t)) return 'Infermiere';
    return null;
};

export const deriveRole = (role, title) => {
    if (role && !SKIP_VALUES.includes(role)) return role;
    return deriveRoleFromTitle(title);
};

// What a card or a detail header should actually print. Both the list card and the
// detail header used to spell this out inline, and they drifted: the detail passed no
// title (so nothing could be inferred) and then fell back to the raw field, which put
// the "Non specificato" placeholder straight back on screen. One offer therefore read
// "Responsabile" in the list and "Non specificato" in its own header. Keep every
// consumer on these two.
const FALLBACK_LABEL = 'Altro';

export const sectorLabel = (job) =>
    (job && deriveSector(job.title, job.sector)) || FALLBACK_LABEL;

export const roleLabel = (job) =>
    (job && deriveRole(job.role, job.title)) || FALLBACK_LABEL;
