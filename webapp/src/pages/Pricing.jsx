import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

gsap.registerPlugin(ScrollTrigger);

const N = 'var(--brand-navy)';
const F = 'var(--brand-fuchsia)';
const GL = 'var(--brand-gray-light)';
const GM = 'var(--brand-gray-mid)';
const W = 'var(--brand-white)';
const brand = 'var(--font-brand)';
const editorial = 'var(--font-editorial)';
const body = 'var(--font-body)';

const SectionLabel = ({ children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ width: 28, height: 2, background: F, display: 'inline-block' }} />
        <span style={{ fontFamily: brand, fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: F }}>{children}</span>
    </div>
);

const FuchsiaButton = ({ href, onClick, children, fullWidth = false }) => (
    <a href={href} onClick={onClick} className="inline-flex items-center justify-center gap-2 transition-all hover:opacity-85 hover:scale-[1.02] hover-lift"
        style={{
            background: F, color: W, border: 'none',
            padding: '14px 28px',
            fontFamily: brand, fontWeight: 700, fontSize: 11,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            cursor: 'pointer', borderRadius: 0,
            width: fullWidth ? '100%' : 'auto',
            textDecoration: 'none'
        }}>
        {children}
    </a>
);

const OutlineButton = ({ href, onClick, children, fullWidth = false }) => (
    <a href={href} onClick={onClick} className="inline-flex items-center justify-center gap-2 transition-all hover:bg-slate-50 hover:scale-[1.02] hover-lift"
        style={{
            background: 'transparent', color: N,
            border: `1.5px solid ${N}`,
            padding: '14px 28px',
            fontFamily: brand, fontWeight: 700, fontSize: 11,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            cursor: 'pointer', borderRadius: 0,
            width: fullWidth ? '100%' : 'auto',
            textDecoration: 'none'
        }}>
        {children}
    </a>
);

const FuchsiaOutlineButton = ({ href, onClick, children, fullWidth = false }) => (
    <a href={href} onClick={onClick} className="inline-flex items-center justify-center gap-2 transition-all hover:opacity-85 hover:scale-[1.02] hover-lift"
        style={{
            background: 'transparent', color: F,
            border: `1.5px solid ${F}`,
            padding: '14px 28px',
            fontFamily: brand, fontWeight: 700, fontSize: 11,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            cursor: 'pointer', borderRadius: 0,
            width: fullWidth ? '100%' : 'auto',
            textDecoration: 'none'
        }}>
        {children}
    </a>
);


