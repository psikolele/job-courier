import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

// ---------- RECONSTRUCTED HTML BANNERS ----------

const AsflBanner = () => {
    const { t } = useTranslation();
    return (
        <div 
            className="w-full h-full flex select-none overflow-hidden" 
            style={{ 
                background: '#7b7c7e', 
                containerType: 'inline-size', 
                height: '100%',
                width: '100%'
            }}
        >
            {/* Left yellow block */}
            <div 
                className="w-[18%] h-full bg-[#ffff01] flex flex-col justify-center items-center font-sans font-black italic text-black leading-none shrink-0" 
                style={{ fontSize: 'clamp(14px, 3.8cqw, 36px)' }}
            >
                <span>ASFL</span>
                <span className="mt-[0.3cqw]">SVBL</span>
            </div>

            {/* Middle team photo - Using high-res AI generated logistics visual */}
            <div className="w-[47%] h-full relative overflow-hidden shrink-0">
                <img 
                    src="/img/banner-asfl-bg-generated.png" 
                    alt="ASFL SVBL Team" 
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Right dark grey text area */}
            <div className="w-[35%] h-full flex flex-col justify-center px-[3cqw] text-white font-sans text-left leading-normal shrink-0">
                <h4 
                    className="font-extrabold leading-tight tracking-wide" 
                    style={{ fontSize: 'clamp(11px, 2.3cqw, 24px)' }}
                >
                    {t('ads.asfl_tagline')}
                </h4>
                <div className="w-full h-[2px] bg-[#ffff01] my-[0.8cqw]"></div>
                <p 
                    className="font-semibold opacity-95 leading-tight" 
                    style={{ fontSize: 'clamp(8px, 1.35cqw, 14px)' }}
                >
                    {t('ads.asfl_desc')}
                    <br />
                    Via Ferriere 11 | 6512 Giubiasco
                    <br />
                    T +41 58 258 36 63 | ticino@asfl.ch
                </p>
            </div>
        </div>
    );
};

