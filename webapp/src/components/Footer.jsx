import React from 'react';

const Footer = () => {
    const N = 'var(--brand-navy)';
    const F = 'var(--brand-fuchsia)';
    const brand = 'var(--font-brand)';
    const editorial = 'var(--font-editorial)';
    const body = 'var(--font-body)';

    const cols = [
        { title: 'Candidati', links: [
            { label: 'Cerca lavoro', href: '/#filters' },
            { label: 'Newsletter', href: '#' },
            { label: 'Salva annunci', href: '#' }
        ]},
        { title: 'Aziende', links: [
            { label: 'Pubblica annuncio', href: '/soluzioni-e-tariffe' },
            { label: 'Come funziona', href: '/come-funziona' },
            { label: 'Piani e tariffe', href: '/soluzioni-e-tariffe' }
        ]},
        { title: 'Info', links: [
            { label: 'Chi siamo', href: '#' },
            { label: 'Privacy Policy', href: '#' },
            { label: 'Contatti', href: '/contatti' }
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
                            src="/logo-full-dark.png"
                            alt="JobCourier"
                            className="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
                        />
                    </div>
                    <p style={{ fontFamily: editorial, fontStyle: 'italic', fontSize: 16, color: 'rgba(255,255,255,0.35)', lineHeight: 1.55, maxWidth: 240 }}>
                        Il job board professionale di riferimento per la Svizzera.
                    </p>
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
                                    onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.7)'}
                                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.35)'}
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
