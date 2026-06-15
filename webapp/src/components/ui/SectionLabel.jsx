import React from "react";

export default function SectionLabel({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <span style={{ width: 28, height: 2, background: 'var(--brand-fuchsia)', display: 'inline-block' }} />
      <span style={{ fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--brand-fuchsia)' }}>{children}</span>
    </div>
  );
}
