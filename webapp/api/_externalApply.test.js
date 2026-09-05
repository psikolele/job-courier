import { describe, it, expect } from 'vitest';
import * as cheerio from 'cheerio';
import { findExternalApplyHref } from './_externalApply.js';

/**
 * The payload below is the shape the `viso` platform actually served for the
 * Manpower ad 6738863 on 04.09.2026 — the apply button is built at runtime from
 * JSON, so there is no anchor to read. Reading only the anchor is what made every
 * ad on the site look like an internal application.
 */
const PAGINA_VISO = `<!doctype html><html><body><div id="app"></div><script>
window.__DATA__ = {"actions":[{"icon":"xmark","label":"Annulla","action":{"name":"cancelApplication"}},
{"icon":"arrow-up-right-from-square","label":"Candidati","fluo":true,"action":{"url":"https://jobroom.jobcourier.ch/job/externalLink.php?redirect=https%3A%2F%2Feasyapply.jobs%2Fr%2FBILPQNB27aCnhB2Cc3jF%3Futm_source%3Dvisojobcourier&job_post_id=6738863&target_job=key-account-manager"}}]};
</script></body></html>`;

const PAGINA_VECCHIA = `<html><body>
<a class="apply" href="https://jobroom.jobcourier.ch/job/externalLink.php?redirect=https%3A%2F%2Fwww.manpower.ch%2Fjob%2F123&job_post_id=1">Candidati</a>
</body></html>`;

const PAGINA_INTERNA = `<html><body><a href="/it/careers/jobad/6738863">Candidati</a></body></html>`;

const trova = (html) => findExternalApplyHref(html, cheerio.load(html));

describe('findExternalApplyHref', () => {
    it('legge il link dal payload JSON della piattaforma viso', () => {
        const href = trova(PAGINA_VISO);
        expect(href).toContain('externalLink.php');
        const target = new URL(href).searchParams.get('redirect');
        expect(decodeURIComponent(target)).toBe('https://easyapply.jobs/r/BILPQNB27aCnhB2Cc3jF?utm_source=visojobcourier');
    });

    it('continua a leggere l\'ancora della piattaforma vecchia', () => {
        const href = trova(PAGINA_VECCHIA);
        const target = new URL(href).searchParams.get('redirect');
        expect(decodeURIComponent(target)).toBe('https://www.manpower.ch/job/123');
    });

    it('non inventa un link quando la candidatura è interna', () => {
        expect(trova(PAGINA_INTERNA)).toBe('');
    });

    it('regge una pagina vuota o assente', () => {
        expect(findExternalApplyHref('', null)).toBe('');
        expect(findExternalApplyHref(null, null)).toBe('');
    });

    it('recupera il bersaglio anche quando il separatore e sfuggito', () => {
        // Il match si chiude sull'escape, ma `redirect` viene prima: si perdono
        // solo i parametri in coda, che non servono a nessuno.
        const escaped = PAGINA_VISO.replace(/&job_post_id/g, '\u0026job_post_id');
        const target = new URL(trova(escaped)).searchParams.get('redirect');
        expect(decodeURIComponent(target)).toBe('https://easyapply.jobs/r/BILPQNB27aCnhB2Cc3jF?utm_source=visojobcourier');
    });
});
