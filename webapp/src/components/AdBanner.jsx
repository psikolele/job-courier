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

            {/* Middle team photo slice */}
            <div className="w-[47%] h-full relative overflow-hidden shrink-0">
                <img 
                    src="/img/banner-asfl-svbl.png" 
                    alt="ASFL SVBL Team" 
                    className="absolute max-w-none h-full top-0 object-cover"
                    style={{ left: '-19.05%', width: '174.15%' }}
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

            {/* Section 2: Cyber graphics slice */}
            <div className="w-[15%] h-full relative overflow-hidden shrink-0">
                <img 
                    src="/img/banner-forma-academy.png" 
                    alt="Cyber Security Graphics" 
                    className="absolute max-w-none h-full top-0 object-cover"
                    style={{ left: '-77.78%', width: '711.11%' }}
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

            {/* Section 4: Multimedia graphics slice */}
            <div className="w-[15%] h-full relative overflow-hidden shrink-0">
                <img 
                    src="/img/banner-forma-academy.png" 
                    alt="Multimedia Graphics" 
                    className="absolute max-w-none h-full top-0 object-cover"
                    style={{ left: '-240.0%', width: '400.0%' }}
                />
            </div>

            {/* Section 5: White logo area */}
            <div className="w-[14%] h-full bg-white flex flex-col justify-center items-center py-[1cqw] px-[1cqw] shrink-0">
                {/* Top Half: Formati Academy logo crop */}
                <div className="h-[45%] w-full relative overflow-hidden flex items-center justify-center">
                    <img 
                        src="/img/banner-forma-academy.png" 
                        alt="Formati Academy" 
                        className="absolute max-w-none h-[200%] top-0"
                        style={{ left: '-566.67%', width: '666.67%', objectFit: 'contain' }}
                    />
                </div>
                
                {/* Bottom Half: ATED logo and text stacked vertically for optimal 235px height layout */}
                <div className="h-[45%] w-full flex flex-col items-center justify-center mt-[0.5cqw] gap-[0.2cqw]">
                    {/* ATED SVG Logo */}
                    <svg viewBox="0 0 110 38" className="shrink-0" style={{ width: 'clamp(35px, 6.5cqw, 65px)', height: 'auto' }}>
                        <text x="2" y="27" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="26" fill="#000000" letterSpacing="-0.02em">ate</text>
                        <circle cx="83" cy="18" r="9" stroke="#FF1F7A" strokeWidth="3.6" fill="none" />
                        <circle cx="83" cy="18" r="3.2" fill="#FF1F7A" />
                        <line x1="92" y1="4" x2="92" y2="28" stroke="#000000" strokeWidth="3.6" strokeLinecap="round" />
                    </svg>
                    
                    {/* Text next to logo */}
                    <div 
                        className="flex flex-col text-black font-extrabold uppercase leading-none tracking-wider text-center justify-center shrink-0" 
                        style={{ fontSize: 'clamp(5px, 1.0cqw, 10px)' }}
                    >
                        <span>con il patrocinio</span>
                        <span className="mt-[0.2cqw]">di ated</span>
                    </div>
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
