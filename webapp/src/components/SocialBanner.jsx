import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Counter } from './ui/follower-counter';

// LinkedIn glyph kept identical to Footer.jsx's IconLinkedIn, so the mark reads
// as the same brand element wherever it appears on the site.
const IconLinkedIn = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
    </svg>
);

const LINKEDIN_URL = 'https://www.linkedin.com/company/jobcourier-ch';
const FOLLOWER_COUNT = 30000;

// Meeting 17/09 (Gabriele): link LinkedIn in home (30k follower) + banner non
// invasivo. Non invasivo = una card nel normale flusso di pagina, non un
// overlay/sticky — sparisce scrollando come qualsiasi altra sezione.
const SocialBanner = () => {
    const { t } = useTranslation();
    const N = 'var(--brand-navy)';
    const F = 'var(--brand-fuchsia)';
    const brand = 'var(--font-brand)';
    const body = 'var(--font-body)';

    return (
        <section className="py-12 px-6 md:px-12 w-full flex justify-center" style={{ background: '#FFFFFF' }}>
            <motion.a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -2 }}
                className="flex flex-col items-center text-center"
                style={{
                    background: N,
                    width: '100%',
                    maxWidth: 280,
                    padding: '32px 28px',
                    textDecoration: 'none',
                    borderTop: `3px solid ${F}`,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <span style={{ width: 18, height: 2, background: F, display: 'inline-block' }} />
                    <span style={{
                        fontFamily: brand, fontWeight: 700, fontSize: 10,
                        letterSpacing: '0.2em', textTransform: 'uppercase', color: F
                    }}>
                        {t('social_banner.eyebrow')}
                    </span>
                </div>

                <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    border: `1px solid ${F}`, color: F,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 20
                }}>
                    <IconLinkedIn />
                </div>

                <p style={{
                    fontFamily: brand, fontWeight: 700, fontSize: 15,
                    color: '#FFFFFF', textTransform: 'uppercase',
                    letterSpacing: '-0.01em', lineHeight: 1.3, marginBottom: 18
                }}>
                    {t('social_banner.headline')}
                </p>

                {/* follower-counter.jsx renders at a fixed 50px (built for a hero-sized
                    milestone reveal) — scaled down here rather than touching the shared
                    component, which nothing else in the codebase uses yet.

                    Each digit keeps all 10 possible values stacked in the DOM (only one
                    positioned on screen via CSS transform) so screen readers and any
                    text-extraction tool read "0123456789..." instead of the number —
                    hidden from assistive tech here, with the real value given as text
                    right after it. */}
                <div aria-hidden="true" style={{ height: 36, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ transform: 'scale(0.55)', transformOrigin: 'center' }}>
                        <Counter value={FOLLOWER_COUNT} className="text-white" />
                    </div>
                </div>
                <span className="sr-only">{FOLLOWER_COUNT.toLocaleString('it-CH')}</span>
                <span style={{
                    fontFamily: body, fontSize: 11, fontWeight: 600,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.6)', marginTop: 4, marginBottom: 24
                }}>
                    {t('social_banner.follower_label')}
                </span>

                <span style={{
                    background: F, color: '#FFFFFF',
                    padding: '12px 28px',
                    fontFamily: brand, fontWeight: 700, fontSize: 11,
                    letterSpacing: '0.14em', textTransform: 'uppercase',
                    display: 'inline-flex', alignItems: 'center', gap: 8
                }}>
                    {t('social_banner.cta')} <span aria-hidden="true">→</span>
                </span>
            </motion.a>
        </section>
    );
};

export default SocialBanner;
