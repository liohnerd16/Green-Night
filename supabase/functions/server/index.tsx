import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono().basePath("/make-server-570355f0");

app.use("*", logger(console.log));
app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// ── Websites ────────────────────────────────────────────────────────────

// ── Reorder websites (must be before :id routes) ────────────────────────
app.put("/websites/reorder", async (c) => {
  try {
    const { orderedIds } = await c.req.json();
    if (!orderedIds || !Array.isArray(orderedIds)) {
      return c.json({ error: "orderedIds array is required" }, 400);
    }

    const websites = (await kv.get("websites:all")) || [];
    const websiteMap = new Map(websites.map((w: any) => [w.id, w]));

    const reordered: any[] = [];
    for (const id of orderedIds) {
      const w = websiteMap.get(id);
      if (w) {
        reordered.push(w);
        websiteMap.delete(id);
      }
    }
    for (const w of websiteMap.values()) {
      reordered.push(w);
    }

    await kv.set("websites:all", reordered);

    return c.json({ message: "Reorder successful", count: reordered.length });
  } catch (error) {
    console.log("Error reordering websites:", error);
    return c.json({ error: "Failed to reorder websites" }, 500);
  }
});

app.get("/websites", async (c) => {
  try {
    const websites = (await kv.get("websites:all")) || [];
    return c.json(websites);
  } catch (error) {
    console.log("Error fetching websites:", error);
    return c.json({ error: "Failed to fetch websites" }, 500);
  }
});

app.get("/websites/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const website = await kv.get(`website:${id}`);
    if (!website) return c.json({ error: "Website not found" }, 404);
    return c.json(website);
  } catch (error) {
    console.log("Error fetching website:", error);
    return c.json({ error: "Failed to fetch website" }, 500);
  }
});

app.post("/websites", async (c) => {
  try {
    const body = await c.req.json();
    const { name, description, url, category, tags, icon } = body;

    if (!name || !description || !url || !category) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const websites = (await kv.get("websites:all")) || [];
    const id = Date.now().toString();

    const newWebsite = {
      id,
      name,
      description,
      url,
      category,
      tags: tags || [],
      icon: icon || "🌐",
      votes: { up: 0, down: 0 },
      ratings: [],
      averageRating: 0,
      createdAt: new Date().toISOString(),
    };

    websites.push(newWebsite);
    await kv.set("websites:all", websites);
    await kv.set(`website:${id}`, newWebsite);

    return c.json(newWebsite, 201);
  } catch (error) {
    console.log("Error creating website:", error);
    return c.json({ error: "Failed to create website" }, 500);
  }
});

app.put("/websites/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    const websites = (await kv.get("websites:all")) || [];
    const idx = websites.findIndex((w: any) => w.id === id);

    if (idx === -1) return c.json({ error: "Website not found" }, 404);

    const updatedWebsite = {
      ...websites[idx],
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };

    websites[idx] = updatedWebsite;
    await kv.set("websites:all", websites);
    await kv.set(`website:${id}`, updatedWebsite);

    return c.json(updatedWebsite);
  } catch (error) {
    console.log("Error updating website:", error);
    return c.json({ error: "Failed to update website" }, 500);
  }
});

app.delete("/websites/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const websites = (await kv.get("websites:all")) || [];
    const filtered = websites.filter((w: any) => w.id !== id);

    if (filtered.length === websites.length) {
      return c.json({ error: "Website not found" }, 404);
    }

    await kv.set("websites:all", filtered);
    await kv.del(`website:${id}`);

    return c.json({ message: "Website deleted successfully" });
  } catch (error) {
    console.log("Error deleting website:", error);
    return c.json({ error: "Failed to delete website" }, 500);
  }
});

// ── Votes ───────────────────────────────────────────────────────────────

app.post("/websites/:id/vote", async (c) => {
  try {
    const id = c.req.param("id");
    const { type } = await c.req.json();

    if (type !== "up" && type !== "down") {
      return c.json({ error: "Invalid vote type" }, 400);
    }

    const websites = (await kv.get("websites:all")) || [];
    const idx = websites.findIndex((w: any) => w.id === id);

    if (idx === -1) return c.json({ error: "Website not found" }, 404);

    if (!websites[idx].votes) {
      websites[idx].votes = { up: 0, down: 0 };
    }
    websites[idx].votes[type] += 1;

    await kv.set("websites:all", websites);
    await kv.set(`website:${id}`, websites[idx]);

    return c.json({ votes: websites[idx].votes });
  } catch (error) {
    console.log("Error voting on website:", error);
    return c.json({ error: "Failed to vote on website" }, 500);
  }
});

