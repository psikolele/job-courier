import React, { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Counter } from './ui/follower-counter';

const COUNTER_SCALE = 0.34;

// LinkedIn glyph kept identical to Footer.jsx's IconLinkedIn, so the mark reads
// as the same brand element wherever it appears on the site.
const IconLinkedIn = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
    </svg>
);

const LINKEDIN_URL = 'https://www.linkedin.com/company/jobcourier-ch';
const FOLLOWER_COUNT = 30000;

// Meeting 17/09 (Gabriele): link LinkedIn in home (30k follower) + banner non
// invasivo. Prima versione era una card verticale alta 368px — il cliente
// (18/09) l'ha bocciata: voleva una striscia sottile (max 50-80px) subito
// dopo la vetrina aziende, stessa grafica navy/fuchsia. Un'unica riga che
// scorre col resto della pagina, mai un overlay.
const SocialBanner = () => {
    const { t } = useTranslation();
    const F = 'var(--brand-fuchsia)';
    const brand = 'var(--font-brand)';
    const body = 'var(--font-body)';

    // `transform: scale()` shrinks how the counter paints but not the box it
    // occupies in flex layout (transforms are a paint-time effect, not a layout
    // one) — the wrapper below was sizing itself to the counter's *unscaled*
    // ~50px-font width, which is wide enough that flex-wrap forced the icon and
    // the CTA onto their own lines on a phone (measured 103px tall instead of
    // the 50-80px asked for). Measuring the unscaled box once and setting the
    // wrapper's width explicitly to its scaled size fixes that at the source,
    // instead of guessing a magic-number width that breaks the next time
    // FOLLOWER_COUNT changes digit count.
    const counterRef = useRef(null);
    const [counterWidth, setCounterWidth] = useState(null);
    useLayoutEffect(() => {
        if (counterRef.current) setCounterWidth(counterRef.current.scrollWidth * COUNTER_SCALE);
    }, []);

    return (
        <motion.a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="w-full flex flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 md:px-12"
            style={{
                background: 'var(--brand-navy)',
                borderTop: `2px solid ${F}`,
                minHeight: 56,
                padding: '12px 24px',
                textDecoration: 'none',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: F, display: 'flex' }}><IconLinkedIn /></span>
                {/* Dropped below `sm`: at 375px this line plus the counter line plus the
                    CTA line pushed the strip past the 50-80px the client asked for
                    (measured 103px). The count and the CTA carry the message on a phone;
                    the headline is the part a narrow screen can afford to lose. */}
                <span className="hidden sm:inline" style={{
                    fontFamily: brand, fontWeight: 700, fontSize: 12,
                    color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '-0.005em'
                }}>
                    {t('social_banner.headline')}
                </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                {/* follower-counter.jsx renders at a fixed 50px (built for a hero-sized
                    milestone reveal) — scaled down here rather than touching the shared
                    component, which Stats.jsx (currently hidden) also uses.

                    Each digit keeps all 10 possible values stacked in the DOM (only one
                    positioned on screen via CSS transform) so screen readers and any
                    text-extraction tool read "0123456789..." instead of the number —
                    hidden from assistive tech here, with the real value given as text
                    right after it. */}
                <div
                    aria-hidden="true"
                    style={{
                        height: 22,
                        width: counterWidth ?? undefined,
                        // Until the first measurement lands, invisible rather than at
                        // its unscaled width — one frame of a too-wide, empty box beats
                        // one frame of the old wrapping bug.
                        visibility: counterWidth === null ? 'hidden' : 'visible',
                        overflow: 'hidden',
                    }}
                >
                    <div ref={counterRef} style={{ transform: `scale(${COUNTER_SCALE})`, transformOrigin: 'left center', width: 'max-content' }}>
                        <Counter value={FOLLOWER_COUNT} className="text-white" />
                    </div>
                </div>
                <span className="sr-only">{FOLLOWER_COUNT.toLocaleString('it-CH')}</span>
                <span style={{
                    fontFamily: body, fontSize: 11, fontWeight: 600,
                    letterSpacing: '0.04em', color: 'rgba(255,255,255,0.65)'
                }}>
                    {t('social_banner.follower_label')}
                </span>
            </div>

            <span style={{
                fontFamily: brand, fontWeight: 700, fontSize: 11,
                letterSpacing: '0.14em', textTransform: 'uppercase', color: F,
                display: 'inline-flex', alignItems: 'center', gap: 6
            }}>
                {t('social_banner.cta')} <span aria-hidden="true">→</span>
            </span>
        </motion.a>
    );
};

export default SocialBanner;
