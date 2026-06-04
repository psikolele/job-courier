import React from 'react';

const blcAd = {
    href: 'https://www.blc-sa.ch',
    img: '/img/Gemini_Generated_Image_ape98sape98sape9.png',
    alt: 'Business Learning Centre SA',
    fit: 'cover'
};

const ads = [blcAd, blcAd, blcAd, blcAd];

const AdBanner = () => {
    const GM = 'var(--brand-gray-mid)';
    const body = 'var(--font-body)';

    return (
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 w-full my-6">
            <div
                className="w-full grid grid-cols-2 gap-[1px]"
                style={{ border: '1px solid rgba(5,11,43,0.07)', background: 'rgba(5,11,43,0.07)' }}
            >
                {ads.map((ad, i) => (
                    <div
                        key={i}
                        className="overflow-hidden relative group bg-white"
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
