import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Inspired by Kokonut UI "gradient-button" (MIT, kokonutui.com): layered gradient,
 * soft inner glow and a hover overlay. Rebuilt for the brand — solid fuchsia instead
 * of the original's pastel emerald/purple/orange, and an <a> instead of a shadcn
 * Button, since every use here is an external link.
 */
export default function GradientCtaButton({ href, children, icon, className, ...props }) {
    return (
        <a
            href={href}
            className={cn(
                'group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden px-7 text-white',
                'transition-all duration-300 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0',
                className
            )}
            style={{
                fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 11,
                letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none',
                background: 'linear-gradient(180deg, #FF4C94 0%, #FF1F7A 55%, #E0126A 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 0 12px rgba(255,255,255,0.12), 0 8px 20px -8px rgba(255,31,122,0.6)',
            }}
            {...props}
        >
            <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
            <span className="relative">{children}</span>
            {icon && (
                <span className="relative transition-transform duration-300 group-hover:-translate-y-px group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">
                    {icon}
                </span>
            )}
        </a>
    );
}
