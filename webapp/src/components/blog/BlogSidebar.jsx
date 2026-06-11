import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { listByCategory } from '../../data/blog/blogIndex.js';
import { CATEGORIES, categorySegmentFor } from '../../data/blog/categories.js';

// Colonnina laterale (requisito Gabriele: preview altri articoli come pagina ricerche).
const BlogSidebar = ({ currentSlug, categoryId }) => {
  const { i18n, t } = useTranslation();
  const lang = i18n.language?.slice(0, 2) || 'it';
  const same = listByCategory(categoryId, lang).filter((e) => e.slug !== currentSlug).slice(0, 4);
  const otherId = categoryId === 'carriera' ? 'recruiting' : 'carriera';
  const otherFirst = listByCategory(otherId, lang)[0];
  const seg = categorySegmentFor(categoryId, lang);
  const otherSeg = categorySegmentFor(otherId, lang);
  const cta = CATEGORIES[categoryId];

  return (
    <aside>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ width: 28, height: 2, background: 'var(--brand-fuchsia)' }} />
        <span style={{ fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--brand-fuchsia)' }}>
          {t('blog.other_articles', 'Altri articoli')}
        </span>
      </div>
      {same.map((e) => (
        <Link key={e.slug} to={`/blog/${seg}/${e.slug}`} style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid rgba(5,11,43,0.08)', textDecoration: 'none' }}>
          <img src={e.image} alt="" style={{ width: 64, height: 64, objectFit: 'cover', filter: 'grayscale(1)', flexShrink: 0 }} />
          <div>
            <p style={{ fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 14, color: 'var(--brand-navy)', lineHeight: 1.25, margin: '0 0 6px' }}>{e.title}</p>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--brand-gray-mid)' }}>
              <Clock size={11} /> {e.readingTime} min
            </span>
          </div>
        </Link>
      ))}
      {otherFirst && (
        <Link to={`/blog/${otherSeg}`} style={{ display: 'block', marginTop: 20, padding: '16px 18px', border: '1px solid rgba(5,11,43,0.14)', textDecoration: 'none' }}>
          <span style={{ fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--brand-navy)' }}>
            {categoryId === 'carriera' ? t('blog.switch_to_recruiting', 'Sei un’azienda? Consigli di recruiting') : t('blog.switch_to_career', 'Cerchi lavoro? Consigli di carriera')}
          </span>
          <ArrowRight size={14} color="var(--brand-fuchsia)" style={{ marginLeft: 8, display: 'inline' }} />
        </Link>
      )}
      <Link to={cta.ctaTo} style={{ display: 'block', marginTop: 16, padding: '24px 20px', background: 'var(--brand-navy)', textDecoration: 'none', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-editorial)', fontStyle: 'italic', fontSize: 18, color: '#fff', margin: '0 0 12px' }}>
          {categoryId === 'carriera' ? t('blog.cta_career', 'Trova il tuo prossimo lavoro') : t('blog.cta_recruiting', 'Pubblica il tuo annuncio')}
        </p>
        <span style={{ display: 'inline-block', background: 'var(--brand-fuchsia)', color: '#fff', padding: '10px 22px', fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          {categoryId === 'carriera' ? t('blog.cta_career_btn', 'Vedi le offerte') : t('blog.cta_recruiting_btn', 'Scopri le soluzioni')}
        </span>
      </Link>
      {/* Slot adv: riuso asset banner esistenti (vedi AdBanner.jsx) */}
      <a href="https://www.blc-sa.ch" target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: 16, border: '1px solid rgba(5,11,43,0.08)' }}>
        <img src="/img/Gemini_Generated_Image_ape98sape98sape9.png" alt="Business Learning Centre SA" style={{ width: '100%', display: 'block' }} />
      </a>
    </aside>
  );
};
export default BlogSidebar;
