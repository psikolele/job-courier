import React, { useState, useEffect, useRef } from 'react';
import { Briefcase, User, ChevronRight, Clock, Building2, UserPlus, X, ArrowRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { fetchLatestJobs } from '../services/api';
import useRegistrationWall from '../hooks/useRegistrationWall';
import RegistrationWallModal from './RegistrationWallModal';


const deriveSector = (title, sector) => {
    const skip = ['Non specificato', 'Other', 'Altro', 'ALTRO', 'other', ''];
    if (sector && !skip.includes(sector)) return sector;
    if (!title) return null;
    const t = title.toLowerCase();
    if (/trasport|autista|camion|courier|spediz|logist|magazz|driver|corriere/.test(t)) return 'Logistica';
    if (/inferm|medic|farmac|salute|dental|fisio|cura|health|clinica/.test(t)) return 'Medicina';
    if (/sviluppa|programm|developer|software|engineer|devops|cloud|\.net|java|python|frontend|backend|fullstack/.test(t)) return 'IT';
    if (/contab|finanz|paghe|banca|audit|fiscal|revisio|accounting/.test(t)) return 'Finanza';
    if (/vendita|commerc|sales|account|business dev/.test(t)) return 'Commerciale';
    if (/amministr|segret|assistente|reception|back.?office/.test(t)) return 'Amministrazione';
    if (/costruzion|edil|parchett|muratore|idraulic|elettric|carpent|impianti/.test(t)) return 'Costruzioni';
    if (/ristora|chef|cuoc|camerier|pasticcier|hotell/.test(t)) return 'Ristorazione';
    if (/marketing|social media|communic|brand|digital/.test(t)) return 'Marketing';
    if (/risorse umane|\bhr\b|human resource|selezione|reclutament/.test(t)) return 'HR';
    return null;
};

const deriveRole = (role) => {
    const skip = ['Non specificato', 'Other', 'Altro', 'ALTRO', 'other', ''];
    if (!role || skip.includes(role)) return null;
    return role;
};

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
    const isDraggingRef = useRef(false);
    const dragStartXRef = useRef(0);
    const dragScrollLeftRef = useRef(0);
    const resumeTimeoutRef = useRef(null);
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
                    const formattedJobs = data.map(job => {
                        const linkId = job.link?.match(/[?&]id=(\d+)/)?.[1] || job.id;
                        return {
                            id: job.id,
                            jobroom_id: job.jobroom_id || linkId,
                            title: job.title,
                            location: job.location,
                            sector: job.sector || 'Other',
                            role: job.role || 'Other',
                            company: job.company?.name || job.company,
                            companyLogo: job.company?.logo || job.companyLogo || `https://www.google.com/s2/favicons?domain=${job.company?.domain || 'jobcourier.ch'}&sz=128`,
                            link: job.link
                        };
                    });
                    setLatestJobs(formattedJobs);
                } else {
                    throw new Error('No data from API');
                }
            } catch (err) {
                console.warn('API error in Filters:', err.message, 'Using graceful local mock data.');
                setLatestJobs([
                    { id: 1, jobroom_id: '6688865', title: 'Validation Engineer', location: 'Mezzovico TI, Svizzera', sector: 'Generale', role: 'Specialist', company: 'Randstad Svizzera SA', companyLogo: 'https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3244729.jpg', link: 'https://jobroom.jobcourier.ch/job/view-job.php?id=6688865-validation-engineer-mezzovico-ti-mezzovico&language=en' },
                    { id: 2, jobroom_id: '6688871', title: 'Parchettista', location: 'Sottoceneri, Svizzera', sector: 'Costruzioni/Mestieri', role: 'Specialist', company: 'Team Personnel Solutions SA', companyLogo: 'https://www.google.com/s2/favicons?domain=team.jobs&sz=128', link: 'https://jobroom.jobcourier.ch/job/view-job.php?id=6688871-parchettista-sottoceneri&language=en' },
                    { id: 3, jobroom_id: '6680678', title: 'Responsabile Magazzino', location: 'Schönbühl BE, Svizzera', sector: 'Logistica', role: 'Manager', company: 'TechSwiss Distribution', companyLogo: 'https://www.google.com/s2/favicons?domain=techswiss.ch&sz=128', link: 'https://jobroom.jobcourier.ch/job/view-job.php?id=6680678-assistant-warehouse-manager-a-schönbuhl-be&language=en' },
                    { id: 4, jobroom_id: '6675564', title: 'Chauffeur / Chauffeuse Kat. B, Region Luzern 80%-100% (m/w/d)', location: 'Switzerland, 6003 Luzern', sector: 'Other', role: 'Other', company: 'DasTeam', companyLogo: 'https://www.google.com/s2/favicons?domain=dasteam.ch&sz=128', link: 'https://jobroom.jobcourier.ch/job/view-job.php?id=6675564-chauffeur-chauffeuse-kat-b-region-luzern-80-100-m-w-d-6003-luzern&language=en' },
                    { id: 5, jobroom_id: '6675565', title: 'Impiegato Amministrativo', location: 'Lugano TI, Svizzera', sector: 'Amministrazione/Paghe e contributi', role: 'Specialist', company: 'Adecco Risorse Umane', companyLogo: 'https://www.google.com/s2/favicons?domain=adecco.ch&sz=128', link: 'https://jobroom.jobcourier.ch/job/view-job.php?id=6675565-impiegato-amministrativo-lugano&language=en' },
                    { id: 6, jobroom_id: '6675566', title: 'Frontend Developer React', location: 'Bellinzona TI, Svizzera', sector: 'IT/Technology', role: 'Specialist', company: 'Kraken Sviluppo Web', companyLogo: 'https://www.google.com/s2/favicons?domain=kraken.ch&sz=128', link: 'https://jobroom.jobcourier.ch/job/view-job.php?id=6675566-frontend-developer-react-bellinzona&language=en' },
                    { id: 7, jobroom_id: '6675567', title: 'Autista Consegnatario Kat. B', location: 'Mendrisio TI, Svizzera', sector: 'Trasporti', role: 'Specialist', company: 'DHL Logistics', companyLogo: 'https://www.google.com/s2/favicons?domain=dhl.ch&sz=128', link: 'https://jobroom.jobcourier.ch/job/view-job.php?id=6675567-autista-consegnatario-kat-b-mendrisio&language=en' },
                    { id: 8, jobroom_id: '6675568', title: 'Elettricista Impiantista', location: 'Locarno TI, Svizzera', sector: 'Costruzioni/Mestieri', role: 'Specialist', company: 'Manpower Svizzera', companyLogo: 'https://www.google.com/s2/favicons?domain=manpower.ch&sz=128', link: 'https://jobroom.jobcourier.ch/job/view-job.php?id=6675568-elettricista-impiantista-locarno&language=en' }
                ]);
            } finally {
                setJobsLoading(false);
            }
        };
        fetchJobs();

        return () => {
            if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
        };
    }, []);

    const resumeAutoScroll = () => {
        if (!sliderRef.current) return;
        const slider = sliderRef.current;
        const maxScroll = slider.scrollWidth - slider.clientWidth;
        
        // Se lo spazio scrollabile è minimo, fermiamo l'animazione per evitare tremolii ed usciamo
        if (maxScroll < 100) {
            if (animationRef.current) {
                animationRef.current.kill();
                animationRef.current = null;
            }
            return;
        }

        if (animationRef.current) {
            animationRef.current.kill();
        }

        animationRef.current = gsap.to(slider, {
            scrollLeft: maxScroll,
            duration: Math.max((maxScroll - slider.scrollLeft) / 40, 1.5),
            ease: "none",
            onComplete: () => {
                animationRef.current = gsap.to(slider, {
                    scrollLeft: 0,
                    duration: Math.max(maxScroll / 40, 1.5),
                    ease: "none",
                    repeat: -1,
                    yoyo: true
                });
            }
        });

        if (isPausedRef.current) {
            animationRef.current.pause();
        }
    };

    useEffect(() => {
        if (!jobsLoading && latestJobs.length > 0 && sliderRef.current) {
            const handleResize = () => {
                resumeAutoScroll();
            };
            window.addEventListener('resize', handleResize);

            const ctx = gsap.context(() => {
                resumeAutoScroll();
            });

            return () => {
                window.removeEventListener('resize', handleResize);
                ctx.revert();
            };
        }
    }, [jobsLoading, latestJobs]);

    const handleMouseEnter = () => {
        isPausedRef.current = true;
        if (animationRef.current) animationRef.current.pause();
        if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };

    const handleMouseLeave = () => {
        isPausedRef.current = false;
        resumeAutoScroll();
    };

    const handleTouchStart = () => {
        isPausedRef.current = true;
        if (animationRef.current) animationRef.current.pause();
        if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };

    const handleTouchEnd = () => {
        setTimeout(() => {
            if (!isPausedRef.current) {
                resumeAutoScroll();
            }
        }, 2000);
    };

    const handleManualScroll = (direction) => {
        if (!sliderRef.current) return;
        
        isPausedRef.current = true;
        if (animationRef.current) animationRef.current.pause();
        
        const scrollAmount = sliderRef.current.clientWidth / 2;
        const currentScroll = sliderRef.current.scrollLeft;
        const targetScroll = direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount;
        
        sliderRef.current.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });
        
        if (resumeTimeoutRef.current) {
            clearTimeout(resumeTimeoutRef.current);
        }
        
        resumeTimeoutRef.current = setTimeout(() => {
            isPausedRef.current = false;
            resumeAutoScroll();
        }, 3000);
    };

    const formatLocation = (loc) => {
        if (!loc) return '';
        let clean = loc
            .replace(/\b(Svizzera|Switzerland|Suisse|Schweiz)\b/gi, '')
            .trim();
        clean = clean.replace(/^,\s*/, '').replace(/,\s*$/, '').replace(/\s*,\s*,/g, ',').trim();
        return clean;
    };

    return (
        <div id="filters" className="w-full relative z-20 pb-20 pt-8 overflow-x-hidden" style={{ background: 'var(--brand-gray-light)' }}>
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
                        Offerte appena pubblicate
                    </h3>
                    
                    <div className="flex items-center gap-6">
                        {/* Scroll arrows */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleManualScroll('left')}
                                className="w-8 h-8 rounded-full border border-slate-200/80 flex items-center justify-center text-slate-500 hover:border-[#FF1F7A] hover:text-[#FF1F7A] hover:bg-[#FF1F7A]/5 transition-all duration-200 cursor-pointer"
                                title="Precedente"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleManualScroll('right')}
                                className="w-8 h-8 rounded-full border border-slate-200/80 flex items-center justify-center text-slate-500 hover:border-[#FF1F7A] hover:text-[#FF1F7A] hover:bg-[#FF1F7A]/5 transition-all duration-200 cursor-pointer"
                                title="Successiva"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                        
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
                </div>

                <div
                    className="overflow-x-hidden pb-12 -mx-4 relative px-4"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Edge fade */}
                    <div className="absolute top-0 left-0 w-12 md:w-24 h-full z-10 pointer-events-none block" style={{ background: 'linear-gradient(to right, var(--brand-gray-light), transparent)' }}></div>
                    <div className="absolute top-0 right-0 w-12 md:w-24 h-full z-10 pointer-events-none block" style={{ background: 'linear-gradient(to left, var(--brand-gray-light), transparent)' }}></div>
                    <div
                        ref={sliderRef}
                        className="flex gap-4 overflow-x-auto scrollbar-hide touch-pan-x w-full"
                        style={{ scrollBehavior: 'auto', cursor: 'grab' }}
                        onMouseDown={(e) => {
                            isDraggingRef.current = true;
                            dragStartXRef.current = e.pageX - sliderRef.current.offsetLeft;
                            dragScrollLeftRef.current = sliderRef.current.scrollLeft;
                            isPausedRef.current = true;
                            if (animationRef.current) animationRef.current.pause();
                            if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
                            sliderRef.current.style.cursor = 'grabbing';
                        }}
                        onMouseMove={(e) => {
                            if (!isDraggingRef.current) return;
                            e.preventDefault();
                            const x = e.pageX - sliderRef.current.offsetLeft;
                            const walk = (x - dragStartXRef.current) * 1.5;
                            sliderRef.current.scrollLeft = dragScrollLeftRef.current - walk;
                        }}
                        onMouseUp={() => {
                            isDraggingRef.current = false;
                            sliderRef.current.style.cursor = 'grab';
                            setTimeout(() => {
                                isPausedRef.current = false;
                                resumeAutoScroll();
                            }, 1000);
                        }}
                        onMouseLeave={() => {
                            if (isDraggingRef.current) {
                                isDraggingRef.current = false;
                                sliderRef.current.style.cursor = 'grab';
                                isPausedRef.current = false;
                                resumeAutoScroll();
                            }
                        }}
                    >
                        {jobsLoading ? (
                            [...Array(12)].map((_, i) => (
                                <div key={i} className="w-[290px] md:w-[340px] shrink-0 flex-none animate-pulse bg-white p-6 h-[235px] snap-center" style={{ borderBottom: '2.5px solid var(--brand-fuchsia)' }}></div>
                            ))
                        ) : (
                            latestJobs.map((job, idx) => (
                                <motion.div
                                    onClick={() => {
                                        navigate(`/offerte?global=1&jobId=${job.id}`);
                                    }}
                                    key={`${job.id}-${idx}`}
                                    initial={{ opacity: 0, y: 8 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: (idx % 4) * 0.08 }}
                                    className="cursor-pointer w-[290px] md:w-[340px] shrink-0 group snap-center md:h-[235px] relative overflow-hidden"
                                    style={{
                                        background: '#FFFFFF',
                                        border: 'none',
                                        borderBottom: '2.5px solid var(--brand-fuchsia)',
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
                                        {/* Left: title + company + location */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontFamily: 'var(--font-brand)',
                                                fontWeight: 700,
                                                fontSize: 15,
                                                color: 'var(--brand-navy)',
                                                letterSpacing: '-0.01em',
                                                marginBottom: 5,
                                                lineHeight: 1.3,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden'
                                            }}>{job.title}</div>
                                            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'nowrap', overflow: 'hidden' }}>
                                                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--brand-gray-mid)' }}>{job.company}</span>
                                                <span style={{ color: 'rgba(139,143,168,0.4)', fontSize: 12 }}>·</span>
                                                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--brand-gray-mid)' }}>
                                                    Sede: {formatLocation(job.location)}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Right: logo, large */}
                                        <img
                                            src={job.companyLogo}
                                            alt={job.company}
                                            onError={e => { e.currentTarget.style.display='none'; }}
                                            style={{ width: 64, height: 64, objectFit: 'contain', flexShrink: 0, borderRadius: 6, background: '#f8f8f8', padding: 4 }}
                                        />
                                    </div>

                                    {/* Tags row — always shown, label outside chip */}
                                    {(() => {
                                        const settore = deriveSector(job.title, job.sector) || 'Altro';
                                        const ruolo = deriveRole(job.role) || 'Altro';
                                        const chip = {
                                            fontFamily: 'var(--font-body)',
                                            fontSize: 10, fontWeight: 600,
                                            letterSpacing: '0.06em', textTransform: 'uppercase',
                                            padding: '0 7px', height: '20px',
                                            display: 'inline-flex', alignItems: 'center',
                                            gap: 3, borderRadius: 2,
                                            border: '1px solid rgba(5,11,43,0.14)',
                                            color: 'var(--brand-navy)',
                                            whiteSpace: 'nowrap', flexShrink: 0,
                                        };
                                        const lbl = {
                                            fontFamily: 'var(--font-body)',
                                            fontSize: 9, fontWeight: 700,
                                            letterSpacing: '0.1em', textTransform: 'uppercase',
                                            color: 'var(--brand-gray-mid)',
                                        };
                                        return (
                                            <div className="relative" style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid rgba(5,11,43,0.05)' }}>
                                                <div className="flex flex-col items-start" style={{ gap: 6, overflow: 'hidden' }}>
                                                    <span style={{ ...chip, opacity: 0.7, maxWidth: '100%', overflow: 'hidden' }}><Briefcase size={9} /><span style={lbl}>Settore:</span>{settore}</span>
                                                    <span style={{ ...chip, opacity: 0.55, maxWidth: '100%', overflow: 'hidden' }}><User size={9} /><span style={lbl}>Ruolo:</span>{ruolo}</span>
                                                </div>
                                                <div className="absolute top-0 right-0 h-full w-10 pointer-events-none sm:hidden" style={{ background: 'linear-gradient(to right, transparent, #FFFFFF)' }} />
                                            </div>
                                        );
                                    })()}
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
            </div>
            <RegistrationWallModal isOpen={wall.isOpen} onClose={() => wall.setIsOpen(false)} />
        </div>
    );
};

export default Filters;
