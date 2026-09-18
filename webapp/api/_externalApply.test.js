import { describe, it, expect } from 'vitest';
import * as cheerio from 'cheerio';
import { findExternalApplyHref, findExternalApplyCompanyHref } from './_externalApply.js';

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

const trova = (html, id) => findExternalApplyHref(html, cheerio.load(html), id);

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

describe('findExternalApplyHref — annunci correlati sulla stessa pagina', () => {
    // La pagina porta anche gli "Altri annunci di lavoro" della stessa azienda,
    // ognuno con la propria azione di candidatura.
    const PAGINA_CON_CORRELATI = `<html><body><script>
    window.__DATA__ = {"related":[{"action":{"url":"https://jobroom.jobcourier.ch/job/externalLink.php?redirect=https%3A%2F%2Fats.altro-datore.ch%2Fjob%2F999&job_post_id=999"}}],
    "actions":[{"label":"Candidati","action":{"url":"https://jobroom.jobcourier.ch/job/externalLink.php?redirect=https%3A%2F%2Feasyapply.jobs%2Fr%2FMIO&job_post_id=6738863"}}]};
    </script></body></html>`;

    it('sceglie lannuncio giusto anche se un correlato viene prima', () => {
        const href = findExternalApplyHref(PAGINA_CON_CORRELATI, cheerio.load(PAGINA_CON_CORRELATI), '6738863');
        expect(decodeURIComponent(new URL(href).searchParams.get('redirect'))).toBe('https://easyapply.jobs/r/MIO');
    });

    it('non spedisce il candidato altrove quando il suo annuncio non ce', () => {
        expect(findExternalApplyHref(PAGINA_CON_CORRELATI, cheerio.load(PAGINA_CON_CORRELATI), '1111111')).toBe('');
    });

    it('senza id resta il comportamento di prima', () => {
        const href = findExternalApplyHref(PAGINA_CON_CORRELATI, cheerio.load(PAGINA_CON_CORRELATI));
        expect(href).toContain('externalLink.php');
    });
});

describe('findExternalApplyCompanyHref', () => {
    // Trimmed copy of the real payload served for Adecco (id 3244683) on 18.09.2026 —
    // the company-page apply button is built the same way the job-ad one is (see
    // findExternalApplyHref above): from JSON, not from a static anchor. Unlike the
    // job-ad payload, the link here is root-relative (no scheme/host) and lives under
    // the key `link`, not `url`.
    const PAGINA_AZIENDA_VISO = `<!doctype html><html><body><div id="app"></div><script>
window.__DATA__ = {"actions":[{"label":"Annunci dell'azienda","action":{"link":"/it/careers/3244683-adecco/jobs"}},
{"icon":"arrow-up-right-from-square","label":"Candidatura spontanea","fluo":true,"action":{"link":"/job/externalLinkCompany.php?redirect=https%3A%2F%2Fwww.adecco.com%2Fit-ch%2Fcandidatura-spontanea%3Futm_source%3Dvisojobcourier&company_name=adecco&company_id=3244683&language=it_IT"}}]};
</script></body></html>`;

    const PAGINA_SENZA_BOTTONE = `<!doctype html><html><body><div id="app"></div><script>
window.__DATA__ = {"actions":[{"label":"Annunci dell'azienda","action":{"link":"/it/careers/3244683-adecco/jobs"}}]};
</script></body></html>`;

    const trova = (html, id) => findExternalApplyCompanyHref(html, cheerio.load(html), id);

    it('legge il link dal payload JSON della pagina azienda', () => {
        const href = trova(PAGINA_AZIENDA_VISO, '3244683');
        expect(href).toContain('externalLinkCompany.php');
        const target = new URL(href, 'https://jobroom.jobcourier.ch').searchParams.get('redirect');
        expect(decodeURIComponent(target)).toBe('https://www.adecco.com/it-ch/candidatura-spontanea?utm_source=visojobcourier');
    });

    it('non spedisce il candidato da un\'altra azienda quando company_id non combacia', () => {
        expect(trova(PAGINA_AZIENDA_VISO, '9999999')).toBe('');
    });

    it('senza id resta il comportamento di sempre', () => {
        expect(trova(PAGINA_AZIENDA_VISO)).toContain('externalLinkCompany.php');
    });

    it('nessun bottone candidatura spontanea sulla pagina: nessun link', () => {
        expect(trova(PAGINA_SENZA_BOTTONE, '3244683')).toBe('');
    });

    it('regge una pagina vuota o assente', () => {
        expect(findExternalApplyCompanyHref('', null)).toBe('');
        expect(findExternalApplyCompanyHref(null, null)).toBe('');
    });
});
