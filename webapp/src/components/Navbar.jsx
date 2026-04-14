import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// ---------- ICONS ----------
const IconBriefcase = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
);
const IconSearch = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
);
const IconStar = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
);
const IconBuilding = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>
    </svg>
);
const IconUsers = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
);
const IconTrendingUp = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
    </svg>
);
const IconBookOpen = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
);
const IconChevronDown = ({ open }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            display: 'block',
        }}
    >
        <polyline points="6 9 12 15 18 9"/>
    </svg>
);
const IconX = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);
const IconMenu = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
);
const IconArrowRight = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
);

// ---------- NAV DATA ----------
const candidateLinks = [
    {
        icon: <IconSearch />,
        label: 'Cerca Lavoro',
        labelDe: 'Jobsuche',
        labelFr: "Recherche d'emploi",
        desc: 'Esplora migliaia di offerte',
        descDe: 'Tausende Angebote entdecken',
        descFr: "Explorez des milliers d'offres",
        href: '#jobs',
    },
    {
        icon: <IconStar />,
        label: 'Le mie Candidature',
        labelDe: 'Meine Bewerbungen',
        labelFr: 'Mes candidatures',
        desc: 'Segui i tuoi annunci preferiti',
        descDe: 'Verfolge deine Lieblingsanzeigen',
        descFr: 'Suivez vos annonces favorites',
        href: 'https://jobroom.jobcourier.ch/job-seekers-login.php',
        external: true,
    },
    {
        icon: <IconTrendingUp />,
        label: 'Consigli di Carriera',
        labelDe: 'Karrieretipps',
        labelFr: 'Conseils carrière',
        desc: 'Guide, articoli, risorse utili',
        descDe: 'Leitfäden, Artikel, nützliche Ressourcen',
        descFr: 'Guides, articles, ressources utiles',
        href: '#blog',
    },
    {
        icon: <IconBookOpen />,
        label: 'Blog',
        labelDe: 'Blog',
        labelFr: 'Blog',
        desc: 'News dal mondo del lavoro',
        descDe: 'Neuigkeiten aus der Arbeitswelt',
        descFr: 'Actualités du monde du travail',
        href: '#blog',
    },
];

const companyLinks = [
    {
        icon: <IconBriefcase />,
        label: 'Pubblica un Annuncio',
        labelDe: 'Stellenanzeige aufgeben',
        labelFr: 'Publier une annonce',
        desc: 'Raggiungi migliaia di candidati',
        descDe: 'Tausende von Kandidaten erreichen',
        descFr: 'Atteignez des milliers de candidats',
        href: 'https://jobroom.jobcourier.ch/employer/register.php?ignoreRedirectingCookiesAll=1&lan=it&language=it',
        external: true,
    },
    {
        icon: <IconUsers />,
        label: 'Gestisci Candidature',
        labelDe: 'Bewerbungen verwalten',
        labelFr: 'Gérer les candidatures',
        desc: 'Accedi al portale aziende',
        descDe: 'Zugang zum Unternehmensportal',
        descFr: 'Accédez au portail entreprises',
        href: 'https://jobroom.jobcourier.ch/job-seekers-login.php',
        external: true,
    },
    {
        icon: <IconBuilding />,
        label: 'Soluzioni e Tariffe',
        labelDe: 'Lösungen und Tarife',
        labelFr: 'Solutions et tarifs',
        desc: 'Piani adatti a ogni esigenza',
        descDe: 'Pläne für jeden Bedarf',
        descFr: 'Plans adaptés à chaque besoin',
        href: 'https://www.jobcourier.ch/soluzioni-e-tariffe/',
        external: true,
    },
    {
        icon: <IconTrendingUp />,
        label: 'Recruiter Pro',
        labelDe: 'Recruiter Pro',
        labelFr: 'Recruiter Pro',
        desc: 'Strumenti avanzati per HR',
        descDe: 'Erweiterte HR-Tools',
        descFr: 'Outils avancés pour RH',
        href: '#companies',
    },
];

const getLabel = (item, lang) => {
    if (lang === 'de' && item.labelDe) return item.labelDe;
    if (lang === 'fr' && item.labelFr) return item.labelFr;
    return item.label;
};
const getDesc = (item, lang) => {
    if (lang === 'de' && item.descDe) return item.descDe;
    if (lang === 'fr' && item.descFr) return item.descFr;
    return item.desc;
};

