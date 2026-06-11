import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { listByCategory } from '../data/blog/blogIndex.js';
import { resolveCategorySegment, categorySegmentFor } from '../data/blog/categories.js';
import BlogSeo from '../components/blog/BlogSeo.jsx';

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

  return (
    <div className="w-full px-6 md:px-12 pt-28 pb-20" style={{ background: 'var(--brand-gray-light)' }}>
      <div className="max-w-[1400px] mx-auto w-full">
        <BlogSeo type="category" lang={lang} categoryId={categoryId} title={`${L.title} | JobCourier`} description={L.subtitle} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <span style={{ width: 28, height: 2, background: 'var(--brand-fuchsia)' }} />
          <span style={{ fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--brand-fuchsia)' }}>{L.breadcrumb}</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-editorial)', fontStyle: 'italic', fontSize: 38, color: 'var(--brand-navy)', margin: '0 0 8px' }}>{L.title}</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--brand-gray-mid)', margin: '0 0 36px' }}>{L.subtitle}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((e) => (
            <Link key={e.slug} to={`/blog/${categorySegmentFor(categoryId, lang)}/${e.slug}`}
              className="group" style={{ background: '#fff', border: '1px solid rgba(5,11,43,0.08)', textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
              <img src={e.image} alt={e.title} style={{ width: '100%', height: 180, objectFit: 'cover', filter: 'grayscale(1)', transition: 'filter .3s' }}
                onMouseEnter={(ev) => (ev.currentTarget.style.filter = 'none')} onMouseLeave={(ev) => (ev.currentTarget.style.filter = 'grayscale(1)')} />
              <div style={{ padding: '22px 22px 26px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--brand-gray-mid)', marginBottom: 10 }}>
                  <Clock size={12} /> {e.readingTime} min di lettura
                </span>
                <h2 style={{ fontFamily: 'var(--font-brand)', fontWeight: 900, fontSize: 19, textTransform: 'uppercase', color: 'var(--brand-navy)', lineHeight: 1.15, margin: '0 0 10px' }}>{e.title}</h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.6, color: 'var(--brand-navy)', opacity: 0.7, margin: '0 0 16px', flex: 1 }}>{e.abstract}</p>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--brand-fuchsia)' }}>
                  Leggi articolo <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <Link to={`/blog/${categorySegmentFor(otherId, lang)}`} style={{ fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--brand-navy)', textDecoration: 'none', borderBottom: '2px solid var(--brand-fuchsia)', paddingBottom: 4 }}>
            {categoryId === 'carriera' ? 'Sei un’azienda? Suggerimenti per il recruiting →' : 'Cerchi lavoro? Suggerimenti per la carriera →'}
          </Link>
        </div>
      </div>
    </div>
  );
};
export default BlogCategoria;
