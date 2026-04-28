import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, ArrowRight, MessageSquare } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Pricing = () => {
    const containerRef = useRef(null);
    const [activeTab, setActiveTab] = useState('autonomia');

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.hero-line', {
                y: 20,
                opacity: 0,
                duration: 0.8,
                stagger: 0.08,
                ease: 'power2.out'
            });

            gsap.from('.section-reveal', {
                y: 30,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                scrollTrigger: {
                    trigger: '.section-trigger',
                    start: 'top 75%',
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
                    price: "CHF 199",
                    note: "+IVA",
                    desc: "Per assunzioni sporadiche e ricerca agile.",
                    features: ["Annuncio online 30gg", "Ricerche illimitate in DB", "Supporto clienti"],
                    tag: "Agile",
                },
                {
                    name: "Job Post Boost",
                    price: "CHF 249",
                    note: "+IVA",
                    desc: "Massima visibilità nel motore di ricerca.",
                    features: ["Annuncio in VETRINA 30gg", "Ricerche illimitate in DB", "Highlighting Premium"],
                    tag: "Consigliato",
                    highlight: true
                }
            ]
        },
        {
            category: "Multi-Pack",
            items: [
                {
                    name: "Pack 5 Boost",
                    price: "CHF 890",
                    oldPrice: "CHF 1'245",
                    features: ["5 Annunci in vetrina 30gg", "Ricerche illimitate in DB", "5 Sblocchi CV Premium"],
                    tag: "Risparmio -28%",
                },
                {
                    name: "Pack 10 Boost",
                    price: "CHF 1'690",
                    oldPrice: "CHF 2'490",
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
                    price: "CHF 2'990",
                    monthly: "CHF 498 / mese",
                    features: ["Annunci illimitati (6 mesi)", "50 Sblocchi CV", "Ricerche illimitate"],
                    cta: "Contattaci"
                },
                {
                    name: "FlexiPost 12M",
                    price: "CHF 4'790",
                    monthly: "CHF 399 / mese",
                    features: ["Annunci illimitati (12 mesi)", "100 Sblocchi CV", "Ricerche illimitate"],
                    cta: "Contattaci"
                }
            ]
        },
        {
            category: "ProRecruit (Abbonamenti)",
            items: [
                {
                    name: "ProRecruit 6M",
                    price: "CHF 3'690",
                    monthly: "CHF 615 / mese",
                    features: ["Annunci illimitati in vetrina", "300 Sblocchi CV", "Database illimitato"],
                    cta: "Contattaci"
                },
                {
                    name: "ProRecruit 12M",
                    price: "CHF 5'590",
                    monthly: "CHF 465 / mese",
                    features: ["Annunci illimitati in vetrina", "1'000 Sblocchi CV", "Data matching avanzato"],
                    cta: "Contattaci"
                }
            ]
        }
    ];

    return (
        <div ref={containerRef} className="bg-[#F4F6F8] min-h-screen overflow-x-hidden">

            {/* HERO */}
            <section className="relative min-h-[60vh] pt-32 pb-16 bg-white px-6 md:px-12 flex flex-col justify-center border-b border-[#E5E5E5]">
                <div className="container mx-auto w-full">
                    <div className="max-w-4xl">
                        <div className="hero-line overflow-hidden mb-4">
                            <span className="text-xs font-bold tracking-[0.3em] text-[#01498C] uppercase block">Soluzioni di Recruitment</span>
                        </div>
                        <h1 className="hero-line text-5xl md:text-7xl font-bold text-[#1a1a1a] leading-tight mb-6">
                            Cerchi candidati?<br />
                            <span className="text-[#01498C]">Noi li troviamo.</span>
                        </h1>
                        <p className="hero-line text-lg md:text-xl text-[#666] max-w-2xl font-normal leading-relaxed mb-8">
                            Ottimizziamo il tuo tempo e acceleriamo il recruiting con soluzioni basate su visibilità, database e matching avanzato.
                        </p>

                        <div className="hero-line flex flex-col sm:flex-row items-center gap-4">
                            <a
                                href="https://jobroom.jobcourier.ch/employer/register.php?ignoreRedirectingCookiesAll=1&lan=it&language=it"
                                className="inline-flex items-center gap-2 bg-[#01498C] px-8 py-4 rounded-lg text-sm font-bold tracking-wide text-white hover:bg-[#013dd6] transition-colors"
                            >
                                REGISTRATI GRATIS <ArrowRight size={16} />
                            </a>
                            <a href="#soluzioni" className="text-[#01498C] hover:text-[#013dd6] transition-colors font-bold text-sm tracking-wide">
                                Scopri i piani
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* TAB CONTROL */}
            <div id="soluzioni" className="sticky top-0 z-40 py-6 px-6 bg-white/95 backdrop-blur-sm border-b border-[#E5E5E5]">
                <div className="max-w-6xl mx-auto flex gap-2">
                    <button
                        onClick={() => setActiveTab('autonomia')}
                        className={`px-6 py-3 rounded-lg text-xs font-bold tracking-widest transition-all ${
                            activeTab === 'autonomia'
                                ? 'bg-[#01498C] text-white'
                                : 'bg-[#F4F6F8] text-[#666] hover:bg-[#E5E5E5]'
                        }`}
                    >
                        AUTONOMIA
                    </button>
                    <button
                        onClick={() => setActiveTab('richiesta')}
                        className={`px-6 py-3 rounded-lg text-xs font-bold tracking-widest transition-all ${
                            activeTab === 'richiesta'
                                ? 'bg-[#01498C] text-white'
                                : 'bg-[#F4F6F8] text-[#666] hover:bg-[#E5E5E5]'
                        }`}
                    >
                        PRODOTTI SU RICHIESTA
                    </button>
                </div>
            </div>

            {/* PRICING */}
            <section className="py-20 px-6 md:px-12 container mx-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'autonomia' ? (
                        <motion.div
                            key="autonomia"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-20"
                        >
                            {autonomia.map((section, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.08 * idx }}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-10 border-l-4 border-[#01498C] pl-6">
                                        <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] uppercase tracking-tight">{section.category}</h2>
                                        <p className="text-[#666] text-xs font-mono uppercase tracking-wide">{idx === 0 ? "// Instant" : "// Volume"}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {section.items.map((plan, pIdx) => (
                                            <div
                                                key={pIdx}
                                                className={`group relative bg-white border rounded-xl p-8 transition-all duration-300 hover:shadow-lg flex flex-col ${
                                                    plan.highlight ? 'border-[#01498C] shadow-md' : 'border-[#E5E5E5]'
                                                }`}
                                            >
                                                {plan.tag && (
                                                    <div className="absolute -top-3 right-6 text-xs font-bold text-white bg-[#01498C] px-3 py-1 rounded-full">
                                                        {plan.tag}
                                                    </div>
                                                )}

                                                <div className="mb-8">
                                                    <h3 className="text-2xl font-bold text-[#1a1a1a] mb-2">{plan.name}</h3>
                                                    <p className="text-[#666] text-sm">{plan.desc || "Efficienza garantita."}</p>
                                                </div>

                                                <div className="mb-8">
                                                    {plan.oldPrice && (
                                                        <span className="text-sm text-[#999] line-through mr-2">{plan.oldPrice}</span>
                                                    )}
                                                    <span className="text-4xl font-bold text-[#1a1a1a]">{plan.price}</span>
                                                    <span className="text-xs text-[#666] ml-2">{plan.note}</span>
                                                </div>

                                                <ul className="space-y-3 mb-8 flex-grow">
                                                    {plan.features.map((f, fIdx) => (
                                                        <li key={fIdx} className="flex items-start gap-3 text-[#666] text-sm">
                                                            <Check size={16} className="text-[#01498C] flex-shrink-0 mt-0.5" />
                                                            <span>{f}</span>
                                                        </li>
                                                    ))}
                                                </ul>

                                                <button className="w-full py-3 bg-[#1a1a1a] text-white font-bold text-xs tracking-widest rounded-lg hover:bg-[#01498C] transition-colors">
                                                    ACQUISTA
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="richiesta"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-20"
                        >
                            <div className="border-l-4 border-[#01498C] pl-6">
                                <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] uppercase tracking-tight mb-4">Strategia su Misura</h2>
                                <p className="text-[#666] text-lg leading-relaxed">Piani semestrali o annuali per aziende che necessitano di un flusso costante e illimitato di inserzioni.</p>
                            </div>

                            {requested.map((section, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.08 * idx }}
                                >
                                    <h3 className="text-xl font-bold text-[#1a1a1a] mb-10 flex items-center gap-4">
                                        <span className="w-2 h-2 bg-[#01498C] rounded-full" />
                                        {section.category}
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {section.items.map((plan, pIdx) => (
                                            <div key={pIdx} className="group bg-white border border-[#E5E5E5] p-8 rounded-xl transition-all duration-300 hover:shadow-lg flex flex-col">
                                                <div className="mb-6">
                                                    <h4 className="text-2xl font-bold text-[#1a1a1a] mb-1">{plan.name}</h4>
                                                    <p className="text-xs text-[#01498C] font-mono font-bold tracking-wide">{plan.monthly}</p>
                                                </div>

                                                <div className="text-3xl font-bold text-[#1a1a1a] mb-8">{plan.price} <span className="text-xs text-[#666]">+IVA</span></div>

                                                <ul className="space-y-3 mb-8 flex-grow">
                                                    {plan.features.map((f, fIdx) => (
                                                        <li key={fIdx} className="flex items-start gap-3 text-[#666] text-sm">
                                                            <Check size={16} className="text-[#01498C] flex-shrink-0 mt-0.5" />
                                                            <span>{f}</span>
                                                        </li>
                                                    ))}
                                                </ul>

                                                <button className="w-full py-3 border-2 border-[#01498C] text-[#01498C] font-bold text-xs tracking-widest rounded-lg hover:bg-[#01498C] hover:text-white transition-colors">
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

            {/* PROCESS */}
            <section className="bg-white py-20 px-6 md:px-12 border-t border-[#E5E5E5] section-trigger">
                <div className="container mx-auto">
                    <div className="section-reveal mb-12 max-w-2xl border-l-4 border-[#01498C] pl-6">
                        <h2 className="text-xs font-bold tracking-[0.3em] text-[#01498C] uppercase mb-4">Processo</h2>
                        <h3 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] leading-tight">Chirurgico.<br />Pochi click.</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
                        {[
                            { step: "01", title: "Registra", desc: "Compila il format, attiva l'account in pochi secondi." },
                            { step: "02", title: "Acquista", desc: "E-commerce integrato: PayPal, carta o bonifico." },
                            { step: "03", title: "Pubblica", desc: "Gestisci inserzioni in chiaro o in modalità anonima." },
                            { step: "04", title: "Ricerca", desc: "Accedi al database e sblocca i profili migliori." }
                        ].map((item, i) => (
                            <div key={i} className="section-reveal p-6 bg-[#F4F6F8] rounded-lg hover:shadow-sm transition-all duration-300">
                                <span className="text-3xl font-bold text-[#01498C] mb-4 block font-mono">{item.step}</span>
                                <h4 className="text-lg font-bold text-[#1a1a1a] mb-3 uppercase tracking-tight">{item.title}</h4>
                                <p className="text-[#666] text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 md:px-12 bg-[#F4F6F8]">
                <div className="container mx-auto">
                    <div className="section-reveal flex flex-col lg:flex-row items-center justify-between gap-8 bg-white border-4 border-[#01498C] p-10 md:p-16 rounded-2xl">
                        <div className="flex-1">
                            <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] leading-tight mb-6">Hai domande?<br /><span className="text-[#01498C]">Parliamone.</span></h2>
                            <p className="text-lg text-[#666] max-w-lg leading-relaxed mb-8">Ascolteremo attentamente i bisogni di reclutamento della tua organizzazione e offriamo la soluzione più adeguata.</p>
                            <a href="https://www.jobcourier.ch/contatti/" className="inline-flex items-center gap-2 bg-[#01498C] text-white px-8 py-4 rounded-lg font-bold text-sm tracking-wide hover:bg-[#013dd6] transition-colors">
                                CONTATTACI <MessageSquare size={18} />
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Pricing;
