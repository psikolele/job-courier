import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Briefcase, ChevronLeft, Calendar, Search, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import useRegistrationWall from '../hooks/useRegistrationWall';
import RegistrationWallModal from '../components/RegistrationWallModal';
import ApplyRedirectModal from '../components/ApplyRedirectModal';

const N = 'var(--brand-navy)';
const F = 'var(--brand-fuchsia)';
const GL = 'var(--brand-gray-light)';
const GM = 'var(--brand-gray-mid)';
const brand = 'var(--font-brand)';
const editorial = 'var(--font-editorial)';
const body = 'var(--font-body)';

const Offerte = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('keyword') || '');

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

    const handleSelectJob = (id) => {
        // Gate behind registration wall (skip block on already-selected job → allows nav within detail)
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
        if (job.redirect && job.external_url) {
            setRedirectModal({ open: true, url: job.external_url, company: job.company?.name || '' });
            return;
        }
        // Internal flow → open JobRoom view-job (login + apply handled there)
        const url = job.apply_url || job.link;
        window.open(url, '_blank', 'noopener,noreferrer');
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
                                <div className="flex flex-col gap-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)', background: 'rgba(5,11,43,0.04)' }}>
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
                                                    {selectedJob.redirect ? (
                                                        <>Candidati <ExternalLink size={13} /></>
                                                    ) : (
                                                        <>Candidati su Job Courier →</>
                                                    )}
                                                </button>
                                                {selectedJob.redirect && (
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
                                            <p style={{ fontFamily: body, fontSize: 14, color: N, lineHeight: 1.7, opacity: 0.8 }}>
                                                Questa posizione è offerta da {selectedJob.company?.name || 'un\'azienda riservata'}.
                                                Per visualizzare la descrizione completa del lavoro, i requisiti e per candidarti, visita l'annuncio originale tramite il pulsante sopra.
                                            </p>

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
        </div>
    );
};

export default Offerte;