// ── Ratings ─────────────────────────────────────────────────────────────

app.post("/websites/:id/rate", async (c) => {
  try {
    const id = c.req.param("id");
    const { rating, comment } = await c.req.json();

    if (!rating || rating < 1 || rating > 5) {
      return c.json({ error: "Rating must be between 1 and 5" }, 400);
    }

    const websites = (await kv.get("websites:all")) || [];
    const idx = websites.findIndex((w: any) => w.id === id);

    if (idx === -1) return c.json({ error: "Website not found" }, 404);

    if (!websites[idx].ratings) websites[idx].ratings = [];

    websites[idx].ratings.push({
      rating,
      comment: comment || "",
      timestamp: new Date().toISOString(),
    });

    const total = websites[idx].ratings.reduce(
      (s: number, r: any) => s + r.rating,
      0
    );
    websites[idx].averageRating = total / websites[idx].ratings.length;

    await kv.set("websites:all", websites);
    await kv.set(`website:${id}`, websites[idx]);

    return c.json({
      averageRating: websites[idx].averageRating,
      totalRatings: websites[idx].ratings.length,
    });
  } catch (error) {
    console.log("Error rating website:", error);
    return c.json({ error: "Failed to rate website" }, 500);
  }
});

// ── Favorites ───────────────────────────────────────────────────────────

app.get("/favorites", async (c) => {
  try {
    const userId = c.req.query("userId") || "default-user";
    const favorites = (await kv.get(`favorites:${userId}`)) || [];
    return c.json(favorites);
  } catch (error) {
    console.log("Error fetching favorites:", error);
    return c.json({ error: "Failed to fetch favorites" }, 500);
  }
});

app.post("/favorites", async (c) => {
  try {
    const { websiteId, userId = "default-user" } = await c.req.json();

    if (!websiteId) {
      return c.json({ error: "Website ID is required" }, 400);
    }

    const favorites = (await kv.get(`favorites:${userId}`)) || [];

    if (!favorites.includes(websiteId)) {
      favorites.push(websiteId);
      await kv.set(`favorites:${userId}`, favorites);
    }

    return c.json({ favorites });
  } catch (error) {
    console.log("Error adding to favorites:", error);
    return c.json({ error: "Failed to add to favorites" }, 500);
  }
});

app.delete("/favorites/:websiteId", async (c) => {
  try {
    const websiteId = c.req.param("websiteId");
    const userId = c.req.query("userId") || "default-user";

    const favorites = (await kv.get(`favorites:${userId}`)) || [];
    const filtered = favorites.filter((id: string) => id !== websiteId);

    await kv.set(`favorites:${userId}`, filtered);

    return c.json({ favorites: filtered });
  } catch (error) {
    console.log("Error removing from favorites:", error);
    return c.json({ error: "Failed to remove from favorites" }, 500);
  }
});

// ── Init data ───────────────────────────────────────────────────────────

app.post("/init-data", async (c) => {
  try {
    const existing = await kv.get("websites:all");

    if (existing && Array.isArray(existing) && existing.length > 0) {
      return c.json({ message: "Database already initialized" });
    }

    const { websites } = await c.req.json();

    if (!websites || !Array.isArray(websites)) {
      return c.json({ error: "Invalid websites data" }, 400);
    }

    const enriched = websites.map((w: any) => ({
      ...w,
      votes: { up: 0, down: 0 },
      ratings: [],
      averageRating: 0,
      createdAt: new Date().toISOString(),
    }));

    await kv.set("websites:all", enriched);

    for (const website of enriched) {
      await kv.set(`website:${website.id}`, website);
    }

    return c.json({
      message: "Database initialized successfully",
      count: enriched.length,
    });
  } catch (error) {
    console.log("Error initializing data:", error);
    return c.json({ error: "Failed to initialize data" }, 500);
  }
});

// ── Categories ──────────────────────────────────────────────────────────

// ── Admin Auth ──────────────────────────────────────────────────────────

// ── About Page Content ──────────────────────────────────────────────────

app.get("/about", async (c) => {
  try {
    const content = await kv.get("about:content");
    return c.json(content || null);
  } catch (error) {
    console.log("Error fetching about content:", error);
    return c.json({ error: "Failed to fetch about content" }, 500);
  }
});

app.put("/about", async (c) => {
  try {
    const body = await c.req.json();
    await kv.set("about:content", body);
    return c.json(body);
  } catch (error) {
    console.log("Error updating about content:", error);
    return c.json({ error: "Failed to update about content" }, 500);
  }
});

// ── Admin Auth ──────────────────────────────────────────────────────────

const DEFAULT_ADMIN_PASSWORD = "admin123";

