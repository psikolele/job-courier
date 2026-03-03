import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const Philosophy = () => {
    const sectionRef = useRef(null);
    const text1Ref = useRef(null);
    const text2Ref = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 75%',
                    end: 'bottom 25%',
                    toggleActions: 'play none none reverse'
                }
            });

            tl.fromTo(text1Ref.current,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
            )
                .fromTo(text2Ref.current,
                    { y: 50, opacity: 0 },
                    { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' },
                    "-=0.6"
                );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            id="philosophy"
            ref={sectionRef}
            className="relative w-full py-40 px-6 md:px-16 bg-surface overflow-hidden"
        >
            {/* Subtle parallax texture background */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=2000")',
                    backgroundAttachment: 'fixed',
                    backgroundPosition: 'center',
                    backgroundSize: 'cover'
                }}
            ></div>

            <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-start text-left">
                <p ref={text1Ref} className="text-xl md:text-3xl font-sans text-gray-400 mb-8 max-w-3xl leading-relaxed">
                    La maggior parte dei portali offre un mare di annunci confusi: <span className="text-white">perdita di tempo e disorganizzazione.</span>
                </p>
                <h2 ref={text2Ref} className="text-4xl md:text-7xl font-sans font-bold text-background leading-tight">
                    Noi ci concentriamo su: <br />
                    <span className="font-drama italic text-accent tracking-wide text-5xl md:text-8xl">incontri precisi.</span>
                </h2>
            </div>
        </section>
    );
};

export default Philosophy;
