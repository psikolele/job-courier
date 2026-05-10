import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ArrowRight, ChevronRight, BookOpen } from 'lucide-react';
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

const BlogCard = ({ article, readArticleText, isDark }) => (
    <div className="w-[300px] md:w-[380px] shrink-0 px-3 py-4">
        <motion.div 
            whileHover={{ y: -8 }}
            className={`flex flex-col h-[420px] rounded-[2.5rem] overflow-hidden border transition-all duration-500 group shadow-lg ${
                isDark 
                ? 'bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/15' 
                : 'bg-white border-slate-200 hover:border-[#01498C]/30 hover:shadow-2xl'
            }`}
        >
            <div className="h-44 overflow-hidden relative">
                <img 
                    src={article.image} 
                    alt={article.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    loading="lazy" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            
            <div className="p-8 flex flex-col flex-1">
                <h3 className={`text-xl font-bold leading-tight mb-4 line-clamp-2 transition-colors duration-300 ${
                    isDark ? 'text-white group-hover:text-[#2f9de5]' : 'text-slate-900 group-hover:text-[#01498C]'
                }`}>
                    {article.title}
                </h3>
                <p className={`text-sm line-clamp-3 flex-1 leading-relaxed ${
                    isDark ? 'text-white/60' : 'text-slate-500'
                }`}>
                    {article.description}
                </p>
                
                <div className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] mt-6 transition-all duration-300 group-hover:gap-3 ${
                    isDark ? 'text-[#2f9de5]' : 'text-[#01498C]'
                }`}>
                    <span>{readArticleText}</span>
                    <ArrowRight className="w-4 h-4" />
                </div>
            </div>
        </motion.div>
    </div>
);

const BlogSlider = ({ title, articles, readArticleText, isDark }) => {
    const sliderRef = useRef(null);
    const animationRef = useRef(null);
    const isPausedRef = useRef(false);

    useEffect(() => {
        if (articles.length > 0 && sliderRef.current) {
            const slider = sliderRef.current;
            
            const ctx = gsap.context(() => {
                const startAutoScroll = () => {
                    const maxScroll = slider.scrollWidth - slider.clientWidth;
                    if (maxScroll <= 0) return;

                    animationRef.current = gsap.to(slider, {
                        scrollLeft: maxScroll,
                        duration: maxScroll / 45,
                        ease: "none",
                        repeat: -1,
                        yoyo: true,
                        paused: isPausedRef.current
                    });
                };
                startAutoScroll();
            });

            return () => ctx.revert();
        }
    }, [articles]);

    const handleMouseEnter = () => {
        isPausedRef.current = true;
        if (animationRef.current) animationRef.current.pause();
    };

    const handleMouseLeave = () => {
        isPausedRef.current = false;
        if (animationRef.current) animationRef.current.play();
    };

    return (
        <div 
            className={`flex-1 flex flex-col pt-20 pb-20 px-4 md:px-8 relative overflow-hidden ${isDark ? 'bg-[#01498C]' : 'bg-white'}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="flex items-center justify-between mb-12 px-4">
                <h2 className={`text-2xl md:text-3xl font-bold font-sans tracking-tight flex items-center gap-3 ${isDark ? 'text-white' : 'text-[#01498C]'}`}>
                    <BookOpen className={`w-6 h-6 ${isDark ? 'text-[#2f9de5]' : 'text-[#01498C]'}`} />
                    {title}
                </h2>
                <div className={`hidden md:block h-px flex-1 mx-8 ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}></div>
            </div>
            
            <div className="relative overflow-hidden w-full">
                {/* Cinematic Gradients */}
                <div className={`absolute top-0 left-0 w-24 h-full z-10 pointer-events-none hidden md:block ${isDark ? 'bg-gradient-to-r from-[#01498C] to-transparent' : 'bg-gradient-to-r from-white to-transparent'}`}></div>
                <div className={`absolute top-0 right-0 w-24 h-full z-10 pointer-events-none hidden md:block ${isDark ? 'bg-gradient-to-l from-[#01498C] to-transparent' : 'bg-gradient-to-l from-white to-transparent'}`}></div>

                <div 
                    ref={sliderRef}
                    className="flex gap-4 overflow-x-auto scrollbar-hide touch-pan-x w-full px-4"
                >
                    {articles.map((article) => (
                        <BlogCard 
                            key={article.id} 
                            article={article} 
                            readArticleText={readArticleText} 
                            isDark={isDark}
                        />
                    ))}
                </div>
            </div>

            {/* System Status Indicator */}
            <div className="mt-8 px-4 flex items-center gap-3">
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? 'bg-[#2f9de5]' : 'bg-[#01498C]'}`}></div>
                <span className={`text-[9px] font-bold uppercase tracking-[0.3em] font-mono ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                    Live Archive v1.0
                </span>
            </div>
        </div>
    );
};

const Blog = () => {
    const { t } = useTranslation();

    const candidateArticles = (t('blog.candidateArticles', { returnObjects: true }) || []).map(art => ({ ...art, image: candidateImages[art.id] }));
    const companyArticles = (t('blog.companyArticles', { returnObjects: true }) || []).map(art => ({ ...art, image: companyImages[art.id] }));

    return (
        <section id="blog" className="w-full bg-white relative z-10">
            <div className="w-full flex flex-col lg:flex-row">
                {/* Candidates Left Half - DEEP BLUE */}
                <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-white/10 shadow-2xl z-20">
                    <BlogSlider 
                        title={t('blog.title_candidates')} 
                        articles={candidateArticles} 
                        readArticleText={t('blog.read_article')}
                        isDark={true}
                    />
                </div>

                {/* Companies Right Half - DEEP BLUE */}
                <div className="w-full lg:w-1/2 bg-[#01498C]">
                    <BlogSlider 
                        title={t('blog.title_companies')} 
                        articles={companyArticles} 
                        readArticleText={t('blog.read_article')}
                        isDark={true}
                    />
                </div>
            </div>
            
            {/* Global Noise Overlay for Texture */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-repeat" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/p6.png")' }}></div>
        </section>
    );
};

export default Blog;
