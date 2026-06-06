import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslation } from 'react-i18next';
import { ArrowRight, UserPlus, CreditCard, FileText, Users, MapPin, Zap, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    HoverSlider, HoverSliderImage, HoverSliderImageWrap, TextStaggerHover, SlideDescription,
} from '@/components/ui/animated-slideshow';

gsap.registerPlugin(ScrollTrigger);

const N = 'var(--brand-navy)';
const F = 'var(--brand-fuchsia)';
const GL = 'var(--brand-gray-light)';
const GM = 'var(--brand-gray-mid)';
const brand = 'var(--font-brand)';
const editorial = 'var(--font-editorial)';
const body = 'var(--font-body)';

const SectionLabel = ({ children, dark = false }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ width: 28, height: 2, background: F, display: 'inline-block' }} />
        <span style={{ fontFamily: brand, fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: F }}>{children}</span>
    </div>
);

const STEPS = [
    { icon: <UserPlus size={24} />, titleKey: 'come_funziona.step1_title', descKey: 'come_funziona.step1_desc', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop' },
    { icon: <CreditCard size={24} />, titleKey: 'come_funziona.step2_title', descKey: 'come_funziona.step2_desc', image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=1200&auto=format&fit=crop' },
    { icon: <FileText size={24} />, titleKey: 'come_funziona.step3_title', descKey: 'come_funziona.step3_desc', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop' },
    { icon: <Users size={24} />, titleKey: 'come_funziona.step4_title', descKey: 'come_funziona.step4_desc', image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop' },
];

const WHY = [
    { titleKey: 'come_funziona.feature1_title', descKey: 'come_funziona.feature1_desc', icon: <MapPin size={28} /> },
    { titleKey: 'come_funziona.feature2_title', descKey: 'come_funziona.feature2_desc', icon: <Zap size={28} /> },
    { titleKey: 'come_funziona.feature3_title', descKey: 'come_funziona.feature3_desc', icon: <Headphones size={28} /> },
];

const ComeFunziona = () => {
    const containerRef = useRef(null);
    const { t } = useTranslation();

    const SLIDER_STEPS = STEPS.map((step, i) => ({
        id: String(i + 1),
        title: t(step.titleKey),
        desc: t(step.descKey),
        imageUrl: step.image
    }));

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.hero-line', { y: 30, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out' });
            gsap.from('.why-card', { y: 40, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out', scrollTrigger: { trigger: '.why-trigger', start: 'top 80%' } });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="min-h-screen overflow-x-hidden" style={{ background: GL }}>

            {/* HERO */}
            <section className="relative min-h-[60vh] pt-32 pb-20 px-6 md:px-12 flex flex-col justify-center" style={{ background: N }}>
                <div className="container mx-auto w-full">
                    <div className="max-w-4xl">
                        <div className="hero-line"><SectionLabel>{t('come_funziona.subtitle')}</SectionLabel></div>
                        <h1 className="hero-line" style={{
                            fontFamily: brand, fontWeight: 900, fontSize: 'clamp(2rem, 8vw, 5rem)',
                            color: 'var(--brand-white)', textTransform: 'uppercase',
                            letterSpacing: '-0.025em', lineHeight: 0.9, marginBottom: 32
                        }}>
                            {t('come_funziona.hero_title')}{' '}
                            <span style={{ color: F }}>{t('come_funziona.hero_em')}</span>
                        </h1>
                        <p className="hero-line" style={{ fontFamily: body, fontSize: 16, color: 'rgba(255,255,255,0.7)', marginBottom: 8, lineHeight: 1.6, maxWidth: 560 }}>
                            {t('come_funziona.hero_sub')}
                        </p>
                        <p className="hero-line" style={{
                            fontFamily: brand, fontWeight: 700, fontSize: 13,
                            color: F, letterSpacing: '0.18em', textTransform: 'uppercase',
                            marginBottom: 40
                        }}>
                            {t('come_funziona.hero_emphasis')}
                        </p>

                        <div className="hero-line flex flex-col sm:flex-row items-start gap-4">
                            <a href="https://jobroom.jobcourier.ch/employer/register.php?ignoreRedirectingCookiesAll=1&lan=it&language=it"
                                style={{
                                    background: F, color: 'var(--brand-white)', border: 'none',
                                    padding: '14px 28px',
                                    fontFamily: brand, fontWeight: 700, fontSize: 11,
                                    letterSpacing: '0.14em', textTransform: 'uppercase',
                                    cursor: 'pointer', borderRadius: 0, textDecoration: 'none',
                                    display: 'inline-flex', alignItems: 'center', gap: 8
                                }} className="hover:opacity-80 transition-opacity">
                                {t('come_funziona.cta_btn')} →
                            </a>
                            <Link to="/soluzioni-e-tariffe" style={{
                                fontFamily: brand, fontWeight: 700, fontSize: 11,
                                letterSpacing: '0.14em', textTransform: 'uppercase',
                                color: 'rgba(255,255,255,0.5)',
                                border: '1.5px solid rgba(255,255,255,0.2)',
                                padding: '14px 28px',
                                textDecoration: 'none',
                                display: 'inline-flex', alignItems: 'center', gap: 6
                            }} className="hover:opacity-100 transition-opacity">
                                {t('come_funziona.cta_btn2')} →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* STEPS */}
            <section className="py-24 px-6 md:px-12 overflow-hidden" style={{ background: 'var(--brand-white)' }}>
                <div className="container mx-auto">
                    <div className="mb-16 max-w-3xl">
                        <SectionLabel>{t('come_funziona.subtitle')}</SectionLabel>
                        <h3 style={{
                            fontFamily: brand, fontWeight: 900, fontSize: 'clamp(1.6rem, 4vw, 3rem)',
                            color: N, textTransform: 'uppercase',
                            letterSpacing: '-0.025em', lineHeight: 1.05
                        }}>{t('come_funziona.steps_title')}</h3>
                    </div>

                    <HoverSlider className="w-full">
                        <div className="flex flex-col lg:flex-row items-stretch gap-6 md:gap-10 lg:gap-16">
                            <div className="flex flex-col justify-center lg:w-[45%]">
                                {SLIDER_STEPS.map((slide, index) => (
                                    <div key={slide.id} style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                                        <div style={{ flex: 1 }}>
                                            <TextStaggerHover
                                                index={index}
                                                text={slide.title}
                                                className="cursor-pointer block whitespace-nowrap overflow-hidden py-3"
                                                style={{
                                                    fontFamily: brand, fontWeight: 900,
                                                    fontSize: 24,
                                                    color: N,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '-0.02em',
                                                    touchAction: 'manipulation',
                                                }}
                                            />
                                            <div style={{ height: 1, width: '100%', background: 'rgba(5,11,43,0.07)' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="lg:w-[55%] w-full">
                                <div className="relative overflow-hidden" style={{ height: 'clamp(300px, 50vw, 460px)', border: '1px solid rgba(5,11,43,0.07)' }}>
                                    <HoverSliderImageWrap className="absolute inset-0">
                                        {SLIDER_STEPS.map((slide, index) => (
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
                                        <SlideDescription slides={SLIDER_STEPS} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </HoverSlider>
                </div>
            </section>

            {/* WHY */}
            <section className="py-24 px-6 md:px-12 why-trigger" style={{ background: GL }}>
                <div className="container mx-auto">
                    <div className="mb-16 max-w-2xl">
                        <SectionLabel>Perché sceglierci</SectionLabel>
                        <h2 style={{
                            fontFamily: brand, fontWeight: 900, fontSize: 'clamp(1.8rem, 5vw, 3rem)',
                            color: N, textTransform: 'uppercase',
                            letterSpacing: '-0.025em', lineHeight: 0.95, marginBottom: 12
                        }}>{t('come_funziona.why_title')}</h2>
                        <p style={{ fontFamily: editorial, fontStyle: 'italic', fontSize: 20, color: GM, lineHeight: 1.4 }}>
                            {t('come_funziona.why_sub')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 1, background: 'rgba(5,11,43,0.06)' }}>
                        {WHY.map((f, i) => (
                            <motion.div key={i} className="why-card group" style={{ background: 'var(--brand-white)', padding: '40px 36px', display: 'flex', flexDirection: 'column' }}>
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    width: 48, height: 48,
                                    background: GL, color: F,
                                    marginBottom: 24,
                                    flexShrink: 0,
                                    alignSelf: 'flex-start'
                                }}>
                                    {f.icon}
                                </div>
                                <span style={{
                                    fontFamily: brand, fontWeight: 900, fontSize: 14,
                                    color: F, letterSpacing: '0.16em',
                                    textTransform: 'uppercase', marginBottom: 12
                                }}>0{i + 1}</span>
                                <h4 style={{
                                    fontFamily: brand, fontWeight: 900, fontSize: 22,
                                    color: N, textTransform: 'uppercase',
                                    letterSpacing: '-0.02em', lineHeight: 1.05, marginBottom: 12
                                }}>{t(f.titleKey)}</h4>
                                <p style={{ fontFamily: body, fontSize: 14, color: GM, lineHeight: 1.6, flexGrow: 1 }}>
                                    {t(f.descKey)}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6 md:px-12" style={{ background: N }}>
                <div className="container mx-auto max-w-4xl">
                    <SectionLabel>Inizia oggi</SectionLabel>
                    <h2 style={{
                        fontFamily: brand, fontWeight: 900, fontSize: 'clamp(2rem, 6vw, 4rem)',
                        color: 'var(--brand-white)', textTransform: 'uppercase',
                        letterSpacing: '-0.025em', lineHeight: 0.9, marginBottom: 12
                    }}>{t('come_funziona.cta_title')}</h2>
                    <p style={{
                        fontFamily: brand, fontWeight: 700, fontSize: 13,
                        color: F, letterSpacing: '0.14em', textTransform: 'uppercase',
                        marginBottom: 16
                    }}>TROVA CANDIDATI IN MODO SEMPLICE.</p>
                    <p style={{
                        fontFamily: body, fontSize: 16,
                        color: 'rgba(255,255,255,0.6)', lineHeight: 1.6,
                        maxWidth: 520, marginBottom: 40
                    }}>
                        {t('come_funziona.cta_sub')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <a href="https://jobroom.jobcourier.ch/employer/register.php?ignoreRedirectingCookiesAll=1&lan=it&language=it"
                            style={{
                                background: F, color: 'var(--brand-white)', border: 'none',
                                padding: '14px 28px',
                                fontFamily: brand, fontWeight: 700, fontSize: 11,
                                letterSpacing: '0.14em', textTransform: 'uppercase',
                                cursor: 'pointer', borderRadius: 0, textDecoration: 'none',
                                display: 'inline-flex', alignItems: 'center', gap: 8
                            }} className="hover:opacity-80 transition-opacity">
                            {t('come_funziona.cta_btn')} <ArrowRight size={14} />
                        </a>
                        <Link to="/soluzioni-e-tariffe" style={{
                            background: 'transparent', color: 'var(--brand-white)',
                            border: '1.5px solid rgba(255,255,255,0.3)',
                            padding: '14px 28px',
                            fontFamily: brand, fontWeight: 700, fontSize: 11,
                            letterSpacing: '0.14em', textTransform: 'uppercase',
                            cursor: 'pointer', borderRadius: 0, textDecoration: 'none',
                            display: 'inline-flex', alignItems: 'center', gap: 8
                        }} className="hover:opacity-80 transition-opacity">
                            {t('come_funziona.cta_btn2')}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ComeFunziona;
