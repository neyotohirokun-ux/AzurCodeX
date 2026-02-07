import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ships_en from "./locales/en/ships.json";
import ships_ja from "./locales/ja/ships.json";
import ships_ko from "./locales/ko/ships.json";
import ui_en from "./locales/en/ui.json";
import ui_ja from "./locales/ja/ui.json";
import ui_ko from "./locales/ko/ui.json";

i18n.use(initReactI18next).init({
  fallbackLng: "en",
  ns: ["ui", "ships"],
  defaultNS: "ui",
  resources: {
    en: { ui: ui_en, ships: ships_en },
    ja: { ui: ui_ja, ships: ships_ja },
    ko: { ui: ui_ko, ships: ships_ko },
  },
});

export default i18n;
