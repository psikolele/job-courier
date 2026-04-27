import React, { useEffect, useState, useCallback } from 'react';

import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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

const getCandidateLinks = (isHome) => [
    { label: 'Vedi tutte le offerte', labelEn: 'View all offers', labelDe: 'Alle Angebote ansehen', labelFr: 'Voir toutes les offres', href: 'https://jobroom.jobcourier.ch/job/latest-and-all-job-ads.php', external: true },
    { label: 'Pubblica il tuo curriculum', labelEn: 'Publish your CV', labelDe: 'Lebenslauf veröffentlichen', labelFr: 'Publiez votre CV', href: 'https://jobroom.jobcourier.ch/job-seekers.php?lan=it&language=it', external: true },
    { label: 'Vedi tutte le aziende', labelEn: 'View all companies', labelDe: 'Alle Unternehmen ansehen', labelFr: 'Voir toutes les entreprises', href: 'https://jobroom.jobcourier.ch/jobs-by-company.php', external: true },
    { label: 'Suggerimenti per la tua carriera', labelEn: 'Career tips', labelDe: 'Karrieretipps', labelFr: 'Conseils de carrière', href: isHome ? '#blog' : '/#blog' },
];

const getCompanyLinks = (isHome) => [
    { label: 'Come funziona', labelEn: 'How it works', labelDe: 'Wie es funktioniert', labelFr: 'Comment ça marche', href: '/come-funziona' },
    { label: 'Soluzioni e Tariffe', labelEn: 'Solutions and Prices', labelDe: 'Lösungen und Tarife', labelFr: 'Solutions et tarifs', href: '/soluzioni-e-tariffe' },
    { label: 'Registra Azienda', labelEn: 'Register Company', labelDe: 'Unternehmen registrieren', labelFr: 'Enregistrer une entreprise', href: 'https://jobroom.jobcourier.ch/employer/register.php?ignoreRedirectingCookiesAll=1&lan=it&language=it', external: true },
    { label: 'Suggerimenti per il recruiting', labelEn: 'Recruiting tips', labelDe: 'Recruiting-Tipps', labelFr: 'Conseils de recrutement', href: isHome ? '#blog' : '/#blog' },
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
    
    const candidateLinks = getCandidateLinks(isHome);
    const companyLinks = getCompanyLinks(isHome);

    return (
        <>
            {/* ── UNIFORM NAVBAR HEADER (#F7F8F6) ── */}
            <header
                className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 md:px-12 transition-all duration-300"
                style={{
                    height: navHeight,
                    backgroundColor: '#FAFAFA',
                    boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.05)' : 'none',
                    borderBottom: '1px solid rgba(0,0,0,0.05)'
                }}
            >
                {/* Logo */}
                <Link to="/" className="flex items-center">
                    <img
                        src="/JC_logo2x.png"
                        alt="Job Courier"
                        className="object-contain h-6 md:h-8"
                    />
                </Link>

                {/* Right side actions */}
                <div className="flex items-center gap-6">
                    {/* Language Switcher */}
                    <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-slate-500">
                        {['it', 'en', 'de', 'fr'].map((lng, idx) => (
                            <React.Fragment key={lng}>
                                {idx > 0 && <span>|</span>}
                                <button
                                    onClick={() => changeLanguage(lng)}
                                    className={`hover:text-[#01498C] transition-colors ${i18n.language === lng ? 'text-[#01498C]' : ''}`}
                                >
                                    {lng.toUpperCase()}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>

                    {/* RED LOGIN Button */}
                    <button
                        onClick={() => setShowLoginModal(true)}
                        className="bg-[#e63946] hover:bg-[#c1121f] text-white px-4 md:px-6 py-2 rounded-xl text-[10px] md:text-[11px] font-bold tracking-widest transition-all btn-shiny hover-lift whitespace-nowrap flex-shrink-0"
                    >
                        {t('nav.login').toUpperCase()}
                    </button>

                    {/* HAMBURGER Toggle */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="text-[#01498C] p-1 rounded-full transition-colors hover:bg-[#01498C]/10"
                    >
                        {menuOpen ? <IconX /> : <IconMenu />}
                    </button>
                </div>
            </header>

            {/* ── GLASS SPLIT MENU (70% HEIGHT) ── */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-0 left-0 right-0 z-[90] flex flex-col md:flex-row shadow-2xl"
                        style={{
                            height: '70vh',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            paddingTop: navHeight,
                        }}
                    >
                        {/* CLOSE Button Overlay (Mobile focus) */}
                        <button 
                            onClick={() => setMenuOpen(false)}
                            className="absolute top-20 right-6 md:hidden text-slate-400"
                        >
                            <IconX />
                        </button>

                        {/* LEFT SECTION: CANDIDATI */}
                        <div className="flex-1 flex flex-col items-center pt-10 md:pt-16 px-8 border-b md:border-b-0 md:border-r border-slate-200/50 bg-[#fafafa]/50 relative group">
                            <div className="mb-4 text-[#01498C]/40 group-hover:text-[#01498C]/60 transition-colors duration-500">
                                <IconUser size={32} />
                            </div>
                            <div className="relative z-10 flex flex-col items-center">
                                <h2 className="text-xl md:text-2xl font-normal text-[#01498C] tracking-[0.2em] uppercase font-sans mb-6 opacity-70">
                                    {candidateTitle}
                                </h2>
                                <div className="flex flex-col items-center gap-4">
                                    {candidateLinks.map((link, idx) => (
                                        link.external ? (
                                            <a
                                                key={idx}
                                                href={link.href}
                                                className="text-xs md:text-sm text-slate-500 font-mono hover:text-[#01498C] transition-all whitespace-normal break-words text-center"
                                                onClick={() => setMenuOpen(false)}
                                            >
                                                {getLabel(link, lang)}
                                            </a>
                                        ) : (
                                            <Link
                                                key={idx}
                                                to={link.href}
                                                className="text-xs md:text-sm text-slate-500 font-mono hover:text-[#01498C] transition-all whitespace-normal break-words text-center"
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
                        <div className="flex-1 flex flex-col items-center pt-10 md:pt-16 px-8 relative group">
                            <div className="mb-4 text-slate-400/40 group-hover:text-slate-400/60 transition-colors duration-500">
                                <IconBuilding size={32} />
                            </div>
                            <div className="relative z-10 flex flex-col items-center">
                                <h2 className="text-xl md:text-2xl font-normal text-slate-500 tracking-[0.2em] uppercase font-sans mb-6 opacity-70">
                                    {companyTitle}
                                </h2>
                                <div className="flex flex-col items-center gap-4">
                                    {companyLinks.map((link, idx) => (
                                        link.external ? (
                                            <a
                                                key={idx}
                                                href={link.href}
                                                className="text-xs md:text-sm text-slate-500 font-mono hover:text-[#01498C] transition-all whitespace-normal break-words text-center"
                                                onClick={() => setMenuOpen(false)}
                                            >
                                                {getLabel(link, lang)}
                                            </a>
                                        ) : (
                                            <Link
                                                key={idx}
                                                to={link.href}
                                                className="text-xs md:text-sm text-slate-500 font-mono hover:text-[#01498C] transition-all whitespace-normal break-words text-center"
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
                        className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 md:p-8"
                        onClick={(e) => { if (e.target === e.currentTarget) setShowLoginModal(false); }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] w-full max-w-4xl relative overflow-hidden flex flex-col md:flex-row min-h-[500px]"
                        >
                            <button
                                onClick={() => setShowLoginModal(false)}
                                className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors shadow-sm"
                            >
                                <IconX />
                            </button>

                            {/* LEFT: CANDIDATI */}
                            <div className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50">
                                <div className="w-12 h-12 rounded-2xl bg-[#0038A5]/10 flex items-center justify-center mb-6 text-[#0038A5]">
                                    <IconUser size={24} />
                                </div>
                                <h3 className="text-xl md:text-2xl font-normal text-slate-900 mb-2 tracking-[0.2em] uppercase font-sans opacity-70">
                                    Candidati
                                </h3>
                                <p className="text-slate-500 text-sm mb-8 max-w-[240px]">Accedi al tuo profilo per gestire le candidature e il tuo CV.</p>
                                
                                <div className="flex flex-col gap-3 w-full max-w-[280px]">
                                    <a
                                        href="https://jobroom.jobcourier.ch/job-seekers-login.php"
                                        className="w-full bg-[#0038A5] text-white font-bold py-4 rounded-2xl transition-all shadow-[0_8px_20px_rgba(0,56,165,0.2)] btn-shiny hover-lift text-center"
                                    >
                                        Accedi al Profilo
                                    </a>
                                    <a
                                        href="https://jobroom.jobcourier.ch/job-seekers.php?lan=it&language=it"
                                        className="w-full bg-white border-2 border-slate-200 text-slate-600 font-bold py-4 rounded-2xl transition-all hover:border-[#0038A5] hover:text-[#0038A5] hover-lift text-center"
                                    >
                                        Carica il tuo CV
                                    </a>
                                </div>
                            </div>

                            {/* RIGHT: AZIENDE */}
                            <div className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center text-center">
                                <div className="w-12 h-12 rounded-2xl bg-slate-900/5 flex items-center justify-center mb-6 text-slate-800">
                                    <IconBuilding size={24} />
                                </div>
                                <h3 className="text-xl md:text-2xl font-normal text-slate-900 mb-2 tracking-[0.2em] uppercase font-sans opacity-70">
                                    Aziende
                                </h3>
                                <p className="text-slate-500 text-sm mb-8 max-w-[240px]">Pubblica le tue offerte e trova i migliori talenti.</p>
                                
                                <div className="flex flex-col gap-3 w-full max-w-[280px]">
                                    <a
                                        href="https://jobroom.jobcourier.ch/job-seekers-login.php"
                                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_8px_20px_rgba(0,0,0,0.2)] btn-shiny hover-lift text-center"
                                    >
                                        Login Azienda
                                    </a>
                                    <a
                                        href="https://jobroom.jobcourier.ch/employer/register.php?ignoreRedirectingCookiesAll=1&lan=it&language=it&_gl=1*e5uej*_gcl_au*MjA5NDU5ODA3Ni4xNzE4MDA1NjYy"
                                        className="w-full bg-white border-2 border-slate-200 text-slate-600 font-bold py-4 rounded-2xl transition-all hover:border-slate-800 hover:text-slate-800 hover-lift text-center px-4"
                                    >
                                        Registra la tua azienda
                                    </a>
                                </div>
                            </div>

                            {/* Accent bottom bar */}
                            <div className="absolute bottom-0 left-0 right-0 h-1.5 flex">
                                <div className="flex-1 bg-[#0038A5]"></div>
                                <div className="flex-1 bg-slate-900"></div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
