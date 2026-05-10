/**
 * Utility to merge class names.
 * Lightweight version compatible with Tailwind CSS.
 * @param {...string} classes - Class names to merge.
 * @returns {string} - Merged class names.
 */
export function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}
