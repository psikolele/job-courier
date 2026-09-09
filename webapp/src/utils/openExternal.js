/**
 * Leaves the site for an external apply page.
 *
 * `window.open` only reliably opens a tab while the browser still considers a
 * user gesture in progress. A timer is not a gesture: Chrome and Safari block
 * that popup and return null, with no error anywhere.
 *
 * By default, when the browser refuses the new tab we navigate the current
 * one rather than silently dropping the application — that was the reported
 * "on some ads nothing happens and you have to click twice" (the second click
 * is a gesture, so it works). Pass `sameTabFallback: false` for a flow where
 * losing the current tab is worse than the redirect not firing automatically
 * (e.g. a branded hand-off page the visitor should keep open) — the caller is
 * responsible for giving the visitor another way to proceed (a manual button).
 *
 * Returns 'tab' | 'same-tab' | 'blocked' | 'none' so the caller can tell what happened.
 */
export function openExternal(url, win = typeof window === 'undefined' ? undefined : window, { sameTabFallback = true } = {}) {
    if (!url || !win) return 'none';

    let opened = null;
    try {
        opened = win.open(url, '_blank', 'noopener,noreferrer');
    } catch {
        opened = null; // some browsers throw instead of returning null
    }

    if (opened) return 'tab';

    if (!sameTabFallback) return 'blocked';

    try {
        win.location.assign(url);
        return 'same-tab';
    } catch {
        return 'none';
    }
}
