import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Shared hover treatment for a company name/logo link, wherever it's used —
 * one visual language across the three places this repeats, even where the
 * name and logo aren't DOM-adjacent (see below) and can't share one <a>.
 * `group-hover` so two disjoint elements under the same `group` ancestor
 * still hover in sync: hovering either one sets `:hover` on that shared
 * ancestor too (CSS hover bubbles to ancestors), which is what drives both.
 *
 * Underline, not a color shift: the name is already brand-fuchsia at rest in
 * one of the three call sites, so a `group-hover:text-[...]` would have
 * nothing to shift to there — and an inline `color` always wins over a
 * Tailwind class of any kind regardless (see `meeting-2026-09-17-scroll-
 * reversal.md` in the wiki for the incident this project already had with
 * that exact trap). An underline reads as "this is a link" independent of
 * whatever color the text already has.
 */
export const companyNameHoverClass = 'transition-all duration-200 group-hover:underline group-hover:decoration-2 group-hover:underline-offset-2';
export const companyLogoHoverClass = 'transition-transform duration-200 group-hover:scale-105';

/**
 * Company name + logo as one clickable unit to its /azienda/:slug page — for
 * the one shape where they're already DOM-adjacent (stacked, no other content
 * between them, e.g. a sidebar). With no slug (reserved employers), renders
 * the same layout without a link.
 *
 * Where name and logo sit in different branches of the layout (the offer
 * detail pane's label-above-title row, the list card's title-and-logo row),
 * this component doesn't fit — one <a> can't span two non-adjacent branches
 * without also swallowing what's between them (the job title). Those call
 * sites wrap each element in its own <Link>, sharing `group` on their nearest
 * common ancestor and the hover classes above, instead of forcing this
 * component into a shape it wasn't built for.
 */
const CompanyLink = ({ slug, logo, name, logoSize = 72, className = '' }) => {
    const content = (
        <>
            {logo && (
                <div
                    style={{
                        width: logoSize, height: logoSize, flexShrink: 0,
                        background: '#FFFFFF', border: '1px solid rgba(5,11,43,0.07)',
                        padding: logoSize > 40 ? 8 : 4,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden'
                    }}
                    className={slug ? companyLogoHoverClass : ''}
                >
                    <img
                        src={logo}
                        alt={name}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        className="max-w-full max-h-full object-contain"
                    />
                </div>
            )}
            {name && <span className={slug ? companyNameHoverClass : ''}>{name}</span>}
        </>
    );

    if (!slug) return <div className={className}>{content}</div>;

    return (
        <Link to={`/azienda/${slug}`} className={`group ${className}`}>
            {content}
        </Link>
    );
};

export default CompanyLink;
