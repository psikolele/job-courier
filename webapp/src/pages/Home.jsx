import React, { Suspense } from 'react';
import Hero from '../components/Hero';
import Filters from '../components/Filters';
import Vetrini from '../components/Vetrini';
import Blog from '../components/Blog';

import AdBanner from '../components/AdBanner';

const Home = ({ setShowLoginModal }) => {
  return (
    <main className="flex flex-col w-full">
      <Hero setShowLoginModal={setShowLoginModal} />
      <Filters />
      
      <Vetrini />

      {/* Ad placeholders 50/50 */}
      <AdBanner />
      
      <Blog />
    </main>
  );
};

export default Home;
