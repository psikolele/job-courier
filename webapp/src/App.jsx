import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { consumeReturnUrl, cameFromJobRoom } from './hooks/useReturnUrl';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import ComeFunziona from './pages/ComeFunziona';
import Offerte from './pages/Offerte';
import OffertaDettaglio from './pages/OffertaDettaglio';

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

  // Return-from-JobRoom redirect
  useEffect(() => {
    if (cameFromJobRoom()) {
      const returnUrl = consumeReturnUrl();
      if (returnUrl) {
        requestAnimationFrame(() => navigate(returnUrl, { replace: true }));
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
      <ScrollToTop />
      <Navbar showLoginModal={showLoginModal} setShowLoginModal={setShowLoginModal} />
      <Routes>
        <Route path="/" element={<Home setShowLoginModal={setShowLoginModal} />} />
        <Route path="/soluzioni-e-tariffe" element={<Pricing />} />
        <Route path="/contatti" element={<Contact />} />
        <Route path="/come-funziona" element={<ComeFunziona />} />
        <Route path="/offerte" element={<Offerte setShowLoginModal={setShowLoginModal} />} />
        <Route path="/offerta/:id" element={<OffertaDettaglio />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
