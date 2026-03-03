import React from 'react';

const Footer = () => {
    return (
        <footer className="w-full bg-surface text-background pt-24 pb-8 px-6 md:px-16 rounded-t-[4rem] relative overflow-hidden mt-[-2rem] z-20 shadow-[0_-20px_40px_rgba(0,0,0,0.1)]">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12 mb-24">
                <div className="w-full md:w-1/3">
                    <h2 className="font-drama font-bold text-3xl mb-4 tracking-tight">JobCourier</h2>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-8">
                        Il portale svizzero per trovare il tuo prossimo lavoro in un click. Precisione, velocità e un network locale forte.
                    </p>
                    <div className="flex items-center gap-3 bg-white/5 rounded-full px-4 py-2 w-max border border-white/10">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="font-mono text-xs tracking-wider uppercase text-gray-300">System Operational</span>
                    </div>
                </div>

                <div className="flex gap-16 md:gap-24 flex-wrap">
                    <div className="flex flex-col gap-4">
                        <h4 className="text-xs font-mono tracking-widest text-accent uppercase mb-2">Navigazione</h4>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Cerca Lavoro</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Aziende Vetrina</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Job Trends</a>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h4 className="text-xs font-mono tracking-widest text-accent uppercase mb-2">Servizi</h4>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Pubblica Offerta</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Gestione CV</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">FAQ Candidato</a>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h4 className="text-xs font-mono tracking-widest text-accent uppercase mb-2">Legale</h4>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Condizioni Generali</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Cookie Policy</a>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-gray-500 text-xs">© {new Date().getFullYear()} JobCourier. Tutti i diritti riservati.</p>
                <p className="text-gray-500 text-xs flex items-center gap-2">
                    Designed with <span className="text-accent">✦</span>
                </p>
            </div>
        </footer>
    );
};

export default Footer;
