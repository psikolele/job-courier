import React from 'react';

const ads = [
    {
        href: 'https://ated.ch/corsi-di-formazione-ict?hsCtaAttrib=188270968997',
        img: '/img/banner-forma-academy.png',
        alt: 'Forma Academy — Corsi ICT',
        fit: 'cover',
        position: 'right center'
    },
    {
        href: 'https://www.blc-sa.ch',
        img: '/img/Gemini_Generated_Image_ape98sape98sape9.png',
        alt: 'Business Learning Centre SA',
        fit: 'cover'
    },
    {
        href: 'https://www.svbl.ch/it/',
        img: '/img/banner-asfl-svbl.png',
        alt: 'ASFL SVBL — Formazione Professionale Logistica',
        fit: 'contain'
    },
    {
        href: 'https://www.wallmoss.ch/',
        img: '/img/Gemini_Generated_Image_lw18o4lw18o4lw18.png',
        alt: 'Wallmoss Interior Design',
        fit: 'cover'
    }
];

const AdBanner = ({ startIndex = 0 }) => {
    const GM = 'var(--brand-gray-mid)';
    const body = 'var(--font-body)';
    const visibleAds = ads.slice(startIndex, startIndex + 2);

    return (
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 w-full my-6">
            <div
                className="w-full grid grid-cols-1 md:grid-cols-2"
                style={{ border: '1px solid rgba(5,11,43,0.07)', background: '#FFFFFF' }}
            >
                {visibleAds.map((ad, i) => (
                    <div
                        key={startIndex + i}
                        className="overflow-hidden relative group"
                        style={{ borderRight: i === 0 ? '1px solid rgba(5,11,43,0.07)' : 'none' }}
                    >
                        <span style={{
                            position: 'absolute', top: 10, right: 14,
                            fontFamily: body, fontSize: 9, fontWeight: 700,
                            letterSpacing: '0.22em', textTransform: 'uppercase',
                            color: GM, background: '#FFFFFF', padding: '3px 8px', zIndex: 10
                        }}>ADV</span>
                        <a
                            href={ad.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full relative"
                            style={{ height: 160 }}
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
    );
};

export default AdBanner;
