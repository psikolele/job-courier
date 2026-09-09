import { describe, it, expect, vi } from 'vitest';
import { openExternal } from './openExternal';

const stub = (openResult) => ({
    open: vi.fn(() => {
        if (openResult instanceof Error) throw openResult;
        return openResult;
    }),
    location: { assign: vi.fn() }
});

describe('openExternal', () => {
    it('opens a new tab when the browser allows it', () => {
        const win = stub({});
        expect(openExternal('https://ats.example/apply', win)).toBe('tab');
        expect(win.open).toHaveBeenCalledWith('https://ats.example/apply', '_blank', 'noopener,noreferrer');
        expect(win.location.assign).not.toHaveBeenCalled();
    });

    it('falls back to the current tab when the popup is blocked', () => {
        const win = stub(null);
        expect(openExternal('https://ats.example/apply', win)).toBe('same-tab');
        expect(win.location.assign).toHaveBeenCalledWith('https://ats.example/apply');
    });

    it('falls back when the browser throws instead of returning null', () => {
        const win = stub(new Error('blocked'));
        expect(openExternal('https://ats.example/apply', win)).toBe('same-tab');
        expect(win.location.assign).toHaveBeenCalledWith('https://ats.example/apply');
    });

    it('does nothing without a url', () => {
        const win = stub({});
        expect(openExternal('', win)).toBe('none');
        expect(win.open).not.toHaveBeenCalled();
    });

    it('reports blocked without touching the current tab when fallback is disabled', () => {
        const win = stub(null);
        expect(openExternal('https://ats.example/apply', win, { sameTabFallback: false })).toBe('blocked');
        expect(win.location.assign).not.toHaveBeenCalled();
    });

    it('still opens a new tab when fallback is disabled but the popup succeeds', () => {
        const win = stub({});
        expect(openExternal('https://ats.example/apply', win, { sameTabFallback: false })).toBe('tab');
        expect(win.location.assign).not.toHaveBeenCalled();
    });
});
