import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { findBySlug } from '../../data/blog/blogIndex.js';
import { categorySegmentFor } from '../../data/blog/categories.js';
import { useTranslation } from 'react-i18next';

// Riquadro "Leggi anche" → articolo correlato semanticamente (cross-linking Gabriele).
const ArticleRelatedBox = ({ question, slug }) => {
  const { i18n, t } = useTranslation();
  const hit = findBySlug(slug);
  if (!hit) return null;
  const seg = categorySegmentFor(hit.entry.category, i18n.language);
  return (
    <Link to={`/blog/${seg}/${slug}`} style={{ display: 'block', border: '1px solid rgba(5,11,43,0.14)', padding: '24px 28px', margin: '40px 0', textDecoration: 'none' }}>
      <span style={{ fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--brand-fuchsia)' }}>
        {t('blog.read_also', 'Leggi anche')}
      </span>
      <p style={{ fontFamily: 'var(--font-editorial)', fontStyle: 'italic', fontSize: 20, color: 'var(--brand-navy)', margin: '10px 0 6px' }}>{question}</p>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--brand-navy)', fontWeight: 600 }}>
        {hit.entry.title} <ArrowRight size={14} color="var(--brand-fuchsia)" />
      </span>
    </Link>
  );
};
export default ArticleRelatedBox;
