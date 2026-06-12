// Indice leggero per card, sidebar e slug-resolver. NON importa i body articolo.
const IT = [
  {
    slug: 'come-trovare-lavoro-guida-pratica',
    category: 'carriera',
    title: 'Come trovare lavoro: guida pratica per candidati',
    abstract: 'Trovare lavoro non significa semplicemente inviare curriculum. Eppure molte persone affrontano la ricerca in questo modo.',
    readingTime: 7,
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&q=80',
  },
  {
    slug: 'come-scrivere-un-cv-che-ottiene-colloqui',
    category: 'carriera',
    title: 'Come scrivere un CV che ottiene colloqui',
    abstract: 'Il curriculum vitae continua a essere il documento più importante dell\'intero processo di candidatura. Puoi avere esperienza, competenze solide e ottime referenze, ma se il tuo CV non riesce a comunicare rapidamente il tuo valore professionale rischi di non arrivare nemmeno alla fase del colloquio.',
    readingTime: 8,
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&q=80',
  },
  {
    slug: 'come-affrontare-un-colloquio-di-lavoro',
    category: 'carriera',
    title: 'Come affrontare un colloquio di lavoro con successo',
    abstract: 'Hai inviato il curriculum. Hai ricevuto una risposta positiva.',
    readingTime: 8,
    image: 'https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=1200&q=80',
  },
  {
    slug: 'perche-non-ricevi-risposte-alle-candidature',
    category: 'carriera',
    title: 'Perché non ricevi risposte alle candidature?',
    abstract: 'Hai aggiornato il curriculum. Hai inviato diverse candidature.',
    readingTime: 7,
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80',
  },
  {
    slug: 'settori-con-piu-opportunita-di-lavoro',
    category: 'carriera',
    title: 'I settori con più opportunità di lavoro oggi',
    abstract: 'Il mercato del lavoro è in continua evoluzione. Alcune professioni crescono rapidamente, altre si trasformano.',
    readingTime: 7,
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80',
  },
  {
    slug: 'come-scrivere-un-annuncio-di-lavoro-efficace',
    category: 'recruiting',
    title: 'Come scrivere un annuncio di lavoro efficace',
    abstract: 'Molte aziende pensano che pubblicare un annuncio di lavoro sia un\'attività semplice. Si definisce una posizione.',
    readingTime: 8,
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80',
  },
  {
    slug: 'perche-non-ricevi-candidature-qualificate',
    category: 'recruiting',
    title: 'Perché non ricevi candidature qualificate?',
    abstract: 'Molte aziende si trovano nella stessa situazione. Pubblicano un\'offerta di lavoro.',
    readingTime: 7,
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80',
  },
  {
    slug: 'come-ridurre-i-tempi-di-assunzione',
    category: 'recruiting',
    title: 'Come ridurre i tempi di assunzione',
    abstract: 'Molte aziende si concentrano su un obiettivo: trovare la persona giusta. È una priorità comprensibile, tuttavia esiste un altro fattore che spesso viene sottovalutato: la velocità.',
    readingTime: 7,
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1200&q=80',
  },
  {
    slug: 'employer-branding-pmi-guida-pratica',
    category: 'recruiting',
    title: 'Employer Branding per PMI: guida pratica',
    abstract: 'Quando si parla di employer branding, molte PMI pensano immediatamente a grandi aziende con budget importanti, campagne di comunicazione elaborate e team HR strutturati. È una percezione comprensibile.',
    readingTime: 7,
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80',
  },
  {
    slug: 'perche-i-candidati-scelgono-alcune-aziende',
    category: 'recruiting',
    title: 'Perché i candidati scelgono alcune aziende e non altre',
    abstract: 'Due aziende pubblicano un\'offerta per una posizione simile. Entrambe cercano una persona competente.',
    readingTime: 8,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80',
  },
];

