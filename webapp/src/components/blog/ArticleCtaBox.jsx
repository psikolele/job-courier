import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Riquadro domanda → azione JC (spunto Laura). Sfondo navy, domanda Playfair, bottone fuchsia.
const ArticleCtaBox = ({ question, action, to }) => (
  <div style={{ background: 'var(--brand-navy)', padding: '32px 28px', margin: '40px 0', borderLeft: '3px solid var(--brand-fuchsia)' }}>
    <p style={{ fontFamily: 'var(--font-editorial)', fontStyle: 'italic', fontSize: 24, color: '#fff', lineHeight: 1.3, margin: 0 }}>
      {question}
    </p>
    <Link to={to} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 20, background: 'var(--brand-fuchsia)', color: '#fff', padding: '12px 24px', fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none' }}>
      {action} <ArrowRight size={14} />
    </Link>
  </div>
);
export default ArticleCtaBox;
