import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <main className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-24 text-center">
    <Helmet>
      <title>Pagina non trovata | JobCourier</title>
      <meta name="robots" content="noindex" />
    </Helmet>
    <p className="text-sm font-semibold uppercase tracking-widest text-fuchsia-600">Errore 404</p>
    <h1 className="mt-3 font-serif text-4xl font-bold text-slate-900 md:text-5xl">
      Pagina non trovata
    </h1>
    <p className="mt-4 max-w-md text-slate-600">
      La pagina che cerchi non esiste o è stata spostata. Torna alla home oppure esplora le offerte di lavoro.
    </p>
    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
      <Link
        to="/"
        className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
      >
        Torna alla home
      </Link>
      <Link
        to="/offerte"
        className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900"
      >
        Vedi le offerte
      </Link>
    </div>
  </main>
);

export default NotFound;
