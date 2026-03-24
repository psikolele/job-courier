import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const { t, i18n } = useTranslation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 80);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed top-6 left-0 right-0 z-40 mx-auto w-[90%] max-w-5xl rounded-[2.5rem] flex items-center justify-between px-6 py-4 transition-all duration-500 ease-out border ${scrolled
                ? 'bg-surface/70 backdrop-blur-xl border-white/10 shadow-2xl text-background'
                : 'bg-transparent border-transparent text-background'
                }`}
        >
            <div className="flex items-center gap-3">
                <img src="/JC_logo2x.png" alt="Job Courier Logo" className="h-[28px] object-contain" />
            </div>

            <nav className="hidden md:flex items-center gap-8 font-medium text-sm tracking-wide">
                <a href="#jobs" className="hover:text-accent transition-colors relative group">
                    {t('nav.jobs')}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full"></span>
                </a>
                <a href="#companies" className="hover:text-accent transition-colors relative group">
                    {t('nav.companies')}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full"></span>
                </a>
                <a href="#blog" className="hover:text-accent transition-colors relative group">
                    {t('nav.blog')}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full"></span>
                </a>
                <a href="#institutions" className="hover:text-accent transition-colors relative group">
                    {t('nav.institutions')}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full"></span>
                </a>
            </nav>

            <div className="flex items-center gap-4">
                <div className="hidden sm:flex uppercase text-xs font-bold gap-2 text-background/70">
                    <button onClick={() => changeLanguage('it')} className={i18n.language === 'it' ? 'text-accent' : 'hover:text-accent'}>IT</button>
                    <span>|</span>
                    <button onClick={() => changeLanguage('de')} className={i18n.language === 'de' ? 'text-accent' : 'hover:text-accent'}>DE</button>
                    <span>|</span>
                    <button onClick={() => changeLanguage('fr')} className={i18n.language === 'fr' ? 'text-accent' : 'hover:text-accent'}>FR</button>
                </div>
                
                <button className="group relative overflow-hidden rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98] drop-shadow-lg">
                    <span className="relative z-10 flex items-center gap-2">
                        {t('nav.login')}
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </span>
                    <div className="absolute inset-0 z-0 h-full w-0 bg-white/20 transition-all duration-500 ease-out group-hover:w-full"></div>
                </button>
            </div>
        </motion.header>
    );
};

export default Navbar;
