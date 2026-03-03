import React from 'react';

const CTA = () => {
    return (
        <section className="w-full min-h-[80vh] flex flex-col md:flex-row bg-background">
            {/* Candidati Side */}
            <div className="flex-1 p-12 md:p-24 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-200 relative group overflow-hidden transition-colors duration-500 hover:bg-white">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
                    <svg width="200" height="200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1" />
                        <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <div className="relative z-10">
                    <span className="text-sm font-mono text-accent tracking-widest uppercase mb-4 block">Per i Candidati</span>
                    <h2 className="text-4xl md:text-6xl font-sans font-bold text-primary mb-6 tracking-tight">
                        Accedi al tuo<br />
                        <span className="font-drama italic">Prossimo Lavoro.</span>
                    </h2>
                    <p className="text-gray-600 mb-10 max-w-md">
                        Crea il tuo profilo, imposta gli alert per le posizioni desiderate e candidati con un singolo click. Entra nel network.
                    </p>
                    <button className="group relative overflow-hidden rounded-full bg-primary px-8 py-4 font-semibold text-background transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]">
                        Cerca Offerte
                    </button>
                </div>
            </div>

            {/* Aziende Side */}
            <div className="flex-1 p-12 md:p-24 flex flex-col justify-center bg-surface text-background relative group overflow-hidden">
                <div className="absolute bottom-0 left-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
                    <svg width="200" height="200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 21V9C3 7.89543 3.89543 7 5 7H19C20.1046 7 21 7.89543 21 9V21M3 21H21M3 21H1M21 21H23M9 21V16C9 14.8954 9.89543 14 11 14H13C14.1046 14 15 14.8954 15 16V21" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <div className="relative z-10">
                    <span className="text-sm font-mono text-accent tracking-widest uppercase mb-4 block">Per le Aziende</span>
                    <h2 className="text-4xl md:text-6xl font-sans font-bold text-white mb-6 tracking-tight">
                        Trova il Miglior<br />
                        <span className="font-drama italic text-accent">Talento.</span>
                    </h2>
                    <p className="text-gray-400 mb-10 max-w-md">
                        Pubblica le tue posizioni aperte, gestisci le candidature e incontra i professionisti che cerchi, focalizzati sul Ticino e sulla Svizzera.
                    </p>
                    <button className="group relative overflow-hidden rounded-full border border-white/20 bg-transparent px-8 py-4 font-semibold text-white transition-all duration-300 hover:bg-accent hover:text-foreground hover:border-transparent active:scale-[0.98]">
                        Pubblica un'Offerta
                    </button>
                </div>
            </div>
        </section>
    );
};

export default CTA;
