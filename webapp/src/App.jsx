import React, { useEffect, Suspense, lazy, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Filters from './components/Filters';
import Features from './components/Features';
import Vetrini from './components/Vetrini';
import Philosophy from './components/Philosophy';
import Protocol from './components/Protocol';
import Blog from './components/Blog';
import Footer from './components/Footer';

// Lazy load the Ad components
const AdSlot = lazy(() => import('./components/AdSlot'));

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
      <Navbar showLoginModal={showLoginModal} setShowLoginModal={setShowLoginModal} />
      <main className="flex flex-col w-full">
        <Hero setShowLoginModal={setShowLoginModal} />
        <Filters />
        

        
        <Vetrini />

        {/* Ad placeholders 50/50 */}
        <Suspense fallback={null}>
          <div className="w-full flex flex-col md:flex-row border-t border-b border-slate-200/60">
            <div className="flex-1 min-h-[160px] md:border-r border-slate-200/60">
              <AdSlot id="A" type="internal" />
            </div>
            <div className="flex-1 min-h-[160px]">
              <AdSlot id="B" type="internal" />
            </div>
          </div>
        </Suspense>
        


        <Blog />

      </main>
      <Footer />
    </div>
  );
}

export default App;
