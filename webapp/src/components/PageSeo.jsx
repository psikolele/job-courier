import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { alternatesFor } from '../data/routeSegments';

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
 * Open Graph is set per page here. It could not be before: this version of Helmet appends
 * meta tags rather than replacing ones already in the document, so an og:title here shipped
 * two of them with index.html's generic one first. main.jsx now removes those static tags
 * once the app boots — they stay in the served HTML for clients that do not run JavaScript,
 * which is every social scraper — so this is the only og:title on a rendered page.
 *
 * `jsonLd` is an optional array of plain objects, each rendered as its own
 * `<script type="application/ld+json">` — one script per object, JSON.stringify'd
 * rather than templated, so a title or company name containing a quote can't break out
 * of the script tag. Pages that need structured data (JobPosting today, Organization
 * later for AziendaDettaglio) pass it here instead of adding a local <Helmet>.
 */
// Same asset index.html points at, so a page that says nothing more specific still shares
// with the site's own mark rather than whatever the network picks.
const OG_IMAGE = 'https://www.jobcourier.ch/logo-square.png';
const SITE = 'https://www.jobcourier.ch';

/**
 * `routeId` names an entry in data/routeSegments.js and makes the page emit the hreflang
 * set for its four language URLs. Pages that exist at a single URL for every language —
 * the home page, a job ad, a company profile — pass nothing and emit none: hreflang
 * describes alternates, and claiming four for one URL is the "referenced for more than one
 * language" error, not a bonus.
 *
 * Without these tags /offerte and /stellenangebote read to a crawler as two unrelated
 * pages that happen to overlap, and neither vouches for the other. Declaring them
 * reciprocally is what makes the German URL rankable on German queries — which is what
 * jobroom.jobcourier.ch has been doing, and we had not.
 */
const PageSeo = ({ page, values, jsonLd, routeId }) => {
  const { t, i18n } = useTranslation();
  const title = t(`seo.${page}.title`, values);
  const description = t(`seo.${page}.description`, values);
  const lang = i18n.language?.slice(0, 2) || 'it';
  const alternates = routeId ? alternatesFor(routeId) : [];

  return (
    <Helmet>
      {/* index.html hardcodes lang="it": without this every translated page kept
          declaring itself Italian, contradicting the hreflang below. Same reason
          BlogSeo sets it. */}
      <html lang={lang} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={OG_IMAGE} />
      {alternates.map(({ lang: l, path }) => (
        <link key={l} rel="alternate" hrefLang={l} href={`${SITE}${path}`} />
      ))}
      {(jsonLd || []).map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default PageSeo;
