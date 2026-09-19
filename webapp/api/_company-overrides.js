/**
 * Hand-written company fill-ins, keyed by company `id` (string). Read only by
 * `applyOverrides()` in company-detail.js.
 *
 * - `about`: `{ it, en, de, fr }`, 2-3 neutral sentences shown in the "Chi è" block
 *   (the Italian one is also what the server-rendered snapshot uses; a missing language
 *   falls back to Italian on the page). Drafted once
 *   offline from the company's own public site (rewritten, facts only from that site),
 *   reviewed by a person, then committed as static text. Never generated at build or
 *   request time, never fetched at runtime (reliability budget; see DESIGN-LOG.md
 *   2026-09-19 entries). Add or edit entries by hand.
 * - `website`: gap-fill only, used when Arca24 provides none; a real value wins.
 */
export const overrides = {
  // Arca24.com SA
  "2443186": {
    about: {
      it: "Arca24 sviluppa software HR in cloud per agenzie di lavoro, grandi aziende e PMI: sistemi per la gestione delle candidature (ATS), CRM e onboarding.",
      en: "Arca24 develops cloud HR software for staffing agencies, large companies and SMEs: applicant tracking systems (ATS), CRM and onboarding.",
      de: "Arca24 entwickelt Cloud-HR-Software für Personalagenturen, Grossunternehmen und KMU: Bewerbermanagement (ATS), CRM und Onboarding.",
      fr: "Arca24 développe des logiciels RH en cloud pour les agences de placement, les grandes entreprises et les PME : gestion des candidatures (ATS), CRM et onboarding.",
    },
  },
  // Blackpoints SA
  "2774806": {
    about: {
      it: "Blackpoints è un'azienda specializzata in IT business e software engineering, con sedi in Ticino e a Zurigo.",
      en: "Blackpoints is a company specialised in IT business and software engineering, with offices in Ticino and Zurich.",
      de: "Blackpoints ist ein auf IT-Business und Software Engineering spezialisiertes Unternehmen mit Standorten im Tessin und in Zürich.",
      fr: "Blackpoints est une entreprise spécialisée dans l'IT business et le software engineering, avec des sites au Tessin et à Zurich.",
    },
  },
  // Work & Work SA
  "3174540": {
    about: {
      it: "Work&Work SA offre consulenza nel collocamento temporaneo e permanente, a disposizione di chi cerca lavoro e di chi cerca personale qualificato.",
      en: "Work&Work SA offers consulting in temporary and permanent placement, at the disposal of both job seekers and those looking for qualified staff.",
      de: "Die Work&Work SA bietet Beratung in der temporären und permanenten Vermittlung, für Stellensuchende ebenso wie für Unternehmen auf der Suche nach qualifiziertem Personal.",
      fr: "Work&Work SA offre du conseil en placement temporaire et permanent, à la disposition de celles et ceux qui cherchent un emploi comme de celles et ceux qui cherchent du personnel qualifié.",
    },
  },
  // TEQ SA
  "3228599": {
    about: {
      it: "TEQ sviluppa elettronica per il settore automotive, sistemi di trasporto intelligenti (ITS), gestione flotte e automazione.",
      en: "TEQ develops electronics for the automotive sector, intelligent transport systems (ITS), fleet management and automation.",
      de: "TEQ entwickelt Elektronik für die Automobilbranche, intelligente Verkehrssysteme (ITS), Flottenmanagement und Automatisierung.",
      fr: "TEQ développe de l'électronique pour le secteur automobile, des systèmes de transport intelligents (ITS), la gestion de flottes et l'automatisation.",
    },
  },
  // 4 U Consulting
  "3243389": {
    about: {
      it: "4 U Consulting (For You Consulting) opera nei processi di recruiting. Dichiara come valori qualità, serietà, concretezza e trasparenza, con rispetto per tutte le persone coinvolte.",
      en: "4 U Consulting (For You Consulting) works in recruiting. It states quality, seriousness, concreteness and transparency as its values, with respect for everyone involved.",
      de: "4 U Consulting (For You Consulting) ist im Recruiting tätig. Als Werte nennt das Unternehmen Qualität, Seriosität, Konkretheit und Transparenz sowie Respekt gegenüber allen Beteiligten.",
      fr: "4 U Consulting (For You Consulting) intervient dans les processus de recrutement. Elle affiche pour valeurs la qualité, le sérieux, la concrétude et la transparence, dans le respect de toutes les personnes concernées.",
    },
  },
  // WWF Svizzera
  "3243415": {
    about: {
      it: "WWF Svizzera fa parte della rete del World Wide Fund for Nature, organizzazione ambientalista attiva in oltre 100 Paesi. Si impegna per la tutela della natura e dell'ambiente.",
      en: "WWF Switzerland is part of the World Wide Fund for Nature network, an environmental organisation active in over 100 countries. It works to protect nature and the environment.",
      de: "WWF Schweiz gehört zum Netzwerk des World Wide Fund for Nature, einer Umweltschutzorganisation, die in über 100 Ländern aktiv ist. Sie setzt sich für den Schutz von Natur und Umwelt ein.",
      fr: "WWF Suisse fait partie du réseau du World Wide Fund for Nature, organisation environnementale active dans plus de 100 pays. Il s'engage pour la protection de la nature et de l'environnement.",
    },
  },
  // Work Selection AG
  "3243557": {
    about: {
      it: "Work Selection AG è un'agenzia svizzera di collocamento e lavoro temporaneo. Copre settori come industria, edilizia, IT, farmaceutico e logistica.",
      en: "Work Selection AG is a Swiss placement and temporary work agency. It covers sectors such as industry, construction, IT, pharmaceuticals and logistics.",
      de: "Die Work Selection AG ist eine Schweizer Agentur für Personalvermittlung und Temporärarbeit. Sie deckt Branchen wie Industrie, Bau, IT, Pharma und Logistik ab.",
      fr: "Work Selection AG est une agence suisse de placement et de travail temporaire. Elle couvre des secteurs tels que l'industrie, la construction, l'informatique, la pharmacie et la logistique.",
    },
  },
  // S & M beauty SA
  "3243652": {
    about: {
      it: "S & M beauty SA è collegata al salone DESSANGE di Lugano, che offre servizi di taglio, colore, trattamenti, make-up ed estetica per donna e uomo.",
      en: "S & M beauty SA is linked to the DESSANGE salon in Lugano, which offers cutting, colouring, treatments, make-up and beauty services for women and men.",
      de: "S & M beauty SA ist mit dem DESSANGE-Salon in Lugano verbunden, der Haarschnitt, Colorationen, Pflegebehandlungen, Make-up und Kosmetik für Damen und Herren anbietet.",
      fr: "S & M beauty SA est liée au salon DESSANGE de Lugano, qui propose coupe, coloration, soins, maquillage et services d'esthétique pour femmes et hommes.",
    },
  },
  // JARM Technologies SA.
  "3243674": {
    about: {
      it: "JARM Technologies SA, con sede a Cadro (Svizzera), è titolare del marchio e del sito Challenge Tires, che propone pneumatici artigianali (handmade) per bici da strada, gravel e ciclocross.",
      en: "JARM Technologies SA, based in Cadro (Switzerland), owns the Challenge Tires brand and website, which offers handmade tyres for road, gravel and cyclocross bikes.",
      de: "Die JARM Technologies SA mit Sitz in Cadro (Schweiz) ist Inhaberin der Marke und der Website Challenge Tires, die handgefertigte Reifen für Rennrad, Gravel und Cyclocross anbietet.",
      fr: "JARM Technologies SA, basée à Cadro (Suisse), est titulaire de la marque et du site Challenge Tires, qui propose des pneus artisanaux (handmade) pour vélos de route, gravel et cyclo-cross.",
    },
  },
  // ER Services Sagl
  "3243694": {
    about: {
      it: "ER Services si occupa di ricerca e selezione del personale in Svizzera e di reclutamento globale. Offre inoltre servizi di ingegneria e contracting.",
      en: "ER Services handles personnel search and selection in Switzerland and global recruitment. It also offers engineering and contracting services.",
      de: "ER Services ist in der Personalsuche und -auswahl in der Schweiz sowie in der globalen Rekrutierung tätig. Zudem bietet sie Engineering- und Contracting-Dienstleistungen an.",
      fr: "ER Services s'occupe de la recherche et de la sélection de personnel en Suisse ainsi que du recrutement à l'échelle mondiale. Elle propose aussi des services d'ingénierie et de contracting.",
    },
  },
  // Approach People Recruitment
  "3244226": {
    about: {
      it: "Approach People Recruitment è un'agenzia di reclutamento internazionale. Seleziona dirigenti e personale qualificato multilingue per aziende in Francia e in Europa.",
      en: "Approach People Recruitment is an international recruitment agency. It selects executives and qualified multilingual staff for companies in France and across Europe.",
      de: "Approach People Recruitment ist eine internationale Personalvermittlung. Sie vermittelt Führungskräfte und qualifizierte mehrsprachige Fachkräfte an Unternehmen in Frankreich und ganz Europa.",
      fr: "Approach People Recruitment est une agence de recrutement internationale. Elle sélectionne des cadres dirigeants et du personnel qualifié multilingue pour des entreprises en France et en Europe.",
    },
  },
  // Michael Bailey Associates
  "3244246": {
    about: {
      it: "Michael Bailey Associates opera da oltre trent'anni in consulenza e reclutamento per clienti internazionali. Settori: IT e tecnologia, life sciences, finanza, energia e rinnovabili.",
      en: "Michael Bailey Associates has worked for over thirty years in consulting and recruitment for international clients. Sectors: IT and technology, life sciences, finance, energy and renewables.",
      de: "Michael Bailey Associates ist seit über dreissig Jahren in Beratung und Rekrutierung für internationale Kunden tätig. Branchen: IT und Technologie, Life Sciences, Finanzen, Energie und erneuerbare Energien.",
      fr: "Michael Bailey Associates travaille depuis plus de trente ans dans le conseil et le recrutement pour une clientèle internationale. Secteurs : IT et technologie, sciences de la vie, finance, énergie et énergies renouvelables.",
    },
  },
  // DasTeam
  "3244464": {
    about: {
      it: "Das Team AG è un'agenzia per il lavoro che propone impieghi temporanei e posizioni fisse. Opera in vari ambiti, in particolare tecnico-artigianale, edilizia e finiture, facility management e sanità.",
      en: "Das Team AG is an employment agency offering temporary jobs and permanent positions. It works across several fields, in particular technical trades, construction and finishing, facility management and healthcare.",
      de: "Die das team ag ist ein Personaldienstleister für temporäre Einsätze und Festanstellungen. Sie ist in verschiedenen Bereichen tätig, insbesondere im technisch-handwerklichen Bereich, im Bau und Ausbau, im Facility Management und im Gesundheitswesen.",
      fr: "Das Team AG est une agence pour l'emploi qui propose des missions temporaires et des postes fixes. Elle intervient dans plusieurs domaines, notamment technique et artisanal, construction et finitions, facility management et santé.",
    },
  },
  // Variosystems AG
  "3244552": {
    about: {
      it: "Variosystems è un'azienda di servizi di produzione elettronica (EMS). Segue i clienti dalla progettazione alla produzione e al supporto lungo il ciclo di vita del prodotto.",
      en: "Variosystems is an electronics manufacturing services (EMS) company. It supports customers from design through production to lifecycle support of the product.",
      de: "Variosystems ist ein Unternehmen für Electronics Manufacturing Services (EMS). Es begleitet Kunden von der Entwicklung über die Produktion bis zur Unterstützung über den gesamten Produktlebenszyklus.",
      fr: "Variosystems est une entreprise de services de fabrication électronique (EMS). Elle accompagne ses clients de la conception à la production, puis tout au long du cycle de vie du produit.",
    },
  },
  // PKB Private Bank SA
  "3244624": {
    about: {
      it: "PKB è una banca privata svizzera attiva nella gestione patrimoniale e negli investimenti, con sedi a Lugano, Zurigo e Ginevra.",
      en: "PKB is a Swiss private bank active in wealth management and investments, with offices in Lugano, Zurich and Geneva.",
      de: "PKB ist eine Schweizer Privatbank, die in der Vermögensverwaltung und im Anlagegeschäft tätig ist, mit Standorten in Lugano, Zürich und Genf.",
      fr: "PKB est une banque privée suisse active dans la gestion de patrimoine et les investissements, avec des sites à Lugano, Zurich et Genève.",
    },
  },
  // Gi Group SA
  "3244630": {
    about: {
      it: "Gi Group Switzerland è un'agenzia per il lavoro che propone soluzioni di selezione e gestione del personale su misura per le aziende.",
      en: "Gi Group Switzerland is an employment agency offering tailored personnel selection and HR solutions for companies.",
      de: "Gi Group Switzerland ist eine Personaldienstleisterin mit massgeschneiderten Lösungen für Personalauswahl und Personalmanagement für Unternehmen.",
      fr: "Gi Group Switzerland est une agence pour l'emploi qui propose aux entreprises des solutions sur mesure de sélection et de gestion du personnel.",
    },
  },
  // Manpower
  "3244661": {
    about: {
      it: "Manpower è un'agenzia per il lavoro attiva in Svizzera nel collocamento di personale fisso e temporaneo. Sul sito raccoglie offerte per città, settore e profilo professionale.",
      en: "Manpower is an employment agency active in Switzerland, placing permanent and temporary staff. Its website collects job offers by city, sector and professional profile.",
      de: "Manpower ist eine in der Schweiz tätige Personaldienstleisterin für die Vermittlung von Festangestellten und Temporärpersonal. Auf ihrer Website sammelt sie Stellenangebote nach Ort, Branche und Berufsprofil.",
      fr: "Manpower est une agence pour l'emploi active en Suisse, qui place du personnel fixe et temporaire. Son site rassemble des offres d'emploi par ville, secteur et profil professionnel.",
    },
  },
  // Novametal SA
  "3244672": {
    about: {
      it: "Novametal produce fili in acciaio inox, alluminio, nichel, rame e titanio per saldatura e applicazioni meccaniche.",
      en: "Novametal produces stainless steel, aluminium, nickel, copper and titanium wire for welding and mechanical applications.",
      de: "Novametal stellt Drähte aus Edelstahl, Aluminium, Nickel, Kupfer und Titan für Schweiss- und mechanische Anwendungen her.",
      fr: "Novametal produit des fils en acier inoxydable, aluminium, nickel, cuivre et titane pour le soudage et les applications mécaniques.",
    },
  },
  // Rapelli - ORIOR Food AG
  "3244679": {
    about: {
      it: "Rapelli produce specialità di salumeria del Ticino. I suoi Mastri Salumieri seguono le ricette tramandate da Mario Rapelli di generazione in generazione. Fa parte di ORIOR Food AG.",
      en: "Rapelli produces cured-meat specialities from Ticino. Its Mastri Salumieri (master charcutiers) follow recipes handed down by Mario Rapelli from generation to generation. It is part of ORIOR Food AG.",
      de: "Rapelli stellt Wurstspezialitäten aus dem Tessin her. Die Mastri Salumieri folgen den Rezepten, die Mario Rapelli von Generation zu Generation weitergegeben hat. Das Unternehmen gehört zu ORIOR Food AG.",
      fr: "Rapelli produit des spécialités de charcuterie du Tessin. Ses Mastri Salumieri suivent les recettes transmises par Mario Rapelli de génération en génération. Elle fait partie d'ORIOR Food AG.",
    },
  },
  // Adecco
  "3244683": {
    about: {
      it: "Adecco Svizzera è un'agenzia per il lavoro che offre servizi di selezione e reclutamento del personale. Mette in contatto chi cerca impiego con le aziende in cerca di talenti, tramite un'ampia rete e servizi specializzati.",
      en: "Adecco Switzerland is an employment agency offering personnel selection and recruitment services. It connects job seekers with companies looking for talent, through a broad network and specialised services.",
      de: "Adecco Schweiz ist eine Personaldienstleisterin mit Angeboten in Personalauswahl und Rekrutierung. Sie bringt Stellensuchende und Unternehmen auf der Suche nach Fachkräften zusammen, über ein breites Netzwerk und spezialisierte Dienstleistungen.",
      fr: "Adecco Suisse est une agence pour l'emploi qui propose des services de sélection et de recrutement de personnel. Elle met en relation les personnes en recherche d'emploi et les entreprises à la recherche de talents, grâce à un large réseau et à des services spécialisés.",
    },
  },
  // Randstad Svizzera SA
  "3244729": {
    about: {
      it: "Randstad Svizzera SA offre servizi di collocamento e gestione del personale, per posizioni sia temporanee sia permanenti. Opera a livello regionale, nazionale e internazionale.",
      en: "Randstad Switzerland SA offers placement and personnel management services, for both temporary and permanent positions. It operates at regional, national and international level.",
      de: "Randstad Schweiz SA bietet Dienstleistungen in der Personalvermittlung und im Personalmanagement für temporäre wie permanente Stellen an. Sie ist auf regionaler, nationaler und internationaler Ebene tätig.",
      fr: "Randstad Suisse SA propose des services de placement et de gestion du personnel, pour des postes tant temporaires que permanents. Elle opère au niveau régional, national et international.",
    },
  },
  // E-Work Sagl
  "3244738": {
    about: {
      it: "E-Work è un'agenzia che propone personale qualificato a tempo determinato alle aziende e opportunità di impiego temporaneo ai professionisti. Il sito la presenta come una soluzione flessibile per entrambi.",
      en: "E-Work is an agency that offers qualified fixed-term staff to companies and temporary work opportunities to professionals. Its website presents it as a flexible solution for both.",
      de: "E-Work ist eine Agentur, die Unternehmen qualifiziertes Personal auf Zeit und Fachleuten temporäre Einsatzmöglichkeiten vermittelt. Die Website stellt sie als flexible Lösung für beide Seiten dar.",
      fr: "E-Work est une agence qui propose du personnel qualifié à durée déterminée aux entreprises et des opportunités de travail temporaire aux professionnels. Son site la présente comme une solution flexible pour les deux parties.",
    },
  },
  // Sormani Servizi Sagl
  "3244775": {
    about: {
      it: "Sandro Sormani SA si occupa di pittura, verniciatura, decorazioni, resina, restauro e isolazione termica. Sul sito mette al centro i valori che guidano l'azienda, oltre alla qualità dei lavori.",
      en: "Sandro Sormani SA works in painting, varnishing, decoration, resin, restoration and thermal insulation. Its website puts the values that guide the company at the centre, alongside the quality of its work.",
      de: "Die Sandro Sormani SA ist in den Bereichen Malerei, Lackierung, Dekoration, Harzbeschichtung, Restaurierung und Wärmedämmung tätig. Auf ihrer Website stellt sie neben der Qualität der Arbeiten die Werte in den Mittelpunkt, die das Unternehmen leiten.",
      fr: "Sandro Sormani SA intervient dans la peinture, le vernissage, la décoration, la résine, la restauration et l'isolation thermique. Son site met en avant les valeurs qui guident l'entreprise, en plus de la qualité des travaux.",
    },
  },
  // Grafton Recruitment
  "3244786": {
    about: {
      it: "Grafton Switzerland è un'agenzia di reclutamento e consulenza HR. Mette in contatto le aziende con candidati qualificati in diversi settori e aiuta chi cerca lavoro a trovare nuovi ruoli.",
      en: "Grafton Switzerland is a recruitment and HR consulting agency. It connects companies with qualified candidates across various sectors and helps job seekers find new roles.",
      de: "Grafton Switzerland ist eine Agentur für Personalvermittlung und HR-Beratung. Sie bringt Unternehmen mit qualifizierten Kandidatinnen und Kandidaten aus verschiedenen Branchen zusammen und unterstützt Stellensuchende bei der Suche nach neuen Positionen.",
      fr: "Grafton Switzerland est une agence de recrutement et de conseil RH. Elle met en relation les entreprises avec des candidats qualifiés dans différents secteurs et aide les personnes en recherche d'emploi à trouver de nouveaux postes.",
    },
  },
  // ated - associazione ticinese evoluzione digitale
  "3244794": {
    about: {
      it: "Ated è l'associazione ticinese per l'evoluzione digitale. Promuove la formazione alla tecnologia e le sinergie tra i soggetti del territorio, per sostenere progetti innovativi nel cantone.",
      en: "Ated is the Ticino association for digital evolution. It promotes technology training and synergies among local players, to support innovative projects in the canton.",
      de: "Ated ist der Tessiner Verband für digitale Entwicklung. Er fördert die Ausbildung im Technologiebereich und Synergien zwischen den Akteuren vor Ort, um innovative Projekte im Kanton zu unterstützen.",
      fr: "Ated est l'association tessinoise pour l'évolution numérique. Elle promeut la formation à la technologie et les synergies entre les acteurs du territoire, afin de soutenir des projets innovants dans le canton.",
    },
  },
  // Banca Credinvest SA
  "3244799": {
    about: {
      it: "Banca Credinvest è una banca svizzera indipendente. È specializzata in gestione patrimoniale e private banking, e offre servizi di investimento anche a clientela istituzionale.",
      en: "Banca Credinvest is an independent Swiss bank. It specialises in wealth management and private banking, and also offers investment services to institutional clients.",
      de: "Banca Credinvest ist eine unabhängige Schweizer Bank. Sie ist auf Vermögensverwaltung und Private Banking spezialisiert und bietet auch institutionellen Kunden Anlagedienstleistungen an.",
      fr: "Banca Credinvest est une banque suisse indépendante. Elle est spécialisée dans la gestion de patrimoine et le private banking, et propose également des services d'investissement à une clientèle institutionnelle.",
    },
  },
  // Lares Sagl
  "3244801": {
    about: {
      it: "Lares Sagl offre alle aziende un supporto concreto in consulenza commerciale, organizzativa e risorse umane.",
      en: "Lares Sagl offers companies practical support in commercial and organisational consulting and human resources.",
      de: "Die Lares Sagl unterstützt Unternehmen konkret in der Handels- und Organisationsberatung sowie im Personalwesen.",
      fr: "Lares Sagl offre aux entreprises un soutien concret en matière de conseil commercial, organisationnel et de ressources humaines.",
    },
  },
  // Business Learning Centre SA
  "3244816": {
    about: {
      it: "Business Learning Centre (BLC) organizza corsi di formazione per aziende e professionisti in Ticino: lingue, intelligenza artificiale, gestione delle micro-crisi e contabilità. Attivo dal 2007.",
      en: "Business Learning Centre (BLC) runs training courses for companies and professionals in Ticino: languages, artificial intelligence, micro-crisis management and accounting. Active since 2007.",
      de: "Das Business Learning Centre (BLC) bietet im Tessin Weiterbildungskurse für Unternehmen und Fachleute an: Sprachen, künstliche Intelligenz, Mikrokrisenmanagement und Buchhaltung. Seit 2007 aktiv.",
      fr: "Business Learning Centre (BLC) organise des formations pour les entreprises et les professionnels au Tessin : langues, intelligence artificielle, gestion des micro-crises et comptabilité. Actif depuis 2007.",
    },
  },
};
