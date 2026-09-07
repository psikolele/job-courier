import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { gateDecision } from '../utils/adsenseGate';

const ADSENSE_SRC = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4406252930350703';
const SCRIPT_ID = 'adsense-auto-ads';

const marketingGranted = () => window.Cookiebot?.consent?.marketing === true;

/**
 * Loads AdSense on every route except the homepage, and only with marketing
 * consent.
 *
 * Google's Auto ads engine scans the page once its script loads and keeps
 * placing units as the DOM changes afterwards — it has no concept of
 * client-side route changes. The only way to keep the homepage ad-free in an
 * SPA is to never request the script while on "/", and to tear down anything it
 * already placed when navigating back there.
 *
 * The consent gate is ours, not Cookiebot's. This used to inject the script as
 * type="text/plain" data-cookieconsent="marketing" and let Cookiebot's
 * auto-blocking rewrite it on consent — which only ever fires *at the moment
 * consent is given*. A returning visitor already has consent when the page
 * loads, so for them there was no such moment: land on the homepage, click
 * through to /offerte, and the tag this component appended stayed text/plain
 * forever. Measured on production 07.09: consent true, script type text/plain,
 * never loaded, and `window.adsbygoogle` left as the empty array the homepage
 * teardown had put there. No ads for anyone who did not arrive by direct URL —
 * which is most people.
 *
 * So the script is now appended live, and only once `Cookiebot.consent.marketing`
 * is true. Consent that arrives later still works: Cookiebot fires
 * CookiebotOnConsentReady/CookiebotOnAccept on window, and both re-run the same
 * check. Nothing is requested from pagead2.googlesyndication.com before then.
 */
const AdsenseGate = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const apply = () => {
      const decision = gateDecision({
        pathname,
        marketingConsent: marketingGranted(),
        scriptPresent: Boolean(document.getElementById(SCRIPT_ID)),
      });

      if (decision === 'teardown') {
        document.getElementById(SCRIPT_ID)?.remove();
        document.querySelectorAll('ins.adsbygoogle').forEach((el) => el.remove());
        window.adsbygoogle = [];
        return;
      }

      if (decision !== 'load') return;

      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = ADSENSE_SRC;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    };

    apply();

    // Consent may be answered after this route has already rendered — the
    // visitor accepting the banner while sitting on an offer page.
    window.addEventListener('CookiebotOnConsentReady', apply);
    window.addEventListener('CookiebotOnAccept', apply);
    return () => {
      window.removeEventListener('CookiebotOnConsentReady', apply);
      window.removeEventListener('CookiebotOnAccept', apply);
    };
  }, [pathname]);

  return null;
};

export default AdsenseGate;
