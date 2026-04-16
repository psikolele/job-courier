import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Pricing from './pages/Pricing';

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
    <div className="relative w-full bg-[#FAF8F5] text-[#2A2A35] min-h-screen selection:bg-[#C9A84C]/30">
      <ScrollToTop />
      <Navbar showLoginModal={showLoginModal} setShowLoginModal={setShowLoginModal} />
      <Routes>
        <Route path="/" element={<Home setShowLoginModal={setShowLoginModal} />} />
        <Route path="/soluzioni-e-tariffe" element={<Pricing />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
