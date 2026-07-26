# Modifiche Sito — Richieste Laura Ballinari (26 Luglio 2026)

**Fonte:** email "JC ultime modifiche sito" (laura@jobcourier.ch → serra.emanuele09@gmail.com, cc g.molteni@jobcourier.ch), 26.07.2026 18:32. Allegato: `Modifiche Sito 26.07.docx`.

**Stato:** 🔴 DA IMPLEMENTARE — go-live richiesto nel periodo 30.07–03.08.2026.

## Go-live & Check finale (rispondere a Laura)
* Chiede giorno preferito per go live nel periodo **30.07–03.08**.
* Check finale in videochiamata: **mercoledì 29 (16:00–19:30)** oppure **giovedì (11:00–12:00)**.
* Pagina contatti: contenuti mancanti, Laura li invia "entro domani" (documento si interrompe su questo punto — verificare se arrivati).

## 1. Titoli Home
Sezione "Per i candidati" / "Per le aziende" — screenshot: `assets/modifiche-sito-2026-07-26/01-titoli-home.jpeg`
- PER I CANDIDATI → *Trova il tuo prossimo lavoro.*
- PER LE AZIENDE → *I candidati giusti sono già qui.*

## 2. Link menu Azienda da verificare
Screenshot: `assets/modifiche-sito-2026-07-26/02-menu-azienda.jpeg`
"Pubblica annuncio" e "Trova candidati" devono rimandare entrambi alla pagina di login/registrazione azienda (separati o uniti, indifferente).

## 3. Vetrina annunci
Titolo sezione: **AZIENDE PARTNER** — sottotitolo: *Aziende e Recruiter che si affidano a Job Courier*.

## 4. Sezione Formazione & disposizione banner
- Primi due banner sotto le offerte appena pubblicate: **ASFL** e **BLC**.
- Banner sotto diventano **Ated** e **Supsi** → creare vera sezione dedicata con titolo **Formazione continua** — sottotitolo: *Opportunità per aggiornare competenze e favorire la crescita professionale.*

## 5. Titoli Blog
- **Consigli di carriera** — *Consigli pratici per affrontare ogni fase della ricerca di lavoro.*
- **Consigli di recruiting** — *Idee, strategie e consigli per trovare i candidati giusti.*

Le due frasi vengono riprese identiche come sottotitolo nelle rispettive pagine blog.

## 6. Pagina "Aziende che assumono" — ✅ FATTO
Pagina rimandava all'applicativo esterno — richiesta di Gabriele: fare una **copia della pagina nel sito**, come già fatto per le offerte.

Implementato: `/aziende-che-assumono` (griglia loghi + ricerca per nome) e `/azienda/:slug` (profilo azienda). Scraper `api/companies.js` e `api/company-detail.js`.

**Da sapere:** la pagina jobroom non elenca aziende con offerte attive, ma **profili aziendali vetrina** — tutte e 11 hanno **0 annunci attivi** oggi. Il profilo espone sede, settore, testo "Lavora con noi" e candidatura spontanea. Per questo il click porta al profilo interno e non a offerte filtrate (che sarebbero state 11 pagine vuote).

## 7. Pagina "Come funziona"
Da modificare solo le 4 immagini degli step: **Registra / Pubblica / Visualizza / Contatta**. Proposte grafiche di Laura estratte dal docx:
- `assets/modifiche-sito-2026-07-26/03-come-funziona-registra.jpeg`
- `assets/modifiche-sito-2026-07-26/04-come-funziona-pubblica.jpeg`
- `assets/modifiche-sito-2026-07-26/05-come-funziona-visualizza.jpeg`
- `assets/modifiche-sito-2026-07-26/06-come-funziona-contatta.jpeg`

## 8. Pagina Soluzioni
- Titolo: **SOLUZIONI E TARIFFE**
- H1: *Per ogni esigenza una soluzione mirata.*
- Sezione "Perché le aziende scelgono JobCourier": *Da 10 anni mettiamo in contatto candidati e aziende e agenzie di reclutamento in tutta la Svizzera.*
- Contatori: **50+ aziende che ci hanno scelto** / **2'300+ in tutta Svizzera**.

## 9. Cookie Policy — correzioni dati legali
Sito attuale irraggiungibile per Laura (non ha potuto confrontare il resto del contenuto — verificare se ci sono altre discrepanze oltre a queste due).

| Punto | Testo attuale (errato) | Testo corretto |
|---|---|---|
| Ragione sociale/sede | JobCourier SA, Via Cantonale, 6900 Lugano (Svizzera) | **JobCourier Sagl**, Via delle Fornaci 6 - 6826 Riva San Vitale |
| Email contatti | support@jobcourier.ch | **privacy@jobcourier.ch** |
| Indirizzo contatti | JobCourier SA, Via Cantonale, 6900 Lugano, Svizzera | **JobCourier Sagl - Via delle Fornaci 6 - 6826 Riva San Vitale** |

Aggiornare anche "Ultimo aggiornamento" della policy alla data di pubblicazione effettiva.

## 10. Pagina Contatti
Nessuna indicazione ricevuta finora. Laura manda contenuti (incluse info per il candidato) separatamente — **verificare se arrivati prima di procedere**.

---

## Checklist implementazione
- [ ] Titoli Home (candidati/aziende)
- [x] Link menu Azienda → login/registrazione *(era un bug: "Trova candidati" puntava a job-seekers.php)*
- [x] Titolo "Aziende Partner" in vetrina annunci
- [x] Sezione "Formazione continua" (Ated + Supsi) separata da ASFL/BLC *(FormaBanner/Ated non veniva mai renderizzato)*
- [x] Titoli blog (Consigli di carriera / Consigli di recruiting)
- [x] Copia pagina "Aziende che assumono" → `/aziende-che-assumono` + `/azienda/:slug`
- [x] 4 immagini pagina "Come funziona"
- [x] Testi pagina Soluzioni (titolo, H1, paragrafo, contatori)
- [x] Correzioni Cookie Policy (ragione sociale, indirizzo, email)
- [ ] Pagina Contatti (in attesa contenuti da Laura)
- [ ] Rispondere a Laura: data go-live + slot check finale

## Pendenze tecniche non bloccanti
- **EN/DE/FR hero:** stessa incoerenza semantica dell'italiano prima del fix ("Accedi al tuo" / "Access your" invece di "Trova il tuo") — non toccate, valutare se allinearle.
- **Contatore 2'300+ in pagina Soluzioni:** le versioni EN/DE/FR usano un testo placeholder copiato dall'italiano, servono traduzioni reali prima di un rilascio multilingua.
- **Caching scraper aziende:** ogni apertura di `/azienda/:slug` fa 2 chiamate upstream a jobroom (lista per risolvere lo slug + dettaglio). Nessun endpoint del progetto usa caching sulle risposte, quindi non l'ho introdotto qui; se il traffico cresce vale un `s-maxage` su `/api/companies`.
