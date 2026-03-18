import { useLanguage } from "../i18n/LanguageContext";
import { Button } from "./ui/button";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  const toggle = () => setLang(lang === "vi" ? "en" : "vi");

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      className="h-9 gap-1.5 px-2.5 font-medium text-xs"
      title={lang === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
    >
      <Languages className="h-4 w-4" />
      <span>{lang === "vi" ? "EN" : "VI"}</span>
    </Button>
  );
}
