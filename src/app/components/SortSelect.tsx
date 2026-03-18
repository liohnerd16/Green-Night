import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useT } from "../i18n/LanguageContext";
import { translations as tr } from "../i18n/translations";

// SortMode can be "default", "name-az", "name-za", "newest", "oldest", "recently-updated"

export function SortSelect({ sortMode, onSortModeChange }) {
  const t = useT();

  return (
    <Select value={sortMode} onValueChange={(v) => onSortModeChange(v)}>
      <SelectTrigger className="w-full sm:w-[200px] h-9">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="default">{t(tr.sort.default)}</SelectItem>
        <SelectItem value="name-az">{t(tr.sort.nameAZ)}</SelectItem>
        <SelectItem value="name-za">{t(tr.sort.nameZA)}</SelectItem>
        <SelectItem value="newest">{t(tr.sort.newest)}</SelectItem>
        <SelectItem value="oldest">{t(tr.sort.oldest)}</SelectItem>
        <SelectItem value="recently-updated">{t(tr.sort.recentlyUpdated)}</SelectItem>
      </SelectContent>
    </Select>
  );
}