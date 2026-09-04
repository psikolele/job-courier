import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'lucide-react';
import { AnimatedButton } from './ui/animated-button';
import { openExternal } from '../utils/openExternal';

const N = 'var(--brand-navy)';
const F = 'var(--brand-fuchsia)';
const GM = 'var(--brand-gray-mid)';
const brand = 'var(--font-brand)';
const editorial = 'var(--font-editorial)';
const body = 'var(--font-body)';

/** Host of the destination, so the candidate sees where they are being sent. */
function destinationHost(url) {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return '';
    }
}

/**
 * Branded hand-off shown when an ad applies on the employer's own site. It
 * replaces the plain jobroom transition: full-bleed navy, the JobCourier mark,
 * a progress bar that shows how long the wait is, and the destination host.
 *
 * The auto-redirect goes through `openExternal`, which falls back to the
 * current tab when the browser blocks the timer-opened popup — that block was
 * the "nothing happens, you have to click twice" report.
 *
 * Props:
 *   isOpen: boolean
 *   onClose: () => void
 *   externalUrl: string — destination
 *   companyName: string — for context
 *   autoRedirectMs: number — default 2500
 */
const ApplyRedirectModal = ({ isOpen, onClose, externalUrl, companyName = '', autoRedirectMs = 2500 }) => {
    const { t } = useTranslation();
    const timerRef = useRef(null);

    // `onClose` is an inline arrow in both call sites, so it is a new function on
    // every parent render. Keeping it in the effect's deps restarted the animation
    // and — worse — the redirect timer on each of those renders, which is how a
    // hand-off could sit there replaying its fade instead of leaving.
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    // Entrance and countdown run on CSS transitions rather than a JS tween.
    // A tween that never ticks leaves the panel at its start value — opacity 0 —
    // so the candidate sees nothing while the redirect fires underneath. A
    // transition that never runs still lands on the final style: visible.
    const [entered, setEntered] = useState(false);

    useEffect(() => {
        if (!isOpen || !externalUrl) return undefined;

        setEntered(false);
        // A timer, not requestAnimationFrame: rAF is throttled to nothing in
        // backgrounded and embedded views, and this flag decides whether the
        // panel is visible at all — it must not depend on a frame being painted.
        const enter = setTimeout(() => setEntered(true), 16);

        timerRef.current = setTimeout(() => {
            openExternal(externalUrl);
            onCloseRef.current();
        }, autoRedirectMs);

        return () => {
            clearTimeout(enter);
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isOpen, externalUrl, autoRedirectMs]);

    const handleGoNow = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        openExternal(externalUrl);
        onClose();
    };

    const handleCancel = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        onClose();
    };

    if (!isOpen) return null;

    const host = destinationHost(externalUrl);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="absolute inset-0 backdrop-blur-2xl"
                style={{ background: 'rgba(5,11,43,0.96)', opacity: entered ? 1 : 0, transition: 'opacity 0.3s ease-out' }}
                onClick={handleCancel} />

            <div className="relative max-w-md w-full"
                style={{
                    background: '#FFFFFF', padding: '44px 40px 40px',
                    opacity: entered ? 1 : 0,
                    transform: entered ? 'translateY(0)' : 'translateY(16px)',
                    transition: 'opacity 0.35s ease-out 0.05s, transform 0.35s ease-out 0.05s'
                }}>
                <div className="flex flex-col items-center text-center">
                    <img
                        src="/logo-square.svg"
                        onError={(e) => { e.currentTarget.src = '/logo-square.png'; }}
                        alt="JobCourier"
                        style={{ width: 52, height: 52, marginBottom: 22 }}
                    />

                    <p style={{ fontFamily: brand, fontWeight: 700, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: F, marginBottom: 14 }}>
                        {t('redirect.title')}
                    </p>

                    <h2 style={{
                        fontFamily: brand, fontWeight: 900, fontSize: 26,
                        color: N, textTransform: 'uppercase',
                        letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 12
                    }}>
                        {t('redirect.sending_you')}<br />{t('redirect.to_another_site')}
                    </h2>

                    {companyName && (
                        <p style={{ fontFamily: editorial, fontStyle: 'italic', fontSize: 18, color: GM, marginBottom: 10 }}>
                            {companyName}
                        </p>
                    )}

                    {host && (
                        <p style={{ fontFamily: body, fontSize: 12, color: N, opacity: 0.65, marginBottom: 18, wordBreak: 'break-all' }}>
                            {host}
                        </p>
                    )}

                    {/* The bar is the countdown made visible: it fills over exactly
                        the wait, so the pause never reads as a hung page. */}
                    <div style={{ width: '100%', height: 3, background: 'rgba(5,11,43,0.08)', marginBottom: 22 }}>
                        <div style={{
                            height: '100%', background: F,
                            transformOrigin: 'left center',
                            transform: entered ? 'scaleX(1)' : 'scaleX(0)',
                            transition: `transform ${autoRedirectMs}ms linear`
                        }} />
                    </div>

                    <p style={{ fontFamily: body, fontSize: 13, color: GM, marginBottom: 26, lineHeight: 1.6, maxWidth: 320 }}>
                        {t('redirect.desc')}
                    </p>

                    <div className="flex flex-col w-full gap-3">
                        <AnimatedButton onClick={handleGoNow}
                            className="w-full flex items-center justify-center gap-2 py-4 font-bold tracking-[0.14em] text-xs uppercase"
                            style={{
                                background: F, color: '#FFFFFF', border: 'none',
                                borderRadius: 0
                            }}>
                            {t('redirect.go_now')} <ExternalLink size={13} />
                        </AnimatedButton>
                        <AnimatedButton onClick={handleCancel}
                            className="w-full py-4 text-xs font-bold tracking-[0.14em] uppercase border border-slate-200 text-slate-500 hover:border-[var(--brand-fuchsia)] hover:text-[var(--brand-fuchsia)]"
                            style={{
                                background: 'transparent',
                                borderRadius: 0
                            }}>
                            {t('redirect.cancel')}
                        </AnimatedButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplyRedirectModal;
