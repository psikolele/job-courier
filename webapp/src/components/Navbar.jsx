import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { t, i18n } = useTranslation();

    useEffect(() => {
        const handleScroll = () => {
            // Effetto bouncing trigger a 50px
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <motion.header
            // Il contenitore principale funge da "accordion" allargandosi verso il basso
            className={`fixed top-4 left-0 right-0 z-50 mx-auto w-[92%] md:w-[95%] max-w-7xl flex flex-col overflow-hidden transition-colors duration-500 ease-out border shadow-sm ${
                scrolled || menuOpen
                    ? 'bg-white/95 backdrop-blur-md border-slate-200/50 text-slate-900'
                    : 'bg-transparent border-transparent text-white'
            }`}
            animate={{ 
                y: scrolled && !menuOpen ? 10 : 0, 
                height: menuOpen ? 'auto' : (scrolled ? 70 : 80),
                borderRadius: menuOpen ? 32 : 40 // Usare px puri (32px = 2rem, 40px è metà altezza per la pillola) per evitare glitch dell'interpolazione framer-motion con 9999px
            }}
            transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        >
            {/* TOP BAR ALWAYS VISIBLE */}
            <div className={`flex items-center justify-between px-6 shrink-0 w-full ${scrolled ? 'h-[70px]' : 'h-[80px]'} transition-all duration-300`}>
                
                {/* Logo Section */}
                <div className="flex items-center gap-3">
                    <img 
                        src="https://www.jobcourier.ch/wp-content/uploads/2021/08/jobcourier_logo.png" 
                        alt="Job Courier Logo" 
                        className="h-[32px] md:h-[38px] object-contain transition-all duration-300" 
                    />
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    {/* Language Selector (Desktop) */}
                    <div className="hidden sm:flex uppercase text-[10px] font-bold gap-2 opacity-80">
                        <button onClick={() => changeLanguage('it')} className={i18n.language === 'it' ? 'border-b border-current' : 'hover:opacity-100'}>IT</button>
                        <span>|</span>
                        <button onClick={() => changeLanguage('de')} className={i18n.language === 'de' ? 'border-b border-current' : 'hover:opacity-100'}>DE</button>
                        <span>|</span>
                        <button onClick={() => changeLanguage('fr')} className={i18n.language === 'fr' ? 'border-b border-current' : 'hover:opacity-100'}>FR</button>
                    </div>
                    
                    {/* Primary Login Button (Desktop) */}
                    <button className="group relative overflow-hidden rounded-full bg-red-600 px-6 py-2 text-xs uppercase tracking-wide font-bold text-white transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98] drop-shadow-[0_4px_12px_rgba(220,38,38,0.3)] hidden md:block">
                        <span className="relative z-10 flex items-center gap-2">
                            {t('nav.login')}
                        </span>
                        <div className="absolute inset-0 z-0 h-full w-0 bg-white/20 transition-all duration-500 ease-out group-hover:w-full"></div>
                    </button>

                    {/* Hamburger Menu Toggle (CodePen PomBeP Style) */}
                    <button 
                        onClick={() => setMenuOpen(!menuOpen)}
                        className={`p-2 rounded-full focus:outline-none flex flex-col justify-center items-center gap-[5px] w-12 h-12 transition-colors ${scrolled || menuOpen ? 'hover:bg-slate-100/80 text-slate-900' : 'hover:bg-white/10 text-white'}`}
                    >
                        <motion.span 
                            animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 7 : 0 }} 
                            className="w-6 h-[2px] bg-current block rounded-full" 
                        />
                        <motion.span 
                            animate={{ opacity: menuOpen ? 0 : 1 }} 
                            className="w-6 h-[2px] bg-current block rounded-full" 
                        />
                        <motion.span 
                            animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -7 : 0 }} 
                            className="w-6 h-[2px] bg-current block rounded-full" 
                        />
                    </button>
                </div>
            </div>

            {/* DROPDOWN MENU (CodePen Open-Nav effect via Height Auto) */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center justify-center p-6 sm:p-8 gap-6 sm:gap-8 border-t border-slate-100 mt-2 pb-8 sm:pb-12 w-full"
                    >
                        <nav className="flex flex-col items-center gap-5 sm:gap-6 text-xl sm:text-3xl font-bold font-sans tracking-tight text-slate-800">
                            <a href="#jobs" onClick={() => setMenuOpen(false)} className="hover:text-[#0038A5] transition-colors relative group">
                                {t('nav.jobs')}
                                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[#0038A5] transition-all duration-300 group-hover:w-full"></span>
                            </a>
                            <a href="#companies" onClick={() => setMenuOpen(false)} className="hover:text-[#0038A5] transition-colors relative group">
                                {t('nav.companies')}
                                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[#0038A5] transition-all duration-300 group-hover:w-full"></span>
                            </a>
                            <a href="#blog" onClick={() => setMenuOpen(false)} className="hover:text-[#0038A5] transition-colors relative group">
                                {t('nav.blog')}
                                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[#0038A5] transition-all duration-300 group-hover:w-full"></span>
                            </a>
                            <a href="#institutions" onClick={() => setMenuOpen(false)} className="hover:text-[#0038A5] transition-colors relative group">
                                {t('nav.institutions')}
                                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[#0038A5] transition-all duration-300 group-hover:w-full"></span>
                            </a>
                            
                            <button className="mt-4 overflow-hidden rounded-full bg-[#0038A5] px-10 py-3 text-lg font-bold text-white shadow-md transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98] w-full max-w-xs text-center md:hidden">
                                {t('nav.login')}
                            </button>
                        </nav>
                        
                        {/* Mobile Language Selector */}
                        <div className="flex gap-6 mt-4 text-slate-400 font-medium text-sm sm:hidden">
                            <button onClick={() => { changeLanguage('it'); setMenuOpen(false); }} className={i18n.language === 'it' ? 'text-slate-900 border-b border-slate-900' : 'hover:text-slate-900'}>IT</button>
                            <button onClick={() => { changeLanguage('de'); setMenuOpen(false); }} className={i18n.language === 'de' ? 'text-slate-900 border-b border-slate-900' : 'hover:text-slate-900'}>DE</button>
                            <button onClick={() => { changeLanguage('fr'); setMenuOpen(false); }} className={i18n.language === 'fr' ? 'text-slate-900 border-b border-slate-900' : 'hover:text-slate-900'}>FR</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
};

export default Navbar;
