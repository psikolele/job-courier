/**
 * The apply link of an ad that is applied for on the employer's own site.
 *
 * Two shapes, because the portal serves two generations of page:
 *
 *  - the old one puts it in an anchor: `<a href=".../externalLink.php?redirect=...">`
 *  - the new `viso` platform never emits that anchor. The apply button is built at
 *    runtime from a JSON payload embedded in the page:
 *      {"label":"Candidati","action":{"url":"https://…/externalLink.php?redirect=…"}}
 *
 * Reading only the anchor is what made every ad look internal on 04.09.2026 —
 * Manpower, Adecco and Randstad ads whose applications go to easyapply.jobs were
 * all reported as `redirect: false`, so candidates were sent to the portal page
 * instead of the employer's form. The symptom was silence: nothing errored, the
 * external-apply notice simply never appeared anywhere on the site.
 *
 * Exported for tests.
 */
export function findExternalApplyHref(html, $) {
  const anchor = $ ? $('a[href*="externalLink.php"]').first() : null;
  const fromAnchor = anchor && anchor.length > 0 ? anchor.attr('href') : '';
  if (fromAnchor) return fromAnchor;

  // JSON payload: the value is a normal URL string, so stop at the quote that
  // closes it. `&` shows up when the payload is escaped for a script tag.
  const match = String(html || '').match(/https?:\/\/[^"'\s\\]*externalLink\.php\?[^"'\s\\]*/i);
  if (!match) return '';
  // An anchor may carry `&amp;`. A JSON payload escapes the separator, and the
  // match already stops at that backslash — which costs only the trailing
  // parameters, never `redirect`, because that one comes first.
  return match[0].replace(/&amp;/gi, '&');
}
