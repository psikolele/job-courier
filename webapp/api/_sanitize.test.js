import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from './_sanitize.js';

describe('sanitizeHtml — payload che oggi passerebbero', () => {
  const blocked = [
    ['handler onerror', '<img src="x" onerror="alert(1)">'],
    ['handler onload', '<svg onload="alert(1)"></svg>'],
    ['handler onclick', '<div onclick="alert(1)">testo</div>'],
    ['handler maiuscolo', '<img src="x" OnErRoR="alert(1)">'],
    ['iframe', '<iframe src="https://evil.tld"></iframe>'],
    ['script', '<script>alert(1)</script>'],
    ['form + input', '<form action="https://evil.tld"><input name="pw"></form>'],
    ['href javascript:', '<a href="javascript:alert(1)">clicca</a>'],
    ['href con tab', '<a href="java\tscript:alert(1)">clicca</a>'],
    ['href con entity', '<a href="java&#09;script:alert(1)">clicca</a>'],
    ['src data: html', '<img src="data:text/html;base64,PHNjcmlwdD4=">'],
    ['object', '<object data="evil.swf"></object>'],
    ['style expression', '<div style="background:url(javascript:alert(1))">x</div>'],
  ];

  for (const [name, payload] of blocked) {
    it(`neutralizza: ${name}`, () => {
      const out = sanitizeHtml(payload);
      expect(out).not.toMatch(/on[a-z]+\s*=/i);
      expect(out.toLowerCase()).not.toContain('javascript:');
      expect(out.toLowerCase()).not.toContain('<script');
      expect(out.toLowerCase()).not.toContain('<iframe');
      expect(out.toLowerCase()).not.toContain('<form');
      expect(out.toLowerCase()).not.toContain('<object');
      expect(out.toLowerCase()).not.toContain('data:text/html');
      expect(out).not.toContain('style=');
    });
  }
});

describe('sanitizeHtml — contenuto legittimo preservato', () => {
  it('tiene la formattazione di un annuncio reale', () => {
    const html = `<p>Cerchiamo un <strong>manutentore elettrico</strong>.</p>
      <ul><li>Diploma di perito</li><li>Esperienza su PLC</li></ul>
      <table><tr><td colspan="2">Orario</td></tr></table>`;
    const out = sanitizeHtml(html);
    expect(out).toContain('<strong>manutentore elettrico</strong>');
    expect(out).toContain('<li>Esperienza su PLC</li>');
    expect(out).toContain('colspan="2"');
  });

  it('tiene i link http e ci mette rel di sicurezza', () => {
    const out = sanitizeHtml('<a href="https://azienda.ch/careers">Candidati</a>');
    expect(out).toContain('href="https://azienda.ch/careers"');
    expect(out).toContain('rel="noopener noreferrer nofollow"');
  });

  it('tiene mailto e immagini https', () => {
    expect(sanitizeHtml('<a href="mailto:hr@x.ch">scrivi</a>')).toContain('mailto:hr@x.ch');
    expect(sanitizeHtml('<img src="https://x.ch/logo.png" alt="logo">')).toContain('alt="logo"');
  });

  it('scarta il tag ma tiene il testo dei tag sconosciuti', () => {
    expect(sanitizeHtml('<font color="red">importante</font>')).toBe('importante');
  });

  it('non esplode su input vuoto o non stringa', () => {
    expect(sanitizeHtml('')).toBe('');
    expect(sanitizeHtml(null)).toBe('');
    expect(sanitizeHtml(undefined)).toBe('');
  });
});
