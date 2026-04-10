import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Briefcase, ChevronRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

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
            try {
                const jsonUrl = `https://raw.githubusercontent.com/psikolele/job-courier/data/latest_jobs.json?t=${Date.now()}`;
                const res = await fetch(jsonUrl);
                if (!res.ok) throw new Error('Il ramo "data" o il file JSON non sono ancora stati generati dalla Action.');
                const data = await res.json();
                setLatestJobs(data.slice(0, 12));
            } catch (err) {
                console.warn(err.message, 'Using graceful local mock data.');
                setLatestJobs([
                    { id: 1, title: 'Specialista in Logistica e Supply Chain', location: 'Svizzera, Chiasso', sector: 'Trasporti e logistica', company: 'Global Transport SA', link: '#' },
                    { id: 2, title: 'Responsabile Magazzino (100%)', location: 'Berna', sector: 'Logistica E-commerce', company: 'TechSwiss Distribution', link: '#' },
                    { id: 3, title: 'Autista Consegnatario Patente B', location: 'Lugano', sector: 'Trasporti', company: 'RapidCourier CH', link: '#' },
                    { id: 4, title: 'Impiegato Ufficio Spedizioni', location: 'Ginevra', sector: 'Logistica', company: 'Swiss Delivery Network', link: '#' },
                    { id: 5, title: 'Sviluppatore Web Full Stack', location: 'Zurigo', sector: 'IT/Technology', company: 'Tech Innovators', link: '#' },
                    { id: 6, title: 'Ingegnere Civile', location: 'Basilea', sector: 'Ingegneria', company: 'BuildSwiss', link: '#' },
                    { id: 7, title: 'Store Manager', location: 'Lugano', sector: 'Vendita al dettaglio', company: 'Fashion Group', link: '#' },
                    { id: 8, title: 'Infermiere Professionale', location: 'Locarno', sector: 'Medicina/Salute', company: 'Clinica Santa Maria', link: '#' },
                    { id: 9, title: 'Marketing Manager', location: 'Ginevra', sector: 'Marketing', company: 'Global Brands', link: '#' },
                    { id: 10, title: 'Contabile Senior', location: 'Berna', sector: 'Finanza', company: 'Swiss Finance', link: '#' },
                    { id: 11, title: 'Chef de Partie', location: 'St. Moritz', sector: 'Ristorazione', company: 'Hotel Alpina', link: '#' },
                    { id: 12, title: 'Addetto Risorse Umane', location: 'Zurigo', sector: 'Risorse Umane', company: 'HR Solutions', link: '#' }
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
        <div className="w-full relative z-20 pb-20 pt-8 bg-[#fafafa]">
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
                                    
                                    <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-2 shrink-0">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Briefcase className="w-4 h-4 shrink-0 text-slate-400" />
                                            <span className="font-medium truncate">{job.company}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <MapPin className="w-4 h-4 shrink-0 text-slate-400" />
                                            <span className="truncate">{job.location}</span>
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
            </div>
        </div>
    );
};

export default Filters;
