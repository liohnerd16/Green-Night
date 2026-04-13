import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { PageTransition } from "../components/PageTransition";
import { ThemeToggle } from "../components/ThemeToggle";
import { LanguageToggle } from "../components/LanguageToggle";
import { AdminLogin, getAdminToken } from "../components/AdminLogin";
import { SocialLinks } from "../components/SocialLinks";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "../components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import {
  Sparkles, Settings, Globe2, CalendarDays, Plus, Pencil, Trash2, Save,
  User, BookOpen, Target, Heart, Mail, ArrowRight, MoveUp, MoveDown,
} from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { toast } from "sonner";
import { useT, useLanguage } from "../i18n/LanguageContext";
import { translations as tr } from "../i18n/translations";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-570355f0`;

async function fetchWithRetry(url, options, retries = 4, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((r) => setTimeout(r, delay * (i + 1)));
    }
  }
  throw new Error("Max retries reached");
}

const DEFAULT_CONTENT = {
  hero: {
    name: "Xin chào! / Hello!",
    title: "Researcher & Developer",
    subtitle: "Welcome to the Scientific Research Websites collection",
    avatarUrl: "https://images.unsplash.com/photo-1758685734511-4f49ce9a382b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2llbnRpc3QlMjByZXNlYXJjaGVyJTIwcG9ydHJhaXQlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzcyODYxOTg1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    bio: "I am a researcher passionate about sharing knowledge and useful tools with the scientific community. This website was created to aggregate the best research resources from around the world.",
  },
  sections: [
    { id: "1", type: "text", title: "About this project", content: "Scientific Research Websites is a place that aggregates useful online tools, platforms, and resources for researchers, students, and anyone interested in science.", icon: "globe" },
    { id: "2", type: "text", title: "Goals", content: "Build a comprehensive online library, helping the research community easily find and access high-quality scientific resources worldwide.", icon: "target" },
    { id: "3", type: "highlight", title: "Contribute", content: "If you know a useful research website not yet in the list, please contact me to have it added! Every contribution is appreciated.", icon: "heart" },
  ],
  stats: [
    { label: "Websites", value: "24+" },
    { label: "Categories", value: "8+" },
    { label: "Updated", value: "Weekly" },
    { label: "Free", value: "100%" },
  ],
};

const ICON_MAP = {
  globe: <Globe2 className="h-5 w-5" />,
  target: <Target className="h-5 w-5" />,
  heart: <Heart className="h-5 w-5" />,
  book: <BookOpen className="h-5 w-5" />,
  user: <User className="h-5 w-5" />,
  mail: <Mail className="h-5 w-5" />,
  sparkles: <Sparkles className="h-5 w-5" />,
};
const ICON_OPTIONS = ["globe", "target", "heart", "book", "user", "mail", "sparkles"];

function SectionEditorDialog({ section, onSave, trigger }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(section?.title || "");
  const [content, setContent] = useState(section?.content || "");
  const [type, setType] = useState(section?.type || "text");
  const [icon, setIcon] = useState(section?.icon || "globe");

  useEffect(() => {
    if (open && section) { setTitle(section.title); setContent(section.content); setType(section.type); setIcon(section.icon || "globe"); }
    if (open && !section) { setTitle(""); setContent(""); setType("text"); setIcon("globe"); }
  }, [open, section]);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) { toast.error(t(tr.about.fillRequired)); return; }
    onSave({ id: section?.id, type, title: title.trim(), content: content.trim(), icon });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{section ? t(tr.about.editSection) : t(tr.about.addSection)}</DialogTitle>
          <DialogDescription>{section ? t(tr.about.updateSectionDesc) : t(tr.about.addSectionDesc)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2"><Label>{t(tr.about.sectionTitle)}</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t(tr.about.sectionTitlePlaceholder)} /></div>
          <div className="space-y-2"><Label>{t(tr.about.sectionContent)}</Label><textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={t(tr.about.sectionContentPlaceholder)} rows={4} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t(tr.about.displayType)}</Label>
              <Select value={type} onValueChange={(v) => setType(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                <SelectItem value="text">{t(tr.about.typeText)}</SelectItem>
                <SelectItem value="highlight">{t(tr.about.typeHighlight)}</SelectItem>
                <SelectItem value="quote">{t(tr.about.typeQuote)}</SelectItem>
              </SelectContent></Select>
            </div>
            <div className="space-y-2">
              <Label>{t(tr.about.icon)}</Label>
              <Select value={icon} onValueChange={setIcon}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                {ICON_OPTIONS.map((ic) => (<SelectItem key={ic} value={ic}><span className="flex items-center gap-2">{ICON_MAP[ic]} {ic}</span></SelectItem>))}
              </SelectContent></Select>
            </div>
          </div>
          <Button onClick={handleSave} className="w-full"><Save className="h-4 w-4 mr-2" />{section ? t(tr.common.update) : t(tr.common.add)}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function HeroEditorDialog({ hero, onSave }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(hero);
  useEffect(() => { if (open) setForm(hero); }, [open, hero]);
  const handleSave = () => {
    if (!form.name.trim()) { toast.error(t(tr.about.nameRequired)); return; }
    onSave(form); setOpen(false); toast.success(t(tr.about.heroUpdated));
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline" size="sm" className="gap-1.5"><Pencil className="h-3.5 w-3.5" />{t(tr.about.editHero)}</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{t(tr.about.editHeroTitle)}</DialogTitle><DialogDescription>{t(tr.about.editHeroDesc)}</DialogDescription></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2"><Label>{t(tr.about.nameLabel)}</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="space-y-2"><Label>{t(tr.about.titleLabel)}</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="space-y-2"><Label>{t(tr.about.subtitleLabel)}</Label><Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></div>
          <div className="space-y-2"><Label>{t(tr.about.avatarUrlLabel)}</Label><Input value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} placeholder="https://..." /></div>
          <div className="space-y-2"><Label>{t(tr.about.bioLabel)}</Label><textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <Button onClick={handleSave} className="w-full"><Save className="h-4 w-4 mr-2" />{t(tr.common.saveChanges)}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatsEditorDialog({ stats, onSave }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(stats);
  useEffect(() => { if (open) setForm(stats); }, [open, stats]);
  const addStat = () => setForm([...form, { label: "", value: "" }]);
  const removeStat = (i) => setForm(form.filter((_, idx) => idx !== i));
  const updateStat = (i, key, val) => { const updated = [...form]; updated[i] = { ...updated[i], [key]: val }; setForm(updated); };
  const handleSave = () => { onSave(form.filter((s) => s.label.trim() && s.value.trim())); setOpen(false); toast.success(t(tr.about.statsUpdated)); };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline" size="sm" className="gap-1.5"><Pencil className="h-3.5 w-3.5" />{t(tr.about.editStats)}</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{t(tr.about.editStatsTitle)}</DialogTitle><DialogDescription>{t(tr.about.editStatsDesc)}</DialogDescription></DialogHeader>
        <div className="space-y-3 py-2 max-h-[400px] overflow-y-auto">
          {form.map((stat, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input value={stat.value} onChange={(e) => updateStat(i, "value", e.target.value)} placeholder={t(tr.about.statValuePlaceholder)} className="w-28" />
              <Input value={stat.label} onChange={(e) => updateStat(i, "label", e.target.value)} placeholder={t(tr.about.statLabelPlaceholder)} className="flex-1" />
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => removeStat(i)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addStat} className="w-full gap-1"><Plus className="h-4 w-4" /> {t(tr.about.addItem)}</Button>
        </div>
        <Button onClick={handleSave} className="w-full"><Save className="h-4 w-4 mr-2" />{t(tr.common.saveChanges)}</Button>
      </DialogContent>
    </Dialog>
  );
}

export function AboutPage() {
  const t = useT();
  const { lang } = useLanguage();
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminMode, setAdminMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) document.documentElement.classList.add("dark");
    const token = getAdminToken();
    if (token) {
      fetch(`${API_URL}/admin/verify`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "X-Admin-Token": token,
        },
      })
        .then((r) => r.json())
        .then((data) => { if (data.valid) setIsAdmin(true); else sessionStorage.removeItem("adminToken"); })
        .catch(() => { sessionStorage.removeItem("adminToken"); });
    }
  }, []);

  useEffect(() => { fetchAboutContent(); }, []);

  const fetchAboutContent = async () => {
    try {
      const response = await fetchWithRetry(`${API_URL}/about`, { headers: { Authorization: `Bearer ${publicAnonKey}` } });
      if (response.ok) { const data = await response.json(); if (data && data.hero) setContent(data); }
    } catch (error) { console.warn("Failed to fetch about content:", error); }
    finally { setLoading(false); }
  };

  const saveContent = async (newContent) => {
    setContent(newContent); setSaving(true);
    try {
      const token = getAdminToken();
      await fetch(`${API_URL}/about`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${publicAnonKey}`, "X-Admin-Token": token || "" }, body: JSON.stringify(newContent) });
    } catch (error) { console.warn("Failed to save:", error); toast.error(t(tr.about.saveError)); }
    finally { setSaving(false); }
  };

  const handleHeroSave = (hero) => saveContent({ ...content, hero });
  const handleStatsSave = (stats) => saveContent({ ...content, stats });
  const handleAddSection = (data) => { saveContent({ ...content, sections: [...content.sections, { ...data, id: Date.now().toString() }] }); toast.success(t(tr.about.sectionAdded)); };
  const handleUpdateSection = (data) => { if (!data.id) return; saveContent({ ...content, sections: content.sections.map((s) => (s.id === data.id ? { ...s, ...data } : s)) }); toast.success(t(tr.about.sectionUpdated)); };
  const handleDeleteSection = (id) => { saveContent({ ...content, sections: content.sections.filter((s) => s.id !== id) }); toast.success(t(tr.about.sectionDeleted)); };
  const handleMoveSection = (index, direction) => { const s = [...content.sections]; const ni = direction === "up" ? index - 1 : index + 1; if (ni < 0 || ni >= s.length) return; [s[index], s[ni]] = [s[ni], s[index]]; saveContent({ ...content, sections: s }); };

  const handleAdminLogin = () => { setIsAdmin(true); };
  const handleAdminLogout = async () => {
    try {
      const token = getAdminToken();
      if (token) {
        await fetch(`${API_URL}/admin/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "X-Admin-Token": token,
          },
        });
      }
    } catch {
      // Best-effort logout
    }
    sessionStorage.removeItem("adminToken");
    setIsAdmin(false); setAdminMode(false);
    toast.success(t(tr.admin.logoutSuccess));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{t(tr.common.loading)}</p>
        </div>
      </div>
    );
  }

  const { hero, sections, stats } = content;

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Sparkles className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">SciWeb</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        {/* Admin Controls */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <Switch id="about-admin-mode" checked={adminMode} onCheckedChange={setAdminMode} />
                  <Label htmlFor="about-admin-mode" className="cursor-pointer">{t(tr.admin.editContent)}</Label>
                  {saving && <span className="text-xs text-blue-500 flex items-center gap-1"><span className="animate-spin rounded-full h-3 w-3 border-2 border-blue-500 border-t-transparent" />{t(tr.common.saving)}</span>}
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">{t(tr.admin.loginToEdit)}</p>
              )}
            </div>
            <AdminLogin isAdmin={isAdmin} onLoginSuccess={handleAdminLogin} onLogout={handleAdminLogout} />
          </div>
        </div>

        {/* HERO */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative mb-12">
          {adminMode && <div className="absolute top-3 right-3 z-10"><HeroEditorDialog hero={hero} onSave={handleHeroSave} /></div>}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 sm:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
            <div className="relative flex flex-col sm:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white/30 shadow-2xl overflow-hidden bg-white/10">
                  <ImageWithFallback src={hero.avatarUrl} alt={hero.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="text-center sm:text-left text-white">
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">{hero.name}</h1>
                <p className="text-lg sm:text-xl text-white/90 font-medium mb-2">{hero.title}</p>
                <p className="text-sm sm:text-base text-white/70 mb-4">{hero.subtitle}</p>
                <p className="text-sm text-white/80 leading-relaxed max-w-xl">{hero.bio}</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* STATS */}
        {stats.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="mb-12 relative">
            {adminMode && <div className="absolute -top-2 right-0 z-10"><StatsEditorDialog stats={stats} onSave={handleStatsSave} /></div>}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.2 + i * 0.08 }} className="text-center p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{stat.value}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* CONTENT SECTIONS */}
        <div className="space-y-6 mb-12">
          <AnimatePresence>
            {sections.map((section, index) => (
              <motion.div key={section.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35, delay: 0.25 + index * 0.08 }} className="relative group">
                {adminMode && (
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => handleMoveSection(index, "up")} disabled={index === 0}><MoveUp className="h-3.5 w-3.5" /></Button>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => handleMoveSection(index, "down")} disabled={index === sections.length - 1}><MoveDown className="h-3.5 w-3.5" /></Button>
                    <SectionEditorDialog section={section} onSave={handleUpdateSection} trigger={<Button variant="outline" size="sm" className="h-7 w-7 p-0"><Pencil className="h-3.5 w-3.5" /></Button>} />
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="outline" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t(tr.about.deleteSection)}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {(() => { const fn = tr.about.deleteSectionDesc[lang]; return typeof fn === "function" ? fn(section.title) : fn; })()}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t(tr.common.cancel)}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteSection(section.id)} className="bg-red-600 hover:bg-red-700">{t(tr.common.delete)}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
                {section.type === "highlight" ? (
                  <div className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white flex-shrink-0">{ICON_MAP[section.icon || "heart"] || <Heart className="h-5 w-5" />}</div>
                      <div><h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{section.title}</h3><p className="text-gray-600 dark:text-gray-300 leading-relaxed">{section.content}</p></div>
                    </div>
                  </div>
                ) : section.type === "quote" ? (
                  <div className="p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 border-l-4 border-l-blue-500">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl text-blue-300 dark:text-blue-600 font-serif leading-none">"</div>
                      <div><p className="text-gray-600 dark:text-gray-300 leading-relaxed italic mb-2">{section.content}</p><p className="text-sm font-medium text-gray-500 dark:text-gray-400">— {section.title}</p></div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 flex-shrink-0">{ICON_MAP[section.icon || "globe"] || <Globe2 className="h-5 w-5" />}</div>
                      <div><h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{section.title}</h3><p className="text-gray-600 dark:text-gray-300 leading-relaxed">{section.content}</p></div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {adminMode && (
            <SectionEditorDialog onSave={handleAddSection} trigger={
              <button className="w-full p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-colors flex items-center justify-center gap-2 text-gray-400 hover:text-blue-500">
                <Plus className="h-5 w-5" /><span className="text-sm font-medium">{t(tr.about.addNewSection)}</span>
              </button>
            } />
          )}
        </div>

        {/* NAVIGATION CARDS */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t(tr.common.explore)}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/websites">
              <div className="group flex items-center justify-between gap-4 p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex-shrink-0"><Globe2 className="h-6 w-6" /></div>
                  <div><h3 className="font-semibold text-gray-900 dark:text-gray-100">{t(tr.about.websiteList)}</h3><p className="text-sm text-gray-500 dark:text-gray-400">{t(tr.about.websiteListDesc)}</p></div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            </Link>
            <Link to="/changelog">
              <div className="group flex items-center justify-between gap-4 p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white flex-shrink-0"><CalendarDays className="h-6 w-6" /></div>
                  <div><h3 className="font-semibold text-gray-900 dark:text-gray-100">{t(tr.about.changelogTitle)}</h3><p className="text-sm text-gray-500 dark:text-gray-400">{t(tr.about.changelogDesc)}</p></div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            </Link>
          </div>
        </motion.section>

        {/* FOOTER */}
        <footer className="py-8 border-t border-gray-200 dark:border-gray-800">
          <SocialLinks />
          <div className="mt-6 text-center border-t border-gray-200 dark:border-gray-700 pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">{t(tr.common.copyright)}</p>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}