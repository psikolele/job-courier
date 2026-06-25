import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SectionLabel from '../components/ui/SectionLabel.jsx';

gsap.registerPlugin(ScrollTrigger);

const N = 'var(--brand-navy)';
const F = 'var(--brand-fuchsia)';
const GL = 'var(--brand-gray-light)';
const GM = 'var(--brand-gray-mid)';
const W = 'var(--brand-white)';
const brand = 'var(--font-brand)';
const editorial = 'var(--font-editorial)';
const body = 'var(--font-body)';

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
    <a href={href} onClick={onClick} className="jc-glow-btn-light inline-flex items-center justify-center gap-2"
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
        heroTitleMain: isIt ? 'UNA SOLUZIONE PER' : isDe ? 'EINE LÖSUNG FÜR' : isFr ? 'UNE SOLUTION POUR' : 'A SOLUTION FOR',
        heroTitleLine2: isIt ? 'OGNI ' : isDe ? 'JEDEN ' : isFr ? 'CHAQUE ' : 'EVERY ',
        heroTitleEm: isIt ? 'ESIGENZA.' : isDe ? 'BEDARF.' : isFr ? 'BESOIN.' : 'NEED.',
        heroSub: isIt ? 'Per una singola assunzione o per una ricerca continua di personale.' : isDe ? 'Für eine einzelne Einstellung oder eine kontinuierliche Personalsuche.' : isFr ? 'Pour un recrutement ponctuel ou une recherche continue de personnel.' : 'For a single hire or continuous staffing needs.',
        heroCta: isIt ? 'REGISTRA AZIENDA' : isDe ? 'UNTERNEHMEN REGISTRIEREN' : isFr ? 'ENREGISTRER ENTREPRISE' : 'REGISTER COMPANY',
        tabs: {
            companies: isIt ? 'Aziende & PMI' : isDe ? 'Unternehmen & KMU' : isFr ? 'Entreprises & PME' : 'Companies & SMEs',
            agencies: isIt ? 'Agenzie e Recruiter' : isDe ? 'Agenturen & Recruiter' : isFr ? 'Agences et Recruteurs' : 'Agencies & Recruiters',
        },
        sidebar: {
            title: isIt ? 'Perché sceglierlo' : isDe ? 'Warum wählen' : isFr ? 'Pourquoi le choisir' : 'Why choose it',
            subtitle: isIt ? 'Vantaggi' : isDe ? 'Vorteile' : isFr ? 'Avantages' : 'Benefits',
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
                desc: isIt ? 'La soluzione ideale per assunzioni occasionali.' : isDe ? 'Die ideale Lösung für gelegentliche Einstellungen.' : isFr ? 'La solution idéale pour des recrutements occasionnels.' : 'The ideal solution for occasional hiring.',
                features: [
                    isIt ? 'Pubblicazione annuncio 30 giorni' : isDe ? 'Stellenanzeige 30 Tage online' : isFr ? 'Publication annonce 30 jours' : 'Job post online 30 days',
                    isIt ? 'Accesso ai candidati compatibili già presenti nel database' : isDe ? 'Zugriff auf kompatible Kandidaten in der Datenbank' : isFr ? 'Accès aux candidats compatibles dans la base de données' : 'Access to compatible candidates in the database',
                    isIt ? 'Gestione candidature' : isDe ? 'Bewerbungsmanagement' : isFr ? 'Gestion des candidatures' : 'Application management',
                    isIt ? 'Area aziendale riservata' : isDe ? 'Reservierter Unternehmensbereich' : isFr ? 'Espace entreprise réservé' : 'Reserved company area',
                ],
                vantaggi: [
                    { title: isIt ? 'VISIBILITÀ IMMEDIATA' : isDe ? 'SOFORTIGE SICHTBARKEIT' : isFr ? 'VISIBILITÉ IMMÉDIATE' : 'IMMEDIATE VISIBILITY',
                      desc:  isIt ? 'Massima visibilità sul network JobCourier.' : isDe ? 'Maximale Sichtbarkeit im JobCourier-Netzwerk.' : isFr ? 'Visibilité maximale sur le réseau JobCourier.' : 'Maximum visibility on the JobCourier network.' },
                    { title: isIt ? 'CANDIDATI GIÀ DISPONIBILI' : isDe ? 'BEREITS VERFÜGBARE KANDIDATEN' : isFr ? 'CANDIDATS DÉJÀ DISPONIBLES' : 'CANDIDATES ALREADY AVAILABLE',
                      desc:  isIt ? 'Non partire da zero: visualizza subito i candidati compatibili già presenti nel database JobCourier.' : isDe ? 'Starten Sie nicht bei Null: sehen Sie sofort kompatible Kandidaten in der JobCourier-Datenbank.' : isFr ? 'Ne partez pas de zéro : consultez immédiatement les candidats compatibles dans la base JobCourier.' : 'Don\'t start from scratch: view compatible candidates already in the JobCourier database.' },
                    { title: isIt ? 'GESTIONE CENTRALIZZATA' : isDe ? 'ZENTRALISIERTE VERWALTUNG' : isFr ? 'GESTION CENTRALISÉE' : 'CENTRALIZED MANAGEMENT',
                      desc:  isIt ? "Candidature e candidati in un'unica area riservata." : isDe ? 'Bewerbungen und Kandidaten in einem einzigen reservierten Bereich.' : isFr ? 'Candidatures et candidats dans un seul espace réservé.' : 'Applications and candidates in one reserved area.' },
                ],
                tag: isIt ? '01 / OCCASIONALE' : isDe ? '01 / GELEGENTLICH' : isFr ? '01 / OCCASIONNEL' : '01 / OCCASIONAL',
                cta: isIt ? 'Contattaci' : isDe ? 'Kontakt' : isFr ? 'Contactez-nous' : 'Contact us',
            },
            {
                label: isIt ? '02 / VOLUME' : isDe ? '02 / VOLUMEN' : isFr ? '02 / VOLUME' : '02 / VOLUME',
                name: isIt ? 'PACCHETTO 5 ANNUNCI' : isDe ? 'PAKET 5 ANZEIGEN' : isFr ? 'PACK 5 ANNONCES' : 'PACK 5 POSTS',
                price: 'CHF 890',
                pricePrefix: 'CHF',
                priceNum: '890',
                note: isIt ? '+IVA' : isDe ? '+MwSt.' : isFr ? '+TVA' : '+VAT',
                desc: isIt ? 'La soluzione ideale per aziende che assumono più volte durante l\'anno.' : isDe ? 'Die ideale Lösung für Unternehmen, die mehrmals im Jahr einstellen.' : isFr ? 'La solution idéale pour les entreprises qui recrutent plusieurs fois par an.' : 'The ideal solution for companies hiring multiple times a year.',
                features: [
                    isIt ? '5 offerte di lavoro online 30 giorni' : isDe ? '5 Stellenanzeigen online 30 Tage' : isFr ? '5 annonces en ligne 30 jours' : '5 job posts online 30 days',
                    isIt ? 'Accesso ai candidati compatibili già presenti nel database' : isDe ? 'Zugriff auf kompatible Kandidaten in der Datenbank' : isFr ? 'Accès aux candidats compatibles dans la base de données' : 'Access to compatible candidates in the database',
                    isIt ? 'Gestione candidature' : isDe ? 'Bewerbungsmanagement' : isFr ? 'Gestion des candidatures' : 'Application management',
                    isIt ? 'Area aziendale riservata' : isDe ? 'Reservierter Unternehmensbereich' : isFr ? 'Espace entreprise réservé' : 'Reserved company area',
                ],
                vantaggi: [
                    { title: isIt ? 'RISPARMIO IMMEDIATO' : isDe ? 'SOFORTIGE ERSPARNIS' : isFr ? 'ÉCONOMIE IMMÉDIATE' : 'IMMEDIATE SAVINGS',
                      desc:  isIt ? 'Risparmia rispetto all\'acquisto di 5 annunci singoli.' : isDe ? 'Sparen Sie gegenüber dem Einzelkauf von 5 Anzeigen.' : isFr ? 'Économisez par rapport à l\'achat de 5 annonces individuelles.' : 'Save compared to buying 5 single posts.' },
                    { title: isIt ? 'MAGGIORE FLESSIBILITÀ' : isDe ? 'MEHR FLEXIBILITÄT' : isFr ? 'PLUS DE FLEXIBILITÉ' : 'MORE FLEXIBILITY',
                      desc:  isIt ? 'Utilizza gli annunci quando ne hai bisogno durante l\'anno.' : isDe ? 'Nutzen Sie die Anzeigen, wenn Sie sie im Laufe des Jahres brauchen.' : isFr ? 'Utilisez les annonces quand vous en avez besoin pendant l\'année.' : 'Use posts when you need them throughout the year.' },
                    { title: isIt ? 'CANDIDATI GIÀ DISPONIBILI' : isDe ? 'BEREITS VERFÜGBARE KANDIDATEN' : isFr ? 'CANDIDATS DÉJÀ DISPONIBLES' : 'CANDIDATES ALREADY AVAILABLE',
                      desc:  isIt ? 'Non partire da zero: visualizza subito i candidati compatibili già presenti nel database JobCourier.' : isDe ? 'Starten Sie nicht bei Null: sehen Sie sofort kompatible Kandidaten in der Datenbank.' : isFr ? 'Ne partez pas de zéro : consultez les candidats compatibles dans la base JobCourier.' : 'Don\'t start from scratch: view compatible candidates in the JobCourier database.' },
                    { title: isIt ? 'GESTIONE CENTRALIZZATA' : isDe ? 'ZENTRALISIERTE VERWALTUNG' : isFr ? 'GESTION CENTRALISÉE' : 'CENTRALIZED MANAGEMENT',
                      desc:  isIt ? "Candidature e candidati in un'unica area riservata." : isDe ? 'Bewerbungen und Kandidaten in einem einzigen reservierten Bereich.' : isFr ? 'Candidatures et candidats dans un seul espace réservé.' : 'Applications and candidates in one reserved area.' },
                ],
                tag: isIt ? 'CONSIGLIATO' : isDe ? 'EMPFOHLEN' : isFr ? 'RECOMMANDÉ' : 'RECOMMENDED',
                highlight: true,
                cta: isIt ? 'Contattaci' : isDe ? 'Kontakt' : isFr ? 'Contactez-nous' : 'Contact us',
            },
            {
                label: isIt ? '03 / CONTINUO' : isDe ? '03 / KONTINUIERLICH' : isFr ? '03 / CONTINU' : '03 / CONTINUOUS',
                name: isIt ? 'PIANO CONTINUO' : isDe ? 'FORTLAUFENDER PLAN' : isFr ? 'PLAN CONTINU' : 'CONTINUOUS PLAN',
                price: isIt ? "da CHF 1'200" : isDe ? "ab CHF 1'200" : isFr ? "dès CHF 1'200" : "from CHF 1,200",
                pricePrefix: isIt ? 'DA CHF' : isDe ? 'AB CHF' : isFr ? 'DÈS CHF' : 'FROM CHF',
                priceNum: "1'200",
                priceSubNote: isIt ? 'CHF 100 al mese' : isDe ? 'CHF 100 pro Monat' : isFr ? 'CHF 100 par mois' : 'CHF 100 per month',
                note: isIt ? '+IVA' : isDe ? '+MwSt.' : isFr ? '+TVA' : '+VAT',
                desc: isIt ? 'La soluzione ideale per aziende che assumono regolarmente.' : isDe ? 'Die ideale Lösung für Unternehmen, die regelmäßig einstellen.' : isFr ? 'La solution idéale pour les entreprises qui recrutent régulièrement.' : 'The ideal solution for companies that hire regularly.',
                features: [
                    isIt ? 'Pubblicazione di offerte di lavoro durante tutto l\'anno' : isDe ? 'Stellenanzeigen das ganze Jahr über' : isFr ? 'Publication d\'offres tout au long de l\'année' : 'Job posts throughout the entire year',
                    isIt ? 'Accesso ai candidati compatibili già presenti nel database' : isDe ? 'Zugriff auf kompatible Kandidaten in der Datenbank' : isFr ? 'Accès aux candidats compatibles dans la base de données' : 'Access to compatible candidates in the database',
                    isIt ? 'Gestione candidature' : isDe ? 'Bewerbungsmanagement' : isFr ? 'Gestion des candidatures' : 'Application management',
                    isIt ? 'Area aziendale riservata' : isDe ? 'Reservierter Unternehmensbereich' : isFr ? 'Espace entreprise réservé' : 'Reserved company area',
                ],
                vantaggi: [
                    { title: isIt ? 'VISIBILITÀ CONTINUA' : isDe ? 'DAUERHAFTE SICHTBARKEIT' : isFr ? 'VISIBILITÉ CONTINUE' : 'CONTINUOUS VISIBILITY',
                      desc:  isIt ? 'Pubblica le tue offerte durante tutto l\'anno e raggiungi candidati in tutta la Svizzera.' : isDe ? 'Veröffentlichen Sie Ihre Anzeigen das ganze Jahr und erreichen Sie Kandidaten in der ganzen Schweiz.' : isFr ? 'Publiez vos offres toute l\'année et atteignez des candidats dans toute la Suisse.' : 'Publish your posts year-round and reach candidates across Switzerland.' },
                    { title: isIt ? 'ACCESSO AL DATABASE CANDIDATI' : isDe ? 'ZUGRIFF AUF KANDIDATEN-DB' : isFr ? 'ACCÈS BASE CANDIDATS' : 'CANDIDATE DATABASE ACCESS',
                      desc:  isIt ? 'Consulta e ricerca i candidati registrati su JobCourier anche senza pubblicare un\'offerta di lavoro.' : isDe ? 'Suchen Sie registrierte Kandidaten auch ohne aktive Stellenanzeige.' : isFr ? 'Consultez les candidats inscrits même sans offre publiée.' : 'Search registered candidates even without an active job post.' },
                    { title: isIt ? 'CANDIDATI GIÀ DISPONIBILI' : isDe ? 'BEREITS VERFÜGBARE KANDIDATEN' : isFr ? 'CANDIDATS DÉJÀ DISPONIBLES' : 'CANDIDATES ALREADY AVAILABLE',
                      desc:  isIt ? 'Non partire da zero: visualizza subito i candidati compatibili già presenti nel database JobCourier.' : isDe ? 'Starten Sie nicht bei Null: sehen Sie sofort kompatible Kandidaten.' : isFr ? 'Ne partez pas de zéro : consultez les candidats compatibles.' : 'Don\'t start from scratch: view compatible candidates immediately.' },
                    { title: isIt ? 'GESTIONE CENTRALIZZATA' : isDe ? 'ZENTRALISIERTE VERWALTUNG' : isFr ? 'GESTION CENTRALISÉE' : 'CENTRALIZED MANAGEMENT',
                      desc:  isIt ? "Candidature e candidati in un'unica area riservata." : isDe ? 'Bewerbungen und Kandidaten in einem einzigen reservierten Bereich.' : isFr ? 'Candidatures et candidats dans un seul espace réservé.' : 'Applications and candidates in one reserved area.' },
                ],
                tag: isIt ? 'PIÙ ACQUISTATO' : isDe ? 'MEISTGEKAUFT' : isFr ? 'PLUS ACHETÉ' : 'BEST SELLER',
                cta: isIt ? 'Contattaci' : isDe ? 'Kontakt' : isFr ? 'Contactez-nous' : 'Contact us',
            },
        ],
        agency: {
            title: isIt ? 'Soluzioni per Agenzie e Recruiter' : isDe ? 'Lösungen für Agenturen & Recruiter' : isFr ? 'Solutions pour Agences et Recruteurs' : 'Solutions for Agencies & Recruiters',
            subtitle: isIt ? 'Pensate per chi gestisce più ricerche di personale ogni giorno.' : isDe ? 'Entwickelt für alle, die täglich mehrere Personalsuchen betreuen.' : isFr ? 'Pensées pour ceux qui gèrent plusieurs recherches de personnel chaque jour.' : 'Designed for those managing multiple recruitment searches every day.',
            desc: isIt ? 'Pubblicazione automatizzata, accesso al database candidati e condizioni dedicate per elevati volumi di ricerca.' : isDe ? 'Automatisierte Veröffentlichung, Zugriff auf die Kandidatendatenbank und dedizierte Konditionen für hohe Suchvolumen.' : isFr ? 'Publication automatisée, accès à la base de données candidats et conditions dédiées pour de gros volumes.' : 'Automated publishing, candidate database access and dedicated conditions for high search volumes.',
            features: [
                isIt ? 'Pubblicazione automatizzata tramite ATS' : isDe ? 'Automatisierte Veröffentlichung über ATS' : isFr ? 'Publication automatisée via ATS' : 'Automated publishing via ATS',
                isIt ? 'Accesso al database candidati JobCourier' : isDe ? 'Zugriff auf die JobCourier-Kandidatendatenbank' : isFr ? 'Accès à la base de données candidats JobCourier' : 'Access to the JobCourier candidate database',
                isIt ? 'Soluzioni dedicate per elevati volumi di ricerca' : isDe ? 'Dedizierte Lösungen für hohe Suchvolumen' : isFr ? 'Solutions dédiées pour de gros volumes de recherche' : 'Dedicated solutions for high search volumes',
                isIt ? 'Condizioni commerciali personalizzate' : isDe ? 'Individuelle Geschäftskonditionen' : isFr ? 'Conditions commerciales personnalisées' : 'Customized commercial conditions',
            ],
            boxTitle: isIt ? 'SOLUZIONE SU MISURA' : isDe ? 'MASSGESCHNEIDERTE LÖSUNG' : isFr ? 'SOLUTION SUR MESURE' : 'CUSTOM SOLUTION',
            boxDesc: isIt ? 'Raccontaci le tue esigenze e costruiremo la soluzione più adatta alla tua organizzazione.' : isDe ? 'Erzählen Sie uns von Ihren Anforderungen und wir erstellen die passende Lösung.' : isFr ? 'Décrivez-nous vos besoins et nous construirons la solution adaptée à votre organisation.' : 'Tell us your needs and we\'ll build the right solution for your organization.',
            cta: isIt ? 'Contattaci' : isDe ? 'Kontakt' : isFr ? 'Contactez-nous' : 'Contact us',
            cta2: isIt ? 'Richiedi una consulenza' : isDe ? 'Beratung anfordern' : isFr ? 'Demander un conseil' : 'Request a consultation',
        },
        stats: {
            title: isIt ? 'PERCHÉ LE AGENZIE SCELGONO JOBCOURIER' : isDe ? 'WARUM AGENTUREN JOBCOURIER WÄHLEN' : isFr ? 'POURQUOI LES AGENCES CHOISISSENT JOBCOURIER' : 'WHY AGENCIES CHOOSE JOBCOURIER',
            subtitle: isIt ? 'Da oltre 10 anni mettiamo in contatto candidati, aziende e agenzie di reclutamento in tutta la Svizzera.' : isDe ? 'Seit über 10 Jahren verbinden wir Kandidaten, Unternehmen und Personalvermittlungen in der ganzen Schweiz.' : isFr ? 'Depuis plus de 10 ans, nous mettons en relation candidats, entreprises et agences de recrutement dans toute la Suisse.' : 'For over 10 years we\'ve been connecting candidates, companies and recruitment agencies across Switzerland.',
            items: [
                { num: '10+', lines: isIt ? ['ANNI', 'DI ESPERIENZA', 'NEL RECRUITING'] : isDe ? ['JAHRE', 'ERFAHRUNG', 'IM RECRUITING'] : isFr ? ['ANS', 'D\'EXPÉRIENCE', 'EN RECRUTEMENT'] : ['YEARS', 'OF EXPERIENCE', 'IN RECRUITING'] },
                { num: '', lines: isIt ? ['AUDIENCE', 'QUALIFICATA E', 'IN TARGET'] : isDe ? ['QUALIFIZIERTE', 'ZIELGRUPPEN-', 'AUDIENCE'] : isFr ? ['AUDIENCE', 'QUALIFIÉE ET', 'CIBLÉE'] : ['QUALIFIED', 'TARGETED', 'AUDIENCE'] },
                { num: "120'000+", lines: isIt ? ['CANDIDATI', 'REGISTRATI'] : isDe ? ['REGISTRIERTE', 'KANDIDATEN'] : isFr ? ['CANDIDATS', 'INSCRITS'] : ['REGISTERED', 'CANDIDATES'] },
                { num: '', lines: isIt ? ['PARTNER DI', 'AGENZIE E PMI', 'IN TUTTA SVIZZERA'] : isDe ? ['PARTNER VON', 'AGENTUREN & KMU', 'IN DER SCHWEIZ'] : isFr ? ['PARTENAIRE DES', 'AGENCES ET PME', 'EN SUISSE'] : ['PARTNER OF', 'AGENCIES & SMES', 'ACROSS SWITZERLAND'] },
            ],
        },
    };
};