const FormaBanner = () => {
    const { t } = useTranslation();
    return (
        <div 
            className="w-full h-full flex select-none overflow-hidden" 
            style={{ 
                background: '#000000', 
                containerType: 'inline-size', 
                height: '100%',
                width: '100%'
            }}
        >
            {/* Section 1: Black box "QUATTRO PERCORSI APF" */}
            <div 
                className="w-[18%] h-full bg-black flex flex-col justify-center items-center text-white font-sans font-black text-center leading-none px-[0.5cqw] shrink-0" 
                style={{ fontSize: 'clamp(11px, 2.3cqw, 24px)', letterSpacing: '0.05em' }}
            >
                <div>QUATTRO</div>
                <div className="mt-[0.3cqw]">PERCORSI</div>
                <div className="mt-[0.3cqw] text-[#fc1452]">APF</div>
            </div>

            {/* Section 2: Cyber graphics slice - Using high-res AI generated cyber background */}
            <div className="w-[15%] h-full relative overflow-hidden shrink-0">
                <img 
                    src="/img/banner-cyber-bg-generated.png" 
                    alt="Cyber Security Graphics" 
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Section 3: Red course list */}
            <div className="w-[38%] h-full bg-[#fc1452] flex flex-col justify-center shrink-0" style={{ paddingLeft: '3cqw' }}>
                <ul 
                    className="list-none flex flex-col justify-center gap-[0.4cqw] text-white font-sans text-left font-black uppercase leading-tight" 
                    style={{ fontSize: 'clamp(9px, 1.55cqw, 15px)', letterSpacing: '0.02em' }}
                >
                    <li className="flex items-center gap-[0.6cqw]">
                        <span className="text-white">•</span> DIGITAL COLLABORATION SPECIALIST
                    </li>
                    <li className="flex items-center gap-[0.6cqw]">
                        <span className="text-white">•</span> CYBER SECURITY SPECIALIST
                    </li>
                    <li className="flex items-center gap-[0.6cqw]">
                        <span className="text-white">•</span> {t('ads.forma_title')}
                    </li>
                    <li className="flex items-center gap-[0.6cqw]">
                        <span className="text-white">•</span> MULTIMEDIA CONTENT CREATOR
                    </li>
                </ul>
            </div>

            {/* Section 4/5: Multimedia graphics with glassmorphic overlay card containing both logos */}
            <div className="w-[29%] h-full relative overflow-hidden shrink-0 flex items-center justify-center">
                <img 
                    src="/img/banner-multimedia-bg-generated.png" 
                    alt="Multimedia Graphics" 
                    className="w-full h-full object-cover"
                />
                
                {/* Glassmorphic card overlay */}
                <div className="absolute inset-[10%] bg-white/85 backdrop-blur-md border border-white/20 shadow-md rounded-[1.25rem] flex flex-col items-center justify-center p-[1cqw] gap-[1cqw]">
                    {/* Top: Formati Academy logo */}
                    <div className="flex items-center justify-center gap-[0.4cqw] select-none text-[#1a2554]">
                        <span className="font-sans font-extrabold tracking-tight" style={{ fontSize: 'clamp(8px, 1.45cqw, 18px)' }}>forma</span>
                        <svg viewBox="44 1 32 30" className="h-[1.7cqw] w-auto min-h-[13px] max-h-[22px]" style={{ aspectRatio: '32/30' }}>
                            <path d="M51,11 L57,5 L57,13 L58,14 L62,14 L62,19 L59,19 L57,21 L57,23 L60,26 L62,26 L62,30 L61,31 L53,31 L51,29 L51,20 L50,19 L44,19 L51,12 Z" fill="#E2231A" />
                            <path fillRule="evenodd" clipRule="evenodd" d="M65,1 L66,2 L67,2 L72,7 L72,8 L74,11 L74,13 L75,14 L75,17 L76,18 L76,27 L75,28 L75,31 L66,31 L66,25 L65,24 L65,21 L64,20 L64,15 L65,14 L64,13 L64,11 L65,10 L68,10 L69,11 L69,13 L70,14 L71,13 L71,9 L70,8 L69,5 L66,2 Z M66,14 L65,14 L64,15 L65,16 L68,16 L69,15 L68,14 L67,14 Z" fill="#2f9de5" />
                        </svg>
                        <span className="font-sans font-semibold text-slate-500 tracking-wide" style={{ fontSize: 'clamp(8px, 1.45cqw, 18px)' }}>academy</span>
                    </div>

                    {/* Middle: Patronage Label */}
                    <span className="font-sans font-extrabold text-slate-500 uppercase tracking-wider text-center select-none" style={{ fontSize: 'clamp(5px, 0.75cqw, 9px)' }}>
                        {t('ads.forma_patronage')}
                    </span>

                    {/* Bottom: ATED SVG Logo */}
                    <svg viewBox="0 0 300 90" className="h-[2.2cqw] w-auto min-h-[17px] max-h-[30px] fill-current text-black" style={{ aspectRatio: '300/90' }}>
                        {/* Letter 'a' (outer + inner) */}
                        <path fillRule="evenodd" clipRule="evenodd" d="M9,24 L10,24 L13,21 L19,18 L21,18 L22,17 L27,17 L28,16 L40,16 L41,17 L45,17 L46,18 L51,19 L60,27 L62,31 L63,36 L64,37 L64,45 L65,46 L65,87 L64,88 L51,88 L51,79 L52,78 L52,75 L53,74 L53,71 L52,70 L47,79 L42,84 L41,84 L37,87 L35,87 L31,89 L18,89 L17,88 L15,88 L9,85 L6,82 L5,82 L5,81 L1,76 L1,74 L0,73 L0,62 L1,61 L2,57 L8,51 L14,48 L17,48 L18,47 L23,47 L24,46 L41,46 L42,45 L46,45 L47,44 L49,44 L51,42 L51,36 L50,34 L46,30 L42,29 L41,28 L25,28 L24,29 L22,29 L17,33 L15,37 L15,39 L2,39 L4,31 L9,25 Z M50,51 L45,54 L42,54 L41,55 L36,55 L35,56 L28,56 L27,57 L23,57 L22,58 L18,59 L13,64 L13,71 L15,73 L15,74 L20,77 L23,77 L24,78 L27,78 L28,77 L33,77 L34,76 L36,76 L40,74 L47,67 L50,61 L50,58 L51,57 L51,52 Z" />
                        {/* Letter 't' */}
                        <path d="M83,0 L96,0 L96,16 L97,17 L116,17 L116,28 L115,29 L97,29 L96,30 L96,72 L99,76 L101,76 L102,77 L116,77 L116,88 L97,88 L96,87 L93,87 L89,85 L86,82 L83,76 L83,30 L82,29 L69,29 L69,17 L82,17 L83,16 L83,1 Z" />
                        {/* Letter 'e' (outer + inner) */}
                        <path fillRule="evenodd" clipRule="evenodd" d="M126,31 L133,23 L142,18 L144,18 L145,17 L149,17 L150,16 L159,16 L160,17 L164,17 L165,18 L167,18 L176,23 L182,30 L185,36 L186,41 L187,42 L187,56 L135,56 L134,57 L134,62 L137,68 L143,74 L147,76 L149,76 L150,77 L161,77 L162,76 L164,76 L169,72 L173,64 L186,64 L184,72 L181,76 L181,77 L174,84 L173,84 L171,86 L167,87 L166,88 L163,88 L162,89 L147,89 L146,88 L141,87 L135,84 L127,76 L123,69 L122,63 L121,62 L121,57 L120,56 L120,50 L121,49 L121,43 L122,42 L123,37 L126,32 Z M149,28 L148,29 L144,30 L137,37 L135,41 L135,43 L134,44 L135,46 L173,46 L174,45 L174,42 L173,41 L173,39 L171,35 L166,30 L162,29 L161,28 L150,28 Z" />
                        {/* Letter 'd' (outer + arrow) */}
                        <path d="M196,19 L197,17 L250,17 L251,18 L255,18 L256,19 L261,20 L268,24 L272,28 L272,29 L211,29 L210,30 L210,75 L211,76 L271,76 L272,77 L267,82 L266,82 L262,85 L260,85 L257,87 L254,87 L253,88 L197,88 L196,87 L196,20 Z" />
                        <path d="M277,34 L276,33 L278,32 L282,36 L283,36 L299,52 L299,53 L278,74 L277,74 L277,71 L280,66 L280,64 L282,60 L282,45 L281,44 L281,42 L280,41 L280,39 L278,35 Z" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

const BlcBanner = () => {
    const { t } = useTranslation();
    return (
        <div 
            className="w-full h-full flex select-none overflow-hidden" 
            style={{ 
                background: '#ffffff', 
                containerType: 'inline-size', 
                height: '100%',
                width: '100%'
            }}
        >
            {/* Section 1: White BLC Logo block */}
            <div className="w-[22%] h-full bg-white flex flex-col justify-center items-center py-[1cqw] px-[1.5cqw] shrink-0 border-r border-slate-100">
                {/* BLC SVG Logo */}
                <svg viewBox="0 0 228 128" className="shrink-0" style={{ width: 'clamp(55px, 9.5cqw, 95px)', height: 'auto' }}>
                    {/* B and C in navy blue (#002544), L in red (#e2231a) */}
                    <path 
                        fillRule="evenodd" 
                        clipRule="evenodd" 
                        d="M0,3 L1,1 L35,1 L36,2 L46,2 L47,3 L50,3 L51,4 L56,5 L58,7 L62,9 L66,14 L67,20 L68,21 L68,26 L67,27 L67,30 L63,37 L60,40 L50,45 L53,47 L56,47 L62,50 L70,59 L70,61 L71,62 L71,66 L72,67 L71,76 L70,77 L70,79 L68,83 L63,89 L62,89 L59,92 L55,94 L49,95 L48,96 L43,96 L42,97 L0,97 L0,4 Z M22,17 L21,18 L21,39 L22,40 L36,40 L37,39 L39,39 L45,33 L45,30 L46,29 L45,23 L41,19 L37,17 L23,17 Z M22,55 L21,56 L21,81 L22,82 L35,82 L36,81 L40,81 L44,79 L48,75 L49,73 L49,64 L48,62 L44,58 L40,56 L23,56 Z" 
                        fill="#002544" 
                    />
                    <path 
                        d="M88,3 L89,1 L109,1 L109,79 L110,80 L145,80 L145,97 L88,97 L88,4 Z" 
                        fill="#e2231a" 
                    />
                    <path 
                        d="M198,18 L197,19 L192,20 L188,23 L187,23 L180,30 L180,31 L178,33 L177,37 L176,38 L176,41 L175,42 L175,57 L176,58 L177,64 L180,68 L180,69 L187,76 L188,76 L190,78 L192,78 L196,80 L206,81 L207,80 L214,80 L215,79 L218,79 L219,78 L221,78 L227,75 L227,94 L225,94 L222,96 L219,96 L218,97 L214,97 L213,98 L189,98 L188,97 L181,96 L171,91 L161,81 L161,80 L159,78 L156,72 L156,70 L154,66 L154,62 L153,61 L153,41 L154,40 L154,37 L155,36 L156,30 L162,19 L171,10 L172,10 L177,6 L183,3 L189,2 L190,1 L194,1 L195,0 L214,0 L215,1 L220,1 L221,2 L224,2 L225,3 L227,3 L227,23 L221,20 L215,19 L214,18 L199,18 Z" 
                        fill="#002544" 
                    />
                    <text 
                        x="114" 
                        y="120" 
                        fontFamily="system-ui, -apple-system, sans-serif" 
                        fontWeight="800" 
                        fontSize="13" 
                        fill="#002544" 
                        letterSpacing="0.05em"
                        textAnchor="middle"
                    >
                        BUSINESS LEARNING CENTRE
                    </text>
                </svg>
            </div>

            {/* Section 2: Photo area with bottom gradient and 3 icons at the bottom */}
            <div className="w-[43%] h-full relative overflow-hidden shrink-0 flex flex-col justify-end p-[1.5cqw] pb-[2cqw]">
                <img 
                    src="/img/blc-learning-bg.png" 
                    alt="Corporate Training BLC" 
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />
                {/* Gradient overlay from bottom to top */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#002544]/95 via-[#002544]/35 to-transparent z-10" />

                {/* The 3 icons + labels at the bottom */}
                <div className="relative z-20 w-full grid grid-cols-3 gap-[1cqw] text-white font-sans text-center">
                    {/* Icon 1: Professional Training */}
                    <div className="flex flex-col items-center justify-end gap-[0.4cqw]">
                        <svg className="w-[2.8cqw] h-[2.8cqw] max-h-[26px] max-w-[26px] text-white fill-current opacity-90 hover:opacity-100 transition-opacity" viewBox="0 0 24 24">
                            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" fill="#e2231a" />
                        </svg>
                        <span className="font-bold uppercase leading-tight tracking-wider" style={{ fontSize: 'clamp(6px, 0.95cqw, 10px)' }}>
                            Formazione<br />Professionale
                        </span>
                    </div>

                    {/* Icon 2: Language Courses */}
                    <div className="flex flex-col items-center justify-end gap-[0.4cqw]">
                        <svg className="w-[2.8cqw] h-[2.8cqw] max-h-[26px] max-w-[26px] text-white fill-current opacity-90 hover:opacity-100 transition-opacity" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.53c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.4z" fill="#e2231a" />
                        </svg>
                        <span className="font-bold uppercase leading-tight tracking-wider" style={{ fontSize: 'clamp(6px, 0.95cqw, 10px)' }}>
                            Corsi di<br />Lingue
                        </span>
                    </div>

                    {/* Icon 3: Security Consulting */}
                    <div className="flex flex-col items-center justify-end gap-[0.4cqw]">
                        <svg className="w-[2.8cqw] h-[2.8cqw] max-h-[26px] max-w-[26px] text-white fill-current opacity-90 hover:opacity-100 transition-opacity" viewBox="0 0 24 24">
                            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" fill="#e2231a" />
                        </svg>
                        <span className="font-bold uppercase leading-tight tracking-wider" style={{ fontSize: 'clamp(6px, 0.95cqw, 10px)' }}>
                            Consulenza<br />Sicurezza
                        </span>
                    </div>
                </div>
            </div>

            {/* Section 3: BLC Navy blue courses block */}
            <div className="w-[35%] h-full bg-[#002544] flex flex-col justify-center px-[3cqw] text-white font-sans text-left leading-normal shrink-0">
                <h4 
                    className="font-extrabold leading-tight tracking-wide uppercase text-white" 
                    style={{ fontSize: 'clamp(11px, 2.1cqw, 22px)' }}
                >
                    Formazione continua e consulenza aziendale
                </h4>
                <div className="w-full h-[2px] bg-[#e2231a] my-[0.8cqw]"></div>
                <ul 
                    className="list-none flex flex-col gap-[0.6cqw] text-white font-semibold opacity-95 leading-tight" 
                    style={{ fontSize: 'clamp(8px, 1.45cqw, 15px)' }}
                >
                    <li className="flex items-center gap-[0.4cqw]">
                        <span className="text-[#e2231a]">•</span> corsi di lingue
                    </li>
                    <li className="flex items-center gap-[0.4cqw]">
                        <span className="text-[#e2231a]">•</span> gestione microcrisi
                    </li>
                    <li className="flex items-center gap-[0.4cqw]">
                        <span className="text-[#e2231a]">•</span> {t('ads.forma_courses')}
                    </li>
                </ul>
            </div>
        </div>
    );
};

const SupsiBanner = () => {
    const { t } = useTranslation();
    return (
        <div 
            className="w-full h-full flex select-none overflow-hidden" 
            style={{ 
                background: '#001E38', 
                containerType: 'inline-size', 
                height: '100%',
                width: '100%'
            }}
        >
            {/* Section 1: SUPSI Logo block */}
            <div 
                className="w-[28%] h-full bg-[#001428] flex flex-col justify-center items-start px-[2.5cqw] text-white font-sans shrink-0 border-r border-white/10" 
            >
                <span className="font-extrabold tracking-tight leading-none text-white" style={{ fontSize: 'clamp(14px, 3.5cqw, 32px)' }}>
                    SUPSI
                </span>
            </div>

            {/* Section 2: Course Info & Title */}
            <div className="w-[48%] h-full flex flex-col justify-center px-[3cqw] text-white font-sans text-left leading-normal shrink-0">
                <span className="font-bold uppercase tracking-wider text-[#e2231a] mb-[0.2cqw]" style={{ fontSize: 'clamp(7px, 1.1cqw, 11px)' }}>
                    Master Executive
                </span>
                <h4 
                    className="font-extrabold leading-tight tracking-wide text-white" 
                    style={{ fontSize: 'clamp(11px, 2.2cqw, 22px)' }}
                >
                    MAS Human Capital Management
                </h4>
                <div className="w-full h-[2px] bg-[#e2231a] my-[0.6cqw]"></div>
                <p className="font-medium text-slate-300 leading-tight" style={{ fontSize: 'clamp(7px, 1.2cqw, 12px)' }}>
                    {t('ads.supsi_desc')}
                </p>
            </div>

            {/* Section 3: Call to action button */}
            <div className="w-[24%] h-full bg-[#001930] flex flex-col justify-center items-center px-[1.5cqw] shrink-0">
                <div 
                    className="bg-[#e2231a] hover:bg-[#c11b13] text-white font-bold rounded-lg px-[2cqw] py-[1cqw] text-center shadow-lg flex items-center gap-[0.5cqw] transition-transform"
                    style={{ fontSize: 'clamp(8px, 1.3cqw, 13px)' }}
                >
                    <span>{t('ads.supsi_cta')}</span>
                    <span>→</span>
                </div>
            </div>
        </div>
    );
};

// ---------- ANIMATION VARIANTS ----------

const bannerVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.85,
            ease: [0.16, 1, 0.3, 1], // Elegant ease-out expo curve
            delay: i * 0.15
        }
    })
};

