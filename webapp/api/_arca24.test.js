import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// The adapter imports fetch from node-fetch, so stubbing globalThis.fetch would leave
// the probe hitting the network for real.
vi.mock('node-fetch', () => ({ default: vi.fn() }));
import fetch from 'node-fetch';

import {
  parseCompanyRef, parseJobsFromHtml, parseJobDetailFromHtml,
  isArca24Enabled, resetSourceProbe,
} from './_arca24.js';

// Trimmed copies of the real markup, kept small on purpose: these guard the selectors
// that must survive the hostname swap at release.
const LIST_HTML = `
<div class="resultstring">
  <div class="md-caption title_heading">03/12/2025</div>
  <div class="titleContainer"><a href="/it/careers/jobad/6626905-manutentore-elettrico-bellinzona">Manutentore Elettrico</a></div>
  <table class="columns"><tbody><tr><td class="valueCell">
    Svizzera, Ticino, Bellinzona, Bellinzona - <a href="/it/careers/company/profile:id_3244729&company_name=randstad-svizzera-sa">Randstad Svizzera SA</a>
  </td></tr></tbody></table>
</div>`;

const DETAIL_HTML = `
<div class="mainContent">
  <span itemprop="title">Manutentore Elettrico</span>
  <div itemprop="hiringOrganization"><span itemprop="name">Randstad Svizzera SA</span></div>
  <span itemprop="addressCountry">Svizzera</span><span itemprop="addressRegion">Ticino</span>
  <span itemprop="addressLocality">Bellinzona</span>
  <span itemprop="industry">Altro</span><span itemprop="occupationalCategory">Tecnica</span>
  <meta itemprop="datePosted" content="2025-12-03"><meta itemprop="validThrough" content="2026-08-28">
  <div class="textBlock">Svizzera, Ticino, Bellinzona</div>
  <div class="textBlock"><p>Selezioniamo per conto di nostro cliente del settore industriale un manutentore elettrico con esperienza su PLC e schemi elettrici.</p></div>
  <div class="textBlock">Altri annunci di lavoro pubblicati da questa azienda: tanti altri testi molto lunghi che non devono finire nella descrizione dell annuncio corrente perche appartengono ad altri annunci.</div>
</div>`;

describe('rilevamento automatico della sorgente', () => {
  const realEnv = process.env.JOBS_SOURCE;

  beforeEach(() => { resetSourceProbe(); vi.mocked(fetch).mockReset(); delete process.env.JOBS_SOURCE; });
  afterEach(() => {
    if (realEnv === undefined) delete process.env.JOBS_SOURCE;
    else process.env.JOBS_SOURCE = realEnv;
  });

  const mockProbe = (impl) => vi.mocked(fetch).mockImplementation(impl);

  it('resta su jobroom finché i path nuovi rispondono 404 (situazione di oggi)', async () => {
    mockProbe(async () => ({ ok: false, status: 404 }));
    expect(await isArca24Enabled()).toBe(false);
  });

  it('passa ad Arca24 da solo quando i path nuovi rispondono 200', async () => {
    mockProbe(async () => ({ ok: true, status: 200 }));
    expect(await isArca24Enabled()).toBe(true);
  });

  it('ripiega su GET se il server non gestisce HEAD', async () => {
    const calls = [];
    mockProbe(async (_url, opts) => {
      calls.push(opts?.method ?? 'GET');
      return calls.length === 1 ? { ok: false, status: 405 } : { ok: true, status: 200 };
    });
    expect(await isArca24Enabled()).toBe(true);
    expect(calls).toEqual(['HEAD', 'GET']);
  });

  it('resta su jobroom se la sonda va in errore di rete', async () => {
    mockProbe(async () => { throw new Error('ECONNRESET'); });
    expect(await isArca24Enabled()).toBe(false);
  });

  it('non ripete la sonda entro il TTL', async () => {
    const fn = mockProbe(async () => ({ ok: true, status: 200 }));
    await isArca24Enabled();
    await isArca24Enabled();
    await isArca24Enabled();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('JOBS_SOURCE forza la sorgente senza sondare — è il rollback manuale', async () => {
    const fn = mockProbe(async () => ({ ok: true, status: 200 }));
    process.env.JOBS_SOURCE = 'jobroom';
    expect(await isArca24Enabled()).toBe(false);
    process.env.JOBS_SOURCE = 'arca24';
    expect(await isArca24Enabled()).toBe(true);
    expect(fn).not.toHaveBeenCalled();
  });
});

describe('parseCompanyRef', () => {
  it('legge il formato uiid della pagina aziende', () => {
    expect(parseCompanyRef('/it/careers/company/profile?uiid=3242903')).toEqual({ id: '3242903', slug: '' });
  });

  it('legge il formato profile:id_ della lista offerte', () => {
    expect(parseCompanyRef('/it/careers/company/profile:id_3244729&company_name=randstad-svizzera-sa'))
      .toEqual({ id: '3244729', slug: 'randstad-svizzera-sa' });
  });

  it('non esplode su href sconosciuti', () => {
    expect(parseCompanyRef('/it/careers/latest_jobs')).toEqual({ id: null, slug: '' });
  });
});

describe('parseJobsFromHtml', () => {
  const [job] = parseJobsFromHtml(LIST_HTML);

  it('estrae id numerico e link assoluto', () => {
    expect(job.jobroom_id).toBe('6626905');
    expect(job.apply_url).toMatch(/\/it\/careers\/jobad\/6626905-/);
  });

  it('separa la location dal nome azienda appeso dopo il trattino', () => {
    expect(job.company.name).toBe('Randstad Svizzera SA');
    expect(job.location).toBe('Svizzera, Ticino, Bellinzona, Bellinzona');
  });

  it('mantiene lo schema atteso dal front-end', () => {
    expect(job).toMatchObject({
      title: 'Manutentore Elettrico',
      published_at: '03/12/2025',
      redirect: false,
      external_url: null,
    });
  });
});

describe('parseJobDetailFromHtml', () => {
  const detail = parseJobDetailFromHtml(DETAIL_HTML, '6626905');

  it('legge i microdata JobPosting', () => {
    expect(detail.sector).toBe('Altro');
    expect(detail.role).toBe('Tecnica');
    expect(detail.location).toBe('Svizzera, Ticino, Bellinzona');
    expect(detail.details.validThrough).toBe('2026-08-28');
  });

  it('prende il corpo annuncio e non i blocchi rumore', () => {
    expect(detail.description).toContain('manutentore elettrico');
    expect(detail.description).not.toContain('Altri annunci');
  });
});
