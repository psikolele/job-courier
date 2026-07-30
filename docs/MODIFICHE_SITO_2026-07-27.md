# Modifiche Sito — Richieste Laura Ballinari (27 Luglio 2026)

**Fonte:** email "R: JC ultime modifiche sito" (laura@jobcourier.ch → serra.emanuele09@gmail.com, cc g.molteni@jobcourier.ch), 27.07.2026 19:05. Allegato: `Modifche Sito 27.07.docx`.

**Testo mail:** *"Eccomi con le ultime cose, allego. Come d'accordo, appena mi dici che ci sei con tutto, farò check e tornerò da te per conferma."*

**Stato:** 🔴 DA IMPLEMENTARE — segue il batch del 26.07 (vedi [MODIFICHE_SITO_2026-07-26.md](MODIFICHE_SITO_2026-07-26.md), 9/10 chiusi).

**Blocco go-live:** Laura fa il check finale solo dopo conferma che tutto è a posto → questi 4 punti sono l'ultimo gate prima del check.

---

## 1. Sezione Formazione — stile titolo
Nel docx: `_formazione CONTINUA` + sottotitolo *Opportunità per aggiornare competenze e favorire la crescita professionale.*

Stato attuale ([AdBanner.jsx:411-415](../webapp/src/components/AdBanner.jsx#L411)):
```jsx
<SectionTitle
    eyebrow="Crescita professionale"
    title="Formazione continua"
    subtitle="Opportunità per aggiornare competenze e favorire la crescita professionale."
/>
```

Il sottotitolo è già identico a quello richiesto. Cambia solo l'intestazione:
- eyebrow (label piccola col trattino): **FORMAZIONE**
- titolo H2: **CONTINUA**

Interpretazione dell'underscore `_` = trattino dell'eyebrow, come negli altri blocchi ("— OFFERTE DI LAVORO" / "45 ANNUNCI LIVE"). ⚠️ Da confermare con Laura in vdc: alternativa è tenere "Formazione continua" come H2 e cambiare solo l'eyebrow da "Crescita professionale" a "Formazione".

Ripercussione: eyebrow/titolo sono hardcoded in italiano — verificare le versioni EN/DE/FR o lasciare invariato (attualmente non tradotto).

## 2. Pagina Soluzioni — bottone "Annuncio singolo 249"
Screenshot: `assets/modifiche-sito-2026-07-27/01-pagina-soluzioni-acquista.jpeg`

Richiesta: sotto il piano **ANNUNCIO SINGOLO / CHF 249** il bottone diventa **[ ACQUISTA ]** e punta alla registrazione azienda (non più a `/contatti`).

Stato attuale ([Pricing.jsx:391](../webapp/src/pages/Pricing.jsx#L391)): tutti e 3 i piani usano lo stesso `OutlineButton href="/contatti"` con label "Contattaci".

Implementazione:
- Aggiungere a ogni oggetto `plan` i campi `cta` e `href` (oggi solo `cta`).
- Piano 01 / OCCASIONALE: `cta = 'Acquista'` (`Kaufen` / `Acheter` / `Buy`), `href = https://jobroom.jobcourier.ch/employer/register.php?ignoreRedirectingCookiesAll=1&lan=it&language=it` — stesso URL già usato in [Navbar.jsx:67](../webapp/src/components/Navbar.jsx#L67).
- Piani 02 e 03: invariati (`Contattaci` → `/contatti`).
- ⚠️ Link esterno → aggiungere `target="_blank" rel="noopener noreferrer"` come sugli altri link jobroom.

Da valutare: se "Acquista" deve essere il bottone primario (fucsia pieno) invece che outline, per differenziarlo dagli altri due. Non richiesto esplicitamente — proposta da mostrare al check.

## 3. Dato "numero di annunci" — domanda di Laura
Screenshot: `assets/modifiche-sito-2026-07-27/02-numero-annunci.jpeg` (contatore "45 ANNUNCI LIVE" in pagina Offerte)

Domanda: *"questo numero verrà ripreso dall'applicativo?"*

**Risposta (nessuna modifica al codice):** sì, è dinamico. [Offerte.jsx:290](../webapp/src/pages/Offerte.jsx#L290) stampa `{jobs.length}`, dove `jobs` arriva da `/api/jobs` che fa scraping live di jobroom. Caricamento in due fasi: prima pagina (`singlePage=1`) per la resa immediata, poi lista completa che sovrascrive il contatore. Nessun valore hardcoded.

Caveat da comunicare: il numero riflette gli annunci realmente restituiti dallo scraper al momento della visita. Se jobroom cambia markup o va giù, il contatore va a 0 — non c'è fallback.

## 4. Pagina Contatti — contenuti finalmente arrivati
Screenshot di riferimento: `assets/modifiche-sito-2026-07-27/03-contatti-riferimento.jpeg`

Richiesta testuale di Laura: *"Mi piacerebbe che ci fosse una sezione per i candidati e una per le aziende, poi vedi tu colori / disposizione orizzontale o verticale, grafica sotto della banda blu come le altre pagine… interpretala come vuoi, idem per il form di contatto (se fattibile il campo «argomento» con menu a tendina mettiamo, se no teniamo il settore come in quello che hai già fatto)."*

Struttura da realizzare (dall'immagine allegata):

| Blocco | Contenuto |
|---|---|
| Hero banda navy | eyebrow **— CONTATTI**, H1 *COME POSSIAMO* / **AIUTARTI?** (seconda riga fucsia), sottotitolo serif: *Hai una domanda sui nostri servizi o vuoi maggiori informazioni? Il nostro team è a disposizione per aiutarti a trovare la soluzione più adatta alle tue esigenze.* |
| Sezione candidati | eyebrow **— PER I CANDIDATI**, titolo *INFORMAZIONI IMPORTANTI PER I CANDIDATI*. Testo: *JobCourier è la piattaforma attraverso la quale aziende e agenzie pubblicano le proprie offerte di lavoro.* + *Le selezioni sono gestite direttamente dalle aziende che pubblicano gli annunci. Per questo motivo non possiamo fornire informazioni su:* → lista ✗ stato delle candidature / requisiti delle posizioni / esito delle selezioni |
| Colonna destra candidati | ✓ *Per candidarti utilizza sempre il pulsante presente all'interno dell'offerta di lavoro.* — ✗ *Non inviare il CV all'indirizzo commerciale di JobCourier.* + box fucsia chiaro "Hai bisogno di aiuto?" → CTA **VAI ALLE FAQ** |
| Sezione aziende | eyebrow **— PER LE AZIENDE**, titolo *SEI UN'AZIENDA? SCRIVICI.*, testo *Compila il modulo per richiedere informazioni sui servizi JobCourier, ricevere supporto relativo alla piattaforma o valutare una collaborazione.* + form |
| Form | Nome*, Cognome*, Email*, Azienda, **Oggetto*** (select), Messaggio*, bottone fucsia **INVIA MESSAGGIO**, disclaimer privacy con link |
| Footer sezione | banda fucsia chiaro *NON TROVI QUELLO CHE CERCHI?* → CTA **VAI ALLE FAQ** |

Modifiche al form ([Contact.jsx:159-164](../webapp/src/pages/Contact.jsx#L159)): il select oggi è "Settore" con opzioni HR/Dev/Marketing/Altro. Va sostituito con **Oggetto / "Seleziona un argomento"**. Valori proposti (da confermare con Laura, non li ha specificati): *Informazioni sui servizi · Supporto piattaforma · Proposta di collaborazione · Altro*.

Note tecniche:
- I 216 righe di `Contact.jsx` attuali vanno riscritti in buona parte: oggi la pagina non ha la separazione candidati/aziende.
- Le stringhe passano da `t('contact.*')` — servono le chiavi nuove in IT/EN/DE/FR. Se le traduzioni non arrivano in tempo, replicare l'italiano e segnalarlo come pendenza (stessa scelta già fatta per i contatori della pagina Soluzioni).
- La CTA FAQ punta a `/faq` (pagina già esistente).

⚠️ **Da chiarire:** l'immagine allegata è un rendering completo in stile JobCourier — Laura la chiama "spunto". Trattata qui come specifica di contenuto vincolante e come indicazione grafica non vincolante ("interpretala come vuoi").

---

## Fuori docx — altre pendenze aperte nel thread

**Link applicativo nuovo (mail 27.07 14:44):** Laura ha mandato gli URL della piattaforma arca24, che affiancano/sostituiscono jobroom:
- Offerte: `https://viso-jobcourier.arca24.careers/it/careers/latest_jobs`
- Aziende che assumono: `https://viso-jobcourier.arca24.careers/it/careers/jobs_by_company`

Da chiarire prima del go-live: gli scraper (`api/jobs.js`, `api/companies.js`, `api/company-detail.js`) puntano tutti a `jobroom.jobcourier.ch`. Se arca24 è la destinazione definitiva, va rifatto il targeting — **impatto alto, non stimabile senza test sul nuovo dominio**. Se invece è solo la vetrina attuale del cliente, nessuna azione.

**Date:** proposta inviata il 27.07 → check in vdc martedì (mattina o 14:30), go-live 05.08 o quella settimana. In attesa di conferma da Laura.

---

## Checklist implementazione
- [ ] 1. Sezione Formazione: eyebrow "FORMAZIONE" + titolo "CONTINUA" *(interpretazione da confermare)*
- [ ] 2. Pricing: piano 249 → bottone "ACQUISTA" verso registrazione azienda (target blank)
- [ ] 3. Contatore annunci: nessuna modifica — rispondere a Laura che è dinamico da scraper
- [ ] 4. Pagina Contatti: sezione candidati + sezione aziende + form con campo "Oggetto"
- [ ] 4b. Chiavi i18n nuove per la pagina Contatti (IT reale, EN/DE/FR almeno placeholder tracciati)
- [ ] Chiedere a Laura i valori del menu a tendina "Argomento"
- [ ] Chiarire ruolo dei link arca24 rispetto agli scraper jobroom
- [ ] Confermare a Laura "ci sono con tutto" → sblocca il suo check finale

## Ordine di lavoro consigliato
1. Punto 1 (una `SectionTitle`, 2 minuti)
2. Punto 2 (dati piano + href, ~15 minuti)
3. Punto 4 (riscrittura Contatti, il grosso del lavoro)
4. Risposta mail con la spiegazione del punto 3 + le due domande aperte
