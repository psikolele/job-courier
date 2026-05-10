import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslation } from 'react-i18next';
import { ArrowRight, UserPlus, CreditCard, FileText, Users, MapPin, Zap, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
    HoverSlider,
    HoverSliderImage,
    HoverSliderImageWrap,
    TextStaggerHover,
    SlideDescription,
} from '@/components/ui/animated-slideshow';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
    {
        num: '01',
        icon: <UserPlus size={28} />,
        titleKey: 'come_funziona.step1_title',
        descKey: 'come_funziona.step1_desc',
        image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1200&auto=format&fit=crop',
    },
    {
        num: '02',
        icon: <CreditCard size={28} />,
        titleKey: 'come_funziona.step2_title',
        descKey: 'come_funziona.step2_desc',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200&auto=format&fit=crop',
    },
    {
        num: '03',
        icon: <FileText size={28} />,
        titleKey: 'come_funziona.step3_title',
        descKey: 'come_funziona.step3_desc',
        image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop',
    },
    {
        num: '04',
        icon: <Users size={28} />,
        titleKey: 'come_funziona.step4_title',
        descKey: 'come_funziona.step4_desc',
        image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop',
    },
];

const WHY = [
    { titleKey: 'come_funziona.feature1_title', descKey: 'come_funziona.feature1_desc', icon: <MapPin size={32} /> },
    { titleKey: 'come_funziona.feature2_title', descKey: 'come_funziona.feature2_desc', icon: <Zap size={32} /> },
    { titleKey: 'come_funziona.feature3_title', descKey: 'come_funziona.feature3_desc', icon: <Headphones size={32} /> },
];

