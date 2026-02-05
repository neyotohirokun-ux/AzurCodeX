import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  debug: true,
  fallbackLng: "en",
  resources: {
    en: {
      translation: {
        welcome: "Welcome",
        description: "This is an example of internationalization.",
      },
    },
    fr: {
      translation: {
        welcome: "Bienvenue",
        description: "Ceci est un exemple d'internationalisation.",
      },
    },
  },
});

export default i18n;
