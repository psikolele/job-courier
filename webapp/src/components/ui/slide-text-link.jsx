import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Adapted from Kokonut UI "slide-text-button" (MIT, kokonutui.com): label slides up
 * on hover and a second copy takes its place. Ported to plain JSX + an <a> (the
 * original is Next.js/TypeScript) and restyled to the brand's square ghost look.
 */
export default function SlideTextLink({ href, text, icon, className, ...props }) {
    return (
        <a
            href={href}
            className={cn(
                'group relative inline-flex h-12 items-center justify-center overflow-hidden px-6',
                'border border-[#050B2B]/15 text-[#050B2B] transition-colors duration-300',
                'hover:border-[#FF1F7A]/50 hover:bg-[#FF1F7A]/[0.04]',
                className
            )}
            style={{
                fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 11,
                letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none',
            }}
            {...props}
        >
            <span className="relative inline-block whitespace-nowrap transition-transform duration-300 ease-out group-hover:-translate-y-full motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
                <span className="flex items-center gap-2 transition-opacity duration-300 group-hover:opacity-0 motion-reduce:group-hover:opacity-100">
                    {icon}{text}
                </span>
                <span
                    aria-hidden="true"
                    className="absolute left-0 top-full flex items-center gap-2 text-[#FF1F7A] opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:group-hover:opacity-0"
                >
                    {icon}{text}
                </span>
            </span>
        </a>
    );
}
