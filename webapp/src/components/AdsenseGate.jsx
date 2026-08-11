import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ADSENSE_SRC = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4406252930350703';
const SCRIPT_ID = 'adsense-auto-ads';

// Google's Auto ads engine scans the page once its script loads and keeps
// placing units as the DOM changes afterwards — it has no concept of client-side
// route changes. The only way to keep the homepage ad-free in an SPA is to never
// request the script while on "/", and to tear down anything it already placed
// when navigating back there. Cookiebot's blockingmode="auto" watches the DOM for
// scripts added after its own initial scan, so the same
// type="text/plain" data-cookieconsent="marketing" gate used in index.html works
// here too.
const AdsenseGate = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const existing = document.getElementById(SCRIPT_ID);

    if (pathname === '/') {
      if (existing) existing.remove();
      document.querySelectorAll('ins.adsbygoogle').forEach((el) => el.remove());
      window.adsbygoogle = [];
      return;
    }

    if (!existing) {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.type = 'text/plain';
      script.async = true;
      script.src = ADSENSE_SRC;
      script.crossOrigin = 'anonymous';
      script.setAttribute('data-cookieconsent', 'marketing');
      document.head.appendChild(script);
    }
  }, [pathname]);

  return null;
};

export default AdsenseGate;
