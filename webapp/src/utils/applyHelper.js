/**
 * Combines list-level job data with scraped detailed job data
 * to determine the correct apply redirection target (external ATS vs JobRoom detail page).
 *
 * @param {Object} job - The job data loaded from the list endpoint (/api/jobs)
 * @param {Object} jobDetail - The detailed job data loaded from the detail endpoint (/api/job-detail)
 * @returns {Object} An object containing { redirect: boolean, url: string }
 */
/**
 * Ids arrive in two shapes — `6738863` from the detail endpoint, sometimes
 * `6738863-slug` from the list — so they are compared on the numeric prefix.
 * A missing id on either side means there is nothing to contradict, so the detail stands.
 */
function stessoAnnuncio(job, jobDetail) {
  const chiave = (v) => String(v ?? '').split('-')[0];
  const delDettaglio = chiave(jobDetail?.id);
  const delJob = chiave(job?.jobroom_id ?? job?.id);
  // Only a genuine contradiction disqualifies the detail. When either side has no
  // id there is nothing to compare, and refusing it there would throw away the
  // authoritative answer for every ad whose list entry carries no id.
  if (!delDettaglio || !delJob) return true;
  return delDettaglio === delJob;
}

export function getApplyData(job, jobDetail) {
  if (!job) {
    return { redirect: false, url: '' };
  }

  // A detail belonging to another ad is worse than no detail: while a new
  // selection loads, the previous ad's detail is still in state, and trusting it
  // would answer with that ad's apply link under this ad's title.
  if (!stessoAnnuncio(job, jobDetail)) {
    return {
      redirect: job.redirect || false,
      url: job.apply_url || job.link || ''
    };
  }

  // If detailed data is loaded and reports an external redirect, override listing defaults
  if (jobDetail && jobDetail.redirect && jobDetail.external_url) {
    return {
      redirect: true,
      url: jobDetail.external_url
    };
  }

  // Detail loaded and says this one is not external: trust it over the list.
  // The list's flags are stale for exactly this case, and falling through to
  // `job.apply_url` here sent the candidate to the listing's stored link rather
  // than the ad's own apply page.
  if (jobDetail) {
    return {
      redirect: false,
      url: jobDetail.apply_url || jobDetail.original_link || job.apply_url || job.link || ''
    };
  }

  // No detail yet — the list is all we have.
  return {
    redirect: job.redirect || false,
    url: job.apply_url || job.link || ''
  };
}
