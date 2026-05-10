import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronRight, Clock, Building2, UserPlus, X, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { fetchLatestJobs } from '../services/api';
import AdBanner from './AdBanner';

const Filters = () => {
    // eslint-disable-next-line no-unused-vars
    const [cantons, setCantons] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [sectors, setSectors] = useState([]);
    const [jobsLoading, setJobsLoading] = useState(true);
    const [latestJobs, setLatestJobs] = useState([]);
    const sliderRef = useRef(null);
    const animationRef = useRef(null);
    const isPausedRef = useRef(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Click Tracker Logic
    const checkClickLimit = () => {
        const STORAGE_KEY = 'jc_click_tracker';
        const LIMIT = 3;
        const EXPIRY_MS = 24 * 60 * 60 * 1000;

        const stored = localStorage.getItem(STORAGE_KEY);
        const now = Date.now();

        if (!stored) {
            const initialData = { count: 1, expiry: now + EXPIRY_MS };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
            return false;
        }

        const data = JSON.parse(stored);

        if (now > data.expiry) {
            const resetData = { count: 1, expiry: now + EXPIRY_MS };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(resetData));
            return false;
        }

        if (data.count >= LIMIT) {
            return true;
        }

        data.count += 1;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return false;
    };

    const handleJobClick = (e) => {
        if (checkClickLimit()) {
            e.preventDefault();
            setIsModalOpen(true);
        }
    };

    useEffect(() => {
        setTimeout(() => {
            // Mappatura Cantoni Ufficiali + Iniezione ID Database JobRoom (Region)
            // I 9 principali trovati nel sito nativo hanno un ID univoco. 
            // Gli altri faranno fallback su ricerca testuale incrociata se non dispongono di Region ID map.
            const cantonsData = [
                { name: 'Argovia', value: 'AG', regionId: '3095' },
                { name: 'Basilea', value: 'BS', regionId: '3105' },
                { name: 'Berna', value: 'BE', regionId: '3099' },
                { name: 'Ginevra', value: 'GE', regionId: '3101' },
                { name: 'Grigioni', value: 'GR', regionId: '3103' },
                { name: 'Lucerna', value: 'LU', regionId: '3107' },
                { name: 'San Gallo', value: 'SG', regionId: '3106' },
                { name: 'Ticino', value: 'TI', regionId: '3115' },
                { name: 'Zurigo', value: 'ZH', regionId: '3120' },
                { name: 'Appenzello Esterno', value: 'AR' },
                { name: 'Appenzello Interno', value: 'AI' },
                { name: 'Basilea Campagna', value: 'BL' },
                { name: 'Friburgo', value: 'FR' },
                { name: 'Giura', value: 'JU' },
                { name: 'Glarona', value: 'GL' },
                { name: 'Neuchâtel', value: 'NE' },
                { name: 'Nidvaldo', value: 'NW' },
                { name: 'Obvaldo', value: 'OW' },
                { name: 'Sciaffusa', value: 'SH' },
                { name: 'Soletta', value: 'SO' },
                { name: 'Svitto', value: 'SZ' },
                { name: 'Turgovia', value: 'TG' },
                { name: 'Uri', value: 'UR' },
                { name: 'Vallese', value: 'VS' },
                { name: 'Vaud', value: 'VD' },
                { name: 'Zugo', value: 'ZG' }
            ].sort((a, b) => a.name.localeCompare(b.name));
            
            setCantons(cantonsData);

            // Mappatura Settori (Dizionario esatto ID estratti dalla web app originale)
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
        }, 800);

        const fetchJobs = async () => {
            setJobsLoading(true);
            try {
                const data = await fetchLatestJobs();
                if (data && data.length > 0) {
                    // Adapt API data to the Filters component structure
                    const formattedJobs = data.map(job => ({
                        id: job.id,
                        title: job.title,
                        location: job.location,
                        sector: job.sector || 'Other',
                        role: job.role || 'Other',
                        company: job.company?.name || job.company,
                        companyLogo: job.company?.logo || job.companyLogo || `https://www.google.com/s2/favicons?domain=${job.company?.domain || 'jobcourier.ch'}&sz=128`,
                        link: job.link
                    }));
                    setLatestJobs(formattedJobs);
                } else {
                    throw new Error('No data from API');
                }
            } catch (err) {
                console.warn('API error in Filters:', err.message, 'Using graceful local mock data.');
                setLatestJobs([
                    { id: 1, title: 'Validation Engineer', location: 'Mezzovico TI, Svizzera', sector: 'Generale', role: 'Specialist', company: 'Randstad Svizzera SA', companyLogo: 'https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3244729.jpg', link: 'https://jobroom.jobcourier.ch/job/view-job.php?id=6688865-validation-engineer-mezzovico-ti-mezzovico&language=en' },
                    { id: 2, title: 'Parchettista', location: 'Sottoceneri, Svizzera', sector: 'Costruzioni/Mestieri', role: 'Specialist', company: 'Team Personnel Solutions SA', companyLogo: 'https://www.google.com/s2/favicons?domain=team.jobs&sz=128', link: 'https://jobroom.jobcourier.ch/job/view-job.php?id=6688871-parchettista-sottoceneri&language=en' },
                    { id: 3, title: 'Responsabile Magazzino', location: 'Schönbühl BE, Svizzera', sector: 'Logistica', role: 'Manager', company: 'TechSwiss Distribution', companyLogo: 'https://www.google.com/s2/favicons?domain=techswiss.ch&sz=128', link: 'https://jobroom.jobcourier.ch/job/view-job.php?id=6680678-assistant-warehouse-manager-a-schönbuhl-be&language=en' },
                    { id: 4, title: 'Chauffeur / Chauffeuse Kat. B, Region Luzern 80%-100% (m/w/d)', location: 'Switzerland, 6003 Luzern', sector: 'Other', role: 'Other', company: 'DasTeam', companyLogo: 'https://www.google.com/s2/favicons?domain=dasteam.ch&sz=128', link: 'https://jobroom.jobcourier.ch/job/view-job.php?id=6675564-chauffeur-chauffeuse-kat-b-region-luzern-80-100-m-w-d-6003-luzern&language=en' }
                ]);
            } finally {
                setJobsLoading(false);
            }
        };
        fetchJobs();
    }, []);

    useEffect(() => {
        if (!jobsLoading && latestJobs.length > 0 && sliderRef.current) {
            const slider = sliderRef.current;
            
            const ctx = gsap.context(() => {
                // We calculate the total width to scroll
                // For a smooth infinite-like feel, we'll just auto-scroll back and forth or 
                // use a linear move if we had duplicated items. 
                // Let's do a slow linear crawl that resets or yoyos.
                
                const startAutoScroll = () => {
                    const maxScroll = slider.scrollWidth - slider.clientWidth;
                    if (maxScroll <= 0) return;

                    animationRef.current = gsap.to(slider, {
                        scrollLeft: maxScroll,
                        duration: maxScroll / 40, // Adjust speed here
                        ease: "none",
                        repeat: -1,
                        yoyo: true,
                        paused: isPausedRef.current
                    });
                };

                startAutoScroll();
            });

            return () => ctx.revert();
        }
    }, [jobsLoading, latestJobs]);

    const handleMouseEnter = () => {
        isPausedRef.current = true;
        if (animationRef.current) animationRef.current.pause();
    };

    const handleMouseLeave = () => {
        isPausedRef.current = false;
        if (animationRef.current) animationRef.current.play();
    };

    const handleTouchStart = () => {
        isPausedRef.current = true;
        if (animationRef.current) animationRef.current.pause();
    };

    const handleTouchEnd = () => {
        // Resume after a short delay
        setTimeout(() => {
            if (!isPausedRef.current) {
                 if (animationRef.current) animationRef.current.play();
            }
        }, 2000);
    };



    return (
        <div id="filters" className="w-full relative z-20 pb-20 pt-8 bg-[#fafafa]">
            {/* ADVERTISEMENT SECTION */}
            <AdBanner />

            {/* Latest Jobs Feed from Vercel Proxy */}
            <div className="pt-4 w-[98%] mx-auto">
                <div className="flex items-center justify-between mb-10 px-4 md:px-8">
                    <h3 className="text-2xl font-normal text-slate-900 flex items-center gap-3 font-sans">
                        <Clock className="w-6 h-6 text-[#01498C]" />
                        Ultime inserite
                    </h3>
                    <a href="https://jobroom.jobcourier.ch/job/latest-and-all-job-ads.php?global=1&utm_source=homepage" className="hidden md:flex text-sm font-normal text-[#01498C] hover:text-[#002B7F] items-center gap-1 transition-colors font-mono uppercase tracking-wider">
                        Vedi tutte <ChevronRight className="w-4 h-4" />
                    </a>
                </div>

                <div 
                    className="overflow-hidden pb-12 -mx-4 relative px-4"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Cinematic Gradients */}
                    <div className="absolute top-0 left-0 w-12 md:w-24 h-full bg-gradient-to-r from-[#fafafa] to-transparent z-10 pointer-events-none hidden md:block"></div>
                    <div className="absolute top-0 right-0 w-12 md:w-24 h-full bg-gradient-to-l from-[#fafafa] to-transparent z-10 pointer-events-none hidden md:block"></div>
                    <div 
                        ref={sliderRef}
                        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide touch-pan-x w-full"
                        style={{ scrollBehavior: animationRef.current ? 'auto' : 'smooth' }}
                    >
                        {jobsLoading ? (
                            [...Array(12)].map((_, i) => (
                                <div key={i} className="w-[300px] md:w-[380px] shrink-0 flex-none animate-pulse bg-white border border-slate-100 rounded-[2rem] p-8 h-[320px] snap-center"></div>
                            ))
                        ) : (
                            latestJobs.map((job, idx) => (
                                <motion.a 
                                    onClick={(e) => {
                                        if (checkClickLimit()) {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setIsModalOpen(true);
                                        }
                                    }}
                                    key={`${job.id}-${idx}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    // Sanitize href to ensure no double slashes or malformed params
                                    href={job.link.replace(/([^:]\/)\/+/g, "$1")}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: (idx % 4) * 0.1 }}
                                    className="w-[320px] md:w-[400px] shrink-0 group flex flex-col h-[320px] bg-white border border-slate-200 hover:border-[#01498C]/30 rounded-[2.5rem] p-8 transition-all duration-500 hover:shadow-[0_40px_80px_rgba(1,73,140,0.08)] hover-lift relative overflow-hidden snap-center"
                                >
                                    {/* Header Row: Company Info + Logo */}
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="flex flex-col min-w-0 pr-4">
                                            <span className="text-[11px] font-bold text-[#01498C]/60 truncate font-mono uppercase tracking-[0.2em] mb-2">
                                                {job.company}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <MapPin className="w-3.5 h-3.5 shrink-0 text-[#2f9de5]" />
                                                <span className="text-[10px] font-medium truncate uppercase tracking-widest font-sans">{job.location}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="w-16 h-16 shrink-0 bg-white border border-slate-100 rounded-2xl p-2.5 flex items-center justify-center shadow-sm group-hover:border-[#01498C]/20 transition-all duration-500">
                                            <img 
                                                src={job.companyLogo} 
                                                alt={job.company} 
                                                className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
                                                onError={(e) => { e.target.parentElement.innerHTML = '<div class="text-slate-300"><Building2 size={24}/></div>'; }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <h4 className="text-[18px] md:text-[22px] font-bold text-slate-900 leading-[1.3] group-hover:text-[#01498C] transition-colors line-clamp-2 overflow-hidden text-ellipsis font-sans tracking-tight">
                                            {job.title}
                                        </h4>
                                    </div>

                                    {/* Footer Section: Sector and Role Tags */}
                                    <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-slate-100/50">
                                        <span className="px-3 py-1 bg-[#01498C]/5 text-[#01498C] text-[9px] font-bold uppercase tracking-[0.1em] rounded-full border border-[#01498C]/10 font-mono">
                                            {job.sector}
                                        </span>
                                        <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[9px] font-bold uppercase tracking-[0.1em] rounded-full border border-slate-200 font-mono">
                                            {job.role}
                                        </span>
                                    </div>
                                    
                                    {/* Decorative Accent */}
                                    <div className="absolute top-0 right-0 w-1 h-0 bg-[#01498C] group-hover:h-full transition-all duration-700"></div>
                                </motion.a>
                            ))
                        )}
                    </div>
                </div>
                
                <div className="mt-2 flex justify-center md:hidden">
                    <a href="https://jobroom.jobcourier.ch/job/latest-and-all-job-ads.php?global=1&utm_source=homepage" className="text-sm font-semibold text-[#0038A5] hover:text-[#002B7F] flex items-center gap-1 transition-colors">
                        Vedi tutte le offerte <ChevronRight className="w-4 h-4" />
                    </a>
                </div>

                {/* 2-Column Lower Advertisement Section */}
                <div className="w-[95%] mx-auto mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2].map((num) => (
                        <div key={num} className="rounded-2xl border border-slate-200 bg-white relative group h-32 flex items-center justify-center overflow-hidden hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
                            <span className="absolute top-2 right-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest z-10">Advertisement {num}</span>
                            <div className="text-center">
                                <p className="text-xs font-semibold text-slate-500">Spazio Sponsorizzato</p>
                                <p className="text-[10px] text-[#0038A5] mt-1 font-bold tracking-wider">PREMIUM</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Registration Wall Modal */}
            <RegistrationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

const RegistrationModal = ({ isOpen, onClose }) => {
    const modalRef = useRef(null);
    const overlayRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            const ctx = gsap.context(() => {
                gsap.fromTo(overlayRef.current, 
                    { opacity: 0 }, 
                    { opacity: 1, duration: 0.5, ease: "power2.out" }
                );
                gsap.fromTo(modalRef.current, 
                    { scale: 0.9, opacity: 0, y: 20 }, 
                    { scale: 1, opacity: 1, y: 0, duration: 0.6, delay: 0.1, ease: "back.out(1.7)" }
                );
            });
            return () => ctx.revert();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
                ref={overlayRef}
                className="absolute inset-0 bg-[#01498C]/90 backdrop-blur-2xl" 
                onClick={onClose} 
            />
            
            <div 
                ref={modalRef}
                className="relative bg-white rounded-[3rem] p-8 md:p-12 max-w-lg w-full shadow-2xl overflow-hidden group"
            >
                {/* Noise Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-repeat" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/p6.png")' }}></div>
                
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                    <X className="w-6 h-6 text-slate-400" />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-[#01498C]/5 rounded-full flex items-center justify-center mb-8">
                        <UserPlus className="w-10 h-10 text-[#01498C]" />
                    </div>
                    
                    <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
                        Accesso Limitato
                    </h2>
                    
                    <p className="text-slate-500 mb-10 leading-relaxed text-lg">
                        Per continuare a visualizzare gli annunci, iscriviti gratuitamente al portale.
                    </p>
                    
                    <a 
                        href="https://jobroom.jobcourier.ch/job-seekers-login.php?lan=it&language=it"
                        className="w-full bg-[#01498C] text-white py-5 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#01498C]/20"
                    >
                        Iscriviti Ora
                        <ArrowRight className="w-5 h-5" />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Filters;
