import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// The adapter imports fetch from node-fetch, so stubbing globalThis.fetch would leave
// the probe hitting the network for real.
vi.mock('node-fetch', () => ({ default: vi.fn() }));
import fetch from 'node-fetch';

import {
  parseCompanyRef, parseJobsFromHtml, parseJobDetailFromHtml,
  parseCompaniesFromHtml, parseCompanyDetailFromHtml, companyLogo,
  isArca24Enabled, resetSourceProbe,
  fetchCompanies, resetHasJobsCache, resetFeedRosterCache,
  withKnownEmployer, RESERVED_COMPANY, normalizeCompanyName,
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

  beforeEach(() => { resetSourceProbe(); resetFeedRosterCache(); vi.mocked(fetch).mockReset(); delete process.env.JOBS_SOURCE; });
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

  it('legge il formato a path dell indice aziende (dal 08.2026)', () => {
    expect(parseCompanyRef('/it/careers/3243375-tior-sa/profile'))
      .toEqual({ id: '3243375', slug: 'tior-sa' });
  });

  it('non esplode su href sconosciuti', () => {
    expect(parseCompanyRef('/it/careers/latest_jobs')).toEqual({ id: null, slug: '' });
  });
});

// L'indice aziende ha smesso di linkare `profile?uiid=` e nessun test lo copriva: il
// parser tornava zero aziende e la vetrina della home cadeva a un solo logo.
describe('parseCompaniesFromHtml — formato a path', () => {
  const HTML = `
<div class="resultstring">
  <div class="titleContainerInner"><a href="/it/careers/3243375-tior-sa/profile">TIOR SA</a></div>
  <div class="valueCellInner"><a href="/it/careers/3243375-tior-sa/profile">Cadenazzo</a></div>
</div>
<div class="resultstring">
  <div class="titleContainerInner"><a href="/it/careers/3244630-gi-group-sa/profile">Gi Group SA</a></div>
</div>`;

  it('legge id, nome e slug dai link a path', () => {
    const companies = parseCompaniesFromHtml(HTML);
    expect(companies.map((c) => [c.id, c.name, c.slug])).toEqual([
      ['3243375', 'TIOR SA', 'tior-sa'],
      ['3244630', 'Gi Group SA', 'gi-group-sa'],
    ]);
  });

  // La paginazione dell'indice e' lato browser: i controlli "2" e "3" sono bottoni senza
  // href che spostano solo un hash e ri-affettano dati gia' arrivati. Le aziende oltre le
  // prime quindici stanno nel payload della pagina, non dietro a `?page=2` (che upstream
  // rifiuta con 410, non essendo una richiesta che un click produce mai).
  it('recupera dal payload le aziende non renderizzate nel markup', () => {
    const withPayload = HTML + `
<script>window.__DATA__ = {"3244801":{"subject_id":3244801,"subject_type":"company","resultstring_config":{"title":"Lares Sagl","title_action":{"router_link":{"path":"/it/careers/3244801-lares-sagl/profile"}}}},
"3243652":{"subject_id":3243652,"subject_type":"company","resultstring_config":{"title":"S &amp; M beauty SA","title_action":{"router_link":{"path":"/it/careers/3243652-s-m-beauty-sa/profile"}}}}}</script>`;
    const companies = parseCompaniesFromHtml(withPayload);
    expect(companies.map((c) => c.name)).toEqual([
      'TIOR SA', 'Gi Group SA', 'Lares Sagl', 'S & M beauty SA',
    ]);
    expect(companies.find((c) => c.id === '3244801').slug).toBe('lares-sagl');
  });

  it('costruisce jobroom_url assoluto', () => {
    expect(parseCompaniesFromHtml(HTML)[0].jobroom_url)
      .toBe('https://jobroom.jobcourier.ch/it/careers/3243375-tior-sa/profile');
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

describe('logo nel dettaglio annuncio', () => {
  it('usa itemprop=image quando la pagina porta un link azienda', () => {
    const html = `
      <div class="mainContent">
        <span itemprop="title">Contabile</span>
        <div itemprop="hiringOrganization"><span itemprop="name">Randstad Svizzera SA</span></div>
        <meta itemprop="image" content="https://jobroom.jobcourier.ch/custom_visojobcourier/media/logo/logo_company_3244729.jpg">
        <a href="/it/careers/company/profile?uiid=3244729">Randstad Svizzera SA</a>
        <div class="textBlock">Un annuncio qualsiasi con testo a sufficienza per essere scelto come corpo.</div>
      </div>`;
    expect(parseJobDetailFromHtml(html, '1').company.logo).toBe(
      'https://jobroom.jobcourier.ch/custom_visojobcourier/media/logo/logo_company_3244729.jpg');
  });

  it('ignora itemprop=image quando non c e alcun link azienda — e la cover social del sito, non un logo', () => {
    // An ad the portal renders with no company link at all: itemprop=image still
    // resolves, but to the site's own social-share cover — the JobCourier mark —
    // not to any employer. Showing that as the logo put our own mark on someone
    // else's ad.
    const html = `
      <div class="mainContent">
        <span itemprop="title">Operatore Carroponte / Gru</span>
        <div itemprop="hiringOrganization"><span itemprop="name">Team Personnel Solutions SA</span></div>
        <meta itemprop="image" content="https://jobroom.jobcourier.ch/custom_visojobcourier/assets/img/socialCover.jpg">
        <div class="textBlock">Un annuncio qualsiasi con testo a sufficienza per essere scelto come corpo.</div>
      </div>`;
    const logo = parseJobDetailFromHtml(html, '1').company.logo;
    expect(logo || '').not.toContain('socialCover');
  });
});

// The company index the new portal serves: employer links carry a uiid and no slug,
// and the logo is lazy-loaded so its `<img>` holds only a base64 placeholder.
const COMPANIES_HTML = `
<div class="resultstring">
  <a href="/it/careers/company/profile?uiid=3244630">Gi Group SA</a>
  <div class="imgContainer"><img src="data:image/jpeg;base64,/9j/4AAQ"></div>
</div>
<div class="resultstring">
  <a href="/it/careers/company/profile?uiid=3243389">4 U Consulting</a>
</div>`;

describe('logo azienda', () => {
  it('lo costruisce dall id azienda invece di ripiegare sulla favicon JobCourier', () => {
    expect(companyLogo('3243389', '4 U Consulting'))
      .toBe('https://jobroom.jobcourier.ch/custom_visojobcourier/media/logo/logo_company_3243389.jpg');
  });

  it('senza id resta il ripiego per nome — mai un logo di un altra azienda', () => {
    expect(companyLogo(null, 'Randstad Svizzera SA')).toContain('domain=randstad.ch');
  });

  it('azienda sconosciuta: nessun logo, non la favicon di JobCourier', () => {
    expect(companyLogo(null, 'Azienda Riservata')).toBe('');
  });

  it('le offerte portano il logo dell azienda che assume, non quello di JobCourier', () => {
    const [job] = parseJobsFromHtml(LIST_HTML);
    expect(job.company.logo).toContain('logo_company_3244729');
    expect(job.company.logo).not.toContain('jobcourier.ch&sz=');
  });
});

describe('parseCompanyDetailFromHtml', () => {
  it('stacca il conteggio annunci dal nome anche quando manca il numero', () => {
    // An employer with no open position gets the bare label, and the page answers 404
    // while still carrying its profile — that is "no ads today", not a dead company.
    const html = '<h1>FISIOTERAPIA IGEA SAGL Annunci totali:</h1>';
    expect(parseCompanyDetailFromHtml(html, '3244807', '').name).toBe('FISIOTERAPIA IGEA SAGL');
  });
});

describe('parseCompaniesFromHtml', () => {
  const companies = parseCompaniesFromHtml(COMPANIES_HTML);

  it('deriva lo slug dal nome quando il portale non lo espone più', () => {
    // An empty slug made every card link to `/azienda/`, which matches no route
    // and rendered the 404 page for all 35 employers.
    expect(companies.map((c) => c.slug)).toEqual(['gi-group-sa', '4-u-consulting']);
    expect(companies.every((c) => c.slug.length > 0)).toBe(true);
  });

  it('non prende il placeholder base64 come logo', () => {
    expect(companies[0].logo).toBe(
      'https://jobroom.jobcourier.ch/custom_visojobcourier/media/logo/logo_company_3244630.jpg');
  });
});

// One ad from Manpower — an employer the RSS feed import publishes for, so it has a live
// profile with open positions but no entry in `jobs_by_company`.
const FEED_HTML = `
<div class="resultstring">
  <div class="md-caption title_heading">05/08/2026</div>
  <div class="titleContainer"><a href="/it/careers/jobad/7000001-magazziniere-lugano">Magazziniere</a></div>
  <table class="columns"><tbody><tr><td class="valueCell">
    Svizzera, Ticino, Lugano - <a href="/it/careers/company/profile?uiid=3244661">Manpower</a>
  </td></tr></tbody></table>
</div>`;

/**
 * Serves the portal's three families of page off one fetch mock: the company index, the
 * job feed, and the per-employer profile. `profiles` maps uiid -> body, or to the string
 * 'boom' to make that one request fail outright.
 */
function mockPortal({ index = COMPANIES_HTML, feed = FEED_HTML, profiles = {} } = {}) {
  vi.mocked(fetch).mockImplementation(async (url) => {
    const ok = (html) => ({ ok: true, status: 200, text: async () => html });

    if (url.includes('jobs_by_company')) return ok(url.includes('page=1') ? index : '');
    if (url.includes('latest_jobs')) return ok(url.includes('page=1') ? feed : '');

    const uiid = (url.match(/uiid=(\d+)/) || [])[1];
    const body = profiles[uiid];
    if (body === 'boom') throw new Error('ECONNRESET');
    // 404 with a body is a real portal answer, not an error — see probeHasJobs.
    return { ok: body !== undefined, status: body === undefined ? 404 : 200, text: async () => body ?? '' };
  });
}

const PROFILE_WITH_ADS = `
<h1>PKB Private Bank Annunci totali: 2</h1>
<div class="resultstring"><a href="/it/careers/jobad/7100001-analista">Analista</a></div>
<div class="resultstring"><a href="/it/careers/jobad/7100002-contabile">Contabile</a></div>`;

const PROFILE_WITHOUT_ADS = '<h1>Betacom Annunci totali:</h1><p>Nessun annuncio attivo.</p>';

describe('roster aziende: indice + feed offerte', () => {
  beforeEach(() => { vi.mocked(fetch).mockReset(); resetHasJobsCache(); resetFeedRosterCache(); });

  it('unisce al roster le aziende che compaiono solo nel feed offerte', async () => {
    // Manpower, Work Selection AG e Work & Work SA hanno profilo attivo con annunci ma
    // non sono nell indice `jobs_by_company`: senza il feed la vetrina le perdeva.
    mockPortal();
    const names = (await fetchCompanies()).map((c) => c.name);
    expect(names).toContain('Manpower');
    expect(names).toContain('Gi Group SA');
    expect(names).toContain('4 U Consulting');
  });

  it('l azienda derivata dal feed ha la stessa forma di quelle dell indice', async () => {
    mockPortal();
    const manpower = (await fetchCompanies()).find((c) => c.name === 'Manpower');
    expect(manpower).toMatchObject({
      id: '3244661',
      slug: 'manpower',
      logo: 'https://jobroom.jobcourier.ch/custom_visojobcourier/media/logo/logo_company_3244661.jpg',
      jobs_count: 0,
      jobroom_url: 'https://jobroom.jobcourier.ch/it/careers/company/profile?uiid=3244661',
    });
  });

  it('trova anche un azienda che compare solo in fondo al feed', async () => {
    // Il feed è ordinato per data: Work & Work SA non compariva prima di pagina 26 e una
    // lettura corta la perdeva in silenzio. Qui sta a pagina 20, oltre il primo batch.
    const deep = FEED_HTML.replace(/uiid=3244661/, 'uiid=3174540').replace(/>Manpower</, '>Work &amp; Work SA<');
    vi.mocked(fetch).mockImplementation(async (url) => {
      const ok = (html) => ({ ok: true, status: 200, text: async () => html });
      if (url.includes('jobs_by_company')) return ok(url.includes('page=1') ? COMPANIES_HTML : '');
      if (url.includes('latest_jobs')) {
        if (url.includes('page=1&') || url.endsWith('page=1')) return ok(FEED_HTML);
        return ok(url.includes('page=20') ? deep : '');
      }
      return { ok: false, status: 404, text: async () => '' };
    });
    const names = (await fetchCompanies()).map((c) => c.name);
    expect(names).toContain('Work & Work SA');
    expect(names).toContain('Manpower');
  });

  it('non duplica un azienda presente in entrambe le fonti e tiene il conteggio dell indice', async () => {
    mockPortal({ feed: FEED_HTML.replace(/uiid=3244661/, 'uiid=3244630').replace(/>Manpower</, '>Gi Group SA<') });
    const giGroup = (await fetchCompanies()).filter((c) => c.id === '3244630');
    expect(giGroup).toHaveLength(1);
  });
});

describe('has_jobs: si legge il corpo della pagina, non lo status', () => {
  beforeEach(() => { vi.mocked(fetch).mockReset(); resetHasJobsCache(); resetFeedRosterCache(); });

  const flagFor = async (id, profiles) => {
    mockPortal({ profiles });
    return (await fetchCompanies({ withJobStatus: true })).find((c) => c.id === id)?.has_jobs;
  };

  it('404 con annunci nel corpo conta come "sta assumendo"', async () => {
    // PKB Private Bank risponde 404 su una pagina che elenca due annunci reali: lo status
    // parla del record profilo, non del suo contenuto. Con la vecchia HEAD spariva.
    vi.mocked(fetch).mockImplementation(async (url) => {
      if (url.includes('jobs_by_company')) return { ok: true, status: 200, text: async () => (url.includes('page=1') ? COMPANIES_HTML : '') };
      if (url.includes('latest_jobs')) return { ok: true, status: 200, text: async () => (url.includes('page=1') ? FEED_HTML : '') };
      return { ok: false, status: 404, text: async () => PROFILE_WITH_ADS };
    });
    const list = await fetchCompanies({ withJobStatus: true });
    expect(list.find((c) => c.id === '3244630').has_jobs).toBe(true);
  });

  it('200 senza .resultstring conta come "nessuna offerta"', async () => {
    expect(await flagFor('3244630', { 3244630: PROFILE_WITHOUT_ADS })).toBe(false);
  });

  it('errore di rete resta null — sconosciuto, non "nessuna offerta"', async () => {
    expect(await flagFor('3244630', { 3244630: 'boom' })).toBe(null);
  });

  it('non risonda lo stesso profilo entro il TTL', async () => {
    mockPortal({ profiles: { 3244630: PROFILE_WITH_ADS, 3243389: PROFILE_WITHOUT_ADS, 3244661: PROFILE_WITHOUT_ADS } });
    await fetchCompanies({ withJobStatus: true });
    const before = vi.mocked(fetch).mock.calls.filter((c) => String(c[0]).includes('uiid=')).length;
    await fetchCompanies({ withJobStatus: true });
    const after = vi.mocked(fetch).mock.calls.filter((c) => String(c[0]).includes('uiid=')).length;
    expect(after).toBe(before);
  });
});

describe('withKnownEmployer', () => {
  const detail = { name: 'Randstad Svizzera SA', logo: 'https://x/randstad.jpg', slug: 'randstad' };
  const anonymous = { id: '6725948', title: 'Meccanico DISPONIBILE DA SUBITO', company: { name: RESERVED_COMPANY, logo: '' } };

  // The rows on a company page carry no company at all, so the row parser falls back to
  // "Azienda Riservata" for every one of them — while we are reading that very company's
  // page and know the answer.
  it('names the employer on ads that came back anonymous', () => {
    const [job] = withKnownEmployer([anonymous], detail, '3244729');
    expect(job.company.name).toBe('Randstad Svizzera SA');
    expect(job.company.logo).toBe('https://x/randstad.jpg');
    expect(job.company.arca24_id).toBe('3244729');
  });

  it('never overwrites a name the row did supply', () => {
    const named = { id: '1', company: { name: 'Adecco', logo: 'a.jpg' } };
    expect(withKnownEmployer([named], detail, '3244729')[0].company.name).toBe('Adecco');
  });

  it('leaves the ads alone when the company page had no name either', () => {
    const jobs = [anonymous];
    expect(withKnownEmployer(jobs, { name: RESERVED_COMPANY }, '1')).toBe(jobs);
    expect(withKnownEmployer(jobs, {}, '1')).toBe(jobs);
  });
});

describe('normalizeCompanyName', () => {
  it('ignora maiuscole, spazi e punteggiatura', () => {
    expect(normalizeCompanyName('Dinamic Hub')).toBe('dinamic hub');
    expect(normalizeCompanyName('  DINAMIC   HUB  ')).toBe('dinamic hub');
  });

  it('decodifica le entità, anche doppie', () => {
    expect(normalizeCompanyName('S &amp;amp; M beauty SA')).toBe('s & m beauty');
  });

  it('toglie la forma societaria in coda', () => {
    expect(normalizeCompanyName('Work & Work SA')).toBe('work & work');
    expect(normalizeCompanyName('Work & Work S.A.')).toBe('work & work');
    expect(normalizeCompanyName('Nene e Associati Sagl')).toBe('nene e associati');
  });

  it('restituisce stringa vuota per input non utile', () => {
    expect(normalizeCompanyName('')).toBe('');
    expect(normalizeCompanyName(undefined)).toBe('');
    expect(normalizeCompanyName('Azienda Riservata')).toBe('');
  });
});
