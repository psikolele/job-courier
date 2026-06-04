import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, ArrowRight, MessageSquare, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
    HoverSlider,
    HoverSliderImage,
    HoverSliderImageWrap,
    TextStaggerHover,
    SlideDescription,
} from '@/components/ui/animated-slideshow';

gsap.registerPlugin(ScrollTrigger);

const N = 'var(--brand-navy)';
const F = 'var(--brand-fuchsia)';
const GL = 'var(--brand-gray-light)';
const GM = 'var(--brand-gray-mid)';
const W = 'var(--brand-white)';
const brand = 'var(--font-brand)';
const editorial = 'var(--font-editorial)';
const body = 'var(--font-body)';

const PROCESSO_SLIDES = [
    { id: 'slide-1', title: 'Soluzioni Veloci', subtitle: 'SOLUZIONI. VELOCI.', desc: 'Assumi più velocemente grazie alle nostre soluzioni di reclutamento. La visibilità del nostro portale e l\'ampio database di candidati ti permettono di trovare rapidamente i candidati più qualificati per le tue posizioni aperte.', imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop' },
    { id: 'slide-2', title: 'Recruiting Semplificato', subtitle: 'RECRUITING SEMPLIFICATO', desc: 'JobCourier ti offre una piattaforma intuitiva e facile da usare, che ti permette di gestire tutte le fasi del tuo processo di recruiting da un unico punto di accesso.', imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1200&auto=format&fit=crop' },
    { id: 'slide-3', title: 'Più Efficienza, Meno Costi', subtitle: 'PIÙ EFFICIENZA, MENO COSTI', desc: 'Massimizza il tuo tempo. JobCourier trova i candidati giusti per te. Il nostro sistema di matching avanzato ti permette di identificare rapidamente i candidati che possiedono le competenze e le esperienze richieste per il tuo ruolo.', imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1200&auto=format&fit=crop' },
    { id: 'slide-4', title: 'Soluzioni Personalizzate', subtitle: 'SOLUZIONI PERSONALIZZATE', desc: 'Recluta con sicurezza grazie a un partner affidabile e strategico. Il nostro team di esperti è sempre a tua disposizione per offrirti assistenza e supporto personalizzato e studiare insieme strategie di recruiting efficaci.', imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop' },
];

const SectionLabel = ({ children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ width: 28, height: 2, background: F, display: 'inline-block' }} />
        <span style={{ fontFamily: brand, fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: F }}>{children}</span>
    </div>
);

const NavyButton = ({ href, onClick, children, fullWidth = false }) => (
    <a href={href} onClick={onClick} className="inline-flex items-center justify-center gap-2 transition-all hover:opacity-85 hover:scale-[1.02] hover-lift"
        style={{
            background: N, color: W, border: 'none',
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

const getLocalizedData = (lang) => {
    const isIt = lang === 'it';
    const isDe = lang === 'de';
    const isFr = lang === 'fr';
    
    return {
        tabs: {
            companies: isIt ? 'Aziende & PMI' : isDe ? 'Unternehmen & KMU' : isFr ? 'Entreprises & PME' : 'Companies & SMEs',
            agencies: isIt ? 'Agenzie di selezione' : isDe ? 'Personalvermittlungen' : isFr ? 'Agences de Recrutement' : 'Recruitment Agencies',
        },
        sidebar: {
            title: isIt ? 'Vantaggi JobCourier' : isDe ? 'JobCourier Vorteile' : isFr ? 'Avantages JobCourier' : 'JobCourier Benefits',
            subtitle: isIt ? 'Perché sceglierci' : isDe ? 'Warum uns wählen' : isFr ? 'Pourquoi nous choisir' : 'Why choose us',
            items: [
                {
                    title: isIt ? "120'000+ Candidati" : isDe ? "120'000+ Kandidaten" : isFr ? "120'000+ Candidats" : "120,000+ Candidates",
                    desc: isIt ? "Accedi a uno dei più grandi database di candidati attivi in Svizzera." : isDe ? "Zugriff auf eine der größten Datenbanken aktiver Kandidaten in der Schweiz." : isFr ? "Accédez à l'une des plus grandes bases de données de candidats actifs en Suisse." : "Access one of the largest databases of active candidates in Switzerland."
                },
                {
                    title: isIt ? "Matching Avanzato" : isDe ? "Erweitertes Matching" : isFr ? "Matching Avancé" : "Advanced Matching",
                    desc: isIt ? "Il nostro algoritmo ti mostra subito i candidati compatibili con le tue ricerche." : isDe ? "Unser Algorithmus zeigt Ihnen sofort kompatible Kandidaten für Ihre Suchen." : isFr ? "Notre algorithme vous montre immédiatement les candidats compatibles avec vos recherches." : "Our algorithm immediately shows you candidates compatible with your searches."
                },
                {
                    title: isIt ? "Presenza Locale" : isDe ? "Lokale Präsenz" : isFr ? "Présence Locale" : "Local Presence",
                    desc: isIt ? "Supporto dedicato in Ticino e copertura nazionale svizzera." : isDe ? "Engagierter Support im Tessin und nationale Abdeckung in der Schweiz." : isFr ? "Support dédié au Tessin et couverture nationale suisse." : "Dedicated support in Ticino and Swiss national coverage."
                },
                {
                    title: isIt ? "Semplicità d'uso" : isDe ? "Einfache Bedienung" : isFr ? "Simplicité d'utilisation" : "Ease of Use",
                    desc: isIt ? "Pubblica in 2 minuti e ricevi candidature profilate direttamente nella tua area riservata." : isDe ? "Veröffentlichen Sie in 2 Minuten und erhalten Sie profilierte Bewerbungen direkt in Ihrem Bereich." : isFr ? "Publiez en 2 minutes et recevez des candidatures profilées directement dans votre espace." : "Post in 2 minutes and receive profiled applications directly in your dashboard."
                }
            ]
        },
        plans: [
            {
                name: "Job Post Basic",
                price: "CHF 249",
                note: isIt ? "+IVA" : isDe ? "+MwSt." : isFr ? "+TVA" : "+VAT",
                desc: isIt ? "Per assunzioni sporadiche e ricerca mirata." : isDe ? "Für sporadische Einstellungen und gezielte Suche." : isFr ? "Pour recrutements sporadiques et recherche ciblée." : "For sporadic hiring and targeted search.",
                features: [
                    isIt ? "1 Annuncio online per 30 giorni" : isDe ? "1 Stellenanzeige online für 30 Tage" : isFr ? "1 annonce en ligne pendant 30 jours" : "1 Job post online for 30 days",
                    isIt ? "Ricerche illimitate nel DB" : isDe ? "Unbegrenzte Suchen in der Datenbank" : isFr ? "Recherches illimitées dans la base de données" : "Unlimited candidate DB searches",
                    isIt ? "Supporto clienti via email" : isDe ? "Kundensupport per E-Mail" : isFr ? "Support client par e-mail" : "Email customer support"
                ],
                tag: isIt ? "Agile" : "Agile",
                cta: isIt ? "Acquista" : isDe ? "Kaufen" : isFr ? "Acheter" : "Buy"
            },
            {
                name: "Pack 5 Boost",
                price: "CHF 890",
                oldPrice: "CHF 1'245",
                note: isIt ? "+IVA" : isDe ? "+MwSt." : isFr ? "+TVA" : "+VAT",
                desc: isIt ? "Massima visibilità con annunci in vetrina." : isDe ? "Maximale Sichtbarkeit mit Premium-Anzeigen." : isFr ? "Visibilité maximale avec annonces en vitrine." : "Maximum visibility with showcased job posts.",
                features: [
                    isIt ? "5 Annunci in vetrina per 30 giorni" : isDe ? "5 Premium-Stellenanzeigen für 30 Tage" : isFr ? "5 annonces en vitrine pendant 30 jours" : "5 Showcased job posts for 30 days",
                    isIt ? "Risparmio immediato del 28%" : isDe ? "Sofortige Ersparnis von 28%" : isFr ? "Économie immédiate de 28%" : "Immediate 28% savings",
                    isIt ? "5 Sblocchi profili CV Premium" : isDe ? "5 Premium-CV sichten" : isFr ? "5 déblocages de profils CV Premium" : "5 Premium CV unlocks",
                    isIt ? "Highlighting grafico prioritario" : isDe ? "Priorisierte grafische Hervorhebung" : isFr ? "Mise en valeur graphique prioritaire" : "Priority graphic highlighting"
                ],
                tag: isIt ? "Risparmio -28%" : isDe ? "Sparen -28%" : isFr ? "Économie -28%" : "Save 28%",
                highlight: true,
                cta: isIt ? "Acquista" : isDe ? "Kaufen" : isFr ? "Acheter" : "Buy"
            },
            {
                name: isIt ? "Piano Continuo" : isDe ? "Fortlaufender Plan" : isFr ? "Plan Continu" : "Continuous Plan",
                price: isIt ? "da CHF 1'200" : isDe ? "ab CHF 1'200" : isFr ? "dès CHF 1'200" : "from CHF 1,200",
                note: isIt ? "/ mese + IVA" : isDe ? "/ Monat + MwSt." : isFr ? "/ mois + TVA" : "/ month + VAT",
                desc: isIt ? "Piani flessibili per flussi di ricerca costanti." : isDe ? "Flexible Pläne für konstante Suchen." : isFr ? "Plans flexibles pour des flux de recherche constants." : "Flexible plans for constant search volumes.",
                features: [
                    isIt ? "Annunci illimitati in vetrina" : isDe ? "Unbegrenzte Premium-Anzeigen" : isFr ? "Annonces illimitées en vitrine" : "Unlimited showcased job posts",
                    isIt ? "Fino a 1'000 sblocchi CV mensili" : isDe ? "Bis zu 1'000 CV-Freischaltungen/Monat" : isFr ? "Jusqu'à 1'000 déblocages de CV par mois" : "Up to 1,000 monthly CV unlocks",
                    isIt ? "Data matching automatizzato" : isDe ? "Automatisiertes Daten-Matching" : isFr ? "Matching de données automatisé" : "Automated data matching",
                    isIt ? "Account manager dedicato" : isDe ? "Dedizierter Account Manager" : isFr ? "Gestionnaire de compte dédié" : "Dedicated account manager"
                ],
                tag: isIt ? "Abbonamento" : isDe ? "Abonnement" : isFr ? "Abonnement" : "Subscription",
                cta: isIt ? "Acquista" : isDe ? "Kaufen" : isFr ? "Acheter" : "Buy"
            }
        ],
        agency: {
            title: isIt ? "Soluzioni per Agenzie di Selezione" : isDe ? "Lösungen für Personalvermittlungen" : isFr ? "Solutions pour Agences de Recrutement" : "Solutions for Recruitment Agencies",
            subtitle: isIt ? "Flessibilità e potenza di calcolo su volumi massivi." : isDe ? "Flexibilität und Leistung bei massivem Volumen." : isFr ? "Flexibilité et puissance sur des volumes massifs." : "Flexibility and power for massive volumes.",
            desc: isIt ? "Sblocca il pieno potenziale di JobCourier per la tua agenzia di recruiting con strumenti professionali dedicati e tariffe agevolate sui volumi." : isDe ? "Schalten Sie das volle Potenzial von JobCourier für Ihre Personalvermittlung mit dedizierten professionellen Tools frei." : isFr ? "Débloquez le plein potentiel de JobCourier pour votre agence avec des outils professionnels dédiés." : "Unlock the full potential of JobCourier for your recruitment agency with dedicated professional tools.",
            features: [
                isIt ? "Integrazione API diretta con il tuo ATS" : isDe ? "Direkte API-Integration mit Ihrem ATS" : isFr ? "Intégration API directe avec votre ATS" : "Direct API integration with your ATS",
                isIt ? "Multi-posting automatizzato di massa" : isDe ? "Massen-Multi-Posting automatisiert" : isFr ? "Multi-diffusion automatisée de masse" : "Automated mass multi-posting",
                isIt ? "Accesso illimitato al Database Candidati" : isDe ? "Unbegrenzter Zugriff auf die Kandidatendatenbank" : isFr ? "Accès illimité à la base de données candidats" : "Unlimited Candidate Database access",
                isIt ? "Account manager dedicato e fatturazione mensile" : isDe ? "Dedizierter Account Manager & monatliche Abrechnung" : isFr ? "Gestionnaire de compte dédié et facturation mensuelle" : "Dedicated account manager and monthly invoicing"
            ],
            cta: isIt ? "Richiedi un'offerta su misura" : isDe ? "Fordern Sie ein maßgeschneidertes Angebot an" : isFr ? "Demandez une offre sur mesure" : "Request a custom offer"
        }
    };
};

const Pricing = () => {
    const containerRef = useRef(null);
    const [activeTab, setActiveTab] = useState('companies');
    const { t, i18n } = useTranslation();
    const lang = i18n.language || 'it';
    const data = getLocalizedData(lang);

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
                            {t('pricing.hero_sub') || 'Ottimizziamo il tuo tempo e acceleriamo il recruiting con soluzioni basate su visibilità, database e matching avanzato.'}
                        </p>
                        <h1 className="hero-line" style={{
                            fontFamily: brand, fontWeight: 900,
                            fontSize: 'clamp(2rem, 8vw, 4rem)',
                            color: W,
                            textTransform: 'uppercase',
                            letterSpacing: '-0.025em',
                            lineHeight: 0.9,
                            marginBottom: 8
                        }}>{t('pricing.hero_title') || 'Cerchi candidati?'}</h1>
                        <h1 className="hero-line" style={{
                            fontFamily: brand, fontWeight: 900,
                            fontSize: 'clamp(2rem, 8vw, 4rem)',
                            color: F,
                            textTransform: 'uppercase',
                            letterSpacing: '-0.025em',
                            lineHeight: 0.9,
                            marginBottom: 40
                        }}>{t('pricing.hero_em') || 'Noi li troviamo.'}</h1>

                        <div className="hero-line flex flex-col sm:flex-row items-start gap-4">
                            <FuchsiaButton href="https://jobroom.jobcourier.ch/employer/register.php?ignoreRedirectingCookiesAll=1&lan=it&language=it" fullWidth>
                                {t('pricing.cta_register') || 'REGISTRATI GRATIS'} →
                            </FuchsiaButton>
                            <a href="#soluzioni" style={{
                                fontFamily: brand, fontWeight: 700, fontSize: 11,
                                letterSpacing: '0.14em', textTransform: 'uppercase',
                                color: 'rgba(255,255,255,0.6)',
                                padding: '14px 0',
                                textDecoration: 'none'
                            }} className="hover:opacity-100 transition-opacity">
                                {t('pricing.cta_discover') || 'Scopri i piani'} →
                            </a>
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
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
                                {/* PRICING CARDS - COVERS 3 COLS ON LG */}
                                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {data.plans.map((plan, pIdx) => (
                                        <div key={pIdx} className="group relative transition-all duration-300 flex flex-col min-w-0"
                                            style={{
                                                background: W,
                                                padding: '44px 32px',
                                                border: plan.highlight ? `2px solid ${F}` : '1px solid rgba(5,11,43,0.06)',
                                                borderRadius: 0,
                                                boxShadow: plan.highlight ? '0 12px 40px rgba(255, 31, 122, 0.08)' : 'none'
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

                                            <div className="mb-6">
                                                <h3 style={{ fontFamily: brand, fontWeight: 900, fontSize: 24, color: N, textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: 8 }}>{plan.name}</h3>
                                                <p style={{ fontFamily: body, fontSize: 13, color: GM, lineHeight: 1.5, minHeight: '40px' }}>{plan.desc}</p>
                                            </div>

                                            <div className="mb-8">
                                                {plan.oldPrice && (
                                                    <span style={{ fontFamily: body, fontSize: 14, color: GM, textDecoration: 'line-through', marginRight: 10 }}>{plan.oldPrice}</span>
                                                )}
                                                <span style={{ fontFamily: brand, fontWeight: 900, fontSize: 38, color: plan.highlight ? F : N, letterSpacing: '-0.02em' }}>{plan.price}</span>
                                                <span style={{ fontFamily: body, fontSize: 12, color: GM, marginLeft: 6 }}>{plan.note}</span>
                                            </div>

                                            <ul className="space-y-4 mb-10 flex-grow">
                                                {plan.features.map((f, fIdx) => (
                                                    <li key={fIdx} className="flex items-start gap-3" style={{ fontFamily: body, fontSize: 13, color: N }}>
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
                                        </div>
                                    ))}
                                </div>

                                {/* SIDEBAR VANTAGGI - 1 COL ON LG */}
                                <div className="lg:col-span-1 p-8" style={{ background: W, border: '1px solid rgba(5,11,43,0.06)' }}>
                                    <div className="mb-8">
                                        <SectionLabel>{data.sidebar.subtitle}</SectionLabel>
                                        <h3 style={{ fontFamily: brand, fontWeight: 900, fontSize: 26, color: N, textTransform: 'uppercase', letterSpacing: '-0.025em', lineHeight: 1 }}>
                                            {data.sidebar.title}
                                        </h3>
                                    </div>
                                    <div className="space-y-8">
                                        {data.sidebar.items.map((item, idx) => (
                                            <div key={idx} className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span style={{ width: 6, height: 6, background: F, display: 'inline-block' }} />
                                                    <h4 style={{ fontFamily: brand, fontWeight: 700, fontSize: 13, color: N, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        {item.title}
                                                    </h4>
                                                </div>
                                                <p style={{ fontFamily: body, fontSize: 12, color: GM, lineHeight: 1.5 }}>
                                                    {item.desc}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
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

            {/* PROCESSO */}
            <section className="py-24 px-6 md:px-12 section-trigger overflow-hidden" style={{ background: W }}>
                <div className="container mx-auto">
                    <div className="section-reveal mb-16 max-w-2xl">
                        <SectionLabel>{t('pricing.processo_label') || '/ Processo'}</SectionLabel>
                        <h3 style={{
                            fontFamily: brand, fontWeight: 900, fontSize: 56,
                            color: N, textTransform: 'uppercase',
                            letterSpacing: '-0.025em', lineHeight: 0.9
                        }}>{t('pricing.processo_title') || 'Chirurgico.'}</h3>
                        <p style={{
                            fontFamily: editorial, fontStyle: 'italic', fontSize: 28,
                            color: GM, marginTop: 8, lineHeight: 1.3
                        }}>{t('pricing.processo_sub') || 'Pochi click. Tempo liberato.'}</p>
                    </div>

                    <HoverSlider className="w-full">
                        <div className="flex flex-col lg:flex-row items-stretch gap-10 lg:gap-16">
                            <div className="flex flex-col justify-center lg:w-[45%]">
                                {PROCESSO_SLIDES.map((slide, index) => (
                                    <div key={slide.id}>
                                        <TextStaggerHover
                                            index={index}
                                            text={slide.title}
                                            className="cursor-pointer block whitespace-nowrap overflow-hidden py-4"
                                            style={{
                                                fontFamily: brand, fontWeight: 900,
                                                fontSize: 28,
                                                color: N,
                                                textTransform: 'uppercase',
                                                letterSpacing: '-0.02em'
                                            }}
                                        />
                                        <div style={{ height: 1, width: '100%', background: 'rgba(5,11,43,0.07)' }} />
                                    </div>
                                ))}
                            </div>

                            <div className="lg:w-[55%] w-full">
                                <div className="relative overflow-hidden" style={{ height: 460, border: '1px solid rgba(5,11,43,0.07)' }}>
                                    <HoverSliderImageWrap className="absolute inset-0">
                                        {PROCESSO_SLIDES.map((slide, index) => (
                                            <div key={slide.id}>
                                                <HoverSliderImage
                                                    index={index}
                                                    imageUrl={slide.imageUrl}
                                                    src={slide.imageUrl}
                                                    alt={slide.title}
                                                    className="w-full h-full object-cover"
                                                    loading="eager"
                                                    decoding="async"
                                                />
                                            </div>
                                        ))}
                                    </HoverSliderImageWrap>

                                    <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(5,11,43,0.95) 0%, rgba(5,11,43,0.7) 50%, transparent 100%)' }} />

                                    <div className="absolute bottom-0 left-0 right-0 p-10 pt-24">
                                        <SlideDescription slides={PROCESSO_SLIDES} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </HoverSlider>
                </div>
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
