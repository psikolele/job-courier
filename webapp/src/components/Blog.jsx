import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

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

const BlogCard = ({ article, readArticleText }) => (
    <div className="w-full shrink-0 px-2 md:px-4">
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-[#01498C]/30 hover:shadow-lg transition-all duration-300 group flex flex-col h-[380px]">
            <div className="h-48 overflow-hidden relative">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
            </div>
            <div className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2 group-hover:text-[#01498C] transition-colors line-clamp-2">{article.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 flex-1">{article.description}</p>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#01498C] uppercase tracking-wider mt-4 group-hover:gap-2 transition-all">
                    <span>{readArticleText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                </div>
            </div>
        </div>
    </div>
);

const BlogSlider = ({ title, articles, intervalMs, readArticleText }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timerKey, setTimerKey] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % articles.length);
        }, intervalMs);
        return () => clearInterval(interval);
    }, [timerKey, articles.length, intervalMs, isPaused]);

    const handleDotClick = (idx) => {
        setCurrentIndex(idx);
        setTimerKey(prev => prev + 1);
    };

    return (
        <div 
            className="flex-1 flex flex-col pt-16 pb-24 px-6 md:px-12 relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <h2 className="text-2xl md:text-3xl font-bold font-sans text-slate-900 mb-8 px-2 tracking-tight">
                {title}
            </h2>
            
            <div className="relative overflow-hidden w-full">
                <motion.div 
                    className="flex w-full"
                    animate={{ x: `-${currentIndex * 100}%` }}
                    transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                    {articles.map((article) => (
                        <BlogCard key={article.id} article={article} readArticleText={readArticleText} />
                    ))}
                </motion.div>
            </div>

            {/* Pill Dots */}
            <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-2">
                {articles.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleDotClick(idx)}
                        className="rounded-full bg-slate-300 transition-all duration-300 focus:outline-none"
                        style={{
                            width: currentIndex === idx ? '24px' : '6px',
                            height: '6px',
                            backgroundColor: currentIndex === idx ? '#01498C' : '#CBD5E1',
                            transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                        }}
                        aria-label={`Vai all'articolo ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

const Blog = () => {
    const { t } = useTranslation();

    const candidateArticles = (t('blog.candidateArticles', { returnObjects: true }) || []).map(art => ({ ...art, image: candidateImages[art.id] }));
    const companyArticles = (t('blog.companyArticles', { returnObjects: true }) || []).map(art => ({ ...art, image: companyImages[art.id] }));

    return (
        <section id="blog" className="w-full bg-white relative z-10 border-t border-slate-100">
            <div className="w-full flex flex-col lg:flex-row">
                {/* Candidates Left Half */}
                <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-slate-200 bg-[#FAFAFA]/50">
                    <BlogSlider 
                        title={t('blog.title_candidates')} 
                        articles={candidateArticles} 
                        intervalMs={5000} 
                        readArticleText={t('blog.read_article')}
                    />
                </div>

                {/* Companies Right Half */}
                <div className="w-full lg:w-1/2 bg-white">
                    <BlogSlider 
                        title={t('blog.title_companies')} 
                        articles={companyArticles} 
                        intervalMs={5300} // Offset timer slightly to prevent synchronized sliding
                        readArticleText={t('blog.read_article')}
                    />
                </div>
            </div>
        </section>
    );
};

export default Blog;
