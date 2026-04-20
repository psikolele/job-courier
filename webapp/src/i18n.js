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
          "h1": "Accedi al tuo",
          "h1_sub": "Prossimo Lavoro.",
          "subtitle": "Per I Candidati",
          "cta": "Trova Offerte"
        },
        "companies": {
          "h1": "Trova il tuo miglior",
          "h1_sub": "Talento subito.",
          "subtitle": "Per Le Aziende",
          "cta": "Pubblica Annuncio"
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
          "h1": "Zugang zu Ihrem",
          "h1_sub": "Nächsten Job.",
          "subtitle": "Für Kandidaten",
          "cta": "Angebote Finden"
        },
        "companies": {
          "h1": "Finden Sie Ihr bestes",
          "h1_sub": "Talent sofort.",
          "subtitle": "Für Unternehmen",
          "cta": "Anzeige veröffentlichen"
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
          "h1": "Accédez à votre",
          "h1_sub": "Prochain Emploi.",
          "subtitle": "Pour les Candidats",
          "cta": "Trouver des Offres"
        },
        "companies": {
          "h1": "Trouvez votre meilleur",
          "h1_sub": "Talent maintenant.",
          "subtitle": "Pour les Entreprises",
          "cta": "Publier une Annonce"
        }
      }
    }
  },
  en: {
    translation: {
      "nav": {
        "jobs": "Search Jobs",
        "companies": "Companies",
        "blog": "Blog",
        "institutions": "Institutions",
        "login": "Login"
      },
      "hero": {
        "candidates": {
          "h1": "Access your",
          "h1_sub": "Next Job.",
          "subtitle": "For Candidates",
          "cta": "Find Offers"
        },
        "companies": {
          "h1": "Find your best",
          "h1_sub": "Talent right now.",
          "subtitle": "For Companies",
          "cta": "Publish Ad"
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
