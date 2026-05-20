import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Briefcase, ChevronRight, Mail, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import heroBg1 from '../assets/hero-bg.jpg';

const Hero = ({ setShowLoginModal }) => {
    const { t } = useTranslation();
    const [hoveredSide, setHoveredSide] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [timerKey, setTimerKey] = useState(0);
    const navigate = useNavigate();

    const [cantons, setCantons] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [selectedCanton, setSelectedCanton] = useState('');
    const [selectedSector, setSelectedSector] = useState('');

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

    const sliderImages = [
        heroBg1,
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
    ];

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % sliderImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [timerKey, sliderImages.length]);

    const handleDotClick = (index) => {
        setCurrentImageIndex(index);
        setTimerKey(prev => prev + 1);
    };

    return (
        <section
            className="relative w-full min-h-screen flex flex-col md:flex-row overflow-hidden"
            style={{ background: 'var(--brand-navy)' }}
        >
            {/* ── LEFT: Editorial copy + KPIs ── */}
            <div className="relative flex-1 flex flex-col justify-center px-8 md:px-12 lg:px-20 pt-32 md:pt-40 pb-16 md:pb-24">
                {/* Slider bg (subtle, companies side) */}
                <AnimatePresence initial={false}>
                    <motion.img
                        key={currentImageIndex}
                        src={sliderImages[currentImageIndex]}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.06 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2 }}
                        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
                        alt=""
                    />
                </AnimatePresence>

                <div className="relative z-10 max-w-2xl">
                    <p style={{
                        fontFamily: 'var(--font-editorial)',
                        fontStyle: 'italic',
                        fontSize: isMobile ? 20 : 26,
                        color: 'rgba(255,255,255,0.4)',
                        marginBottom: 20,
                        lineHeight: 1.2
                    }}>
                        {t('hero.candidates.subtitle')}
                    </p>

                    <h1 style={{
                        fontFamily: 'var(--font-brand)',
                        fontWeight: 900,
                        fontSize: isMobile ? 44 : 68,
                        color: '#FFFFFF',
                        textTransform: 'uppercase',
                        letterSpacing: '-0.025em',
                        lineHeight: 0.9,
                        marginBottom: 6
                    }}>
                        {t('hero.candidates.h1')}
                    </h1>
                    <h1 style={{
                        fontFamily: 'var(--font-brand)',
                        fontWeight: 900,
                        fontSize: isMobile ? 44 : 68,
                        color: 'var(--brand-fuchsia)',
                        textTransform: 'uppercase',
                        letterSpacing: '-0.025em',
                        lineHeight: 0.9,
                        marginBottom: 44
                    }}>
                        {t('hero.candidates.h1_sub')}
                    </h1>

                    {/* KPI row */}
                    <div className="flex gap-8 md:gap-12 flex-wrap">
                        {[
                            ['100K+', t('hero.kpi.candidates') || 'Candidati attivi'],
                            ['2.4K', t('hero.kpi.jobs') || 'Annunci live'],
                            ['500+', t('hero.kpi.companies') || 'Aziende partner']
                        ].map(([num, label]) => (
                            <div key={label}>
                                <div style={{
                                    fontFamily: 'var(--font-brand)',
                                    fontWeight: 900,
                                    fontSize: isMobile ? 28 : 36,
                                    color: 'var(--brand-fuchsia)',
                                    letterSpacing: '-0.02em',
                                    lineHeight: 1
                                }}>{num}</div>
                                <div style={{
                                    fontFamily: 'var(--font-body)',
                                    fontSize: 10,
                                    color: 'rgba(255,255,255,0.3)',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    marginTop: 4
                                }}>{label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Slider dots */}
                <div className="absolute bottom-8 left-8 md:left-20 flex items-center gap-2 z-20">
                    {sliderImages.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleDotClick(idx)}
                            className="transition-all duration-300 focus:outline-none"
                            style={{
                                width: currentImageIndex === idx ? 20 : 5,
                                height: 5,
                                borderRadius: 3,
                                background: currentImageIndex === idx ? 'var(--brand-fuchsia)' : 'rgba(255,255,255,0.25)',
                            }}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* ── RIGHT: White search panel ── */}
            <div
                className="relative z-10 flex flex-col justify-center px-8 md:px-12 pt-20 md:pt-0 pb-16 md:pb-0"
                style={{
                    background: '#FFFFFF',
                    width: isMobile ? '100%' : 360,
                    minWidth: isMobile ? 'auto' : 340,
                    flexShrink: 0
                }}
            >
                <div className="w-full max-w-xs mx-auto">
                    <p style={{
                        fontFamily: 'var(--font-brand)',
                        fontWeight: 700,
                        fontSize: 10,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: 'var(--brand-navy)',
                        marginBottom: 20
                    }}>CERCA LAVORO</p>

                    <form onSubmit={handleSearch} className="flex flex-col gap-3">
                        <input
                            type="text"
                            placeholder={t('hero.candidates.search_placeholder')}
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            style={{
                                display: 'block',
                                width: '100%',
                                padding: '13px 16px',
                                border: '1.5px solid rgba(5,11,43,0.1)',
                                fontFamily: 'var(--font-body)',
                                fontSize: 14,
                                outline: 'none',
                                color: 'var(--brand-navy)',
                                borderRadius: 0,
                                background: '#fff'
                            }}
                        />
                        <div className="relative">
                            <select
                                value={selectedSector}
                                onChange={(e) => setSelectedSector(e.target.value)}
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '13px 16px',
                                    border: '1.5px solid rgba(5,11,43,0.1)',
                                    fontFamily: 'var(--font-body)',
                                    fontSize: 14,
                                    outline: 'none',
                                    color: selectedSector ? 'var(--brand-navy)' : '#8B8FA8',
                                    borderRadius: 0,
                                    background: '#fff',
                                    appearance: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="">{t('hero.candidates.any_sector')}</option>
                                {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none rotate-90" style={{ color: 'var(--brand-gray-mid)' }} />
                        </div>
                        <div className="relative">
                            <select
                                value={selectedCanton}
                                onChange={(e) => setSelectedCanton(e.target.value)}
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '13px 16px',
                                    border: '1.5px solid rgba(5,11,43,0.1)',
                                    fontFamily: 'var(--font-body)',
                                    fontSize: 14,
                                    outline: 'none',
                                    color: selectedCanton ? 'var(--brand-navy)' : '#8B8FA8',
                                    borderRadius: 0,
                                    background: '#fff',
                                    appearance: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="">{t('hero.candidates.all_cantons')}</option>
                                {cantons.map(c => <option key={c.value} value={c.value}>{c.name}</option>)}
                            </select>
                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none rotate-90" style={{ color: 'var(--brand-gray-mid)' }} />
                        </div>
                        <button
                            type="submit"
                            className="transition-opacity hover:opacity-80"
                            style={{
                                background: 'var(--brand-fuchsia)',
                                color: '#FFFFFF',
                                border: 'none',
                                padding: '15px',
                                fontFamily: 'var(--font-brand)',
                                fontWeight: 700,
                                fontSize: 10,
                                letterSpacing: '0.14em',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                borderRadius: 0,
                                width: '100%'
                            }}
                        >
                            CERCA ANNUNCI →
                        </button>
                    </form>

                    {/* Quick links */}
                    <div style={{ marginTop: 20 }}>
                        <p style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 10,
                            color: 'var(--brand-gray-mid)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em',
                            marginBottom: 10
                        }}>{t('nav.other_links')}</p>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { label: t('nav.all_offers'), href: 'https://jobroom.jobcourier.ch/job/latest-and-all-job-ads.php' },
                                { label: t('nav.all_companies'), href: 'https://jobroom.jobcourier.ch/jobs-by-company.php' },
                                { label: t('nav.blog'), href: '#blog' }
                            ].map(({ label, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    style={{
                                        border: '1.5px solid rgba(5,11,43,0.1)',
                                        background: 'none',
                                        padding: '5px 12px',
                                        fontFamily: 'var(--font-body)',
                                        fontSize: 11,
                                        color: 'var(--brand-navy)',
                                        textDecoration: 'none',
                                        letterSpacing: '0.04em',
                                        display: 'inline-block',
                                        transition: 'background 0.15s'
                                    }}
                                >
                                    {label}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Companies CTA */}
                    <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(5,11,43,0.07)' }}>
                        <p style={{
                            fontFamily: 'var(--font-brand)',
                            fontWeight: 700,
                            fontSize: 10,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            color: 'var(--brand-fuchsia)',
                            marginBottom: 12
                        }}>AZIENDE</p>
                        <p style={{
                            fontFamily: 'var(--font-editorial)',
                            fontStyle: 'italic',
                            fontSize: 15,
                            color: 'var(--brand-gray-mid)',
                            marginBottom: 16,
                            lineHeight: 1.4
                        }}>{t('hero.companies.h1')}</p>
                        <button
                            onClick={() => setShowLoginModal(true)}
                            className="transition-opacity hover:opacity-80 w-full"
                            style={{
                                background: 'var(--brand-navy)',
                                color: '#FFFFFF',
                                border: 'none',
                                padding: '13px',
                                fontFamily: 'var(--font-brand)',
                                fontWeight: 700,
                                fontSize: 10,
                                letterSpacing: '0.14em',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                borderRadius: 0
                            }}
                        >
                            {t('hero.companies.cta')} →
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
