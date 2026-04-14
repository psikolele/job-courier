# Navbar Refactoring — Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Ripristinare il navbar split bicolore della versione Vercel precedente, mantenendo la distinzione Candidati/Aziende visibile solo nel menu esploso (accordion full-screen).

**Architecture:** Refactoring completo di `Navbar.jsx`. La struttura è divisa in tre parti: (1) header split bicolore fisso, (2) overlay full-screen con accordion Candidati/Aziende, (3) Login Modal esistente invariato. Nessun altro file viene toccato.

**Tech Stack:** React 19, Framer Motion, react-i18next, Tailwind CSS v3

---

### Task 1: Backup e Scaffolding

**Files:**
- Modify: `webapp/src/components/Navbar.jsx`

**Step 1: Backup del file corrente**

```bash
cp webapp/src/components/Navbar.jsx webapp/src/components/Navbar.jsx.bak
```

**Step 2: Avvia il dev server per verifiche in tempo reale**

```bash
cd webapp && npm run dev
```

Apri `http://localhost:5173` nel browser. Lascialo attivo durante tutto il processo.

**Step 3: Commit del backup**

```bash
git add webapp/src/components/Navbar.jsx.bak
git commit -m "chore: backup navbar before refactoring"
```

---

### Task 2: Struttura Split Bicolore della Navbar Chiusa

**Files:**
- Modify: `webapp/src/components/Navbar.jsx`

**Obiettivo:** Rimpiazzare il `<header>` corrente con uno split bicolore: sinistra bianca (logo), destra scura (lingua + login + hamburger).

**Step 1: Riscrivi la sezione `<header>` con il layout split**

Sostituisci l'intero contenuto di `Navbar.jsx` con il seguente codice completo:

```jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// ---------- ICONS ----------
const IconBriefcase = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
);
const IconSearch = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
);
const IconStar = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
);
const IconBuilding = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>
    </svg>
);
const IconUsers = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
);
const IconTrendingUp = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
    </svg>
);
const IconBookOpen = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
);
const IconChevronDown = ({ open }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}>
        <polyline points="6 9 12 15 18 9"/>
    </svg>
);
const IconX = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);
const IconMenu = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
);
const IconArrowRight = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
);

// ---------- NAV DATA ----------
const candidateLinks = [
    {
        icon: <IconSearch />,
        label: 'Cerca Lavoro',
        labelDe: 'Jobsuche',
        labelFr: "Recherche d'emploi",
        desc: 'Esplora migliaia di offerte',
        descDe: 'Tausende Angebote entdecken',
        descFr: "Explorez des milliers d'offres",
        href: '#jobs',
    },
    {
        icon: <IconStar />,
        label: 'Le mie Candidature',
        labelDe: 'Meine Bewerbungen',
        labelFr: 'Mes candidatures',
        desc: 'Segui i tuoi annunci preferiti',
        descDe: 'Verfolge deine Lieblingsanzeigen',
        descFr: 'Suivez vos annonces favorites',
        href: 'https://jobroom.jobcourier.ch/job-seekers-login.php',
        external: true,
    },
    {
        icon: <IconTrendingUp />,
        label: 'Consigli di Carriera',
        labelDe: 'Karrieretipps',
        labelFr: 'Conseils carrière',
        desc: 'Guide, articoli, risorse utili',
        descDe: 'Leitfäden, Artikel, nützliche Ressourcen',
        descFr: 'Guides, articles, ressources utiles',
        href: '#blog',
    },
    {
        icon: <IconBookOpen />,
        label: 'Blog',
        labelDe: 'Blog',
        labelFr: 'Blog',
        desc: 'News dal mondo del lavoro',
        descDe: 'Neuigkeiten aus der Arbeitswelt',
        descFr: 'Actualités du monde du travail',
        href: '#blog',
    },
];

const companyLinks = [
    {
        icon: <IconBriefcase />,
        label: 'Pubblica un Annuncio',
        labelDe: 'Stellenanzeige aufgeben',
        labelFr: 'Publier une annonce',
        desc: 'Raggiungi migliaia di candidati',
        descDe: 'Tausende von Kandidaten erreichen',
        descFr: 'Atteignez des milliers de candidats',
        href: 'https://jobroom.jobcourier.ch/employer/register.php?ignoreRedirectingCookiesAll=1&lan=it&language=it',
        external: true,
    },
    {
        icon: <IconUsers />,
        label: 'Gestisci Candidature',
        labelDe: 'Bewerbungen verwalten',
        labelFr: 'Gérer les candidatures',
        desc: 'Accedi al portale aziende',
        descDe: 'Zugang zum Unternehmensportal',
        descFr: 'Accédez au portail entreprises',
        href: 'https://jobroom.jobcourier.ch/job-seekers-login.php',
        external: true,
    },
    {
        icon: <IconBuilding />,
        label: 'Soluzioni e Tariffe',
        labelDe: 'Lösungen und Tarife',
        labelFr: 'Solutions et tarifs',
        desc: 'Piani adatti a ogni esigenza',
        descDe: 'Pläne für jeden Bedarf',
        descFr: 'Plans adaptés à chaque besoin',
        href: 'https://www.jobcourier.ch/soluzioni-e-tariffe/',
        external: true,
    },
    {
        icon: <IconTrendingUp />,
        label: 'Recruiter Pro',
        labelDe: 'Recruiter Pro',
        labelFr: 'Recruiter Pro',
        desc: 'Strumenti avanzati per HR',
        descDe: 'Erweiterte HR-Tools',
        descFr: 'Outils avancés pour RH',
        href: '#companies',
    },
];

const getLabel = (item, lang) => {
    if (lang === 'de' && item.labelDe) return item.labelDe;
    if (lang === 'fr' && item.labelFr) return item.labelFr;
    return item.label;
};
const getDesc = (item, lang) => {
    if (lang === 'de' && item.descDe) return item.descDe;
    if (lang === 'fr' && item.descFr) return item.descFr;
    return item.desc;
};

// ---------- ACCORDION SECTION (used inside mobile overlay) ----------
const AccordionSection = ({ title, links, lang, isOpen, onToggle, onClose }) => (
    <div className="border-b border-white/10 last:border-0">
        {/* Section header (always visible) */}
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between py-6 px-2 text-left group"
        >
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white group-hover:text-[#2f9de5] transition-colors duration-200">
                {title}
            </span>
            <span className="text-white/60 flex-shrink-0 ml-4">
                <IconChevronDown open={isOpen} />
            </span>
        </button>

        {/* Expandable link list */}
        <AnimatePresence initial={false}>
            {isOpen && (
                <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ overflow: 'hidden' }}
                >
                    <div className="pb-4 space-y-1 px-2">
                        {links.map((item, i) => (
                            <a
                                key={i}
                                href={item.href}
                                target={item.external ? '_blank' : undefined}
                                rel={item.external ? 'noopener noreferrer' : undefined}
                                onClick={onClose}
                                className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/8 transition-all duration-200"
                            >
                                <span className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 text-white group-hover:bg-[#2f9de5] group-hover:text-white transition-all duration-200">
                                    {item.icon}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="text-base font-semibold text-white/90 group-hover:text-white transition-colors">
                                            {getLabel(item, lang)}
                                        </span>
                                        <span className="opacity-0 group-hover:opacity-100 text-[#2f9de5] transition-opacity ml-2 flex-shrink-0">
                                            <IconArrowRight />
                                        </span>
                                    </div>
                                    <p className="text-sm text-white/50 mt-0.5">{getDesc(item, lang)}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

// ---------- MAIN NAVBAR ----------
const Navbar = ({ showLoginModal, setShowLoginModal }) => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    // 'candidates' opens by default when menu opens; null = both closed
    const [openSection, setOpenSection] = useState(null);
    const { t, i18n } = useTranslation();
    const lang = i18n.language;

    const candidateTitle = lang === 'de' ? 'Für Kandidaten' : lang === 'fr' ? 'Pour les candidats' : 'Per i Candidati';
    const companyTitle = lang === 'de' ? 'Für Unternehmen' : lang === 'fr' ? 'Pour les entreprises' : 'Per le Aziende';

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Lock body scroll when menu is open
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
            setOpenSection('candidates'); // default: candidates open
        } else {
            document.body.style.overflow = '';
            setOpenSection(null);
        }
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    const closeAll = useCallback(() => {
        setMenuOpen(false);
    }, []);

    const toggleSection = useCallback((section) => {
        setOpenSection(prev => prev === section ? null : section);
    }, []);

    const changeLanguage = useCallback((lng) => {
        i18n.changeLanguage(lng);
    }, [i18n]);

    const navHeight = scrolled ? 'h-[60px]' : 'h-[72px]';

    return (
        <>
        {/* ── HEADER SPLIT ── */}
        <header
            className={`fixed top-0 left-0 right-0 z-50 w-full flex transition-all duration-400 ${navHeight} ${
                scrolled
                    ? 'shadow-[0_4px_28px_rgba(0,0,0,0.22)]'
                    : 'shadow-[0_4px_18px_rgba(0,0,0,0.14)]'
            }`}
        >
            {/* ── LEFT HALF: white background, logo ── */}
            <div className="flex items-center bg-white px-5 sm:px-8 flex-1 border-b border-slate-200/60">
                <a href="/" className="flex items-center group">
                    <img
                        src="https://www.jobcourier.ch/wp-content/uploads/2021/08/jobcourier_logo.png"
                        alt="Job Courier"
                        className={`object-contain transition-all duration-400 ${scrolled ? 'h-[22px] md:h-[24px]' : 'h-[26px] md:h-[30px]'}`}
                    />
                </a>
            </div>

            {/* ── RIGHT HALF: dark background, lang + login + hamburger ── */}
            <div className="flex items-center justify-end gap-4 bg-[#1a2554] px-5 sm:px-8 flex-shrink-0 border-b border-[#1a2554]">
                {/* Language switcher */}
                <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/50">
                    {['it', 'de', 'fr'].map((lng, idx) => (
                        <React.Fragment key={lng}>
                            {idx > 0 && <span className="text-white/20">|</span>}
                            <button
                                onClick={() => changeLanguage(lng)}
                                className={`transition-all hover:opacity-100 ${
                                    i18n.language === lng ? 'text-white opacity-100' : 'opacity-50 hover:opacity-80'
                                }`}
                            >
                                {lng.toUpperCase()}
                            </button>
                        </React.Fragment>
                    ))}
                </div>

                {/* LOGIN button */}
                <button
                    onClick={() => setShowLoginModal(true)}
                    className="group relative overflow-hidden hidden sm:flex items-center gap-2 rounded-full bg-[#e63946] px-5 py-2 text-[11px] uppercase tracking-widest font-bold text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_4px_16px_rgba(230,57,70,0.4)] active:scale-[0.98]"
                >
                    <span className="relative z-10">LOGIN</span>
                    <div className="absolute inset-0 bg-white/10 translate-x-[-110%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                </button>

                {/* Hamburger */}
                <button
                    onClick={() => setMenuOpen(prev => !prev)}
                    className="flex items-center justify-center w-10 h-10 rounded-full text-white hover:bg-white/10 transition-all duration-200"
                    aria-label="Toggle menu"
                >
                    {menuOpen ? <IconX /> : <IconMenu />}
                </button>
            </div>
        </header>

        {/* ── FULL-SCREEN MENU OVERLAY ── */}
        <AnimatePresence>
            {menuOpen && (
                <motion.div
                    key="overlay"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="fixed inset-0 z-[90] bg-[#0B1120] flex flex-col overflow-y-auto"
                    style={{ paddingTop: scrolled ? '60px' : '72px' }}
                >
                    {/* Close button top-right */}
                    <button
                        onClick={closeAll}
                        className="absolute top-5 right-5 sm:right-8 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-200"
                        aria-label="Chiudi menu"
                    >
                        <IconX />
                    </button>

                    {/* Main content */}
                    <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full px-6 sm:px-10 py-10">
                        {/* Accordion Sections */}
                        <AccordionSection
                            title={candidateTitle}
                            links={candidateLinks}
                            lang={lang}
                            isOpen={openSection === 'candidates'}
                            onToggle={() => toggleSection('candidates')}
                            onClose={closeAll}
                        />
                        <AccordionSection
                            title={companyTitle}
                            links={companyLinks}
                            lang={lang}
                            isOpen={openSection === 'companies'}
                            onToggle={() => toggleSection('companies')}
                            onClose={closeAll}
                        />

                        {/* Bottom actions */}
                        <div className="flex flex-col gap-4 mt-8">
                            <button
                                onClick={() => { closeAll(); setShowLoginModal(true); }}
                                className="w-full py-4 rounded-full bg-[#e63946] text-white text-sm font-bold uppercase tracking-widest hover:bg-[#c1121f] transition-colors shadow-lg"
                            >
                                Accedi
                            </button>
                            {/* Language (mobile) */}
                            <div className="flex justify-center gap-6 text-xs font-bold uppercase tracking-widest text-white/40">
                                {['it', 'de', 'fr'].map(lng => (
                                    <button
                                        key={lng}
                                        onClick={() => { changeLanguage(lng); }}
                                        className={i18n.language === lng ? 'text-white' : 'hover:text-white/70 transition-colors'}
                                    >
                                        {lng.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* ── LOGIN MODAL ── */}
        <AnimatePresence>
            {showLoginModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowLoginModal(false); }}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden"
                    >
                        <button
                            onClick={() => setShowLoginModal(false)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                        >
                            <IconX />
                        </button>

                        <div className="text-center mb-8 pt-2">
                            <div className="w-12 h-12 rounded-2xl bg-[#26367b]/8 flex items-center justify-center mx-auto mb-4">
                                <IconBuilding />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Area Aziende</h3>
                            <p className="text-slate-500 text-sm">Seleziona un'opzione per continuare l'accesso al portale.</p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <a
                                href="https://jobroom.jobcourier.ch/employer/register.php?ignoreRedirectingCookiesAll=1&lan=it&language=it&_gl=1*e5uej*_gcl_au*MjA5NDU5ODA3Ni4xNzE4MDA1NjYy"
                                className="group relative overflow-hidden rounded-2xl bg-white border-2 border-[#26367b] p-4 flex flex-col items-center justify-center transition-all hover:bg-[#26367b] hover:shadow-lg"
                            >
                                <span className="font-bold text-[#26367b] group-hover:text-white transition-colors">Nuova Azienda (Registrati)</span>
                                <span className="text-xs text-slate-500 group-hover:text-blue-100 transition-colors mt-1">Pubblica il tuo primo annuncio</span>
                            </a>

                            <a
                                href="https://jobroom.jobcourier.ch/job-seekers-login.php"
                                className="group relative overflow-hidden rounded-2xl bg-slate-800 border-2 border-slate-800 p-4 flex flex-col items-center justify-center transition-all hover:bg-slate-900"
                            >
                                <span className="font-bold text-white">Azienda Registrata (Accedi)</span>
                                <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors mt-1">Accedi alla tua dashboard</span>
                            </a>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
        </>
    );
};

export default Navbar;
```

