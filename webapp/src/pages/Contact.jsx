import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, Phone, MapPin, Send, MessageSquare, ArrowRight, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
    const containerRef = useRef(null);
    const { t } = useTranslation();

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Hero Reveal
            gsap.from('.hero-line', {
                y: 40,
                opacity: 0,
                duration: 1,
                stagger: 0.1,
                ease: 'power3.out'
            });

            // Section Stagger
            gsap.from('.section-reveal', {
                y: 30,
                opacity: 0,
                duration: 0.8,
                stagger: 0.2,
                scrollTrigger: {
                    trigger: '.section-trigger',
                    start: 'top 80%',
                }
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const contactInfo = [
        {
            icon: <Phone className="text-accent" size={24} />,
            label: t('contact.phone_label'),
            value: "+41 91 210 89 92",
            sub: t('contact.phone_hours')
        },
        {
            icon: <Mail className="text-accent" size={24} />,
            label: t('contact.email_label'),
            value: "sales@jobcourier.ch",
            sub: t('contact.email_sub')
        },
        {
            icon: <MapPin className="text-accent" size={24} />,
            label: t('contact.hq_label'),
            value: "Via delle Fornaci, 6",
            sub: "6826 Riva San Vitale, CH"
        }
    ];

    return (
        <div ref={containerRef} className="bg-[#f8f9fa] min-h-screen selection:bg-accent selection:text-white relative overflow-x-hidden">
            
            {/* HERO: THE DIALOGUE */}
            <section className="relative min-h-[70dvh] pt-40 pb-20 overflow-hidden bg-primary px-6 md:px-12 flex flex-col justify-center">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&q=80&w=2670" 
                        alt="Background" 
                        className="w-full h-full object-cover opacity-10 blur-[1px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/95 to-transparent" />
                </div>

                <div className="container mx-auto relative z-10 w-full">
                    <div className="max-w-5xl">
                        <div className="hero-line overflow-hidden mb-4">
                            <span className="text-xs font-bold tracking-[0.4em] text-accent uppercase block tracking-widest">{t('contact.protocol_label')}</span>
                        </div>
                        <h1 className="hero-line text-6xl md:text-8xl lg:text-9xl font-black text-white leading-[0.9] tracking-tighter mb-8">
                            {t('contact.hero_title')} <br />
                            <span className="italic font-drama text-accent text-5xl md:text-7xl lg:text-8xl">{t('contact.hero_em')}</span>
                        </h1>
                        <p className="hero-line text-xl md:text-2xl text-slate-300 max-w-2xl font-light leading-relaxed">
                            {t('contact.hero_sub')}
                        </p>
                    </div>
                </div>
            </section>

            {/* CONTACT INTERFACE: THE FUNCTIONAL ARTIFACT */}
            <section className="py-32 px-6 md:px-12 container mx-auto -mt-24 relative z-20 section-trigger">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
                    
                    {/* LEFT: TELEMETRY (INFO) */}
                    <div className="lg:col-span-5 space-y-12 section-reveal">
                        <div className="p-12 bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
                            <h2 className="text-sm font-bold text-accent tracking-[0.3em] uppercase mb-12">{t('contact.connection_label')}</h2>
                            
                            <div className="space-y-12">
                                {contactInfo.map((info, idx) => (
                                    <div key={idx} className="group flex items-start gap-6">
                                        <div className="p-4 bg-accent/5 rounded-2xl group-hover:bg-accent group-hover:text-white transition-all duration-500">
                                            {info.icon}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">{info.label}</p>
                                            <p className="text-xl font-bold text-primary mb-1">{info.value}</p>
                                            <p className="text-xs text-slate-500 font-medium">{info.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-16 pt-12 border-t border-slate-50">
                                <p className="text-sm text-slate-500 italic leading-relaxed">
                                    {t('contact.service_quote')}
                                </p>
                            </div>
                        </div>

                        {/* WARNING BLOCK FOR CANDIDATES */}
                        <div className="p-12 bg-primary rounded-[3rem] text-white">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                                <span className="text-[10px] font-bold tracking-[0.3em] uppercase">{t('contact.candidate_status')}</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-6">{t('contact.candidate_title')}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-8">
                                {t('contact.candidate_desc')}
                            </p>
                            <a 
                                href="https://jobroom.jobcourier.ch/job-seekers.php?lan=it&language=it"
                                className="inline-flex items-center gap-3 text-accent hover:text-white font-bold text-xs tracking-widest transition-colors"
                            >
                                {t('contact.register_portal')} <ArrowRight size={14} />
                            </a>
                        </div>
                    </div>

                    {/* RIGHT: THE MESSAGE ARCHIVE (FORM) */}
                    <div className="lg:col-span-7 section-reveal">
                        <div className="sticky top-40 bg-white p-12 md:p-16 rounded-[4rem] border border-slate-100 shadow-xl">
                            <div className="mb-12">
                                <h2 className="text-4xl font-black text-primary tracking-tighter mb-4 uppercase">{t('contact.form_title')}</h2>
                                <p className="text-slate-400 text-sm">{t('contact.form_sub')}</p>
                            </div>

                            <form className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('contact.name_label')}</label>
                                        <input 
                                            type="text" 
                                            placeholder="John Doe"
                                            className="w-full bg-slate-50 border-none rounded-2xl py-5 px-6 text-sm font-medium focus:ring-2 focus:ring-accent outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('contact.email_label')}</label>
                                        <input 
                                            type="email" 
                                            placeholder="john@company.ch"
                                            className="w-full bg-slate-50 border-none rounded-2xl py-5 px-6 text-sm font-medium focus:ring-2 focus:ring-accent outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('contact.company_label')}</label>
                                        <input 
                                            type="text" 
                                            placeholder="Your Co. Ltd"
                                            className="w-full bg-slate-50 border-none rounded-2xl py-5 px-6 text-sm font-medium focus:ring-2 focus:ring-accent outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('contact.sector_label')}</label>
                                        <select className="w-full bg-slate-50 border-none rounded-2xl py-5 px-6 text-sm font-medium focus:ring-2 focus:ring-accent outline-none transition-all appearance-none cursor-pointer">
                                            <option>{t('contact.sector_hr')}</option>
                                            <option>{t('contact.sector_dev')}</option>
                                            <option>{t('contact.sector_marketing')}</option>
                                            <option>{t('contact.sector_other')}</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('contact.message_label')}</label>
                                    <textarea 
                                        rows="5"
                                        placeholder={t('contact.message_placeholder')}
                                        className="w-full bg-slate-50 border-none rounded-3xl py-5 px-6 text-sm font-medium focus:ring-2 focus:ring-accent outline-none transition-all resize-none"
                                    ></textarea>
                                </div>

                                <div className="pt-6">
                                    <button className="group relative w-full overflow-hidden bg-primary py-6 rounded-3xl text-sm font-bold tracking-widest text-white transition-all hover:scale-[1.01] active:scale-95 shadow-xl shadow-primary/20">
                                        <span className="relative z-10 flex items-center justify-center gap-3">
                                            {t('contact.submit')} <Send size={16} />
                                        </span>
                                        <div className="absolute inset-0 bg-accent translate-x-full transition-transform duration-500 group-hover:translate-x-0" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-3 pt-6 border-t border-slate-50">
                                    <Check size={14} className="text-accent" />
                                    <p className="text-[10px] text-slate-400 font-medium">{t('contact.gdpr')}</p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* LOCATION: MAPPLACEHOLDER */}
            <section className="py-32 px-6 md:px-12 bg-white relative overflow-hidden section-reveal">
                 <div className="container mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
                        <div>
                            <h2 className="text-5xl md:text-7xl font-black text-primary leading-[0.9] tracking-tighter mb-8 italic font-drama">
                                {t('contact.location_title')} <br />
                                <span className="text-accent underline">{t('contact.location_em')}</span>
                            </h2>
                            <p className="text-xl text-slate-500 font-light leading-relaxed mb-12">
                                {t('contact.location_sub')}
                            </p>
                            <div className="flex gap-4">
                                <a 
                                    href="https://www.google.com/maps/search/Via+delle+Fornaci+6+6826+Riva+San+Vitale" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="bg-slate-100 hover:bg-slate-200 text-primary px-8 py-4 rounded-2xl font-bold text-xs tracking-widest transition-all"
                                >
                                    {t('contact.open_map')}
                                </a>
                            </div>
                        </div>
                        <div className="relative aspect-video rounded-[3rem] overflow-hidden group">
                             <img 
                                src="https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&q=80&w=2670" 
                                alt="Location" 
                                className="w-full h-full object-cover grayscale transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-accent/20 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        </div>
                    </div>
                 </div>
            </section>

        </div>
    );
};

export default Contact;
