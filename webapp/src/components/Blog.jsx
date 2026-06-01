import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
const body = 'var(--font-body)';

const MarqueeSlider = ({ title, articles, readArticleText, speed = 35 }) => {
    const sliderRef = useRef(null);
    const timelineRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    // Triple the articles to ensure seamless wrapping on wider viewports
    const duplicatedArticles = [...articles, ...articles, ...articles];

    useEffect(() => {
        if (!sliderRef.current || articles.length === 0) return;

        const slider = sliderRef.current;
        
        // Setup GSAP context
        const ctx = gsap.context(() => {
            const totalWidth = slider.scrollWidth;
            const singleSetWidth = totalWidth / 3;
            
            // Set scrollLeft back to 0
            slider.scrollLeft = 0;

            timelineRef.current = gsap.to(slider, {
                scrollLeft: singleSetWidth,
                duration: singleSetWidth / speed,
                ease: 'none',
                repeat: -1,
                modifiers: {
                    scrollLeft: (value) => {
                        return parseFloat(value) % singleSetWidth;
                    }
                }
            });
        });

        return () => ctx.revert();
    }, [articles, speed]);

    useEffect(() => {
        if (!timelineRef.current) return;
        if (isHovered) {
            timelineRef.current.pause();
        } else {
            timelineRef.current.play();
        }
    }, [isHovered]);

    return (
        <div 
            className="w-full py-10 bg-[#FFFFFF] relative overflow-hidden flex flex-col"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Header section with label */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 mb-8 w-full flex items-center">
                <div className="flex items-center gap-3">
                    <span className="w-7 h-[2px]" style={{ background: F }} />
                    <h2 style={{
                        fontFamily: brand,
                        fontWeight: 700,
                        fontSize: 11,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: F
                    }}>{title}</h2>
                </div>
            </div>

            {/* Carousel track */}
            <div className="relative overflow-hidden w-full">
                {/* Edge overlays for premium fade in/out */}
                <div className="absolute top-0 left-0 w-16 md:w-32 h-full z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #FFFFFF, transparent)' }} />
                <div className="absolute top-0 right-0 w-16 md:w-32 h-full z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, #FFFFFF, transparent)' }} />

                <div 
                    ref={sliderRef}
                    className="flex gap-6 overflow-x-auto scrollbar-none w-full py-2"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    {duplicatedArticles.map((article, idx) => (
                        <div key={`${article.id}-${idx}`} className="w-[280px] md:w-[350px] shrink-0 flex-none">
                            <motion.a
                                href="#"
                                onClick={e => e.preventDefault()}
                                className="flex flex-col h-[350px] overflow-hidden group transition-all duration-300 cursor-default"
                                style={{ background: '#FFFFFF', border: '1px solid rgba(5,11,43,0.07)' }}
                                whileHover={{ y: -4, borderColor: 'rgba(255, 31, 122, 0.2)' }}
                            >
                                <div className="h-44 overflow-hidden relative" style={{ background: GL }}>
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                        loading="lazy"
                                    />
                                    {/* Glass reflection */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                </div>

                                <div className="p-6 flex flex-col flex-1 whitespace-normal">
                                    <h3 style={{
                                        fontFamily: brand,
                                        fontWeight: 700,
                                        fontSize: 16,
                                        color: N,
                                        letterSpacing: '-0.01em',
                                        lineHeight: 1.3,
                                        marginBottom: 8
                                    }} className="line-clamp-2 group-hover:text-[var(--brand-fuchsia)] transition-colors duration-200">
                                        {article.title}
                                    </h3>
                                    <p style={{
                                        fontFamily: body,
                                        fontSize: 12.5,
                                        color: GM,
                                        lineHeight: 1.5,
                                        flex: 1
                                    }} className="line-clamp-3">
                                        {article.description}
                                    </p>

                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        fontFamily: brand,
                                        fontWeight: 700,
                                        fontSize: 9,
                                        letterSpacing: '0.18em',
                                        textTransform: 'uppercase',
                                        color: F,
                                        marginTop: 14
                                    }}>
                                        <span>{readArticleText}</span>
                                        <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-200" />
                                    </div>
                                </div>
                            </motion.a>
                        </div>
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
        <section id="blog" className="w-full relative z-10 py-16" style={{ background: GL }}>
            {/* Editorial intro */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 pb-12">
                <p style={{
                    fontFamily: editorial,
                    fontStyle: 'italic',
                    fontSize: 28,
                    color: N,
                    maxWidth: 640,
                    lineHeight: 1.3
                }}>
                    Suggerimenti editoriali per candidati e aziende, dal team Job Courier.
                </p>
            </div>

            {/* Stacked rows/marquees layout */}
            <div className="w-full flex flex-col gap-1" style={{ background: 'var(--brand-gray-light)' }}>
                <MarqueeSlider
                    title={t('blog.title_candidates') || 'Suggerimenti per la carriera'}
                    articles={candidateArticles}
                    readArticleText={t('blog.read_article') || 'Leggi Articolo'}
                    speed={30}
                />
                <MarqueeSlider
                    title={t('blog.title_companies') || 'Suggerimenti per il recruiting'}
                    articles={companyArticles}
                    readArticleText={t('blog.read_article') || 'Leggi Articolo'}
                    speed={25} // slightly offset speed for organic layered depth
                />
            </div>
        </section>
    );
};

export default Blog;
