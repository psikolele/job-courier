/**
 * What the AdSense gate should do for a route and a consent state.
 *
 *   'teardown' — the homepage, which carries no ads at all
 *   'load'     — an ad route, marketing consent granted, script not yet there
 *   'keep'     — the script is already loaded for this route
 *   'wait'     — an ad route without marketing consent: load nothing, listen
 *
 * Kept pure and out of the component so the decision can be tested without a
 * DOM. `components/AdsenseGate.jsx` only carries it out, and explains why the
 * consent gate is ours rather than Cookiebot's.
 */
export const gateDecision = ({ pathname, marketingConsent, scriptPresent }) => {
    if (pathname === '/') return 'teardown';
    if (!marketingConsent) return 'wait';
    return scriptPresent ? 'keep' : 'load';
};
