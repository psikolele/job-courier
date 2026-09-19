import { describe, it, expect } from 'vitest';

import { buildCompanySeo } from './azienda-ssr.js';

const BOILERPLATE = 'Vuoi entrare a far parte del nostro team? Invia la tua candidatura spontanea.';
const ABOUT = 'Rapelli produce specialità di salumeria del Ticino.';
const canonical = 'https://jobcourier.ch/azienda/rapelli';

describe('buildCompanySeo — about nel rendering server', () => {
  it('con about: meta description, JSON-LD e corpo usano la descrizione, non il boilerplate', () => {
    const seo = buildCompanySeo(
      { name: 'Rapelli', brand_description: BOILERPLATE, about: ABOUT, website: 'https://www.rapelli.ch' },
      canonical
    );
    expect(seo.description).toContain(ABOUT);
    expect(seo.description).not.toContain('Vuoi entrare');
    expect(seo.organization.description).toBe(ABOUT);
    expect(seo.paragraphs).toEqual([ABOUT, BOILERPLATE]);
  });

  it('senza about: come prima, descrizione dalla banda e nessun description nel JSON-LD', () => {
    const seo = buildCompanySeo({ name: 'Betacom', brand_description: BOILERPLATE, about: '' }, canonical);
    expect(seo.description).toContain(BOILERPLATE);
    expect(seo.organization.description).toBeUndefined();
    expect(seo.paragraphs).toEqual(['', BOILERPLATE]);
  });

  it('senza about né banda: descrizione generica', () => {
    const seo = buildCompanySeo({ name: 'Betacom' }, canonical);
    expect(seo.description).toContain('Scopri Betacom su JobCourier');
  });
});