const EN = [
  {
    slug: 'how-to-find-a-job-practical-guide',
    category: 'carriera',
    title: 'How to Find a Job: A Practical Guide for Candidates',
    abstract: 'Finding a job isn\'t just about sending out CVs. Yet many people approach the job search this way.',
    readingTime: 7,
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&q=80',
  },
  {
    slug: 'how-to-write-a-cv-that-gets-interviews',
    category: 'carriera',
    title: 'How to Write a CV That Gets Interviews',
    abstract: 'The CV remains the most important document in the entire application process. You can have experience, solid skills and great references, but if your CV doesn\'t quickly communicate your professional value, you risk never reaching the interview stage.',
    readingTime: 8,
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&q=80',
  },
  {
    slug: 'how-to-succeed-in-a-job-interview',
    category: 'carriera',
    title: 'How to Succeed in a Job Interview',
    abstract: 'You sent your CV. You got a positive response.',
    readingTime: 8,
    image: 'https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=1200&q=80',
  },
  {
    slug: 'why-youre-not-getting-responses-to-job-applications',
    category: 'carriera',
    title: 'Why Aren\'t You Getting Responses to Your Job Applications?',
    abstract: 'You\'ve updated your CV. You\'ve sent out several applications.',
    readingTime: 7,
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80',
  },
  {
    slug: 'industries-with-the-most-job-opportunities',
    category: 'carriera',
    title: 'The Industries With the Most Job Opportunities Today',
    abstract: 'The job market is constantly evolving. Some professions are growing quickly, others are transforming.',
    readingTime: 7,
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80',
  },
  {
    slug: 'how-to-write-an-effective-job-ad',
    category: 'recruiting',
    title: 'How to Write an Effective Job Ad',
    abstract: 'Many companies think publishing a job ad is a simple task. You define a position.',
    readingTime: 8,
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80',
  },
  {
    slug: 'why-youre-not-getting-qualified-applications',
    category: 'recruiting',
    title: 'Why Aren\'t You Getting Qualified Applications?',
    abstract: 'Many companies find themselves in the same situation. They post a job ad.',
    readingTime: 7,
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80',
  },
  {
    slug: 'how-to-reduce-time-to-hire',
    category: 'recruiting',
    title: 'How to Reduce Time-to-Hire',
    abstract: 'Many companies focus on a single goal: finding the right person. It\'s an understandable priority, yet there\'s another factor that is often underestimated: speed.',
    readingTime: 7,
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1200&q=80',
  },
  {
    slug: 'employer-branding-for-smes-practical-guide',
    category: 'recruiting',
    title: 'Employer Branding for SMEs: A Practical Guide',
    abstract: 'When people talk about employer branding, many SMEs immediately think of large companies with big budgets, elaborate communication campaigns and structured HR teams. That\'s an understandable perception.',
    readingTime: 7,
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80',
  },
  {
    slug: 'why-candidates-choose-some-companies-over-others',
    category: 'recruiting',
    title: 'Why Candidates Choose Some Companies and Not Others',
    abstract: 'Two companies post a job ad for a similar position. Both are looking for a skilled person.',
    readingTime: 8,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80',
  },
];

const DE = [
  {
    slug: 'arbeit-finden-praktischer-leitfaden',
    category: 'carriera',
    title: 'Wie Sie Arbeit finden: praktischer Leitfaden für Kandidaten',
    abstract: 'Arbeit zu finden bedeutet nicht einfach, Lebensläufe zu versenden. Dennoch gehen viele Menschen die Suche so an.',
    readingTime: 7,
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&q=80',
  },
  {
    slug: 'lebenslauf-schreiben-der-zum-vorstellungsgespraech-fuehrt',
    category: 'carriera',
    title: 'Wie Sie einen Lebenslauf schreiben, der zum Vorstellungsgespräch führt',
    abstract: 'Der Lebenslauf bleibt das wichtigste Dokument im gesamten Bewerbungsprozess. Sie können Erfahrung, solide Kompetenzen und ausgezeichnete Referenzen haben, aber wenn Ihr Lebenslauf Ihren beruflichen Wert nicht schnell vermittelt, riskieren Sie, nicht einmal zur Phase des Vorstellungsgesprächs zu gelangen.',
    readingTime: 8,
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&q=80',
  },
  {
    slug: 'vorstellungsgespraech-erfolgreich-meistern',
    category: 'carriera',
    title: 'Wie Sie ein Vorstellungsgespräch erfolgreich meistern',
    abstract: 'Sie haben den Lebenslauf eingereicht. Sie haben eine positive Antwort erhalten.',
    readingTime: 8,
    image: 'https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=1200&q=80',
  },
  {
    slug: 'warum-sie-keine-antworten-auf-bewerbungen-erhalten',
    category: 'carriera',
    title: 'Warum erhalten Sie keine Antworten auf Bewerbungen?',
    abstract: 'Sie haben Ihren Lebenslauf aktualisiert. Sie haben mehrere Bewerbungen versandt.',
    readingTime: 7,
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80',
  },
  {
    slug: 'branchen-mit-den-meisten-jobmoeglichkeiten',
    category: 'carriera',
    title: 'Die Branchen mit den meisten Jobmöglichkeiten heute',
    abstract: 'Der Arbeitsmarkt befindet sich im stetigen Wandel. Manche Berufe wachsen schnell, andere verändern sich.',
    readingTime: 7,
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80',
  },
  {
    slug: 'stellenanzeige-schreiben-die-wirkt',
    category: 'recruiting',
    title: 'Wie Sie eine wirksame Stellenanzeige schreiben',
    abstract: 'Viele Unternehmen denken, eine Stellenanzeige zu veröffentlichen sei eine einfache Tätigkeit. Man definiert eine Position.',
    readingTime: 8,
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80',
  },
  {
    slug: 'warum-sie-keine-qualifizierten-bewerbungen-erhalten',
    category: 'recruiting',
    title: 'Warum erhalten Sie keine qualifizierten Bewerbungen?',
    abstract: 'Viele Unternehmen befinden sich in derselben Situation. Sie veröffentlichen eine Stellenanzeige.',
    readingTime: 7,
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80',
  },
  {
    slug: 'einstellungsdauer-verkuerzen-strategien-fuer-kmu',
    category: 'recruiting',
    title: 'Wie Sie die Einstellungsdauer verkürzen',
    abstract: 'Viele Unternehmen konzentrieren sich auf ein Ziel: die richtige Person zu finden. Das ist eine verständliche Priorität, doch es gibt einen weiteren Faktor, der oft unterschätzt wird: die Geschwindigkeit.',
    readingTime: 7,
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1200&q=80',
  },
  {
    slug: 'employer-branding-fuer-kmu-praxisleitfaden',
    category: 'recruiting',
    title: 'Employer Branding für KMU: Praxisleitfaden',
    abstract: 'Wenn von Employer Branding die Rede ist, denken viele KMU sofort an grosse Unternehmen mit hohen Budgets, aufwendigen Kommunikationskampagnen und strukturierten HR-Teams. Das ist eine verständliche Wahrnehmung.',
    readingTime: 7,
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80',
  },
  {
    slug: 'warum-kandidaten-sich-fuer-bestimmte-unternehmen-entscheiden',
    category: 'recruiting',
    title: 'Warum Kandidaten sich für bestimmte Unternehmen entscheiden – und für andere nicht',
    abstract: 'Zwei Unternehmen schreiben eine Stelle für eine ähnliche Position aus. Beide suchen eine kompetente Person.',
    readingTime: 8,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80',
  },
];

