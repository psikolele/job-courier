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
 * `id` is the ad being parsed. The page also carries related ads from the same
 * company (see the "Altri annunci di lavoro" block filtered out in _arca24.js),
 * and each of those can hold its own apply action. Taking the first match in
 * source order would hand the candidate another employer's form while everything
 * on screen still named this job — so the match must carry our own
 * `job_post_id`. When the payload identifies its ads and none of them is ours,
 * that is an answer too: this ad has no external application.
 *
 * Exported for tests.
 */
function parametro(url, nome) {
  try {
    return new URL(url, 'https://x.invalid').searchParams.get(nome);
  } catch {
    return null;
  }
}

/**
 * Of the candidate action URLs a JSON payload exposed, picks the one whose id param
 * (`paramName`) matches `id` — or, when nothing is given to disambiguate by (no `id`,
 * or the payload never names ids at all), the sole/first candidate. The payload names
 * its entries and none of them is ours: every match belongs to something else (a
 * related ad, another employer), so `''` is returned rather than handing back
 * someone else's link. Shared by `findExternalApplyHref` (`job_post_id`) and
 * `findExternalApplyCompanyHref` (`company_id`).
 */
function pickByIdParam(candidates, paramName, id) {
  if (id !== undefined && id !== null && String(id) !== '') {
    const mio = candidates.find((u) => parametro(u, paramName) === String(id));
    if (mio) return mio;
    if (candidates.some((u) => parametro(u, paramName) !== null)) return '';
  }
  return candidates[0];
}

export function findExternalApplyHref(html, $, id) {
  const anchor = $ ? $('a[href*="externalLink.php"]').first() : null;
  const fromAnchor = anchor && anchor.length > 0 ? anchor.attr('href') : '';
  if (fromAnchor) return fromAnchor;

  // JSON payload: each value is an ordinary URL string, so it ends at the quote,
  // whitespace or backslash that closes it. An anchor may carry `&amp;`; a JSON
  // payload escapes the separator, and the match already stops at that backslash
  // — which costs only the trailing parameters, never `redirect`, because that
  // one comes first.
  const trovati = (String(html || '').match(/https?:\/\/[^"'\s\\]*externalLink\.php\?[^"'\s\\]*/gi) || [])
    .map((u) => u.replace(/&amp;/gi, '&'));
  if (trovati.length === 0) return '';

  return pickByIdParam(trovati, 'job_post_id', id);
}

/**
 * The apply link of the "Candidatura spontanea" button on a company profile page.
 *
 * Same problem as `findExternalApplyHref`, different endpoint and shape: the
 * company page's button action carries its target under `link` as a root-relative
 * path (`/job/externalLinkCompany.php?redirect=...`), not under `url` as an
 * absolute one. `id` here is the company id (`company_id` in the payload), not a
 * job id — a mismatch means the payload identified its own company and it isn't
 * the one asked for, so nothing is returned rather than another employer's link.
 */
export function findExternalApplyCompanyHref(html, $, id) {
  const anchor = $ ? $('a[href*="externalLinkCompany.php"]').first() : null;
  const fromAnchor = anchor && anchor.length > 0 ? anchor.attr('href') : '';
  if (fromAnchor) return fromAnchor;

  const trovati = (String(html || '').match(/\/job\/externalLinkCompany\.php\?[^"'\s\\]*/gi) || [])
    .map((u) => u.replace(/&amp;/gi, '&'));
  if (trovati.length === 0) return '';

  return pickByIdParam(trovati, 'company_id', id);
}
