import React, { useState, useEffect } from 'react';

export default function DotCard({ target = 777000, duration = 2000, label = 'Views', direction = 'cw' }) {
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

  const formatSwiss = (n) => {
    if (n < 1000) return `${n}`;
    const thousands = Math.floor(n / 1000);
    const remainder = n % 1000;
    return `${thousands}'${String(remainder).padStart(3, '0')}`;
  };
  const display = `${formatSwiss(count)}${count >= target ? '+' : ''}`;
  const isLongText = display.length > 7;

  return (
    <div className="jc-dot-outer">
      <div className={direction === 'ccw' ? 'jc-dot-dot jc-dot-ccw' : 'jc-dot-dot'} />
      <div className="jc-dot-card">
        <div className="jc-dot-ray" />
        <div className="jc-dot-text" style={{ fontSize: isLongText ? '1.9rem' : '2.4rem' }}>{display}</div>
        <div className="jc-dot-label">{label}</div>
        <div className="jc-dot-line jc-dot-topl" />
        <div className="jc-dot-line jc-dot-leftl" />
        <div className="jc-dot-line jc-dot-bottoml" />
        <div className="jc-dot-line jc-dot-rightl" />
      </div>
    </div>
  );
}
