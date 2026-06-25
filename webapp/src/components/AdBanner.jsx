import React from 'react';
import { motion } from 'framer-motion';

const blcAd = {
    href: 'https://www.blc-sa.ch',
    img: '/img/Gemini_Generated_Image_ape98sape98sape9.png',
    alt: 'Business Learning Centre SA',
    fit: 'cover',
    bg: '#ffffff'
};

const topAds = [
    {
        href: 'https://www.asfl-svbl.ch/it/',
        img: '/img/banner-asfl-svbl.png',
        alt: 'ASFL SVBL - Associazione Svizzera per la formazione professionale in logistica',
        fit: 'contain',
        bg: '#f8f9fa'
    },
    {
        href: 'https://formati.academy/',
        img: '/img/banner-forma-academy.png',
        alt: 'Formati Academy - APF Percorsi',
        fit: 'contain',
        bg: '#ffffff'
    }
];

const bottomAds = [blcAd, blcAd];

// ---------- RECONSTRUCTED HTML BANNERS ----------

const AsflBanner = () => {
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
                    La logistica muove il mondo - Muoviti insieme a noi!
                </h4>
                <div className="w-full h-[2px] bg-[#ffff01] my-[0.8cqw]"></div>
                <p 
                    className="font-semibold opacity-95 leading-tight" 
                    style={{ fontSize: 'clamp(8px, 1.35cqw, 14px)' }}
                >
                    Associazione Svizzera per la formazione professionale in logistica
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
                        <span className="text-white">•</span> BUSINESS AI SPECIALIST
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
                        con il patrocinio di
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

// ---------- MAIN COMPONENT ----------

const AdBanner = ({ type = 'bottom' }) => {
    const GM = 'var(--brand-gray-mid)';
    const body = 'var(--font-body)';
    const isTop = type === 'top';
    const adsToRender = isTop ? topAds : bottomAds;

    return (
        <div className="w-[95%] mx-auto">
            <div
                className="w-full grid grid-cols-1 md:grid-cols-2 gap-4"
                style={isTop ? {} : { gap: 1, background: 'rgba(5,11,43,0.06)' }}
            >
                {adsToRender.map((ad, i) => (
                    <motion.a
                        key={i}
                        href={ad.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="overflow-hidden relative group block"
                        style={{
                            backgroundColor: ad.bg,
                            position: 'relative',
                            display: 'block',
                            height: 235,
                            ...(!isTop && { border: '1.5px solid rgba(255,31,122,0.22)' })
                        }}
                        whileHover={{ boxShadow: '0 0 0 2px rgba(255,31,122,0.35), inset 0 0 0 1px rgba(255,31,122,0.12)' }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                        <span style={{
                            position: 'absolute', top: 10, right: 14,
                            fontFamily: body, fontSize: 9, fontWeight: 700,
                            letterSpacing: '0.22em', textTransform: 'uppercase',
                            color: GM, background: '#FFFFFF', padding: '3px 8px', zIndex: 10,
                            borderRadius: '4px',
                            border: '1px solid rgba(5,11,43,0.05)'
                        }}>ADV</span>
                        
                        {isTop ? (
                            i === 0 ? <AsflBanner /> : <FormaBanner />
                        ) : (
                            <img
                                src={ad.img}
                                alt={ad.alt}
                                className={`w-full h-full object-${ad.fit}`}
                                style={ad.position ? { objectPosition: ad.position } : undefined}
                            />
                        )}
                    </motion.a>
                ))}
            </div>
        </div>
    );
};

export default AdBanner;