const getLocalizedData = (lang) => {
    const isIt = lang === 'it';
    const isDe = lang === 'de';
    const isFr = lang === 'fr';

    return {
        heroTitleMain: isIt ? 'UNA SOLUZIONE PER OGNI' : isDe ? 'EINE LÖSUNG FÜR JEDEN' : isFr ? 'UNE SOLUTION POUR CHAQUE' : 'A SOLUTION FOR EVERY',
        heroTitleEm: isIt ? 'ESIGENZA.' : isDe ? 'BEDARF.' : isFr ? 'BESOIN.' : 'NEED.',
        heroSub: isIt ? 'Per una singola assunzione o per una ricerca continua di personale.' : isDe ? 'Für eine einzelne Einstellung oder eine kontinuierliche Personalsuche.' : isFr ? 'Pour un recrutement ponctuel ou une recherche continue de personnel.' : 'For a single hire or continuous staffing needs.',
        tabs: {
            companies: isIt ? 'Aziende & PMI' : isDe ? 'Unternehmen & KMU' : isFr ? 'Entreprises & PME' : 'Companies & SMEs',
            agencies: isIt ? 'Agenzie di selezione' : isDe ? 'Personalvermittlungen' : isFr ? 'Agences de Recrutement' : 'Recruitment Agencies',
        },
        sidebar: {
            title: isIt ? 'Vantaggi JobCourier' : isDe ? 'JobCourier Vorteile' : isFr ? 'Avantages JobCourier' : 'JobCourier Benefits',
            subtitle: isIt ? 'Perché sceglierci' : isDe ? 'Warum uns wählen' : isFr ? 'Pourquoi nous choisir' : 'Why choose us',
        },
        plans: [
            {
                label: isIt ? '01 / OCCASIONALE' : isDe ? '01 / GELEGENTLICH' : isFr ? '01 / OCCASIONNEL' : '01 / OCCASIONAL',
                name: isIt ? 'ANNUNCIO SINGOLO' : isDe ? 'EINZELANZEIGE' : isFr ? 'ANNONCE UNIQUE' : 'SINGLE POST',
                subname: 'JOB POST',
                price: 'CHF 249',
                pricePrefix: 'CHF',
                priceNum: '249',
                note: isIt ? '+IVA' : isDe ? '+MwSt.' : isFr ? '+TVA' : '+VAT',
                desc: isIt ? 'Per ricerche occasionali.' : isDe ? 'Für gelegentliche Einstellungen.' : isFr ? 'Pour recrutements occasionnels.' : 'For occasional hiring.',
                features: [
                    isIt ? '1 annuncio di lavoro online 30gg' : isDe ? '1 Stellenanzeige online 30 Tage' : isFr ? '1 annonce en ligne 30 jours' : '1 job post online 30 days',
                    isIt ? 'Ricerche illimitate in database' : isDe ? 'Unbegrenzte Datenbanksuchen' : isFr ? 'Recherches illimitées en base de données' : 'Unlimited database searches',
                    isIt ? 'Area aziendale riservata' : isDe ? 'Reservierter Unternehmensbereich' : isFr ? 'Espace entreprise réservé' : 'Reserved company area',
                ],
                vantaggi: [
                    { title: isIt ? 'VISIBILITÀ' : isDe ? 'SICHTBARKEIT' : isFr ? 'VISIBILITÉ' : 'VISIBILITY',
                      desc:  isIt ? 'Massima visibilità per le tue offerte di lavoro su JobCourier.' : isDe ? 'Maximale Sichtbarkeit für Ihre Stellenanzeigen.' : isFr ? 'Visibilité maximale pour vos offres d\'emploi.' : 'Maximum visibility for your job posts on JobCourier.' },
                    { title: isIt ? 'ACCESSO DB' : isDe ? 'DB-ZUGRIFF' : isFr ? 'ACCÈS DB' : 'DB ACCESS',
                      desc:  isIt ? 'Accesso immediato ai candidati compatibili già presenti nel database JobCourier.' : isDe ? 'Sofortiger Zugriff auf kompatible Kandidaten in der Datenbank.' : isFr ? 'Accès immédiat aux candidats compatibles déjà dans la base.' : 'Immediate access to compatible candidates in the JobCourier database.' },
                    { title: isIt ? 'AREA RISERVATA' : isDe ? 'DASHBOARD' : isFr ? 'ESPACE RÉSERVÉ' : 'DASHBOARD',
                      desc:  isIt ? "Area riservata con storico completo delle offerte da un'unica dashboard." : isDe ? 'Reservierter Bereich mit vollständiger Angebotshistorie.' : isFr ? 'Espace réservé avec historique complet des offres.' : 'Reserved area with full offer history in one dashboard.' },
                ],
                tag: isIt ? '01 / OCCASIONALE' : isDe ? '01 / GELEGENTLICH' : isFr ? '01 / OCCASIONNEL' : '01 / OCCASIONAL',
                cta: isIt ? 'Acquista' : isDe ? 'Kaufen' : isFr ? 'Acheter' : 'Buy',
            },
            {
                label: isIt ? '02 / VOLUME' : isDe ? '02 / VOLUMEN' : isFr ? '02 / VOLUME' : '02 / VOLUME',
                name: isIt ? 'PACCHETTO 5 ANNUNCI' : isDe ? 'PAKET 5 ANZEIGEN' : isFr ? 'PACK 5 ANNONCES' : 'PACK 5 POSTS',
                price: 'CHF 890',
                pricePrefix: 'CHF',
                priceNum: '890',
                oldPrice: "CHF 1'245",
                note: isIt ? '+IVA' : isDe ? '+MwSt.' : isFr ? '+TVA' : '+VAT',
                desc: isIt ? 'Massima visibilità con risparmio del 28%.' : isDe ? 'Maximale Sichtbarkeit mit 28% Ersparnis.' : isFr ? "Visibilité maximale avec 28% d'économie." : 'Maximum visibility with 28% savings.',
                features: [
                    isIt ? '5 offerte di lavoro online 30gg' : isDe ? '5 Stellenanzeigen online 30 Tage' : isFr ? '5 annonces en ligne 30 jours' : '5 job posts online 30 days',
                    isIt ? 'Ricerche illimitate in database' : isDe ? 'Unbegrenzte Datenbanksuchen' : isFr ? 'Recherches illimitées en base de données' : 'Unlimited database searches',
                    isIt ? 'Area aziendale riservata' : isDe ? 'Reservierter Unternehmensbereich' : isFr ? 'Espace entreprise réservé' : 'Reserved company area',
                ],
                vantaggi: [
                    { title: isIt ? 'RISPARMIO -28%' : isDe ? 'ERSPARNIS -28%' : isFr ? 'ÉCONOMIE -28%' : 'SAVE 28%',
                      desc:  isIt ? 'Risparmio immediato del 28% rispetto all\'acquisto di 5 annunci singoli.' : isDe ? 'Sofortige Ersparnis von 28% gegenüber Einzelkauf.' : isFr ? 'Économie immédiate de 28% par rapport à l\'achat individuel.' : 'Immediate 28% saving vs buying 5 single posts.' },
                    { title: isIt ? '12 MESI' : isDe ? '12 MONATE' : isFr ? '12 MOIS' : '12 MONTHS',
                      desc:  isIt ? '12 mesi di tempo per utilizzare le offerte acquistate, senza scadenze rigide.' : isDe ? '12 Monate Zeit zur Nutzung der Anzeigen ohne strenge Fristen.' : isFr ? '12 mois pour utiliser les offres sans échéances rigides.' : '12 months to use your purchased posts, no strict deadlines.' },
                    { title: isIt ? 'ACCESSO DB' : isDe ? 'DB-ZUGRIFF' : isFr ? 'ACCÈS DB' : 'DB ACCESS',
                      desc:  isIt ? 'Accesso immediato ai candidati compatibili già presenti nel database JobCourier.' : isDe ? 'Sofortiger Zugriff auf kompatible Kandidaten in der Datenbank.' : isFr ? 'Accès immédiat aux candidats compatibles déjà dans la base.' : 'Immediate access to compatible candidates in the JobCourier database.' },
                    { title: isIt ? 'AREA RISERVATA' : isDe ? 'DASHBOARD' : isFr ? 'ESPACE RÉSERVÉ' : 'DASHBOARD',
                      desc:  isIt ? 'Area riservata con storico completo delle offerte pubblicate.' : isDe ? 'Reservierter Bereich mit vollständiger Angebotshistorie.' : isFr ? 'Espace réservé avec historique complet des offres publiées.' : 'Reserved area with full history of published job posts.' },
                ],
                tag: isIt ? 'PIÙ ACQUISTATO' : isDe ? 'MEISTGEKAUFT' : isFr ? 'PLUS ACHETÉ' : 'BEST SELLER',
                highlight: true,
                cta: isIt ? 'Acquista' : isDe ? 'Kaufen' : isFr ? 'Acheter' : 'Buy',
            },
            {
                label: isIt ? '03 / CONTINUO' : isDe ? '03 / KONTINUIERLICH' : isFr ? '03 / CONTINU' : '03 / CONTINUOUS',
                name: isIt ? 'PIANO CONTINUO' : isDe ? 'FORTLAUFENDER PLAN' : isFr ? 'PLAN CONTINU' : 'CONTINUOUS PLAN',
                price: isIt ? "da CHF 1'200" : isDe ? "ab CHF 1'200" : isFr ? "dès CHF 1'200" : "from CHF 1,200",
                pricePrefix: isIt ? 'da CHF' : isDe ? 'ab CHF' : isFr ? 'dès CHF' : 'from CHF',
                priceNum: "1'200",
                note: isIt ? '+IVA' : isDe ? '+MwSt.' : isFr ? '+TVA' : '+VAT',
                desc: isIt ? 'Piani flessibili per flussi di ricerca costanti.' : isDe ? 'Flexible Pläne für konstante Suchen.' : isFr ? 'Plans flexibles pour des flux de recherche constants.' : 'Flexible plans for constant search volumes.',
                features: [
                    isIt ? 'Offerte di lavoro online 30gg' : isDe ? 'Stellenanzeigen online 30 Tage' : isFr ? 'Annonces en ligne 30 jours' : 'Job posts online 30 days',
                    isIt ? 'Ricerche illimitate in database' : isDe ? 'Unbegrenzte Datenbanksuchen' : isFr ? 'Recherches illimitées en base de données' : 'Unlimited database searches',
                    isIt ? 'Area aziendale riservata' : isDe ? 'Reservierter Unternehmensbereich' : isFr ? 'Espace entreprise réservé' : 'Reserved company area',
                ],
                vantaggi: [
                    { title: isIt ? 'SU MISURA' : isDe ? 'MASSGESCHNEIDERT' : isFr ? 'SUR MESURE' : 'CUSTOM',
                      desc:  isIt ? 'Offerta personalizzata secondo le esigenze specifiche della tua azienda.' : isDe ? 'Maßgeschneidertes Angebot nach Ihren Bedürfnissen.' : isFr ? 'Offre personnalisée selon vos besoins spécifiques.' : 'Tailor-made offer built around your company\'s needs.' },
                    { title: isIt ? 'ILLIMITATE' : isDe ? 'UNBEGRENZT' : isFr ? 'ILLIMITÉES' : 'UNLIMITED',
                      desc:  isIt ? 'Offerte di lavoro illimitate per 12 mesi con massima flessibilità.' : isDe ? 'Unbegrenzte Stellenanzeigen für 12 Monate.' : isFr ? 'Offres d\'emploi illimitées pendant 12 mois.' : 'Unlimited job posts for 12 months with full flexibility.' },
                    { title: isIt ? 'ACCESSO DB' : isDe ? 'DB-ZUGRIFF' : isFr ? 'ACCÈS DB' : 'DB ACCESS',
                      desc:  isIt ? 'Accesso immediato ai candidati compatibili già presenti nel database JobCourier.' : isDe ? 'Sofortiger Zugriff auf kompatible Kandidaten in der Datenbank.' : isFr ? 'Accès immédiat aux candidats compatibles déjà dans la base.' : 'Immediate access to compatible candidates in the JobCourier database.' },
                    { title: isIt ? 'SUPPORTO' : isDe ? 'SUPPORT' : isFr ? 'SUPPORT' : 'SUPPORT',
                      desc:  isIt ? 'Supporto clienti dedicato in ogni fase del processo di recruiting.' : isDe ? 'Dedizierter Kundensupport in jeder Phase des Recruitings.' : isFr ? 'Support client dédié à chaque étape du recrutement.' : 'Dedicated customer support at every stage of your recruiting.' },
                    { title: isIt ? 'GESTIONE' : isDe ? 'VERWALTUNG' : isFr ? 'GESTION' : 'MANAGEMENT',
                      desc:  isIt ? "Gestione centralizzata di candidature e candidati da un'unica area riservata." : isDe ? 'Zentrale Verwaltung von Bewerbungen aus einem einzigen Bereich.' : isFr ? 'Gestion centralisée des candidatures depuis un espace unique.' : 'Centralized management of applications from one dashboard.' },
                ],
                tag: isIt ? '03 / CONTINUO' : isDe ? '03 / KONTINUIERLICH' : isFr ? '03 / CONTINU' : '03 / CONTINUOUS',
                cta: isIt ? 'Acquista' : isDe ? 'Kaufen' : isFr ? 'Acheter' : 'Buy',
            },
        ],
        agency: {
            title: isIt ? 'Soluzioni per Agenzie di Selezione' : isDe ? 'Lösungen für Personalvermittlungen' : isFr ? 'Solutions pour Agences de Recrutement' : 'Solutions for Recruitment Agencies',
            subtitle: isIt ? 'Flessibilità e potenza di calcolo su volumi massivi.' : isDe ? 'Flexibilität und Leistung bei massivem Volumen.' : isFr ? 'Flexibilité et puissance sur des volumes massifs.' : 'Flexibility and power for massive volumes.',
            desc: isIt ? 'Sblocca il pieno potenziale di JobCourier per la tua agenzia di recruiting con strumenti professionali dedicati e tariffe agevolate sui volumi.' : isDe ? 'Schalten Sie das volle Potenzial von JobCourier für Ihre Personalvermittlung mit dedizierten professionellen Tools frei.' : isFr ? 'Débloquez le plein potentiel de JobCourier pour votre agence avec des outils professionnels dédiés.' : 'Unlock the full potential of JobCourier for your recruitment agency with dedicated professional tools.',
            features: [
                isIt ? 'Integrazione API diretta con il tuo ATS' : isDe ? 'Direkte API-Integration mit Ihrem ATS' : isFr ? 'Intégration API directe avec votre ATS' : 'Direct API integration with your ATS',
                isIt ? 'Multi-posting automatizzato di massa' : isDe ? 'Massen-Multi-Posting automatisiert' : isFr ? 'Multi-diffusion automatisée de masse' : 'Automated mass multi-posting',
                isIt ? 'Accesso illimitato al Database Candidati' : isDe ? 'Unbegrenzter Zugriff auf die Kandidatendatenbank' : isFr ? 'Accès illimité à la base de données candidats' : 'Unlimited Candidate Database access',
                isIt ? 'Account manager dedicato e fatturazione mensile' : isDe ? 'Dedizierter Account Manager & monatliche Abrechnung' : isFr ? 'Gestionnaire de compte dédié et facturation mensuelle' : 'Dedicated account manager and monthly invoicing',
            ],
            cta: isIt ? "Richiedi un'offerta su misura" : isDe ? 'Fordern Sie ein maßgeschneidertes Angebot an' : isFr ? 'Demandez une offre sur mesure' : 'Request a custom offer',
        },
    };
};

