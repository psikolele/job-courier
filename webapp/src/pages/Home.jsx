import React, { Suspense } from 'react';
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import Filters from '../components/Filters';
import Vetrini from '../components/Vetrini';
import Blog from '../components/Blog';

import AdBanner from '../components/AdBanner';

const Home = ({ setShowLoginModal }) => {
  return (
    <main className="flex flex-col w-full">
      <Hero setShowLoginModal={setShowLoginModal} />
      <div style={{display:'none'}}><Stats /></div>
      <AdBanner type="top" />

      <Filters />

      <Vetrini />

      <AdBanner type="bottom" />

      <Blog />
    </main>
  );
};

export default Home;
