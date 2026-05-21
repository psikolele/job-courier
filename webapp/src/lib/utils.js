/**
 * Utility to merge class names.
 * Lightweight version compatible with Tailwind CSS.
 * @param {...string} classes - Class names to merge.
 * @returns {string} - Merged class names.
 */
export function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}

/**
 * Formats a Swiss location string into an abbreviated format, e.g. "Mezzovico (TI)"
 * @param {string} location - The raw location string.
 * @returns {string} - The formatted location string.
 */
export function formatSwissLocation(location) {
    if (!location) return '';
    
    // Clean up "Svizzera" or "Switzerland" references
    let cleaned = location
        .replace(/,\s*Svizzera/gi, '')
        .replace(/,\s*Switzerland/gi, '')
        .replace(/Switzerland,\s*/gi, '')
        .trim();
        
    // Standardize locations with canton code
    const cantonRegex = /\b(TI|BE|ZH|GE|GR|LU|SG|AG|BS|VD|VS|NE|FR|SO|SH|AR|AI|GL|ZG|SZ|OW|NW|UR|JU|TG|BL)\b/i;
    
    const match = cleaned.match(cantonRegex);
    if (match) {
        const canton = match[1].toUpperCase();
        // Remove the canton and possible trailing/leading spaces or punctuation
        let city = cleaned.replace(cantonRegex, '').replace(/,\s*$/, '').replace(/^\s*,/, '').trim();
        return `${city} (${canton})`;
    }
    
    return cleaned;
}