app.post("/admin/login", async (c) => {
  try {
    const { password } = await c.req.json();
    if (!password) {
      return c.json({ error: "Password is required" }, 400);
    }

    const storedPassword = (await kv.get("admin:password")) || DEFAULT_ADMIN_PASSWORD;

    if (password === storedPassword) {
      return c.json({ success: true, message: "Login successful" });
    } else {
      return c.json({ success: false, error: "Incorrect password" }, 401);
    }
  } catch (error) {
    console.log("Error during admin login:", error);
    return c.json({ error: "Login failed" }, 500);
  }
});

app.put("/admin/change-password", async (c) => {
  try {
    const { currentPassword, newPassword } = await c.req.json();

    if (!currentPassword || !newPassword) {
      return c.json({ error: "Current and new passwords are required" }, 400);
    }

    if (newPassword.length < 4) {
      return c.json({ error: "New password must be at least 4 characters" }, 400);
    }

    const storedPassword = (await kv.get("admin:password")) || DEFAULT_ADMIN_PASSWORD;

    if (currentPassword !== storedPassword) {
      return c.json({ success: false, error: "Current password is incorrect" }, 401);
    }

    await kv.set("admin:password", newPassword);

    return c.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.log("Error changing admin password:", error);
    return c.json({ error: "Failed to change password" }, 500);
  }
});

// ── Categories ──────────────────────────────────────────────────────────

app.get("/categories", async (c) => {
  try {
    const customCategories = (await kv.get("categories:custom")) || [];
    return c.json(customCategories);
  } catch (error) {
    console.log("Error fetching categories:", error);
    return c.json({ error: "Failed to fetch categories" }, 500);
  }
});

app.post("/categories", async (c) => {
  try {
    const { name } = await c.req.json();
    if (!name || !name.trim()) {
      return c.json({ error: "Category name is required" }, 400);
    }

    const customCategories = (await kv.get("categories:custom")) || [];
    const trimmed = name.trim();

    if (customCategories.includes(trimmed)) {
      return c.json({ error: "Category already exists" }, 409);
    }

    customCategories.push(trimmed);
    await kv.set("categories:custom", customCategories);

    return c.json({ categories: customCategories }, 201);
  } catch (error) {
    console.log("Error adding category:", error);
    return c.json({ error: "Failed to add category" }, 500);
  }
});

app.delete("/categories/:name", async (c) => {
  try {
    const name = decodeURIComponent(c.req.param("name"));
    const customCategories = (await kv.get("categories:custom")) || [];
    const filtered = customCategories.filter((cat: string) => cat !== name);
    await kv.set("categories:custom", filtered);

    // Move websites in this category to "Khác"
    const websites = (await kv.get("websites:all")) || [];
    let changed = false;
    for (let i = 0; i < websites.length; i++) {
      if (websites[i].category === name) {
        websites[i].category = "Khác";
        websites[i].updatedAt = new Date().toISOString();
        await kv.set(`website:${websites[i].id}`, websites[i]);
        changed = true;
      }
    }
    if (changed) {
      // Ensure "Khác" exists in custom categories
      if (!filtered.includes("Khác")) {
        filtered.push("Khác");
      }
      await kv.set("websites:all", websites);
      await kv.set("categories:custom", filtered);
    }

    return c.json({ categories: filtered });
  } catch (error) {
    console.log("Error deleting category:", error);
    return c.json({ error: "Failed to delete category" }, 500);
  }
});

app.put("/categories/rename", async (c) => {
  try {
    const { oldName, newName } = await c.req.json();
    if (!oldName || !newName || !newName.trim()) {
      return c.json({ error: "Both old and new names are required" }, 400);
    }

    const trimmedNew = newName.trim();
    const customCategories = (await kv.get("categories:custom")) || [];
    const idx = customCategories.indexOf(oldName);
    if (idx === -1) {
      return c.json({ error: "Category not found" }, 404);
    }

    customCategories[idx] = trimmedNew;
    await kv.set("categories:custom", customCategories);

    // Rename category in all websites
    const websites = (await kv.get("websites:all")) || [];
    for (let i = 0; i < websites.length; i++) {
      if (websites[i].category === oldName) {
        websites[i].category = trimmedNew;
        websites[i].updatedAt = new Date().toISOString();
        await kv.set(`website:${websites[i].id}`, websites[i]);
      }
    }
    await kv.set("websites:all", websites);

    return c.json({ categories: customCategories });
  } catch (error) {
    console.log("Error renaming category:", error);
    return c.json({ error: "Failed to rename category" }, 500);
  }
});

Deno.serve(app.fetch);