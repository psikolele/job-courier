/**
 * Leaves the site for an external apply page.
 *
 * `window.open` only reliably opens a tab while the browser still considers a
 * user gesture in progress. The redirect modal also fires on a timer, and a
 * timer is not a gesture: Chrome and Safari block that popup and return null,
 * with no error anywhere. That is the reported "on some ads nothing happens and
 * you have to click twice" — the second click is a gesture, so it works.
 *
 * So: try the new tab, and when the browser refuses, navigate the current one
 * rather than silently dropping the application.
 *
 * Returns 'tab' | 'same-tab' | 'none' so the caller can tell what happened.
 */
export function openExternal(url, win = typeof window === 'undefined' ? undefined : window) {
    if (!url || !win) return 'none';

    let opened = null;
    try {
        opened = win.open(url, '_blank', 'noopener,noreferrer');
    } catch {
        opened = null; // some browsers throw instead of returning null
    }

    if (opened) return 'tab';

    try {
        win.location.assign(url);
        return 'same-tab';
    } catch {
        return 'none';
    }
}
