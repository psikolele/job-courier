import React from 'react';

const Footer = () => {
    return (
        <footer className="w-full bg-surface text-background pt-24 pb-12 px-6 md:px-16 relative overflow-hidden mt-[-4rem] z-20 border-t border-white/5 shadow-[0_-30px_60px_rgba(0,0,0,0.3)]">
            {/* Subtle Gradient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>
            
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-16 mb-24">
                <div className="w-full md:w-1/3">
                    <h2 className="font-drama font-bold text-4xl mb-6 tracking-tight text-white">JobCourier</h2>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-10">
                        Il portale svizzero per trovare il tuo prossimo lavoro in un click. Precisione, velocità e un network locale forte.
                    </p>
                    <div className="flex items-center gap-3 bg-white/5 rounded-full px-5 py-2.5 w-max border border-white/10 hover:border-accent/40 transition-colors group cursor-default">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-gray-300 group-hover:text-white transition-colors">System Operational</span>
                    </div>
                </div>

                <div className="flex gap-16 md:gap-24 flex-wrap">
                    <div className="flex flex-col gap-5">
                        <h4 className="text-[10px] font-mono tracking-[0.3em] text-accent uppercase mb-3 opacity-80">Navigazione</h4>
                        <a href="#" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all text-sm">Cerca Lavoro</a>
                        <a href="#" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all text-sm">Aziende Vetrina</a>
                        <a href="#" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all text-sm">Job Trends</a>
                    </div>
                    <div className="flex flex-col gap-5">
                        <h4 className="text-[10px] font-mono tracking-[0.3em] text-accent uppercase mb-3 opacity-80">Servizi</h4>
                        <a href="#" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all text-sm">Pubblica Offerta</a>
                        <a href="#" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all text-sm">Gestione CV</a>
                        <a href="#" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all text-sm">FAQ Candidato</a>
                    </div>
                    <div className="flex flex-col gap-5">
                        <h4 className="text-[10px] font-mono tracking-[0.3em] text-accent uppercase mb-3 opacity-80">Legale</h4>
                        <a href="#" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all text-sm">Privacy Policy</a>
                        <a href="#" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all text-sm">Condizioni Generali</a>
                        <a href="#" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all text-sm">Cookie Policy</a>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-gray-500 text-[11px] tracking-wide">© {new Date().getFullYear()} JobCourier. Precision Swiss Recruiting.</p>
                <div className="flex items-center gap-6">
                    <p className="text-gray-500 text-[11px] flex items-center gap-2">
                        Designed with <span className="text-accent/60">✦</span> in Switzerland
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
