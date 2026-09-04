import React, { useEffect, useRef } from 'react';
import PageSeo from '../components/PageSeo';
import LegalPage from '../components/LegalPage';

/**
 * Cookiebot renders the live cookie table itself. It stays a real component
 * rather than markup in the locale files, because the script has to be injected
 * once into a mounted node — the body copy around it is translated, this is not.
 */
const CookieDeclaration = () => {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el || el.querySelector('script')) return;
        const script = document.createElement('script');
        script.id = 'CookieDeclaration';
        script.src = 'https://consent.cookiebot.com/29601bde-40d6-45d8-be15-4b7bdef2d50c/cd.js';
        script.type = 'text/javascript';
        script.async = true;
        el.appendChild(script);
    }, []);
    return <div ref={ref} />;
};

// The copy lives in the locale files (`legal.cookies`), not here.
const CookiePolicy = () => (
    <LegalPage
        contentKey="legal.cookies"
        seo={<PageSeo page="cookie" />}
        widgets={{ cookieDeclaration: <CookieDeclaration /> }}
    />
);

export default CookiePolicy;
