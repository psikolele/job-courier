import React, { Suspense, lazy } from 'react';
import Hero from '../components/Hero';
import Filters from '../components/Filters';
import Vetrini from '../components/Vetrini';
import Blog from '../components/Blog';

// Lazy load the Ad components
const AdSlot = lazy(() => import('../components/AdSlot'));

const Home = ({ setShowLoginModal }) => {
  return (
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
  );
};

export default Home;
