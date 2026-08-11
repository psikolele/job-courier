import React from 'react';

// Rotating gradient border.
//
// The obvious implementation animates a `@property --gradient-angle` inside a
// conic-gradient. It reads well but repaints the element's whole background
// every frame, and the ADV banners are 357x235 each — three of them on the home
// page. Instead the gradient is a static conic layer that we spin with
// `transform: rotate()`: compositor-only, no repaint, and no reliance on
// registered custom properties (Safari < 16.4, Firefox < 128).
//
// Structure: frame (padding = border width, clips) > ring (oversized spinning
// gradient) > inner (opaque, carries the banner). The padding is what shows
// through as the border.

const defaultGradientColors = {
  primary: 'var(--brand-navy)',
  secondary: 'var(--brand-fuchsia)',
  accent: '#FF8FC0',
};

const animationClasses = {
  'auto-rotate': 'jc-ring-auto',
  'rotate-on-hover': 'jc-ring-hover',
  'stop-rotate-on-hover': 'jc-ring-stop-hover',
};

const BorderRotate = React.forwardRef(function BorderRotate(
  {
    children,
    className = '',
    as: Tag = 'div',
    animationMode = 'auto-rotate',
    animationSpeed = 8,
    gradientColors = defaultGradientColors,
    backgroundColor = '#FFFFFF',
    borderWidth = 2,
    borderRadius = 14,
    style = {},
    ...props
  },
  ref
) {
  const { primary, secondary, accent } = { ...defaultGradientColors, ...gradientColors };

  return (
    <Tag
      ref={ref}
      className={`jc-ring-frame ${animationClasses[animationMode] || ''} ${className}`}
      style={{
        '--jc-ring-duration': `${animationSpeed}s`,
        padding: borderWidth,
        borderRadius,
        ...style,
      }}
      {...props}
    >
      <span
        aria-hidden="true"
        className="jc-ring-spinner"
        style={{
          backgroundImage: `conic-gradient(
            ${primary} 0deg,
            ${secondary} 65deg,
            ${accent} 90deg,
            ${secondary} 115deg,
            ${primary} 180deg,
            ${secondary} 245deg,
            ${accent} 270deg,
            ${secondary} 295deg,
            ${primary} 360deg
          )`,
        }}
      />
      <span
        className="jc-ring-inner"
        style={{
          background: backgroundColor,
          borderRadius: Math.max(borderRadius - borderWidth, 0),
        }}
      >
        {children}
      </span>
    </Tag>
  );
});

export { BorderRotate };
export default BorderRotate;
