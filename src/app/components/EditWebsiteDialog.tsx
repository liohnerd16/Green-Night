import { useState, useEffect } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "./ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "./ui/select";
import { toast } from "sonner";
import { useT } from "../i18n/LanguageContext";
import { translations as tr } from "../i18n/translations";

export function EditWebsiteDialog({ website, categories, onUpdate, onDelete }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(website.name);
  const [description, setDescription] = useState(website.description);
  const [url, setUrl] = useState(website.url);
  const [category, setCategory] = useState(website.category);
  const [tags, setTags] = useState(website.tags.join(", "));
  const [icon, setIcon] = useState(website.icon);

  useEffect(() => {
    setName(website.name); setDescription(website.description); setUrl(website.url);
    setCategory(website.category); setTags(website.tags.join(", ")); setIcon(website.icon);
  }, [website]);

  const handleSubmit = () => {
    if (!name || !description || !url || !category) { toast.error(t(tr.websiteForm.fillRequired)); return; }
    try { new URL(url); } catch { toast.error(t(tr.websiteForm.invalidUrl)); return; }
    onUpdate({
      ...website, name, description, url, category,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean), icon,
    });
    setOpen(false);
    toast.success(t(tr.websiteForm.updateSuccess));
  };

  const handleDelete = () => {
    onDelete(website.id);
    toast.success(t(tr.websiteForm.deleteSuccess));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Edit className="h-4 w-4" />
          <span className="sr-only">{t(tr.common.edit)}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t(tr.websiteForm.editTitle)}</DialogTitle>
          <DialogDescription>{t(tr.websiteForm.editDesc)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">{t(tr.websiteForm.name)} <span className="text-red-500">*</span></Label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-url">{t(tr.websiteForm.url)} <span className="text-red-500">*</span></Label>
            <Input id="edit-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">{t(tr.websiteForm.description)} <span className="text-red-500">*</span></Label>
            <Textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-category">{t(tr.websiteForm.category)} <span className="text-red-500">*</span></Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.filter((c) => c !== t(tr.common.all)).map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-tags">{t(tr.websiteForm.tags)}</Label>
            <Input id="edit-tags" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-icon">{t(tr.websiteForm.iconLabel)}</Label>
            <Input id="edit-icon" value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={2} />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit} className="flex-1">{t(tr.websiteForm.updateButton)}</Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2"><Trash2 className="h-4 w-4" />{t(tr.common.delete)}</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t(tr.websiteForm.confirmDelete)}</AlertDialogTitle>
                  <AlertDialogDescription>{t(tr.websiteForm.confirmDeleteDesc)[0] === "B" ? t(tr.websiteForm.confirmDeleteDesc) : t(tr.websiteForm.confirmDeleteDesc)}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t(tr.common.cancel)}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">{t(tr.common.delete)}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}