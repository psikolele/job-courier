import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Philosophy from './components/Philosophy';
import Protocol from './components/Protocol';
import CTA from './components/CTA';
import Footer from './components/Footer';

function App() {
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
      <Navbar />
      <main className="flex flex-col w-full">
        <Hero />
        <CTA />
        <Features />
        <Philosophy />
        <Protocol />
      </main>
      <Footer />
    </div>
  );
}

export default App;
