import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
const IconBuilding = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>
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

// ---------- NAV DATA ----------
const candidateLinks = [
    { label: 'Cerca Lavoro', labelDe: 'Jobsuche', labelFr: "Recherche d'emploi", href: '#jobs' },
    { label: 'Le mie Candidature', labelDe: 'Meine Bewerbungen', labelFr: 'Mes candidatures', href: 'https://jobroom.jobcourier.ch/job-seekers-login.php', external: true },
    { label: 'Consigli di Carriera', labelDe: 'Karrieretipps', labelFr: 'Conseils carriera', href: '#blog' },
    { label: 'Blog', labelDe: 'Blog', labelFr: 'Blog', href: '#blog' },
];

const companyLinks = [
    { label: 'Pubblica un Annuncio', labelDe: 'Stellenanzeige aufgeben', labelFr: 'Publier une annonce', href: 'https://jobroom.jobcourier.ch/employer/register.php?ignoreRedirectingCookiesAll=1&lan=it&language=it', external: true },
    { label: 'Gestisci Candidature', labelDe: 'Bewerbungen verwalten', labelFr: 'Gérer les candidatures', href: 'https://jobroom.jobcourier.ch/job-seekers-login.php', external: true },
    { label: 'Soluzioni e Tariffe', labelDe: 'Lösungen und Tarife', labelFr: 'Solutions et tarifs', href: 'https://www.jobcourier.ch/soluzioni-e-tariffe/', external: true },
    { label: 'Recruiter Pro', labelDe: 'Recruiter Pro', labelFr: 'Recruiter Pro', href: '#companies' },
];

const getLabel = (item, lang) => {
    if (lang === 'de' && item.labelDe) return item.labelDe;
    if (lang === 'fr' && item.labelFr) return item.labelFr;
    return item.label;
};

// ---------- MAIN NAVBAR ----------
const Navbar = ({ showLoginModal, setShowLoginModal }) => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { i18n } = useTranslation();
    const lang = i18n.language;

    const candidateTitle = lang === 'de' ? 'KANDIDATEN' : lang === 'fr' ? 'CANDIDATS' : 'CANDIDATI';
    const companyTitle = lang === 'de' ? 'UNTERNEHMEN' : lang === 'fr' ? 'ENTREPRISES' : 'AZIENDE';

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

    return (
        <>
            {/* ── UNIFORM NAVBAR HEADER (#F0F0F0) ── */}
            <header
                className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 md:px-12 transition-all duration-300"
                style={{
                    height: navHeight,
                    backgroundColor: '#F0F0F0',
                    boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.08)' : 'none',
                    borderBottom: '1px solid rgba(0,0,0,0.05)'
                }}
            >
                {/* Logo */}
                <a href="/" className="flex items-center">
                    <img
                        src="https://www.jobcourier.ch/wp-content/uploads/2021/08/jobcourier_logo.png"
                        alt="Job Courier"
                        className="object-contain h-6 md:h-8"
                    />
                </a>

                {/* Right side actions */}
                <div className="flex items-center gap-6">
                    {/* Language Switcher */}
                    <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-slate-400">
                        {['it', 'de', 'fr'].map((lng, idx) => (
                            <React.Fragment key={lng}>
                                {idx > 0 && <span>|</span>}
                                <button
                                    onClick={() => changeLanguage(lng)}
                                    className={`hover:text-[#26367b] transition-colors ${i18n.language === lng ? 'text-[#26367b]' : ''}`}
                                >
                                    {lng.toUpperCase()}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>

                    {/* RED LOGIN Button */}
                    <button
                        onClick={() => setShowLoginModal(true)}
                        className="bg-[#e63946] hover:bg-[#c1121f] text-white px-6 py-2 rounded-full text-[11px] font-bold tracking-widest transition-all hover:shadow-lg active:scale-95"
                    >
                        LOGIN
                    </button>

                    {/* HAMBURGER Toggle */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="text-[#26367b] p-1 hover:bg-black/5 rounded-full transition-colors"
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
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(12px)',
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
                        <div className="flex-1 flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-slate-200/50">
                            <h2 className="text-4xl md:text-6xl font-black text-[#26367b]/10 absolute -top-4 md:top-20 pointer-events-none tracking-tighter">
                                {candidateTitle}
                            </h2>
                            <div className="relative z-10 flex flex-col items-center gap-4">
                                <span className="text-xs font-bold tracking-widest text-[#26367b]/40 mb-2">{candidateTitle}</span>
                                {candidateLinks.map((link, idx) => (
                                    <a
                                        key={idx}
                                        href={link.href}
                                        className="text-xl md:text-2xl font-bold text-slate-800 hover:text-[#e63946] transition-colors"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        {getLabel(link, lang)}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT SECTION: AZIENDE */}
                        <div className="flex-1 flex flex-col items-center justify-center p-8">
                            <h2 className="text-4xl md:text-6xl font-black text-[#26367b]/10 absolute -top-4 md:top-20 pointer-events-none tracking-tighter">
                                {companyTitle}
                            </h2>
                            <div className="relative z-10 flex flex-col items-center gap-4">
                                <span className="text-xs font-bold tracking-widest text-[#26367b]/40 mb-2">{companyTitle}</span>
                                {companyLinks.map((link, idx) => (
                                    <a
                                        key={idx}
                                        href={link.href}
                                        className="text-xl md:text-2xl font-bold text-slate-800 hover:text-[#e63946] transition-colors"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        {getLabel(link, lang)}
                                    </a>
                                ))}
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

            {/* ── LOGIN MODAL ── */}
            <AnimatePresence>
                {showLoginModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
                        onClick={(e) => { if (e.target === e.currentTarget) setShowLoginModal(false); }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden"
                        >
                            <button
                                onClick={() => setShowLoginModal(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <IconX />
                            </button>

                            <div className="text-center mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-[#26367b]/10 flex items-center justify-center mx-auto mb-4 text-[#26367b]">
                                    <IconBuilding />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Area Aziende</h3>
                                <p className="text-slate-500 text-sm">Seleziona un'opzione per accedere al portale.</p>
                            </div>

                            <div className="flex flex-col gap-4">
                                <a
                                    href="https://jobroom.jobcourier.ch/employer/register.php"
                                    className="group rounded-2xl bg-white border-2 border-[#26367b] p-4 flex flex-col items-center justify-center transition-all hover:bg-[#26367b]"
                                >
                                    <span className="font-bold text-[#26367b] group-hover:text-white transition-colors">Nuova Azienda</span>
                                    <span className="text-xs text-slate-500 group-hover:text-blue-100 transition-colors mt-1">Registrati e pubblica</span>
                                </a>

                                <a
                                    href="https://jobroom.jobcourier.ch/job-seekers-login.php"
                                    className="group rounded-2xl bg-slate-800 p-4 flex flex-col items-center justify-center transition-all hover:bg-black"
                                >
                                    <span className="font-bold text-white">Azienda Registrata</span>
                                    <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors mt-1">Accedi alla dashboard</span>
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
