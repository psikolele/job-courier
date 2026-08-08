import React, { Suspense } from 'react';
import PageSeo from '../components/PageSeo';
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import Filters from '../components/Filters';
import Vetrini from '../components/Vetrini';
import Blog from '../components/Blog';

const Home = ({ setShowLoginModal }) => {
  return (
    <main className="flex flex-col w-full">
      <PageSeo page="home" />
      <Hero setShowLoginModal={setShowLoginModal} />
      <div style={{display:'none'}}><Stats /></div>
      <Filters />

      <Vetrini />

      <Blog />
    </main>
  );
};

export default Home;
