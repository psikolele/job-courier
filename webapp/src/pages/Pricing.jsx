import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Shield, Zap, TrendingUp, Users, Building, ArrowRight, MessageSquare, Info } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Pricing = () => {
    const containerRef = useRef(null);
    const [activeTab, setActiveTab] = useState('autonomia');

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Hero reveal
            gsap.from('.hero-line', {
                y: 30,
                opacity: 0,
                duration: 1,
                stagger: 0.1,
                ease: 'power3.out'
            });

            // Static section reveals (Protocol & Manifesto)
            gsap.from('.section-reveal', {
                y: 40,
                opacity: 0,
                duration: 0.8,
                stagger: 0.15,
                scrollTrigger: {
                    trigger: '.section-trigger',
                    start: 'top 80%',
                }
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const autonomia = [
        {
            category: "Singoli Annunci",
            items: [
                {
                    name: "Job Post Basic",
                    price: "199.-",
                    note: "+IVA",
                    desc: "Per assunzioni sporadiche e ricerca agile.",
                    features: ["Annuncio online 30gg", "Ricerche illimitate in DB", "Supporto clienti"],
                    tag: "Agile",
                },
                {
                    name: "Job Post Boost",
                    price: "249.-",
                    note: "+IVA",
                    desc: "Massima visibilità nel motore di ricerca.",
                    features: ["Annuncio in VETRINA 30gg", "Ricerche illimitate in DB", "Highlighting Premium"],
                    tag: "Consigliato",
                }
            ]
        },
        {
            category: "Multi-Pack",
            items: [
                {
                    name: "Pack 5 Boost",
                    price: "890.-",
                    oldPrice: "1'245.-",
                    features: ["5 Annunci in vetrina 30gg", "Ricerche illimitate in DB", "5 Sblocchi CV Premium"],
                    tag: "Risparmio -28%",
                },
                {
                    name: "Pack 10 Boost",
                    price: "1'690.-",
                    oldPrice: "2'490.-",
                    features: ["10 Annunci in vetrina 30gg", "Ricerche illimitate in DB", "10 Sblocchi CV Premium"],
                    tag: "Risparmio -32%",
                }
            ]
        }
    ];

    const requested = [
        {
            category: "FlexiPost (Piani)",
            items: [
                {
                    name: "FlexiPost 6M",
                    price: "2'990.-",
                    monthly: "498.- / mese",
                    features: ["Annunci illimitati (6 mesi)", "50 Sblocchi CV", "Ricerche illimitate"],
                    cta: "contattaci"
                },
                {
                    name: "FlexiPost 12M",
                    price: "4'790.-",
                    monthly: "399.- / mese",
                    features: ["Annunci illimitati (12 mesi)", "100 Sblocchi CV", "Ricerche illimitate"],
                    cta: "contattaci"
                }
            ]
        },
        {
            category: "ProRecruit (Abbonamenti)",
            items: [
                {
                    name: "ProRecruit 6M",
                    price: "3'690.-",
                    monthly: "615.- / mese",
                    features: ["Annunci illimitati in vetrina", "300 Sblocchi CV", "Database illimitato"],
                    cta: "contattaci"
                },
                {
                    name: "ProRecruit 12M",
                    price: "5'590.-",
                    monthly: "465.- / mese",
                    features: ["Annunci illimitati in vetrina", "1'000 Sblocchi CV", "Data matching avanzato"],
                    cta: "contattaci"
                }
            ]
        }
    ];

    return (
        <div ref={containerRef} className="bg-[#f8f9fa] min-h-screen selection:bg-accent selection:text-white relative overflow-x-hidden">
            
            {/* NOISE OVERLAY - Refined for Cinematic Feel */}
            <div className="fixed inset-0 z-[999] pointer-events-none opacity-[0.03] mix-blend-overlay">
                <svg className="h-full w-full">
                    <filter id="noise">
                        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noise)" />
                </svg>
            </div>

            {/* HERO: CINEMATIC OPENING */}
            <section className="relative min-h-[85dvh] pt-40 pb-20 overflow-hidden bg-primary px-6 md:px-12 flex flex-col justify-center">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2670" 
                        alt="Background" 
                        className="w-full h-full object-cover grayscale opacity-20 scale-110 blur-[2px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent" />
                </div>

                <div className="container mx-auto relative z-10 w-full">
                    <div className="max-w-5xl">
                        <div className="hero-line overflow-hidden mb-4">
                            <span className="text-xs font-bold tracking-[0.4em] text-accent uppercase block">Protocollo Recruitment</span>
                        </div>
                        <h1 className="hero-line text-6xl md:text-8xl lg:text-9xl font-black text-white leading-[0.9] tracking-tighter mb-8">
                            Cerchi candidati? <br />
                            <span className="italic font-drama text-accent">Noi li troviamo.</span>
                        </h1>
                        <p className="hero-line text-xl md:text-2xl text-slate-300 max-w-2xl font-light leading-relaxed mb-12">
                            Ottimizziamo il tuo tempo e acceleriamo il tuo recruiting con soluzioni basate su visibilità, database e matching avanzato.
                        </p>
                        
                        <div className="hero-line flex flex-col sm:flex-row items-center gap-6">
                            <a 
                                href="https://jobroom.jobcourier.ch/employer/register.php?ignoreRedirectingCookiesAll=1&lan=it&language=it"
                                className="group relative w-full sm:w-auto overflow-hidden bg-accent px-12 py-5 rounded-[2rem] text-sm font-bold tracking-widest text-white transition-all hover:shadow-[0_20px_40px_rgba(47,157,229,0.3)] active:scale-95"
                            >
                                <span className="relative z-10">REGISTRATI GRATIS</span>
                                <div className="absolute inset-0 bg-white translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
                                <span className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-primary">Inizia Ora</span>
                            </a>
                            <a href="#soluzioni" className="text-white hover:text-accent transition-colors font-bold text-sm tracking-widest flex items-center gap-2">
                                SCOPRI I PIANI <ArrowRight size={16} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Status Indicator */}
                <div className="absolute bottom-12 right-12 hidden lg:flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_#4ade80]" />
                    <span className="text-[10px] font-mono font-bold text-white tracking-widest uppercase">System Operational // CH Market</span>
                </div>
            </section>

            {/* SEGMENTED CONTROL */}
            <div id="soluzioni" className="sticky top-[80px] z-50 py-8 px-6 backdrop-blur-md bg-[#f8f9fa]/80 border-b border-slate-200">
                <div className="max-w-2xl mx-auto flex p-1 bg-slate-200/50 rounded-full">
                    <button 
                        onClick={() => setActiveTab('autonomia')}
                        className={`flex-1 py-3 px-6 rounded-full text-xs font-bold tracking-widest transition-all ${activeTab === 'autonomia' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-primary'}`}
                    >
                        AUTONOMIA
                    </button>
                    <button 
                        onClick={() => setActiveTab('richiesta')}
                        className={`flex-1 py-3 px-6 rounded-full text-xs font-bold tracking-widest transition-all ${activeTab === 'richiesta' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-primary'}`}
                    >
                        PRODOTTI SU RICHIESTA
                    </button>
                </div>
            </div>

            {/* PRICING CONTENT */}
            <section className="py-24 px-6 md:px-12 container mx-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'autonomia' ? (
                        <motion.div 
                            key="autonomia"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="space-y-32"
                        >
                            {autonomia.map((section, idx) => (
                                <motion.div 
                                    key={idx} 
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 * idx }}
                                    className="reveal-stagger"
                                >
                                    <div className="flex flex-col md:flex-row items-baseline gap-4 mb-12 border-l-4 border-accent pl-8">
                                        <h2 className="text-3xl md:text-5xl font-black text-primary uppercase tracking-tighter">{section.category}</h2>
                                        <p className="text-slate-400 font-mono text-xs uppercase tracking-[0.2em]">{idx === 0 ? "// Instant Access" : "// Volume Scaling"}</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
                                        {section.items.map((plan, pIdx) => (
                                            <div key={pIdx} className="group relative bg-white border border-slate-100 p-12 rounded-[2.5rem] transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(38,54,123,0.12)] hover:border-accent/40 flex flex-col h-full overflow-hidden">
                                                <div className="absolute top-8 right-8 text-[10px] font-bold text-accent tracking-[0.3em] font-mono group-hover:translate-x-2 transition-transform">{plan.tag}</div>
                                                
                                                <div className="mb-10">
                                                    <h3 className="text-2xl font-bold text-primary mb-2">{plan.name}</h3>
                                                    <p className="text-slate-400 text-sm">{plan.desc || "Efficienza garantita."}</p>
                                                </div>

                                                <div className="mb-10 flex items-baseline gap-2">
                                                    {plan.oldPrice && <span className="text-lg text-slate-300 line-through font-light leading-none">{plan.oldPrice}</span>}
                                                    <span className="text-5xl font-black text-primary leading-none group-hover:text-accent transition-colors">{plan.price}</span>
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{plan.note}</span>
                                                </div>

                                                <ul className="space-y-4 mb-12 flex-grow">
                                                    {plan.features.map((f, fIdx) => (
                                                        <li key={fIdx} className="flex items-center gap-3 text-slate-600 text-[13px] font-medium">
                                                            <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                                                <Check size={12} strokeWidth={3} />
                                                            </div>
                                                            {f}
                                                        </li>
                                                    ))}
                                                </ul>

                                                <button className="relative w-full py-4 rounded-2xl bg-slate-900 overflow-hidden group/btn transition-transform hover:scale-[1.02]">
                                                    <span className="relative z-10 text-white font-bold text-xs tracking-widest">ACQUISTA</span>
                                                    <div className="absolute inset-0 bg-accent translate-x-full transition-transform duration-500 group-hover/btn:translate-x-0" />
                                                </button>

                                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {idx === 1 && (
                                        <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                                            <Info className="text-accent" size={16} />
                                            <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">SCADENZA: I pacchetti scadono con la pubblicazione dell’ultima inserzione.</p>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="richiesta"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="space-y-32"
                        >
                            <div className="max-w-3xl border-l-4 border-accent pl-8">
                                <h2 className="text-4xl md:text-6xl font-black text-primary uppercase tracking-tighter mb-4">Strategia su Misura</h2>
                                <p className="text-slate-500 text-lg leading-relaxed">Piani semestrali o annuali per aziende che necessitano di un flusso costante e illimitato di inserzioni, con supporto personalizzato.</p>
                            </div>

                            {requested.map((section, idx) => (
                                <motion.div 
                                    key={idx} 
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 * idx }}
                                >
                                    <h3 className="text-xl font-bold text-primary mb-12 flex items-center gap-4">
                                        <span className="w-8 h-[2px] bg-accent" />
                                        {section.category}
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        {section.items.map((plan, pIdx) => (
                                            <div key={pIdx} className="group bg-white border border-slate-100 p-12 rounded-[2.5rem] transition-all duration-500 hover:shadow-2xl hover:border-accent/40 flex flex-col">
                                                <div className="flex justify-between items-start mb-8">
                                                    <div>
                                                        <h4 className="text-2xl font-bold text-primary mb-1">{plan.name}</h4>
                                                        <p className="text-[10px] font-mono font-bold text-accent uppercase tracking-[0.2em]">{plan.monthly}</p>
                                                    </div>
                                                    <div className="p-3 bg-accent/5 rounded-2xl text-accent">
                                                        {idx === 0 ? <TrendingUp size={24} /> : <Shield size={24} />}
                                                    </div>
                                                </div>

                                                <div className="text-4xl font-black text-primary mb-10">{plan.price} <span className="text-xs font-bold text-slate-400"> +IVA</span></div>

                                                <ul className="space-y-4 mb-12 flex-grow">
                                                    {plan.features.map((f, fIdx) => (
                                                        <li key={fIdx} className="flex items-center gap-3 text-slate-600 text-sm">
                                                            <Check size={14} className="text-accent" /> {f}
                                                        </li>
                                                    ))}
                                                </ul>

                                                <button className="w-full border-2 border-primary text-primary py-4 rounded-xl font-bold text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all">
                                                    CONTATTACI
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* PROTOCOL: STACKING ARCHIVE */}
            <section className="bg-primary pt-32 pb-48 px-6 md:px-12 relative overflow-hidden section-trigger">
                <div className="container mx-auto">
                    <div className="section-reveal mb-24 max-w-xl">
                        <h2 className="text-xs font-bold tracking-[0.4em] text-accent uppercase mb-6">Il Protocollo</h2>
                        <h3 className="text-4xl md:text-7xl font-black text-white leading-tight">Chirurgico. <br /><span className="italic font-drama text-accent">Pochi click.</span></h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            { step: "01", title: "Registra", desc: "Compila il format, attiva l'account in pochi secondi." },
                            { step: "02", title: "Acquista", desc: "E-commerce integrato: PayPal, carta o bonifico." },
                            { step: "03", title: "Pubblica", desc: "Gestisci inserzioni in chiaro o in modalità anonima." },
                            { step: "04", title: "Ricerca", desc: "Accedi al database e sblocca i profili migliori." }
                        ].map((item, i) => (
                            <div key={i} className="group p-10 bg-white/5 rounded-[2.5rem] border border-white/10 hover:bg-white/10 hover:scale-[1.02] transition-all duration-500">
                                <span className="text-4xl font-black text-accent/20 group-hover:text-accent font-mono mb-8 block transition-colors">{item.step}</span>
                                <h4 className="text-lg font-bold text-white mb-4 uppercase tracking-widest">{item.title}</h4>
                                <p className="text-slate-400 text-sm leading-relaxed font-light">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] -mr-48 -mt-48" />
            </section>

            {/* BOTTOM HELP: THE MANIFESTO STYLE */}
            <section className="py-32 px-6 md:px-12 bg-white relative">
                <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 border-primary border-[1rem] p-16 md:p-32 rounded-[4rem] section-reveal">
                    <div className="flex-1">
                        <h2 className="text-5xl md:text-7xl font-black text-primary leading-none mb-8">Hai domande? <br /><span className="italic font-drama text-accent">Parliamone.</span></h2>
                        <p className="text-xl text-slate-500 max-w-lg leading-relaxed mb-12">Ascolteremo attentamente i bisogni di reclutamento della tua organizzazione e ti offriremo la soluzione più adeguata. Costruiamo insieme il futuro della tua Azienda.</p>
                        <a href="https://www.jobcourier.ch/contatti/" className="inline-flex items-center gap-4 bg-primary text-white px-12 py-5 rounded-full font-bold text-sm tracking-widest hover:bg-accent transition-all shadow-xl shadow-primary/20">
                            CONTATTACI <MessageSquare size={18} />
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Pricing;
