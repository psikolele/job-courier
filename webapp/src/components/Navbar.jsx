import React, { useEffect, useState, useCallback } from 'react';

import { AnimatedButton } from './ui/animated-button';

import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

// ---------- ICONS ----------
const IconBriefcase = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
);
const IconSearch = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
);
const IconStar = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
);
const IconBuilding = ({ size = 18 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>
    </svg>
);
const IconUser = ({ size = 18 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
);
const IconUsers = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
);
const IconTrendingUp = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
    </svg>
);
const IconX = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);
const IconMenu = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
);

const getCandidateLinks = () => [
    { label: 'Vedi tutte le offerte', labelEn: 'View all offers', labelDe: 'Alle Angebote ansehen', labelFr: 'Voir toutes les offres', href: '/offerte' },
    { label: 'Pubblica il tuo curriculum', labelEn: 'Publish your CV', labelDe: 'Lebenslauf veröffentlichen', labelFr: 'Publiez votre CV', href: 'https://jobroom.jobcourier.ch/job-seekers.php?lan=it&language=it', external: true },
    { label: 'Vedi tutte le aziende', labelEn: 'View all companies', labelDe: 'Alle Unternehmen ansehen', labelFr: 'Voir toutes les entreprises', href: 'https://jobroom.jobcourier.ch/jobs-by-company.php', external: true },
];

const getCompanyLinks = () => [
    { label: 'Come funziona', labelEn: 'How it works', labelDe: 'Wie es funktioniert', labelFr: 'Comment ça marche', href: '/come-funziona' },
    { label: 'Soluzioni e Tariffe', labelEn: 'Solutions and Prices', labelDe: 'Lösungen und Tarife', labelFr: 'Solutions et tarifs', href: '/soluzioni-e-tariffe' },
    { label: 'Registra Azienda', labelEn: 'Register Company', labelDe: 'Unternehmen registrieren', labelFr: 'Enregistrer une entreprise', href: 'https://jobroom.jobcourier.ch/employer/register.php?ignoreRedirectingCookiesAll=1&lan=it&language=it', external: true },
];

const getLabel = (item, lang) => {
    if (lang === 'en' && item.labelEn) return item.labelEn;
    if (lang === 'de' && item.labelDe) return item.labelDe;
    if (lang === 'fr' && item.labelFr) return item.labelFr;
    return item.label;
};

