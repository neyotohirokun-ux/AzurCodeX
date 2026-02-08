import { useI18n } from "./i18n";

export const SwitchLang = () => {
  const { locale, setLocale } = useI18n();

  return (
    <div style={{ marginBottom: 20 }}>
      <button disabled={locale === "en"} onClick={() => setLocale("en")}>
        EN
      </button>
      <button disabled={locale === "ko"} onClick={() => setLocale("ko")}>
        KO
      </button>
      <button disabled={locale === "ja"} onClick={() => setLocale("ja")}>
        JA
      </button>
    </div>
  );
};
