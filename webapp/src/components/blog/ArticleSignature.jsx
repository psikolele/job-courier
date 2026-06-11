import React from 'react';
import { getSignature } from '../../data/blog/signatures.js';
import { useTranslation } from 'react-i18next';

// Firma emotiva di chiusura (requisito Gabriele: rilevanza emotiva e visiva).
const ArticleSignature = ({ kind }) => {
  const { i18n } = useTranslation();
  const lines = getSignature(kind, i18n.language);
  if (!lines) return null;
  const highlight = (text) => {
    const idx = text.indexOf('JobCourier');
    if (idx === -1) return text;
    return (<>{text.slice(0, idx)}<span style={{ color: 'var(--brand-fuchsia)' }}>JobCourier</span>{text.slice(idx + 'JobCourier'.length)}</>);
  };
  return (
    <div style={{ marginTop: 56, borderTop: '1px solid rgba(5,11,43,0.1)', textAlign: 'center', background: 'var(--brand-gray-light)', padding: '40px 24px' }}>
      <span style={{ display: 'inline-block', width: 28, height: 2, background: 'var(--brand-fuchsia)', marginBottom: 20 }} />
      {lines.map((line, i) => (
        <p key={i} style={{ fontFamily: 'var(--font-editorial)', fontStyle: 'italic', fontSize: i === 0 ? 26 : 24, color: 'var(--brand-navy)', lineHeight: 1.35, margin: i === 0 ? '0 0 8px' : 0 }}>
          {highlight(line)}
        </p>
      ))}
    </div>
  );
};
export default ArticleSignature;
