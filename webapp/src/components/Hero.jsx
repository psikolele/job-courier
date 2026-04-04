import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Hero = ({ setShowLoginModal }) => {
    const { t } = useTranslation();
    const [hoveredSide, setHoveredSide] = useState(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile(); // Check on mount
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Dati per i "Alti Link" richiesti
    const candidateLinks = [
        { label: "Vedi tutte le offerte", url: "https://jobroom.jobcourier.ch/job/latest-and-all-job-ads.php?global=1&utm_source=homepage" },
        { label: "Vedi tutte le aziende", url: "#companies" },
        { label: "Blog", url: "#blog" }
    ];
    const companyLinks = [
        { label: "Soluzioni e tariffe", url: "https://www.jobcourier.ch/soluzioni-e-tariffe/" },
        { label: "Registra azienda", url: "https://jobroom.jobcourier.ch/employer/register.php?ignoreRedirectingCookiesAll=1&lan=it&language=it&_gl=1*e5uej*_gcl_au*MjA5NDU5ODA3Ni4xNzE4MDA1NjYy" },
        { label: "Blog", url: "#blog" }
    ];

    return (
        <section className="relative w-full min-h-screen flex flex-col md:flex-row overflow-hidden font-sans bg-[#131f3f]">
            
            {/* ---------------- CANDIDATES SECTION (LEFT) ---------------- */}
            <motion.div
                onMouseEnter={() => !isMobile && setHoveredSide('candidates')}
                onMouseLeave={() => !isMobile && setHoveredSide(null)}
                animate={{
                    width: isMobile ? '100%' : (hoveredSide === 'candidates' ? '60%' : hoveredSide === 'companies' ? '40%' : '50%')
                }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full md:w-1/2 min-h-[50vh] md:min-h-screen bg-[#fafafa] flex flex-col justify-center px-8 md:px-16 lg:px-24 py-24 text-[#1a202c] border-b md:border-b-0 md:border-r border-slate-200"
            >
                {/* Arrow Icon Indicator */}
                <div className="absolute top-1/2 right-4 md:right-8 -translate-y-1/2 w-12 h-12 rounded-full border border-slate-300 flex items-center justify-center opacity-70 transition-opacity max-md:hidden z-30 bg-white shadow-sm cursor-pointer hover:opacity-100 hover:scale-105 duration-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {hoveredSide === 'candidates' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        )}
                    </svg>
                </div>

                <div className="max-w-md w-full mx-auto md:ml-auto md:mr-12 z-10 relative">
                    <p className="text-sm md:text-xs font-mono text-[#0038A5] mb-6 uppercase tracking-[0.2em] font-bold">
                        Per I Candidati
                    </p>
                    <h1 className="leading-[1.1] tracking-tight mb-6 mt-4">
                        <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-sans text-slate-900">
                            Accedi al tuo
                        </span>
                        <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-sans text-[#0038A5] mt-2">
                            Prossimo Lavoro.
                        </span>
                    </h1>
                    <p className="text-base sm:text-lg text-slate-600 mb-10 max-w-sm">
                        Crea il tuo profilo, imposta gli alert per le posizioni desiderate e candidati con un singolo click.
                    </p>
                    
                    <a href="https://jobroom.jobcourier.ch/job-seekers.php?lan=it&language=it" className="w-auto inline-flex items-center justify-center overflow-hidden rounded-full bg-[#0038A5] px-8 py-4 text-base font-semibold text-white transition-all duration-300 shadow-[0_4px_12px_rgba(0,56,165,0.3)] hover:bg-[#002B7F] active:scale-95">
                        Carica CV
                    </a>

                    {/* Animated "Altri Link" Sub-menu - Slide from Left */}
                    <div className="relative w-full h-0 z-40">
                        <AnimatePresence>
                            {hoveredSide === 'candidates' && !isMobile && (
                                <motion.div
                                    initial={{ opacity: 0, x: -40 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -30 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="absolute top-4 left-0 w-full md:w-[150%] pt-2"
                                >
                                    <p className="text-sm font-semibold text-slate-500 mb-3">Altri link</p>
                                    <div className="flex flex-wrap gap-2">
                                        {candidateLinks.map((link, idx) => (
                                            <a key={idx} href={link.url} className="border border-[#0038A5] text-[#0038A5] bg-white hover:bg-[#0038A5] hover:text-white rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-200">
                                                {link.label}
                                            </a>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {/* Static Links for Mobile */}
                        {isMobile && (
                             <div className="mt-8 flex flex-wrap gap-2">
                                 {candidateLinks.map((link, idx) => (
                                     <a key={idx} href={link.url} className="border border-[#0038A5] text-[#0038A5] bg-transparent hover:bg-[#0038A5] hover:text-white rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-200">
                                         {link.label}
                                     </a>
                                 ))}
                             </div>
                        )}
                    </div>
                </div>
                
                {/* Decorative background element */}
                <svg className="absolute top-[10%] right-[10%] w-64 h-64 text-[#0038A5] opacity-5 pointer-events-none max-md:hidden" viewBox="0 0 200 200" fill="none">
                    <circle cx="100" cy="100" r="99" stroke="currentColor" strokeWidth="2"></circle>
                    <circle cx="160" cy="60" r="20" stroke="currentColor" strokeWidth="2"></circle>
                    <path d="M100 60 L100 140" stroke="currentColor" strokeWidth="8" strokeLinecap="round"></path>
                </svg>
            </motion.div>

            {/* ---------------- COMPANIES SECTION (RIGHT) ---------------- */}
            <motion.div
                onMouseEnter={() => !isMobile && setHoveredSide('companies')}
                onMouseLeave={() => !isMobile && setHoveredSide(null)}
                animate={{
                    width: isMobile ? '100%' : (hoveredSide === 'companies' ? '60%' : hoveredSide === 'candidates' ? '40%' : '50%')
                }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full md:w-1/2 min-h-[50vh] md:min-h-screen bg-[#131f3f] flex flex-col justify-center px-8 md:px-16 lg:px-24 py-24 text-white"
            >
                {/* Arrow Icon Indicator */}
                <div className="absolute top-1/2 left-4 md:left-8 -translate-y-1/2 w-12 h-12 rounded-full border border-slate-600 flex items-center justify-center opacity-70 transition-opacity z-30 bg-[#131f3f] shadow-sm max-md:hidden cursor-pointer hover:opacity-100 hover:scale-105 duration-300">
                    <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         {hoveredSide === 'companies' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        )}
                    </svg>
                </div>

                <div className="max-w-md w-full mx-auto md:ml-12 md:mr-auto z-10 relative">
                    <p className="text-sm md:text-xs font-mono text-slate-400 mb-6 uppercase tracking-[0.2em] font-bold">
                        Per Le Aziende
                    </p>
                    <h1 className="leading-[1.1] tracking-tight mb-6 mt-4">
                        <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-sans text-slate-100">
                            Trova il Miglior
                        </span>
                        <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-sans text-slate-400 mt-2">
                            Talento.
                        </span>
                    </h1>
                    <p className="text-base sm:text-lg text-slate-400 mb-10 max-w-sm">
                        Pubblica i tuoi annunci e raggiungi le menti più brillanti nel tuo settore in pochi click.
                    </p>
                    
                    <button onClick={() => setShowLoginModal(true)} className="w-auto inline-flex items-center justify-center overflow-hidden rounded-full bg-slate-800 border border-slate-700 px-8 py-4 text-base font-semibold text-white transition-all duration-300 shadow-md hover:bg-slate-700 active:scale-95">
                        Pubblica Offerte
                    </button>

                    {/* Animated "Altri Link" Sub-menu - Slide from Right */}
                    <div className="relative w-full h-0 z-40">
                        <AnimatePresence>
                            {hoveredSide === 'companies' && !isMobile && (
                                <motion.div
                                    initial={{ opacity: 0, x: 40 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 30 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="absolute top-4 left-0 w-full md:w-[150%] pt-2"
                                >
                                    <p className="text-sm font-semibold text-slate-400 mb-3">Altri link</p>
                                    <div className="flex flex-wrap gap-2">
                                        {companyLinks.map((link, idx) => (
                                            <a key={idx} href={link.url} className="border border-slate-400 text-slate-300 bg-transparent hover:bg-white hover:text-[#131f3f] hover:border-white rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-200">
                                                {link.label}
                                            </a>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {/* Static Links for Mobile */}
                        {isMobile && (
                             <div className="mt-8 flex flex-wrap gap-2">
                                 {companyLinks.map((link, idx) => (
                                     <a key={idx} href={link.url} className="border border-slate-600 text-slate-300 bg-transparent hover:bg-slate-700 hover:text-white rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-200">
                                         {link.label}
                                     </a>
                                 ))}
                             </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

export default Hero;
