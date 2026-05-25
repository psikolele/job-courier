import React, { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';

const hexToRgba = (hex, alpha) => {
  let hexValue = hex.startsWith('#') ? hex.slice(1) : hex;
  if (hexValue.length === 3) {
    hexValue = hexValue.split('').map(char => char + char).join('');
  }
  const r = parseInt(hexValue.slice(0, 2), 16);
  const g = parseInt(hexValue.slice(2, 4), 16);
  const b = parseInt(hexValue.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const GRID_HOVER_NUM_COLS = 36;
const GRID_HOVER_NUM_ROWS = 12;
const GRID_HOVER_TOTAL_CELLS = GRID_HOVER_NUM_COLS * GRID_HOVER_NUM_ROWS;
const GRID_HOVER_RIPPLE_EFFECT_SIZE = "18.973665961em";

const JS_RIPPLE_KEYFRAMES = `
  @keyframes js-ripple-animation {
    0% { transform: scale(0); opacity: 1; }
    100% { transform: scale(1); opacity: 0; }
  }
  .animate-js-ripple-effect {
    animation: js-ripple-animation var(--ripple-duration) ease-out forwards;
  }
`;

/**
 * RippleButton / AnimatedButton
 * Advanced multi-cell hover grid tracking ripple button.
 */
export const RippleButton = ({
  children,
  onClick,
  className = '',
  disabled = false,
  variant = 'hover', // hover, hoverborder, ghost, default
  rippleColor: userProvidedRippleColor,
  rippleDuration = 600,
  hoverBaseColor = '#26367b', // JobCourier navy default
  hoverRippleColor: customHoverRippleColor,
  hoverBorderEffectColor = 'rgba(47, 157, 229, 0.45)', // JobCourier bright azure default
  hoverBorderEffectThickness = '0.3em',
  href,
  external = false,
  target,
  title,
  type = "button",
  ...props
}) => {
  const [jsRipples, setJsRipples] = useState([]);

  const determinedJsRippleColor = useMemo(() => {
    if (userProvidedRippleColor) return userProvidedRippleColor;
    return 'var(--button-ripple-color, rgba(255, 255, 255, 0.15))';
  }, [userProvidedRippleColor]);

  const dynamicGridHoverStyles = useMemo(() => {
    let nthChildHoverRules = '';
    const cellDim = 0.25;
    const initialTopOffset = 0.125;
    const initialLeftOffset = 0.1875;
    const hoverEffectDuration = '0.9s';

    for (let r = 0; r < GRID_HOVER_NUM_ROWS; r++) {
      for (let c = 0; c < GRID_HOVER_NUM_COLS; c++) {
        const childIndex = r * GRID_HOVER_NUM_COLS + c + 1;
        const topPos = initialTopOffset + r * cellDim;
        const leftPos = initialLeftOffset + c * cellDim;

        if (variant === 'hover') {
          nthChildHoverRules += `
            .hover-variant-grid-cell:nth-child(${childIndex}):hover ~ .hover-variant-visual-ripple {
              top: ${topPos}em; left: ${leftPos}em;
              transition: width ${hoverEffectDuration} ease, height ${hoverEffectDuration} ease, top 0s linear, left 0s linear;
            }`;
        } else if (variant === 'hoverborder') {
          nthChildHoverRules += `
            .hoverborder-variant-grid-cell:nth-child(${childIndex}):hover ~ .hoverborder-variant-visual-ripple {
              top: ${topPos}em; left: ${leftPos}em;
              transition: width ${hoverEffectDuration} ease-out, height ${hoverEffectDuration} ease-out, top 0s linear, left 0s linear;
            }`;
        }
      }
    }

    if (variant === 'hover') {
      const actualHoverRippleColor = customHoverRippleColor
        ? customHoverRippleColor
        : hexToRgba(hoverBaseColor, 0.35);
      return `
        .hover-variant-visual-ripple {
          background-color: ${actualHoverRippleColor};
          transition: width ${hoverEffectDuration} ease, height ${hoverEffectDuration} ease, top 99999s linear, left 99999s linear;
        }
        .hover-variant-grid-cell:hover ~ .hover-variant-visual-ripple {
          width: ${GRID_HOVER_RIPPLE_EFFECT_SIZE}; height: ${GRID_HOVER_RIPPLE_EFFECT_SIZE};
        }
        ${nthChildHoverRules}
      `;
    } else if (variant === 'hoverborder') {
      return `
        .hoverborder-variant-ripple-container {
          padding: ${hoverBorderEffectThickness};
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
        }
        .hoverborder-variant-visual-ripple {
          background-color: ${hoverBorderEffectColor};
          transition: width ${hoverEffectDuration} ease-out, height ${hoverEffectDuration} ease-out, top 99999s linear, left 9999s linear;
        }
        .hoverborder-variant-grid-cell:hover ~ .hoverborder-variant-visual-ripple {
          width: ${GRID_HOVER_RIPPLE_EFFECT_SIZE}; height: ${GRID_HOVER_RIPPLE_EFFECT_SIZE};
        }
        ${nthChildHoverRules}
      `;
    }
    return '';
  }, [variant, hoverBaseColor, customHoverRippleColor, hoverBorderEffectColor, hoverBorderEffectThickness]);

  const createJsRipple = (event) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    const newRipple = { key: Date.now(), x, y, size, color: determinedJsRippleColor };
    setJsRipples(prev => [...prev, newRipple]);
    setTimeout(() => {
      setJsRipples(currentRipples => currentRipples.filter(r => r.key !== newRipple.key));
    }, rippleDuration);
  };

  const handleButtonClick = (event) => {
    if (!disabled) {
      createJsRipple(event);
      if (onClick) onClick(event);
    }
  };

  const jsRippleElements = (
    <div className="absolute inset-0 pointer-events-none z-[5]">
      {jsRipples.map(ripple => (
        <span
          key={ripple.key}
          className="absolute rounded-full animate-js-ripple-effect"
          style={{
            left: ripple.x, top: ripple.y, width: ripple.size, height: ripple.size,
            backgroundColor: ripple.color,
            '--ripple-duration': `${rippleDuration}ms`,
          }}
        />
      ))}
    </div>
  );

  const baseClasses = [
    "relative", "border-none", "isolate", "cursor-pointer", "select-none",
    disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "",
    className
  ].filter(Boolean).join(" ");

  const renderContent = () => (
    <>
      <span className="relative z-[10] pointer-events-none">{children}</span>
      {jsRippleElements}
      
      {(variant === 'hover' || variant === 'hoverborder') && (
        <div
          className={`absolute inset-0 grid pointer-events-none z-[0] ${
            variant === 'hover' ? 'hover-variant-grid-container overflow-hidden' : 'hoverborder-variant-ripple-container rounded-[inherit]'
          }`}
          style={{ gridTemplateColumns: `repeat(${GRID_HOVER_NUM_COLS}, 0.25em)` }}
        >
          {Array.from({ length: GRID_HOVER_TOTAL_CELLS }, (_, index) => (
            <span
              key={index}
              className={`${
                variant === 'hover' ? 'hover-variant-grid-cell' : 'hoverborder-variant-grid-cell'
              } relative flex justify-center items-center pointer-events-auto`}
            />
          ))}
          <div
            className={`${
              variant === 'hover' ? 'hover-variant-visual-ripple' : 'hoverborder-variant-visual-ripple'
            } pointer-events-none absolute w-0 h-0 rounded-full transform -translate-x-1/2 -translate-y-1/2 top-0 left-0 z-[-1]`}
          />
        </div>
      )}
    </>
  );

  // Return the router link, anchor, or button as a fully unified interactive component
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: JS_RIPPLE_KEYFRAMES }} />
      <style dangerouslySetInnerHTML={{ __html: dynamicGridHoverStyles }} />
      
      {href ? (
        external ? (
          <a
            href={href}
            target={target || "_blank"}
            rel="noopener noreferrer"
            className={baseClasses}
            title={title}
            onClick={handleButtonClick}
            {...props}
          >
            {renderContent()}
          </a>
        ) : (
          <Link
            to={href}
            className={baseClasses}
            title={title}
            onClick={handleButtonClick}
            {...props}
          >
            {renderContent()}
          </Link>
        )
      ) : (
        <button
          type={type}
          className={baseClasses}
          onClick={handleButtonClick}
          disabled={disabled}
          title={title}
          {...props}
        >
          {renderContent()}
        </button>
      )}
    </>
  );
};

// Also export as AnimatedButton to support existing files transparently!
export const AnimatedButton = RippleButton;
