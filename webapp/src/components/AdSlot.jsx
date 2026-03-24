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

        if (slotRef.current) {
            observer.observe(slotRef.current);
        }

        return () => {
            if (observer) observer.disconnect();
        };
    }, []);

    return (
        <div ref={slotRef} className="w-full max-w-4xl mx-auto my-8 md:my-16 flex justify-center items-center px-4">
            {isVisible ? (
                <div className="w-full h-[100px] md:h-[150px] bg-white/5 border border-black/10 rounded-2xl flex flex-col items-center justify-center text-foreground/50 relative overflow-hidden group shadow-inner">
                    <span className="text-xs tracking-widest uppercase mb-1 opacity-70">Advertisement {id}</span>
                    {type === 'internal' ? (
                        <p className="font-mono text-sm group-hover:text-accent transition-colors">Spazio Sponsorizzato Premium</p>
                    ) : (
                        <p className="font-mono text-sm group-hover:text-accent transition-colors">AdSense Placeholder</p>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
            ) : (
                <div className="w-full h-[100px] md:h-[150px] bg-transparent"></div>
            )}
        </div>
    );
};

export default AdSlot;
