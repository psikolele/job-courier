import React, { useEffect } from 'react';

const N = 'var(--brand-navy)';
const F = 'var(--brand-fuchsia)';
const GL = 'var(--brand-gray-light)';
const GM = 'var(--brand-gray-mid)';
const brand = 'var(--font-brand)';
const editorial = 'var(--font-editorial)';
const body = 'var(--font-body)';

const SectionLabel = ({ children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ width: 28, height: 2, background: F, display: 'inline-block' }} />
        <span style={{ fontFamily: brand, fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: F }}>{children}</span>
    </div>
);

const CookiePolicy = () => {
    useEffect(() => {
        const script = document.createElement('script');
        script.id = 'CookieDeclaration';
        script.src = 'https://consent.cookiebot.com/c8321ae6-4887-462c-a2c0-44adc5a65104/cd.js';
        script.type = 'text/javascript';
        script.async = true;
        const container = document.getElementById('cookiebot-declaration');
        if (container) container.appendChild(script);
        return () => {
            if (container && script.parentNode === container) container.removeChild(script);
        };
    }, []);

    return (
        <div className="min-h-screen overflow-x-hidden" style={{ background: GL }}>
            {/* HERO */}
            <section className="relative min-h-[40vh] pt-32 pb-16 px-6 md:px-12 flex flex-col justify-center" style={{ background: N }}>
                <div className="container mx-auto w-full">
                    <div className="max-w-3xl">
                        <SectionLabel>Area Legale</SectionLabel>
                        <h1 style={{
                            fontFamily: brand, fontWeight: 900, fontSize: 'clamp(2rem, 8vw, 4.5rem)',
                            color: 'var(--brand-white)', textTransform: 'uppercase',
                            letterSpacing: '-0.025em', lineHeight: 0.95, marginBottom: 24
                        }}>
                            Cookie<br /><span style={{ color: F }}>Policy.</span>
                        </h1>
                        <p style={{ fontFamily: editorial, fontStyle: 'italic', fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>
                            Informativa sull'utilizzo dei cookie su jobcourier.ch
                        </p>
                    </div>
                </div>
            </section>

            {/* CONTENT — Cookiebot declaration */}
            <section className="py-20 px-6 md:px-12" style={{ background: 'var(--brand-white)' }}>
                <div className="container mx-auto max-w-3xl">
                    <div id="cookiebot-declaration" />
                </div>
            </section>
        </div>
    );
};

export default CookiePolicy;
