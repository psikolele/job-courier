import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronRight, Clock, Building2, UserPlus, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { fetchLatestJobs } from '../services/api';
import AdBanner from './AdBanner';
import useRegistrationWall from '../hooks/useRegistrationWall';
import RegistrationWallModal from './RegistrationWallModal';

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
    const navigate = useNavigate();
    const wall = useRegistrationWall();

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
        <div id="filters" className="w-full relative z-20 pb-20 pt-8" style={{ background: 'var(--brand-gray-light)' }}>
            {/* ADVERTISEMENT SECTION */}
            <AdBanner />

            {/* Latest Jobs Feed from Vercel Proxy */}
            <div className="pt-4 w-[98%] mx-auto">
                <div className="flex items-center justify-between mb-10 px-4 md:px-8">
                    <h3 style={{
                        fontFamily: 'var(--font-brand)',
                        fontWeight: 700,
                        fontSize: 11,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: 'var(--brand-fuchsia)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                    }}>
                        <span style={{ width: 28, height: 2, background: 'var(--brand-fuchsia)', display: 'inline-block' }} />
                        Ultime inserite
                    </h3>
                    <button
                        onClick={() => navigate('/offerte')}
                        className="hidden md:flex items-center gap-1 transition-opacity hover:opacity-60"
                        style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 12,
                            color: 'var(--brand-navy)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase'
                        }}
                    >
                        Vedi tutte <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <div
                    className="overflow-hidden pb-12 -mx-4 relative px-4"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Edge fade */}
                    <div className="absolute top-0 left-0 w-12 md:w-24 h-full z-10 pointer-events-none hidden md:block" style={{ background: 'linear-gradient(to right, var(--brand-gray-light), transparent)' }}></div>
                    <div className="absolute top-0 right-0 w-12 md:w-24 h-full z-10 pointer-events-none hidden md:block" style={{ background: 'linear-gradient(to left, var(--brand-gray-light), transparent)' }}></div>
                    <div
                        ref={sliderRef}
                        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide touch-pan-x w-full"
                        style={{ scrollBehavior: animationRef.current ? 'auto' : 'smooth' }}
                    >
                        {jobsLoading ? (
                            [...Array(12)].map((_, i) => (
                                <div key={i} className="w-[280px] md:w-[340px] shrink-0 flex-none animate-pulse bg-white p-6 h-[200px] snap-center" style={{ border: '1px solid rgba(5,11,43,0.07)' }}></div>
                            ))
                        ) : (
                            latestJobs.map((job, idx) => (
                                <motion.div
                                    onClick={() => {
                                        wall.guard(() => navigate(`/offerte?jobId=${job.id}`));
                                    }}
                                    key={`${job.id}-${idx}`}
                                    initial={{ opacity: 0, y: 8 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: (idx % 4) * 0.08 }}
                                    className="cursor-pointer w-[280px] md:w-[340px] shrink-0 group snap-center"
                                    style={{
                                        background: '#FFFFFF',
                                        border: '1px solid rgba(5,11,43,0.07)',
                                        padding: '24px 28px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 0,
                                        transition: 'background 0.15s'
                                    }}
                                    whileHover={{ backgroundColor: 'var(--brand-gray-light)' }}
                                >
                                    {/* Fuchsia dot + role */}
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
                                        <span style={{
                                            width: 7, height: 7, borderRadius: '50%',
                                            background: 'var(--brand-fuchsia)',
                                            flexShrink: 0, marginTop: 6
                                        }} />
                                        <div>
                                            <div style={{
                                                fontFamily: 'var(--font-brand)',
                                                fontWeight: 700,
                                                fontSize: 15,
                                                color: 'var(--brand-navy)',
                                                letterSpacing: '-0.01em',
                                                marginBottom: 5,
                                                lineHeight: 1.3
                                            }}>{job.title}</div>
                                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--brand-gray-mid)' }}>{job.company}</span>
                                                <span style={{ color: 'rgba(139,143,168,0.4)', fontSize: 12 }}>·</span>
                                                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--brand-gray-mid)' }}>{job.location}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tags + arrow row */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid rgba(5,11,43,0.05)' }}>
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            {[job.sector, job.role].filter(Boolean).map(tag => (
                                                <span key={tag} style={{
                                                    fontFamily: 'var(--font-body)',
                                                    fontSize: 10,
                                                    fontWeight: 600,
                                                    letterSpacing: '0.08em',
                                                    textTransform: 'uppercase',
                                                    border: '1px solid rgba(5,11,43,0.1)',
                                                    padding: '3px 10px',
                                                    color: 'var(--brand-gray-mid)'
                                                }}>{tag}</span>
                                            ))}
                                        </div>
                                        <span style={{
                                            fontFamily: 'var(--font-brand)',
                                            fontSize: 18,
                                            color: 'var(--brand-gray-mid)',
                                            transition: 'color 0.15s',
                                            flexShrink: 0
                                        }}
                                        className="group-hover:text-[var(--brand-fuchsia)]"
                                        >→</span>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
                
                <div className="mt-2 flex justify-center md:hidden">
                    <button onClick={() => navigate('/offerte')} className="text-sm font-semibold text-[#0038A5] hover:text-[#002B7F] flex items-center gap-1 transition-colors">
                        Vedi tutte le offerte <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* 2-Column Lower Advertisement Section */}
                <div className="w-full mt-16 max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 overflow-hidden" style={{ border: '1px solid rgba(5,11,43,0.07)', background: '#FFFFFF' }}>
                        {[1, 2].map((num) => (
                            <div key={num} className="relative group h-28 flex items-center justify-center cursor-pointer transition-all duration-200" style={{ borderRight: num === 1 ? '1px solid rgba(5,11,43,0.07)' : 'none' }}>
                                <span style={{
                                    position: 'absolute', top: 10, right: 14,
                                    fontFamily: 'var(--font-body)',
                                    fontSize: 8,
                                    fontWeight: 600,
                                    letterSpacing: '0.15em',
                                    textTransform: 'uppercase',
                                    color: 'var(--brand-gray-mid)',
                                    opacity: 0.6
                                }}>ADV</span>
                                <div className="text-center">
                                    <p style={{ fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 10, color: 'var(--brand-navy)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Spazio Sponsorizzato</p>
                                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--brand-fuchsia)', marginTop: 6, letterSpacing: '0.2em', fontWeight: 600 }}>PREMIUM</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <RegistrationWallModal isOpen={wall.isOpen} onClose={() => wall.setIsOpen(false)} />
        </div>
    );
};

export default Filters;
