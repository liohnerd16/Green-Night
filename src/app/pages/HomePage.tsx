import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { websites as initialWebsites, categories as defaultCategories } from "../data/websites";
import { SearchBar } from "../components/SearchBar";
import { ViewModeToggle } from "../components/ViewModeToggle";
import { WebsiteItem } from "../components/WebsiteItem";
import { DraggableWebsiteItem } from "../components/DraggableWebsiteItem";
import { ThemeToggle } from "../components/ThemeToggle";
import { AddWebsiteDialog } from "../components/AddWebsiteDialog";
import { CategoryManager } from "../components/CategoryManager";
import { AdminLogin, getAdminToken } from "../components/AdminLogin";
import { SocialLinks } from "../components/SocialLinks";
import { PageTransition } from "../components/PageTransition";
import { Sparkles, Settings, CalendarDays, ChevronRight, GripVertical, Save, ArrowLeft } from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { useT } from "../i18n/LanguageContext";
import { translations as tr } from "../i18n/translations";
import { LanguageToggle } from "../components/LanguageToggle";
import { SortSelect } from "../components/SortSelect";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-570355f0`;
const USER_ID = "default-user";

const fallbackWebsites = initialWebsites.map((w) => ({
  ...w,
  votes: { up: 0, down: 0 },
  ratings: [],
  averageRating: 0,
}));

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
      console.log(`Retry ${i + 1}/${retries} for ${url}, waiting ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay * (i + 1)));
    }
  }
  throw new Error("Max retries reached");
}

