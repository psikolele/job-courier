import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Shield, Zap, TrendingUp, Users, Building } from 'lucide-react';

const Pricing = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.reveal-up', {
                y: 40,
                opacity: 0,
                duration: 1,
                stagger: 0.15,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.reveal-up',
                    start: 'top 85%',
                }
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const tiers = [
        {
            title: "Autonomia",
            description: "Pubblicazione singola per chi vuole gestire il processo in proprio.",
            plans: [
                { name: "Job Post Basic", price: "199.-", features: ["Validità 30 giorni", "Pubblicazione su JobRoom", "Dashboard candidati", "Assistenza via email"] },
                { name: "Job Post Boost", price: "249.-", features: ["Validità 30 giorni", "Pubblicazione su JobRoom", "Highlight nel motore di ricerca", "Refresh settimanale", "Social Media Push"] }
            ]
        },
        {
            title: "Abbonamenti",
            description: "Soluzioni continuative per aziende con flussi di recruitment costanti.",
            plans: [
                { name: "ProRecruit", price: "contattaci", features: ["Post illimitati", "Accesso al database CV", "Personal Branding", "Recruiter dedicato"] },
                { name: "FlexiPost", price: "contattaci", features: ["Crediti flessibili", "Nessun canone fisso", "Priorità nelle ricerche", "Reporting avanzato"] }
            ]
        },
        {
            title: "Multi-pack",
            description: "Pacchetti prepagati per massimizzare il risparmio.",
            plans: [
                { name: "Pack 5 Annunci", price: "899.-", features: ["Sconto 10% sul prezzo base", "Validità 12 mesi", "Gestione centralizzata", "Crediti riutilizzabili"] },
                { name: "Pack 10 Annunci", price: "1590.-", features: ["Sconto 20% sul prezzo base", "Validità 12 mesi", "Priority support", "Post Boost incluso (2x)"] }
            ]
        }
    ];

    return (
        <div ref={containerRef} className="bg-[#F5FBFC] min-h-screen overflow-x-hidden">
            {/* HERO SECTION */}
            <section className="relative h-[80dvh] flex items-end pb-32 px-6 md:px-12 overflow-hidden">
                <div className="absolute inset-0">
                    <img 
                        src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2670" 
                        alt="Background" 
                        className="w-full h-full object-cover grayscale opacity-40 scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-[#0B132B]/60 to-transparent" />
                </div>
                
                <div className="relative z-10 max-w-7xl w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-sm font-bold tracking-[0.3em] text-accent uppercase mb-4">Soluzioni Veloci</h2>
                        <h1 className="text-5xl md:text-8xl font-black text-white leading-tight">
                            Cerchi candidati? <br />
                            <span className="italic font-drama text-accent">Noi li troviamo.</span>
                        </h1>
                        <p className="mt-8 text-xl text-slate-300 max-w-2xl font-light leading-relaxed">
                            Scegli il protocollo più adatto alle tue esigenze di crescita. Dal singolo annuncio a pacchetti multicanale ad alta performance.
                        </p>
                        <div className="mt-12 flex flex-wrap gap-4">
                            <button className="bg-accent hover:bg-white hover:text-primary text-white px-10 py-5 rounded-[2rem] font-bold text-sm tracking-widest transition-all duration-300 active:scale-95 shadow-xl shadow-accent/20">
                                PUBBLICA ORA
                            </button>
                            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white px-10 py-5 rounded-[2rem] font-bold text-sm tracking-widest transition-all duration-300">
                                PARLA CON NOI
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* PRICING GRID */}
            <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
                {tiers.map((tier, idx) => (
                    <div key={idx} className="mb-32 last:mb-0">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 reveal-up">
                            <div className="max-w-xl">
                                <h3 className="text-3xl md:text-4xl font-black text-primary mb-4 flex items-center gap-3">
                                    <span className="w-10 h-1 hover:bg-accent bg-primary/20 transition-all duration-500" />
                                    {tier.title}
                                </h3>
                                <p className="text-slate-500 text-lg leading-relaxed">{tier.description}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {tier.plans.map((plan, pIdx) => (
                                <div 
                                    key={pIdx} 
                                    className="reveal-up group bg-white p-10 md:p-12 rounded-[2.5rem] border border-slate-100 hover:border-accent/40 transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(47,157,229,0.1)] flex flex-col h-full relative overflow-hidden"
                                >
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-accent/10 transition-colors duration-500">
                                                {idx === 0 ? <Zap className="text-accent" /> : idx === 1 ? <Shield className="text-accent" /> : <TrendingUp className="text-accent" />}
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Prezzo</span>
                                                <div className="text-3xl font-black text-primary group-hover:text-accent transition-colors">
                                                    {plan.price} {plan.price !== "contattaci" && <span className="text-sm font-bold text-slate-400">CHF</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <h4 className="text-2xl font-bold text-primary mb-6">{plan.name}</h4>
                                        
                                        <ul className="space-y-4 mb-10 flex-grow">
                                            {plan.features.map((f, fIdx) => (
                                                <li key={fIdx} className="flex items-center gap-3 text-slate-600 text-sm">
                                                    <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center">
                                                        <Check size={12} className="text-accent" />
                                                    </div>
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>

                                        <button className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-xs tracking-widest hover:bg-accent transition-all duration-300">
                                            SELEZIONA PIANO
                                        </button>
                                    </div>
                                    
                                    {/* Decorative background element */}
                                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-all" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </section>

            {/* HOW IT WORKS MINI ARTIFACT */}
            <section className="bg-primary pt-32 pb-48 px-6 md:px-12 relative overflow-hidden">
                <div className="max-w-7xl mx-auto text-center reveal-up">
                    <h2 className="text-sm font-bold tracking-[0.3em] text-accent uppercase mb-6">Il Protocollo</h2>
                    <h3 className="text-4xl md:text-6xl font-black text-white mb-20 italic font-drama">Semplice. Chirurgico.</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
                        {[
                            { step: "01", title: "Configurazione", desc: "Scegli il piano e inviaci i dettagli della tua posizione aperta." },
                            { step: "02", title: "Targeting", desc: "Il nostro sistema distribuisce l'annuncio sui canali più performanti." },
                            { step: "03", title: "Consegna", desc: "Ricevi i candidati migliori direttamente nella tua dashboard o email." }
                        ].map((item, i) => (
                            <div key={i} className="group p-8 bg-white/5 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all duration-500">
                                <span className="text-5xl font-black text-accent/20 group-hover:text-accent/40 transition-all leading-none">{item.step}</span>
                                <h4 className="text-xl font-bold text-white mt-4 mb-4">{item.title}</h4>
                                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Pricing;
