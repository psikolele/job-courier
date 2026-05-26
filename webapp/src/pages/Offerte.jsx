import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, ChevronLeft, Calendar, Search, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useRegistrationWall from '../hooks/useRegistrationWall';
import RegistrationWallModal from '../components/RegistrationWallModal';
import ApplyRedirectModal from '../components/ApplyRedirectModal';
import { getApplyData } from '../utils/applyHelper';

const N = 'var(--brand-navy)';
const F = 'var(--brand-fuchsia)';
const GL = 'var(--brand-gray-light)';
const GM = 'var(--brand-gray-mid)';
const brand = 'var(--font-brand)';
const editorial = 'var(--font-editorial)';
const body = 'var(--font-body)';

const Offerte = ({ setShowLoginModal }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [showAutoPopup, setShowAutoPopup] = useState(false);

    useEffect(() => {
        // Automatic registration/login popup after 2 seconds
        const hasSeen = sessionStorage.getItem('hasSeenAutoPopup');
        if (!hasSeen) {
            const timer = setTimeout(() => {
                setShowAutoPopup(true);
                sessionStorage.setItem('hasSeenAutoPopup', 'true');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('keyword') || '');
    
    // States for extended job description scraping
    const [selectedJobDetail, setSelectedJobDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const selectedJobId = searchParams.get('jobId');

    // Registration wall (shared logic with Filters.jsx)
    const wall = useRegistrationWall();

    // External redirect modal
    const [redirectModal, setRedirectModal] = useState({ open: false, url: null, company: '' });

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const newParams = new URLSearchParams(searchParams);
            const currentKeyword = searchParams.get('keyword') || '';
            if (searchQuery !== currentKeyword) {
                if (searchQuery) newParams.set('keyword', searchQuery);
                else newParams.delete('keyword');
                newParams.delete('jobId');
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
                const apiParams = new URLSearchParams(searchParams);
                apiParams.delete('jobId');
                const response = await fetch(`/api/jobs?${apiParams.toString()}`);
                if (!response.ok) throw new Error('Failed to fetch jobs');
                const data = await response.json();
                setJobs(data);
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
    }, [searchParams.get('keyword'), searchParams.get('region'), searchParams.get('role_id'), searchParams.get('location')]);

    const selectedJob = jobs.find(j => j.id.toString() === selectedJobId) || jobs[0];
    const applyData = getApplyData(selectedJob, selectedJobDetail);

    useEffect(() => {
        if (selectedJob) {
            const fetchDetail = async () => {
                setDetailLoading(true);
                setSelectedJobDetail(null);
                try {
                    const jobId = selectedJob.jobroom_id || selectedJob.id;
                    const response = await fetch(`/api/job-detail?id=${jobId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setSelectedJobDetail(data);
                    }
                } catch (err) {
                    console.error("Errore caricamento dettagli posizione:", err);
                } finally {
                    setDetailLoading(false);
                }
            };
            fetchDetail();
        }
    }, [selectedJob?.id, jobs]);

    const handleSelectJob = (id) => {
        const selected = jobs.find(j => j.id === id);
        const jobroomId = selected?.jobroom_id || id;

        if (isMobile) {
            // Su mobile navighiamo alla pagina di dettaglio a schermo intero
            navigate(`/offerta/${jobroomId}`);
            return;
        }

        // Su desktop manteniamo lo split con query param
        if (selectedJobId !== id.toString()) {
            const allowed = wall.guard();
            if (!allowed) return;
        }
        const newParams = new URLSearchParams(searchParams);
        newParams.set('jobId', id.toString());
        setSearchParams(newParams);
    };

    const handleApply = (job) => {
        if (!job) return;
        
        // Combine list job parameters with scraped detail parameters if available
        const isCurrentlySelected = selectedJobDetail && (selectedJobDetail.id === job.jobroom_id || selectedJobDetail.id === job.id.toString());
        const applyInfo = getApplyData(job, isCurrentlySelected ? selectedJobDetail : null);

        if (applyInfo.redirect && applyInfo.url) {
            setRedirectModal({ open: true, url: applyInfo.url, company: job.company?.name || '' });
            return;
        }
        
        // Internal flow → open JobRoom view-job (login + apply handled there)
        window.open(applyInfo.url, '_blank', 'noopener,noreferrer');
    };

    const handleBackToList = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('jobId');
        setSearchParams(newParams);
    };

    const showList = !isMobile || (isMobile && !selectedJobId);
    const showDetail = !isMobile || (isMobile && selectedJobId);

    return (
        <div className="pt-24 min-h-screen" style={{ background: GL }}>
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-8">
                {/* Page header */}
                <div className="mb-8">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <span style={{ width: 28, height: 2, background: F, display: 'inline-block' }} />
                        <span style={{ fontFamily: brand, fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: F }}>
                            Offerte di lavoro
                        </span>
                    </div>
                    <h1 style={{
                        fontFamily: brand, fontWeight: 900, fontSize: 44,
                        color: N, textTransform: 'uppercase',
                        letterSpacing: '-0.025em', lineHeight: 0.95
                    }}>
                        {jobs.length} <span style={{ color: F }}>annunci</span> live
                    </h1>
                </div>

                <div className="flex flex-col md:flex-row gap-1" style={{ background: 'rgba(5,11,43,0.06)' }}>
                    {/* LIST */}
                    {showList && (
                        <div className="w-full md:w-[40%] lg:w-[35%] flex flex-col" style={{ background: '#FFFFFF', padding: '28px 24px' }}>
                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: GM }} />
                                <input
                                    type="text"
                                    placeholder="Cerca per professione, azienda..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px 12px 42px',
                                        background: '#FFFFFF',
                                        border: '1.5px solid rgba(5,11,43,0.1)',
                                        fontFamily: body, fontSize: 14,
                                        outline: 'none', color: N,
                                        borderRadius: 0
                                    }}
                                />
                            </div>

                            {loading ? (
                                <div className="space-y-2">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="animate-pulse" style={{ background: GL, padding: 20, height: 110 }} />
                                    ))}
                                </div>
                            ) : error ? (
                                <div style={{ padding: 16, background: '#FFF0F0', color: '#C00', fontFamily: body, fontSize: 13 }}>{error}</div>
                            ) : jobs.length === 0 ? (
                                <div style={{ padding: 32, textAlign: 'center', color: GM, fontFamily: body, fontSize: 14 }}>
                                    Nessuna offerta trovata con i filtri attuali.
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1 overflow-y-auto" style={{ maxHeight: 'calc(100svh - 280px)', background: 'rgba(5,11,43,0.04)' }}>
                                    {jobs.map(job => {
                                        const isSelected = selectedJobId === job.id.toString();
                                        return (
                                            <motion.div
                                                key={job.id}
                                                onClick={() => handleSelectJob(job.id)}
                                                style={{
                                                    cursor: 'pointer',
                                                    padding: '20px 18px',
                                                    background: isSelected ? GL : '#FFFFFF',
                                                    borderLeft: isSelected ? `3px solid ${F}` : '3px solid transparent',
                                                    transition: 'all 0.15s'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: F, marginTop: 7, flexShrink: 0, display: 'inline-block' }} />
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <h3 style={{
                                                            fontFamily: brand, fontWeight: 700, fontSize: 14,
                                                            color: N, lineHeight: 1.3,
                                                            letterSpacing: '-0.01em', marginBottom: 4
                                                        }}>{job.title}</h3>
                                                        <p style={{ fontFamily: body, fontSize: 12, color: GM, marginBottom: 6 }}>
                                                            {job.company?.name || 'Azienda Riservata'}
                                                        </p>
                                                        {job.published_at && (
                                                            <p style={{ fontFamily: body, fontSize: 10, color: GM, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4, opacity: 0.7 }}>
                                                                <Calendar size={10} /> {job.published_at}
                                                            </p>
                                                        )}
                                                        {job.redirect && (
                                                            <span style={{
                                                                display: 'inline-block',
                                                                fontFamily: brand, fontWeight: 700, fontSize: 8,
                                                                letterSpacing: '0.18em', textTransform: 'uppercase',
                                                                color: F, marginBottom: 6
                                                            }}>● Esterno</span>
                                                        )}

                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                            {job.location && (
                                                                <span style={{
                                                                    fontFamily: body, fontSize: 10, fontWeight: 600,
                                                                    letterSpacing: '0.08em', textTransform: 'uppercase',
                                                                    color: GM,
                                                                    border: '1px solid rgba(5,11,43,0.1)',
                                                                    padding: '2px 8px'
                                                                }}>{job.location}</span>
                                                            )}
                                                            {job.sector && (
                                                                <span style={{
                                                                    fontFamily: body, fontSize: 10, fontWeight: 600,
                                                                    letterSpacing: '0.08em', textTransform: 'uppercase',
                                                                    color: GM,
                                                                    border: '1px solid rgba(5,11,43,0.1)',
                                                                    padding: '2px 8px'
                                                                }}>{job.sector}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* DETAIL */}
                    {showDetail && (
                        <div className="w-full md:w-[60%] lg:w-[65%]">
                            <div className="md:sticky md:top-[100px] flex flex-col" style={{
                                background: '#FFFFFF',
                                height: isMobile ? 'auto' : 'calc(100vh - 200px)',
                                overflow: 'hidden'
                            }}>
                                {isMobile && (
                                    <div style={{ padding: 16, borderBottom: '1px solid rgba(5,11,43,0.07)' }}>
                                        <button onClick={handleBackToList} style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            fontFamily: brand, fontWeight: 700, fontSize: 11,
                                            letterSpacing: '0.14em', textTransform: 'uppercase',
                                            color: F,
                                            display: 'inline-flex', alignItems: 'center', gap: 6
                                        }}>
                                            <ChevronLeft size={14} /> Torna alle offerte
                                        </button>
                                    </div>
                                )}

                                {selectedJob ? (
                                    <>
                                        <div style={{ padding: '32px 36px', borderBottom: '1px solid rgba(5,11,43,0.07)' }}>
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: F, display: 'inline-block' }} />
                                                        <span style={{ fontFamily: brand, fontWeight: 700, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: F }}>
                                                            {selectedJob.company?.name || 'Azienda Riservata'}
                                                        </span>
                                                    </div>
                                                    <h1 style={{
                                                        fontFamily: brand, fontWeight: 900, fontSize: 32,
                                                        color: N, textTransform: 'uppercase',
                                                        letterSpacing: '-0.025em', lineHeight: 0.95, marginBottom: 20
                                                    }}>{selectedJob.title}</h1>

                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                                        <span style={{
                                                            fontFamily: body, fontSize: 11, fontWeight: 600,
                                                            letterSpacing: '0.08em', textTransform: 'uppercase',
                                                            color: GM,
                                                            border: '1px solid rgba(5,11,43,0.1)',
                                                            padding: '4px 12px',
                                                            display: 'inline-flex', alignItems: 'center', gap: 6
                                                        }}>
                                                            <MapPin size={12} /> {selectedJob.location}
                                                        </span>
                                                        <span style={{
                                                            fontFamily: body, fontSize: 11, fontWeight: 600,
                                                            letterSpacing: '0.08em', textTransform: 'uppercase',
                                                            color: GM,
                                                            border: '1px solid rgba(5,11,43,0.1)',
                                                            padding: '4px 12px',
                                                            display: 'inline-flex', alignItems: 'center', gap: 6
                                                        }}>
                                                            <Briefcase size={12} /> {selectedJob.role || selectedJob.sector}
                                                        </span>
                                                    </div>
                                                </div>
                                                {selectedJob.company?.logo && (
                                                    <div style={{
                                                        width: 72, height: 72,
                                                        background: '#FFFFFF',
                                                        border: '1px solid rgba(5,11,43,0.07)',
                                                        padding: 8,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        flexShrink: 0
                                                    }}>
                                                        <img src={selectedJob.company.logo} alt={selectedJob.company.name} className="max-w-full max-h-full object-contain grayscale" />
                                                    </div>
                                                )}
                                            </div>

                                            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                <button onClick={() => handleApply(selectedJob)}
                                                    style={{
                                                        background: F, color: '#FFFFFF', border: 'none',
                                                        padding: '14px 32px',
                                                        fontFamily: brand, fontWeight: 700, fontSize: 11,
                                                        letterSpacing: '0.14em', textTransform: 'uppercase',
                                                        cursor: 'pointer', borderRadius: 0,
                                                        display: 'inline-flex', alignItems: 'center', gap: 8,
                                                        width: 'fit-content'
                                                    }} className="hover:opacity-80 transition-opacity">
                                                    {applyData.redirect ? (
                                                        <>Candidati <ExternalLink size={13} /></>
                                                    ) : (
                                                        <>Candidati →</>
                                                    )}
                                                </button>
                                                {applyData.redirect && (
                                                    <span style={{ fontFamily: body, fontSize: 11, color: GM, fontStyle: 'italic' }}>
                                                        Candidatura gestita su sito esterno
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ padding: '32px 36px', overflowY: 'auto', flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                                <span style={{ width: 28, height: 2, background: F, display: 'inline-block' }} />
                                                <span style={{ fontFamily: brand, fontWeight: 700, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: F }}>
                                                    Dettagli posizione
                                                </span>
                                            </div>
                                            {detailLoading ? (
                                                <div className="flex flex-col gap-3 animate-pulse py-4">
                                                    <div className="h-4 bg-[#050B2B]/5 w-3/4 rounded-none"></div>
                                                    <div className="h-4 bg-[#050B2B]/5 w-full rounded-none"></div>
                                                    <div className="h-4 bg-[#050B2B]/5 w-5/6 rounded-none"></div>
                                                    <div className="h-4 bg-[#050B2B]/5 w-2/3 rounded-none"></div>
                                                </div>
                                            ) : selectedJobDetail ? (
                                                <div className="flex flex-col gap-6">
                                                    <div 
                                                        className="job-description-content text-sm font-normal leading-relaxed text-slate-800"
                                                        style={{ fontFamily: body, paddingRight: '4px' }}
                                                        dangerouslySetInnerHTML={{ __html: selectedJobDetail.description }}
                                                    />
                                                    
                                                    {/* Candidati Link/Button in basso col medesimo stile */}
                                                    <div style={{ borderTop: '1px solid rgba(5,11,43,0.07)', paddingTop: 20, marginTop: 10 }}>
                                                        <button onClick={() => handleApply(selectedJob)}
                                                            style={{
                                                                background: F, color: '#FFFFFF', border: 'none',
                                                                padding: '14px 32px',
                                                                fontFamily: brand, fontWeight: 700, fontSize: 11,
                                                                letterSpacing: '0.14em', textTransform: 'uppercase',
                                                                cursor: 'pointer', borderRadius: 0,
                                                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                                                width: 'fit-content'
                                                            }} className="hover:opacity-80 transition-opacity">
                                                            {applyData.redirect ? (
                                                                <>Candidati <ExternalLink size={13} /></>
                                                            ) : (
                                                                <>Candidati →</>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p style={{ fontFamily: body, fontSize: 14, color: N, lineHeight: 1.7, opacity: 0.8 }}>
                                                    Questa posizione è offerta da {selectedJob.company?.name || 'Azienda Riservata'}.
                                                    Seleziona un annuncio per caricarne i dettagli qui.
                                                </p>
                                            )}

                                            <div style={{
                                                marginTop: 32, padding: '24px 28px',
                                                background: GL,
                                                borderLeft: `3px solid ${F}`
                                            }}>
                                                <p style={{
                                                    fontFamily: brand, fontWeight: 700, fontSize: 11,
                                                    letterSpacing: '0.16em', textTransform: 'uppercase',
                                                    color: F, marginBottom: 12
                                                }}>Perché Job Courier</p>
                                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                    {[
                                                        'Accesso diretto alle migliori aziende in Svizzera',
                                                        'Supporto nella preparazione del CV',
                                                        'Aggiornamenti in tempo reale sullo stato della candidatura'
                                                    ].map((item, i) => (
                                                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8, fontFamily: body, fontSize: 13, color: N }}>
                                                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: F, marginTop: 8, flexShrink: 0, display: 'inline-block' }} />
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center p-8 text-center" style={{
                                        fontFamily: editorial, fontStyle: 'italic',
                                        fontSize: 18, color: GM
                                    }}>
                                        Seleziona un'offerta dalla lista
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Registration wall (after 3 clicks/24h) */}
            <RegistrationWallModal isOpen={wall.isOpen} onClose={() => wall.setIsOpen(false)} />

            {/* External redirect modal — "Ti stiamo mandando su un altro sito" */}
            <ApplyRedirectModal
                isOpen={redirectModal.open}
                externalUrl={redirectModal.url}
                companyName={redirectModal.company}
                onClose={() => setRedirectModal({ open: false, url: null, company: '' })}
            />

            {/* ── AUTOMATIC POPUP (2 SECONDS DELAY) ── */}
            <AnimatePresence>
                {showAutoPopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 md:p-8"
                        onClick={(e) => { if (e.target === e.currentTarget) setShowAutoPopup(false); }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 15 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 15 }}
                            className="bg-white shadow-2xl w-full max-w-lg relative overflow-hidden flex flex-col p-8 md:p-10 rounded-none border border-slate-200"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setShowAutoPopup(false)}
                                className="absolute top-6 right-6 w-10 h-10 bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors shadow-sm rounded-none border border-slate-200 cursor-pointer"
                                aria-label="Chiudi"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>

                            <div className="flex flex-col items-center text-center mt-4">
                                <div className="w-12 h-12 bg-[var(--brand-fuchsia)]/10 flex items-center justify-center mb-6 text-[var(--brand-fuchsia)] rounded-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                </div>

                                <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 tracking-[0.15em] uppercase font-sans">
                                    Accedi o Registrati
                                </h2>
                                
                                <p className="text-slate-500 text-sm mb-8 max-w-sm" style={{ fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
                                    Crea subito il tuo account gratuito per candidarti in un click, impostare alert personalizzati e monitorare lo stato delle tue ricerche sul mercato elvetico.
                                </p>

                                <div className="flex flex-col gap-3 w-full max-w-xs">
                                    {/* REGISTRATI (Candidato) */}
                                    <motion.a
                                        whileHover={{ scale: 1.03 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                        href="https://jobroom.jobcourier.ch/job-seekers.php?lan=it&language=it"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-[var(--brand-fuchsia)] text-white font-bold py-4 transition-all text-center rounded-none tracking-[0.1em] text-xs uppercase cursor-pointer"
                                        onClick={() => setShowAutoPopup(false)}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        Iscriviti Ora
                                    </motion.a>

                                    {/* ACCEDI (Login) */}
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                        onClick={() => {
                                            setShowAutoPopup(false);
                                            setShowLoginModal(true);
                                        }}
                                        className="w-full bg-white border-2 border-slate-200 text-slate-600 font-bold py-4 transition-all hover:border-[var(--brand-navy)] hover:text-[var(--brand-navy)] text-center rounded-none tracking-[0.1em] text-xs uppercase cursor-pointer"
                                    >
                                        Accedi al Profilo
                                    </motion.button>
                                </div>
                            </div>

                            {/* Fuchsia bottom accent bar */}
                            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[var(--brand-fuchsia)]" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Offerte;
