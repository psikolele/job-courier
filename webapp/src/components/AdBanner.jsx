import React from 'react';

const AdBanner = () => {
    const N = 'var(--brand-navy)';
    const F = 'var(--brand-fuchsia)';
    const GM = 'var(--brand-gray-mid)';
    const body = 'var(--font-body)';
    const brand = 'var(--font-brand)';

    const ads = [
        { href: 'https://www.blc-sa.ch', img: '/img/Gemini_Generated_Image_ape98sape98sape9.png', alt: 'Business Learning Centre SA' },
        { href: 'https://www.wallmoss.ch/', img: '/img/Gemini_Generated_Image_lw18o4lw18o4lw18.png', alt: 'Wallmoss Interior Design' }
    ];

    return (
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 w-full mb-12 mt-6">
            <div className="w-full flex flex-col md:flex-row overflow-hidden" style={{ border: '1px solid rgba(5,11,43,0.07)', background: '#FFFFFF' }}>
                {ads.map((ad, i) => (
                    <div key={i} className="flex-1 overflow-hidden relative group" style={{
                        borderRight: i === 0 ? '1px solid rgba(5,11,43,0.07)' : 'none',
                        borderBottom: i === 0 ? '1px solid rgba(5,11,43,0.07)' : 'none'
                    }}>
                        <span style={{
                            position: 'absolute', top: 12, right: 16,
                            fontFamily: body,
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            color: GM,
                            background: '#FFFFFF',
                            padding: '3px 8px',
                            zIndex: 10
                        }}>ADV</span>
                        <a href={ad.href} target="_blank" rel="noopener noreferrer" className="block w-full relative" style={{ height: 180 }}>
                            <img src={ad.img} alt={ad.alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdBanner;
