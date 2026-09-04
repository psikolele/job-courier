import React from 'react';
import PageSeo from '../components/PageSeo';
import LegalPage from '../components/LegalPage';

// The copy lives in the locale files (`legal.terms`), not here: it used to be
// hardcoded Italian JSX, so the whole page stayed Italian in EN/DE/FR.
const CondizioniGenerali = () => (
    <LegalPage contentKey="legal.terms" seo={<PageSeo page="condizioni" />} />
);

export default CondizioniGenerali;
