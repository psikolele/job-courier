import React, { useEffect, useRef, useState } from 'react';

const AdSlot = ({ id, type = 'internal' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const slotRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' }
        );

        if (slotRef.current) observer.observe(slotRef.current);
        return () => { if (observer) observer.disconnect(); };
    }, []);

    const N = 'var(--brand-navy)';
    const F = 'var(--brand-fuchsia)';
    const GM = 'var(--brand-gray-mid)';
    const brand = 'var(--font-brand)';
    const body = 'var(--font-body)';

    return (
        <div ref={slotRef} className="w-full max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 my-12 flex justify-center items-center">
            {isVisible ? (
                <div className="w-full flex flex-col items-center justify-center relative overflow-hidden group"
                    style={{
                        height: 140,
                        background: '#FFFFFF',
                        border: '1px solid rgba(5,11,43,0.07)'
                    }}>
                    <span style={{
                        position: 'absolute', top: 12, right: 16,
                        fontFamily: body,
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: GM
                    }}>ADV {id}</span>
                    <span style={{
                        fontFamily: brand,
                        fontWeight: 700,
                        fontSize: 10,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: GM,
                        marginBottom: 6
                    }}>Spazio Sponsorizzato</span>
                    {type === 'internal' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: F, display: 'inline-block' }} />
                            <p style={{
                                fontFamily: brand,
                                fontWeight: 700,
                                fontSize: 14,
                                color: N,
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase'
                            }}>PREMIUM PARTNER</p>
                        </div>
                    ) : (
                        <p style={{ fontFamily: body, fontSize: 12, color: GM }}>AdSense Placeholder</p>
                    )}
                </div>
            ) : (
                <div className="w-full" style={{ height: 140, background: 'transparent' }} />
            )}
        </div>
    );
};

export default AdSlot;
