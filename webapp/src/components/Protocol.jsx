import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Protocol = () => {
    const containerRef = useRef(null);

    const cards = [
        { num: '01', title: 'Carica il Profilo', desc: 'Aggiungi il tuo CV e imposta i criteri di preferenza lavorativa (Cantone, Settore).' },
        { num: '02', title: 'Targetizzazione AI', desc: 'Ricevi e visualizza solo le offerte in linea con la tua identità professionale.' },
        { num: '03', title: 'Gestione Centralizzata', desc: 'Monitora e organizza tutte le tue candidature in una singola area personale intuitiva.' }
    ];

    useEffect(() => {
        let ctx = gsap.context(() => {
            const cardsEls = gsap.utils.toArray('.protocol-card');

            ScrollTrigger.create({
                trigger: containerRef.current,
                start: 'top top',
                end: `+=${cardsEls.length * 100}%`,
                pin: true,
            });

            cardsEls.forEach((card, index) => {
                if (index === cardsEls.length - 1) return; // leave last card as is

                gsap.to(card, {
                    yPercent: -10,
                    scale: 0.9,
                    opacity: 0.5,
                    filter: 'blur(10px)',
                    scrollTrigger: {
                        trigger: cardsEls[index + 1],
                        start: 'top 80%',
                        end: 'top 20%',
                        scrub: true,
                    }
                });
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section id="protocol" className="bg-background relative">
            <div ref={containerRef} className="h-[100dvh] w-full overflow-hidden relative">
                <div className="absolute top-20 left-0 w-full text-center z-10 pointer-events-none">
                    <h2 className="text-4xl md:text-5xl font-sans font-bold text-primary">
                        Fasi <span className="font-drama italic text-accent">Operative</span>
                    </h2>
                </div>

                {/* Stack Cards */}
                <div className="absolute inset-0 flex items-center justify-center p-6">
                    {cards.map((card, i) => (
                        <div
                            key={i}
                            className="protocol-card absolute w-full max-w-3xl h-[60dvh] md:h-[50dvh] glass-panel bg-white/80 rounded-[3rem] p-10 md:p-16 flex flex-col justify-center items-center text-center shadow-xl border border-gray-200"
                            style={{ zIndex: i + 10 }}
                        >
                            <div className="text-sm font-mono text-accent mb-8 tracking-widest bg-surface px-4 py-2 rounded-full inline-block">
                                STEP {card.num}
                            </div>
                            <h3 className="text-3xl md:text-5xl font-sans font-bold text-primary mb-6">
                                {card.title}
                            </h3>
                            <p className="text-base md:text-lg text-gray-600 max-w-xl">
                                {card.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Protocol;
