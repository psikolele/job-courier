import { describe, it, expect } from 'vitest';

import { buildOffertaTitle } from './offerta-ssr.js';

// Regression fixtures for the 2026-08-29 Semrush audit: 15 pages with a too-long <title>
// and 4 pages with a byte-identical <title> as another page. Both defects trace back to
// the same one-liner: `clamp(job.title, 70) + " - {company} - JobCourier"`, which let the
// job title alone reach 70 chars before the ~20-char suffix was even added, and never
// considered location — so two ads for the same role from the same agency, in different
// towns, produced the same title. See offerta-ssr.js for the fix.

describe('buildOffertaTitle', () => {
  it('keeps the full title/company/JobCourier shape when it already fits', () => {
    const title = buildOffertaTitle(
      'Produktionsmitarbeiter (m/w/d) 50-60%',
      'Adecco',
      'Svizzera, Schlieren, Zh'
    );
    expect(title).toBe('Produktionsmitarbeiter (m/w/d) 50-60% - Adecco, Schlieren');
    expect(title.length).toBeLessThanOrEqual(60);
  });

  it('shortens a title that used to overflow well past 60 chars', () => {
    // Real feed title behind the audit's #1 "title too long" sample (6740549): the old
    // formula produced a 78-char title (clamp(title,70) alone left no room for the
    // " - Adecco - JobCourier" suffix).
    const title = buildOffertaTitle(
      'Dipl. Pflegefachperson HF (m,w,d) 80-100%, Akutgeriatrie',
      'Adecco',
      'Svizzera, Bern, Be'
    );
    expect(title.length).toBeLessThanOrEqual(72);
  });

  it('disambiguates two ads that share a title and an employer by their town', () => {
    // The audit's #1 "duplicate title" pair (6740507 / 6740499): same generic Adecco
    // ad, posted for Ostermundigen and for Burgdorf.
    const a = buildOffertaTitle('Kurierfahrer 100% (a)', 'Adecco', 'Svizzera, Ostermundigen, Be');
    const b = buildOffertaTitle('Kurierfahrer 100% (a)', 'Adecco', 'Svizzera, Burgdorf, Be');
    expect(a).not.toBe(b);
    expect(a).toContain('Ostermundigen');
    expect(b).toContain('Burgdorf');
    expect(a.length).toBeLessThanOrEqual(72);
    expect(b.length).toBeLessThanOrEqual(72);
  });

  it('disambiguates the second duplicate pair even when the bare title alone is long', () => {
    // The audit's #2 "duplicate title" pair (6740366 / 6740336): same title, same
    // employer, and the job title alone is already 53 chars — the case that forces
    // dropping the employer name and the "JobCourier" suffix to make room for the town.
    const a = buildOffertaTitle(
      'Ingénieur en Génie Civil bâtiment 80-100% CDI (H/F/D)',
      'Adecco',
      'Svizzera, Monthey, Vs'
    );
    const b = buildOffertaTitle(
      'Ingénieur en Génie Civil bâtiment 80-100% CDI (H/F/D)',
      'Adecco',
      'Svizzera, Lausanne, Vd'
    );
    expect(a).not.toBe(b);
    expect(a).toContain('Monthey');
    expect(b).toContain('Lausanne');
    expect(a.length).toBeLessThanOrEqual(72);
    expect(b.length).toBeLessThanOrEqual(72);
  });

  it('clamps a pathologically long job title as a last resort, never past the fallback budget', () => {
    const longTitle =
      'Sanitärinstallateur EFZ (a) 80 - 100% für temporäre Einsätze oder Festanstellung möglich, super Team!';
    const title = buildOffertaTitle(longTitle, 'Adecco', 'Svizzera, Zurich, Zh');
    expect(title.length).toBeLessThanOrEqual(72);
    expect(title.endsWith('…')).toBe(true);
  });

  it('never mentions the JobCourier brand twice when the feed has no employer name', () => {
    const title = buildOffertaTitle('Aiuto Cuoco', 'JobCourier', 'Svizzera');
    expect(title).toBe('Aiuto Cuoco - JobCourier');
  });

  it('still includes a real employer and city when both are available', () => {
    const title = buildOffertaTitle('Aiuto Cuoco', 'Ristorante Da Mario', 'Svizzera, Lugano, Ti');
    expect(title).toBe('Aiuto Cuoco - Ristorante Da Mario, Lugano - JobCourier');
  });
});
