import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Briefcase, ChevronRight, Mail, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { AnimatedButton } from './ui/animated-button';
import SpotlightCard from './ui/spotlight-card';

import heroBg1 from '../assets/hero-bg.jpg';

const Hero = ({ setShowLoginModal }) => {
    const { t, i18n } = useTranslation();
    const [hoveredSide, setHoveredSide] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const navigate = useNavigate();

    const [cantons, setCantons] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [selectedCanton, setSelectedCanton] = useState('');
    const [selectedSector, setSelectedSector] = useState('');

    const lang = i18n?.language || 'it';
    const companyLinks = [
        { label: 'Come funziona', href: '/come-funziona' },
        { label: 'Soluzioni e tariffe', href: '/soluzioni-e-tariffe' },
        { label: 'Consigli di recruiting', href: '#blog' }
    ];
    
    const getHeroLabel = (item) => {
        if (lang === 'en' && item.labelEn) return item.labelEn;
        if (lang === 'de' && item.labelDe) return item.labelDe;
        if (lang === 'fr' && item.labelFr) return item.labelFr;
        return item.label;
    };

    useEffect(() => {
        setTimeout(() => {
            setCantons([
            { name: 'Argovia', value: 'AG', regionId: '3095' }, { name: 'Basilea', value: 'BS', regionId: '3105' },
            { name: 'Berna', value: 'BE', regionId: '3099' }, { name: 'Ginevra', value: 'GE', regionId: '3101' },
            { name: 'Grigioni', value: 'GR', regionId: '3103' }, { name: 'Lucerna', value: 'LU', regionId: '3107' },
            { name: 'San Gallo', value: 'SG', regionId: '3106' }, { name: 'Ticino', value: 'TI', regionId: '3115' },
            { name: 'Zurigo', value: 'ZH', regionId: '3120' }, { name: 'Appenzello Esterno', value: 'AR' },
            { name: 'Appenzello Interno', value: 'AI' }, { name: 'Basilea Campagna', value: 'BL' },
            { name: 'Friburgo', value: 'FR' }, { name: 'Giura', value: 'JU' }, { name: 'Glarona', value: 'GL' },
            { name: 'Neuchâtel', value: 'NE' }, { name: 'Nidvaldo', value: 'NW' }, { name: 'Obvaldo', value: 'OW' },
            { name: 'Sciaffusa', value: 'SH' }, { name: 'Soletta', value: 'SO' }, { name: 'Svitto', value: 'SZ' },
            { name: 'Turgovia', value: 'TG' }, { name: 'Uri', value: 'UR' }, { name: 'Vallese', value: 'VS' },
            { name: 'Vaud', value: 'VD' }, { name: 'Zugo', value: 'ZG' }
        ].sort((a, b) => a.name.localeCompare(b.name)));

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
        }, 0);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
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

        if (keyword) queryParams.set('keyword', keyword);

        if (selectedSector) {
            const sectorObj = sectors.find(s => s.id === selectedSector);
            if (sectorObj) {
                queryParams.set('role', sectorObj.role);
                queryParams.set('role_id', sectorObj.id);
            }
        }

        navigate(`/offerte?${queryParams.toString()}`);
    };

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <section
            className="relative w-full flex flex-col lg:flex-row overflow-hidden h-auto lg:h-[calc(100svh-80px)] min-h-[calc(100svh-80px)]"
            style={{ background: 'var(--brand-gray-light)', marginTop: '80px', overflow: 'hidden' }}
        >
            <style>{`
                /* General Desktop scaling adjustments */
                @media (min-width: 1024px) {
                    .hero-h1, .hero-h1-sub {
                        transition: font-size 0.2s ease, margin-bottom 0.2s ease;
                    }
                    .hero-panel {
                        transition: padding-top 0.2s ease, padding-bottom 0.2s ease;
                    }
                    .hero-card-box {
                        transition: height 0.2s ease, padding 0.2s ease, margin-bottom 0.2s ease;
                    }
                }

                .hero-quick-links {
                    padding-left: 1.5rem;
                    padding-right: 1.5rem;
                }

                /* Laptops / Smaller monitors (height <= 950px) */
                @media (max-height: 950px) and (min-width: 1024px) {
                    .hero-panel {
                        padding-top: 2.5rem !important;
                        padding-bottom: 1.5rem !important;
                    }
                    .hero-h1 {
                        font-size: 52px !important;
                    }
                    .hero-h1-sub {
                        font-size: 52px !important;
                        margin-bottom: 2.75rem !important;
                    }
                    .hero-card-box {
                        height: 290px !important;
                        padding: 1.25rem !important;
                        margin-bottom: 1.5rem !important;
                    }
                    .hero-quick-links {
                        padding-left: 1.25rem !important;
                        padding-right: 1.25rem !important;
                    }
                }

                /* Mid-small laptops / Typical Browser Viewport (height <= 850px) */
                @media (max-height: 850px) and (min-width: 1024px) {
                    .hero-panel {
                        padding-top: 2.25rem !important;
                        padding-bottom: 1.25rem !important;
                    }
                    .hero-h1 {
                        font-size: 48px !important;
                    }
                    .hero-h1-sub {
                        font-size: 48px !important;
                        margin-bottom: 2.5rem !important;
                    }
                    .hero-card-box {
                        height: 260px !important;
                        padding: 1rem !important;
                        margin-bottom: 1.25rem !important;
                    }
                    .hero-card-box input, .hero-card-box select {
                        padding-top: 0.65rem !important;
                        padding-bottom: 0.65rem !important;
                    }
                    .hero-card-box button, .hero-card-box .animated-btn {
                        padding-top: 0.8rem !important;
                        padding-bottom: 0.8rem !important;
                    }
                    .hero-quick-links {
                        padding-left: 1rem !important;
                        padding-right: 1rem !important;
                    }
                }

                /* Compact viewports / Zoomed-in laptops / Developer tools open (height <= 720px) */
                @media (max-height: 720px) and (min-width: 1024px) {
                    .hero-panel {
                        padding-top: 1.75rem !important;
                        padding-bottom: 1rem !important;
                    }
                    .hero-h1 {
                        font-size: 42px !important;
                    }
                    .hero-h1-sub {
                        font-size: 42px !important;
                        margin-bottom: 2rem !important;
                    }
                    .hero-card-box {
                        height: 230px !important;
                        padding: 0.75rem !important;
                        margin-bottom: 1rem !important;
                    }
                    .hero-card-box input, .hero-card-box select {
                        padding-top: 0.55rem !important;
                        padding-bottom: 0.55rem !important;
                    }
                    .hero-card-box button, .hero-card-box .animated-btn {
                        padding-top: 0.7rem !important;
                        padding-bottom: 0.7rem !important;
                    }
                    .hero-quick-links {
                        padding-left: 0.75rem !important;
                        padding-right: 0.75rem !important;
                    }
                }
            `}</style>
            {/* ── LEFT: CANDIDATES PANEL (50% Width) ── */}
            <div className="hero-panel relative w-full lg:w-[50%] flex flex-col justify-start px-4 sm:px-8 lg:px-16 pt-12 lg:pt-8 pb-8 lg:pb-6 bg-white z-10 border-r border-slate-200 min-h-[calc(100svh-80px)] lg:min-h-0">
                <div className="max-w-2xl flex flex-col flex-1">
                    <div className="w-full max-w-lg mx-auto" style={{ marginBottom: isMobile ? 24 : 48 }}>
                        <p style={{
                            fontFamily: 'var(--font-brand)',
                            fontWeight: 700,
                            fontSize: 13,
                            color: 'rgba(5, 11, 43, 0.5)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.2em',
                            marginBottom: 16
                        }}>
                            {t('hero.candidates.subtitle') || 'PER I CANDIDATI'}
                        </p>
                        <h1
                            className="hero-h1"
                            style={{
                                fontFamily: 'var(--font-brand)',
                                fontWeight: 900,
                                fontSize: isMobile ? 36 : 56,
                                color: 'var(--brand-navy)',
                                textTransform: 'uppercase',
                                letterSpacing: '-0.02em',
                                lineHeight: 0.95,
                                marginBottom: 6
                            }}
                        >
                            {t('hero.candidates.h1') || 'Trova il tuo'}
                        </h1>
                        <h1
                            className="hero-h1-sub"
                            style={{
                                fontFamily: 'var(--font-editorial)',
                                fontStyle: 'italic',
                                fontWeight: 400,
                                fontSize: isMobile ? 36 : 56,
                                color: '#FF1F7A',
                                lineHeight: 1.1,
                            }}
                        >
                            {t('hero.candidates.h1_sub') || 'Prossimo Lavoro.'}
                        </h1>
                    </div>
 
                    {/* SEARCH CARD */}
                    <div
                        className="hero-card-box bg-white p-6 w-full max-w-lg mx-auto mb-6 lg:mb-8 lg:h-[312px]"
                        style={{ borderRadius: 0 }}
                    >
                        <form onSubmit={handleSearch} className="flex flex-col h-full justify-between">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder={t('hero.candidates.search_placeholder')}
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3.5 border-0 border-b border-b-[var(--brand-fuchsia)] font-mono text-xs sm:text-sm focus:border-b-[var(--brand-navy)] outline-none transition-colors"
                                    style={{ borderRadius: 0 }}
                                />
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            </div>
 
                            <div className="relative">
                                <select
                                    value={selectedSector}
                                    onChange={(e) => setSelectedSector(e.target.value)}
                                    className="w-full pl-10 pr-10 py-3.5 border-0 border-b border-b-[var(--brand-fuchsia)] font-mono text-sm focus:border-b-[var(--brand-navy)] outline-none transition-colors appearance-none cursor-pointer"
                                    style={{
                                        borderRadius: 0,
                                        color: selectedSector ? 'var(--brand-navy)' : '#8B8FA8'
                                    }}
                                >
                                    <option value="">{t('hero.candidates.any_sector')}</option>
                                    {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none rotate-90 text-slate-400" />
                            </div>
 
                            <div className="relative">
                                <select
                                    value={selectedCanton}
                                    onChange={(e) => setSelectedCanton(e.target.value)}
                                    className="w-full pl-10 pr-10 py-3.5 border-0 border-b border-b-[var(--brand-fuchsia)] font-mono text-sm focus:border-b-[var(--brand-navy)] outline-none transition-colors appearance-none cursor-pointer"
                                    style={{
                                        borderRadius: 0,
                                        color: selectedCanton ? 'var(--brand-navy)' : '#8B8FA8'
                                    }}
                                >
                                    <option value="">{t('hero.candidates.all_cantons')}</option>
                                    {cantons.map(c => <option key={c.value} value={c.value}>{c.name}</option>)}
                                </select>
                                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none rotate-90 text-slate-400" />
                            </div>
 
                            <AnimatedButton
                                type="submit"
                                className="w-full py-4 text-white font-bold tracking-[0.14em] text-xs uppercase cursor-pointer"
                                style={{
                                    background: 'var(--brand-navy)',
                                    borderRadius: 0,
                                }}
                            >
                                Trova Offerte →
                            </AnimatedButton>
                        </form>
                    </div>
 
                    {/* QUICK LINKS */}
                    <div className="w-full max-w-lg mx-auto hero-quick-links" style={{ marginTop: 16 }}>
                        <div className="flex gap-2">
                            {[
                                { label: 'Vedi tutte le offerte', href: '/offerte', external: false },
                                { label: 'Aziende che assumono', href: '/aziende-che-assumono', external: false },
                                { label: 'Consigli di Carriera', href: '#blog', external: false }
                            ].map(({ label, href, external }) => {
                                const btnClass = "jc-glow-btn-light flex-1 py-3 text-[13px] tracking-[0.04em] text-center text-[var(--brand-navy)]";
                                return external ? (
                                    <a
                                        key={label}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={btnClass}
                                        style={{ textDecoration: 'none', borderRadius: 0 }}
                                    >
                                        {label}
                                    </a>
                                ) : (
                                    <Link
                                        key={label}
                                        to={href}
                                        className={btnClass}
                                        style={{ textDecoration: 'none', borderRadius: 0 }}
                                    >
                                        {label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── RIGHT: EMPLOYERS PANEL (50% Width) ── */}
            <div className="hero-panel relative w-full lg:w-[50%] flex flex-col justify-start px-4 sm:px-8 lg:px-16 pt-12 lg:pt-8 pb-8 lg:pb-6 bg-[#050B2B] text-white z-0 overflow-hidden">
                <div className="relative z-10 max-w-2xl flex flex-col flex-1">
                    <div className="w-full max-w-lg mx-auto" style={{ marginBottom: isMobile ? 24 : 48 }}>
                        <p style={{
                            fontFamily: 'var(--font-brand)',
                            fontWeight: 700,
                            fontSize: 13,
                            color: 'rgba(255, 255, 255, 0.45)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.2em',
                            marginBottom: 16
                        }}>
                            {t('hero.companies.subtitle') || 'PER LE AZIENDE'}
                        </p>
                        <h1
                            className="hero-h1"
                            style={{
                                fontFamily: 'var(--font-brand)',
                                fontWeight: 900,
                                fontSize: isMobile ? 36 : 56,
                                color: '#FFFFFF',
                                textTransform: 'uppercase',
                                letterSpacing: '-0.02em',
                                lineHeight: 0.95,
                                marginBottom: 6
                            }}
                        >
                            {t('hero.companies.h1') || 'I candidati giusti'}
                        </h1>
                        <h1
                            className="hero-h1-sub"
                            style={{
                                fontFamily: 'var(--font-editorial)',
                                fontStyle: 'italic',
                                fontWeight: 400,
                                fontSize: isMobile ? 36 : 56,
                                color: '#FF1F7A',
                                lineHeight: 1.1,
                            }}
                        >
                            {t('hero.companies.h1_sub') || 'sono già qui.'}
                        </h1>
                    </div>

                    {/* Stat aziende + CTA — same container as candidati form */}
                    <div className="hero-card-box w-full max-w-lg mx-auto mb-6 lg:mb-8 lg:h-[312px] flex flex-col justify-between p-6" style={{ borderRadius: 0 }}>
                        {/* Stats Spotlight Cards row */}
                        <div className="flex gap-4 w-full pb-2" style={{ flex: 1, alignItems: 'center' }}>
                            <SpotlightCard target={120000} duration={2200} label="Candidati registrati" />
                            <SpotlightCard target={3000} duration={1800} label="Candidature al mese" />
                        </div>
                        {/* Button — pinned to bottom, full width */}
                        <AnimatedButton
                            onClick={() => setShowLoginModal(true)}
                            className="w-full py-4 text-white font-bold tracking-[0.14em] text-xs uppercase cursor-pointer"
                            style={{ background: '#FF1F7A', borderRadius: 0, border: 'none' }}
                        >
                            Pubblica annuncio →
                        </AnimatedButton>
                    </div>

                    {/* QUICK LINKS - AZIENDE */}
                    <div className="w-full max-w-lg mx-auto hero-quick-links" style={{ marginTop: 16 }}>
                        <div className="flex gap-2">
                            {companyLinks.map((item, idx) => (
                                <Link
                                    key={idx}
                                    to={item.href}
                                    className="jc-glow-btn flex-1 py-3 text-[13px] tracking-[0.04em] text-center text-white/90"
                                    style={{ textDecoration: 'none', borderRadius: 0 }}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
