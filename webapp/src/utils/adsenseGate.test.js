import { describe, it, expect } from 'vitest';
import { gateDecision } from './adsenseGate';

// The regression this file exists for: a returning visitor already holds
// marketing consent when the page loads, so Cookiebot never fires the "consent
// granted" moment its auto-blocking needs to rewrite a gated tag. Deciding from
// the consent *state* rather than from that event is what makes the homepage ->
// /offerte path serve ads at all.
describe('gateDecision', () => {
    it('loads on an ad route once marketing consent is held', () => {
        expect(gateDecision({ pathname: '/offerte', marketingConsent: true, scriptPresent: false })).toBe('load');
    });

    it('loads for a visitor who already had consent before arriving', () => {
        // No CookiebotOnAccept will ever fire for this person: the decision has
        // to come from the state alone. This is the case that was broken.
        expect(gateDecision({ pathname: '/offerta/6746835', marketingConsent: true, scriptPresent: false })).toBe('load');
    });

    it('does not load twice on the same route', () => {
        expect(gateDecision({ pathname: '/offerte', marketingConsent: true, scriptPresent: true })).toBe('keep');
    });

    it('requests nothing without marketing consent', () => {
        expect(gateDecision({ pathname: '/offerte', marketingConsent: false, scriptPresent: false })).toBe('wait');
    });

    it('still requests nothing when consent is refused and a script is somehow present', () => {
        expect(gateDecision({ pathname: '/offerte', marketingConsent: false, scriptPresent: true })).toBe('wait');
    });

    it('tears down on the homepage, consent or not', () => {
        // The homepage carries no ads at all — decided in the 03.09 meeting —
        // and Auto ads keeps placing units after load, so the script has to go.
        expect(gateDecision({ pathname: '/', marketingConsent: true, scriptPresent: true })).toBe('teardown');
        expect(gateDecision({ pathname: '/', marketingConsent: false, scriptPresent: false })).toBe('teardown');
    });

    it('never loads on the homepage even when asked about a fresh script', () => {
        expect(gateDecision({ pathname: '/', marketingConsent: true, scriptPresent: false })).not.toBe('load');
    });
});
