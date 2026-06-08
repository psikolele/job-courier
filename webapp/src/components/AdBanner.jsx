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

const bottomAds = [blcAd, blcAd, blcAd, blcAd, blcAd];

const AdBanner = ({ type = 'bottom' }) => {
    const N = 'var(--brand-navy)';
    const F = 'var(--brand-fuchsia)';
    const GM = 'var(--brand-gray-mid)';
    const brand = 'var(--font-brand)';
    const editorial = 'var(--font-editorial)';
    const body = 'var(--font-body)';
    const isTop = type === 'top';
    const adsToRender = isTop ? topAds : bottomAds;

    return (
        <div className="w-full px-6 md:px-12 mt-2 mb-6">
            <div className="max-w-[1400px] mx-auto w-full">

                {isTop && (
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                            <span style={{ width: 28, height: 2, background: F, display: 'inline-block' }} />
                            <span style={{ fontFamily: brand, fontWeight: 700, fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', color: F }}>
                                Aziende in vetrina
                            </span>
                        </div>
                        <h3 style={{ fontFamily: editorial, fontStyle: 'italic', fontSize: 32, color: N, lineHeight: 1.2, margin: 0 }}>
                            Società di formazione di riferimento in Svizzera
                        </h3>
                    </div>
                )}

                <div
                    className={`w-full grid ${isTop ? 'grid-cols-2 gap-4' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'}`}
                    style={isTop ? {} : { gap: 1, background: 'rgba(5,11,43,0.06)' }}
                >
                    {adsToRender.map((ad, i) => (
                        <motion.a
                            key={i}
                            href={ad.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="overflow-hidden relative group block"
                            style={{ backgroundColor: ad.bg, height: 235, position: 'relative', display: 'block' }}
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
                            <img
                                src={ad.img}
                                alt={ad.alt}
                                className={`w-full h-full object-${ad.fit} transition-all duration-500 grayscale group-hover:grayscale-0`}
                                style={ad.position ? { objectPosition: ad.position } : undefined}
                            />
                        </motion.a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdBanner;
