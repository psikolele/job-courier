import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Briefcase, ChevronRight, Mail, ArrowRight } from 'lucide-react';

import heroBg1 from '../assets/hero-bg.jpg';

const Hero = ({ setShowLoginModal }) => {
    const { t } = useTranslation();
    const [hoveredSide, setHoveredSide] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [timerKey, setTimerKey] = useState(0);

    const [cantons, setCantons] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [selectedCanton, setSelectedCanton] = useState('');
    const [selectedSector, setSelectedSector] = useState('');

    useEffect(() => {
        setCantons([
            { name: 'Argovia', value: 'AG', regionId: '3095' }, { name: 'Basilea', value: 'BS', regionId: '3105' },
            { name: 'Berna', value: 'BE', regionId: '3099' }, { name: 'Ginevra', value: 'GE', regionId: '3101' },
            { name: 'Grigioni', value: 'GR', regionId: '3103' }, { name: 'Lucerna', value: 'LU', regionId: '3107' },
            { name: 'San Gallo', value: 'SG', regionId: '3106' }, { name: 'Ticino', value: 'TI', regionId: '3115' },
            { name: 'Zurigo', value: 'ZH', regionId: '3120' }, { name: 'Appenzello Esterno', value: 'AR' },
            { name: 'Appenzello Interno', value: 'AI' }, { name: 'Basilea Campagna', value: 'BL' },
            { name: 'Friburgo', value: 'FR' }, { name: 'Giura', value: 'JU' }, { name: 'Glarona', value: 'GL' },
            { name: 'Neuchâtel', value: 'NE' }, { name: 'Nidvaldo', value: 'NW' }, { name: 'Obvaldo', value: 'OW' },
            { name: 'Sciaffusa', value: 'SH' }, { name: 'Soletta', value: 'SO' }, { name: 'Svitto', value: 'SZ' },
            { name: 'Turgovia', value: 'TG' }, { name: 'Uri', value: 'UR' }, { name: 'Vallese', value: 'VS' },
            { name: 'Vaud', value: 'VD' }, { name: 'Zugo', value: 'ZG' }
        ].sort((a, b) => a.name.localeCompare(b.name)));

        setSectors([
            { name: 'Amministrazione/Paghe e contributi', role: 'amministrazione-2fpaghe-e-contributi', id: '213' },
            { name: 'Centralino/Segreteria/Servizi generali', role: 'centralino-2fsegretariato-2fservizi-generali', id: '901' },
            { name: 'Commerciale/Vendite', role: 'commerciale-2fvendite', id: '234' },
            { name: 'Controllo e certificazione qualità', role: 'controllo-e-certificazione-qualit-c3-a0', id: '231' },
            { name: 'Costruzioni/Mestieri', role: 'costruzioni-2fmestieri', id: '215' },
            { name: 'Customer Service', role: 'customer-service', id: '216' },
            { name: 'Finanza/Contabilità/Revisione', role: 'finanza-2fcontabilit-c3-a0-2frevisione', id: '212' },
            { name: 'IT/Technology', role: 'it-2ftechnology', id: '236' },
            { name: 'Ingegneria/Progettazione', role: 'ingegneria-2fprogettazione', id: '219' },
            { name: 'Logistica/Magazzino', role: 'logistica-2fmagazzino', id: '224' },
            { name: 'Marketing/Relazioni esterne', role: 'marketing-2frelazioni-esterne', id: '226' },
            { name: 'Medicina/Salute', role: 'medicina-2fsalute', id: '221' },
            { name: 'Ricerca e sviluppo', role: 'ricerca-e-sviluppo', id: '232' },
            { name: 'Risorse umane', role: 'risorse-umane', id: '222' },
            { name: 'Ristorazione/Hotellerie', role: 'ristorazione-2fhotellerie', id: '220' },
            { name: 'Sicurezza/Vigilanza', role: 'sicurezza-2fvigilanza', id: '233' },
            { name: 'Trasporti', role: 'trasporti', id: '900' },
            { name: 'Vendita al dettaglio/Servizi al pubblico', role: 'vendita-al-dettaglio-2fservizi-al-pubblico', id: '902' }
        ]);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const baseUrl = 'https://jobroom.jobcourier.ch/job/latest-and-all-job-ads.php';
        const queryParams = new URLSearchParams();
        
        let hasCountryRegion = false;
        if (selectedCanton) {
            const cantonObj = cantons.find(c => c.value === selectedCanton);
            if (cantonObj && cantonObj.regionId) {
                queryParams.set('country', '214'); 
                queryParams.set('region', cantonObj.regionId);
                hasCountryRegion = true;
            } else {
                queryParams.set('global', '1');
                queryParams.set('location', cantonObj ? cantonObj.name : selectedCanton);
            }
        } else {
            queryParams.set('global', '1');
        }

        if (hasCountryRegion) {
            queryParams.set('sector', '');
            queryParams.set('role', '');
            queryParams.set('e_type', '');
            queryParams.set('percent', '');
            queryParams.set('e_type_gt', '');
            queryParams.set('percent_gt', '');
        }

        if (keyword) queryParams.set('keyword', keyword);

        if (selectedSector) {
            const sectorObj = sectors.find(s => s.id === selectedSector);
            if (sectorObj) {
                queryParams.set('role', sectorObj.role);
                queryParams.set('role_id', sectorObj.id);
            }
        }

        window.location.href = `${baseUrl}?${queryParams.toString()}`;
    };

    const sliderImages = [
        heroBg1,
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
    ];

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % sliderImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [timerKey, sliderImages.length]);

    const handleDotClick = (index) => {
        setCurrentImageIndex(index);
        setTimerKey(prev => prev + 1);
    };

    return (
        <section className="relative w-full min-h-screen flex flex-col md:flex-row overflow-hidden font-sans bg-[#131f3f]">
            <motion.div
                onMouseEnter={() => !isMobile && setHoveredSide('candidates')}
                onMouseLeave={() => !isMobile && setHoveredSide(null)}
                initial={{ width: isMobile ? '100%' : '60%' }}
                animate={{
                    width: isMobile ? '100%' : (hoveredSide === 'companies' ? '40%' : '60%')
                }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative min-h-[50vh] md:min-h-screen bg-[#F4F6F8] flex flex-col justify-start px-8 md:px-12 lg:px-16 pt-32 md:pt-48 pb-24 text-slate-900 border-b md:border-b-0 md:border-r border-slate-200"
            >
                <motion.div 
                    animate={{ 
                        opacity: hoveredSide === 'companies' ? 0 : 0.4, 
                        x: hoveredSide === 'candidates' ? 10 : 0 
                    }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-1/2 right-4 md:right-6 -translate-y-1/2 flex items-center justify-center max-md:hidden z-30 pointer-events-none"
                >
                    <div className="w-10 h-10 border border-slate-300 rounded-full flex items-center justify-center bg-white/50 shadow-sm">
                        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={hoveredSide === 'candidates' ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} />
                        </svg>
                    </div>
                </motion.div>

                <div className="max-w-md w-full mx-auto md:mx-0 md:ml-4 lg:ml-12 xl:ml-20 z-10 relative">
                    <motion.div animate={{ scale: isMobile ? 1 : (hoveredSide === 'companies' ? 0.85 : 1), transformOrigin: "left center" }} transition={{ duration: 0.5, ease: "easeOut" }}>
                        <p className="text-sm md:text-xs font-mono text-slate-500 mb-6 uppercase tracking-[0.2em]">
                            {t('hero.candidates.subtitle', 'Per I Candidati')}
                        </p>
                        <h1 className="leading-[1.1] tracking-tight mb-6 mt-4">
                            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-sans text-slate-900 whitespace-nowrap">
                                {t('hero.candidates.h1', 'Accedi al tuo')}
                            </span>
                            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-sans text-[#01498C] mt-2">
                                {t('hero.candidates.h1_sub', 'Prossimo Lavoro.')}
                            </span>
                        </h1>
                        
                        <motion.div animate={{ opacity: hoveredSide === 'companies' ? 0 : 1, pointerEvents: hoveredSide === 'companies' ? 'none' : 'auto' }} transition={{ duration: 0.3 }} className="space-y-4">
                            <form onSubmit={handleSearch} className="flex flex-col gap-3 w-full bg-white/60 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-200">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                    <input type="text" placeholder="Qualifica, azienda o parola chiave..." className="w-full pl-10 pr-3 py-3 rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#01498C] outline-none text-slate-900 font-medium placeholder:text-slate-400 shadow-sm" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                                </div>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                    <select className="w-full pl-10 pr-8 py-3 rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#01498C] outline-none text-slate-900 font-medium appearance-none shadow-sm cursor-pointer truncate" value={selectedSector} onChange={(e) => setSelectedSector(e.target.value)}>
                                        <option value="">Qualsiasi settore lavorativo</option>
                                        {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                    <ChevronRight className="absolute right-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none rotate-90" />
                                </div>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                    <select className="w-full pl-10 pr-8 py-3 rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#01498C] outline-none text-slate-900 font-medium appearance-none shadow-sm cursor-pointer truncate" value={selectedCanton} onChange={(e) => setSelectedCanton(e.target.value)}>
                                        <option value="">Tutti i Cantoni (Svizzera)</option>
                                        {cantons.map(c => <option key={c.value} value={c.value}>{c.name}</option>)}
                                    </select>
                                    <ChevronRight className="absolute right-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none rotate-90" />
                                </div>
                                <button type="submit" className="h-14 px-8 bg-[#01498C] hover:bg-[#013dd6] text-white rounded-[1.25rem] font-bold tracking-wide transition-all shadow-[0_8px_20px_rgba(1,73,140,0.25)] hover:shadow-[0_12px_25px_rgba(1,73,140,0.35)] shrink-0 group flex items-center justify-center overflow-hidden hover-lift hover-shiny w-full">
                                    <span className="relative z-10 flex items-center gap-2">
                                        {t('hero.candidates.cta', 'Trova Offerte')}
                                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </button>
                            </form>

                            <div className="pt-1 px-1">
                                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-3">Altri link</p>
                                <div className="flex flex-wrap gap-2">
                                    <a href="https://jobroom.jobcourier.ch/job/latest-and-all-job-ads.php" className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-mono hover:bg-slate-200 transition-all">Vedi tutte le offerte</a>
                                    <a href="https://jobroom.jobcourier.ch/employer/register.php?ignoreRedirectingCookiesAll=1&lan=it&language=it" className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-mono hover:bg-slate-200 transition-all">Vedi tutte le aziende</a>
                                    <a href="#blog" className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-mono hover:bg-slate-200 transition-all">Blog</a>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>

            <motion.div
                onMouseEnter={() => !isMobile && setHoveredSide('companies')}
                onMouseLeave={() => !isMobile && setHoveredSide(null)}
                initial={{ width: isMobile ? '100%' : '40%' }}
                animate={{
                    width: isMobile ? '100%' : (hoveredSide === 'companies' ? '60%' : '40%')
                }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative min-h-[50vh] md:min-h-screen bg-[#131f3f] flex flex-col justify-start px-8 md:px-12 lg:px-16 pt-32 md:pt-48 pb-24 text-white overflow-hidden"
            >
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

                <motion.div 
                    animate={{ 
                        opacity: hoveredSide === 'candidates' ? 0 : 0.4, 
                        x: hoveredSide === 'companies' ? -10 : 0 
                    }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-1/2 left-4 md:left-6 -translate-y-1/2 flex items-center justify-center max-md:hidden z-30 pointer-events-none"
                >
                    <div className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center bg-white/5 shadow-sm">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={hoveredSide === 'companies' ? "M19 9l-7 7-7-7" : "M15 19l-7-7 7-7"} />
                        </svg>
                    </div>
                </motion.div>

                <div className="max-w-md w-full mx-auto md:mx-0 md:ml-8 lg:ml-12 xl:ml-16 z-10 relative">
                    <motion.div animate={{ scale: isMobile ? 1 : (hoveredSide === 'companies' ? 1 : 0.85), transformOrigin: "left center" }} transition={{ duration: 0.5, ease: "easeOut" }}>
                        <p className="text-sm md:text-xs font-mono text-[#2f9de5] mb-6 uppercase tracking-[0.2em] opacity-80 decoration-[#2f9de5]">
                            {t('hero.companies.subtitle', 'Per Le Aziende')}
                        </p>
                        <h1 className="leading-[1.1] tracking-tight mb-8 mt-4">
                            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-sans text-white">
                                {t('hero.companies.h1', 'Trova il tuo Miglior')}
                            </span>
                            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-sans text-[#2f9de5] mt-2 whitespace-nowrap">
                                {t('hero.companies.h1_sub', 'Talento Subito.')}
                            </span>
                        </h1>
                        
                        <motion.div animate={{ opacity: hoveredSide === 'companies' || isMobile ? 1 : 0, pointerEvents: hoveredSide === 'companies' || isMobile ? 'auto' : 'none' }} transition={{ duration: 0.3 }} className="space-y-4">
                            <button onClick={() => setShowLoginModal(true)} className="h-14 px-8 bg-[#2f9de5] hover:bg-[#2585c5] text-[#0A0A14] rounded-2xl font-bold tracking-wide transition-all shadow-[0_8px_25px_rgba(47,157,229,0.25)] flex items-center justify-center group overflow-hidden w-full sm:w-auto hover-lift hover-shiny">
                                <span className="relative z-10 flex items-center gap-2">
                                    {t('hero.companies.cta', 'Pubblica Annuncio')}
                                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </button>

                            <div className="pt-1">
                                <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest mb-3">Altri link</p>
                                <div className="flex flex-wrap gap-2">
                                    <a
                                        href="#"
                                        className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-white/20 text-white/80 text-xs font-mono hover:bg-white/5 transition-all"
                                    >
                                        Soluzioni e tariffe
                                    </a>
                                    <a
                                        href="https://jobroom.jobcourier.ch/employer/register.php?ignoreRedirectingCookiesAll=1&lan=it&language=it"
                                        className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-white/20 text-white/80 text-xs font-mono hover:bg-white/5 transition-all"
                                    >
                                        Registra azienda
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
                
                {/* Slider Dots */}
                <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-2 z-30">
                    {sliderImages.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleDotClick(idx)}
                            className="rounded-full bg-white transition-all duration-300 focus:outline-none"
                            style={{
                                width: currentImageIndex === idx ? '24px' : '6px',
                                height: '6px',
                                opacity: currentImageIndex === idx ? 1 : 0.4,
                                transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                            }}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            </motion.div>
        </section>
    );
};

export default Hero;
