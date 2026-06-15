import React from 'react';

/**
 * RouteLoader — loader di transizione brandizzato (concept "Courier Dot").
 * Su fondo bianco: il dot fuchsia percorre la rotta, poi il logo sale 2px
 * sopra la linea e fa 2 battiti lenti. Tutta l'animazione è CSS (vedi
 * index.css, namespace .jcl-*). Nessuna dipendenza Remotion nel bundle.
 *
 * Montato/smontato da App.jsx tramite useRouteLoader (durata fissa).
 */
export default function RouteLoader() {
  return (
    <div className="jcl-overlay" role="status" aria-label="Caricamento pagina" aria-live="polite">
      <div className="jcl-top" aria-hidden="true" />
      <span className="jcl-corner jcl-corner-l" aria-hidden="true">JOBCOURIER.CH</span>
      <span className="jcl-corner jcl-corner-r" aria-hidden="true">00 / 01</span>

      <div className="jcl-stage" aria-hidden="true">
        <div className="jcl-route-bg" />
        <div className="jcl-route" />
        <div className="jcl-dot" />
        <div className="jcl-lockwrap">
          <img
            src="/logo-full.svg"
            onError={(e) => { e.currentTarget.src = '/logo-full.png'; }}
            alt=""
            className="jcl-logo"
          />
        </div>
      </div>
    </div>
  );
}
