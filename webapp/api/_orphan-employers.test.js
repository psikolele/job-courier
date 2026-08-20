import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./_arca24.js', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, fetchHtml: vi.fn(), fetchJobDetail: vi.fn() };
});

import { fetchHtml, fetchJobDetail } from './_arca24.js';
import { collectOrphanEmployerNames } from './_orphan-employers.js';

/**
 * Una riga di listing come la rende il portale: con o senza link azienda.
 * Anche la riga anonima porta altri anchor (qui il link "annuncio simile"), perché la
 * riga vera non è priva di link: è priva del link al profilo azienda.
 */
const row = (id, title, companyHref) => `
  <div class="resultstring">
    <a href="/it/careers/jobad/${id}-${title}">${title}</a>
    <a href="/it/careers/jobad/123-decoy">Annuncio simile</a>
    ${companyHref ? `<a href="${companyHref}">Adecco</a>` : ''}
    <div class="valueCell">Svizzera, Ticino, Bellinzona</div>
  </div>`;

const pagesFetched = () => vi.mocked(fetchHtml).mock.calls.map(([path]) => path);

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

    const res = await collectOrphanEmployerNames({ pages: 1, concurrency: 1 });

    expect(res.names).toEqual(['dinamic hub']);
    expect(vi.mocked(fetchJobDetail)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(fetchJobDetail)).toHaveBeenCalledWith('6740371');
    expect(res).toMatchObject({
      pagesRequested: 1, pagesFailed: 0, detailsRequested: 1, detailsFailed: 0, truncated: false,
    });
  });

  it('scarta i dettagli che restano anonimi', async () => {
    vi.mocked(fetchHtml).mockResolvedValue(row('6740371', 'pulizie', null));
    vi.mocked(fetchJobDetail).mockResolvedValue({ company: { name: 'Azienda Riservata' } });

    const res = await collectOrphanEmployerNames({ pages: 1, concurrency: 1 });

    expect(res.names).toEqual([]);
    expect(res.detailsRequested).toBe(1);
    expect(res.detailsFailed).toBe(0);
  });

  it('non duplica lo stesso datore trovato su più annunci', async () => {
    vi.mocked(fetchHtml).mockResolvedValue(row('1', 'a', null) + row('2', 'b', null));
    vi.mocked(fetchJobDetail).mockResolvedValue({ company: { name: 'Dinamic Hub' } });

    expect((await collectOrphanEmployerNames({ pages: 1, concurrency: 1 })).names).toEqual(['dinamic hub']);
  });

  it('non duplica lo stesso datore trovato su pagine diverse', async () => {
    vi.mocked(fetchHtml)
      .mockResolvedValueOnce(row('1', 'a', null))
      .mockResolvedValueOnce(row('2', 'b', null));
    vi.mocked(fetchJobDetail).mockResolvedValue({ company: { name: 'Dinamic Hub' } });

    const res = await collectOrphanEmployerNames({ pages: 2, concurrency: 1 });

    expect(res.names).toEqual(['dinamic hub']);
    expect(res.detailsRequested).toBe(2);
  });

  it('una pagina che fallisce non ferma la scansione ma viene contata', async () => {
    vi.mocked(fetchHtml)
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValueOnce(row('6740371', 'pulizie', null));
    vi.mocked(fetchJobDetail).mockResolvedValue({ company: { name: 'Dinamic Hub' } });

    const res = await collectOrphanEmployerNames({ pages: 2, concurrency: 1 });

    expect(res.names).toEqual(['dinamic hub']);
    expect(res.pagesRequested).toBe(2);
    expect(res.pagesFailed).toBe(1);
  });

  it('un dettaglio che fallisce perde quel datore ma viene contato', async () => {
    vi.mocked(fetchHtml).mockResolvedValue(row('1', 'a', null) + row('2', 'b', null));
    vi.mocked(fetchJobDetail)
      .mockRejectedValueOnce(new Error('500'))
      .mockResolvedValueOnce({ company: { name: 'Dinamic Hub' } });

    const res = await collectOrphanEmployerNames({ pages: 1, concurrency: 1 });

    expect(res.names).toEqual(['dinamic hub']);
    expect(res.detailsRequested).toBe(2);
    expect(res.detailsFailed).toBe(1);
  });

  it('rispetta il tetto di dettagli aperti e lo segnala', async () => {
    vi.mocked(fetchHtml).mockResolvedValue(
      row('1', 'a', null) + row('2', 'b', null) + row('3', 'c', null)
    );
    vi.mocked(fetchJobDetail).mockImplementation(async (id) => ({ company: { name: `Azienda ${id}` } }));

    const res = await collectOrphanEmployerNames({ pages: 1, concurrency: 1, maxDetails: 2 });

    expect(res.names).toHaveLength(2);
    expect(vi.mocked(fetchJobDetail)).toHaveBeenCalledTimes(2);
    expect(res).toMatchObject({ detailsRequested: 2, truncated: true });
  });

  it('scandisce a batch senza sforare il numero di pagine chiesto', async () => {
    vi.mocked(fetchHtml).mockResolvedValue(row('1', 'a', '/it/careers/3244683-adecco/profile'));

    const res = await collectOrphanEmployerNames({ pages: 5, concurrency: 2 });

    expect(pagesFetched()).toEqual([
      '/it/careers/latest_jobs?page=1',
      '/it/careers/latest_jobs?page=2',
      '/it/careers/latest_jobs?page=3',
      '/it/careers/latest_jobs?page=4',
      '/it/careers/latest_jobs?page=5',
    ]);
    expect(res.pagesRequested).toBe(5);
    expect(vi.mocked(fetchHtml)).toHaveBeenCalledWith('/it/careers/latest_jobs?page=1', { attempts: 2 });
  });

  it('si ferma quando il listing è finito, senza consumare il budget di pagine', async () => {
    vi.mocked(fetchHtml)
      .mockResolvedValueOnce(row('1', 'a', null))
      .mockResolvedValue('<div></div>');
    vi.mocked(fetchJobDetail).mockResolvedValue({ company: { name: 'Dinamic Hub' } });

    const res = await collectOrphanEmployerNames({ pages: 50, concurrency: 1 });

    expect(res.pagesRequested).toBe(2);
    expect(vi.mocked(fetchHtml)).toHaveBeenCalledTimes(2);
    expect(res.names).toEqual(['dinamic hub']);
  });

  it('una concorrenza non valida non blocca la scansione', async () => {
    vi.mocked(fetchHtml).mockResolvedValue(row('6740371', 'pulizie', null));
    vi.mocked(fetchJobDetail).mockResolvedValue({ company: { name: 'Dinamic Hub' } });

    const res = await collectOrphanEmployerNames({ pages: 1, concurrency: 0 });

    expect(res.names).toEqual(['dinamic hub']);
    expect(res.pagesRequested).toBe(1);
  });

  it('un tetto negativo non tronca al contrario', async () => {
    vi.mocked(fetchHtml).mockResolvedValue(row('1', 'a', null) + row('2', 'b', null));

    const res = await collectOrphanEmployerNames({ pages: 1, concurrency: 1, maxDetails: -5 });

    expect(res.names).toEqual([]);
    expect(vi.mocked(fetchJobDetail)).not.toHaveBeenCalled();
    expect(res).toMatchObject({ detailsRequested: 0, truncated: true });
  });
});
