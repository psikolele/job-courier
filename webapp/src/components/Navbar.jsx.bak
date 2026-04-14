import React, { useEffect, useRef, useState, useCallback } from 'react';
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
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}>
        <polyline points="6 9 12 15 18 9"/>
    </svg>
);
const IconX = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);
const IconMenu = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
        descFr: 'Explorez des milliers d\'offres',
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

// Helper to get localised label
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

// ---------- DROPDOWN PANEL ----------
const DropdownPanel = ({ links, lang, title, onClose }) => (
    <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 z-50 bg-white/95 backdrop-blur-xl border border-slate-200/70 rounded-[1.5rem] shadow-[0_20px_60px_-10px_rgba(38,54,123,0.18)] overflow-hidden"
        style={{ minWidth: '340px', maxWidth: '400px' }}
    >
        {/* Panel header */}
        <div className="px-5 pt-4 pb-2 border-b border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#26367b]/60">{title}</span>
        </div>
        {/* Links */}
        <div className="p-2">
            {links.map((item, i) => (
                <a
                    key={i}
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    onClick={onClose}
                    className="group flex items-start gap-3 p-3 rounded-xl hover:bg-[#26367b]/5 transition-all duration-200 hover:-translate-y-[1px]"
                >
                    <span className="mt-[2px] flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center bg-[#26367b]/8 text-[#26367b] group-hover:bg-[#26367b] group-hover:text-white transition-all duration-200">
                        {item.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-800 group-hover:text-[#26367b] transition-colors">
                                {getLabel(item, lang)}
                            </span>
                            <span className="opacity-0 group-hover:opacity-100 text-[#26367b] transition-opacity ml-2 flex-shrink-0">
                                <IconArrowRight />
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 leading-snug">{getDesc(item, lang)}</p>
                    </div>
                </a>
            ))}
        </div>
    </motion.div>
);

// ---------- SECTION TRIGGER ----------
const SectionTrigger = ({ label, isOpen, onClick, accent }) => (
    <button
        onClick={onClick}
        className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold tracking-tight transition-all duration-200 select-none
            ${isOpen
                ? 'bg-[#26367b] text-white shadow-sm'
                : 'text-current hover:bg-[#26367b]/8'
            }`}
        style={{ letterSpacing: '-0.01em' }}
    >
        {label}
        <IconChevronDown open={isOpen} />
    </button>
);

// ---------- MAIN NAVBAR ----------
const Navbar = ({ showLoginModal, setShowLoginModal }) => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState(null); // 'candidates' | 'companies' | null
    const headerRef = useRef(null);
    const { t, i18n } = useTranslation();
    const lang = i18n.language;

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (headerRef.current && !headerRef.current.contains(e.target)) {
                setActiveSection(null);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const toggleSection = useCallback((section) => {
        setActiveSection(prev => prev === section ? null : section);
    }, []);

    const closeAll = useCallback(() => {
        setActiveSection(null);
        setMobileMenuOpen(false);
    }, []);

    const candidateTitle = lang === 'de' ? 'Für Kandidaten' : lang === 'fr' ? 'Pour les candidats' : 'Per i Candidati';
    const companyTitle = lang === 'de' ? 'Für Unternehmen' : lang === 'fr' ? 'Pour les entreprises' : 'Per le Aziende';

    // Navbar is always visible; scrolled just triggers the compact/shadow state
    const isTransparent = false;

    return (
        <>
        {/* ── BACKDROP BLUR OVERLAY when dropdown open ── */}
        <AnimatePresence>
            {activeSection && (
                <motion.div
                    key="backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-[2px]"
                    onClick={() => setActiveSection(null)}
                />
            )}
        </AnimatePresence>

        {/* ── HEADER ── */}
        <header
            ref={headerRef}
            className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 bg-white/98 backdrop-blur-xl border-b border-slate-200/60 ${
                scrolled
                    ? 'shadow-[0_2px_24px_rgba(38,54,123,0.10)]'
                    : 'shadow-none'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className={`flex items-center justify-between transition-all duration-500 ${scrolled ? 'h-[60px]' : 'h-[72px]'}`}>

                    {/* ── LOGO ── */}
                    <a href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
                        <img
                            src="https://www.jobcourier.ch/wp-content/uploads/2021/08/jobcourier_logo.png"
                            alt="Job Courier"
                            className={`object-contain transition-all duration-500 ${scrolled ? 'h-[22px] md:h-[24px]' : 'h-[26px] md:h-[30px]'}`}
                        />
                    </a>

                    {/* ── DESKTOP NAV PILL ── */}
                    <nav className="hidden lg:flex items-center gap-0.5 rounded-full px-2 py-1.5 bg-slate-50/80 border border-slate-200/80 text-slate-700 transition-all duration-500">
                        {/* SECTION: Per i Candidati */}
                        <div className="relative">
                            <SectionTrigger
                                label={candidateTitle}
                                isOpen={activeSection === 'candidates'}
                                onClick={() => toggleSection('candidates')}
                            />
                            <AnimatePresence>
                                {activeSection === 'candidates' && (
                                    <DropdownPanel
                                        links={candidateLinks}
                                        lang={lang}
                                        title={candidateTitle}
                                        onClose={closeAll}
                                    />
                                )}
                            </AnimatePresence>
                        </div>

                        {/* SEPARATOR */}
                        <div className={`w-px h-5 mx-1 flex-shrink-0 rounded-full transition-colors duration-300 ${isTransparent ? 'bg-white/30' : 'bg-slate-300/70'}`} />

                        {/* SECTION: Per le Aziende */}
                        <div className="relative">
                            <SectionTrigger
                                label={companyTitle}
                                isOpen={activeSection === 'companies'}
                                onClick={() => toggleSection('companies')}
                            />
                            <AnimatePresence>
                                {activeSection === 'companies' && (
                                    <DropdownPanel
                                        links={companyLinks}
                                        lang={lang}
                                        title={companyTitle}
                                        onClose={closeAll}
                                    />
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Spacer link — Blog */}
                        <a
                            href="#blog"
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold tracking-tight transition-all duration-200 hover:bg-[#26367b]/8 hover:-translate-y-[1px]`}
                            style={{ letterSpacing: '-0.01em' }}
                        >
                            {lang === 'de' ? 'Blog' : lang === 'fr' ? 'Blog' : 'Blog'}
                        </a>
                    </nav>

                    {/* ── RIGHT ACTIONS ── */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {/* Language switcher */}
                        <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            {['it', 'de', 'fr'].map((lng, idx) => (
                                <React.Fragment key={lng}>
                                    {idx > 0 && <span className="text-slate-300">·</span>}
                                    <button
                                        onClick={() => i18n.changeLanguage(lng)}
                                        className={`transition-all hover:opacity-100 ${
                                            i18n.language === lng ? 'text-[#26367b] opacity-100' : 'opacity-60 hover:opacity-80'
                                        }`}
                                    >
                                        {lng.toUpperCase()}
                                    </button>
                                </React.Fragment>
                            ))}
                        </div>

                        {/* CTA — Accedi (desktop) */}
                        <button
                            onClick={() => setShowLoginModal(true)}
                            className="group relative overflow-hidden hidden md:flex items-center gap-2 rounded-full bg-[#26367b] px-5 py-2 text-[11px] uppercase tracking-widest font-bold text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_6px_20px_rgba(38,54,123,0.35)] active:scale-[0.98]"
                        >
                            <span className="relative z-10">Accedi</span>
                            <div className="absolute inset-0 bg-[#2f9de5]/30 translate-x-[-110%] group-hover:translate-x-0 transition-transform duration-400 ease-out" />
                        </button>

                        {/* Hamburger (mobile) */}
                        <button
                            onClick={() => setMobileMenuOpen(prev => !prev)}
                            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full text-slate-700 hover:bg-slate-100 transition-all duration-200"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <IconX /> : <IconMenu />}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── MOBILE MENU ── */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="lg:hidden overflow-hidden bg-white border-t border-slate-100"
                    >
                        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                            {/* Section: Per i Candidati */}
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#26367b]/60 mb-3 px-1">{candidateTitle}</p>
                                <div className="space-y-1">
                                    {candidateLinks.map((item, i) => (
                                        <a
                                            key={i}
                                            href={item.href}
                                            target={item.external ? '_blank' : undefined}
                                            rel={item.external ? 'noopener noreferrer' : undefined}
                                            onClick={closeAll}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#26367b]/5 transition-all group"
                                        >
                                            <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#26367b]/8 text-[#26367b] group-hover:bg-[#26367b] group-hover:text-white transition-all">
                                                {item.icon}
                                            </span>
                                            <span className="text-sm font-semibold text-slate-700 group-hover:text-[#26367b] transition-colors">
                                                {getLabel(item, lang)}
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Separator */}
                            <div className="h-px bg-slate-100 rounded-full" />

                            {/* Section: Per le Aziende */}
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#26367b]/60 mb-3 px-1">{companyTitle}</p>
                                <div className="space-y-1">
                                    {companyLinks.map((item, i) => (
                                        <a
                                            key={i}
                                            href={item.href}
                                            target={item.external ? '_blank' : undefined}
                                            rel={item.external ? 'noopener noreferrer' : undefined}
                                            onClick={closeAll}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#26367b]/5 transition-all group"
                                        >
                                            <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#26367b]/8 text-[#26367b] group-hover:bg-[#26367b] group-hover:text-white transition-all">
                                                {item.icon}
                                            </span>
                                            <span className="text-sm font-semibold text-slate-700 group-hover:text-[#26367b] transition-colors">
                                                {getLabel(item, lang)}
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Bottom actions */}
                            <div className="flex flex-col gap-3 pt-2">
                                <button
                                    onClick={() => { closeAll(); setShowLoginModal(true); }}
                                    className="w-full py-3 rounded-full bg-[#26367b] text-white text-sm font-bold uppercase tracking-widest text-center hover:bg-[#1e2d6b] transition-colors"
                                >
                                    Accedi
                                </button>
                                {/* Language (mobile) */}
                                <div className="flex justify-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                                    {['it', 'de', 'fr'].map(lng => (
                                        <button
                                            key={lng}
                                            onClick={() => { i18n.changeLanguage(lng); setMobileMenuOpen(false); }}
                                            className={i18n.language === lng ? 'text-[#26367b]' : 'hover:text-slate-600'}
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
        </header>

        {/* ── LOGIN MODAL ── */}
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
                            <p className="text-slate-500 text-sm">Seleziona un'opzione per continuare l'accesso al portale.</p>
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
