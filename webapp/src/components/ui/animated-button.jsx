import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * HoverButton / AnimatedButton
 * Purely fluid, hardware-accelerated, lightweight cursor-following glow button.
 * Inspired by https://21st.dev/community/components/easemize/hover-glow-button/default
 */
export const HoverButton = ({ 
  children, 
  onClick, 
  className = '', 
  disabled = false,
  glowColor,
  backgroundColor,
  textColor,
  hoverTextColor,
  href,
  external = false,
  target,
  title,
  type = "button",
  ...props
}) => {
  const buttonRef = useRef(null);
  const [glowPosition, setGlowPosition] = useState({ x: 0, y: 0 });
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

  // Detect if the button is dark/navy to apply fuchsia guidelines
  const isDarkButton = className.includes('bg-primary') || className.includes('bg-surface') || className.includes('bg-[#050B2B]') || className.includes('bg-navy') || backgroundColor === '#000' || backgroundColor === '#050B2B';

  // Determine standard colors following brand guidelines
  const determinedGlowColor = glowColor || (isDarkButton ? '#FF1F7A' : '#2f9de5');
  const determinedHoverTextColor = hoverTextColor || '#ffffff';

  const baseClasses = `
    relative inline-block border-none cursor-pointer overflow-hidden transition-all duration-300 
    select-none text-center outline-none ring-offset-2 focus:ring-2 focus:ring-accent/40
    ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
    ${className}
  `;

  const renderContent = () => (
    <>
      {/* Glow effect div */}
      <div
        className={`
          absolute w-[200px] h-[200px] rounded-full opacity-45 pointer-events-none 
          transition-transform duration-500 ease-out -translate-x-1/2 -translate-y-1/2 z-[0]
          ${isHovered ? 'scale-120 opacity-75' : 'scale-0 opacity-0'}
        `}
        style={{
          left: `${glowPosition.x}px`,
          top: `${glowPosition.y}px`,
          background: `radial-gradient(circle, ${determinedGlowColor} 10%, rgba(255,31,122,0.15) 40%, transparent 70%)`,
          zIndex: 0,
        }}
      />
      {/* Button content */}
      <span className="relative z-10">{children}</span>
    </>
  );

  const buttonProps = {
    ref: buttonRef,
    onMouseMove: handleMouseMove,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onClick: !disabled ? onClick : undefined,
    className: baseClasses,
    title: title,
    style: {
      backgroundColor: backgroundColor,
      color: isHovered ? determinedHoverTextColor : textColor,
    },
    ...props
  };

  if (href) {
    if (external) {
      return (
        <a href={href} target={target || "_blank"} rel="noopener noreferrer" {...buttonProps}>
          {renderContent()}
        </a>
      );
    } else {
      return (
        <Link to={href} {...buttonProps}>
          {renderContent()}
        </Link>
      );
    }
  }

  return (
    <button type={type} disabled={disabled} {...buttonProps}>
      {renderContent()}
    </button>
  );
};

// Aliasing HoverButton as AnimatedButton so existing components consume this ultra-fluid hover glow transparently!
export const AnimatedButton = HoverButton;
export const RippleButton = HoverButton; // Backwards compatibility for easemize schema
