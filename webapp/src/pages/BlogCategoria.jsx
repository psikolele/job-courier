import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { listByCategory } from '../data/blog/blogIndex.js';
import { resolveCategorySegment, categorySegmentFor } from '../data/blog/categories.js';
import BlogSeo from '../components/blog/BlogSeo.jsx';
import SectionLabel from '../components/ui/SectionLabel.jsx';
import ArticleCard from '../components/blog/ArticleCard.jsx';

const LABELS = {
  carriera: { breadcrumb: 'Blog — Carriera', title: 'Suggerimenti per la carriera', subtitle: 'Consigli pratici per chi cerca lavoro.' },
  recruiting: { breadcrumb: 'Blog — Recruiting', title: 'Suggerimenti per il recruiting', subtitle: 'Strategie per attrarre i candidati giusti.' },
};

const BlogCategoria = () => {
  const { categoria } = useParams();
  const { i18n } = useTranslation();
  const lang = i18n.language?.slice(0, 2) || 'it';
  const categoryId = resolveCategorySegment(categoria);
  if (!categoryId) return <Navigate to="/blog/carriera" replace />;
  const expected = categorySegmentFor(categoryId, lang);
  if (categoria !== expected) return <Navigate to={`/blog/${expected}`} replace />;

  const articles = listByCategory(categoryId, lang);
  const otherId = categoryId === 'carriera' ? 'recruiting' : 'carriera';
  const L = LABELS[categoryId];

  const lastSpace = L.title.lastIndexOf(' ');
  const titleLead = lastSpace > -1 ? L.title.slice(0, lastSpace + 1) : null;
  const titleEmphasis = lastSpace > -1 ? L.title.slice(lastSpace + 1) : null;

  return (
    <>
      <BlogSeo type="category" lang={lang} categoryId={categoryId} title={`${L.title} | JobCourier`} description={L.subtitle} />

      <section className="relative min-h-[40vh] pt-32 pb-16 px-6 md:px-12 flex flex-col justify-center" style={{ background: 'var(--brand-navy)' }}>
        <div className="container mx-auto w-full">
          <div className="max-w-3xl">
            <SectionLabel>{L.breadcrumb}</SectionLabel>
            <h1 style={{ fontFamily: 'var(--font-brand)', fontWeight: 900, fontSize: 'clamp(2rem, 8vw, 4.5rem)', color: 'var(--brand-white)', textTransform: 'uppercase', letterSpacing: '-0.025em', lineHeight: 0.95, marginBottom: 24 }}>
              {titleLead ? (
                <>
                  {titleLead}
                  <span style={{ color: 'var(--brand-fuchsia)' }}>{titleEmphasis}</span>
                </>
              ) : L.title}
            </h1>
            <p style={{ fontFamily: 'var(--font-editorial)', fontStyle: 'italic', fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>{L.subtitle}</p>
          </div>
        </div>
      </section>

      <div className="w-full px-6 md:px-12 py-16 md:py-20" style={{ background: 'var(--brand-gray-light)' }}>
        <div className="max-w-[1400px] mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((e) => (
              <ArticleCard key={e.slug} article={e} to={`/blog/${categorySegmentFor(categoryId, lang)}/${e.slug}`} size="grid" />
            ))}
          </div>

          <div style={{ marginTop: 48, textAlign: 'center' }}>
            <Link to={`/blog/${categorySegmentFor(otherId, lang)}`} style={{ fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--brand-navy)', textDecoration: 'none', borderBottom: '2px solid var(--brand-fuchsia)', paddingBottom: 4 }}>
              {categoryId === 'carriera' ? 'Sei un’azienda? Suggerimenti per il recruiting →' : 'Cerchi lavoro? Suggerimenti per la carriera →'}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
export default BlogCategoria;
