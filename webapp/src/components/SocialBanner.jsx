import React from 'react';
import { useTranslation } from 'react-i18next';

// Official LinkedIn mark (the "in" glyph, Font Awesome's brand path) on the
// brand's own blue square — the client (18/09) asked for the real logo, not
// a custom-drawn stand-in like Footer.jsx's IconLinkedIn.
const LinkedInBadge = () => (
    <span
        aria-hidden="true"
        style={{
            width: 26, height: 26, borderRadius: 5, background: '#0A66C2',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
        }}
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 448 512" fill="#FFFFFF">
            <path d="M100.28 448H7.4V148.9h92.88zm-46.44-341.9C24.09 106.1 0 82 0 52.6a53.79 53.79 0 0 1 107.58 0c0 29.4-24.1 53.5-53.74 53.5zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" />
        </svg>
    </span>
);

const LINKEDIN_URL = 'https://www.linkedin.com/company/jobcourier/';
const FOLLOWER_COUNT = "30'000+";

// Meeting 17/09 (Gabriele): link LinkedIn in home (30k follower) + banner non
// invasivo. 18/09, due giri di feedback dal cliente:
// 1) da card verticale 368px a striscia 50-80px dopo la vetrina aziende;
// 2) logo ufficiale (non il glifo custom di Footer.jsx), link corretto
//    (/company/jobcourier/, non /company/jobcourier-ch), testo scorrevole
//    invece del contatore a cifre animate — che in una riga che scorre
//    sarebbe stato due animazioni in competizione, non "più elegante".
//
// Il logo resta fisso a sinistra (l'unico ancoraggio visivo stabile); solo
// il testo scorre, in loop, riusando .animate-marquee già definita in
// index.css (mai montata altrove) — due copie identiche affiancate, il
// loop scatta da -50% a 0% invisibile perché le due copie sono pixel-identiche.
const MarqueeContent = ({ t }) => (
    <div className="flex items-center gap-3 shrink-0 pr-12" aria-hidden="true">
        <span style={{
            fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 12,
            color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.02em'
        }}>
            {t('social_banner.headline')}
        </span>
        <span style={{ color: 'var(--brand-fuchsia)' }}>●</span>
        <span style={{
            fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 12,
            color: '#FFFFFF', letterSpacing: '0.02em'
        }}>
            {FOLLOWER_COUNT}
        </span>
        <span style={{
            fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600,
            letterSpacing: '0.04em', color: 'rgba(255,255,255,0.65)'
        }}>
            {t('social_banner.follower_label')}
        </span>
        <span style={{ color: 'var(--brand-fuchsia)' }}>●</span>
        <span style={{
            fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 11,
            letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--brand-fuchsia)'
        }}>
            {t('social_banner.cta')} →
        </span>
    </div>
);

const SocialBanner = () => {
    const { t } = useTranslation();

    return (
        <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t('social_banner.cta')} — ${FOLLOWER_COUNT} ${t('social_banner.follower_label')}`}
            className="w-full flex items-center gap-4 px-6 md:px-12"
            style={{
                background: 'var(--brand-navy)',
                borderTop: '2px solid var(--brand-fuchsia)',
                minHeight: 56,
                padding: '12px 24px',
                textDecoration: 'none',
            }}
        >
            <LinkedInBadge />
            <div className="flex-1 overflow-hidden pause-on-hover">
                <div className="flex animate-marquee w-max">
                    <MarqueeContent t={t} />
                    <MarqueeContent t={t} />
                </div>
            </div>
        </a>
    );
};

export default SocialBanner;