**Step 2: Verifica nel browser**

- Navbar bicolore visibile (bianco | blu scuro)
- Shadow ben visibile sotto la navbar
- Hamburger apre l'overlay full-screen
- Sezione "Candidati" aperta di default
- Click sulla sezione "Aziende" la apre e chiude "Candidati"
- I link funzionano e chiudono il menu
- Scroll riduce l'altezza del navbar

**Step 3: Commit**

```bash
git add webapp/src/components/Navbar.jsx
git commit -m "feat(Navbar): split bicolor header, full-screen accordion overlay with Candidati/Aziende sections"
```

---

### Task 3: Rimozione Backup e Cleanup

**Files:**
- Delete: `webapp/src/components/Navbar.jsx.bak`

**Step 1: Rimuovi il backup**

```bash
rm webapp/src/components/Navbar.jsx.bak
```

**Step 2: Verifica finale**

- Desktop: navbar split funzionante
- Mobile: menu overlay funzionante con accordion
- Login modal funzionante

**Step 3: Commit finale**

```bash
git add -A
git commit -m "chore: remove navbar backup file"
```

---

### Task 4: Push e Deploy

**Step 1: Push al remote**

```bash
git push origin HEAD
```

**Step 2: Verifica su Vercel**

Attendi il deploy automatico di Vercel e verifica la versione live.
