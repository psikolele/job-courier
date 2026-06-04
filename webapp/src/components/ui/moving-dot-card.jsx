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
    <div className="jc-dot-outer">
      <div className="jc-dot-dot" />
      <div className="jc-dot-card">
        <div className="jc-dot-ray" />
        <div className="jc-dot-text">{display}</div>
        <div className="jc-dot-label">{label}</div>
        <div className="jc-dot-line jc-dot-topl" />
        <div className="jc-dot-line jc-dot-leftl" />
        <div className="jc-dot-line jc-dot-bottoml" />
        <div className="jc-dot-line jc-dot-rightl" />
      </div>
    </div>
  );
}
