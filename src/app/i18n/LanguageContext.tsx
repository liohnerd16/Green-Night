import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations } from "./translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("language");
      if (saved === "vi" || saved === "en") return saved;
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith("vi")) return "vi";
      return "vi";
    }
    return "vi";
  });

  const setLang = (newLang) => {
    setLangState(newLang);
    localStorage.setItem("language", newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback for when rendered outside LanguageProvider (e.g. error boundaries, hot reload)
    return {
      lang: "vi",
      setLang: () => {},
      t: translations,
    };
  }
  return context;
}

/**
 * Helper hook to get a translated string.
 * Usage: const t = useT();
 *        t(translations.common.loading) => "Đang tải..." or "Loading..."
 */
export function useT() {
  const { lang } = useLanguage();
  return function t(entry) {
    return entry[lang];
  };
}