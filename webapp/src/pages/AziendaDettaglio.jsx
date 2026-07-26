import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapPin, Briefcase, ExternalLink, ChevronLeft } from 'lucide-react';
import SectionLabel from '../components/ui/SectionLabel.jsx';

const N = 'var(--brand-navy)';
const F = 'var(--brand-fuchsia)';
const GL = 'var(--brand-gray-light)';
const GM = 'var(--brand-gray-mid)';
const brand = 'var(--font-brand)';
const editorial = 'var(--font-editorial)';
const body = 'var(--font-body)';

const AziendaDettaglio = () => {
    const { slug } = useParams();

    // 'loading' | 'not-found' | 'error' | 'ready'
    const [status, setStatus] = useState('loading');
    const [detail, setDetail] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setStatus('loading');
            setDetail(null);
            try {
                const listRes = await fetch('/api/companies');
                if (!listRes.ok) throw new Error('Impossibile recuperare l\'elenco aziende');
                const list = await listRes.json();
                const match = Array.isArray(list) ? list.find((c) => c.slug === slug) : null;

                if (!match) {
                    if (!cancelled) setStatus('not-found');
                    return;
                }

                const detailRes = await fetch(`/api/company-detail?id=${match.id}&slug=${match.slug}`);
                if (!detailRes.ok) throw new Error('Impossibile recuperare i dettagli azienda');
                const data = await detailRes.json();

                if (!cancelled) {
                    setDetail(data);
                    setStatus('ready');
                }
            } catch (err) {
                console.error(err);
                if (!cancelled) setStatus('error');
            }
        };

        load();
        return () => { cancelled = true; };
    }, [slug]);

    // Single top-level Helmet (not re-mounted per branch) to avoid react-helmet-async
    // losing the title tag during rapid status transitions (loading -> ready).
    const helmetTitle = status === 'ready' && detail
        ? `${detail.name} - Lavora con noi - JobCourier`
        : status === 'not-found'
            ? 'Azienda non trovata - JobCourier'
            : 'Aziende che assumono - JobCourier';
    const helmetDescription = status === 'ready' && detail
        ? `Scopri ${detail.name} su JobCourier: sede, settore e opportunità di candidatura.`
        : 'Profilo azienda su JobCourier.';

    const helmet = (
        <Helmet>
            <title>{helmetTitle}</title>
            <meta name="description" content={helmetDescription} />
        </Helmet>
    );

    if (status === 'loading') {
        return (
            <div className="pt-24 min-h-screen" style={{ background: GL }}>
                {helmet}
                <div className="max-w-[1000px] mx-auto px-6 md:px-12 py-16">
                    <div className="animate-pulse flex flex-col gap-4">
                        <div style={{ height: 24, width: '30%', background: '#FFFFFF' }} />
                        <div style={{ height: 48, width: '70%', background: '#FFFFFF' }} />
                        <div style={{ height: 120, width: '100%', background: '#FFFFFF' }} />
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'not-found') {
        return (
            <div className="pt-24 min-h-screen flex items-center justify-center" style={{ background: GL }}>
                {helmet}
                <div className="text-center px-6 max-w-md">
                    <h1 style={{ fontFamily: editorial, fontStyle: 'italic', fontSize: 26, color: N, marginBottom: 16 }}>
                        Azienda non trovata.
                    </h1>
                    <p style={{ fontFamily: body, fontSize: 14, color: GM, marginBottom: 24 }}>
                        Il profilo che cerchi non esiste o non è più disponibile.
                    </p>
                    <Link to="/aziende-che-assumono" style={{
                        fontFamily: brand, fontWeight: 700, fontSize: 11,
                        letterSpacing: '0.14em', textTransform: 'uppercase',
                        color: F, textDecoration: 'none',
                        display: 'inline-flex', alignItems: 'center', gap: 6
                    }}>
                        <ChevronLeft size={14} /> Torna alle aziende
                    </Link>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="pt-24 min-h-screen flex items-center justify-center" style={{ background: GL }}>
                {helmet}
                <div className="text-center px-6 max-w-md">
                    <p style={{ fontFamily: body, fontSize: 14, color: '#C00', marginBottom: 24 }}>
                        Si è verificato un errore nel caricamento dell'azienda. Riprova più tardi.
                    </p>
                    <Link to="/aziende-che-assumono" style={{
                        fontFamily: brand, fontWeight: 700, fontSize: 11,
                        letterSpacing: '0.14em', textTransform: 'uppercase',
                        color: F, textDecoration: 'none',
                        display: 'inline-flex', alignItems: 'center', gap: 6
                    }}>
                        <ChevronLeft size={14} /> Torna alle aziende
                    </Link>
                </div>
            </div>
        );
    }

    const { name, logo, location, sector, brand_title, brand_description, spontaneous_url, jobs } = detail;
    const hasJobs = Array.isArray(jobs) && jobs.length > 0;

    return (
        <div className="pt-24 min-h-screen" style={{ background: GL }}>
            {helmet}

            <div className="max-w-[1000px] mx-auto px-6 md:px-12 py-10 md:py-16">
                <Link to="/aziende-che-assumono" style={{
                    fontFamily: brand, fontWeight: 700, fontSize: 11,
                    letterSpacing: '0.14em', textTransform: 'uppercase',
                    color: F, textDecoration: 'none',
                    display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24
                }}>
                    <ChevronLeft size={14} /> Torna alle aziende
                </Link>

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start gap-6 mb-10" style={{ background: '#FFFFFF', padding: '32px 36px' }}>
                    {logo && (
                        <div style={{
                            width: 84, height: 84, flexShrink: 0,
                            background: '#FFFFFF', border: '1px solid rgba(5,11,43,0.07)',
                            padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <img src={logo} alt={name} className="max-w-full max-h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <SectionLabel>Profilo azienda</SectionLabel>
                        <h1 style={{
                            fontFamily: brand, fontWeight: 900,
                            fontSize: 'clamp(22px, 4vw, 34px)',
                            color: N, textTransform: 'uppercase',
                            letterSpacing: '-0.02em', lineHeight: 1.05, marginBottom: 16,
                            wordBreak: 'break-word'
                        }}>{name}</h1>

                        <div className="flex flex-col sm:flex-row flex-wrap" style={{ gap: 8 }}>
                            {location && (
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 7,
                                    border: '1px solid rgba(5,11,43,0.1)', padding: '4px 12px 4px 5px',
                                    background: '#FAFAFA', fontFamily: body, fontSize: 11, color: GM,
                                    fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase'
                                }}>
                                    <MapPin size={12} color={F} /> {location}
                                </span>
                            )}
                            {sector && (
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 7,
                                    border: '1px solid rgba(5,11,43,0.1)', padding: '4px 12px 4px 5px',
                                    background: '#FAFAFA', fontFamily: body, fontSize: 11, color: GM,
                                    fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase'
                                }}>
                                    <Briefcase size={12} color={N} /> {sector}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Lavora con noi */}
                {(brand_title || brand_description) && (
                    <div className="mb-10" style={{ background: '#FFFFFF', padding: '32px 36px' }}>
                        <SectionLabel>{brand_title || 'Lavora con noi'}</SectionLabel>
                        {brand_description && (
                            <p style={{ fontFamily: body, fontSize: 14, color: N, lineHeight: 1.7, opacity: 0.85, whiteSpace: 'pre-line' }}>
                                {brand_description}
                            </p>
                        )}
                        {spontaneous_url && (
                            <a
                                href={spontaneous_url}
                                target="_blank"
                                rel="noopener noreferrer nofollow"
                                style={{
                                    marginTop: 24,
                                    background: F, color: '#FFFFFF', border: 'none',
                                    padding: '14px 28px',
                                    fontFamily: brand, fontWeight: 700, fontSize: 11,
                                    letterSpacing: '0.14em', textTransform: 'uppercase',
                                    cursor: 'pointer', borderRadius: 0, textDecoration: 'none',
                                    display: 'inline-flex', alignItems: 'center', gap: 8
                                }}
                                className="hover:opacity-80 transition-opacity"
                            >
                                Candidatura spontanea <ExternalLink size={13} />
                            </a>
                        )}
                    </div>
                )}

                {/* Annunci attivi */}
                <div style={{ background: '#FFFFFF', padding: '32px 36px' }}>
                    <SectionLabel>Annunci attivi</SectionLabel>

                    {hasJobs ? (
                        <div className="flex flex-col gap-1" style={{ background: 'rgba(5,11,43,0.06)' }}>
                            {jobs.map((job) => (
                                <Link
                                    key={job.id}
                                    to={`/offerta/${job.id}`}
                                    style={{
                                        padding: '20px 24px', background: '#FFFFFF',
                                        display: 'flex', flexDirection: 'column', gap: 8,
                                        textDecoration: 'none'
                                    }}
                                >
                                    <h3 style={{ fontFamily: brand, fontWeight: 700, fontSize: 14, color: N }}>{job.title}</h3>
                                    <div className="flex flex-wrap" style={{ gap: 8 }}>
                                        {job.location && <span style={{ fontFamily: body, fontSize: 12, color: GM }}>{job.location}</span>}
                                        {job.sector && <span style={{ fontFamily: body, fontSize: 12, color: GM }}>· {job.sector}</span>}
                                        {job.role && <span style={{ fontFamily: body, fontSize: 12, color: GM }}>· {job.role}</span>}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                            <p style={{ fontFamily: body, fontSize: 14, color: GM, marginBottom: 20 }}>
                                Nessuna offerta attiva per questa azienda al momento.
                            </p>
                            <Link to="/offerte" style={{
                                background: N, color: '#FFFFFF', border: 'none',
                                padding: '14px 28px',
                                fontFamily: brand, fontWeight: 700, fontSize: 11,
                                letterSpacing: '0.14em', textTransform: 'uppercase',
                                textDecoration: 'none',
                                display: 'inline-flex', alignItems: 'center', gap: 8
                            }} className="hover:opacity-80 transition-opacity">
                                Vedi tutte le offerte →
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AziendaDettaglio;
