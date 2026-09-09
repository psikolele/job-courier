import { describe, it, expect } from 'vitest';
import { langFromPath, translatePath } from './langFromPath.js';

describe('langFromPath', () => {
  it('legge la lingua dai segmenti tradotti delle pagine', () => {
    expect(langFromPath('/offerte')).toBe('it');
    expect(langFromPath('/stellenangebote')).toBe('de');
    expect(langFromPath('/offres-emploi')).toBe('fr');
    expect(langFromPath('/jobs')).toBe('en');
    expect(langFromPath('/entreprises-qui-recrutent')).toBe('fr');
    expect(langFromPath('/kontakt')).toBe('de');
  });

  it('legge la lingua dal segmento categoria del blog', () => {
    expect(langFromPath('/blog/karriere')).toBe('de');
    expect(langFromPath('/blog/carriere')).toBe('fr');
    expect(langFromPath('/blog/career')).toBe('en');
    expect(langFromPath('/blog/carriera')).toBe('it');
  });

  it('usa lo slug articolo quando il segmento categoria è condiviso', () => {
    // 'recruiting' is the same string in all four locales, so only the slug can say.
    expect(langFromPath('/blog/recruiting/how-to-write-an-effective-job-ad')).toBe('en');
    expect(langFromPath('/blog/recruiting/stellenanzeige-schreiben-die-wirkt')).toBe('de');
    expect(langFromPath('/blog/recruiting/come-scrivere-un-annuncio-di-lavoro-efficace')).toBe('it');
  });

  it('non deduce nulla dove l URL non dichiara una lingua', () => {
    // One URL shared by every language: the visitor's stored preference must survive.
    expect(langFromPath('/')).toBe(null);
    expect(langFromPath('')).toBe(null);
    expect(langFromPath('/faq')).toBe(null);
    expect(langFromPath('/blog/recruiting')).toBe(null);
    expect(langFromPath('/offerta/12345')).toBe(null);
    expect(langFromPath('/azienda/qualche-azienda')).toBe(null);
    expect(langFromPath('/pagina-inesistente')).toBe(null);
  });

  it('tollera input non validi', () => {
    expect(langFromPath(null)).toBe(null);
    expect(langFromPath(undefined)).toBe(null);
    expect(langFromPath('///')).toBe(null);
  });
});

describe('translatePath', () => {
  it('traduce il segmento di pagina mantenendo la posizione', () => {
    expect(translatePath('/offerte', 'de')).toBe('/stellenangebote');
    expect(translatePath('/stellenangebote', 'fr')).toBe('/offres-emploi');
    expect(translatePath('/offres-emploi', 'it')).toBe('/offerte');
    expect(translatePath('/aziende-che-assumono', 'en')).toBe('/companies-hiring');
  });

  it('traduce categoria e slug del blog insieme', () => {
    expect(translatePath('/blog/carriera', 'de')).toBe('/blog/karriere');
    expect(translatePath('/blog/karriere', 'it')).toBe('/blog/carriera');
    expect(translatePath('/blog/recruiting/come-scrivere-un-annuncio-di-lavoro-efficace', 'en'))
      .toBe('/blog/recruiting/how-to-write-an-effective-job-ad');
    // Back from a translated slug, not just forward from the Italian one.
    expect(translatePath('/blog/recruiting/how-to-write-an-effective-job-ad', 'de'))
      .toBe('/blog/recruiting/stellenanzeige-schreiben-die-wirkt');
  });

  it('lascia intatti i path senza forma per lingua', () => {
    expect(translatePath('/', 'de')).toBe('/');
    expect(translatePath('/faq', 'de')).toBe('/faq');
    expect(translatePath('/offerta/12345', 'fr')).toBe('/offerta/12345');
    expect(translatePath('/azienda/una-azienda', 'de')).toBe('/azienda/una-azienda');
    expect(translatePath('/pagina-inesistente', 'de')).toBe('/pagina-inesistente');
    expect(translatePath('/offerte', 'xx')).toBe('/offerte');
  });

  it('è reversibile su ogni lingua', () => {
    for (const lang of ['it', 'en', 'de', 'fr']) {
      const translated = translatePath('/offerte', lang);
      expect(translatePath(translated, 'it')).toBe('/offerte');
    }
  });
});

describe('translatePath — query e hash', () => {
  it('conserva i filtri quando cambia lingua', () => {
    expect(translatePath('/offerte?sector=Sanita&canton=TI', 'de'))
      .toBe('/stellenangebote?sector=Sanita&canton=TI');
    expect(translatePath('/stellenangebote?global=1&jobId=42', 'it'))
      .toBe('/offerte?global=1&jobId=42');
  });
  it('conserva l ancora', () => {
    expect(translatePath('/come-funziona#aziende', 'fr')).toBe('/comment-ca-marche#aziende');
    expect(translatePath('/blog/carriera?p=2', 'de')).toBe('/blog/karriere?p=2');
  });
  it('conserva query anche sui path non traducibili', () => {
    expect(translatePath('/offerta/123?ref=home', 'de')).toBe('/offerta/123?ref=home');
    expect(translatePath('/?x=1', 'de')).toBe('/?x=1');
  });
});