// ---------- MAIN NAVBAR ----------
const Navbar = ({ showLoginModal, setShowLoginModal }) => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const lang = i18n.language;
    
    const isHome = location.pathname === '/';
    useEffect(() => {
        const handleResize = () => {};
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const candidateTitle = t('nav.candidates');
    const companyTitle = t('nav.companies');

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (menuOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
    }, [menuOpen]);

    const changeLanguage = useCallback((lng) => {
        i18n.changeLanguage(lng);
    }, [i18n]);

    const navHeight = scrolled ? '64px' : '80px';
    
    const candidateLinks = getCandidateLinks();
    const companyLinks = getCompanyLinks();

    return (
        <>
            {/* ── NAVBAR ── */}
            <header
                className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 md:px-12 transition-all duration-300"
                style={{
                    height: navHeight,
                    backgroundColor: '#FFFFFF',
                    borderBottom: '1px solid rgba(5,11,43,0.06)'
                }}
            >
                {/* Logo mark */}
                <Link to="/" className="flex items-center h-full group relative">
                    <motion.div
                        className="relative flex items-center h-full"
                        whileHover="hover"
                    >
                        {/* Sleek Sweep Shimmer Effect - Isolated in overflow-hidden box to prevent logo clipping */}
                        <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none rounded-md">
                            <motion.div 
                                className="absolute inset-y-0 w-[50%] pointer-events-none"
                                style={{
                                    background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)',
                                    skewX: -20,
                                    top: 0,
                                    left: '-100%',
                                }}
                                variants={{
                                    hover: {
                                        left: '200%',
                                        transition: { duration: 0.9, ease: "easeInOut" }
                                    }
                                }}
                            />
                        </div>
                        {/* Logo Image with Magnetic Lift & Drop Shadow - Infinitely sharp high-resolution raster asset */}
                        <motion.img 
                            src="/logo-full.png" 
                            alt="JobCourier" 
                            className="h-10 md:h-[72px] w-auto object-contain"
                            initial={{ scale: 1, y: 0, filter: "drop-shadow(0 2px 4px rgba(38, 54, 123, 0.0))" }}
                            variants={{
                                hover: {
                                    scale: 1.05,
                                    y: -2,
                                    filter: "drop-shadow(0 8px 24px rgba(38, 54, 123, 0.12))"
                                }
                            }}
                            transition={{ 
                                type: "spring", 
                                stiffness: 280, 
                                damping: 18 
                            }}
                        />
                    </motion.div>
                </Link>

                {/* Right side actions */}
                <div className="flex items-center gap-5">
                    {/* Language Switcher */}
                    <div className="hidden md:flex items-center gap-2 text-[10px] font-bold" style={{ color: 'var(--brand-gray-mid)' }}>
                        {['it', 'en', 'de', 'fr'].map((lng, idx) => (
                            <React.Fragment key={lng}>
                                {idx > 0 && <span style={{ opacity: 0.3 }}>|</span>}
                                <button
                                    onClick={() => changeLanguage(lng)}
                                    style={{
                                        color: i18n.language === lng ? 'var(--brand-navy)' : 'var(--brand-gray-mid)',
                                        fontFamily: 'var(--font-body)',
                                        fontWeight: i18n.language === lng ? 700 : 400,
                                        letterSpacing: '0.1em'
                                    }}
                                    className="transition-colors hover:text-[var(--brand-navy)] cursor-pointer"
                                >
                                    {lng.toUpperCase()}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Accedi link */}
                    <motion.button
                        onClick={() => setShowLoginModal(true)}
                        className="hidden md:flex items-center cursor-pointer"
                        style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 13,
                            color: 'var(--brand-fuchsia)',
                            fontWeight: 700,
                            background: 'none',
                            border: '1.5px solid var(--brand-fuchsia)',
                            padding: '7px 18px',
                            borderRadius: 0,
                            letterSpacing: '0.05em',
                        }}
                        whileHover={{
                            backgroundColor: 'var(--brand-fuchsia)',
                            color: '#FFFFFF',
                            transition: { duration: 0.15 }
                        }}
                    >
                        {t('nav.login')}
                    </motion.button>

                    {/* HAMBURGER Toggle */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        style={{ color: 'var(--brand-navy)' }}
                        className="p-1 transition-opacity hover:opacity-70 cursor-pointer"
                    >
                        {menuOpen ? <IconX /> : <IconMenu />}
                    </button>
                </div>
            </header>

            {/* ── GLASS SPLIT MENU (COMPACT HEIGHT) ── */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-0 left-0 right-0 z-[90] flex flex-col md:flex-row border-b border-[#050B2B]/10 h-[85vh] md:h-[52vh] overflow-y-auto md:overflow-y-hidden"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.98)',
                            paddingTop: navHeight,
                        }}
                    >
                        {/* CLOSE Button Overlay (Mobile focus) */}
                        <button 
                            onClick={() => setMenuOpen(false)}
                            className="absolute top-20 right-6 md:hidden text-slate-400 cursor-pointer"
                        >
                            <IconX />
                        </button>

                        {/* LEFT SECTION: CANDIDATI */}
                        <div className="flex-1 flex flex-col items-center pt-8 md:pt-10 px-8 border-b md:border-b-0 md:border-r border-slate-200/50 bg-[#F6F7FB] relative group" style={{ borderBottom: '2px solid var(--brand-fuchsia)' }}>
                            <div className="mb-4 text-[var(--brand-navy)]/40 group-hover:text-[var(--brand-fuchsia)] transition-colors duration-300">
                                <IconUser size={32} />
                            </div>
                            <div className="relative z-10 flex flex-col items-center">
                                <h2 className="text-lg md:text-xl font-bold text-[var(--brand-navy)] tracking-[0.2em] uppercase font-sans mb-4">
                                    {candidateTitle}
                                </h2>
                                <div className="flex flex-col items-center gap-4">
                                    {candidateLinks.map((link, idx) => (
                                        link.external ? (
                                            <a
                                                key={idx}
                                                href={link.href}
                                                className="text-sm md:text-[15px] font-medium text-slate-500 font-mono hover:text-[var(--brand-fuchsia)] transition-all whitespace-normal break-words text-center"
                                                onClick={() => setMenuOpen(false)}
                                            >
                                                {getLabel(link, lang)}
                                            </a>
                                        ) : (
                                            <Link
                                                key={idx}
                                                to={link.href}
                                                className="text-sm md:text-[15px] font-medium text-slate-500 font-mono hover:text-[var(--brand-fuchsia)] transition-all whitespace-normal break-words text-center"
                                                onClick={() => setMenuOpen(false)}
                                            >
                                                {getLabel(link, lang)}
                                            </Link>
                                        )
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT SECTION: AZIENDE */}
                        <div className="flex-1 flex flex-col items-center pt-8 md:pt-10 px-8 relative group bg-white" style={{ borderBottom: '2px solid var(--brand-fuchsia)' }}>
                            <div className="mb-4 text-slate-400/40 group-hover:text-[var(--brand-fuchsia)] transition-colors duration-300">
                                <IconBuilding size={32} />
                            </div>
                            <div className="relative z-10 flex flex-col items-center">
                                <h2 className="text-lg md:text-xl font-bold text-[var(--brand-navy)] tracking-[0.2em] uppercase font-sans mb-4">
                                    {companyTitle}
                                </h2>
                                <div className="flex flex-col items-center gap-4">
                                    {companyLinks.map((link, idx) => (
                                        link.external ? (
                                            <a
                                                key={idx}
                                                href={link.href}
                                                className="text-sm md:text-[15px] font-medium text-slate-500 font-mono hover:text-[var(--brand-fuchsia)] transition-all whitespace-normal break-words text-center"
                                                onClick={() => setMenuOpen(false)}
                                            >
                                                {getLabel(link, lang)}
                                            </a>
                                        ) : (
                                            <Link
                                                key={idx}
                                                to={link.href}
                                                className="text-sm md:text-[15px] font-medium text-slate-500 font-mono hover:text-[var(--brand-fuchsia)] transition-all whitespace-normal break-words text-center"
                                                onClick={() => setMenuOpen(false)}
                                            >
                                                {getLabel(link, lang)}
                                            </Link>
                                        )
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background overlay to close menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMenuOpen(false)}
                        className="fixed inset-0 z-[80] bg-black/10 backdrop-blur-[2px]"
                    />
                )}
            </AnimatePresence>

            {/* ── LOGIN MODAL: CINEMATIC SPLIT VIEW ── */}
            <AnimatePresence>
                {showLoginModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[120] flex items-center justify-center bg-white/40 backdrop-blur-[3px] p-4 md:p-8"
                        onClick={(e) => { if (e.target === e.currentTarget) setShowLoginModal(false); }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 15 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 15 }}
                            className="bg-white shadow-2xl w-full max-w-4xl relative overflow-hidden flex flex-col md:flex-row min-h-[500px] rounded-none"
                        >
                            <button
                                onClick={() => setShowLoginModal(false)}
                                className="absolute top-6 right-6 z-20 w-10 h-10 bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors shadow-sm rounded-none border border-slate-200 cursor-pointer"
                            >
                                <IconX />
                            </button>

                            {/* LEFT: CANDIDATI */}
                            <div className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-200/50 bg-[#F6F7FB]">
                                <div className="w-12 h-12 bg-[var(--brand-navy)]/10 flex items-center justify-center mb-6 text-[var(--brand-navy)] rounded-none">
                                    <IconUser size={24} />
                                </div>
                                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 tracking-[0.2em] uppercase font-sans">
                                    Candidati
                                </h3>
                                <p className="text-slate-500 text-sm mb-8 max-w-[240px]">Accedi al tuo profilo per gestire le candidature e il tuo CV.</p>
                                
                                <div className="flex flex-col gap-3 w-full max-w-[280px]">
                                    <motion.a
                                        whileHover={{ scale: 1.03 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                        href="https://jobroom.jobcourier.ch/job-seekers-login.php?language=it"
                                        className="w-full bg-[var(--brand-navy)] text-white font-bold py-4 transition-all text-center rounded-none tracking-[0.1em] text-xs uppercase"
                                    >
                                        Accedi al Profilo
                                    </motion.a>
                                    <motion.a
                                        whileHover={{ scale: 1.03 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                        href="https://jobroom.jobcourier.ch/job-seekers.php?lan=it&language=it"
                                        className="w-full bg-white border-2 border-slate-200 text-slate-600 font-bold py-4 transition-all hover:border-[var(--brand-navy)] hover:text-[var(--brand-navy)] text-center rounded-none tracking-[0.1em] text-xs uppercase"
                                    >
                                        Carica il tuo CV
                                    </motion.a>
                                </div>
                            </div>

                            {/* RIGHT: AZIENDE */}
                            <div className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center text-center bg-[var(--brand-navy)] text-white">
                                <div className="w-12 h-12 bg-white/10 flex items-center justify-center mb-6 text-white rounded-none">
                                    <IconBuilding size={24} />
                                </div>
                                <h3 className="text-lg md:text-xl font-bold text-white mb-2 tracking-[0.2em] uppercase font-sans">
                                    Aziende
                                </h3>
                                <p className="text-slate-300 text-sm mb-8 max-w-[240px]">Pubblica le tue offerte e trova i migliori talenti.</p>
                                
                                <div className="flex flex-col gap-3 w-full max-w-[280px]">
                                    <motion.a
                                        whileHover={{ scale: 1.03 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                        href="https://jobroom.jobcourier.ch/job-seekers-login.php?language=it"
                                        className="w-full bg-[var(--brand-fuchsia)] text-white font-bold py-4 transition-all text-center rounded-none tracking-[0.1em] text-xs uppercase"
                                    >
                                        Login Azienda
                                    </motion.a>
                                    <motion.a
                                        whileHover={{ scale: 1.03 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                        href="https://jobroom.jobcourier.ch/employer/register.php?ignoreRedirectingCookiesAll=1&lan=it&language=it&_gl=1*e5uej*_gcl_au*MjA5NDU5ODA3Ni4xNzE4MDA1NjYy"
                                        className="w-full bg-transparent border-2 border-white/20 text-white font-bold py-4 transition-all hover:border-[var(--brand-fuchsia)] hover:text-[var(--brand-fuchsia)] text-center px-4 rounded-none tracking-[0.1em] text-xs uppercase"
                                    >
                                        Registra la tua azienda
                                    </motion.a>
                                </div>
                            </div>

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
