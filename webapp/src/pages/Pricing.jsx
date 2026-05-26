import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, ArrowRight, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
    HoverSlider,
    HoverSliderImage,
    HoverSliderImageWrap,
    TextStaggerHover,
    SlideDescription,
} from '@/components/ui/animated-slideshow';

gsap.registerPlugin(ScrollTrigger);

const N = 'var(--brand-navy)';
const F = 'var(--brand-fuchsia)';
const GL = 'var(--brand-gray-light)';
const GM = 'var(--brand-gray-mid)';
const brand = 'var(--font-brand)';
const editorial = 'var(--font-editorial)';
const body = 'var(--font-body)';

const PROCESSO_SLIDES = [
    { id: 'slide-1', title: 'Soluzioni Veloci', subtitle: 'SOLUZIONI. VELOCI.', desc: 'Assumi più velocemente grazie alle nostre soluzioni di reclutamento. La visibilità del nostro portale e l\'ampio database di candidati ti permettono di trovare rapidamente i candidati più qualificati per le tue posizioni aperte.', imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop' },
    { id: 'slide-2', title: 'Recruiting Semplificato', subtitle: 'RECRUITING SEMPLIFICATO', desc: 'JobCourier ti offre una piattaforma intuitiva e facile da usare, che ti permette di gestire tutte le fasi del tuo processo di recruiting da un unico punto di accesso.', imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1200&auto=format&fit=crop' },
    { id: 'slide-3', title: 'Più Efficienza, Meno Costi', subtitle: 'PIÙ EFFICIENZA, MENO COSTI', desc: 'Massimizza il tuo tempo. JobCourier trova i candidati giusti per te. Il nostro sistema di matching avanzato ti permette di identificare rapidamente i candidati che possiedono le competenze e le esperienze richieste per il tuo ruolo.', imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1200&auto=format&fit=crop' },
    { id: 'slide-4', title: 'Soluzioni Personalizzate', subtitle: 'SOLUZIONI PERSONALIZZATE', desc: 'Recluta con sicurezza grazie a un partner affidabile e strategico. Il nostro team di esperti è sempre a tua disposizione per offrirti assistenza e supporto personalizzato e studiare insieme strategie di recruiting efficaci.', imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop' },
];

const SectionLabel = ({ children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ width: 28, height: 2, background: F, display: 'inline-block' }} />
        <span style={{ fontFamily: brand, fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: F }}>{children}</span>
    </div>
);

const NavyButton = ({ href, onClick, children, fullWidth = false }) => (
    <a href={href} onClick={onClick} className="inline-flex items-center justify-center gap-2 transition-opacity hover:opacity-80"
        style={{
            background: N, color: '#FFFFFF', border: 'none',
            padding: '14px 28px',
            fontFamily: brand, fontWeight: 700, fontSize: 11,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            cursor: 'pointer', borderRadius: 0,
            width: fullWidth ? '100%' : 'auto',
            textDecoration: 'none'
        }}>
        {children}
    </a>
);

const FuchsiaButton = ({ href, onClick, children, fullWidth = false }) => (
    <a href={href} onClick={onClick} className="inline-flex items-center justify-center gap-2 transition-opacity hover:opacity-80"
        style={{
            background: F, color: '#FFFFFF', border: 'none',
            padding: '14px 28px',
            fontFamily: brand, fontWeight: 700, fontSize: 11,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            cursor: 'pointer', borderRadius: 0,
            width: fullWidth ? '100%' : 'auto',
            textDecoration: 'none'
        }}>
        {children}
    </a>
);

const OutlineButton = ({ href, onClick, children, fullWidth = false }) => (
    <a href={href} onClick={onClick} className="inline-flex items-center justify-center gap-2 transition-colors"
        style={{
            background: 'transparent', color: N,
            border: `1.5px solid ${N}`,
            padding: '14px 28px',
            fontFamily: brand, fontWeight: 700, fontSize: 11,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            cursor: 'pointer', borderRadius: 0,
            width: fullWidth ? '100%' : 'auto',
            textDecoration: 'none'
        }}>
        {children}
    </a>
);

const Pricing = () => {
    const containerRef = useRef(null);
    const [activeTab, setActiveTab] = useState('autonomia');
    const { t } = useTranslation();

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.hero-line', { y: 20, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power2.out' });
            gsap.from('.section-reveal', { y: 30, opacity: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.section-trigger', start: 'top 75%' } });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const autonomia = [
        { category: 'Singoli Annunci', items: [
            { name: 'Job Post Basic', price: 'CHF 199', note: '+IVA', desc: 'Per assunzioni sporadiche e ricerca agile.', features: ['Annuncio online 30gg', 'Ricerche illimitate in DB', 'Supporto clienti'], tag: 'Agile' },
            { name: 'Job Post Boost', price: 'CHF 249', note: '+IVA', desc: 'Massima visibilità nel motore di ricerca.', features: ['Annuncio in VETRINA 30gg', 'Ricerche illimitate in DB', 'Highlighting Premium'], tag: 'Consigliato', highlight: true }
        ]},
        { category: 'Multi-Pack', items: [
            { name: 'Pack 5 Boost', price: 'CHF 890', oldPrice: 'CHF 1\'245', features: ['5 Annunci in vetrina 30gg', 'Ricerche illimitate in DB', '5 Sblocchi CV Premium'], tag: 'Risparmio -28%' },
            { name: 'Pack 10 Boost', price: 'CHF 1\'690', oldPrice: 'CHF 2\'490', features: ['10 Annunci in vetrina 30gg', 'Ricerche illimitate in DB', '10 Sblocchi CV Premium'], tag: 'Risparmio -32%' }
        ]}
    ];

    const requested = [
        { category: 'FlexiPost (Piani)', items: [
            { name: 'FlexiPost 6M', price: 'CHF 2\'990', monthly: 'CHF 498 / mese', features: ['Annunci illimitati (6 mesi)', '50 Sblocchi CV', 'Ricerche illimitate'], cta: 'Contattaci' },
            { name: 'FlexiPost 12M', price: 'CHF 4\'790', monthly: 'CHF 399 / mese', features: ['Annunci illimitati (12 mesi)', '100 Sblocchi CV', 'Ricerche illimitate'], cta: 'Contattaci' }
        ]},
        { category: 'ProRecruit (Abbonamenti)', items: [
            { name: 'ProRecruit 6M', price: 'CHF 3\'690', monthly: 'CHF 615 / mese', features: ['Annunci illimitati in vetrina', '300 Sblocchi CV', 'Database illimitato'], cta: 'Contattaci' },
            { name: 'ProRecruit 12M', price: 'CHF 5\'590', monthly: 'CHF 465 / mese', features: ['Annunci illimitati in vetrina', '1\'000 Sblocchi CV', 'Data matching avanzato'], cta: 'Contattaci' }
        ]}
    ];

    return (
        <div ref={containerRef} className="min-h-screen overflow-x-hidden" style={{ background: GL }}>

            {/* HERO */}
            <section className="relative min-h-[60vh] pt-32 pb-20 px-6 md:px-12 flex flex-col justify-center" style={{ background: N }}>
                <div className="container mx-auto w-full">
                    <div className="max-w-4xl">
                        <div className="hero-line"><SectionLabel>Soluzioni di Recruitment</SectionLabel></div>
                        <p className="hero-line" style={{ fontFamily: editorial, fontStyle: 'italic', fontSize: 24, color: 'rgba(255,255,255,0.4)', marginBottom: 16, lineHeight: 1.2 }}>
                            {t('pricing.hero_sub')}
                        </p>
                        <h1 className="hero-line" style={{
                            fontFamily: brand, fontWeight: 900,
                            fontSize: 'clamp(2rem, 8vw, 4rem)',
                            color: '#FFFFFF',
                            textTransform: 'uppercase',
                            letterSpacing: '-0.025em',
                            lineHeight: 0.9,
                            marginBottom: 8
                        }}>{t('pricing.hero_title')}</h1>
                        <h1 className="hero-line" style={{
                            fontFamily: brand, fontWeight: 900,
                            fontSize: 'clamp(2rem, 8vw, 4rem)',
                            color: F,
                            textTransform: 'uppercase',
                            letterSpacing: '-0.025em',
                            lineHeight: 0.9,
                            marginBottom: 40
                        }}>{t('pricing.hero_em')}</h1>

                        <div className="hero-line flex flex-col sm:flex-row items-start gap-4">
                            <FuchsiaButton href="https://jobroom.jobcourier.ch/employer/register.php?ignoreRedirectingCookiesAll=1&lan=it&language=it" fullWidth>
                                {t('pricing.cta_register')} →
                            </FuchsiaButton>
                            <a href="#soluzioni" style={{
                                fontFamily: brand, fontWeight: 700, fontSize: 11,
                                letterSpacing: '0.14em', textTransform: 'uppercase',
                                color: 'rgba(255,255,255,0.6)',
                                padding: '14px 0',
                                textDecoration: 'none'
                            }} className="hover:opacity-100 transition-opacity">
                                {t('pricing.cta_discover')} →
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* TAB CONTROL */}
            <div id="soluzioni" className="sticky top-0 z-40 py-4 px-6" style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(5,11,43,0.07)' }}>
                <div className="max-w-6xl mx-auto flex" style={{ border: `1.5px solid rgba(5,11,43,0.1)`, width: 'fit-content' }}>
                    {[['autonomia', t('pricing.tab_autonomia')], ['richiesta', t('pricing.tab_richiesta')]].map(([key, label], i) => (
                        <button key={key} onClick={() => setActiveTab(key)} style={{
                            background: activeTab === key ? N : 'transparent',
                            color: activeTab === key ? '#FFFFFF' : GM,
                            border: 'none',
                            padding: '12px 28px',
                            fontFamily: brand, fontWeight: 700, fontSize: 10,
                            letterSpacing: '0.14em', textTransform: 'uppercase',
                            cursor: 'pointer',
                            borderRight: i === 0 ? '1.5px solid rgba(5,11,43,0.1)' : 'none'
                        }}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* PRICING */}
            <section className="py-20 px-6 md:px-12 container mx-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'autonomia' ? (
                        <motion.div key="autonomia" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="space-y-20">
                            {autonomia.map((section, idx) => (
                                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 * idx }}>
                                    <div className="mb-10">
                                        <SectionLabel>{idx === 0 ? '01 / Instant' : '02 / Volume'}</SectionLabel>
                                        <h2 style={{
                                            fontFamily: brand, fontWeight: 900,
                                            fontSize: 42,
                                            color: N,
                                            textTransform: 'uppercase',
                                            letterSpacing: '-0.02em',
                                            lineHeight: 1
                                        }}>{section.category}</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 1, background: 'rgba(5,11,43,0.06)' }}>
                                        {section.items.map((plan, pIdx) => (
                                            <div key={pIdx} className="group relative transition-colors flex flex-col min-w-0"
                                                style={{
                                                    background: plan.highlight ? GL : '#FFFFFF',
                                                    padding: '40px 36px',
                                                    borderLeft: plan.highlight ? `3px solid ${F}` : 'none'
                                                }}>
                                                {plan.tag && (
                                                    <span style={{
                                                        position: 'absolute', top: 24, right: 24,
                                                        fontFamily: brand, fontWeight: 700, fontSize: 9,
                                                        letterSpacing: '0.18em', textTransform: 'uppercase',
                                                        color: F,
                                                        background: 'transparent'
                                                    }}>● {plan.tag}</span>
                                                )}

                                                <div className="mb-8">
                                                    <h3 style={{ fontFamily: brand, fontWeight: 900, fontSize: 26, color: N, textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: 8 }}>{plan.name}</h3>
                                                    <p style={{ fontFamily: body, fontSize: 13, color: GM, lineHeight: 1.5 }}>{plan.desc || 'Efficienza garantita.'}</p>
                                                </div>

                                                <div className="mb-8">
                                                    {plan.oldPrice && (
                                                        <span style={{ fontFamily: body, fontSize: 14, color: GM, textDecoration: 'line-through', marginRight: 10 }}>{plan.oldPrice}</span>
                                                    )}
                                                    <span style={{ fontFamily: brand, fontWeight: 900, fontSize: 40, color: F, letterSpacing: '-0.02em' }}>{plan.price}</span>
                                                    <span style={{ fontFamily: body, fontSize: 12, color: GM, marginLeft: 8 }}>{plan.note}</span>
                                                </div>

                                                <ul className="space-y-3 mb-8 flex-grow">
                                                    {plan.features.map((f, fIdx) => (
                                                        <li key={fIdx} className="flex items-start gap-3" style={{ fontFamily: body, fontSize: 13, color: N }}>
                                                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: F, marginTop: 8, flexShrink: 0, display: 'inline-block' }} />
                                                            <span>{f}</span>
                                                        </li>
                                                    ))}
                                                </ul>

                                                <NavyButton fullWidth>{t('pricing.buy')} →</NavyButton>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div key="richiesta" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="space-y-20">
                            <div>
                                <SectionLabel>Strategia</SectionLabel>
                                <h2 style={{
                                    fontFamily: brand, fontWeight: 900, fontSize: 48, color: N,
                                    textTransform: 'uppercase', letterSpacing: '-0.025em', lineHeight: 0.95, marginBottom: 16
                                }}>{t('pricing.strategy_title')}</h2>
                                <p style={{ fontFamily: editorial, fontStyle: 'italic', fontSize: 20, color: GM, lineHeight: 1.4, maxWidth: 720 }}>
                                    {t('pricing.strategy_sub')}
                                </p>
                            </div>

                            {requested.map((section, idx) => (
                                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 * idx }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: F, display: 'inline-block' }} />
                                        <h3 style={{ fontFamily: brand, fontWeight: 700, fontSize: 14, color: N, letterSpacing: '0.16em', textTransform: 'uppercase' }}>{section.category}</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 1, background: 'rgba(5,11,43,0.06)' }}>
                                        {section.items.map((plan, pIdx) => (
                                            <div key={pIdx} className="flex flex-col min-w-0" style={{ background: '#FFFFFF', padding: '36px 32px' }}>
                                                <div className="mb-6">
                                                    <h4 style={{ fontFamily: brand, fontWeight: 900, fontSize: 24, color: N, letterSpacing: '-0.02em', textTransform: 'uppercase', marginBottom: 6 }}>{plan.name}</h4>
                                                    <p style={{ fontFamily: brand, fontWeight: 700, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: F }}>{plan.monthly}</p>
                                                </div>

                                                <div style={{ marginBottom: 32 }}>
                                                    <span style={{ fontFamily: brand, fontWeight: 900, fontSize: 34, color: N, letterSpacing: '-0.02em' }}>{plan.price}</span>
                                                    <span style={{ fontFamily: body, fontSize: 12, color: GM, marginLeft: 8 }}>+IVA</span>
                                                </div>

                                                <ul className="space-y-3 mb-8 flex-grow">
                                                    {plan.features.map((f, fIdx) => (
                                                        <li key={fIdx} className="flex items-start gap-3" style={{ fontFamily: body, fontSize: 13, color: N }}>
                                                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: F, marginTop: 8, flexShrink: 0, display: 'inline-block' }} />
                                                            <span>{f}</span>
                                                        </li>
                                                    ))}
                                                </ul>

                                                <OutlineButton fullWidth>Contattaci →</OutlineButton>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* PROCESSO */}
            <section className="py-24 px-6 md:px-12 section-trigger overflow-hidden" style={{ background: '#FFFFFF' }}>
                <div className="container mx-auto">
                    <div className="section-reveal mb-16 max-w-2xl">
                        <SectionLabel>Processo</SectionLabel>
                        <h3 style={{
                            fontFamily: brand, fontWeight: 900, fontSize: 56,
                            color: N, textTransform: 'uppercase',
                            letterSpacing: '-0.025em', lineHeight: 0.9
                        }}>Chirurgico.</h3>
                        <p style={{
                            fontFamily: editorial, fontStyle: 'italic', fontSize: 28,
                            color: GM, marginTop: 8, lineHeight: 1.3
                        }}>Pochi click. Tempo liberato.</p>
                    </div>

                    <HoverSlider className="w-full">
                        <div className="flex flex-col lg:flex-row items-stretch gap-10 lg:gap-16">
                            <div className="flex flex-col justify-center lg:w-[45%]">
                                {PROCESSO_SLIDES.map((slide, index) => (
                                    <div key={slide.id}>
                                        <TextStaggerHover
                                            index={index}
                                            text={slide.title}
                                            className="cursor-pointer block whitespace-nowrap overflow-hidden py-4"
                                            style={{
                                                fontFamily: brand, fontWeight: 900,
                                                fontSize: 28,
                                                color: N,
                                                textTransform: 'uppercase',
                                                letterSpacing: '-0.02em'
                                            }}
                                        />
                                        <div style={{ height: 1, width: '100%', background: 'rgba(5,11,43,0.07)' }} />
                                    </div>
                                ))}
                            </div>

                            <div className="lg:w-[55%] w-full">
                                <div className="relative overflow-hidden" style={{ height: 460, border: '1px solid rgba(5,11,43,0.07)' }}>
                                    <HoverSliderImageWrap className="absolute inset-0">
                                        {PROCESSO_SLIDES.map((slide, index) => (
                                            <div key={slide.id}>
                                                <HoverSliderImage
                                                    index={index}
                                                    imageUrl={slide.imageUrl}
                                                    src={slide.imageUrl}
                                                    alt={slide.title}
                                                    className="w-full h-full object-cover"
                                                    loading="eager"
                                                    decoding="async"
                                                />
                                            </div>
                                        ))}
                                    </HoverSliderImageWrap>

                                    <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(5,11,43,0.95) 0%, rgba(5,11,43,0.7) 50%, transparent 100%)' }} />

                                    <div className="absolute bottom-0 left-0 right-0 p-10 pt-24">
                                        <SlideDescription slides={PROCESSO_SLIDES} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </HoverSlider>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6 md:px-12" style={{ background: N }}>
                <div className="container mx-auto max-w-4xl">
                    <div className="section-reveal">
                        <SectionLabel>Domande?</SectionLabel>
                        <h2 style={{
                            fontFamily: brand, fontWeight: 900, fontSize: 56,
                            color: '#FFFFFF', textTransform: 'uppercase',
                            letterSpacing: '-0.025em', lineHeight: 0.9, marginBottom: 12
                        }}>Parliamone.</h2>
                        <p style={{
                            fontFamily: editorial, fontStyle: 'italic', fontSize: 22,
                            color: 'rgba(255,255,255,0.5)', lineHeight: 1.4,
                            maxWidth: 580, marginBottom: 40
                        }}>
                            Ascolteremo i tuoi bisogni di reclutamento e offriremo la soluzione più adeguata.
                        </p>
                        <FuchsiaButton href="https://www.jobcourier.ch/contatti/">CONTATTACI →</FuchsiaButton>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Pricing;
