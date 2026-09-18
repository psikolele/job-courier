# Candidatura spontanea — link pagina azienda (fix estrazione dati Arca24)

> Data: 2026-09-18 | Area: Job Courier — webapp/api

## Contesto

Laura (17-18/09, thread email "Pagina Azienda") ha segnalato via screenshot due
elementi su `jobroom.jobcourier.ch/it/careers/<id>-<slug>/profile` (la piattaforma
Arca24 "viso", upstream): il link "Sito web" e il bottone "Candidatura spontanea"
nella sezione "Lavora con noi" di ogni pagina azienda. Chiedeva il collegamento
sulla pagina azienda del nostro sito (`jobcourier.ch/azienda/<id>`).

## Cosa esiste già

Il frontend è già pronto e non necessita modifiche:

- [`AziendaDettaglio.jsx:254-283`](../../../webapp/src/pages/AziendaDettaglio.jsx#L254)
  ha già la sezione "Lavora con noi" con bottone "Candidatura spontanea"
  (`spontaneous_url`), stile pieno, i18n completo (it/en/de/fr, chiave
  `company.spontaneous_application`).
- Gate esistente, corretto e da NON toccare (confermato in sessione):
  la sezione intera appare se `brand_title || brand_description`; il bottone
  dentro la sezione appare solo se anche `spontaneous_url` è valorizzato.

## Causa del problema

La fonte dati attiva in produzione è `webapp/api/_arca24.js` (Arca24 abilitato,
`isArca24Enabled()` true). La sua `parseCompanyDetailFromHtml`
([_arca24.js:1181-1210](../../../webapp/api/_arca24.js#L1181)) hardcoda:

```js
brand_title: '',
website: '',
spontaneous_url: '',
```

e legge `brand_description` da `[itemprop="description"]`, che sulla pagina
profilo è solo il meta SEO generico (`"Azienda: Adecco | JobCourier"`), mai il
vero testo "Lavora con noi" — verificato dal vivo, produzione oggi non mostra
mai questa sezione per nessuna azienda.

Verificato con fetch server-side reale (stesso header/UA del backend) che
l'HTML grezzo di `.../profile` **contiene già** tutto il necessario:

- Titolo "Lavora con noi": `<h2 class="alignCenter nomargin md-title">` —
  attenzione, esiste un SECONDO `h2.md-title` sulla pagina, quello del nome
  azienda, annidato dentro `[itemprop="hiringOrganization"]`; va escluso.
- Testo banda: `<span class="md-body-1 biggerfont">` (unico in pagina).
- Bottone "Candidatura spontanea": **non ha un href statico** — è un
  router-link Vue che punta a se stesso (`/it/careers/<id>-<slug>/profile`);
  il vero target vive solo nel JSON di stato incorporato nella pagina, come
  `"action":{"link":"/job/externalLinkCompany.php?redirect=...&company_id=...&company_name=..."}`.
  Stesso identico problema già risolto in
  [`_externalApply.js`](../../../webapp/api/_externalApply.js) per il bottone
  "Candidati" delle offerte (lì l'endpoint è `externalLink.php`, qui
  `externalLinkCompany.php` — endpoint diverso, tecnica identica).

## Fix

Tutto e solo dentro `parseCompanyDetailFromHtml` in `webapp/api/_arca24.js`
(nessun cambio al frontend, nessun cambio al parser legacy in
`webapp/api/company-detail.js` — non attivo in produzione, già corretto per sé
stesso, nessun cambio a vetrina/tile in `Vetrini.jsx`/`AziendeCheAssumono.jsx`):

1. **`brand_title`**: primo `h2.md-title` il cui antenato NON è
   `[itemprop="hiringOrganization"]` (quello è il nome azienda).
2. **`brand_description`**: `.md-body-1.biggerfont` (primo/unico match),
   sostituisce la lettura di `[itemprop="description"]`.
3. **`spontaneous_url`**: nuova funzione `findExternalApplyCompanyHref(html, id)`
   in `_externalApply.js` (o accanto), gemella di `findExternalApplyHref` ma
   con pattern `externalLinkCompany.php` invece di `externalLink.php`. Guard:
   se il payload espone `company_id`, deve combaciare con l'`id` richiesto
   (stesso principio anti-azienda-sbagliata già applicato altrove nel file per
   il mismatch upstream) — un mismatch azzera `spontaneous_url` invece di
   restituire il link di un'altra azienda. Risultato risolto ad URL assoluto
   con `new URL(href, ARCA24_HOST).toString()`, stessa forma già usata da
   `jobroom_url`.

`website` resta non estratto: il frontend non lo consuma (verificato,
`AziendaDettaglio.jsx` non lo destruttura), nessun motivo di aggiungerlo.

## Casi limite

- Azienda senza banda "Lavora con noi" upstream → tutti e 3 i campi vuoti,
  comportamento identico a oggi (sezione nascosta).
- Azienda con banda ma senza bottone candidatura spontanea (solo testo, nessun
  redirect nel payload) → sezione visibile, bottone nascosto — già gestito dal
  gate frontend esistente, nessun cambio necessario.
- Mismatch `company_id` nel redirect → `spontaneous_url` vuoto invece di un
  link sbagliato.

## Test

Unit test nuovo sul parser (fixture HTML minimale, coerente con test esistenti
tipo `companyVariety.test.js`):

- banda presente + bottone presente → tutti e 3 i campi estratti correttamente.
- banda assente → tutti e 3 vuoti, nessun errore.
- banda presente, bottone assente → `brand_title`/`brand_description`
  valorizzati, `spontaneous_url` vuoto.
- `company_id` nel redirect diverso dall'`id` richiesto → `spontaneous_url`
  vuoto.

## Fuori scope (esplicitamente escluso in sessione)

- Nessun secondo CTA sulle tile quadrate della vetrina (`Vetrini.jsx`,
  home + `/aziende-che-assumono`).
- Nessuna modifica al gate frontend (resta agganciato al testo brand, per
  scelta esplicita).
- Nessuna modifica al parser legacy PHP.
