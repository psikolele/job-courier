import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Briefcase, ChevronRight, Clock, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchLatestJobs } from '../services/api';

const Filters = () => {
    const { t } = useTranslation();
    const [cantons, setCantons] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [jobsLoading, setJobsLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [selectedCanton, setSelectedCanton] = useState('');
    const [selectedSector, setSelectedSector] = useState('');
    const [latestJobs, setLatestJobs] = useState([]);

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
            setLoading(false);
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
                        sector: job.sector,
                        company: job.company.name,
                        companyLogo: job.company.logo || `https://www.google.com/s2/favicons?domain=${job.company.domain}&sz=128`,
                        link: job.link
                    }));
                    setLatestJobs(formattedJobs);
                } else {
                    throw new Error('No data from API');
                }
            } catch (err) {
                console.warn('API error in Filters:', err.message, 'Using graceful local mock data.');
                setLatestJobs([
                    { id: 1, title: 'Validation Engineer', location: 'Mezzovico TI, Svizzera', sector: 'Generale', company: 'Randstad Svizzera SA', companyLogo: 'https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3244729.jpg', link: 'https://jobroom.jobcourier.ch/job/view-job.php?id=6688865-validation-engineer-mezzovico-ti-mezzovico&language=en' },
                    { id: 2, title: 'Parchettista', location: 'Sottoceneri, Svizzera', sector: 'Generale', company: 'Team Personnel Solutions SA', companyLogo: 'https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3244683.jpg', link: 'https://jobroom.jobcourier.ch/job/view-job.php?id=6688871-parchettista-sottoceneri&language=en' },
                    { id: 3, title: 'Responsabile Magazzino', location: 'Schönbühl BE, Svizzera', sector: 'Logistica', company: 'TechSwiss Distribution', companyLogo: 'https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3244683.jpg', link: 'https://jobroom.jobcourier.ch/job/view-job.php?id=6680678-assistant-warehouse-manager-a-schönbuhl-be&language=en' },
                    { id: 4, title: 'Autista Patente B', location: 'Luzern, Svizzera', sector: 'Trasporti', company: 'RapidCourier CH', companyLogo: 'https://jobroom.jobcourier.ch/custom_jobcourier/media/logo/logo_company_3244729.jpg', link: 'https://jobroom.jobcourier.ch/job/view-job.php?id=6675564-chauffeur-chauffeuse-kat-b-region-luzern-80-100-m-w-d-6003-luzern&language=en' }
                ]);
            } finally {
                setJobsLoading(false);
            }
        };
        fetchJobs();
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

        if (keyword) {
            queryParams.set('keyword', keyword);
        }

        if (selectedSector) {
            const sectorObj = sectors.find(s => s.id === selectedSector);
            if (sectorObj) {
                queryParams.set('role', sectorObj.role);
                queryParams.set('role_id', sectorObj.id);
            }
        }

        window.location.href = `${baseUrl}?${queryParams.toString()}`;
    };

    return (
        <div id="filters" className="w-full relative z-20 pb-20 pt-8 bg-[#fafafa]">
            {/* ADVERTISEMENT SECTION */}
            <div className="w-full max-w-[1400px] mx-auto flex flex-col md:flex-row gap-6 mb-14 mt-4 px-4 sm:px-8 md:px-12 lg:px-20">
                <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative group bg-white">
                    <span className="absolute top-2 right-3 text-[10px] font-bold text-slate-400 uppercase z-10 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm">Advertisement</span>
                    <a href="https://www.blc-sa.ch" target="_blank" rel="noopener noreferrer" className="block w-full h-[150px] md:h-[200px] relative">
                        <img src="/img/Gemini_Generated_Image_ape98sape98sape9.png" alt="Business Learning Centre SA" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02] opacity-95 hover:opacity-100" />
                    </a>
                </div>
                <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative group bg-white">
                    <span className="absolute top-2 right-3 text-[10px] font-bold text-slate-400 uppercase z-10 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm">Advertisement</span>
                    <a href="https://www.wallmoss.ch/" target="_blank" rel="noopener noreferrer" className="block w-full h-[150px] md:h-[200px] relative">
                        <img src="/img/Gemini_Generated_Image_lw18o4lw18o4lw18.png" alt="Wallmoss Interior Design" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02] opacity-95 hover:opacity-100" />
                    </a>
                </div>
            </div>

            {/* Latest Jobs Feed from Vercel Proxy */}
            <div className="pt-4 w-[95%] max-w-[1800px] mx-auto">
                <div className="flex items-center justify-between mb-6 px-4 md:px-8">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-[#0038A5]" />
                        Ultime inserite
                    </h3>
                    <a href="https://jobroom.jobcourier.ch/job/latest-and-all-job-ads.php?global=1&utm_source=homepage" className="hidden md:flex text-sm font-semibold text-[#0038A5] hover:text-[#002B7F] items-center gap-1 transition-colors">
                        Vedi tutte <ChevronRight className="w-4 h-4" />
                    </a>
                </div>

                <div className="overflow-hidden pb-8 -mx-4 relative pause-on-hover px-4">
                    <div className="flex gap-4 animate-marquee w-max">
                        {jobsLoading ? (
                            [...Array(12)].map((_, i) => (
                                <div key={i} className="min-w-[280px] md:min-w-[320px] shrink-0 animate-pulse bg-white border border-slate-100 rounded-2xl p-6 h-32"></div>
                            ))
                        ) : (
                            [...latestJobs, ...latestJobs].map((job, idx) => (
                                <motion.a 
                                    href={job.link}
                                    key={`${job.id}-${idx}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: Math.min((idx % latestJobs.length) * 0.1, 1) }}
                                    className="min-w-[280px] md:min-w-[320px] shrink-0 group flex flex-col h-[220px] bg-white border border-slate-200 hover:border-[#0038A5]/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 relative overflow-hidden"
                                >
                                    {/* Decorative line */}
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0038A5] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                                    
                                    <div className="flex-1">
                                        <span className="inline-block px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-md mb-3">
                                            {job.sector}
                                        </span>
                                        <h4 className="text-base font-bold text-slate-900 mb-2 leading-snug group-hover:text-[#0038A5] transition-colors line-clamp-2">
                                            {job.title}
                                        </h4>
                                    </div>
                                    
                                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-4 shrink-0">
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <div className="flex items-center gap-2 text-sm text-slate-700">
                                                <Briefcase className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                                                <span className="font-bold truncate text-[13px]">{job.company}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                                                <span className="truncate text-xs">{job.location}</span>
                                            </div>
                                        </div>
                                        {/* Company Logo in Marquee */}
                                        <div className="w-10 h-10 shrink-0 bg-white border border-slate-100 rounded-xl p-1.5 flex items-center justify-center shadow-sm group-hover:border-[#0038A5]/20 group-hover:shadow-md transition-all">
                                            <img 
                                                src={job.companyLogo} 
                                                alt={job.company} 
                                                className="w-full h-full object-contain"
                                                onError={(e) => { e.target.parentElement.innerHTML = '<div class="text-slate-300"><Building2 size={16}/></div>'; }}
                                            />
                                        </div>
                                    </div>
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

                {/* 4-Column Lower Advertisement Section */}
                <div className="w-full mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-2 md:px-4">
                    {[1, 2, 3, 4].map((num) => (
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
        </div>
    );
};

export default Filters;
