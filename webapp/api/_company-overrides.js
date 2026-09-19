/**
 * Hand-written company fill-ins, keyed by company `id` (string). Read only by
 * `applyOverrides()` in company-detail.js.
 *
 * - `about`: 2-3 neutral Italian sentences shown in the "Chi è" block. Drafted once
 *   offline from the company's own public site (rewritten, facts only from that site),
 *   reviewed by a person, then committed as static text. Never generated at build or
 *   request time, never fetched at runtime (reliability budget; see DESIGN-LOG.md
 *   2026-09-19 entries). Add or edit entries by hand.
 * - `website`: gap-fill only, used when Arca24 provides none; a real value wins.
 */
export const overrides = {
  // 4 U Consulting
  "3243389": { about: "4 U Consulting (For You Consulting) opera nei processi di recruiting. Dichiara come valori qualità, serietà, concretezza e trasparenza, con rispetto per tutte le persone coinvolte." },
  // Adecco
  "3244683": { about: "Adecco Svizzera è un'agenzia per il lavoro che offre servizi di selezione e reclutamento del personale. Mette in contatto chi cerca impiego con le aziende in cerca di talenti, tramite un'ampia rete e servizi specializzati." },
  // Approach People Recruitment
  "3244226": { about: "Approach People Recruitment è un'agenzia di reclutamento internazionale. Seleziona dirigenti e personale qualificato multilingue per aziende in Francia e in Europa." },
  // Arca24.com SA
  "2443186": { about: "Arca24 sviluppa software HR in cloud per agenzie di lavoro, grandi aziende e PMI: sistemi per la gestione delle candidature (ATS), CRM e onboarding." },
  // ated - associazione ticinese evoluzione digitale
  "3244794": { about: "Ated è l'associazione ticinese per l'evoluzione digitale. Promuove la formazione alla tecnologia e le sinergie tra i soggetti del territorio, per sostenere progetti innovativi nel cantone." },
  // Banca Credinvest SA
  "3244799": { about: "Banca Credinvest è una banca svizzera indipendente. È specializzata in gestione patrimoniale e private banking, e offre servizi di investimento anche a clientela istituzionale." },
  // Blackpoints SA
  "2774806": { about: "Blackpoints è un'azienda specializzata in IT business e software engineering, con sedi in Ticino e a Zurigo." },
  // Business Learning Centre SA
  "3244816": { about: "Business Learning Centre (BLC) organizza corsi di formazione per aziende e professionisti in Ticino: lingue, intelligenza artificiale, gestione delle micro-crisi e contabilità. Attivo dal 2007." },
  // DasTeam
  "3244464": { about: "Das Team AG è un'agenzia per il lavoro che propone impieghi temporanei e posizioni fisse. Opera in vari ambiti, in particolare tecnico-artigianale, edilizia e finiture, facility management e sanità." },
  // E-Work Sagl
  "3244738": { about: "E-Work è un'agenzia che propone personale qualificato a tempo determinato alle aziende e opportunità di impiego temporaneo ai professionisti. Il sito la presenta come una soluzione flessibile per entrambi." },
  // ER Services Sagl
  "3243694": { about: "ER Services si occupa di ricerca e selezione del personale in Svizzera e di reclutamento globale. Offre inoltre servizi di ingegneria e contracting." },
  // Gi Group SA
  "3244630": { about: "Gi Group Switzerland è un'agenzia per il lavoro che propone soluzioni di selezione e gestione del personale su misura per le aziende." },
  // Grafton Recruitment
  "3244786": { about: "Grafton Switzerland è un'agenzia di reclutamento e consulenza HR. Mette in contatto le aziende con candidati qualificati in diversi settori e aiuta chi cerca lavoro a trovare nuovi ruoli." },
  // JARM Technologies SA.
  "3243674": { about: "JARM Technologies SA, con sede a Cadro (Svizzera), è titolare del marchio e del sito Challenge Tires, che propone pneumatici artigianali (handmade) per bici da strada, gravel e ciclocross." },
  // Lares Sagl
  "3244801": { about: "Lares Sagl offre alle aziende un supporto concreto in consulenza commerciale, organizzativa e risorse umane." },
  // Manpower
  "3244661": { about: "Manpower è un'agenzia per il lavoro attiva in Svizzera nel collocamento di personale fisso e temporaneo. Sul sito raccoglie offerte per città, settore e profilo professionale." },
  // Michael Bailey Associates
  "3244246": { about: "Michael Bailey Associates opera da oltre trent'anni in consulenza e reclutamento per clienti internazionali. Settori: IT e tecnologia, life sciences, finanza, energia e rinnovabili." },
  // Novametal SA
  "3244672": { about: "Novametal produce fili in acciaio inox, alluminio, nichel, rame e titanio per saldatura e applicazioni meccaniche." },
  // PKB Private Bank SA
  "3244624": { about: "PKB è una banca privata svizzera attiva nella gestione patrimoniale e negli investimenti, con sedi a Lugano, Zurigo e Ginevra." },
  // Randstad Svizzera SA
  "3244729": { about: "Randstad Svizzera SA offre servizi di collocamento e gestione del personale, per posizioni sia temporanee sia permanenti. Opera a livello regionale, nazionale e internazionale." },
  // Rapelli - ORIOR Food AG
  "3244679": { about: "Rapelli produce specialità di salumeria del Ticino. I suoi Mastri Salumieri seguono le ricette tramandate da Mario Rapelli di generazione in generazione. Fa parte di ORIOR Food AG." },
  // S & M beauty SA
  "3243652": { about: "S & M beauty SA è collegata al salone DESSANGE di Lugano, che offre servizi di taglio, colore, trattamenti, make-up ed estetica per donna e uomo." },
  // Sormani Servizi Sagl
  "3244775": { about: "Sandro Sormani SA si occupa di pittura, verniciatura, decorazioni, resina, restauro e isolazione termica. Sul sito mette al centro i valori che guidano l'azienda, oltre alla qualità dei lavori." },
  // TEQ SA
  "3228599": { about: "TEQ sviluppa elettronica per il settore automotive, sistemi di trasporto intelligenti (ITS), gestione flotte e automazione." },
  // Variosystems AG
  "3244552": { about: "Variosystems è un'azienda di servizi di produzione elettronica (EMS). Segue i clienti dalla progettazione alla produzione e al supporto lungo il ciclo di vita del prodotto." },
  // Work & Work SA
  "3174540": { about: "Work&Work SA offre consulenza nel collocamento temporaneo e permanente, a disposizione di chi cerca lavoro e di chi cerca personale qualificato." },
  // Work Selection AG
  "3243557": { about: "Work Selection AG è un'agenzia svizzera di collocamento e lavoro temporaneo. Copre settori come industria, edilizia, IT, farmaceutico e logistica." },
  // WWF Svizzera
  "3243415": { about: "WWF Svizzera fa parte della rete del World Wide Fund for Nature, organizzazione ambientalista attiva in oltre 100 Paesi. Si impegna per la tutela della natura e dell'ambiente." },
};
