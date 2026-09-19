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
 * Underline (a 1px line growing in from the left), not a color shift: the name is already brand-fuchsia at rest in
 * one of the three call sites, so a `group-hover:text-[...]` would have
 * nothing to shift to there — and an inline `color` always wins over a
 * Tailwind class of any kind regardless (see `meeting-2026-09-17-scroll-
 * reversal.md` in the wiki for the incident this project already had with
 * that exact trap). An underline reads as "this is a link" independent of
 * whatever color the text already has.
 */
export const companyNameHoverClass = 'box-decoration-clone bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat bg-[length:0%_1px] bg-[position:0_100%] pb-px transition-[background-size] duration-300 ease-out group-hover:bg-[length:100%_1px] motion-reduce:transition-none';
export const companyLogoHoverClass = 'transition-all duration-200 group-hover:scale-105 group-hover:shadow-[0_6px_16px_-4px_rgba(255,31,122,0.35)] motion-reduce:transition-none motion-reduce:group-hover:scale-100';
