import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, ChevronLeft, Building2, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const Offerte = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('keyword') || '');

    const selectedJobId = searchParams.get('jobId');

    // Debounce logic for search bar
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const newParams = new URLSearchParams(searchParams);
            const currentKeyword = searchParams.get('keyword') || '';
            
            if (searchQuery !== currentKeyword) {
                if (searchQuery) {
                    newParams.set('keyword', searchQuery);
                } else {
                    newParams.delete('keyword');
                }
                newParams.delete('jobId'); // Reset selected job on new search
                setSearchParams(newParams, { replace: true });
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, searchParams, setSearchParams]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            try {
                // Remove jobId from API call
                const apiParams = new URLSearchParams(searchParams);
                apiParams.delete('jobId');
                
                const response = await fetch(`/api/jobs?${apiParams.toString()}`);
                if (!response.ok) throw new Error('Failed to fetch jobs');
                const data = await response.json();
                setJobs(data);
                
                // Auto-select first job on desktop if none selected
                if (!isMobile && !selectedJobId && data.length > 0) {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set('jobId', data[0].id.toString());
                    setSearchParams(newParams, { replace: true });
                }
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [searchParams.get('keyword'), searchParams.get('region'), searchParams.get('role_id'), searchParams.get('location')]); // Only refetch when actual search params change

    const handleSelectJob = (id) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('jobId', id.toString());
        setSearchParams(newParams);
    };

    const handleBackToList = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('jobId');
        setSearchParams(newParams);
    };

    const selectedJob = jobs.find(j => j.id.toString() === selectedJobId) || jobs[0];

    const showList = !isMobile || (isMobile && !selectedJobId);
    const showDetail = !isMobile || (isMobile && selectedJobId);

    return (
        <div className="pt-24 min-h-screen bg-[#F5F3EE] font-sans">
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left Column: Job List */}
                    {showList && (
                        <div className="w-full md:w-[40%] lg:w-[35%] flex flex-col gap-4">
                            <div className="relative mb-2">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Cerca per professione, azienda..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-[1.25rem] text-sm focus:outline-none focus:ring-2 focus:ring-[#26367b] focus:border-transparent shadow-sm transition-all text-slate-800 font-medium placeholder:text-slate-400"
                                />
                            </div>
                            <h2 className="text-xl font-bold text-[#111111] mb-2 font-['Space_Grotesk'] tracking-tight">Offerte di Lavoro ({jobs.length})</h2>
                            
                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="bg-white p-5 rounded-[1.5rem] border border-slate-200 shadow-sm animate-pulse">
                                            <div className="h-5 bg-slate-200 rounded w-3/4 mb-3"></div>
                                            <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                                            <div className="flex gap-2">
                                                <div className="h-6 bg-slate-200 rounded w-20"></div>
                                                <div className="h-6 bg-slate-200 rounded w-20"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : error ? (
                                <div className="p-4 bg-red-50 text-red-600 rounded-2xl">{error}</div>
                            ) : jobs.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 bg-white rounded-[2rem] shadow-sm">
                                    Nessuna offerta trovata con i filtri attuali.
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-8" style={{ maxHeight: 'calc(100vh - 150px)' }}>
                                    {jobs.map(job => {
                                        const isSelected = selectedJobId === job.id.toString();
                                        return (
                                            <motion.div 
                                                key={job.id}
                                                whileHover={{ scale: 1.01 }}
                                                onClick={() => handleSelectJob(job.id)}
                                                className={`cursor-pointer p-5 rounded-[1.5rem] border transition-all duration-300 shadow-sm ${isSelected ? 'border-[#26367b] ring-1 ring-[#26367b] bg-white' : 'border-slate-200 bg-white hover:border-[#26367b]/50'}`}
                                            >
                                                <div className="flex items-start justify-between gap-4 mb-3">
                                                    <h3 className="font-bold text-lg text-[#111111] leading-tight font-['Space_Grotesk']">{job.title}</h3>
                                                    {job.company?.logo && (
                                                        <img src={job.company.logo} alt={job.company.name} className="w-10 h-10 object-contain rounded-md shrink-0 border border-slate-100" />
                                                    )}
                                                </div>
                                                <p className="text-slate-600 text-sm mb-4 font-medium flex items-center gap-1">
                                                    <Building2 className="w-4 h-4" /> {job.company?.name || 'Azienda Riservata'}
                                                </p>
                                                
                                                <div className="flex flex-wrap gap-2 mt-auto">
                                                    {job.location && (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full font-mono">
                                                            <MapPin className="w-3 h-3" /> {job.location}
                                                        </span>
                                                    )}
                                                    {job.sector && (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-mono">
                                                            <Briefcase className="w-3 h-3" /> {job.sector}
                                                        </span>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Right Column: Job Detail (Sticky) */}
                    {showDetail && (
                        <div className="w-full md:w-[60%] lg:w-[65%]">
                            <div className="md:sticky md:top-[100px] h-auto md:h-[calc(100vh-120px)] bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col">
                                {isMobile && (
                                    <div className="p-4 border-b border-slate-100">
                                        <button onClick={handleBackToList} className="flex items-center gap-2 text-slate-600 hover:text-[#26367b] font-medium text-sm transition-colors">
                                            <ChevronLeft className="w-4 h-4" /> Torna alle offerte
                                        </button>
                                    </div>
                                )}
                                
                                {selectedJob ? (
                                    <>
                                        <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                                <div>
                                                    <h1 className="text-2xl md:text-3xl font-bold text-[#111111] mb-3 font-['Space_Grotesk'] tracking-tight">{selectedJob.title}</h1>
                                                    <div className="text-lg text-[#26367b] font-medium mb-4">{selectedJob.company?.name || 'Azienda Riservata'}</div>
                                                    
                                                    <div className="flex flex-wrap gap-3">
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-xl font-mono">
                                                            <MapPin className="w-4 h-4" /> {selectedJob.location}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-xl font-mono">
                                                            <Briefcase className="w-4 h-4" /> {selectedJob.role || selectedJob.sector}
                                                        </span>
                                                    </div>
                                                </div>
                                                {selectedJob.company?.logo && (
                                                    <div className="w-20 h-20 bg-white rounded-2xl border border-slate-200 shadow-sm p-2 flex items-center justify-center shrink-0">
                                                        <img src={selectedJob.company.logo} alt={selectedJob.company.name} className="max-w-full max-h-full object-contain" />
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="mt-8">
                                                <a href={selectedJob.link} target="_blank" rel="noopener noreferrer" className="inline-flex justify-center items-center h-12 px-8 bg-[#26367b] hover:bg-[#1a2554] text-white rounded-[1rem] font-bold tracking-wide transition-all shadow-md hover:shadow-lg w-full md:w-auto hover:-translate-y-0.5">
                                                    Candidati su JobRoom
                                                </a>
                                            </div>
                                        </div>
                                        
                                        <div className="p-6 md:p-8 overflow-y-auto">
                                            <h3 className="text-xl font-bold mb-4 font-['Space_Grotesk']">Dettagli della posizione</h3>
                                            <div className="prose prose-slate max-w-none">
                                                <p className="text-slate-600 leading-relaxed">
                                                    Questa posizione è offerta da {selectedJob.company?.name || 'un\'azienda riservata'}.
                                                    Per visualizzare la descrizione completa del lavoro, i requisiti e per candidarti, visita l'annuncio originale tramite il pulsante sopra.
                                                </p>
                                                <div className="mt-8 p-6 bg-blue-50/50 border border-blue-100 rounded-[1.5rem]">
                                                    <h4 className="font-bold text-[#26367b] mb-2">Perché candidarsi tramite Job Courier?</h4>
                                                    <ul className="list-disc list-inside text-blue-800/80 space-y-2 text-sm font-medium">
                                                        <li>Accesso diretto alle migliori aziende in Svizzera</li>
                                                        <li>Supporto nella preparazione del CV</li>
                                                        <li>Aggiornamenti in tempo reale sullo stato della candidatura</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-slate-400 p-8 text-center font-mono text-sm">
                                        Seleziona un'offerta dalla lista
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Offerte;
