import React from 'react';
import { Helmet } from 'react-helmet-async';
import { slugFor } from '../../data/blog/blogIndex.js';
import { categorySegmentFor } from '../../data/blog/categories.js';

const SITE = 'https://www.jobcourier.ch';
const LANGS = ['it', 'en', 'de', 'fr'];

// Helmet + hreflang + JSON-LD per pagine blog.
// type: 'category' | 'article'
const BlogSeo = ({ type, lang, categoryId, article, itSlug, title, description }) => {
  const seg = (l) => categorySegmentFor(categoryId, l);
  const urlFor = (l) =>
    type === 'article'
      ? `${SITE}/blog/${seg(l)}/${slugFor(itSlug, l)}`
      : `${SITE}/blog/${seg(l)}`;
  const canonical = urlFor(lang);

  const jsonLd = [];
  if (type === 'article' && article) {
    jsonLd.push({
      '@context': 'https://schema.org', '@type': 'Article',
      headline: article.title, description: article.metaDescription,
      datePublished: article.datePublished, image: article.image, inLanguage: lang,
      publisher: { '@type': 'Organization', name: 'JobCourier', url: SITE },
      mainEntityOfPage: canonical,
    });
    if (article.faq?.length) {
      jsonLd.push({
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: article.faq.map((f) => ({
          '@type': 'Question', name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      });
    }
    jsonLd.push({
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog/${seg(lang)}` },
        { '@type': 'ListItem', position: 3, name: article.title, item: canonical },
      ],
    });
  }

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {LANGS.map((l) => (<link key={l} rel="alternate" hrefLang={l} href={urlFor(l)} />))}
      <link rel="alternate" hrefLang="x-default" href={urlFor('it')} />
      <meta property="og:type" content={type === 'article' ? 'article' : 'website'} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      {article?.image && <meta property="og:image" content={article.image} />}
      {jsonLd.map((obj, i) => (<script key={i} type="application/ld+json">{JSON.stringify(obj)}</script>))}
    </Helmet>
  );
};
export default BlogSeo;