// ---------- GROUP DEFINITIONS ----------
// Group 1 ("top"): ASFL alone — no section title, unchanged visual style.
// Group 2 ("bottom"): Ated (FormaBanner) + BLC — wrapped under "Formazione continua" section title.
// Reordered 2026-08-01 per client request: Supsi declined, ASFL moved solo to top, Ated+BLC paired at bottom.

const topSlots = [
    { key: 'asfl', href: 'https://www.svbl.ch/it/', bg: '#f8f9fa', Component: AsflBanner }
];

const bottomSlots = [
    { key: 'ated', href: 'https://ated.ch/corsi-di-formazione-ict', bg: '#000000', Component: FormaBanner },
    { key: 'blc', href: 'https://www.blc-sa.ch', bg: '#ffffff', Component: BlcBanner }
    // TEMP: Supsi banner set aside per client request (2026-07-31) — re-enable if it comes back into rotation.
    // { key: 'supsi', href: 'https://formazionecontinua.supsi.ch/it/course-details?id=863-mas-human-capital-management', bg: '#001E38', Component: SupsiBanner }
];

// ---------- SECTION TITLE (pattern reused from Vetrini.jsx) ----------

const SectionTitle = ({ eyebrow, title, subtitle }) => {
    const N = 'var(--brand-navy)';
    const F = 'var(--brand-fuchsia)';
    const GM = 'var(--brand-gray-mid)';
    const brand = 'var(--font-brand)';
    const editorial = 'var(--font-editorial)';
    const body = 'var(--font-body)';

    return (
        <div className="mb-6 md:mb-8 text-left">
            <div className="flex items-center gap-3">
                <span style={{ width: 28, height: 2, background: F, display: 'inline-block' }} />
                <span style={{
                    fontFamily: brand,
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: F
                }}>
                    {eyebrow}
                </span>
            </div>
            <h2 style={{
                fontFamily: editorial,
                fontStyle: 'italic',
                fontSize: 'clamp(22px, 3vw, 32px)',
                color: N,
                lineHeight: 1.2,
                marginTop: 8
            }}>
                {title}
            </h2>
            {subtitle && (
                <p style={{
                    fontFamily: body,
                    fontSize: 14,
                    color: GM,
                    marginTop: 6,
                    maxWidth: 640
                }}>
                    {subtitle}
                </p>
            )}
        </div>
    );
};

