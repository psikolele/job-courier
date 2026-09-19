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

  it('senza about: frase generica (mai il boilerplate della banda) e nessun description nel JSON-LD', () => {
    const seo = buildCompanySeo({ name: 'Betacom', brand_description: BOILERPLATE, about: '' }, canonical);
    expect(seo.description).toContain('Scopri Betacom su JobCourier');
    expect(seo.description).not.toContain('Vuoi entrare');
    expect(seo.organization.description).toBeUndefined();
    expect(seo.paragraphs).toEqual(['', BOILERPLATE]);
  });

  it('senza about né banda: descrizione generica', () => {
    const seo = buildCompanySeo({ name: 'Betacom' }, canonical);
    expect(seo.description).toBe('Scopri Betacom su JobCourier: offerte di lavoro e candidatura spontanea.');
  });
});

describe('buildCompanySeo — nome non ripetuto nella meta description', () => {
  const desc = (name, about) => buildCompanySeo({ name, about, brand_description: BOILERPLATE }, canonical).description;

  it('non antepone il nome quando il testo inizia già con lo stesso nome', () => {
    expect(desc('WWF Svizzera', 'WWF Svizzera fa parte della rete del WWF.')).toBe('WWF Svizzera fa parte della rete del WWF.');
    expect(desc('E-Work Sagl', "E-Work è un'agenzia che propone personale.")).toBe("E-Work è un'agenzia che propone personale.");
  });

  it('riconosce il nome anche quando il testo usa solo la prima parola', () => {
    expect(desc('Rapelli - ORIOR Food AG', 'Rapelli produce salumeria.')).toBe('Rapelli produce salumeria.');
    expect(desc('Arca24.com SA', 'Arca24 sviluppa software HR.')).toBe('Arca24 sviluppa software HR.');
  });

  it('mantiene il nome quando il testo non lo contiene in apertura', () => {
    expect(desc('Sormani Servizi Sagl', 'Sandro Sormani SA si occupa di pittura.')).toBe('Sormani Servizi Sagl — Sandro Sormani SA si occupa di pittura.');
  });

  it('non scambia un prefisso di parola per il nome (Er ≠ Erwin)', () => {
    expect(desc('ER Services', 'Erwin produce viti.')).toBe('ER Services — Erwin produce viti.');
  });

  it('con il solo boilerplate della banda si usa la frase generica', () => {
    const d = buildCompanySeo({ name: 'Betacom', brand_description: BOILERPLATE }, canonical).description;
    expect(d.startsWith('Scopri Betacom su JobCourier')).toBe(true);
  });
});
