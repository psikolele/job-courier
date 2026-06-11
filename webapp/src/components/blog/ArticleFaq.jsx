import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const ArticleFaq = ({ items, title = 'FAQ' }) => {
  const [open, setOpen] = useState(null);
  if (!items?.length) return null;
  return (
    <div style={{ marginTop: 48 }}>
      <h2 style={{ fontFamily: 'var(--font-editorial)', fontStyle: 'italic', fontSize: 28, color: 'var(--brand-navy)', marginBottom: 16 }}>{title}</h2>
      {items.map((f, i) => (
        <div key={i} style={{ borderBottom: '1px solid rgba(5,11,43,0.1)' }}>
          <button onClick={() => setOpen(open === i ? null : i)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 4px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 15, color: 'var(--brand-navy)' }}>{f.q}</span>
            <ChevronDown size={16} color="var(--brand-fuchsia)" style={{ transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }} />
          </button>
          {open === i && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.75, color: 'var(--brand-navy)', opacity: 0.8, padding: '0 4px 18px', margin: 0 }}>{f.a}</p>
          )}
        </div>
      ))}
    </div>
  );
};
export default ArticleFaq;
