import { describe, it, expect, vi, afterEach } from 'vitest';

import { canonicalPath } from './shell-ssr.js';

const SHELL = '<!doctype html><html><head><title>JobCourier</title></head><body><div id="root"></div></body></html>';

const makeRes = () => {
  const res = { headers: {}, statusCode: null, body: null };
  res.setHeader = (k, v) => { res.headers[k] = v; };
  res.status = (code) => { res.statusCode = code; return res; };
  res.send = (body) => { res.body = body; return res; };
  return res;
};

// A fresh module per call: _ssr.js caches the fetched template in module scope, so a
// second test would otherwise render against the first one's stub.
const run = async (path) => {
  vi.resetModules();
  const { default: handler } = await import('./shell-ssr.js');
  const res = makeRes();
  await handler({ headers: { host: 'www.jobcourier.ch' }, query: { path } }, res);
  return res;
};

describe('canonicalPath', () => {
  it('keeps a routed path and drops the trailing slash', () => {
    // The audit's 213 legacy URLs are indexed with a trailing slash; both forms must
    // canonicalise to the one shape the sitemap uses.
    expect(canonicalPath('/faq')).toBe('/faq');
    expect(canonicalPath('/faq/')).toBe('/faq');
    expect(canonicalPath('/blog/carriera/come-scrivere-un-cv')).toBe('/blog/carriera/come-scrivere-un-cv');
  });

  it('sends /blog to the category it redirects to, not to itself', () => {
    // App.jsx renders <Navigate to="/blog/carriera" replace> — /blog has no content of
    // its own, so a self-canonical would point at a page that never exists.
    expect(canonicalPath('/blog')).toBe('/blog/carriera');
  });

  it('refuses anything that is not a path of this site', () => {
    // The value arrives from a query string. An absolute URL or a traversal would mint a
    // canonical pointing off-site.
    expect(canonicalPath('//evil.example.com')).toBe('/');
    expect(canonicalPath('https://evil.example.com')).toBe('/');
    expect(canonicalPath('/blog/../../etc')).toBe('/');
    expect(canonicalPath(undefined)).toBe('/');
  });
});

describe('shell-ssr handler', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('serves the shell with a self-referencing canonical', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, text: async () => SHELL })));

    const res = await run('/faq');

    expect(res.statusCode).toBe(200);
    expect(res.body).toContain('<link rel="canonical" href="https://www.jobcourier.ch/faq">');
    expect(res.body).toContain('<meta property="og:url" content="https://www.jobcourier.ch/faq">');
    // One canonical only: main.jsx strips it before React renders its own.
    expect(res.body.match(/rel="canonical"/g)).toHaveLength(1);
    expect(res.body).toContain('id="root"');
  });

  it('replaces the template canonical instead of adding a second one', async () => {
    // The template is the built index.html, which is the home page and carries the home
    // page's canonical. Appending here would give every blog page two.
    const homeShell = SHELL.replace(
      '</head>',
      '<link rel="canonical" href="https://www.jobcourier.ch"><meta property="og:url" content="https://www.jobcourier.ch"></head>'
    );
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, text: async () => homeShell })));

    const res = await run('/blog/carriera');

    expect(res.body.match(/rel="canonical"/g)).toHaveLength(1);
    expect(res.body.match(/property="og:url"/g)).toHaveLength(1);
    expect(res.body).toContain('href="https://www.jobcourier.ch/blog/carriera"');
  });

  it('canonicalises the home page with the slash the sitemap lists', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, text: async () => SHELL })));

    const res = await run('/');

    expect(res.body).toContain('<link rel="canonical" href="https://www.jobcourier.ch/">');
  });
});

describe('pre-boot snapshot gate', () => {
  it('marks the snapshot wrapper with the attribute index.html hides', async () => {
    const { snapshotBody } = await import('./_ssr.js');
    const html = snapshotBody({ heading: 'Offerte', links: [{ href: '/offerta/1', label: 'Autista' }] });

    expect(html.startsWith('<div data-preboot')).toBe(true);
    // The content itself must stay intact: hiding it from a browser is not the same as
    // dropping it, and every client that skips the bundle still reads this.
    expect(html).toContain('href="/offerta/1"');
    expect(html).toContain('Offerte');
  });

  it('index.html hides that attribute only once JavaScript has run', async () => {
    const { readFile } = await import('node:fs/promises');
    const shell = await readFile(new URL('../index.html', import.meta.url), 'utf8');

    // Selector and attribute live in different files; when they drift the snapshot goes
    // back to painting on every cold load and nothing errors.
    expect(shell).toContain('html.js #root > [data-preboot] { display: none !important; }');
    expect(shell).toMatch(/documentElement\.className \+=.*'js'/);
    // Both must sit above #root, or the rule arrives after the snapshot has painted.
    expect(shell.indexOf('data-preboot')).toBeLessThan(shell.indexOf('<div id="root">'));
  });
});
