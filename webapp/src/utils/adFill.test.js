import { describe, it, expect } from 'vitest';
import { isAdFilled } from './adFill';

const ins = ({ status = null, iframeHeight = null, height = 0 }) => ({
    getAttribute: (name) => (name === 'data-ad-status' ? status : null),
    querySelector: () => (iframeHeight === null ? null : { offsetHeight: iframeHeight }),
    offsetHeight: height,
});

describe('isAdFilled', () => {
    it('rejects a unit AdSense sized but never served', () => {
        // The production case: 280px tall, no iframe, no verdict yet.
        expect(isAdFilled(ins({ height: 280 }))).toBe(false);
    });

    it('rejects an explicit unfilled even if the box is tall', () => {
        expect(isAdFilled(ins({ status: 'unfilled', height: 280, iframeHeight: 280 }))).toBe(false);
    });

    it('accepts an explicit filled', () => {
        expect(isAdFilled(ins({ status: 'filled', height: 280 }))).toBe(true);
    });

    it('accepts a rendered iframe before the status attribute lands', () => {
        expect(isAdFilled(ins({ iframeHeight: 250 }))).toBe(true);
    });

    it('rejects a collapsed iframe', () => {
        expect(isAdFilled(ins({ iframeHeight: 0 }))).toBe(false);
    });

    it('survives a missing element', () => {
        expect(isAdFilled(null)).toBe(false);
    });
});