export function HomePage() {
  const t = useT();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [viewMode, setViewMode] = useState("grid");
  const [websites, setWebsites] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminMode, setAdminMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [customCategories, setCustomCategories] = useState([]);
  const [dragEnabled, setDragEnabled] = useState(false);
  const [hasOrderChanged, setHasOrderChanged] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [sortMode, setSortMode] = useState("default");

  // Merge default + custom categories
  const allCategories = useMemo(() => {
    const defaultWithoutAll = defaultCategories.filter((c) => c !== "Tất cả");
    const merged = new Set([...defaultWithoutAll, ...customCategories]);
    return ["Tất cả", ...Array.from(merged)];
  }, [customCategories]);

  // Category counts for the manager
  const websiteCounts = useMemo(() => {
    const counts = {};
    for (const w of websites) {
      counts[w.category] = (counts[w.category] || 0) + 1;
    }
    return counts;
  }, [websites]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (
      savedTheme === "dark" ||
      (!savedTheme &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
    }

    // Verify admin token with the server
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

  useEffect(() => {
    fetchWebsites();
    fetchFavorites();
    fetchCustomCategories();
  }, []);

  const fetchCustomCategories = async () => {
    try {
      const response = await fetchWithRetry(`${API_URL}/categories`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCustomCategories(data);
      }
    } catch (error) {
      console.warn("Failed to fetch custom categories:", error);
    }
  };

  const fetchWebsites = async () => {
    try {
      const response = await fetchWithRetry(`${API_URL}/websites`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });

      if (!response.ok) {
        console.warn("Server not available, using local data");
        setWebsites(fallbackWebsites);
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (data.length === 0) {
        await initializeData();
      } else {
        setWebsites(data);
      }
    } catch (error) {
      console.warn("Server connection failed, using local data:", error);
      setWebsites(fallbackWebsites);
      toast.info(t(tr.home.usingLocalData));
    } finally {
      setLoading(false);
    }
  };

  const initializeData = async () => {
    try {
      const response = await fetch(`${API_URL}/init-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ websites: initialWebsites }),
      });
      if (!response.ok) throw new Error("Failed to initialize data");
      await fetchWebsites();
      toast.success(t(tr.home.initSuccess));
    } catch (error) {
      console.error("Error initializing data:", error);
      toast.error(t(tr.home.initError));
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await fetchWithRetry(`${API_URL}/favorites?userId=${USER_ID}`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      if (!response.ok) throw new Error("Failed to fetch favorites");
      const data = await response.json();
      setFavorites(data);
    } catch (error) {
      console.warn("Favorites fetch failed, using empty list:", error);
    }
  };

  const handleAddWebsite = async (websiteData) => {
    try {
      const token = getAdminToken();
      const response = await fetch(`${API_URL}/websites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
          "X-Admin-Token": token || "",
        },
        body: JSON.stringify(websiteData),
      });
      if (!response.ok) throw new Error("Failed to add website");
      const newWebsite = await response.json();
      setWebsites([...websites, newWebsite]);
    } catch (error) {
      console.error("Error adding website:", error);
      toast.error(t(tr.home.addError));
    }
  };

  const handleUpdateWebsite = async (updatedWebsite) => {
    try {
      const token = getAdminToken();
      const response = await fetch(
        `${API_URL}/websites/${updatedWebsite.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
            "X-Admin-Token": token || "",
          },
          body: JSON.stringify(updatedWebsite),
        }
      );
      if (!response.ok) throw new Error("Failed to update website");
      const data = await response.json();
      setWebsites(websites.map((w) => (w.id === data.id ? data : w)));
    } catch (error) {
      console.error("Error updating website:", error);
      toast.error(t(tr.home.updateError));
    }
  };

  const handleDeleteWebsite = async (websiteId) => {
    try {
      const token = getAdminToken();
      const response = await fetch(`${API_URL}/websites/${websiteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "X-Admin-Token": token || "",
        },
      });
      if (!response.ok) throw new Error("Failed to delete website");
      setWebsites(websites.filter((w) => w.id !== websiteId));
    } catch (error) {
      console.error("Error deleting website:", error);
      toast.error(t(tr.home.deleteError));
    }
  };

  const handleVote = async (websiteId, type) => {
    const updatedWebsites = websites.map((w) => {
      if (w.id === websiteId) {
        const newVotes = { ...w.votes };
        newVotes[type] = (newVotes[type] || 0) + 1;
        return { ...w, votes: newVotes };
      }
      return w;
    });
    setWebsites(updatedWebsites);

    try {
      const response = await fetch(`${API_URL}/websites/${websiteId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ type }),
      });
      if (!response.ok) {
        console.warn("Server not available for voting");
        return;
      }
      const { votes } = await response.json();
      setWebsites(
        websites.map((w) => (w.id === websiteId ? { ...w, votes } : w))
      );
    } catch (error) {
      console.warn("Voting failed, using local state:", error);
    }
  };

  const handleRate = async (
    websiteId,
    rating,
    comment
  ) => {
    const updatedWebsites = websites.map((w) => {
      if (w.id === websiteId) {
        const newRatings = [
          ...(w.ratings || []),
          { rating, comment, timestamp: new Date().toISOString() },
        ];
        const totalRating = newRatings.reduce(
          (sum, r) => sum + r.rating,
          0
        );
        const averageRating = totalRating / newRatings.length;
        return { ...w, ratings: newRatings, averageRating };
      }
      return w;
    });
    setWebsites(updatedWebsites);

    try {
      const response = await fetch(`${API_URL}/websites/${websiteId}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ rating, comment }),
      });
      if (!response.ok) {
        console.warn("Server not available for rating");
        return;
      }
      const websiteResponse = await fetch(
        `${API_URL}/websites/${websiteId}`,
        { headers: { Authorization: `Bearer ${publicAnonKey}` } }
      );
      if (websiteResponse.ok) {
        const updatedWebsite = await websiteResponse.json();
        setWebsites(
          websites.map((w) => (w.id === websiteId ? updatedWebsite : w))
        );
      }
    } catch (error) {
      console.warn("Rating failed, using local state:", error);
    }
  };

  const handleToggleFavorite = async (websiteId) => {
    const newFavorites = favorites.includes(websiteId)
      ? favorites.filter((id) => id !== websiteId)
      : [...favorites, websiteId];
    setFavorites(newFavorites);

    try {
      if (favorites.includes(websiteId)) {
        const response = await fetch(
          `${API_URL}/favorites/${websiteId}?userId=${USER_ID}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${publicAnonKey}` },
          }
        );
        if (!response.ok) {
          console.warn("Server not available for favorites");
          return;
        }
        const { favorites: serverFavorites } = await response.json();
        setFavorites(serverFavorites);
      } else {
        const response = await fetch(`${API_URL}/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ websiteId, userId: USER_ID }),
        });
        if (!response.ok) {
          console.warn("Server not available for favorites");
          return;
        }
        const { favorites: serverFavorites } = await response.json();
        setFavorites(serverFavorites);
      }
    } catch (error) {
      console.warn("Toggle favorite failed, using local state:", error);
    }
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
  };

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
    setIsAdmin(false);
    setAdminMode(false);
    setDragEnabled(false);
    setHasOrderChanged(false);
    toast.success(t(tr.admin.logoutSuccess));
  };

  useEffect(() => {
    if (!isAdmin && adminMode) {
      setAdminMode(false);
      setDragEnabled(false);
      setHasOrderChanged(false);
    }
  }, [isAdmin, adminMode]);

  // ── Category CRUD ────────────────────────────────────────────────────
  const handleAddCategory = async (name) => {
    setCustomCategories((prev) => [...prev, name]);
    try {
      const token = getAdminToken();
      await fetch(`${API_URL}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
          "X-Admin-Token": token || "",
        },
        body: JSON.stringify({ name }),
      });
    } catch (error) {
      console.warn("Failed to save category to server:", error);
    }
  };

  const handleDeleteCategory = async (name) => {
    setCustomCategories((prev) => prev.filter((c) => c !== name));
    // Move local websites in this category to "Khác"
    setWebsites((prev) =>
      prev.map((w) =>
        w.category === name ? { ...w, category: "Khác" } : w
      )
    );
    if (!customCategories.includes("Khác") && websites.some((w) => w.category === name)) {
      setCustomCategories((prev) => [...prev.filter((c) => c !== name), "Khác"]);
    }
    try {
      const token = getAdminToken();
      await fetch(`${API_URL}/categories/${encodeURIComponent(name)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "X-Admin-Token": token || "",
        },
      });
    } catch (error) {
      console.warn("Failed to delete category on server:", error);
    }
  };

  const handleRenameCategory = async (oldName, newName) => {
    setCustomCategories((prev) =>
      prev.map((c) => (c === oldName ? newName : c))
    );
    setWebsites((prev) =>
      prev.map((w) =>
        w.category === oldName ? { ...w, category: newName } : w
      )
    );
    try {
      const token = getAdminToken();
      await fetch(`${API_URL}/categories/rename`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
          "X-Admin-Token": token || "",
        },
        body: JSON.stringify({ oldName, newName }),
      });
    } catch (error) {
      console.warn("Failed to rename category on server:", error);
    }
  };

  // ── Drag & Drop reorder ──────────────────────────────────────────────
  const moveItem = useCallback(
    (dragIndex, hoverIndex) => {
      setWebsites((prev) => {
        const updated = [...prev];
        const [removed] = updated.splice(dragIndex, 1);
        updated.splice(hoverIndex, 0, removed);
        return updated;
      });
      setHasOrderChanged(true);
    },
    []
  );

  const handleSaveOrder = async () => {
    setSavingOrder(true);
    try {
      const orderedIds = websites.map((w) => w.id);
      const token = getAdminToken();
      const response = await fetch(`${API_URL}/websites/reorder`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
          "X-Admin-Token": token || "",
        },
        body: JSON.stringify({ orderedIds }),
      });
      if (!response.ok) throw new Error("Failed to save order");
      setHasOrderChanged(false);
      toast.success(t(tr.home.orderSaved));
    } catch (error) {
      console.error("Error saving order:", error);
      toast.error(t(tr.home.orderSaveError));
    } finally {
      setSavingOrder(false);
    }
  };

  const filteredWebsites = useMemo(() => {
    const term = searchTerm.toLowerCase();
    let result = websites.filter((website) => {
      const matchesSearch =
        website.name.toLowerCase().includes(term) ||
        website.description.toLowerCase().includes(term) ||
        (website.tags || []).some((tag) => tag.toLowerCase().includes(term)) ||
        (website.category || "").toLowerCase().includes(term);
      const matchesCategory =
        selectedCategory === "Tất cả" ||
        website.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Apply sorting
    if (sortMode !== "default") {
      result = [...result].sort((a, b) => {
        switch (sortMode) {
          case "name-az":
            return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
          case "name-za":
            return b.name.localeCompare(a.name, undefined, { sensitivity: "base" });
          case "newest":
            return (b.createdAt || "").localeCompare(a.createdAt || "");
          case "oldest":
            return (a.createdAt || "").localeCompare(b.createdAt || "");
          case "recently-updated":
            return (b.updatedAt || b.createdAt || "").localeCompare(a.updatedAt || a.createdAt || "");
          default:
            return 0;
        }
      });
    }

    return result;
  }, [websites, searchTerm, selectedCategory, sortMode]);

  // When drag mode is on and there's a search filter, disable drag (can't reorder filtered subset)
  const canDrag = dragEnabled && searchTerm === "" && selectedCategory === "Tất cả";

  const getGridClass = () => {
    switch (viewMode) {
      case "grid":
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";
      case "cards":
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";
      case "list":
        return "border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden";
      default:
        return "";
    }
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

  const renderWebsiteList = () => {
    const items = [];
    filteredWebsites.forEach((website, index) => {
      items.push(
        canDrag ? (
          <DraggableWebsiteItem
            key={website.id}
            website={website}
            index={index}
            viewMode={viewMode}
            isFavorite={favorites.includes(website.id)}
            categories={allCategories}
            onVote={handleVote}
            onRate={handleRate}
            onToggleFavorite={handleToggleFavorite}
            onUpdate={handleUpdateWebsite}
            onDelete={handleDeleteWebsite}
            showAdminActions={adminMode}
            onMoveItem={moveItem}
            isDragEnabled={true}
          />
        ) : (
          <WebsiteItem
            key={website.id}
            website={website}
            viewMode={viewMode}
            isFavorite={favorites.includes(website.id)}
            categories={allCategories}
            onVote={handleVote}
            onRate={handleRate}
            onToggleFavorite={handleToggleFavorite}
            onUpdate={handleUpdateWebsite}
            onDelete={handleDeleteWebsite}
            showAdminActions={adminMode}
          />
        )
      );
    });
    return items;
  };

  const websiteList = (
    <div className={getGridClass()}>
      {renderWebsiteList()}
    </div>
  );

  return (
    <PageTransition>
      {/* Top Navigation */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t(tr.common.home)}
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/changelog">
              <Button variant="ghost" size="sm" className="gap-2 text-gray-500">
                <CalendarDays className="h-4 w-4" />
                <span className="hidden sm:inline">{t(tr.home.changelog)}</span>
              </Button>
            </Link>
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex gap-4 px-4 pb-4">
        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full">
          {/* Header */}
          <header className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {t(tr.home.title)}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t(tr.home.subtitle)}
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Controls */}
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    {isAdmin ? (
                      <div className="flex items-center gap-2">
                        <Switch
                          id="admin-mode"
                          checked={adminMode}
                          onCheckedChange={setAdminMode}
                        />
                        <Label htmlFor="admin-mode" className="cursor-pointer">
                          {t(tr.admin.adminMode)}
                        </Label>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t(tr.admin.loginToAccess)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <AdminLogin
                      isAdmin={isAdmin}
                      onLoginSuccess={handleAdminLogin}
                      onLogout={handleAdminLogout}
                    />
                    {adminMode && (
                      <>
                        <AddWebsiteDialog
                          categories={allCategories}
                          onAdd={handleAddWebsite}
                        />
                        <CategoryManager
                          categories={allCategories}
                          onAddCategory={handleAddCategory}
                          onDeleteCategory={handleDeleteCategory}
                          onRenameCategory={handleRenameCategory}
                          websiteCounts={websiteCounts}
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Drag reorder toggle */}
                {adminMode && (
                  <div className="flex items-center justify-between gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-5 w-5 text-blue-500" />
                      <div className="flex items-center gap-2">
                        <Switch
                          id="drag-mode"
                          checked={dragEnabled}
                          onCheckedChange={(checked) => {
                            setDragEnabled(checked);
                            if (!checked) {
                              setHasOrderChanged(false);
                            }
                            if (checked && (searchTerm !== "" || selectedCategory !== "Tất cả")) {
                              toast.info(t(tr.home.dragFilterInfo));
                            }
                          }}
                        />
                        <Label htmlFor="drag-mode" className="cursor-pointer text-sm font-medium text-blue-700 dark:text-blue-300">
                          {t(tr.home.dragToReorder)}
                        </Label>
                      </div>
                    </div>
                    {hasOrderChanged && (
                      <Button
                        size="sm"
                        onClick={handleSaveOrder}
                        disabled={savingOrder}
                        className="gap-1.5 bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="h-4 w-4" />
                        {savingOrder ? t(tr.home.savingOrder) : t(tr.home.saveOrder)}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                categories={allCategories}
              />
              <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
              <SortSelect
                sortMode={sortMode}
                onSortModeChange={setSortMode}
              />
            </div>
          </header>

          {/* Results Count */}
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t(tr.home.found)}{" "}
              <span className="font-semibold">{filteredWebsites.length}</span>{" "}
              {t(tr.home.website)}
            </span>
            {canDrag && (
              <span className="text-xs text-blue-500 dark:text-blue-400 flex items-center gap-1">
                <GripVertical className="h-3.5 w-3.5" />
                {t(tr.home.dragHint)}
              </span>
            )}
            {dragEnabled && !canDrag && (
              <span className="text-xs text-amber-500 dark:text-amber-400">
                {t(tr.home.dragFilterHint)}
              </span>
            )}
          </div>

          {/* Website Grid/List */}
          {filteredWebsites.length > 0 ? (
            canDrag ? (
              <DndProvider backend={HTML5Backend}>
                {websiteList}
              </DndProvider>
            ) : (
              websiteList
            )
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {t(tr.home.noResults)}
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                {t(tr.home.noResultsHint)}
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Changelog teaser link */}
      <div className="max-w-7xl mx-auto px-4 mt-8 mb-2">
        <Link to="/changelog">
          <div className="group flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white flex-shrink-0">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {t(tr.changelog.title)}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t(tr.about.changelogDesc)}
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
        </Link>
      </div>

      {/* Footer */}
      <footer className="mt-8 py-8 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <SocialLinks />
          <div className="mt-6 text-center border-t border-gray-200 dark:border-gray-700 pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t(tr.common.copyright)}
            </p>
          </div>
        </div>
      </footer>
    </PageTransition>
  );
}