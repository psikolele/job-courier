import React from 'react';

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

const bottomAds = [blcAd, blcAd, blcAd, blcAd];

const AdBanner = ({ type = 'bottom' }) => {
    const GM = 'var(--brand-gray-mid)';
    const body = 'var(--font-body)';
    const isTop = type === 'top';
    const adsToRender = isTop ? topAds : bottomAds;

    return (
        <div className="w-full px-6 md:px-12 my-6">
            <div className="max-w-[1400px] mx-auto w-full">
                <div
                    className={`w-full grid ${isTop ? 'grid-cols-2 gap-4' : 'grid-cols-2 md:grid-cols-4 gap-[1px]'}`}
                    style={isTop ? {} : { border: '1px solid rgba(5,11,43,0.07)', background: 'rgba(5,11,43,0.07)' }}
                >
                    {adsToRender.map((ad, i) => (
                        <div
                            key={i}
                            className="overflow-hidden relative group"
                            style={{
                                backgroundColor: ad.bg,
                                borderBottom: isTop ? '2.5px solid var(--brand-fuchsia)' : undefined,
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
                            <a
                                href={ad.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full relative"
                                style={{ height: 235 }}
                            >
                                <img
                                    src={ad.img}
                                    alt={ad.alt}
                                    className={`w-full h-full object-${ad.fit} transition-transform duration-500 group-hover:scale-[1.02]`}
                                    style={ad.position ? { objectPosition: ad.position } : undefined}
                                />
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdBanner;
