import { Grid3x3, List, LayoutGrid } from "lucide-react";
import { Button } from "./ui/button";
import { useT } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations";

// ViewMode can be "grid", "list", or "cards"

export function ViewModeToggle({ viewMode, onViewModeChange }) {
  const t = useT();

  return (
    <div className="flex gap-1 border rounded-md p-1 bg-gray-50 dark:bg-gray-900">
      <Button
        variant={viewMode === "grid" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("grid")}
        className="h-8 px-3"
      >
        <Grid3x3 className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline">{t(translations.viewMode.grid)}</span>
      </Button>
      <Button
        variant={viewMode === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("list")}
        className="h-8 px-3"
      >
        <List className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline">{t(translations.viewMode.list)}</span>
      </Button>
      <Button
        variant={viewMode === "cards" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("cards")}
        className="h-8 px-3"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline">{t(translations.viewMode.cards)}</span>
      </Button>
    </div>
  );
}