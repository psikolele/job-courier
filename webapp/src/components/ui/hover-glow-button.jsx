import React, { useRef, useState } from 'react';

/**
 * HoverButton - A custom interactive button with cursor-following glow effect.
 */
export const HoverButton = ({ 
  children, 
  onClick, 
  className = '', 
  disabled = false,
  glowColor = 'rgba(244, 63, 94, 0.4)', // Rose/Fuchsia themed glow default
  backgroundColor = 'var(--brand-navy, #050b2b)', // JobCourier navy default
  textColor = '#ffffff',
  hoverTextColor = '#ffffff',
  ...props
}) => {
  const buttonRef = useRef(null);
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setGlowPosition({ x, y });
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        relative inline-block cursor-pointer overflow-hidden transition-all duration-300 
        font-sans select-none
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      style={{
        backgroundColor: backgroundColor,
        color: isHovered ? hoverTextColor : textColor,
      }}
      {...props}
    >
      {/* Glow effect div */}
      <div
        className={`
          absolute w-[200px] h-[200px] rounded-full pointer-events-none 
          transition-transform duration-500 ease-out -translate-x-1/2 -translate-y-1/2
          ${isHovered ? 'scale-150 opacity-60' : 'scale-0 opacity-0'}
        `}
        style={{
          left: `${glowPosition.x}px`,
          top: `${glowPosition.y}px`,
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          zIndex: 0,
        }}
      />
      
      {/* Button content */}
      <span className="relative z-10">{children}</span>
    </button>
  );
};