const Pricing = () => {
    const containerRef = useRef(null);
    const [activeTab, setActiveTab] = useState('companies');
    const [hoveredPlan, setHoveredPlan] = useState(1);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const { t, i18n } = useTranslation();
    const lang = i18n.language || 'it';
    const data = getLocalizedData(lang);
    const activePlan = data.plans[selectedPlan ?? hoveredPlan];

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.hero-line', { y: 20, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power2.out' });
            gsap.from('.section-reveal', { y: 30, opacity: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.section-trigger', start: 'top 75%' } });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="min-h-screen overflow-x-hidden" style={{ background: GL }}>

            {/* HERO */}
            <section className="relative min-h-[60vh] pt-32 pb-20 px-6 md:px-12 flex flex-col justify-center animate-fade-in" style={{ background: N }}>
                <div className="container mx-auto w-full">
                    <div className="max-w-4xl">
                        <div className="hero-line"><SectionLabel>{t('pricing.subtitle') || 'Soluzioni di Recruitment'}</SectionLabel></div>
                        <p className="hero-line" style={{ fontFamily: editorial, fontStyle: 'italic', fontSize: 24, color: 'rgba(255,255,255,0.4)', marginBottom: 16, lineHeight: 1.2 }}>
                            {data.heroSub}
                        </p>
                        <h1 className="hero-line" style={{
                            fontFamily: brand, fontWeight: 900,
                            fontSize: 'clamp(2rem, 8vw, 4rem)',
                            color: W,
                            textTransform: 'uppercase',
                            letterSpacing: '-0.025em',
                            lineHeight: 0.9,
                            marginBottom: 8
                        }}>{data.heroTitleMain}</h1>
                        <h1 className="hero-line" style={{
                            fontFamily: brand, fontWeight: 900,
                            fontSize: 'clamp(2rem, 8vw, 4rem)',
                            color: F,
                            textTransform: 'uppercase',
                            letterSpacing: '-0.025em',
                            lineHeight: 0.9,
                            marginBottom: 40
                        }}>{data.heroTitleEm}</h1>

                        <div className="hero-line flex flex-row gap-4 w-full max-w-lg">
                            <FuchsiaButton href="https://jobroom.jobcourier.ch/employer/register.php?ignoreRedirectingCookiesAll=1&lan=it&language=it" fullWidth>
                                {t('pricing.cta_register') || 'REGISTRATI GRATIS'} →
                            </FuchsiaButton>
                            <FuchsiaOutlineButton href="#soluzioni" fullWidth>
                                {t('pricing.cta_discover') || 'SCOPRI I PIANI'} →
                            </FuchsiaOutlineButton>
                        </div>
                    </div>
                </div>
            </section>

            {/* TAB CONTROL */}
            <div id="soluzioni" className="sticky top-0 z-40 py-4 px-6" style={{ background: W, borderBottom: '1px solid rgba(5,11,43,0.07)' }}>
                <div className="max-w-6xl mx-auto flex" style={{ border: `1.5px solid rgba(5,11,43,0.1)`, width: 'fit-content' }}>
                    {[
                        ['companies', data.tabs.companies],
                        ['agencies', data.tabs.agencies]
                    ].map(([key, label], i) => (
                        <button key={key} onClick={() => setActiveTab(key)} style={{
                            background: activeTab === key ? N : 'transparent',
                            color: activeTab === key ? W : GM,
                            border: 'none',
                            padding: '12px 28px',
                            fontFamily: brand, fontWeight: 700, fontSize: 10,
                            letterSpacing: '0.14em', textTransform: 'uppercase',
                            cursor: 'pointer',
                            borderRight: i === 0 ? '1.5px solid rgba(5,11,43,0.1)' : 'none'
                        }} className="transition-all duration-200">
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* PRICING CONTENT */}
            <section className="py-20 px-6 md:px-12 container mx-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'companies' ? (
                        <motion.div
                            key="companies"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.35 }}
                            className="space-y-16"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
                                {/* PRICING CARDS */}
                                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {data.plans.map((plan, pIdx) => (
                                        <motion.div key={pIdx}
                                            className="group relative flex flex-col min-w-0 cursor-pointer"
                                            onMouseEnter={() => setHoveredPlan(pIdx)}
                                            onMouseLeave={() => setHoveredPlan(selectedPlan ?? 1)}
                                            onClick={() => { setSelectedPlan(pIdx); setHoveredPlan(pIdx); }}
                                            whileTap={{ scale: 0.97 }}
                                            animate={{
                                                boxShadow: selectedPlan === pIdx
                                                    ? '0 0 0 2px #FF1F7A, 0 12px 32px rgba(255,31,122,0.12)'
                                                    : '0 0 0 0px transparent',
                                            }}
                                            transition={{ duration: 0.25, ease: 'easeOut' }}
                                            style={{
                                                background: W,
                                                padding: '36px 28px',
                                                border: '1px solid rgba(5,11,43,0.06)',
                                                borderRadius: 0,
                                            }}>
                                            {plan.tag && (
                                                <span style={{
                                                    position: 'absolute', top: 20, right: 24,
                                                    fontFamily: brand, fontWeight: 700, fontSize: 9,
                                                    letterSpacing: '0.18em', textTransform: 'uppercase',
                                                    color: F,
                                                    background: 'transparent'
                                                }}>■ {plan.tag}</span>
                                            )}
                                            {selectedPlan === pIdx && (
                                                <motion.span
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    style={{
                                                        position: 'absolute', top: 20, left: 24,
                                                        fontFamily: brand, fontWeight: 700, fontSize: 8,
                                                        letterSpacing: '0.18em', textTransform: 'uppercase',
                                                        color: W, background: F,
                                                        padding: '3px 8px',
                                                    }}>
                                                    ✓ SELEZIONATO
                                                </motion.span>
                                            )}

                                            <div className="mb-6">
                                                <p style={{ fontFamily: brand, fontWeight: 700, fontSize: 10, color: GM, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>
                                                    {plan.label}
                                                </p>
                                                <h3 style={{ fontFamily: brand, fontWeight: 900, fontSize: 22, color: N, textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: 4, lineHeight: 1.1 }}>
                                                    {plan.name}
                                                </h3>
                                                <div style={{ minHeight: 22, marginBottom: 8 }}>
                                                    {plan.subname && (
                                                        <p style={{ fontFamily: brand, fontWeight: 700, fontSize: 11, color: F, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                                            {plan.subname}
                                                        </p>
                                                    )}
                                                </div>
                                                <p style={{ fontFamily: body, fontSize: 12, color: GM, lineHeight: 1.5, minHeight: '36px' }}>{plan.desc}</p>
                                            </div>

                                            <div className="mb-6">
                                                <div style={{ marginBottom: 6, minHeight: 22 }}>
                                                    {plan.oldPrice && (
                                                        <span style={{ fontFamily: body, fontSize: 13, color: GM, textDecoration: 'line-through' }}>{plan.oldPrice}</span>
                                                    )}
                                                </div>
                                                <div style={{ lineHeight: 1 }}>
                                                    <div style={{ fontFamily: brand, fontWeight: 700, fontSize: 12, color: GM, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                                                        {plan.pricePrefix}
                                                    </div>
                                                    <div style={{ fontFamily: brand, fontWeight: 900, fontSize: 48, color: plan.highlight ? F : N, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 6 }}>
                                                        {plan.priceNum}
                                                    </div>
                                                    <div style={{ fontFamily: body, fontSize: 12, color: GM }}>
                                                        {plan.note}
                                                    </div>
                                                </div>
                                            </div>

                                            <ul className="space-y-3 mb-8 flex-grow">
                                                {plan.features.map((f, fIdx) => (
                                                    <li key={fIdx} className="flex items-start gap-3" style={{ fontFamily: body, fontSize: 12, color: N, lineHeight: 1.4 }}>
                                                        <span style={{ width: 8, height: 8, background: F, marginTop: 4, flexShrink: 0, display: 'inline-block' }} />
                                                        <span>{f}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            {plan.highlight ? (
                                                <FuchsiaButton href="/contatti" fullWidth>{plan.cta} →</FuchsiaButton>
                                            ) : (
                                                <OutlineButton href="/contatti" fullWidth>{plan.cta} →</OutlineButton>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>

                                {/* SIDEBAR VANTAGGI — navy, numerata, stagger on click */}
                                <div className="lg:col-span-2 p-8" style={{ background: N, borderLeft: `4px solid ${F}` }}>
                                    <div className="mb-8">
                                        <SectionLabel>{data.sidebar.subtitle}</SectionLabel>
                                        <h3 style={{ fontFamily: brand, fontWeight: 900, fontSize: 22, color: W, textTransform: 'uppercase', letterSpacing: '-0.025em', lineHeight: 1 }}>
                                            {data.sidebar.title}
                                        </h3>
                                        <p style={{ fontFamily: body, fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                            {activePlan.label}
                                        </p>
                                    </div>
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={selectedPlan ?? hoveredPlan}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0, transition: { duration: 0.12 } }}
                                            transition={{ duration: 0.12 }}
                                        >
                                            {activePlan.vantaggi.map((item, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, y: 16 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94], delay: index * 0.06 }}
                                                >
                                                    <span style={{ fontFamily: brand, fontWeight: 700, fontSize: 9, color: F, letterSpacing: '0.18em', display: 'block', marginBottom: 4 }}>
                                                        {String(index + 1).padStart(2, '0')}
                                                    </span>
                                                    <p style={{ fontFamily: brand, fontWeight: 900, fontSize: 13, color: W, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                                                        {item.title}
                                                    </p>
                                                    <p style={{ fontFamily: body, fontSize: 11, color: 'rgba(255,255,255,0.60)', lineHeight: 1.6 }}>
                                                        {item.desc}
                                                    </p>
                                                    {index < activePlan.vantaggi.length - 1 && (
                                                        <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '16px 0' }} />
                                                    )}
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="agencies"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.35 }}
                            className="max-w-4xl mx-auto"
                        >
                            <div className="p-10 md:p-14 relative flex flex-col md:flex-row gap-10 items-stretch"
                                style={{
                                    background: W,
                                    border: `2px solid rgba(5,11,43,0.06)`,
                                    boxShadow: '0 15px 40px rgba(5, 11, 43, 0.03)'
                                }}>

                                <div className="flex-grow space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 flex items-center justify-center text-white" style={{ background: F }}>
                                            <Lock size={18} />
                                        </div>
                                        <div>
                                            <span style={{ fontFamily: brand, fontWeight: 700, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: F }}>
                                                PARTNER PROGRAM
                                            </span>
                                            <h3 style={{ fontFamily: brand, fontWeight: 900, fontSize: 32, color: N, textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1 }}>
                                                {data.agency.title}
                                            </h3>
                                        </div>
                                    </div>

                                    <p style={{ fontFamily: editorial, fontStyle: 'italic', fontSize: 18, color: GM }}>
                                        {data.agency.subtitle}
                                    </p>

                                    <p style={{ fontFamily: body, fontSize: 13, color: GM, lineHeight: 1.6 }}>
                                        {data.agency.desc}
                                    </p>

                                    <ul className="space-y-4 pt-4">
                                        {data.agency.features.map((feat, fIdx) => (
                                            <li key={fIdx} className="flex items-start gap-3" style={{ fontFamily: body, fontSize: 13, color: N }}>
                                                <span style={{ width: 8, height: 8, background: F, marginTop: 4, flexShrink: 0, display: 'inline-block' }} />
                                                <span>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="flex flex-col justify-between items-center md:items-stretch md:w-[260px] p-8 text-center"
                                    style={{ background: GL, borderLeft: '1px solid rgba(5,11,43,0.06)' }}>
                                    <div className="space-y-4 my-auto">
                                        <Lock size={32} className="mx-auto text-slate-300" />
                                        <h4 style={{ fontFamily: brand, fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: N }}>
                                            Accordo Commerciale
                                        </h4>
                                        <p style={{ fontFamily: body, fontSize: 11, color: GM, lineHeight: 1.4 }}>
                                            Sblocca la pubblicazione automatica massiva integrata con i tuoi sistemi proprietari.
                                        </p>
                                    </div>
                                    <FuchsiaButton href="/contatti" fullWidth>
                                        {data.agency.cta} →
                                    </FuchsiaButton>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* CTA */}
            <section className="py-24 px-6 md:px-12" style={{ background: N }}>
                <div className="container mx-auto max-w-4xl">
                    <div className="section-reveal">
                        <SectionLabel>{t('pricing.cta_title') || 'Domande?'}</SectionLabel>
                        <h2 style={{
                            fontFamily: brand, fontWeight: 900, fontSize: 56,
                            color: W, textTransform: 'uppercase',
                            letterSpacing: '-0.025em', lineHeight: 0.9, marginBottom: 12
                        }}>{t('pricing.cta_em') || 'Parliamone.'}</h2>
                        <p style={{
                            fontFamily: editorial, fontStyle: 'italic', fontSize: 22,
                            color: 'rgba(255,255,255,0.5)', lineHeight: 1.4,
                            maxWidth: 580, marginBottom: 40
                        }}>
                            {t('pricing.cta_sub') || 'Ascolteremo i tuoi bisogni di reclutamento e offriremo la soluzione più adeguata.'}
                        </p>
                        <FuchsiaButton href="/contatti">{t('pricing.cta_btn') || 'CONTATTACI'} →</FuchsiaButton>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Pricing;
