import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { consumeReturnUrl, cameFromJobRoom } from './hooks/useReturnUrl';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RouteLoader from './components/ui/RouteLoader';
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
import NotFound from './pages/NotFound';

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
      <Helmet>
        <title>JobCourier - Il portale svizzero per il lavoro</title>
        <meta name="description" content="Trova il lavoro dei tuoi sogni in Svizzera o pubblica un annuncio per i migliori talenti su JobCourier." />
      </Helmet>
      <ScrollToTop />
      <Navbar showLoginModal={showLoginModal} setShowLoginModal={setShowLoginModal} />
      <Routes>
        <Route path="/" element={<Home setShowLoginModal={setShowLoginModal} />} />
        <Route path="/soluzioni-e-tariffe" element={<Pricing />} />
        <Route path="/contatti" element={<Contact />} />
        <Route path="/come-funziona" element={<ComeFunziona />} />
        <Route path="/offerte" element={<Offerte setShowLoginModal={setShowLoginModal} />} />
        <Route path="/offerta/:id" element={<OffertaDettaglio setShowLoginModal={setShowLoginModal} />} />
        <Route path="/blog" element={<Navigate to="/blog/carriera" replace />} />
        <Route path="/blog/:categoria" element={<BlogCategoria />} />
        <Route path="/blog/:categoria/:slug" element={<BlogArticolo />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/condizioni-generali" element={<CondizioniGenerali />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer setShowLoginModal={setShowLoginModal} />
      {routeLoaderVisible && <RouteLoader />}
    </div>
  );
}

export default App;
