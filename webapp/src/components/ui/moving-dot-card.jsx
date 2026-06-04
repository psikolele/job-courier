import React, { useState, useEffect } from 'react';

export default function DotCard({ target = 777000, duration = 2000, label = 'Views' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = target;
    const range = end - start;
    if (range <= 0) return;
    const increment = Math.ceil(end / (duration / 50));
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setCount(start);
    }, 50);
    return () => clearInterval(timer);
  }, [target, duration]);

  const display = count < 1000 ? count : `${Math.floor(count / 1000)}k`;

  return (
    <div style={{
      position: 'relative',
      flex: 1,
      minHeight: 130,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Moving dot */}
      <div style={{
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.82)',
        animation: 'moveDot 4s linear infinite',
        zIndex: 10,
        boxShadow: '0 0 8px rgba(255,255,255,0.55)',
      }} />

      {/* Card */}
      <div style={{
        position: 'relative',
        width: '88%',
        height: '88%',
        minHeight: 112,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.13)',
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {/* Ray glow */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% -10%, rgba(255,255,255,0.1) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* Number */}
        <div style={{
          fontFamily: 'var(--font-brand)',
          fontWeight: 900,
          fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
          color: '#a8c4e8',
          letterSpacing: '-0.03em',
          lineHeight: 1,
          position: 'relative',
          zIndex: 1,
        }}>{display}</div>

        {/* Label */}
        <div style={{
          fontFamily: 'var(--font-brand)',
          fontWeight: 700,
          fontSize: '0.42rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.45)',
          marginTop: 8,
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          padding: '0 6px',
        }}>{label}</div>

        {/* Corner lines */}
        <div style={{ position: 'absolute', top: 0, left: 12, right: 12, height: 1, background: 'rgba(255,255,255,0.12)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 12, right: 12, height: 1, background: 'rgba(255,255,255,0.12)' }} />
        <div style={{ position: 'absolute', left: 0, top: 12, bottom: 12, width: 1, background: 'rgba(255,255,255,0.12)' }} />
        <div style={{ position: 'absolute', right: 0, top: 12, bottom: 12, width: 1, background: 'rgba(255,255,255,0.12)' }} />
      </div>
    </div>
  );
}
