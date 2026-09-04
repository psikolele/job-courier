/**
 * Combines list-level job data with scraped detailed job data
 * to determine the correct apply redirection target (external ATS vs JobRoom detail page).
 *
 * @param {Object} job - The job data loaded from the list endpoint (/api/jobs)
 * @param {Object} jobDetail - The detailed job data loaded from the detail endpoint (/api/job-detail)
 * @returns {Object} An object containing { redirect: boolean, url: string }
 */
export function getApplyData(job, jobDetail) {
  if (!job) {
    return { redirect: false, url: '' };
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
