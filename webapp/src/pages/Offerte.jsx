import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, User, ChevronLeft, Calendar, Search, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useRegistrationWall from '../hooks/useRegistrationWall';
import RegistrationWallModal from '../components/RegistrationWallModal';
import ApplyRedirectModal from '../components/ApplyRedirectModal';
import { getApplyData } from '../utils/applyHelper';
import { saveReturnUrl } from '../hooks/useReturnUrl';

const N = 'var(--brand-navy)';
const F = 'var(--brand-fuchsia)';
const GL = 'var(--brand-gray-light)';
const GM = 'var(--brand-gray-mid)';
const brand = 'var(--font-brand)';
const editorial = 'var(--font-editorial)';
const body = 'var(--font-body)';



const deriveSector = (title, sector) => {
    const skip = ['Non specificato', 'Other', 'Altro', 'ALTRO', 'other', ''];
    if (sector && !skip.includes(sector)) return sector;
    if (!title) return null;
    const t = title.toLowerCase();
    if (/trasport|autista|camion|courier|spediz|logist|magazz|driver|corriere/.test(t)) return 'Logistica';
    if (/inferm|medic|farmac|salute|dental|fisio|cura|health|clinica/.test(t)) return 'Medicina';
    if (/sviluppa|programm|developer|software|engineer|devops|cloud|\.net|java|python|frontend|backend|fullstack/.test(t)) return 'IT';
    if (/contab|finanz|paghe|banca|audit|fiscal|revisio|accounting|treuhand/.test(t)) return 'Finanza';
    if (/vendita|commerc|sales|account|business dev/.test(t)) return 'Commerciale';
    if (/amministr|segret|assistente|reception|back.?office/.test(t)) return 'Amministrazione';
    if (/costruzion|edil|parchett|muratore|idraulic|elettric|carpent|impianti|architett|projekt/.test(t)) return 'Costruzioni';
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

const Offerte = ({ setShowLoginModal }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const formatLocation = (loc) => {
        if (!loc) return '';
        let clean = loc
            .replace(/\b(Svizzera|Switzerland|Suisse|Schweiz)\b/gi, '')
            .trim();
        clean = clean.replace(/^,\s*/, '').replace(/,\s*$/, '').replace(/\s*,\s*,/g, ',').trim();
        return clean;
    };

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

        // Gate: must be logged in to apply
        if (!wall.isAuthed) {
            saveReturnUrl();
            wall.setIsOpen(true);
            return;
        }

        // Combine list job parameters with scraped detail parameters if available
        const isCurrentlySelected = selectedJobDetail && (selectedJobDetail.id === job.jobroom_id || selectedJobDetail.id === job.id.toString());
        const applyInfo = getApplyData(job, isCurrentlySelected ? selectedJobDetail : null);

        if (applyInfo.redirect && applyInfo.url) {
            setRedirectModal({ open: true, url: applyInfo.url, company: job.company?.name || '' });
            return;
        }

        // Internal flow → open JobRoom job page (user is already logged in)
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
                                                    padding: '20px 24px',
                                                    background: isSelected ? GL : '#FFFFFF',
                                                    borderLeft: isSelected ? `3px solid ${F}` : '3px solid transparent',
                                                    borderBottom: '1px solid rgba(5,11,43,0.05)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    transition: 'background 0.15s'
                                                }}
                                                whileHover={{ backgroundColor: 'var(--brand-gray-light)' }}
                                            >
                                                {/* Title + logo */}
                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 10 }}>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <h3 style={{
                                                            fontFamily: brand, fontWeight: 700, fontSize: 14,
                                                            color: N, lineHeight: 1.3,
                                                            letterSpacing: '-0.01em', marginBottom: 5
                                                        }}>{job.title}</h3>
                                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                                            <span style={{ fontFamily: body, fontSize: 12, color: GM }}>{job.company?.name || 'Azienda Riservata'}</span>
                                                            {job.published_at && (
                                                                <>
                                                                    <span style={{ color: 'rgba(139,143,168,0.4)', fontSize: 12 }}>·</span>
                                                                    <span style={{ fontFamily: body, fontSize: 11, color: GM, opacity: 0.7, display: 'flex', alignItems: 'center', gap: 3 }}>
                                                                        <Calendar size={10} />{job.published_at}
                                                                    </span>
                                                                </>
                                                            )}
                                                            {job.redirect && (
                                                                <span style={{ fontFamily: brand, fontWeight: 700, fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: F }}>● Esterno</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {job.company?.logo && (
                                                        <img
                                                            src={job.company.logo}
                                                            alt={job.company?.name}
                                                            onError={e => { e.currentTarget.style.display = 'none'; }}
                                                            style={{ width: 48, height: 48, objectFit: 'contain', flexShrink: 0, borderRadius: 6, background: '#f8f8f8', padding: 3 }}
                                                        />
                                                    )}
                                                </div>
                                                {/* Tags — always shown, label outside chip */}
                                                {(() => {
                                                    const settore = deriveSector(job.title, job.sector) || 'Altro';
                                                    const ruolo = deriveRole(job.role) || 'Altro';
                                                    const chip = {
                                                        fontFamily: body, fontSize: 10, fontWeight: 600,
                                                        letterSpacing: '0.06em', textTransform: 'uppercase',
                                                        padding: '0 7px', height: '20px',
                                                        display: 'inline-flex', alignItems: 'center',
                                                        gap: 3, borderRadius: 2,
                                                        border: '1px solid rgba(5,11,43,0.14)', color: N,
                                                    };
                                                    const lbl = {
                                                        fontFamily: body, fontSize: 9, fontWeight: 700,
                                                        letterSpacing: '0.1em', textTransform: 'uppercase',
                                                        color: GM,
                                                    };
                                                    return (
                                                        <div className="flex flex-col items-start" style={{ paddingTop: 10, borderTop: '1px solid rgba(5,11,43,0.05)', gap: 6 }}>
                                                            <span style={{ ...chip, opacity: 0.7 }}><Briefcase size={9} /><span style={lbl}>Settore:</span>{settore}</span>
                                                            <span style={{ ...chip, opacity: 0.55 }}><User size={9} /><span style={lbl}>Ruolo:</span>{ruolo}</span>
                                                        </div>
                                                    );
                                                })()}
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
                                                    <h1 className="text-[22px] md:text-[32px]" style={{
                                                        fontFamily: brand, fontWeight: 900,
                                                        color: N, textTransform: 'uppercase',
                                                        letterSpacing: '-0.025em', lineHeight: 1.05, marginBottom: 20,
                                                        wordBreak: 'break-word'
                                                    }}>{selectedJob.title}</h1>

                                                    {/* Meta row — label outside chip */}
                                                    {(() => {
                                                        const metaLbl = { fontFamily: body, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: GM };
                                                        const metaChip = (iconBg) => ({
                                                            display: 'inline-flex', alignItems: 'center', gap: 7,
                                                            border: '1px solid rgba(5,11,43,0.1)',
                                                            padding: '4px 12px 4px 5px',
                                                            background: '#FAFAFA'
                                                        });
                                                        const iconBox = (bg) => ({
                                                            width: 22, height: 22, background: bg,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            borderRadius: 2, flexShrink: 0
                                                        });
                                                        const val = { fontFamily: body, fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: GM, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' };
                                                        return (
                                                            <div className="flex flex-col items-start" style={{ gap: 6, paddingBottom: 2 }}>
                                                                <span style={metaChip()}>
                                                                    <span style={iconBox('rgba(255,31,122,0.08)')}><MapPin size={11} color="var(--brand-fuchsia)" /></span>
                                                                    <span style={metaLbl}>Sede:</span>
                                                                    <span style={val}>{formatLocation(selectedJob.location)}</span>
                                                                </span>
                                                                <span style={metaChip()}>
                                                                    <span style={iconBox('rgba(5,11,43,0.06)')}><Briefcase size={11} color="var(--brand-navy)" /></span>
                                                                    <span style={metaLbl}>Settore:</span>
                                                                    <span style={val}>{deriveSector(selectedJob.title, selectedJob.sector) || selectedJob.sector || 'Altro'}</span>
                                                                </span>
                                                                <span style={metaChip()}>
                                                                    <span style={iconBox('rgba(5,11,43,0.06)')}><User size={11} color="var(--brand-navy)" /></span>
                                                                    <span style={metaLbl}>Ruolo:</span>
                                                                    <span style={val}>{deriveRole(selectedJob.role) || selectedJob.role || 'Altro'}</span>
                                                                </span>
                                                            </div>
                                                        );
                                                    })()}
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

            {/* Unified Registration & Login Modal */}
            <RegistrationWallModal 
                isOpen={wall.isOpen} 
                onClose={() => wall.setIsOpen(false)} 
                onOpenLogin={() => setShowLoginModal(true)} 
            />

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
