import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { distinctPathsFor } from './data/routeSegments';
import { langFromPath } from './utils/langFromPath';
import { consumeReturnUrl, cameFromJobRoom } from './hooks/useReturnUrl';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Analytics } from '@vercel/analytics/react';

gsap.registerPlugin(ScrollTrigger);

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RouteLoader from './components/ui/RouteLoader';
import AdsenseGate from './components/AdsenseGate';
import useRouteLoader from './hooks/useRouteLoader';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import ComeFunziona from './pages/ComeFunziona';
import Offerte from './pages/Offerte';
import OffertaDettaglio from './pages/OffertaDettaglio';
import FAQ from './pages/FAQ';
import CondizioniGenerali from './pages/CondizioniGenerali';
import CookiePolicy from './pages/CookiePolicy';
import BlogCategoria from './pages/BlogCategoria';
import BlogArticolo from './pages/BlogArticolo';
import AziendeCheAssumono from './pages/AziendeCheAssumono';
import AziendaDettaglio from './pages/AziendaDettaglio';
import NotFound from './pages/NotFound';

// Canonical host: www is the indexed hostname (sitemap, robots and the 213 legacy URLs).
const SITE = 'https://www.jobcourier.ch';

/**
 * One <Route> per distinct URL a page has across the four languages: /offerte and its
 * /jobs, /stellenangebote and /offres-emploi, all rendering the same component. The
 * component reads its copy from i18n as before — what changes is that each language now
 * has a URL of its own for a crawler to index, which is the whole point (see
 * data/routeSegments.js).
 *
 * Derived from the segment map rather than written out by hand so a language added there
 * cannot silently lack a route. Every path produced here must also exist in vercel.json's
 * rewrites: without it the URL works in-app and 404s when typed directly.
 */
const localizedRoutes = (routeId, element) =>
  distinctPathsFor(routeId).map(({ path }) => <Route key={path} path={path} element={element} />);

/**
 * Keeps the rendered language in step with the URL after a client-side navigation.
 *
 * i18n.js reads the URL on boot, but a <Link> to /stellenangebote never re-runs that, so
 * without this the German URL would render in whatever language was showing before —
 * contradicting its own canonical and hreflang. Paths that name no language (home, a job
 * ad) return null and leave the visitor's choice alone.
 */
const SyncLangWithPath = () => {
  const { pathname } = useLocation();
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = langFromPath(pathname);
    if (lang && lang !== i18n.language?.slice(0, 2)) i18n.changeLanguage(lang);
  }, [pathname, i18n]);

  return null;
};

// Helper to scroll to top on route change
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    } else {
      setTimeout(() => {
        const element = document.getElementById(hash.replace('#', ''));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [pathname, hash]);

  return null;
};

function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();
  const routeLoaderVisible = useRouteLoader();
  const { pathname } = useLocation();
  // Blog pages render their own BlogSeo canonical, which overrides this one.
  // '/' keeps its slash — the sitemap lists the home page that way and it is the form the
  // prerendered index.html ships, so the tag does not change when the app boots.
  const canonical = `${SITE}${pathname === '/' ? '/' : pathname.replace(/\/+$/, '')}`;

  // Return-from-JobRoom redirect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const hasSuccessParam = params.get('auth_success') === '1' || params.get('registered') === '1' || params.get('login_success') === '1';

      if (cameFromJobRoom() || hasSuccessParam) {
        localStorage.setItem('jc_user_session', 'true');
        
        if (hasSuccessParam) {
          params.delete('auth_success');
          params.delete('registered');
          params.delete('login_success');
          const newSearch = params.toString();
          const cleanUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
          window.history.replaceState({}, '', cleanUrl);
        }

        const returnUrl = consumeReturnUrl();
        if (returnUrl) {
          requestAnimationFrame(() => navigate(returnUrl, { replace: true }));
        }
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Add noise overlay dynamically to ensure it stays on top
    const noise = document.createElement('div');
    noise.className = 'noise-overlay';
    document.body.appendChild(noise);

    return () => {
      document.body.removeChild(noise);
    };
  }, []);

  return (
    <div className="relative w-full min-h-screen" style={{ background: 'var(--brand-gray-light)', color: 'var(--brand-navy)' }}>
      {/* Canonical and og:url only. The title and description live with the page that
          knows what it is about — see components/PageSeo.jsx. Repeating a description
          here does not act as a fallback: both tags end up in the head, and the generic
          one comes first. */}
      <Helmet>
        <link rel="canonical" href={canonical} />
        <meta property="og:url" content={canonical} />
      </Helmet>
      <SyncLangWithPath />
      <ScrollToTop />
      <AdsenseGate />
      <Navbar showLoginModal={showLoginModal} setShowLoginModal={setShowLoginModal} />
      <Routes>
        <Route path="/" element={<Home setShowLoginModal={setShowLoginModal} />} />
        {localizedRoutes('pricing', <Pricing />)}
        {localizedRoutes('contatti', <Contact />)}
        {localizedRoutes('comeFunziona', <ComeFunziona />)}
        {localizedRoutes('offerte', <Offerte setShowLoginModal={setShowLoginModal} />)}
        <Route path="/offerta/:id" element={<OffertaDettaglio setShowLoginModal={setShowLoginModal} />} />
        {localizedRoutes('aziende', <AziendeCheAssumono />)}
        <Route path="/azienda/:slug" element={<AziendaDettaglio />} />
        <Route path="/blog" element={<Navigate to="/blog/carriera" replace />} />
        <Route path="/blog/:categoria" element={<BlogCategoria />} />
        <Route path="/blog/:categoria/:slug" element={<BlogArticolo />} />
        {localizedRoutes('faq', <FAQ />)}
        <Route path="/condizioni-generali" element={<CondizioniGenerali />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer setShowLoginModal={setShowLoginModal} />
      {routeLoaderVisible && <RouteLoader />}
      <Analytics />
    </div>
  );
}

export default App;
