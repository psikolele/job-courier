import React, { useEffect, useRef } from 'react';
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

const BlogCard = ({ article, readArticleText }) => (
    <div className="w-[280px] md:w-[340px] shrink-0">
        <motion.a
            href="#"
            whileHover={{ y: -4 }}
            className="flex flex-col h-[380px] overflow-hidden group transition-colors duration-200"
            style={{ background: '#FFFFFF', border: '1px solid rgba(5,11,43,0.07)' }}
        >
            <div className="h-44 overflow-hidden relative" style={{ background: GL }}>
                <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    loading="lazy"
                />
            </div>

            <div className="p-6 flex flex-col flex-1">
                <h3 style={{
                    fontFamily: brand,
                    fontWeight: 700,
                    fontSize: 18,
                    color: N,
                    letterSpacing: '-0.01em',
                    lineHeight: 1.3,
                    marginBottom: 10
                }} className="line-clamp-2">
                    {article.title}
                </h3>
                <p style={{
                    fontFamily: body,
                    fontSize: 13,
                    color: GM,
                    lineHeight: 1.6,
                    flex: 1
                }} className="line-clamp-3">
                    {article.description}
                </p>

                <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontFamily: brand,
                    fontWeight: 700,
                    fontSize: 10,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: F,
                    marginTop: 16
                }}>
                    <span>{readArticleText}</span>
                    <ArrowRight className="w-3 h-3" />
                </div>
            </div>
        </motion.a>
    </div>
);

const BlogSlider = ({ title, articles, readArticleText }) => {
    const sliderRef = useRef(null);
    const animationRef = useRef(null);
    const isPausedRef = useRef(false);

    useEffect(() => {
        if (articles.length > 0 && sliderRef.current) {
            const slider = sliderRef.current;
            const ctx = gsap.context(() => {
                const maxScroll = slider.scrollWidth - slider.clientWidth;
                if (maxScroll <= 0) return;
                animationRef.current = gsap.to(slider, {
                    scrollLeft: maxScroll,
                    duration: maxScroll / 45,
                    ease: 'none',
                    repeat: -1,
                    yoyo: true,
                    paused: isPausedRef.current
                });
            });
            return () => ctx.revert();
        }
    }, [articles]);

    const onEnter = () => { isPausedRef.current = true; animationRef.current?.pause(); };
    const onLeave = () => { isPausedRef.current = false; animationRef.current?.play(); };

    return (
        <div className="flex-1 flex flex-col pt-16 pb-16 px-6 md:px-10 relative overflow-hidden" style={{ background: '#FFFFFF' }} onMouseEnter={onEnter} onMouseLeave={onLeave}>
            <div className="flex items-center justify-between mb-10">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 28, height: 2, background: F, display: 'inline-block' }} />
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

            <div className="relative overflow-hidden w-full">
                <div className="absolute top-0 left-0 w-16 h-full z-10 pointer-events-none hidden md:block" style={{ background: 'linear-gradient(to right, #FFFFFF, transparent)' }} />
                <div className="absolute top-0 right-0 w-16 h-full z-10 pointer-events-none hidden md:block" style={{ background: 'linear-gradient(to left, #FFFFFF, transparent)' }} />

                <div ref={sliderRef} className="flex gap-4 overflow-x-auto scrollbar-hide touch-pan-x w-full pb-2">
                    {articles.map((article) => (
                        <BlogCard key={article.id} article={article} readArticleText={readArticleText} />
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
        <section id="blog" className="w-full relative z-10" style={{ background: GL }}>
            {/* Editorial intro */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-8">
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

            <div className="w-full flex flex-col lg:flex-row" style={{ gap: 1, background: 'rgba(5,11,43,0.06)' }}>
                <div className="w-full lg:w-1/2">
                    <BlogSlider
                        title={t('blog.title_candidates')}
                        articles={candidateArticles}
                        readArticleText={t('blog.read_article')}
                    />
                </div>
                <div className="w-full lg:w-1/2">
                    <BlogSlider
                        title={t('blog.title_companies')}
                        articles={companyArticles}
                        readArticleText={t('blog.read_article')}
                    />
                </div>
            </div>
        </section>
    );
};

export default Blog;
