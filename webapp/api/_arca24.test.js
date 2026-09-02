import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// The adapter imports fetch from node-fetch, so stubbing globalThis.fetch would leave
// the probe hitting the network for real.
vi.mock('node-fetch', () => ({ default: vi.fn() }));
import fetch from 'node-fetch';

import {
  parseCompanyRef, parseJobsFromHtml, parseJobDetailFromHtml,
  parseCompaniesFromHtml, parseCompanyDetailFromHtml, companyLogo, servedCompanyId,
  isArca24Enabled, resetSourceProbe,
  fetchCompanies, resetHasJobsCache, resetFeedRosterCache,
  withKnownEmployer, RESERVED_COMPANY, normalizeCompanyName, normalizeCompanyNameRaw, withHasJobs,
} from './_arca24.js';
import { generatedAt as orphanGeneratedAt } from './_orphan-employers-snapshot.js';

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

  // Measured 29.08.2026: the payload stopped carrying the `router_link` paths, so this
  // branch now fires for the whole roster — and `company/profile?uiid=` lands the visitor
  // on one arbitrary employer (Adecco's id and Arca24's both answered as 4 U Consulting).
  // The slug is still known, it is just derived from the name instead of read.
  it('usa la forma a path anche quando il payload non porta il link', () => {
    const noPath = `
<script>window.__DATA__ = {"3244801":{"subject_id":3244801,"subject_type":"company","resultstring_config":{"title":"Lares Sagl"}}}</script>`;
    const lares = parseCompaniesFromHtml(noPath).find((c) => c.id === '3244801');
    expect(lares.slug).toBe('lares-sagl');
    expect(lares.jobroom_url).toBe('https://jobroom.jobcourier.ch/it/careers/3244801-lares-sagl/profile');
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

  it('costruisce il link al profilo con id e slug nel path, non con ?uiid=', () => {
    // `company/profile?uiid=` lands on an arbitrary employer upstream, so this link would
    // send every visitor to the same wrong company page.
    const detail = parseCompanyDetailFromHtml('<h1>Adecco</h1>', '3244683', 'adecco');
    expect(detail.jobroom_url).toContain('/careers/3244683-adecco/profile');
    expect(detail.jobroom_url).not.toContain('uiid=');
  });
});

