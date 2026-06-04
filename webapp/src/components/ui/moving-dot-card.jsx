import React, { useState, useEffect } from 'react';

export default function DotCard({ target = 777000, duration = 2000, label = 'Views' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = target;
    if (end <= 0) return;
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
    <div className="dot-card-outer">
      <div className="dot-card-dot"></div>
      <div className="dot-card-inner">
        <div className="dot-card-ray"></div>
        <div className="dot-card-text">{display}</div>
        <div className="dot-card-label">{label}</div>
        <div className="dot-card-line dot-card-topl"></div>
        <div className="dot-card-line dot-card-leftl"></div>
        <div className="dot-card-line dot-card-bottoml"></div>
        <div className="dot-card-line dot-card-rightl"></div>
      </div>
    </div>
  );
}