const FR = [
  {
    slug: 'trouver-un-emploi-guide-pratique',
    category: 'carriera',
    title: 'Comment trouver un emploi : guide pratique pour les candidats',
    abstract: 'Trouver un emploi ne signifie pas simplement envoyer des CV. Pourtant, de nombreuses personnes abordent leur recherche de cette manière.',
    readingTime: 7,
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&q=80',
  },
  {
    slug: 'rediger-un-cv-qui-obtient-des-entretiens',
    category: 'carriera',
    title: 'Comment rédiger un CV qui obtient des entretiens',
    abstract: 'Le CV reste le document le plus important de tout le processus de candidature. Vous pouvez avoir de l\'expérience, des compétences solides et d\'excellentes références, mais si votre CV ne communique pas rapidement votre valeur professionnelle, vous risquez de ne même pas atteindre l\'étape de l\'entretien.',
    readingTime: 8,
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&q=80',
  },
  {
    slug: 'reussir-un-entretien-d-embauche',
    category: 'carriera',
    title: 'Comment réussir un entretien d\'embauche',
    abstract: 'Vous avez envoyé votre CV. Vous avez reçu une réponse positive.',
    readingTime: 8,
    image: 'https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=1200&q=80',
  },
  {
    slug: 'pourquoi-vous-ne-recevez-pas-de-reponses-a-vos-candidatures',
    category: 'carriera',
    title: 'Pourquoi ne recevez-vous pas de réponses à vos candidatures ?',
    abstract: 'Vous avez mis à jour votre CV. Vous avez envoyé plusieurs candidatures.',
    readingTime: 7,
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80',
  },
  {
    slug: 'secteurs-avec-le-plus-d-opportunites-d-emploi',
    category: 'carriera',
    title: 'Les secteurs avec le plus d\'opportunités d\'emploi aujourd\'hui',
    abstract: 'Le marché du travail est en constante évolution. Certaines professions croissent rapidement, d\'autres se transforment.',
    readingTime: 7,
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80',
  },
  {
    slug: 'rediger-une-offre-d-emploi-efficace',
    category: 'recruiting',
    title: 'Comment rédiger une offre d\'emploi efficace',
    abstract: 'De nombreuses entreprises pensent que publier une offre d\'emploi est une activité simple. On définit un poste.',
    readingTime: 8,
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80',
  },
  {
    slug: 'pourquoi-vous-ne-recevez-pas-de-candidatures-qualifiees',
    category: 'recruiting',
    title: 'Pourquoi ne recevez-vous pas de candidatures qualifiées ?',
    abstract: 'De nombreuses entreprises se trouvent dans la même situation. Elles publient une offre d\'emploi.',
    readingTime: 7,
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80',
  },
  {
    slug: 'comment-reduire-le-temps-de-recrutement',
    category: 'recruiting',
    title: 'Comment réduire le temps de recrutement',
    abstract: 'De nombreuses entreprises se concentrent sur un objectif : trouver la bonne personne. C\'est une priorité compréhensible, mais il existe un autre facteur souvent sous-estimé : la rapidité.',
    readingTime: 7,
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1200&q=80',
  },
  {
    slug: 'marque-employeur-pme-guide-pratique',
    category: 'recruiting',
    title: 'Marque employeur pour PME : guide pratique',
    abstract: 'Quand on parle de marque employeur, de nombreuses PME pensent immédiatement aux grandes entreprises disposant de budgets importants, de campagnes de communication élaborées et d\'équipes RH structurées. C\'est une perception compréhensible.',
    readingTime: 7,
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80',
  },
  {
    slug: 'pourquoi-les-candidats-choisissent-certaines-entreprises',
    category: 'recruiting',
    title: 'Pourquoi les candidats choisissent certaines entreprises et pas d\'autres',
    abstract: 'Deux entreprises publient une offre pour un poste similaire. Les deux recherchent une personne compétente.',
    readingTime: 8,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80',
  },
];

