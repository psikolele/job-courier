import React, { useState, useEffect, useRef } from 'react';

export default function SpotlightCard({ target, duration = 2000, label }) {
  const [count, setCount] = useState(0);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

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

  const formatSwiss = (n) => {
    if (n < 1000) return `${n}`;
    const thousands = Math.floor(n / 1000);
    const remainder = n % 1000;
    return `${thousands}'${String(remainder).padStart(3, '0')}`;
  };

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const display = `${formatSwiss(count)}${count >= target ? '+' : ''}`;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="jc-spotlight-card"
    >
      {isHovered && (
        <div
          className="jc-spotlight-glow"
          style={{
            background: `radial-gradient(circle 90px at ${coords.x}px ${coords.y}px, rgba(255, 31, 122, 0.18), transparent 80%)`,
          }}
        />
      )}
      <div className="jc-spotlight-content">
        <div className="jc-spotlight-text">{display}</div>
        <div className="jc-spotlight-label">{label}</div>
      </div>
    </div>
  );
}
