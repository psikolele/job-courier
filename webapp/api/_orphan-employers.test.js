import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./_arca24.js', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, fetchHtml: vi.fn(), fetchJobDetail: vi.fn() };
});

import { fetchHtml, fetchJobDetail } from './_arca24.js';
import { collectOrphanEmployerNames } from './_orphan-employers.js';

/** Una riga di listing come la rende il portale: con o senza link azienda. */
const row = (id, title, companyHref) => `
  <div class="resultstring">
    <a href="/it/careers/jobad/${id}-${title}">${title}</a>
    ${companyHref ? `<a href="${companyHref}">Adecco</a>` : ''}
    <div class="valueCell">Svizzera, Ticino, Bellinzona</div>
  </div>`;

beforeEach(() => {
  vi.mocked(fetchHtml).mockReset();
  vi.mocked(fetchJobDetail).mockReset();
});

describe('collectOrphanEmployerNames', () => {
  it('apre solo gli annunci senza azienda nel listing e ne legge il nome', async () => {
    vi.mocked(fetchHtml).mockResolvedValue(
      row('6740371', 'pulizie', null) + row('6742220', 'ebeniste', '/it/careers/3244683-adecco/profile')
    );
    vi.mocked(fetchJobDetail).mockResolvedValue({ company: { name: 'Dinamic Hub' } });

    const names = await collectOrphanEmployerNames({ pages: 1, concurrency: 1 });

    expect(names).toEqual(['dinamic hub']);
    expect(vi.mocked(fetchJobDetail)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(fetchJobDetail)).toHaveBeenCalledWith('6740371');
  });

  it('scarta i dettagli che restano anonimi', async () => {
    vi.mocked(fetchHtml).mockResolvedValue(row('6740371', 'pulizie', null));
    vi.mocked(fetchJobDetail).mockResolvedValue({ company: { name: 'Azienda Riservata' } });

    expect(await collectOrphanEmployerNames({ pages: 1, concurrency: 1 })).toEqual([]);
  });

  it('non duplica lo stesso datore trovato su più annunci', async () => {
    vi.mocked(fetchHtml).mockResolvedValue(row('1', 'a', null) + row('2', 'b', null));
    vi.mocked(fetchJobDetail).mockResolvedValue({ company: { name: 'Dinamic Hub' } });

    expect(await collectOrphanEmployerNames({ pages: 1, concurrency: 1 })).toEqual(['dinamic hub']);
  });

  it('una pagina che fallisce non ferma la scansione', async () => {
    vi.mocked(fetchHtml)
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValueOnce(row('6740371', 'pulizie', null));
    vi.mocked(fetchJobDetail).mockResolvedValue({ company: { name: 'Dinamic Hub' } });

    expect(await collectOrphanEmployerNames({ pages: 2, concurrency: 1 })).toEqual(['dinamic hub']);
  });

  it('rispetta il tetto di dettagli aperti', async () => {
    vi.mocked(fetchHtml).mockResolvedValue(
      row('1', 'a', null) + row('2', 'b', null) + row('3', 'c', null)
    );
    vi.mocked(fetchJobDetail).mockImplementation(async (id) => ({ company: { name: `Azienda ${id}` } }));

    const names = await collectOrphanEmployerNames({ pages: 1, concurrency: 1, maxDetails: 2 });

    expect(names).toHaveLength(2);
    expect(vi.mocked(fetchJobDetail)).toHaveBeenCalledTimes(2);
  });
});