describe('servedCompanyId — la pagina dichiara chi ha servito davvero', () => {
  const canonical = (href) => `<link href="${href}" rel="canonical">`;

  it('legge l id dal canonical', () => {
    const html = canonical('https://jobroom.jobcourier.ch/it/careers/3244683-adecco/profile');
    expect(servedCompanyId(html)).toBe('3244683');
  });

  it('regge anche rel prima di href', () => {
    const html = '<link rel="canonical" href="https://x/it/careers/3243415-wwf-svizzera/profile">';
    expect(servedCompanyId(html)).toBe('3243415');
  });

  it('smaschera la risposta di un altro datore', () => {
    // Exactly the 28.08.2026 outage: /profile?uiid=3244683 answered with Rapelli (3244679).
    // A wrong company renders as a perfectly working page, so the id is the only tell.
    const html = canonical('https://jobroom.jobcourier.ch/it/careers/3244679-rapelli-orior-food-ag/profile');
    expect(servedCompanyId(html)).not.toBe('3244683');
  });

  it('resta null senza canonical, cosi un id ignoto non viene scambiato per un errore', () => {
    expect(servedCompanyId('<h1>Adecco</h1>')).toBeNull();
    expect(servedCompanyId('')).toBeNull();
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

    // The probe asks for `/careers/<id>-<slug>/jobs`; the slugless fallback and the
    // roster's own links still carry `?uiid=`. Either shape names the same employer.
    const id = (url.match(/uiid=(\d+)/) || url.match(/\/careers\/(\d+)-/) || [])[1];
    const body = profiles[id];
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
      // "Same shape as the index" is what this test is named for, and until 29.08.2026 it
      // asserted the opposite: the feed branch built `company/profile?uiid=`, the one URL
      // shape upstream answers with somebody else's page.
      jobroom_url: 'https://jobroom.jobcourier.ch/it/careers/3244661-manpower/profile',
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

  // 4 U Consulting e non Gi Group: quest ultima è nello snapshot dei datori orfani, viene
  // marcata per nome e non passa più dalla sonda — che è proprio ciò che qui si vuole
  // esercitare.
  it('404 con annunci nel corpo conta come "sta assumendo"', async () => {
    // PKB Private Bank risponde 404 su una pagina che elenca due annunci reali: lo status
    // parla del record profilo, non del suo contenuto. Con la vecchia HEAD spariva.
    vi.mocked(fetch).mockImplementation(async (url) => {
      if (url.includes('jobs_by_company')) return { ok: true, status: 200, text: async () => (url.includes('page=1') ? COMPANIES_HTML : '') };
      if (url.includes('latest_jobs')) return { ok: true, status: 200, text: async () => (url.includes('page=1') ? FEED_HTML : '') };
      return { ok: false, status: 404, text: async () => PROFILE_WITH_ADS };
    });
    const list = await fetchCompanies({ withJobStatus: true });
    expect(list.find((c) => c.id === '3243389').has_jobs).toBe(true);
  });

  it('200 senza .resultstring conta come "nessuna offerta"', async () => {
    expect(await flagFor('3243389', { 3243389: PROFILE_WITHOUT_ADS })).toBe(false);
  });

  it('errore di rete resta null — sconosciuto, non "nessuna offerta"', async () => {
    expect(await flagFor('3243389', { 3243389: 'boom' })).toBe(null);
  });

  it('non risonda lo stesso profilo entro il TTL', async () => {
    mockPortal({ profiles: { 3244630: PROFILE_WITH_ADS, 3243389: PROFILE_WITHOUT_ADS, 3244661: PROFILE_WITHOUT_ADS } });
    await fetchCompanies({ withJobStatus: true });
    // Counted on the probe's own URL: it stopped carrying `uiid=` on 29.08.2026, and
    // filtering on that here would have counted zero calls both times and passed whatever
    // the cache did.
    const probes = () => vi.mocked(fetch).mock.calls
      .map((c) => String(c[0]))
      .filter((u) => /\/careers\/\d+-[^/]+\/jobs/.test(u)).length;
    const before = probes();
    expect(before).toBeGreaterThan(0);
    await fetchCompanies({ withJobStatus: true });
    expect(probes()).toBe(before);
  });
});

// 28.08.2026 fixed the company DETAIL page, which had the same cause; the probe kept the
// broken URL shape and so kept answering "hiring" for the whole roster. Measured live on
// 29.08.2026: `company/jobs?uiid=` returned the same employer's 15 ads for every id asked,
// a made-up id included, while the path form returned each employer's own count.
describe('sonda has_jobs: l id viaggia nel path, non in ?uiid=', () => {
  beforeEach(() => { vi.mocked(fetch).mockReset(); resetHasJobsCache(); resetFeedRosterCache(); });

  const probeCalls = () => vi.mocked(fetch).mock.calls
    .map((c) => String(c[0]))
    .filter((u) => u.includes('/jobs') && !u.includes('jobs_by_company') && !u.includes('latest_jobs'));

  it('chiede la pagina annunci con l id nel segmento di path', async () => {
    mockPortal({ profiles: { 3243389: PROFILE_WITH_ADS } });
    await fetchCompanies({ withJobStatus: true });
    expect(probeCalls().some((u) => u.includes('/careers/3243389-4-u-consulting/jobs'))).toBe(true);
    expect(probeCalls().some((u) => u.includes('company/jobs?uiid='))).toBe(false);
  });

  it('scarta la risposta quando la pagina dichiara un altro datore', async () => {
    // The failure that made the outage invisible: a page full of somebody else's ads is
    // indistinguishable from a working answer, so only the canonical id can tell.
    expect(await flagWhenServed('3243389', PROFILE_OF_ANOTHER_COMPANY)).toBe(null);
  });

  it('accetta la risposta quando il canonical è quello richiesto', async () => {
    expect(await flagWhenServed('3243389', PROFILE_WITH_ADS_CANONICAL)).toBe(true);
  });

  it('si fida della pagina che non dichiara alcun canonical', async () => {
    // Same rule as the company detail guard: reject only on positive disagreement.
    expect(await flagWhenServed('3243389', PROFILE_WITH_ADS)).toBe(true);
  });
});

async function flagWhenServed(id, body) {
  mockPortal({ profiles: { [id]: body } });
  return (await fetchCompanies({ withJobStatus: true })).find((c) => c.id === id)?.has_jobs;
}

const canonical = (id, slug) =>
  `<link rel="canonical" href="https://jobroom.jobcourier.ch/it/careers/${id}-${slug}/jobs">`;

const PROFILE_OF_ANOTHER_COMPANY = `${canonical('3244630', 'gi-group-sa')}
<div class="resultstring"><a href="/it/careers/jobad/7100003-magazziniere">Magazziniere</a></div>`;

const PROFILE_WITH_ADS_CANONICAL = `${canonical('3243389', '4-u-consulting')}${PROFILE_WITH_ADS}`;

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
  it('ignora maiuscole e spazi', () => {
    expect(normalizeCompanyName('Dinamic Hub')).toBe('dinamic hub');
    expect(normalizeCompanyName('  DINAMIC   HUB  ')).toBe('dinamic hub');
  });

  it('decodifica le entità, anche doppie', () => {
    expect(normalizeCompanyName('S &amp;amp; M beauty SA')).toBe('s & m beauty');
  });

  it('decodifica anche le entità numeriche dell\'apostrofo', () => {
    expect(normalizeCompanyName("O&#039;Brien Ltd")).toBe(normalizeCompanyName("O'Brien"));
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

  it('fa combaciare le due grafie reali dello stesso datore', () => {
    expect(normalizeCompanyName('S &amp;amp; M beauty SA')).toBe(normalizeCompanyName('S & M beauty'));
  });

  // L'altro lato del contratto. Una convergenza di troppo mette in vetrina l'azienda
  // sbagliata, che è il guasto visibile al pubblico: qui si fissa che due datori diversi
  // restino diversi anche dopo lo strip della forma societaria.
  it('tiene distinti due datori diversi', () => {
    expect(normalizeCompanyName('Rossi SA')).not.toBe(normalizeCompanyName('Rossi Bianchi SA'));
    expect(normalizeCompanyName('Dinamic Hub')).not.toBe(normalizeCompanyName('Dinamic Hub Ticino'));
  });
});

describe('withHasJobs con nomi noti', () => {
  // Nessuno di questi test deve toccare la rete: il fetch di node-fetch è già mockato in
  // cima al file e qui risponde sempre 404 a corpo vuoto, così chi non viene marcato per
  // nome cade sulla sonda e ne esce con un verdetto deterministico invece che casuale.
  beforeEach(() => {
    resetHasJobsCache();
    vi.mocked(fetch).mockReset();
    vi.mocked(fetch).mockImplementation(async () => ({ ok: false, status: 404, text: async () => '' }));
  });

  it('marca hiring chi è nei nomi noti, senza sondarlo', async () => {
    const companies = [
      { id: '3244828', name: 'Dinamic Hub' },
      { id: '9999999', name: 'Nessun Annuncio' },
    ];

    const out = await withHasJobs(companies, new Set(), new Set(['dinamic hub']));

    expect(out.find((c) => c.id === '3244828').has_jobs).toBe(true);
    expect(vi.mocked(fetch).mock.calls.some((c) => String(c[0]).includes('uiid=3244828'))).toBe(false);
  });

  it('confronta sulla forma normalizzata, non sulla stringa grezza', async () => {
    const out = await withHasJobs(
      [{ id: '1', name: 'Work &amp;amp; Work SA' }],
      new Set(),
      new Set(['work & work'])
    );

    expect(out[0].has_jobs).toBe(true);
  });

  it('non marca hiring due aziende che condividono la stessa chiave', async () => {
    const out = await withHasJobs(
      [{ id: '1', name: 'Immobiliare Ticino SA' }, { id: '2', name: 'Immobiliare Ticino Sagl' }],
      new Set(),
      new Set(['immobiliare ticino'])
    );

    expect(out.every((c) => c.has_jobs !== true)).toBe(true);
  });

  // One of the two IS hiring — the orphan ad proves it — we just cannot tell which. The
  // probe is structurally blind to orphan ads, so its `false` is not evidence here and
  // must not become a public "non assume". `null` is the honest answer.
  it('lascia unknown, non false, le aziende zittite dalla guardia sull ambiguità', async () => {
    const out = await withHasJobs(
      [{ id: '1', name: 'Immobiliare Ticino SA' }, { id: '2', name: 'Immobiliare Ticino Sagl' }],
      new Set(),
      new Set(['immobiliare ticino sa'])
    );

    expect(out.every((c) => c.has_jobs === null)).toBe(true);
  });

  // Il declassamento vale SOLO per la collisione di chiave. Qui la chiave è di una sola
  // azienda e il rifiuto viene dalla forma giuridica: abbiamo motivo di credere che l
  // annuncio sia di un altro soggetto, quindi il `false` della sonda è una risposta vera.
  it('non declassa a unknown chi è rifiutato per forma giuridica', async () => {
    const out = await withHasJobs(
      [{ id: '1', name: 'Finders Sagl' }],
      new Set(),
      new Set(['finders sa'])
    );

    expect(out[0].has_jobs).toBe(false);
  });

  // Both sides carry the same legal form: nothing to arbitrate, the match holds.
  it('marca hiring quando le due forme giuridiche coincidono', async () => {
    const out = await withHasJobs(
      [{ id: '1', name: 'Finders SA' }],
      new Set(),
      new Set(['finders sa'])
    );

    expect(out[0].has_jobs).toBe(true);
  });

  // The case the feature was built for: the ad's microdata omits the legal form that the
  // company index spells out. One side has no suffix, so the forms stay compatible.
  it('marca hiring quando l annuncio omette la forma giuridica che il roster riporta', async () => {
    const out = await withHasJobs(
      [{ id: '1', name: 'S &amp;amp; M beauty SA' }],
      new Set(),
      new Set(['s & m beauty'])
    );

    expect(out[0].has_jobs).toBe(true);
  });

  // The crossover this rule exists to refuse. "Finders SA" publishes an orphan ad but is
  // NOT on the roster; the roster holds "Finders Sagl", a different legal entity that is
  // genuinely not hiring. Only one roster company holds the key `finders`, so the
  // roster-vs-roster ambiguity guard sees nothing wrong — only the legal forms do.
  it('non marca hiring Finders Sagl per un annuncio di Finders SA', async () => {
    const out = await withHasJobs(
      [{ id: '1', name: 'Finders Sagl' }],
      new Set(),
      new Set(['finders sa'])
    );

    expect(out[0].has_jobs).not.toBe(true);
  });
});

describe('normalizeCompanyNameRaw', () => {
  it('conserva la forma giuridica che normalizeCompanyName elimina', () => {
    expect(normalizeCompanyNameRaw('Finders SA')).toBe('finders sa');
    expect(normalizeCompanyName('Finders SA')).toBe('finders');
  });

  it('applica le stesse decodifiche e lo stesso contratto sulla stringa vuota', () => {
    expect(normalizeCompanyNameRaw('S &amp;amp; M beauty SA')).toBe('s & m beauty sa');
    expect(normalizeCompanyNameRaw('')).toBe('');
    expect(normalizeCompanyNameRaw(undefined)).toBe('');
    expect(normalizeCompanyNameRaw('Azienda Riservata')).toBe('');
  });
});

describe('snapshot orfani scaduto', () => {
  beforeEach(() => { vi.mocked(fetch).mockReset(); resetHasJobsCache(); resetFeedRosterCache(); });
  afterEach(() => { vi.useRealTimers(); });

  // Gi Group è nello snapshot degli orfani e nell indice mockato, e il suo profilo qui
  // non ha annunci: se lo snapshot vale, risulta hiring; scaduto, torna alla sonda.
  it('finché è fresco marca hiring il datore orfano', async () => {
    // Snapshot finto, non quello committato. Il file vero è dati di produzione: il
    // 02.09.2026 il generatore lo ha riscritto a zero orfani — legittimamente, quei cinque
    // datori non lo sono più — e questo test è diventato rosso senza che una riga di
    // comportamento fosse cambiata, perché cercava "gi group sa" dentro `names`. L unica
    // cosa da dimostrare qui è che un nome ancora fresco vale, e per quella serve un nome
    // qualsiasi con una data qualsiasi.
    //
    // L orologio va fissato comunque: contro l ora reale, otto giorni dopo l ultima build
    // committata da un umano la suite diventerebbe rossa da sola (Vercel riscrive lo
    // snapshot nella sandbox di build e non lo ricommitta).
    vi.resetModules();
    const generatedAt = '2026-09-01T00:00:00.000Z';
    vi.doMock('./_orphan-employers-snapshot.js', () => ({ generatedAt, names: ['gi group sa'] }));
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(Date.parse(generatedAt) + 24 * 60 * 60_000));

    const fresh = await import('./_arca24.js');
    fresh.resetHasJobsCache();
    fresh.resetFeedRosterCache();
    mockPortal({ profiles: { 3244630: PROFILE_WITHOUT_ADS } });

    const list = await fresh.fetchCompanies({ withJobStatus: true });
    expect(list.find((c) => c.id === '3244630').has_jobs).toBe(true);

    vi.doUnmock('./_orphan-employers-snapshot.js');
    vi.resetModules();
  });

  it('dopo otto giorni non marca hiring nessuno', async () => {
    // Solo Date: falsificare anche i timer bloccherebbe i timeout interni dell adapter.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(Date.parse(orphanGeneratedAt) + 8 * 24 * 60 * 60_000));

    mockPortal({ profiles: { 3244630: PROFILE_WITHOUT_ADS } });
    const list = await fetchCompanies({ withJobStatus: true });
    expect(list.find((c) => c.id === '3244630').has_jobs).toBe(false);
  });

  // Day 8 is otherwise completely silent: sei datori spariscono dalla vetrina e nei log
  // non resta niente. Il token è greppabile e della stessa famiglia di [SNAPSHOT-REJECTED].
  it('segnala lo snapshot scaduto una volta sola, con un token greppabile', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(Date.parse(orphanGeneratedAt) + 8 * 24 * 60 * 60_000));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    mockPortal({ profiles: { 3244630: PROFILE_WITHOUT_ADS } });
    await fetchCompanies({ withJobStatus: true });
    resetFeedRosterCache();
    mockPortal({ profiles: { 3244630: PROFILE_WITHOUT_ADS } });
    await fetchCompanies({ withJobStatus: true });

    const expired = warn.mock.calls.filter(([m]) => String(m).includes('[SNAPSHOT-EXPIRED]'));
    expect(expired).toHaveLength(1);
    expect(expired[0][0]).toContain(orphanGeneratedAt);
    warn.mockRestore();
  });

  // Il fail-closed esiste già, ma solo come effetto collaterale del confronto con NaN:
  // `Date.parse('')` è NaN e ogni confronto con NaN è false, quindi si cade nel ramo
  // scaduto. È esattamente il tipo di comportamento che un refactor rompe in silenzio.
  it('con generatedAt malformato non marca hiring nessuno', async () => {
    vi.resetModules();
    vi.doMock('./_orphan-employers-snapshot.js', () => ({
      generatedAt: 'non-una-data',
      names: ['gi group sa'],
    }));

    const fresh = await import('./_arca24.js');
    fresh.resetHasJobsCache();
    fresh.resetFeedRosterCache();
    mockPortal({ profiles: { 3244630: PROFILE_WITHOUT_ADS } });

    const list = await fresh.fetchCompanies({ withJobStatus: true });

    expect(list.find((c) => c.id === '3244630').has_jobs).toBe(false);
    vi.doUnmock('./_orphan-employers-snapshot.js');
    vi.resetModules();
  });
});
