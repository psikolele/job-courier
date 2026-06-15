import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { Clock, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getArticle } from '../data/blog/loader.js';
import { findBySlug, slugFor } from '../data/blog/blogIndex.js';
import { resolveCategorySegment, categorySegmentFor } from '../data/blog/categories.js';
import BlogSeo from '../components/blog/BlogSeo.jsx';
import BlogSidebar from '../components/blog/BlogSidebar.jsx';
import ArticleCtaBox from '../components/blog/ArticleCtaBox.jsx';
import ArticleRelatedBox from '../components/blog/ArticleRelatedBox.jsx';
import ArticleSignature from '../components/blog/ArticleSignature.jsx';
import ArticleFaq from '../components/blog/ArticleFaq.jsx';

const BlogArticolo = () => {
  const { categoria, slug } = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const lang = i18n.language?.slice(0, 2) || 'it';
  const [article, setArticle] = useState(undefined); // undefined=loading, null=404

  const categoryId = resolveCategorySegment(categoria);

  useEffect(() => {
    let alive = true;
    getArticle(slug, lang).then((a) => alive && setArticle(a));
    return () => { alive = false; };
  }, [slug, lang]);

  // Normalizza URL: segmento categoria + slug nella lingua attiva
  // (copre slug di altra lingua, categoria errata nell'URL, cambio lingua)
  useEffect(() => {
    const hit = findBySlug(slug);
    if (!hit) return;
    const targetSlug = slugFor(hit.lang === 'it' ? slug : hit.entry.slug, lang);
    const targetSeg = categorySegmentFor(hit.entry.category, lang);
    if (targetSlug !== slug || targetSeg !== categoria) {
      navigate(`/blog/${targetSeg}/${targetSlug}`, { replace: true });
    }
  }, [slug, categoria, lang, navigate]);

  if (!categoryId) return <Navigate to="/blog/carriera" replace />;
  if (article === undefined) return <div style={{ minHeight: '60vh' }} />;
  if (article === null) return <Navigate to={`/blog/${categorySegmentFor('carriera', lang)}`} replace />;

  const seg = categorySegmentFor(article.category, lang);

  return (
    <div className="w-full px-6 md:px-12 pt-28 pb-20" style={{ background: 'var(--brand-gray-light)' }}>
      <div className="max-w-[1400px] mx-auto w-full">
        <BlogSeo type="article" lang={lang} categoryId={article.category} article={article} itSlug={findBySlug(slug)?.entry.slug || slug}
          title={article.metaTitle} description={article.metaDescription} />

        <Link to={`/blog/${seg}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24, fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--brand-navy)', textDecoration: 'none' }}>
          <ArrowLeft size={13} /> Tutti gli articoli
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Colonna articolo 65% */}
          <article className="lg:w-[65%]" style={{ background: '#fff', border: '1px solid rgba(5,11,43,0.06)', padding: '40px 36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <span style={{ width: 28, height: 2, background: 'var(--brand-fuchsia)' }} />
              <span style={{ fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--brand-fuchsia)' }}>
                Blog — {article.category === 'carriera' ? 'Carriera' : 'Recruiting'}
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-brand)', fontWeight: 900, fontSize: 32, textTransform: 'uppercase', color: 'var(--brand-navy)', lineHeight: 1.05, margin: '0 0 14px' }}>{article.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 26 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--brand-gray-mid)' }}>
                <Clock size={13} /> {article.readingTime} min di lettura
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--brand-gray-mid)' }}>
                {new Date(article.datePublished).toLocaleDateString('it-CH', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <img src={article.image} alt={article.title} style={{ width: '100%', height: 320, objectFit: 'cover', marginBottom: 28 }} />

            {/* In sintesi */}
            <div style={{ background: 'var(--brand-gray-light)', borderLeft: '3px solid var(--brand-fuchsia)', padding: '22px 26px', marginBottom: 36 }}>
              <span style={{ fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--brand-navy)' }}>In sintesi</span>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.75, color: 'var(--brand-navy)', margin: '10px 0 0' }}>{article.intro}</p>
            </div>

            {/* Sezioni */}
            {article.sections.map((s, i) => {
              if (s.cta) return <ArticleCtaBox key={i} {...s.cta} />;
              if (s.related) return <ArticleRelatedBox key={i} {...s.related} />;
              return (
                <section key={i} style={{ marginBottom: 32 }}>
                  <h2 style={{ fontFamily: 'var(--font-editorial)', fontStyle: 'italic', fontSize: 26, color: 'var(--brand-navy)', margin: '0 0 14px' }}>{s.heading}</h2>
                  {(s.blocks || []).map((b, j) => (
                    b?.list ? (
                      <ul key={j} style={{ listStyle: 'none', margin: '0 0 14px', padding: 0 }}>
                        {b.list.map((item, k) => (
                          <motion.li
                            key={k}
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: k * 0.08 }}
                            style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}
                          >
                            <span style={{ width: 6, height: 6, marginTop: 8, background: 'var(--brand-fuchsia)', display: 'inline-block', flexShrink: 0 }} />
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: 15.5, lineHeight: 1.8, color: 'var(--brand-navy)', opacity: 0.85 }}>{item}</span>
                          </motion.li>
                        ))}
                      </ul>
                    ) : (
                      <p key={j} style={{ fontFamily: 'var(--font-body)', fontSize: 15.5, lineHeight: 1.8, color: 'var(--brand-navy)', opacity: 0.85, margin: '0 0 14px' }}>{b}</p>
                    )
                  ))}
                </section>
              );
            })}

            {/* Checklist */}
            {article.checklist?.length > 0 && (
              <div style={{ marginTop: 40 }}>
                <h2 style={{ fontFamily: 'var(--font-editorial)', fontStyle: 'italic', fontSize: 26, color: 'var(--brand-navy)', margin: '0 0 16px' }}>Checklist finale</h2>
                {article.checklist.map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'baseline', marginBottom: 10 }}>
                    <span style={{ color: 'var(--brand-fuchsia)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.6, color: 'var(--brand-navy)', margin: 0 }}>{c}</p>
                  </div>
                ))}
              </div>
            )}

            <ArticleFaq items={article.faq} />
            <ArticleSignature kind={article.signature} />
          </article>

          {/* Sidebar 35% */}
          <div className="lg:w-[35%]">
            <div className="lg:sticky lg:top-28">
              <BlogSidebar currentSlug={slug} categoryId={article.category} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default BlogArticolo;
