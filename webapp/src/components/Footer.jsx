import React from 'react';
import { Link } from 'react-router-dom';

const IconLinkedIn = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
    </svg>
);

const IconRSS = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/>
    </svg>
);

const Footer = ({ setShowLoginModal }) => {
    const N = 'var(--brand-navy)';
    const F = 'var(--brand-fuchsia)';
    const brand = 'var(--font-brand)';
    const editorial = 'var(--font-editorial)';
    const body = 'var(--font-body)';

    const cols = [
        { title: 'Area Legale', links: [
            { label: 'Condizioni Generali', href: '/condizioni-generali' },
            { label: 'Cookie Policy', href: '/cookie-policy' },
        ]},
        { title: 'Candidati', links: [
            { label: 'Offerte di lavoro', href: '/offerte' },
            { label: 'Carica il CV', href: 'https://jobroom.jobcourier.ch/job-seekers.php?lan=it&language=it' },
            { label: 'Login', href: '#login' },
            { label: 'FAQ / Aiuto', href: '/faq' },
        ]},
        { title: 'Aziende', inline: ['Pubblica annuncio', 'Trova Candidati'], links: [
            { label: 'Pubblica annuncio', href: 'https://jobroom.jobcourier.ch/employer/register.php?ignoreRedirectingCookiesAll=1&lan=it&language=it' },
            { label: 'Trova Candidati', href: 'https://jobroom.jobcourier.ch/job-seekers.php?lan=it&language=it' },
            { label: 'Registra Azienda', href: 'https://jobroom.jobcourier.ch/employer/register.php?ignoreRedirectingCookiesAll=1&lan=it&language=it' },
            { label: 'Login', href: '#login' },
            { label: 'Contatti', href: '/contatti' },
        ]},
    ];

    return (
        <footer style={{ background: N }} className="px-5 md:px-10 pb-0">
            <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.4) 18%, rgba(255,255,255,0.4) 82%, transparent)', marginBottom: 48 }} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 mb-7" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {/* Brand col — full width on mobile, 2-col on sm, 1-col on lg */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                    <div style={{ marginBottom: 12 }}>
                        <img
                            src="/logo-full-dark.svg"
                            onError={(e) => { e.currentTarget.src = '/logo-full-dark.png'; }}
                            alt="JobCourier"
                            className="h-[52px] w-auto object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
                        />
                    </div>
                    <p style={{ fontFamily: editorial, fontStyle: 'italic', fontSize: 15, color: 'var(--brand-white)', lineHeight: 1.5, marginBottom: 20 }}>
                        Dove aziende e candidati si incontrano.
                    </p>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <a href="#" aria-label="LinkedIn" style={{ color: 'rgba(255,255,255,0.45)', transition: 'color 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-white)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}>
                            <IconLinkedIn />
                        </a>
                        <a href="#" aria-label="RSS" style={{ color: 'rgba(255,255,255,0.45)', transition: 'color 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-white)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}>
                            <IconRSS />
                        </a>
                    </div>
                </div>

                {/* Link cols */}
                {cols.map(col => {
                    const inlineSet = new Set(col.inline || []);
                    const inlineLinks = col.links.filter(l => inlineSet.has(l.label));
                    const stackLinks = col.links.filter(l => !inlineSet.has(l.label));

                    const renderLink = (l) =>
                        l.href.startsWith('/') && l.href !== '#login' ? (
                            <Link
                                to={l.href}
                                style={{ fontFamily: body, fontSize: 13, color: 'var(--brand-white)', textDecoration: 'none', transition: 'color 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.color = F}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--brand-white)'}
                            >
                                {l.label}
                            </Link>
                        ) : (
                            <a
                                href={l.href}
                                style={{ fontFamily: body, fontSize: 13, color: 'var(--brand-white)', textDecoration: 'none', transition: 'color 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.color = F}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--brand-white)'}
                                onClick={(e) => {
                                    if (l.href === '#login') {
                                        e.preventDefault();
                                        setShowLoginModal?.(true);
                                    }
                                }}
                            >
                                {l.label}
                            </a>
                        );

                    return (
                        <div key={col.title}>
                            <div style={{ fontFamily: brand, fontWeight: 700, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: F, marginBottom: 16 }}>
                                {col.title}
                            </div>
                            {inlineLinks.length > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                                    {inlineLinks.map((l, i) => <React.Fragment key={l.label}>{i > 0 && <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, userSelect: 'none' }}>|</span>}{renderLink(l)}</React.Fragment>)}
                                </div>
                            )}
                            {stackLinks.map(l => (
                                <div key={l.label} style={{ marginBottom: 10 }}>
                                    {renderLink(l)}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>

            {/* Copyright row — fondo bianco separato */}
            <div className="-mx-5 md:-mx-10 px-5 md:px-10 py-4" style={{ background: 'var(--brand-white)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <span style={{ fontFamily: body, fontSize: 11, color: 'rgba(5,11,43,0.35)' }}>
                    © {new Date().getFullYear()} JobCourier.ch — Tutti i diritti riservati
                </span>
            </div>
        </footer>
    );
};

export default Footer;
