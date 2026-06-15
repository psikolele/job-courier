import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import ArticleCard from './blog/ArticleCard.jsx';

const candidateSlugs = {
    1: 'come-scrivere-un-cv-che-ottiene-colloqui',
    2: 'come-affrontare-un-colloquio-di-lavoro',
    3: 'settori-con-piu-opportunita-di-lavoro'
};

const companySlugs = {
    1: 'come-scrivere-un-annuncio-di-lavoro-efficace',
    2: 'perche-non-ricevi-candidature-qualificate',
    3: 'perche-i-candidati-scelgono-alcune-aziende'
};

const candidateImages = {
    1: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop',
    2: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800&auto=format&fit=crop',
    3: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=800&auto=format&fit=crop'
};

const companyImages = {
    1: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800&auto=format&fit=crop',
    2: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=800&auto=format&fit=crop',
    3: 'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=800&auto=format&fit=crop'
};

const N = 'var(--brand-navy)';
const F = 'var(--brand-fuchsia)';
const GL = 'var(--brand-gray-light)';
const GM = 'var(--brand-gray-mid)';
const brand = 'var(--font-brand)';
const editorial = 'var(--font-editorial)';

const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const MarqueeSlider = ({ title, subtitle, articles, readArticleText, speed = 35, categorySegment, slugMap }) => {
    const sliderRef = useRef(null);
    const timelineRef = useRef(null);
    const resumeTimeoutRef = useRef(null);

    const duplicatedArticles = [...articles, ...articles, ...articles];

    useEffect(() => {
        if (!sliderRef.current || articles.length === 0 || prefersReducedMotion()) return;
        const slider = sliderRef.current;
        const ctx = gsap.context(() => {
            const totalWidth = slider.scrollWidth;
            const singleSetWidth = totalWidth / 3;
            slider.scrollLeft = 0;
            timelineRef.current = gsap.to(slider, {
                scrollLeft: singleSetWidth,
                duration: singleSetWidth / speed,
                ease: 'none',
                repeat: -1,
                modifiers: {
                    scrollLeft: (value) => parseFloat(value) % singleSetWidth
                }
            });
        });
        return () => ctx.revert();
    }, [articles, speed]);

    const pauseAuto = () => { if (timelineRef.current) timelineRef.current.pause(); };
    const resumeAuto = () => { if (timelineRef.current) timelineRef.current.play(); };

    const handleArrow = (direction) => {
        if (!sliderRef.current) return;
        pauseAuto();
        if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
        const amount = sliderRef.current.clientWidth / 2;
        sliderRef.current.scrollBy({ left: direction === 'right' ? amount : -amount, behavior: 'smooth' });
        resumeTimeoutRef.current = setTimeout(resumeAuto, 3000);
    };

    return (
        <div
            className="w-full py-10 bg-[#FFFFFF] relative overflow-hidden flex flex-col"
            onMouseEnter={pauseAuto}
            onMouseLeave={resumeAuto}
            onTouchStart={pauseAuto}
            onTouchEnd={() => setTimeout(resumeAuto, 2000)}
        >
            {/* Header: title + subtitle + arrows */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 mb-6 w-full">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <span style={{ width: 28, height: 2, background: F, display: 'inline-block' }} />
                        <h3 style={{
                            fontFamily: brand,
                            fontWeight: 700,
                            fontSize: 11,
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            color: F
                        }}>
                            <Link to={`/blog/${categorySegment}`} style={{ color: 'inherit', textDecoration: 'none' }}>{title}</Link>
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleArrow('left')}
                        className="w-8 h-8 rounded-full border border-slate-200/80 flex items-center justify-center transition-all duration-200 cursor-pointer"
                        style={{ color: GM }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = F; e.currentTarget.style.color = F; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(226,232,240,0.8)'; e.currentTarget.style.color = GM; }}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleArrow('right')}
                        className="w-8 h-8 rounded-full border border-slate-200/80 flex items-center justify-center transition-all duration-200 cursor-pointer"
                        style={{ color: GM }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = F; e.currentTarget.style.color = F; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(226,232,240,0.8)'; e.currentTarget.style.color = GM; }}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
                </div>
                {subtitle && (
                    <p style={{
                        fontFamily: editorial,
                        fontStyle: 'italic',
                        fontSize: 32,
                        color: N,
                        lineHeight: 1.2,
                        marginTop: 8
                    }}>{subtitle}</p>
                )}
            </div>

            {/* Carousel track — margini paralleli al testo sopra */}
            <div className="relative overflow-hidden w-full px-6 md:px-12">
                <div className="absolute top-0 left-0 w-16 md:w-32 h-full z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #FFFFFF, transparent)' }} />
                <div className="absolute top-0 right-0 w-16 md:w-32 h-full z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, #FFFFFF, transparent)' }} />

                <div
                    ref={sliderRef}
                    className="flex gap-6 overflow-x-auto scrollbar-hide w-full py-2 px-4"
                    style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}
                >
                    {duplicatedArticles.map((article, idx) => (
                        <ArticleCard
                            key={`${article.id}-${idx}`}
                            article={article}
                            to={`/blog/${categorySegment}/${slugMap[article.id]}`}
                            size="carousel"
                            readArticleText={readArticleText}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

const Blog = () => {
    const { t } = useTranslation();

    const candidateArticles = (t('blog.candidateArticles', { returnObjects: true }) || []).map(art => ({ ...art, image: candidateImages[art.id] }));
    const companyArticles = (t('blog.companyArticles', { returnObjects: true }) || []).map(art => ({ ...art, image: companyImages[art.id] }));

    return (
        <section id="blog" className="w-full relative z-10 py-16 md:py-20" style={{ background: GL }}>
            {/* Two separate sliders — each with own trattino + title (= menu anchor) + subtitle */}
            <div className="w-full flex flex-col gap-1" style={{ background: GL }}>
                <MarqueeSlider
                    title="Consigli di carriera"
                    subtitle="Guida e approfondimenti per i candidati dal team Jobcourier"
                    articles={candidateArticles}
                    readArticleText={t('blog.read_article') || 'Leggi Articolo'}
                    speed={30}
                    categorySegment="carriera"
                    slugMap={candidateSlugs}
                />
                <MarqueeSlider
                    title="Consigli di recruiting"
                    subtitle="Guida e approfondimenti per le aziende dal team Jobcourier"
                    articles={companyArticles}
                    readArticleText={t('blog.read_article') || 'Leggi Articolo'}
                    speed={25}
                    categorySegment="recruiting"
                    slugMap={companySlugs}
                />
            </div>
        </section>
    );
};

export default Blog;