const Pricing = () => {
    const containerRef = useRef(null);
    const [activeTab, setActiveTab] = useState('companies');
    const [selectedPlan, setSelectedPlan] = useState(null);
    const { t, i18n } = useTranslation();
    const lang = i18n.language || 'it';
    const data = getLocalizedData(lang);
    const activePlan = data.plans[selectedPlan ?? 1];

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
                        <div className="hero-line">
                            <SectionLabel>{t('pricing.subtitle') || 'Soluzioni e tariffe'}</SectionLabel>
                        </div>
                        <h1 className="hero-line" style={{
                            fontFamily: brand, fontWeight: 900,
                            fontSize: 'clamp(2rem, 8vw, 4.5rem)',
                            color: W,
                            textTransform: 'uppercase',
                            letterSpacing: '-0.025em',
                            lineHeight: 0.95,
                            marginBottom: 24
                        }}>{data.heroTitleMain}<br />{data.heroTitleLine2}<span style={{ color: F }}>{data.heroTitleEm}</span></h1>
                        <p className="hero-line" style={{ fontFamily: editorial, fontStyle: 'italic', fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', color: 'rgba(255,255,255,0.75)', marginBottom: 40, lineHeight: 1.4 }}>
                            {data.heroSub}
                        </p>

                        <div className="hero-line flex flex-row gap-4 w-full max-w-lg">
                            <FuchsiaButton href="https://jobroom.jobcourier.ch/employer/register.php?ignoreRedirectingCookiesAll=1&lan=it&language=it" fullWidth>
                                {data.heroCta} →
                            </FuchsiaButton>
                            <FuchsiaOutlineButton href="#soluzioni" fullWidth>
                                {t('pricing.cta_discover') || 'SCOPRI I PIANI'} →
                            </FuchsiaOutlineButton>
                        </div>
                    </div>
                </div>
            </section>

            {/* TAB CONTROL */}
            <div id="soluzioni" className="sticky top-0 z-40 py-6 px-6" style={{ background: W, borderBottom: '1px solid rgba(5,11,43,0.07)' }}>
                <div className="max-w-6xl mx-auto flex justify-center">
                    <div style={{ border: `1.5px solid rgba(5,11,43,0.1)`, display: 'flex' }}>
                        {[
                            ['companies', data.tabs.companies],
                            ['agencies', data.tabs.agencies]
                        ].map(([key, label], i) => (
                            <button key={key} onClick={() => setActiveTab(key)} style={{
                                background: activeTab === key ? N : 'transparent',
                                color: activeTab === key ? W : GM,
                                border: 'none',
                                padding: '16px 56px',
                                fontFamily: brand, fontWeight: 700, fontSize: 11,
                                letterSpacing: '0.16em', textTransform: 'uppercase',
                                cursor: 'pointer',
                                borderRight: i === 0 ? '1.5px solid rgba(5,11,43,0.1)' : 'none'
                            }} className="transition-all duration-200">
                                {label}
                            </button>
                        ))}
                    </div>
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
                                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch h-full">
                                    {data.plans.map((plan, pIdx) => (
                                        <motion.div key={pIdx}
                                            className="group relative flex flex-col min-w-0 cursor-pointer h-full"
                                            onClick={() => setSelectedPlan(pIdx)}
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
                                                overflow: 'hidden',
                                            }}>
                                            {plan.tag && (
                                                <span style={{
                                                    position: 'absolute', top: 20, left: 28,
                                                    fontFamily: brand, fontWeight: 700, fontSize: 9,
                                                    letterSpacing: '0.18em', textTransform: 'uppercase',
                                                    color: F,
                                                    background: 'transparent'
                                                }}>■ {plan.tag}</span>
                                            )}
                                            {selectedPlan === pIdx && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    style={{
                                                        position: 'absolute',
                                                        top: 22,
                                                        right: -30,
                                                        width: 130,
                                                        textAlign: 'center',
                                                        background: F,
                                                        color: W,
                                                        fontFamily: brand,
                                                        fontWeight: 700,
                                                        fontSize: 7,
                                                        letterSpacing: '0.14em',
                                                        textTransform: 'uppercase',
                                                        padding: '5px 0',
                                                        transform: 'rotate(45deg)',
                                                        pointerEvents: 'none',
                                                    }}>
                                                    ✓ SELEZIONATO
                                                </motion.div>
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
                                                    {plan.priceSubNote && (
                                                        <div style={{ fontFamily: body, fontSize: 11, color: F, fontWeight: 600, marginTop: 6 }}>
                                                            {plan.priceSubNote}
                                                        </div>
                                                    )}
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

                                            <OutlineButton href="/contatti" fullWidth>{plan.cta} →</OutlineButton>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* SIDEBAR VANTAGGI — navy, numerata, stagger on click */}
                                <div className="lg:col-span-2 p-8" style={{ background: N, borderLeft: `4px solid ${F}`, minHeight: '750px' }}>
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
                                            key={selectedPlan ?? 1}
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
                                            {data.agency.boxTitle}
                                        </h4>
                                        <p style={{ fontFamily: body, fontSize: 11, color: GM, lineHeight: 1.4 }}>
                                            {data.agency.boxDesc}
                                        </p>
                                    </div>
                                    <div className="flex gap-3 w-full" style={{ marginTop: 24 }}>
                                        <FuchsiaButton href="/contatti" fullWidth>
                                            {data.agency.cta} →
                                        </FuchsiaButton>
                                        <FuchsiaOutlineButton href="/contatti" fullWidth>
                                            {data.agency.cta2} →
                                        </FuchsiaOutlineButton>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* STATS */}
            <section className="py-20 px-6 md:px-12" style={{ background: W }}>
                <div className="container mx-auto max-w-5xl text-center">
                    <div className="mb-6">
                        <SectionLabel>{data.stats.title}</SectionLabel>
                    </div>
                    <p style={{ fontFamily: editorial, fontStyle: 'italic', fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', color: GM, lineHeight: 1.5, maxWidth: 640, margin: '0 auto 48px' }}>
                        {data.stats.subtitle}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {data.stats.items.map((stat, sIdx) => (
                            <motion.div
                                key={sIdx}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: sIdx * 0.08 }}
                                className="p-6"
                                style={{ background: GL, border: '1px solid rgba(5,11,43,0.06)' }}
                            >
                                {stat.num && (
                                    <div style={{ fontFamily: brand, fontWeight: 900, fontSize: 32, color: F, letterSpacing: '-0.02em', marginBottom: 8 }}>
                                        {stat.num}
                                    </div>
                                )}
                                {stat.lines.map((line, lIdx) => (
                                    <div key={lIdx} style={{ fontFamily: brand, fontWeight: 700, fontSize: 11, color: N, letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: 1.6 }}>
                                        {line}
                                    </div>
                                ))}
                            </motion.div>
                        ))}
                    </div>
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
