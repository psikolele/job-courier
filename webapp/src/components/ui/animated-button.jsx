import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * HoverButton / AnimatedButton
 * Purely fluid, hardware-accelerated, lightweight cursor-following glow button.
 * Custom built strictly following the JobCourier Brand Identity Guidelines.
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

  // Strict Brand Guidelines Colors
  const BRAND_NAVY = '#050B2B';
  const BRAND_FUCHSIA = '#FF1F7A';
  const BRAND_WHITE = '#FFFFFF';

  // Detect button variants based on Tailwind classes or background color props
  const isNavyBg = className.includes('bg-primary') || className.includes('bg-[#050B2B]') || className.includes('bg-navy') || backgroundColor === BRAND_NAVY;
  const isFuchsiaBg = className.includes('bg-accent') || className.includes('bg-[#FF1F7A]') || className.includes('bg-fuchsia') || backgroundColor === BRAND_FUCHSIA;

  // Determine glow color strictly following brand contrast rules:
  // - Fuchsia buttons on Navy/dark backgrounds get a brilliant WHITE glow so it is visible.
  // - Navy and Outline buttons get a highly vibrant FUCHSIA glow so it pops on dark/light backgrounds.
  // Determine glow color strictly following brand contrast rules:
  // - Fuchsia glow is highly vibrant and looks fantastic on dark blue (Navy) and light backgrounds alike.
  const determinedGlowColor = glowColor || BRAND_FUCHSIA;
  const determinedHoverTextColor = hoverTextColor || '';

  const baseClasses = `
    relative inline-block border-none cursor-pointer overflow-hidden transition-all duration-300 
    select-none text-center outline-none ring-offset-2 focus:ring-2 focus:ring-accent/40
    ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
    ${className}
  `;

  // Radial gradient opacity adjustments for high-contrast cinematic glow
  const outerRgba = determinedGlowColor === BRAND_WHITE 
    ? 'rgba(255, 255, 255, 0.2)' 
    : 'rgba(255, 31, 122, 0.35)';

  const renderContent = () => (
    <>
      {/* Glow effect div using strict brand colors with larger 250px radius */}
      <div
        className={`
          absolute w-[250px] h-[250px] rounded-full pointer-events-none 
          transition-transform duration-500 ease-out -translate-x-1/2 -translate-y-1/2 z-[0]
          ${isHovered ? 'scale-120 opacity-100' : 'scale-0 opacity-0'}
        `}
        style={{
          left: `${glowPosition.x}px`,
          top: `${glowPosition.y}px`,
          background: `radial-gradient(circle, ${determinedGlowColor} 10%, ${outerRgba} 45%, transparent 70%)`,
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
      ...(textColor || hoverTextColor ? { color: isHovered ? determinedHoverTextColor : textColor } : {}),
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

export const AnimatedButton = HoverButton;
export const RippleButton = HoverButton;
