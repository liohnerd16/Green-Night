import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "./ui/select";
import { toast } from "sonner";
import { useT } from "../i18n/LanguageContext";
import { translations as tr } from "../i18n/translations";

export function AddWebsiteDialog({ categories, onAdd }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [icon, setIcon] = useState("🌐");

  const handleSubmit = () => {
    if (!name || !description || !url || !category) {
      toast.error(t(tr.websiteForm.fillRequired));
      return;
    }
    try { new URL(url); } catch { toast.error(t(tr.websiteForm.invalidUrl)); return; }

    onAdd({
      name, description, url, category,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      icon,
    });
    setName(""); setDescription(""); setUrl(""); setCategory(""); setTags(""); setIcon("🌐");
    setOpen(false);
    toast.success(t(tr.websiteForm.addSuccess));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t(tr.home.addWebsite)}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t(tr.websiteForm.addTitle)}</DialogTitle>
          <DialogDescription>{t(tr.websiteForm.addDesc)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t(tr.websiteForm.name)} <span className="text-red-500">*</span></Label>
            <Input id="name" placeholder={t(tr.websiteForm.namePlaceholder)} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">{t(tr.websiteForm.url)} <span className="text-red-500">*</span></Label>
            <Input id="url" type="url" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t(tr.websiteForm.description)} <span className="text-red-500">*</span></Label>
            <Textarea id="description" placeholder={t(tr.websiteForm.descPlaceholder)} value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">{t(tr.websiteForm.category)} <span className="text-red-500">*</span></Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder={t(tr.search.selectCategory)} /></SelectTrigger>
              <SelectContent>
                {categories.filter((c) => c !== t(tr.common.all)).map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">{t(tr.websiteForm.tags)}</Label>
            <Input id="tags" placeholder={t(tr.websiteForm.tagsPlaceholder)} value={tags} onChange={(e) => setTags(e.target.value)} />
            <p className="text-xs text-gray-500">{t(tr.websiteForm.tagsHint)}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="icon">{t(tr.websiteForm.iconLabel)}</Label>
            <Input id="icon" placeholder="🌐" value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={2} />
          </div>
          <Button onClick={handleSubmit} className="w-full">{t(tr.websiteForm.addButton)}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}