export const blogIndex = { it: IT, en: EN, de: DE, fr: FR };

// slug IT → slug per lingua
export const slugTranslations = {
  'come-trovare-lavoro-guida-pratica': { en: 'how-to-find-a-job-practical-guide', de: 'arbeit-finden-praktischer-leitfaden', fr: 'trouver-un-emploi-guide-pratique' },
  'come-scrivere-un-cv-che-ottiene-colloqui': { en: 'how-to-write-a-cv-that-gets-interviews', de: 'lebenslauf-schreiben-der-zum-vorstellungsgespraech-fuehrt', fr: 'rediger-un-cv-qui-obtient-des-entretiens' },
  'come-affrontare-un-colloquio-di-lavoro': { en: 'how-to-succeed-in-a-job-interview', de: 'vorstellungsgespraech-erfolgreich-meistern', fr: 'reussir-un-entretien-d-embauche' },
  'perche-non-ricevi-risposte-alle-candidature': { en: 'why-youre-not-getting-responses-to-job-applications', de: 'warum-sie-keine-antworten-auf-bewerbungen-erhalten', fr: 'pourquoi-vous-ne-recevez-pas-de-reponses-a-vos-candidatures' },
  'settori-con-piu-opportunita-di-lavoro': { en: 'industries-with-the-most-job-opportunities', de: 'branchen-mit-den-meisten-jobmoeglichkeiten', fr: 'secteurs-avec-le-plus-d-opportunites-d-emploi' },
  'come-scrivere-un-annuncio-di-lavoro-efficace': { en: 'how-to-write-an-effective-job-ad', de: 'stellenanzeige-schreiben-die-wirkt', fr: 'rediger-une-offre-d-emploi-efficace' },
  'perche-non-ricevi-candidature-qualificate': { en: 'why-youre-not-getting-qualified-applications', de: 'warum-sie-keine-qualifizierten-bewerbungen-erhalten', fr: 'pourquoi-vous-ne-recevez-pas-de-candidatures-qualifiees' },
  'come-ridurre-i-tempi-di-assunzione': { en: 'how-to-reduce-time-to-hire', de: 'einstellungsdauer-verkuerzen-strategien-fuer-kmu', fr: 'comment-reduire-le-temps-de-recrutement' },
  'employer-branding-pmi-guida-pratica': { en: 'employer-branding-for-smes-practical-guide', de: 'employer-branding-fuer-kmu-praxisleitfaden', fr: 'marque-employeur-pme-guide-pratique' },
  'perche-i-candidati-scelgono-alcune-aziende': { en: 'why-candidates-choose-some-companies-over-others', de: 'warum-kandidaten-sich-fuer-bestimmte-unternehmen-entscheiden', fr: 'pourquoi-les-candidats-choisissent-certaines-entreprises' },
};

export function listByCategory(categoryId, lang) {
  const list = blogIndex[lang]?.length ? blogIndex[lang] : blogIndex.it;
  return list.filter((e) => e.category === categoryId);
}

export function findBySlug(slug) {
  for (const [lang, list] of Object.entries(blogIndex)) {
    const entry = list.find((e) => e.slug === slug);
    if (entry) return { lang, entry };
  }
  return null;
}

export function slugFor(itSlug, lang) {
  if (lang === 'it') return itSlug;
  return slugTranslations[itSlug]?.[lang] || itSlug;
}
