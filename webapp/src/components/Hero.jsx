import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useTranslation } from 'react-i18next';

const Hero = () => {
    const containerRef = useRef(null);
    const candidateRef = useRef(null);
    const companyRef = useRef(null);
    const { t } = useTranslation();

    useEffect(() => {
        let ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            // Animate candidate side
            if(candidateRef.current && candidateRef.current.children) {
                tl.fromTo(
                    candidateRef.current.children,
                    { y: 40, opacity: 0 },
                    { y: 0, opacity: 1, duration: 1, stagger: 0.15 },
                    0.2
                );
            }

            // Animate company side
            if(companyRef.current && companyRef.current.children) {
                tl.fromTo(
                    companyRef.current.children,
                    { y: 40, opacity: 0 },
                    { y: 0, opacity: 1, duration: 1, stagger: 0.15 },
                    0.5
                );
            }
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative w-full min-h-[100dvh] flex flex-col md:flex-row overflow-hidden bg-primary pt-24"
        >
            {/* Background Image with Dark Overlay */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1577401239170-897942555fb3?auto=format&fit=crop&q=80&w=2000")',
                    backgroundPosition: 'center',
                    backgroundSize: 'cover'
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-primary/30"></div>
            </div>

            {/* Left Column: Candidates */}
            <div className="relative z-10 w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 py-12 border-b md:border-b-0 md:border-r border-white/10">
                <div ref={candidateRef} className="max-w-xl mx-auto md:ml-auto md:mr-0 text-background">
                    <p className="text-xl md:text-2xl font-mono text-accent mb-4 uppercase tracking-widest">
                        Candidati
                    </p>
                    <h1 className="leading-tight tracking-tighter mb-6">
                        <span className="block text-4xl md:text-5xl lg:text-6xl font-bold font-sans">
                            {t('hero.candidates.h1')}
                        </span>
                    </h1>
                    <p className="text-lg text-background/80 mb-10 max-w-md">
                        {t('hero.candidates.subtitle')}
                    </p>
                    <button className="w-full sm:w-auto overflow-hidden rounded-full bg-accent px-8 py-4 text-base font-semibold text-foreground transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]">
                        {t('hero.candidates.cta')}
                    </button>
                </div>
            </div>

            {/* Right Column: Companies */}
            <div className="relative z-10 w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 py-12">
                <div ref={companyRef} className="max-w-xl mx-auto md:mr-auto md:ml-0 text-background">
                    <p className="text-xl md:text-2xl font-mono text-white/50 mb-4 uppercase tracking-widest">
                        Aziende
                    </p>
                    <h1 className="leading-tight tracking-tighter mb-6">
                        <span className="block text-4xl md:text-5xl lg:text-6xl font-bold font-sans">
                            {t('hero.companies.h1')}
                        </span>
                    </h1>
                    <p className="text-lg text-background/80 mb-10 max-w-md">
                        {t('hero.companies.subtitle')}
                    </p>
                    <button className="w-full sm:w-auto overflow-hidden rounded-full bg-white/10 border border-white/20 hover:bg-white/20 px-8 py-4 text-base font-semibold text-white transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98] backdrop-blur-sm">
                        {t('hero.companies.cta')}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Hero;
