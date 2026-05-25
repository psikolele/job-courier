import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

/**
 * AnimatedButton - A premium, interactive button component.
 * Wraps buttons in a modern, cursor-tracking back-glow backdrop blur effect.
 */
export const AnimatedButton = ({
  children,
  className = "",
  onClick,
  href,
  external = false,
  target,
  title,
  type = "button",
  ...props
}) => {
  const glowRef = useRef(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      glow.style.transform = `translate(-${50 - (x - 50) / 5}%, -${50 - (y - 50) / 5}%)`;
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const baseClass = "relative inline-flex items-center justify-center gap-2 transition-all duration-300 focus:outline-none focus:ring-2 select-none cursor-pointer";

  return (
    <div className="relative inline-flex items-center justify-center group/btn">
      <style>{`
        @keyframes subtlePulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.55; }
        }
      `}</style>

      {/* Floating Interactive Glow Backdrop */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute w-[220%] h-[220%] rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-3xl opacity-0 group-hover/btn:opacity-40 transition-opacity duration-300"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          transition: "transform 150ms ease-out, opacity 300ms ease-in-out",
          animation: "subtlePulse 6s ease-in-out infinite",
        }}
      />

      {/* Actual button or link */}
      {href ? (
        external ? (
          <a
            href={href}
            target={target || "_blank"}
            rel="noopener noreferrer"
            className={`${baseClass} ${className}`}
            title={title}
            onClick={onClick}
            {...props}
          >
            {children}
          </a>
        ) : (
          <Link
            to={href}
            className={`${baseClass} ${className}`}
            title={title}
            onClick={onClick}
            {...props}
          >
            {children}
          </Link>
        )
      ) : (
        <button
          type={type}
          className={`${baseClass} ${className}`}
          onClick={onClick}
          title={title}
          {...props}
        >
          {children}
        </button>
      )}
    </div>
  );
};
