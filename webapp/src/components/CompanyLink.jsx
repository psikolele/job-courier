/**
 * Shared hover treatment for a company name/logo link, wherever it's used —
 * one visual language across the three places this repeats: the offer
 * list card, the offer detail pane, and the offer sidebar. None of the
 * three share the same DOM shape (name and logo are adjacent in one, split
 * across branches in the other two, one of them not even inside a real
 * <a> at all — see `Offerte.jsx`'s comments at each call site), so there's
 * no single wrapping component that fits all three without fighting one of
 * their layouts. Each call site wires its own `<Link>` or click-to-navigate
 * span, sharing `group` on the nearest ancestor that contains both name and
 * logo, and these two classes for the visual cue.
 *
 * `group-hover` so two disjoint elements under the same `group` ancestor
 * still hover in sync: hovering either one sets `:hover` on that shared
 * ancestor too (CSS hover bubbles to ancestors), which is what drives both
 * even when they aren't nested inside each other.
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