const ComeFunziona = () => {
    const containerRef = useRef(null);
    const { t } = useTranslation();

    // Map STEPS to the format required by AnimatedSlideshow components
    const SLIDER_STEPS = STEPS.map(step => ({
        id: step.num,
        title: t(step.titleKey),
        desc: t(step.descKey),
        imageUrl: step.image
    }));

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.hero-line', {
                y: 30, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out',
            });
            gsap.from('.why-card', {
                y: 40, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out',
                scrollTrigger: { trigger: '.why-trigger', start: 'top 80%' },
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="bg-[#F4F6F8] min-h-screen overflow-x-hidden">

            {/* HERO */}
            <section className="relative min-h-[60vh] pt-32 pb-16 bg-white px-6 md:px-12 flex flex-col justify-center border-b border-[#E5E5E5]">
                <div className="container mx-auto w-full">
                    <div className="max-w-4xl">
                        <div className="hero-line overflow-hidden mb-4">
                            <span className="text-xs font-bold tracking-[0.3em] text-[#01498C] uppercase font-mono block">
                                {t('come_funziona.subtitle')}
                            </span>
                        </div>
                        <h1 className="hero-line text-5xl md:text-7xl font-bold text-[#1a1a1a] leading-tight mb-6">
                            {t('come_funziona.hero_title')}<br />
                            <span className="text-[#01498C]">{t('come_funziona.hero_em')}</span>
                        </h1>
                        <p className="hero-line text-lg md:text-xl text-[#666] max-w-2xl font-normal leading-relaxed mb-8">
                            {t('come_funziona.hero_sub')}
                        </p>
                        <div className="hero-line flex flex-col sm:flex-row items-center gap-4">
                            <a
                                href="https://jobroom.jobcourier.ch/employer/register.php?ignoreRedirectingCookiesAll=1&lan=it&language=it"
                                className="inline-flex items-center gap-2 bg-[#01498C] px-8 py-4 rounded-lg text-sm font-bold tracking-wide text-white hover:bg-[#013dd6] transition-colors"
                            >
                                {t('come_funziona.cta_btn')} <ArrowRight size={16} />
                            </a>
                            <Link to="/soluzioni-e-tariffe" className="text-[#01498C] hover:text-[#013dd6] transition-colors font-bold text-sm tracking-wide">
                                {t('come_funziona.cta_btn2')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* STEPS — Interactive Hover Slider */}
            <section className="bg-white py-24 px-6 md:px-12 border-b border-[#E5E5E5] overflow-hidden">
                <div className="container mx-auto">
                    <div className="mb-16 border-l-4 border-[#01498C] pl-6">
                        <h2 className="text-xs font-bold tracking-[0.3em] text-[#01498C] uppercase mb-4 font-mono">
                            / {t('come_funziona.subtitle')}
                        </h2>
                        <h3 className="text-3xl md:text-5xl font-bold text-[#1a1a1a] uppercase tracking-tight max-w-4xl leading-tight">
                            {t('come_funziona.steps_title')}
                        </h3>
                    </div>

                    <HoverSlider className="w-full">
                        <div className="flex flex-col lg:flex-row items-stretch gap-10 lg:gap-16">

                            {/* Left: Titles */}
                            <div className="flex flex-col justify-center lg:w-[45%]">
                                {SLIDER_STEPS.map((slide, index) => (
                                    <div key={slide.id}>
                                        <TextStaggerHover
                                            index={index}
                                            text={slide.title}
                                            className="cursor-pointer text-xl md:text-2xl xl:text-2xl font-bold uppercase tracking-tight text-[#1a1a1a] hover:text-[#01498C] transition-colors py-5 block whitespace-nowrap overflow-hidden"
                                        />
                                        <div className="h-px w-full bg-[#E5E5E5]" />
                                    </div>
                                ))}
                            </div>

                            {/* Right: Image with description overlay */}
                            <div className="lg:w-[55%] w-full">
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-[#01498C]/10" style={{ height: '420px' }}>
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

                                    {/* Gradient overlay — covers lower 60% of image */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#01498C] via-[#01498C]/80 via-[50%] to-transparent pointer-events-none" />

                                    {/* Description text — fills lower 50% of image */}
                                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 pt-24 md:pt-32">
                                        <SlideDescription slides={SLIDER_STEPS} />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </HoverSlider>
                </div>
            </section>


            {/* WHY JOBCOURIER — Premium KSP Cards */}
            <section className="py-24 px-6 md:px-12 bg-white border-t border-[#E5E5E5] why-trigger">
                <div className="container mx-auto">
                    <div className="mb-16 border-l-4 border-[#01498C] pl-6">
                        <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] uppercase tracking-tight mb-4">
                            {t('come_funziona.why_title')}
                        </h2>
                        <p className="text-[#666] text-lg max-w-2xl leading-relaxed">
                            {t('come_funziona.why_sub')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                        {WHY.map((f, i) => (
                            <motion.div
                                key={i}
                                className="why-card group relative p-10 bg-white rounded-3xl border border-[#E5E5E5] hover:border-[#01498C] hover:shadow-2xl hover:shadow-[#01498C]/5 transition-all duration-500 flex flex-col h-full"
                                whileHover={{ y: -8 }}
                            >
                                {/* Icon with background blob */}
                                <div className="relative mb-8 w-16 h-16 flex items-center justify-center text-[#01498C] bg-[#F4F6F8] rounded-2xl group-hover:bg-[#01498C] group-hover:text-white transition-colors duration-500">
                                    {f.icon}
                                </div>

                                <h4 className="text-2xl font-bold text-[#1a1a1a] uppercase tracking-tight mb-4 group-hover:text-[#01498C] transition-colors">
                                    {t(f.titleKey)}
                                </h4>
                                <p className="text-[#666] text-base leading-relaxed group-hover:text-[#444] transition-colors flex-grow">
                                    {t(f.descKey)}
                                </p>

                                {/* Decorative bottom bar */}
                                <div className="mt-8 h-1 w-12 bg-[#01498C] rounded-full group-hover:w-full transition-all duration-500" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 md:px-12 bg-[#F4F6F8]">
                <div className="container mx-auto">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-white border-4 border-[#01498C] p-10 md:p-16 rounded-2xl">
                        <div className="flex-1">
                            <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] leading-tight mb-6">
                                {t('come_funziona.cta_title')}<br />
                            </h2>
                            <p className="text-lg text-[#666] max-w-lg leading-relaxed mb-8">
                                {t('come_funziona.cta_sub')}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <a
                                    href="https://jobroom.jobcourier.ch/employer/register.php?ignoreRedirectingCookiesAll=1&lan=it&language=it"
                                    className="inline-flex items-center gap-2 bg-[#01498C] text-white px-8 py-4 rounded-lg font-bold text-sm tracking-wide hover:bg-[#013dd6] transition-colors"
                                >
                                    {t('come_funziona.cta_btn')} <ArrowRight size={18} />
                                </a>
                                <Link to="/soluzioni-e-tariffe" className="inline-flex items-center gap-2 border-2 border-[#01498C] text-[#01498C] px-8 py-4 rounded-lg font-bold text-sm tracking-wide hover:bg-[#01498C] hover:text-white transition-colors">
                                    {t('come_funziona.cta_btn2')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ComeFunziona;
