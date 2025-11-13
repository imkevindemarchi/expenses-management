import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Locale
import itJSON from "./locale/it.json";
import enJSON from "./locale/en.json";

// Utils
import { getFromStorage, setToStorage } from "./utils";

const language: string = getFromStorage("language");
!language && setToStorage("language", process.env.REACT_APP_DEFAULT_LANGUAGE);

i18n.use(initReactI18next).init({
  debug: true,
  fallbackLng: "it",
  interpolation: {
    escapeValue: false,
  },
  resources: {
    it: { ...itJSON },
    en: { ...enJSON },
  },
  lng: language || "it",
});

export default i18n;
