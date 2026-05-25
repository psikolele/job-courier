import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Briefcase, ChevronRight, Mail, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { AnimatedButton } from './ui/animated-button';

import heroBg1 from '../assets/hero-bg.jpg';

const Hero = ({ setShowLoginModal }) => {
    const { t, i18n } = useTranslation();
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

    const lang = i18n?.language || 'it';
    const companyLinks = [
        { label: 'Come funziona', labelEn: 'How it works', labelDe: 'Wie es funktioniert', labelFr: 'Comment ça marche', href: '/come-funziona' },
        { label: t('nav.pricing'), href: '/soluzioni-e-tariffe' },
        { label: t('nav.register_company'), href: 'https://jobroom.jobcourier.ch/employer/register.php?ignoreRedirectingCookiesAll=1&lan=it&language=it', external: true }
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

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
        setTimerKey(prev => prev + 1);
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % sliderImages.length);
        setTimerKey(prev => prev + 1);
    };

    const handleDotClick = (idx) => {
        setCurrentImageIndex(idx);
        setTimerKey(prev => prev + 1);
    };

    return (
        <section
            className="relative w-full min-h-screen flex flex-col md:flex-row overflow-hidden"
            style={{ background: 'var(--brand-gray-light)' }}
        >
            {/* ── LEFT: CANDIDATES PANEL (60% Width) ── */}
            <div className="relative w-full md:w-[60%] flex flex-col justify-start px-6 md:px-12 lg:px-20 pt-32 md:pt-40 pb-16 md:pb-24 bg-white z-10 border-r border-slate-200/50">
                <div className="max-w-2xl">
                    <p style={{
                        fontFamily: 'var(--font-brand)',
                        fontWeight: 700,
                        fontSize: 11,
                        color: 'var(--brand-gray-mid)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        marginBottom: 16
                    }}>
                        {t('hero.candidates.subtitle') || 'PER I CANDIDATI'}
                    </p>

                    <h1 style={{
                        fontFamily: 'var(--font-brand)',
                        fontWeight: 900,
                        fontSize: isMobile ? 36 : 56,
                        color: 'var(--brand-navy)',
                        textTransform: 'uppercase',
                        letterSpacing: '-0.02em',
                        lineHeight: 0.95,
                        marginBottom: 6
                    }}>
                        {t('hero.candidates.h1') || 'Accedi al tuo'}
                    </h1>
                    <h1 style={{
                        fontFamily: 'var(--font-editorial)',
                        fontStyle: 'italic',
                        fontWeight: 400,
                        fontSize: isMobile ? 36 : 56,
                        color: 'var(--brand-fuchsia)',
                        lineHeight: 1.1,
                        marginBottom: 36
                    }}>
                        {t('hero.candidates.h1_sub') || 'Prossimo Lavoro.'}
                    </h1>

                    {/* SEARCH CARD */}
                    <div 
                        className="bg-white p-6 border border-slate-200/70 shadow-sm w-full max-w-lg mb-10"
                        style={{ borderRadius: 0 }}
                    >
                        <form onSubmit={handleSearch} className="flex flex-col gap-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder={t('hero.candidates.search_placeholder')}
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3.5 border border-slate-200 font-mono text-sm focus:border-[var(--brand-navy)] outline-none transition-colors"
                                    style={{ borderRadius: 0 }}
                                />
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            </div>

                            <div className="relative">
                                <select
                                    value={selectedSector}
                                    onChange={(e) => setSelectedSector(e.target.value)}
                                    className="w-full pl-10 pr-10 py-3.5 border border-slate-200 font-mono text-sm focus:border-[var(--brand-navy)] outline-none transition-colors appearance-none cursor-pointer"
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
                                    className="w-full pl-10 pr-10 py-3.5 border border-slate-200 font-mono text-sm focus:border-[var(--brand-navy)] outline-none transition-colors appearance-none cursor-pointer"
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

                    {/* ALTRI LINK */}
                    <div>
                        <p style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 10,
                            color: 'var(--brand-gray-mid)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em',
                            marginBottom: 12
                        }}>
                            ALTRI LINK
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {[
                                { label: t('nav.all_offers'), href: '/offerte', external: false },
                                { label: t('nav.all_companies'), href: 'https://jobroom.jobcourier.ch/jobs-by-company.php', external: true },
                                { label: t('nav.blog'), href: '#blog', external: false }
                            ].map(({ label, href, external }) => (
                                <AnimatedButton
                                    key={label}
                                    href={href}
                                    external={external}
                                    className="px-4 py-2 border border-slate-200/80 font-mono text-xs text-[var(--brand-navy)] hover:border-[var(--brand-fuchsia)] hover:text-[var(--brand-fuchsia)] transition-colors duration-200"
                                    style={{ textDecoration: 'none', borderRadius: 0 }}
                                >
                                    {label}
                                </AnimatedButton>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── RIGHT: EMPLOYERS PANEL (40% Width) ── */}
            <div className="relative w-full md:w-[40%] flex flex-col justify-start px-6 md:px-12 lg:px-16 pt-20 md:pt-40 pb-16 md:pb-24 bg-[var(--brand-navy)] text-white z-0 overflow-hidden">
                {/* Slidable background image with Navy Overlay */}
                <div className="absolute inset-0 w-full h-full opacity-15 pointer-events-none z-0">
                    <AnimatePresence initial={false}>
                        <motion.img
                            key={currentImageIndex}
                            src={sliderImages[currentImageIndex]}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.5 }}
                            className="absolute inset-0 w-full h-full object-cover"
                            alt=""
                        />
                    </AnimatePresence>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-navy)] via-[var(--brand-navy)]/80 to-[var(--brand-navy)]/20 pointer-events-none z-0" />

                <div className="relative z-10 max-w-md">
                    <p style={{
                        fontFamily: 'var(--font-brand)',
                        fontWeight: 700,
                        fontSize: 11,
                        color: 'rgba(255, 255, 255, 0.45)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        marginBottom: 16
                    }}>
                        {t('hero.companies.subtitle') || 'PER LE AZIENDE'}
                    </p>

                    <h1 style={{
                        fontFamily: 'var(--font-brand)',
                        fontWeight: 900,
                        fontSize: isMobile ? 36 : 56,
                        color: '#FFFFFF',
                        textTransform: 'uppercase',
                        letterSpacing: '-0.02em',
                        lineHeight: 0.95,
                        marginBottom: 6
                    }}>
                        {t('hero.companies.h1') || 'Trova il tuo Miglior'}
                    </h1>
                    <h1 style={{
                        fontFamily: 'var(--font-editorial)',
                        fontStyle: 'italic',
                        fontWeight: 400,
                        fontSize: isMobile ? 36 : 56,
                        color: 'var(--brand-fuchsia)',
                        lineHeight: 1.1,
                        marginBottom: 36
                    }}>
                        {t('hero.companies.h1_sub') || 'Talento Subito.'}
                    </h1>

                    <div className="w-full max-w-lg md:h-[288px] md:pb-6 flex flex-col justify-end mb-10">
                        <div>
                            <AnimatedButton
                                onClick={() => setShowLoginModal(true)}
                                className="px-8 py-4 text-white font-bold tracking-[0.14em] text-xs uppercase cursor-pointer"
                                style={{
                                    background: 'var(--brand-fuchsia)',
                                    borderRadius: 0,
                                    border: 'none',
                                }}
                            >
                                {t('hero.companies.cta') || 'PUBBLICA ANNUNCIO'} →
                            </AnimatedButton>
                        </div>
                    </div>

                    {/* ALTRI LINK - AZIENDE */}
                    <div>
                        <p style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 10,
                            color: 'rgba(255, 255, 255, 0.45)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em',
                            marginBottom: 12
                        }}>
                            ALTRI LINK
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {companyLinks.map((item, idx) => (
                                <AnimatedButton
                                    key={idx}
                                    href={item.href}
                                    external={item.external}
                                    className="px-4 py-2 border border-white/20 font-mono text-xs text-white hover:border-[var(--brand-fuchsia)] hover:text-[var(--brand-fuchsia)] transition-colors duration-200"
                                    style={{ textDecoration: 'none', borderRadius: 0 }}
                                >
                                    {getHeroLabel(item)}
                                </AnimatedButton>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SLIDER CONTROLS (Arrows & dots matching brand) */}
                <div className="absolute bottom-8 left-6 md:left-12 lg:left-16 right-6 md:right-12 lg:right-16 flex items-center justify-between z-20">
                    <div className="flex gap-2">
                        {sliderImages.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleDotClick(idx)}
                                className="transition-all duration-300 focus:outline-none cursor-pointer"
                                style={{
                                    width: currentImageIndex === idx ? 24 : 6,
                                    height: 6,
                                    borderRadius: 0,
                                    background: currentImageIndex === idx ? 'var(--brand-fuchsia)' : 'rgba(255, 255, 255, 0.25)',
                                    border: 'none'
                                }}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handlePrevImage}
                            className="w-10 h-10 border border-white/20 bg-black/10 flex items-center justify-center text-white hover:border-[var(--brand-fuchsia)] hover:text-[var(--brand-fuchsia)] transition-colors cursor-pointer"
                            style={{ borderRadius: 0 }}
                            aria-label="Previous slide"
                        >
                            ←
                        </button>
                        <button
                            onClick={handleNextImage}
                            className="w-10 h-10 border border-white/20 bg-black/10 flex items-center justify-center text-white hover:border-[var(--brand-fuchsia)] hover:text-[var(--brand-fuchsia)] transition-colors cursor-pointer"
                            style={{ borderRadius: 0 }}
                            aria-label="Next slide"
                        >
                            →
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