// ---------- MAIN COMPONENT ----------

const AdBanner = ({ type = 'top' }) => {
    const { t } = useTranslation();
    const GM = 'var(--brand-gray-mid)';
    const body = 'var(--font-body)';
    const isTop = type === 'top';
    const slots = isTop ? topSlots : bottomSlots;

    return (
        <div className="w-[95%] mx-auto">
            {!isTop && (
                <SectionTitle
                    eyebrow="Formazione Continua"
                    title={t('ads.forma_alt')}
                />
            )}
            <div
                className={`w-full grid grid-cols-1 ${slots.length > 1 ? 'md:grid-cols-2' : ''} gap-4`}
                style={isTop ? {} : { gap: 1, background: 'rgba(5,11,43,0.06)' }}
            >
                {slots.map((slot, i) => {
                    const Banner = slot.Component;
                    return (
                        <motion.a
                            key={slot.key}
                            href={slot.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="overflow-hidden relative group block"
                            variants={bannerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.15 }}
                            custom={i}
                            style={{
                                backgroundColor: slot.bg,
                                position: 'relative',
                                display: 'block',
                                height: 235,
                                ...(!isTop && { border: '1.5px solid rgba(255,31,122,0.22)' })
                            }}
                            whileHover={{
                                boxShadow: '0 0 0 2px rgba(255,31,122,0.35), inset 0 0 0 1px rgba(255,31,122,0.12)',
                                transition: { duration: 0.2, ease: 'easeOut' }
                            }}
                        >
                            <span style={{
                                position: 'absolute', top: 10, right: 14,
                                fontFamily: body, fontSize: 9, fontWeight: 700,
                                letterSpacing: '0.22em', textTransform: 'uppercase',
                                color: GM, background: '#FFFFFF', padding: '3px 8px', zIndex: 10,
                                borderRadius: '4px',
                                border: '1px solid rgba(5,11,43,0.05)'
                            }}>ADV</span>

                            <Banner />
                        </motion.a>
                    );
                })}
            </div>
        </div>
    );
};

export default AdBanner;
