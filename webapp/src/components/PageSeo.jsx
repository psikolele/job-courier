import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

/**
 * Per-page title and description.
 *
 * Without it every route inherited the one <title> in index.html, so eight pages —
 * /offerte, the five static ones, the legal ones and every job ad — went to Google
 * as "JobCourier - Il portale svizzero per il lavoro". Duplicate titles across a site
 * is exactly what a search engine deduplicates away, and this landed right as the
 * new site was being reindexed.
 *
 * `page` names a block under `seo` in the locale files; `values` fills the
 * placeholders the job-ad entry uses.
 *
 * Only title and description. This version of Helmet appends meta tags instead of
 * replacing ones already in the document, so adding og:title here would ship two of
 * them with the static one from index.html first — worse than the generic tag alone.
 * Per-page Open Graph needs those static tags gone, and they are what a crawler that
 * does not run JavaScript sees.
 */
const PageSeo = ({ page, values }) => {
  const { t } = useTranslation();
  const title = t(`seo.${page}.title`, values);
  const description = t(`seo.${page}.description`, values);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
    </Helmet>
  );
};

export default PageSeo;
