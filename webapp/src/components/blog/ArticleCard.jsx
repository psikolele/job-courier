import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';

const N = 'var(--brand-navy)';
const F = 'var(--brand-fuchsia)';
const GL = 'var(--brand-gray-light)';
const GM = 'var(--brand-gray-mid)';
const brand = 'var(--font-brand)';
const body = 'var(--font-body)';

// Dimensioni/tipografia per variante. "carousel" = card homepage Blog.jsx (slider).
// "grid" = cella full-width per griglie (es. pagine categoria blog).
const SIZE = {
    carousel: {
        wrapperClass: 'w-[280px] md:w-[350px] shrink-0 flex-none',
        cardClass: 'flex flex-col h-[350px] overflow-hidden group transition-all duration-300 cursor-pointer',
        imageWrapClass: 'h-44 overflow-hidden relative',
        titleSize: 16,
        titleWeight: 700,
        titleUppercase: false,
    },
    grid: {
        wrapperClass: 'w-full',
        cardClass: 'flex flex-col w-full h-full overflow-hidden group transition-all duration-300 cursor-pointer',
        imageWrapClass: 'h-[180px] overflow-hidden relative',
        titleSize: 19,
        titleWeight: 900,
        titleUppercase: true,
    },
};

// Card articolo blog — usata nel carousel homepage (Blog.jsx) e riusabile per griglie.
// Hover: lift, border fuchsia-tinted, immagine grayscale->colore, titolo fuchsia, freccia CTA.
// Bordi sempre squadrati (radius: 0) per brand identity.
const ArticleCard = ({ article, to, size = 'carousel', readArticleText = 'Leggi Articolo' }) => {
    const navigate = useNavigate();
    const cfg = SIZE[size] || SIZE.carousel;
    const description = article.description ?? article.abstract;
    const readingTime = article.readingTime;

    return (
        <div className={cfg.wrapperClass}>
            <motion.a
                href={to}
                onClick={e => { e.preventDefault(); navigate(to); }}
                className={cfg.cardClass}
                style={{ background: '#FFFFFF', border: '1px solid rgba(5,11,43,0.07)', borderRadius: 0 }}
                whileHover={{ y: -4, borderColor: 'rgba(255, 31, 122, 0.2)' }}
            >
                <div className={cfg.imageWrapClass} style={{ background: GL, borderRadius: 0 }}>
                    <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                        style={{ borderRadius: 0 }}
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>

                <div className="p-6 flex flex-col flex-1 whitespace-normal">
                    {readingTime != null && (
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            fontFamily: body,
                            fontSize: 12,
                            color: GM,
                            marginBottom: 10
                        }}>
                            <Clock className="w-3 h-3" /> {readingTime} min di lettura
                        </span>
                    )}
                    <h4 style={{
                        fontFamily: brand,
                        fontWeight: cfg.titleWeight,
                        fontSize: cfg.titleSize,
                        textTransform: cfg.titleUppercase ? 'uppercase' : 'none',
                        color: N,
                        letterSpacing: '-0.01em',
                        lineHeight: cfg.titleUppercase ? 1.15 : 1.3,
                        marginBottom: 8
                    }} className="line-clamp-2 group-hover:text-[var(--brand-fuchsia)] transition-colors duration-200">
                        {article.title}
                    </h4>
                    <p style={{
                        fontFamily: body,
                        fontSize: 12.5,
                        color: GM,
                        lineHeight: 1.5,
                        flex: 1
                    }} className="line-clamp-3">
                        {description}
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
    );
};

export default ArticleCard;
