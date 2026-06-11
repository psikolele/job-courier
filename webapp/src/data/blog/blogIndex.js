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

export const blogIndex = { it: IT, en: [], de: [], fr: [] };

// slug IT → slug per lingua (popolata in fase 2 traduzioni)
export const slugTranslations = {};

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
