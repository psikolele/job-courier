/**
 * Normalizes an external href that may be missing its scheme ("www.foo.ch/bar")
 * without mangling one that already has any scheme — http(s), tel:, mailto:,
 * protocol-relative "//host/path", etc. Both the Arca24 and legacy jobroom band
 * markup have been seen serving scheme-less hrefs for the same "Sito web" field;
 * a naive "no https:// prefix -> prepend it" check turns "tel:+41…" into
 * "https://tel:+41…" instead of leaving it alone.
 */
export function normalizeExternalHref(href) {
  const h = String(href || '').trim();
  if (!h) return '';
  if (h.startsWith('//')) return `https:${h}`;
  if (/^[a-z][a-z0-9+.-]*:/i.test(h)) return h;
  return `https://${h}`;
}
