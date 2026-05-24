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

  // Fallback to the list data parameters
  return {
    redirect: job.redirect || false,
    url: job.apply_url || job.link || ''
  };
}
