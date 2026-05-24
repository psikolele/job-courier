import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, Calendar, ChevronLeft, ExternalLink, Clock, Building } from 'lucide-react';
import { motion } from 'framer-motion';
import RegistrationWallModal from '../components/RegistrationWallModal';
import ApplyRedirectModal from '../components/ApplyRedirectModal';

const N = 'var(--brand-navy)';
const F = 'var(--brand-fuchsia)';
const GL = 'var(--brand-gray-light)';
const GM = 'var(--brand-gray-mid)';
const brand = 'var(--font-brand)';
const editorial = 'var(--font-editorial)';
const body = 'var(--font-body)';

const OffertaDettaglio = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal states
    const [wallOpen, setWallOpen] = useState(false);
    const [redirectModal, setRedirectModal] = useState({ open: false, url: '', company: '' });

    useEffect(() => {
        const fetchJobDetail = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/job-detail?id=${id}`);
                if (!response.ok) throw new Error("Impossibile recuperare i dettagli dell'offerta.");
                const data = await response.json();
                setJob(data);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchJobDetail();
        }
    }, [id]);

    const handleApplyClick = () => {
        if (!job) return;
        
        // Verifica del cookie jobroom_session per bypassare il wall
        const isLoggedIn = document.cookie.includes('jobroom_session');
        
        if (isLoggedIn) {
            // Se loggato -> mostra il popup di reindirizzamento
            setRedirectModal({
                open: true,
                url: job.apply_url || job.original_link,
                company: job.company?.name || ''
            });
        } else {
            // Se NON loggato -> mostra il Registration Wall modal obbligatorio
            setWallOpen(true);
        }
    };

    if (loading) {
        return (
            <div className="pt-32 min-h-screen flex items-center justify-center" style={{ background: GL }}>
                <div className="flex flex-col items-center gap-4">
                    <span className="w-12 h-12 border-4 border-t-transparent animate-spin rounded-full" style={{ borderColor: `${F} transparent transparent transparent` }} />
                    <p style={{ fontFamily: brand, fontWeight: 700, fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: N }}>
                        Caricamento offerta in corso...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="pt-32 min-h-screen flex items-center justify-center px-4" style={{ background: GL }}>
                <div className="max-w-md w-full text-center bg-white px-8 py-10 border border-red-200 rounded-none shadow-sm">
                    <h2 style={{ fontFamily: brand, fontWeight: 900, fontSize: 24, color: '#e63946', marginBottom: 12, textTransform: 'uppercase' }}>
                        Errore di Caricamento
                    </h2>
                    <p style={{ fontFamily: body, fontSize: 14, color: GM, marginBottom: 24 }}>
                        {error || "L'offerta di lavoro richiesta non è stata trovata o non è più disponibile."}
                    </p>
                    <button
                        onClick={() => navigate('/offerte')}
                        className="transition-opacity hover:opacity-80"
                        style={{
                            background: N, color: '#FFFFFF', border: 'none',
                            padding: '12px 24px', fontFamily: brand, fontWeight: 700, fontSize: 11,
                            letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 0
                        }}
                    >
                        Torna alle Offerte
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-24 min-h-screen pb-16" style={{ background: GL }}>
            <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-8">
                
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 mb-8 transition-opacity hover:opacity-60 text-sm font-semibold uppercase tracking-wider"
                    style={{ fontFamily: brand, color: N, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                    <ChevronLeft size={16} />
                    <span>Torna indietro</span>
                </button>

                {/* Main Grid: Clinical Boutique Layout Split 65/35 */}
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    
                    {/* LEFT COLUMN: 65% Job Description */}
                    <div className="w-full lg:w-[65%] bg-white border border-[#050B2B]/6 p-8 md:p-10 rounded-none shadow-sm flex flex-col">
                        
                        {/* Header Details */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <span style={{ width: 24, height: 2, background: F, display: 'inline-block' }} />
                            <span style={{ fontFamily: brand, fontWeight: 700, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: F }}>
                                {job.sector || "Lavoro"}
                            </span>
                        </div>

                        <h1 style={{
                            fontFamily: brand, fontWeight: 900, fontSize: 32,
                            color: N, textTransform: 'uppercase',
                            letterSpacing: '-0.025em', lineHeight: 1.05, marginBottom: 16
                        }}>
                            {job.title}
                        </h1>

                        <div className="flex flex-wrap gap-x-6 gap-y-3 pb-8 mb-8 border-b border-[#050B2B]/6">
                            <div className="flex items-center gap-2 text-sm" style={{ fontFamily: body, color: GM }}>
                                <Building size={16} style={{ color: F }} />
                                <span>{job.company?.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm" style={{ fontFamily: body, color: GM }}>
                                <MapPin size={16} style={{ color: F }} />
                                <span>{job.location}</span>
                            </div>
                            {job.details?.percentage && (
                                <div className="flex items-center gap-2 text-sm" style={{ fontFamily: body, color: GM }}>
                                    <Briefcase size={16} style={{ color: F }} />
                                    <span>{job.details.percentage}</span>
                                </div>
                            )}
                        </div>

                        {/* Rich HTML Job Description extracted via Cheerio */}
                        <div 
                            className="job-description-content text-base font-normal leading-relaxed text-slate-800"
                            style={{ fontFamily: body }}
                            dangerouslySetInnerHTML={{ __html: job.description }}
                        />

                    </div>

                    {/* RIGHT COLUMN: 35% Employer/Quick Info Sidebar */}
                    <div className="w-full lg:w-[35%] bg-white border border-[#050B2B]/6 p-8 rounded-none shadow-sm flex flex-col gap-6 sticky top-28">
                        
                        {/* Company Logo and Name Block */}
                        <div className="flex flex-col items-center text-center pb-6 border-b border-[#050B2B]/6">
                            <div className="w-20 h-20 border border-[#050B2B]/10 p-2 flex items-center justify-center rounded-none bg-slate-50 mb-4 overflow-hidden">
                                <img 
                                    src={job.company?.logo} 
                                    alt={job.company?.name} 
                                    className="max-w-full max-h-full object-contain"
                                    onError={(e) => {
                                        e.target.src = `https://www.google.com/s2/favicons?domain=${job.company?.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.ch'}&sz=128`;
                                    }}
                                />
                            </div>
                            <h3 style={{ fontFamily: brand, fontWeight: 700, fontSize: 16, color: N, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {job.company?.name}
                            </h3>
                        </div>

                        {/* Quick Information Panel */}
                        <div className="flex flex-col gap-4">
                            <h4 style={{ fontFamily: brand, fontWeight: 700, fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: F, marginBottom: 4 }}>
                                Scheda informativa
                            </h4>

                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center text-sm py-1 border-b border-[#050B2B]/3">
                                    <span style={{ fontFamily: body, color: GM }}>Sede</span>
                                    <span style={{ fontFamily: brand, fontWeight: 700, color: N }} className="text-right">{job.location}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm py-1 border-b border-[#050B2B]/3">
                                    <span style={{ fontFamily: body, color: GM }}>Settore</span>
                                    <span style={{ fontFamily: brand, fontWeight: 700, color: N }} className="text-right">{job.sector || "Non specificato"}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm py-1 border-b border-[#050B2B]/3">
                                    <span style={{ fontFamily: body, color: GM }}>Ruolo</span>
                                    <span style={{ fontFamily: brand, fontWeight: 700, color: N }} className="text-right">{job.role || "Non specificato"}</span>
                                </div>
                                {job.details?.percentage && (
                                    <div className="flex justify-between items-center text-sm py-1 border-b border-[#050B2B]/3">
                                        <span style={{ fontFamily: body, color: GM }}>Impiego</span>
                                        <span style={{ fontFamily: brand, fontWeight: 700, color: N }} className="text-right">{job.details.percentage}</span>
                                    </div>
                                )}
                                {job.details?.duration && (
                                    <div className="flex justify-between items-center text-sm py-1 border-b border-[#050B2B]/3">
                                        <span style={{ fontFamily: body, color: GM }}>Durata</span>
                                        <span style={{ fontFamily: brand, fontWeight: 700, color: N }} className="text-right">{job.details.duration}</span>
                                    </div>
                                )}
                                {job.details?.entryDate && (
                                    <div className="flex justify-between items-center text-sm py-1">
                                        <span style={{ fontFamily: body, color: GM }}>Entrata</span>
                                        <span style={{ fontFamily: brand, fontWeight: 700, color: N }} className="text-right">{job.details.entryDate}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Apply Trigger CTA Button */}
                        <button
                            onClick={handleApplyClick}
                            className="transition-all duration-300 hover:opacity-90 w-full flex items-center justify-center gap-2 active:scale-[0.98] select-none cursor-pointer"
                            style={{
                                background: N, color: '#FFFFFF', border: 'none',
                                padding: '16px 24px',
                                fontFamily: brand, fontWeight: 700, fontSize: 11,
                                letterSpacing: '0.15em', textTransform: 'uppercase',
                                borderRadius: 0
                            }}
                        >
                            <span>Candidati</span>
                            <ExternalLink size={13} style={{ color: F }} />
                        </button>

                    </div>

                </div>

            </div>

            {/* MODALS */}
            <RegistrationWallModal 
                isOpen={wallOpen} 
                onClose={() => setWallOpen(false)} 
            />

            <ApplyRedirectModal 
                isOpen={redirectModal.open}
                onClose={() => setRedirectModal({ open: false, url: '', company: '' })}
                externalUrl={redirectModal.url}
                companyName={redirectModal.company}
            />

        </div>
    );
};

export default OffertaDettaglio;
