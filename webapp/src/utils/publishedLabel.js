/**
 * Upstream ships the publication date as a display string, and marks anything
 * posted today by appending a word to it: `10/08/2026 Nuovo!`. The card used to
 * print that whole string in small grey text, which buried the one part of it
 * that carries urgency.
 *
 * The marker is split off so the badge can be styled on its own. Only the known
 * marker words are accepted — an unrecognised suffix is dropped rather than
 * promoted to a badge, so a change in upstream wording degrades to "no badge"
 * instead of "badge on every card". A date matching today is enough on its own,
 * which keeps the badge alive if the wording changes to something we don't know.
 */
const MARKERS = /^(nuovo|neu|new|nouveau)\s*!?$/i;
const DATE = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})\b\s*(.*)$/;

export function splitPublishedLabel(raw, now = Date.now()) {
    const text = String(raw ?? '').trim();
    if (!text) return { date: '', isNew: false };

    const match = text.match(DATE);
    if (!match) return { date: text, isNew: false };

    const [, d, m, y, suffix] = match;
    const at = Date.UTC(Number(y), Number(m) - 1, Number(d));
    const today = new Date(now);
    const startOfToday = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());

    return {
        date: text.slice(0, match[0].length - suffix.length).trim(),
        isNew: MARKERS.test(suffix.trim()) || at === startOfToday
    };
}
