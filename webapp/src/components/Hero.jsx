import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Briefcase, ChevronRight, Mail } from 'lucide-react';

import heroBg1 from '../assets/hero-bg.jpg';

const Hero = ({ setShowLoginModal }) => {
    const { t } = useTranslation();
    const [hoveredSide, setHoveredSide] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const sliderImages = [
        heroBg1,
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
    ];

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile(); // Check on mount
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % sliderImages.length);
        }, 5000);
        return () => clearInterval(interval);
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
                    width: isMobile ? '100%' : (hoveredSide === 'companies' ? '40%' : '60%')
                }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full md:w-1/2 min-h-[50vh] md:min-h-screen bg-[#fafafa] flex flex-col justify-center px-8 md:px-16 lg:px-24 py-24 text-[#1a202c] border-b md:border-b-0 md:border-r border-slate-200"
            >
                <div className="max-w-md w-full mx-auto md:mx-0 md:ml-12 lg:ml-20 xl:ml-32 z-10 relative">
                    <motion.div animate={{ scale: isMobile ? 1 : (hoveredSide === 'companies' ? 0.85 : 1), transformOrigin: "left center" }} transition={{ duration: 0.5, ease: "easeOut" }}>
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
                        <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-sm">
                            Crea il tuo profilo, imposta gli alert per le posizioni desiderate e candidati con un singolo click.
                        </p>
                        
                        <motion.div animate={{ opacity: hoveredSide === 'companies' ? 0 : 1, pointerEvents: hoveredSide === 'companies' ? 'none' : 'auto' }} transition={{ duration: 0.3 }} className="space-y-4">
                            <form action="https://jobroom.jobcourier.ch/job/latest-and-all-job-ads.php" method="GET" className="flex flex-col gap-3 w-full bg-white/40 backdrop-blur-md p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200">
                                <input type="hidden" name="global" value="1" />
                                <div className="relative">
                                    <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                    <input type="text" name="keyword" placeholder="Qualifica, azienda o parola chiave..." className="w-full pl-10 pr-3 py-3 rounded-xl bg-white border border-slate-200 text-sm focus:border-[#0038A5] outline-none text-slate-900 font-medium placeholder:text-slate-400 shadow-sm" />
                                </div>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                    <input type="text" name="location" placeholder="Località..." className="w-full pl-10 pr-3 py-3 rounded-xl bg-white border border-slate-200 text-sm focus:border-[#0038A5] outline-none text-slate-900 font-medium placeholder:text-slate-400 shadow-sm" />
                                </div>
                                <button type="submit" className="w-full bg-[#0038A5] hover:bg-[#002B7F] text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_12px_rgba(0,56,165,0.3)] hover:shadow-[0_6px_20px_rgba(0,56,165,0.4)] flex justify-center items-center gap-2 mt-1">
                                    Trova Offerte <ChevronRight className="w-4 h-4" />
                                </button>
                            </form>
                            <div className="pt-2 px-1">
                                <a href="https://jobroom.jobcourier.ch/job-seekers.php?lan=it&language=it" className="text-sm font-semibold text-[#0038A5] hover:text-[#002B7F] hover:underline flex items-center gap-1 transition-colors">
                                    Oppure carica il tuo CV <ChevronRight className="w-3 h-3" />
                                </a>
                            </div>
                        </motion.div>

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
                    </motion.div>
                </div>
            </motion.div>

            {/* ---------------- COMPANIES SECTION (RIGHT) ---------------- */}
            <motion.div
                onMouseEnter={() => !isMobile && setHoveredSide('companies')}
                onMouseLeave={() => !isMobile && setHoveredSide(null)}
                animate={{
                    width: isMobile ? '100%' : (hoveredSide === 'companies' ? '60%' : '40%')
                }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full md:w-1/2 min-h-[50vh] md:min-h-screen bg-[#131f3f] flex flex-col justify-center px-8 md:px-16 lg:px-24 py-24 text-white overflow-hidden"
            >
                {/* Background Image Slider */}
                <AnimatePresence initial={false}>
                    <motion.img
                        key={currentImageIndex}
                        src={sliderImages[currentImageIndex]}
                        initial={{ opacity: currentImageIndex === 0 ? 1 : 0, scale: currentImageIndex === 0 ? 1 : 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 w-full h-full object-cover z-0"
                        alt="Slider background for companies"
                    />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-r from-[#0c1328]/95 to-[#0c1328]/70 z-0"></div>
                <div className="max-w-md w-full mx-auto md:mx-0 md:ml-12 lg:ml-20 xl:ml-28 z-10 relative">
                    <motion.div animate={{ scale: isMobile ? 1 : (hoveredSide === 'companies' ? 1 : 0.85), transformOrigin: "left center" }} transition={{ duration: 0.5, ease: "easeOut" }}>
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
                        <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-sm">
                            Pubblica i tuoi annunci e raggiungi le menti più brillanti nel tuo settore in pochi click.
                        </p>
                        
                        <motion.div animate={{ opacity: hoveredSide === 'companies' || isMobile ? 1 : 0, pointerEvents: hoveredSide === 'companies' || isMobile ? 'auto' : 'none' }} transition={{ duration: 0.3 }} className="space-y-4">
                            <div className="flex flex-col gap-3 w-full bg-[#1e2a4a]/80 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-600/50">
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                    <input type="text" placeholder="Qualifica ricercata..." className="w-full pl-10 pr-3 py-3 rounded-xl bg-slate-800/80 border border-slate-600 text-sm focus:border-slate-400 outline-none text-white font-medium placeholder:text-slate-500 shadow-inner" />
                                </div>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                    <input type="email" placeholder="Email aziendale" className="w-full pl-10 pr-3 py-3 rounded-xl bg-slate-800/80 border border-slate-600 text-sm focus:border-slate-400 outline-none text-white font-medium placeholder:text-slate-500 shadow-inner" />
                                </div>
                                <button onClick={() => setShowLoginModal(true)} className="w-full bg-slate-100 hover:bg-white text-[#131f3f] font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_12px_rgba(255,255,255,0.1)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.2)] flex justify-center items-center gap-2 mt-1">
                                    Pubblica Annuncio <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="pt-2 px-1">
                                <button onClick={() => setShowLoginModal(true)} className="text-sm font-semibold text-slate-400 hover:text-white hover:underline flex items-center gap-1 transition-colors bg-transparent border-0 p-0 m-0 cursor-pointer">
                                    Hai già un account? Accedi <ChevronRight className="w-3 h-3" />
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>

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
