import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const { t } = useTranslation();
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-24 text-center">
      <Helmet>
        <title>{t('notfound.meta_title')}</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <p className="text-sm font-semibold uppercase tracking-widest text-fuchsia-600">{t('notfound.error_label')}</p>
      <h1 className="mt-3 font-serif text-4xl font-bold text-slate-900 md:text-5xl">
        {t('notfound.title')}
      </h1>
      <p className="mt-4 max-w-md text-slate-600">
        {t('notfound.desc')}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/"
          className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          {t('notfound.back_home')}
        </Link>
        <Link
          to="/offerte"
          className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900"
        >
          {t('notfound.see_offers')}
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
