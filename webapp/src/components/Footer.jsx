import React from 'react';

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

const Footer = () => {
    const N = 'var(--brand-navy)';
    const F = 'var(--brand-fuchsia)';
    const brand = 'var(--font-brand)';
    const editorial = 'var(--font-editorial)';
    const body = 'var(--font-body)';

    const cols = [
        { title: 'Area Legale', links: [
            { label: 'Condizioni Generali', href: '#' },
            { label: 'Cookie Policy', href: '#' },
        ]},
        { title: 'Candidati', links: [
            { label: 'Offerte di lavoro', href: '/offerte' },
            { label: 'Carica il CV', href: 'https://jobroom.jobcourier.ch/job-seekers.php?lan=it&language=it' },
            { label: 'Login', href: '#login' },
            { label: 'FAQ / Aiuto', href: '#' },
        ]},
        { title: 'Aziende', links: [
            { label: 'Pubblica annuncio', href: 'https://jobroom.jobcourier.ch/employer/register.php?ignoreRedirectingCookiesAll=1&lan=it&language=it' },
            { label: 'Trova Candidati', href: 'https://jobroom.jobcourier.ch/job-seekers.php?lan=it&language=it' },
            { label: 'Registra Azienda', href: 'https://jobroom.jobcourier.ch/employer/register.php?ignoreRedirectingCookiesAll=1&lan=it&language=it' },
            { label: 'Login', href: '#login' },
            { label: 'Contatti', href: '/contatti' },
        ]},
    ];

    return (
        <footer style={{ background: N, padding: '48px 40px 28px' }}>
            <div style={{
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                paddingBottom: 40,
                marginBottom: 28,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 40
            }}>
                {/* Brand col */}
                <div>
                    <div style={{ marginBottom: 16 }}>
                        <img
                            src="/logo-full-dark.svg"
                            onError={(e) => { e.currentTarget.src = '/logo-full-dark.png'; }}
                            alt="JobCourier"
                            className="h-[90px] w-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
                        />
                    </div>
                    <p style={{ fontFamily: editorial, fontStyle: 'italic', fontSize: 16, color: 'rgba(255,255,255,0.35)', lineHeight: 1.55, maxWidth: 240, marginBottom: 20 }}>
                        Dove aziende e candidati si incontrano.
                    </p>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <a href="#" aria-label="LinkedIn" style={{ color: 'rgba(255,255,255,0.35)', transition: 'color 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>
                            <IconLinkedIn />
                        </a>
                        <a href="#" aria-label="RSS" style={{ color: 'rgba(255,255,255,0.35)', transition: 'color 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>
                            <IconRSS />
                        </a>
                    </div>
                </div>

                {/* Link cols */}
                {cols.map(col => (
                    <div key={col.title}>
                        <div style={{ fontFamily: brand, fontWeight: 700, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: F, marginBottom: 16 }}>
                            {col.title}
                        </div>
                        {col.links.map(l => (
                            <div key={l.label} style={{ marginBottom: 10 }}>
                                <a
                                    href={l.href}
                                    style={{ fontFamily: body, fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'color 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
                                >
                                    {l.label}
                                </a>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Copyright row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <span style={{ fontFamily: body, fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
                    © {new Date().getFullYear()} JobCourier.ch — Tutti i diritti riservati
                </span>
                <div style={{ width: 36, height: 1, background: F }} />
            </div>
        </footer>
    );
};

export default Footer;
