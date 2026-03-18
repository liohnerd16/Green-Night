import { useState } from "react";
import { Plus, Trash2, FolderOpen, GripVertical, Pencil, Check, X } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "./ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner";
import { useT, useLanguage } from "../i18n/LanguageContext";
import { translations as tr } from "../i18n/translations";

export function CategoryManager({
  categories, onAddCategory, onDeleteCategory, onRenameCategory, websiteCounts,
}) {
  const t = useT();
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editValue, setEditValue] = useState("");

  const allLabel = t(tr.common.all);
  const editableCategories = categories.filter((c) => c !== allLabel && c !== "Tất cả" && c !== "All");

  const handleAdd = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) { toast.error(t(tr.categories.emptyName)); return; }
    if (categories.includes(trimmed)) { toast.error(t(tr.categories.exists)); return; }
    onAddCategory(trimmed);
    setNewCategory("");
    const addedMsg = tr.categories.added[lang];
    toast.success(typeof addedMsg === "function" ? addedMsg(trimmed) : addedMsg);
  };

  const handleKeyPress = (e) => { if (e.key === "Enter") handleAdd(); };

  const handleStartEdit = (cat) => { setEditingCategory(cat); setEditValue(cat); };

  const handleSaveEdit = () => {
    if (!editingCategory) return;
    const trimmed = editValue.trim();
    if (!trimmed) { toast.error(t(tr.categories.emptyName)); return; }
    if (trimmed !== editingCategory && categories.includes(trimmed)) { toast.error(t(tr.categories.exists)); return; }
    if (trimmed !== editingCategory) {
      onRenameCategory(editingCategory, trimmed);
      const renamedMsg = tr.categories.renamed[lang];
      toast.success(typeof renamedMsg === "function" ? renamedMsg(trimmed) : renamedMsg);
    }
    setEditingCategory(null); setEditValue("");
  };

  const handleCancelEdit = () => { setEditingCategory(null); setEditValue(""); };
  const handleEditKeyPress = (e) => { if (e.key === "Enter") handleSaveEdit(); if (e.key === "Escape") handleCancelEdit(); };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2"><FolderOpen className="h-4 w-4" />{t(tr.categories.manage)}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t(tr.categories.manage)}</DialogTitle>
          <DialogDescription>{t(tr.categories.manageDesc)}</DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 mt-2">
          <Input placeholder={t(tr.categories.newPlaceholder)} value={newCategory} onChange={(e) => setNewCategory(e.target.value)} onKeyDown={handleKeyPress} className="flex-1" />
          <Button onClick={handleAdd} size="sm" className="gap-1 px-3"><Plus className="h-4 w-4" />{t(tr.common.add)}</Button>
        </div>
        <ScrollArea className="max-h-[400px] mt-4">
          <div className="space-y-1">
            {editableCategories.map((cat) => {
              const count = websiteCounts[cat] || 0;
              const isEditing = editingCategory === cat;
              return (
                <div key={cat} className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 group transition-colors">
                  <GripVertical className="h-4 w-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                  {isEditing ? (
                    <div className="flex-1 flex items-center gap-1.5">
                      <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={handleEditKeyPress} className="h-8 text-sm" autoFocus />
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950" onClick={handleSaveEdit}><Check className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600" onClick={handleCancelEdit}><X className="h-4 w-4" /></Button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{cat}</span>
                      <Badge variant="secondary" className="text-xs tabular-nums flex-shrink-0">{count}</Badge>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-600" onClick={() => handleStartEdit(cat)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600 dark:hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t(tr.categories.deleteTitle)}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {(() => { const fn = tr.categories.deleteDesc[lang]; return typeof fn === "function" ? fn(cat) : fn; })()}
                              {count > 0 && (
                                <span className="block mt-2 text-amber-600 dark:text-amber-400 font-medium">
                                  {(() => { const fn = tr.categories.deleteWarning[lang]; return typeof fn === "function" ? fn(count) : fn; })()}
                                </span>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t(tr.common.cancel)}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => {
                              onDeleteCategory(cat);
                              const deletedMsg = tr.categories.deleted[lang];
                              toast.success(typeof deletedMsg === "function" ? deletedMsg(cat) : deletedMsg);
                            }} className="bg-red-600 hover:bg-red-700">{t(tr.common.delete)}</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              );
            })}
            {editableCategories.length === 0 && (
              <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                <FolderOpen className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t(tr.categories.empty)}</p>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="flex items-center gap-2 mt-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-400">
            {(() => { const fn = tr.categories.total[lang]; return typeof fn === "function" ? fn(editableCategories.length) : fn; })()}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}