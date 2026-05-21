import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FollowerMilestone from './ui/follower-counter';
import { RotateCcw } from 'lucide-react';

const Stats = () => {
    const { t } = useTranslation();
    const [key, setKey] = useState(0);
    const handleReload = () => setKey((prev) => prev + 1);

    const brand = 'var(--font-brand)';
    const editorial = 'var(--font-editorial)';
    const body = 'var(--font-body)';
    const N = 'var(--brand-navy)';
    const F = 'var(--brand-fuchsia)';

    return (
        <section className="relative w-full overflow-hidden py-16 px-6 md:px-12 flex flex-col items-center justify-center min-h-[420px] bg-cover bg-center select-none"
            style={{
                // Gradiente Navy con overlay e immagine di sfondo ufficio sfocata in toni caldi/scuri per Midnight Luxe
                backgroundImage: `linear-gradient(to bottom, rgba(26, 37, 84, 0.94), rgba(10, 15, 45, 0.97)), url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop')`,
                backgroundAttachment: 'scroll'
            }}
        >
            {/* Sottile linea di bordo superiore per staccare dalla sezione precedente */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/5" />

            {/* Titolo di testa elegante in corsivo */}
            <p className="text-white/40 text-center italic text-lg md:text-xl mb-10"
                style={{ fontFamily: editorial }}
            >
                La piattaforma di riferimento per il lavoro in Svizzera
            </p>

            {/* Contenitore dei contatori in griglia a 2 colonne */}
            <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4 z-10">
                
                {/* Box 1: Offerte di lavoro */}
                <div className="border border-white/20 bg-white/5 backdrop-blur-md px-8 py-10 flex flex-col items-center justify-center rounded-none transition-all duration-500 hover:border-white/40 hover:bg-white/10">
                    <FollowerMilestone
                        targetCount={14899}
                        footerText="Offerte di lavoro online"
                        className="w-full"
                    />
                </div>

                {/* Box 2: Aziende */}
                <div className="border border-white/20 bg-white/5 backdrop-blur-md px-8 py-10 flex flex-col items-center justify-center rounded-none transition-all duration-500 hover:border-white/40 hover:bg-white/10">
                    <FollowerMilestone
                        targetCount={2320}
                        footerText="Aziende in tutta la Svizzera"
                        className="w-full"
                    />
                </div>

            </div>

            {/* Bottone Reload in basso a destra in stile rounded-none */}
            <button
                onClick={handleReload}
                className="absolute bottom-6 right-6 border border-white/20 bg-white/5 text-white hover:bg-white/20 p-3 rounded-none shadow-lg transition-all duration-300 active:scale-95 focus:outline-none z-20 cursor-pointer"
                title="Ricarica statistiche"
            >
                <RotateCcw className="w-5 h-5" />
            </button>
        </section>
    );
};

export default Stats;
