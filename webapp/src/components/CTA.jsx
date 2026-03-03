import React, { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const CTA = () => {
    const [activeSide, setActiveSide] = useState(null); // 'left' or 'right'

    return (
        <section className="w-full min-h-[70vh] flex flex-col md:flex-row bg-background overflow-hidden relative border-t border-b border-gray-200">
            {/* Candidati Side */}
            <div
                className={`relative flex flex-col justify-center p-12 md:p-20 border-b md:border-b-0 md:border-r border-gray-200 group transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer ${activeSide === 'left' ? 'md:flex-[1.6] bg-white' : activeSide === 'right' ? 'md:flex-[0.4] bg-background' : 'md:flex-1 bg-background hover:bg-white/50'
                    }`}
                onMouseEnter={() => setActiveSide('left')}
                onMouseLeave={() => setActiveSide(null)}
                onClick={() => setActiveSide('left')}
            >
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className={`absolute top-0 right-0 p-8 transition-opacity duration-700 ${activeSide === 'left' ? 'opacity-10' : 'opacity-0'}`}>
                        <svg width="240" height="240" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="0.5" />
                            <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                <div className={`relative z-10 transition-all duration-700 flex flex-col h-full justify-center ${activeSide === 'right' ? 'md:opacity-40 md:scale-95' : 'opacity-100 scale-100'}`}>
                    <div className="flex items-center justify-between mb-8 w-full">
                        <span className="text-sm font-mono text-accent tracking-widest uppercase block">Per i Candidati</span>
                        <div className={`w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-primary transition-all duration-500 bg-white shadow-sm ${activeSide === 'left' ? 'translate-x-3 bg-accent border-accent text-white scale-110' : 'group-hover:translate-x-1'}`}>
                            <ArrowRight strokeWidth={activeSide === 'left' ? 2.5 : 1.5} size={activeSide === 'left' ? 24 : 20} className="transition-all" />
                        </div>
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-sans font-bold text-primary mb-6 tracking-tight transition-all duration-500 min-w-max">
                        Accedi al tuo<br />
                        <span className="font-drama italic text-accent">Prossimo Lavoro.</span>
                    </h2>

                    <div className={`overflow-hidden transition-all duration-700 transform origin-left ${activeSide === 'right' ? 'max-h-[500px] md:max-h-0 md:opacity-0 md:translate-y-4' : 'max-h-[500px] opacity-100 translate-y-0'}`}>
                        <p className="text-gray-600 mb-10 max-w-md text-lg">
                            Crea il tuo profilo, imposta gli alert per le posizioni desiderate e candidati con un singolo click.
                        </p>
                        <button className="relative overflow-hidden rounded-full bg-primary px-8 py-4 font-semibold text-background transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-lg">
                            Cerca Offerte
                        </button>
                    </div>
                </div>
            </div>

            {/* Aziende Side */}
            <div
                className={`relative flex flex-col justify-center p-12 md:p-20 bg-surface text-background group transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer ${activeSide === 'right' ? 'md:flex-[1.6]' : activeSide === 'left' ? 'md:flex-[0.4]' : 'md:flex-1'
                    }`}
                onMouseEnter={() => setActiveSide('right')}
                onMouseLeave={() => setActiveSide(null)}
                onClick={() => setActiveSide('right')}
            >
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className={`absolute bottom-0 left-0 p-8 transition-opacity duration-700 ${activeSide === 'right' ? 'opacity-10' : 'opacity-0'}`}>
                        <svg width="240" height="240" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 21V9C3 7.89543 3.89543 7 5 7H19C20.1046 7 21 7.89543 21 9V21M3 21H21M3 21H1M21 21H23M9 21V16C9 14.8954 9.89543 14 11 14H13C14.1046 14 15 14.8954 15 16V21" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                <div className={`relative z-10 transition-all duration-700 flex flex-col h-full justify-center ${activeSide === 'left' ? 'md:opacity-40 md:scale-95' : 'opacity-100 scale-100'}`}>
                    <div className="flex items-center justify-between mb-8 w-full flex-row-reverse md:flex-row">
                        <span className="text-sm font-mono text-accent tracking-widest uppercase block">Per le Aziende</span>
                        <div className={`w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white transition-all duration-500 bg-white/5 backdrop-blur-sm ${activeSide === 'right' ? '-translate-x-3 bg-white text-surface border-white scale-110' : 'group-hover:-translate-x-1'}`}>
                            <ArrowLeft strokeWidth={activeSide === 'right' ? 2.5 : 1.5} size={activeSide === 'right' ? 24 : 20} className="transition-all" />
                        </div>
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-sans font-bold text-white mb-6 tracking-tight transition-all duration-500 min-w-max">
                        Trova il Miglior<br />
                        <span className="font-drama italic text-accent">Talento.</span>
                    </h2>

                    <div className={`overflow-hidden transition-all duration-700 transform origin-left ${activeSide === 'left' ? 'max-h-[500px] md:max-h-0 md:opacity-0 md:translate-y-4' : 'max-h-[500px] opacity-100 translate-y-0'}`}>
                        <p className="text-gray-400 mb-10 max-w-md text-lg">
                            Pubblica le tue posizioni aperte, gestisci le candidature e incontra i professionisti che cerchi nel mercato svizzero.
                        </p>
                        <button className="relative overflow-hidden rounded-full bg-accent px-8 py-4 font-semibold text-foreground transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-lg">
                            Pubblica un'Offerta
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTA;
