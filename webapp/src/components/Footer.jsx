import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const IconLinkedIn = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
    </svg>
);

const IconInstagram = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
);

const IconFacebook = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
);

const IconRSS = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/>
    </svg>
);

const IconClose = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);

const RssModal = ({ onClose }) => {
    const N = 'var(--brand-navy)';
    const F = 'var(--brand-fuchsia)';
    const brand = 'var(--font-brand)';
    const body = 'var(--font-body)';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(5,11,43,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                onClick={e => e.stopPropagation()}
                style={{ background: '#fff', maxWidth: 520, width: '100%', padding: '36px 32px', position: 'relative' }}
            >
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(5,11,43,0.4)', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = N}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(5,11,43,0.4)'}
                    aria-label="Chiudi"
                >
                    <IconClose />
                </button>

                <div style={{ fontFamily: brand, fontWeight: 700, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: F, marginBottom: 12 }}>
                    Feed RSS
                </div>
                <h2 style={{ fontFamily: brand, fontWeight: 800, fontSize: 22, color: N, marginBottom: 16, lineHeight: 1.3 }}>
                    Importare offerte di lavoro tramite feed RSS
                </h2>
                <p style={{ fontFamily: body, fontSize: 14, color: 'rgba(5,11,43,0.7)', lineHeight: 1.7, marginBottom: 16 }}>
                    Pubblica automaticamente i tuoi annunci di lavoro su JobCourier tramite un feed RSS dal tuo ATS o portale di lavoro.
                </p>
                <ul style={{ fontFamily: body, fontSize: 13, color: 'rgba(5,11,43,0.65)', lineHeight: 1.8, marginBottom: 24, paddingLeft: 18 }}>
                    <li>Amplia il tuo pubblico di candidati</li>
                    <li>Ricevi più candidature qualificate</li>
                    <li>Integrazione semplice con il tuo sistema esistente</li>
                </ul>

                <a
                    href="https://www.jobcourier.ch/wp-content/uploads/2025/06/JobCourier-multiposting-doc.xlsx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="jc-glow-btn-light"
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        fontFamily: brand, fontWeight: 700, fontSize: 11,
                        letterSpacing: '0.14em', textTransform: 'uppercase',
                        color: N, border: `1.5px solid ${N}`,
                        padding: '12px 24px', textDecoration: 'none', cursor: 'pointer'
                    }}
                >
                    Scarica documentazione tecnica →
                </a>

                <p style={{ fontFamily: body, fontSize: 12, color: 'rgba(5,11,43,0.4)', marginTop: 16 }}>
                    Per assistenza: <a href="mailto:support@jobcourier.ch" style={{ color: F, textDecoration: 'none' }}>support@jobcourier.ch</a>
                </p>
            </motion.div>
        </motion.div>
    );
};

const Footer = ({ setShowLoginModal }) => {
    const [showRssModal, setShowRssModal] = useState(false);
    const N = 'var(--brand-navy)';
    const F = 'var(--brand-fuchsia)';
    const brand = 'var(--font-brand)';
    const editorial = 'var(--font-editorial)';
    const body = 'var(--font-body)';

    const socials = [
        { icon: <IconLinkedIn />, href: 'https://www.linkedin.com/company/jobcourier-ch', label: 'LinkedIn' },
        { icon: <IconInstagram />, href: 'https://www.instagram.com/job_courier/', label: 'Instagram' },
        { icon: <IconFacebook />, href: 'https://www.facebook.com/JobCourier.ch', label: 'Facebook' },
        { icon: <IconRSS />, href: '#rss', label: 'RSS Feed', onClick: (e) => { e.preventDefault(); setShowRssModal(true); } },
    ];

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
                        {socials.map(s => (
                            <a
                                key={s.label}
                                href={s.href}
                                target={s.onClick ? undefined : '_blank'}
                                rel={s.onClick ? undefined : 'noopener noreferrer'}
                                aria-label={s.label}
                                onClick={s.onClick}
                                style={{ color: 'rgba(255,255,255,0.45)', transition: 'color 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-white)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
                            >
                                {s.icon}
                            </a>
                        ))}
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

            <AnimatePresence>
                {showRssModal && <RssModal onClose={() => setShowRssModal(false)} />}
            </AnimatePresence>
        </footer>
    );
};

export default Footer;