// ---------- ACCORDION SECTION ----------
const AccordionSection = ({ title, links, lang, isOpen, onToggle, onClose }) => (
    <div className="border-b border-white/10 last:border-0">
        {/* Header — always visible */}
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between py-6 px-2 text-left group"
        >
            <span
                className="text-2xl sm:text-3xl font-bold tracking-tight text-white transition-colors duration-200"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
                {title}
            </span>
            <span className="text-white/50 flex-shrink-0 ml-4 group-hover:text-[#2f9de5] transition-colors duration-200">
                <IconChevronDown open={isOpen} />
            </span>
        </button>

        {/* Expandable link list */}
        <AnimatePresence initial={false}>
            {isOpen && (
                <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ overflow: 'hidden' }}
                >
                    <div className="pb-6 space-y-1 px-2">
                        {links.map((item, i) => (
                            <a
                                key={i}
                                href={item.href}
                                target={item.external ? '_blank' : undefined}
                                rel={item.external ? 'noopener noreferrer' : undefined}
                                onClick={onClose}
                                className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/8 transition-all duration-200"
                            >
                                <span className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 text-white/70 group-hover:bg-[#2f9de5] group-hover:text-white transition-all duration-200">
                                    {item.icon}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="text-base font-semibold text-white/90 group-hover:text-white transition-colors">
                                            {getLabel(item, lang)}
                                        </span>
                                        <span className="opacity-0 group-hover:opacity-100 text-[#2f9de5] transition-opacity ml-2 flex-shrink-0">
                                            <IconArrowRight />
                                        </span>
                                    </div>
                                    <p className="text-sm text-white/45 mt-0.5 leading-snug">
                                        {getDesc(item, lang)}
                                    </p>
                                </div>
                            </a>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

// ---------- MAIN NAVBAR ----------
const Navbar = ({ showLoginModal, setShowLoginModal }) => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [openSection, setOpenSection] = useState(null);
    const { i18n } = useTranslation();
    const lang = i18n.language;

    const candidateTitle =
        lang === 'de' ? 'Für Kandidaten' :
        lang === 'fr' ? 'Pour les candidats' :
        'Per i Candidati';
    const companyTitle =
        lang === 'de' ? 'Für Unternehmen' :
        lang === 'fr' ? 'Pour les entreprises' :
        'Per le Aziende';

    // Scroll listener
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Lock body scroll when menu open; set default open section
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
            setOpenSection('candidates');
        } else {
            document.body.style.overflow = '';
            setOpenSection(null);
        }
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    const closeAll = useCallback(() => setMenuOpen(false), []);

    const toggleSection = useCallback((section) => {
        setOpenSection(prev => prev === section ? null : section);
    }, []);

    const changeLanguage = useCallback((lng) => {
        i18n.changeLanguage(lng);
    }, [i18n]);

    const navHeight = scrolled ? '60px' : '72px';

    return (
        <>
        {/* ── SPLIT HEADER ── */}
        <header
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                display: 'flex',
                height: navHeight,
                transition: 'height 0.4s ease, box-shadow 0.4s ease',
                boxShadow: scrolled
                    ? '0 4px 28px rgba(0,0,0,0.22)'
                    : '0 4px 18px rgba(0,0,0,0.14)',
            }}
        >
            {/* LEFT: white, logo */}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#ffffff',
                    padding: '0 2rem',
                    borderBottom: '1px solid rgba(226,232,240,0.6)',
                }}
            >
                <a href="/" style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        src="https://www.jobcourier.ch/wp-content/uploads/2021/08/jobcourier_logo.png"
                        alt="Job Courier"
                        style={{
                            height: scrolled ? '24px' : '30px',
                            transition: 'height 0.4s ease',
                            objectFit: 'contain',
                        }}
                    />
                </a>
            </div>

            {/* RIGHT: dark navy, lang + login + hamburger */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '1rem',
                    backgroundColor: '#1a2554',
                    padding: '0 1.5rem',
                    flexShrink: 0,
                    borderBottom: '1px solid #1a2554',
                }}
            >
                {/* Language switcher */}
                <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {['it', 'de', 'fr'].map((lng, idx) => (
                        <React.Fragment key={lng}>
                            {idx > 0 && <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>}
                            <button
                                onClick={() => changeLanguage(lng)}
                                style={{
                                    color: i18n.language === lng ? '#ffffff' : 'rgba(255,255,255,0.5)',
                                    transition: 'color 0.2s',
                                    cursor: 'pointer',
                                    background: 'none',
                                    border: 'none',
                                    fontWeight: 700,
                                    fontSize: '10px',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                }}
                                onMouseEnter={e => { if (i18n.language !== lng) e.target.style.color = 'rgba(255,255,255,0.8)'; }}
                                onMouseLeave={e => { if (i18n.language !== lng) e.target.style.color = 'rgba(255,255,255,0.5)'; }}
                            >
                                {lng.toUpperCase()}
                            </button>
                        </React.Fragment>
                    ))}
                </div>

                {/* LOGIN button */}
                <button
                    onClick={() => setShowLoginModal(true)}
                    className="hidden sm:flex items-center gap-2 rounded-full px-5 py-2 text-[11px] uppercase tracking-widest font-bold text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                    style={{
                        background: '#e63946',
                        overflow: 'hidden',
                        position: 'relative',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(230,57,70,0.50)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
                >
                    LOGIN
                </button>

                {/* Hamburger */}
                <button
                    onClick={() => setMenuOpen(prev => !prev)}
                    aria-label="Toggle menu"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.0)',
                        color: '#ffffff',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.0)'; }}
                >
                    {menuOpen ? <IconX /> : <IconMenu />}
                </button>
            </div>
        </header>

        {/* ── FULL-SCREEN OVERLAY ── */}
        <AnimatePresence>
            {menuOpen && (
                <motion.div
                    key="overlay"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 90,
                        backgroundColor: '#0B1120',
                        display: 'flex',
                        flexDirection: 'column',
                        overflowY: 'auto',
                        paddingTop: navHeight,
                    }}
                >
                    {/* Close button */}
                    <button
                        onClick={closeAll}
                        aria-label="Chiudi menu"
                        style={{
                            position: 'absolute',
                            top: '1.25rem',
                            right: '1.5rem',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.08)',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                    >
                        <IconX />
                    </button>

                    {/* Content */}
                    <div
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            maxWidth: '640px',
                            margin: '0 auto',
                            width: '100%',
                            padding: '2.5rem 1.5rem',
                        }}
                    >
                        {/* Accordion sections */}
                        <AccordionSection
                            title={candidateTitle}
                            links={candidateLinks}
                            lang={lang}
                            isOpen={openSection === 'candidates'}
                            onToggle={() => toggleSection('candidates')}
                            onClose={closeAll}
                        />
                        <AccordionSection
                            title={companyTitle}
                            links={companyLinks}
                            lang={lang}
                            isOpen={openSection === 'companies'}
                            onToggle={() => toggleSection('companies')}
                            onClose={closeAll}
                        />

                        {/* Bottom actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
                            <button
                                onClick={() => { closeAll(); setShowLoginModal(true); }}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: '9999px',
                                    background: '#e63946',
                                    color: '#fff',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s, box-shadow 0.2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#c1121f'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(230,57,70,0.4)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#e63946'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                Accedi
                            </button>

                            {/* Language (also visible in overlay) */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                                {['it', 'de', 'fr'].map(lng => (
                                    <button
                                        key={lng}
                                        onClick={() => changeLanguage(lng)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            letterSpacing: '0.1em',
                                            textTransform: 'uppercase',
                                            cursor: 'pointer',
                                            color: i18n.language === lng ? '#ffffff' : 'rgba(255,255,255,0.35)',
                                            transition: 'color 0.2s',
                                        }}
                                        onMouseEnter={e => { e.target.style.color = 'rgba(255,255,255,0.7)'; }}
                                        onMouseLeave={e => { e.target.style.color = i18n.language === lng ? '#ffffff' : 'rgba(255,255,255,0.35)'; }}
                                    >
                                        {lng.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* ── LOGIN MODAL (invariato) ── */}
        <AnimatePresence>
            {showLoginModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowLoginModal(false); }}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden"
                    >
                        <button
                            onClick={() => setShowLoginModal(false)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                        >
                            <IconX />
                        </button>

                        <div className="text-center mb-8 pt-2">
                            <div className="w-12 h-12 rounded-2xl bg-[#26367b]/8 flex items-center justify-center mx-auto mb-4">
                                <IconBuilding />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Area Aziende</h3>
                            <p className="text-slate-500 text-sm">Seleziona un&apos;opzione per continuare l&apos;accesso al portale.</p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <a
                                href="https://jobroom.jobcourier.ch/employer/register.php?ignoreRedirectingCookiesAll=1&lan=it&language=it&_gl=1*e5uej*_gcl_au*MjA5NDU5ODA3Ni4xNzE4MDA1NjYy"
                                className="group relative overflow-hidden rounded-2xl bg-white border-2 border-[#26367b] p-4 flex flex-col items-center justify-center transition-all hover:bg-[#26367b] hover:shadow-lg"
                            >
                                <span className="font-bold text-[#26367b] group-hover:text-white transition-colors">Nuova Azienda (Registrati)</span>
                                <span className="text-xs text-slate-500 group-hover:text-blue-100 transition-colors mt-1">Pubblica il tuo primo annuncio</span>
                            </a>

                            <a
                                href="https://jobroom.jobcourier.ch/job-seekers-login.php"
                                className="group relative overflow-hidden rounded-2xl bg-slate-800 border-2 border-slate-800 p-4 flex flex-col items-center justify-center transition-all hover:bg-slate-900"
                            >
                                <span className="font-bold text-white">Azienda Registrata (Accedi)</span>
                                <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors mt-1">Accedi alla tua dashboard</span>
                            </a>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
        </>
    );
};

export default Navbar;
