import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Placeholder translation resources
const resources = {
  it: {
    translation: {
      "nav": {
        "jobs": "Cerca Lavoro",
        "companies": "Aziende",
        "blog": "Blog",
        "institutions": "Istituzioni",
        "login": "Login"
      },
      "hero": {
        "candidates": {
          "h1": "Il lavoro dei tuoi sogni è a un clic di distanza",
          "subtitle": "Trova l'opportunità perfetta per la tua carriera.",
          "cta": "VEDI TUTTE LE OFFERTE"
        },
        "companies": {
          "h1": "Trova i migliori talenti oggi stesso",
          "subtitle": "Pubblica i tuoi annunci e raggiungi migliaia di candidati.",
          "cta": "PUBBLICA UN ANNUNCIO"
        }
      }
    }
  },
  de: {
    translation: {
      "nav": {
        "jobs": "Jobsuche",
        "companies": "Unternehmen",
        "blog": "Blog",
        "institutions": "Institutionen",
        "login": "Anmelden"
      },
      "hero": {
        "candidates": {
          "h1": "Ihr Traumjob ist nur einen Klick entfernt",
          "subtitle": "Finden Sie die perfekte berufliche Gelegenheit.",
          "cta": "ALLE ANGEBOTE ANSEHEN"
        },
        "companies": {
          "h1": "Finden Sie noch heute die besten Talente",
          "subtitle": "Veröffentlichen Sie Ihre Anzeigen und erreichen Sie Tausende von Kandidaten.",
          "cta": "ANZEIGE AUFGEBEN"
        }
      }
    }
  },
  fr: {
    translation: {
      "nav": {
        "jobs": "Recherche d'emploi",
        "companies": "Entreprises",
        "blog": "Blog",
        "institutions": "Institutions",
        "login": "Connexion"
      },
      "hero": {
        "candidates": {
          "h1": "Le travail de vos rêves est à portée de clic",
          "subtitle": "Trouvez l'opportunité parfaite pour votre carrière.",
          "cta": "VOIR TOUTES LES OFFRES"
        },
        "companies": {
          "h1": "Trouvez les meilleurs talents dès aujourd'hui",
          "subtitle": "Publiez vos annonces et touchez des milliers de candidats.",
          "cta": "PUBLIER UNE ANNONCE"
        }
      }
    }
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "it", // default language
    fallbackLng: "it",
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
