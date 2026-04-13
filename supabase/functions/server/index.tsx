import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { hash, compare } from "npm:bcryptjs@2.4.3";
import * as kv from "./kv_store.tsx";

const app = new Hono().basePath("/make-server-570355f0");

// ── Security helpers ────────────────────────────────────────────────────

const ADMIN_TOKEN_PREFIX = "admin_token:";
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MIN_PASSWORD_LENGTH = 8;

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function createSession(token: string): Promise<void> {
  await kv.set(`${ADMIN_TOKEN_PREFIX}${token}`, {
    createdAt: Date.now(),
    expiresAt: Date.now() + TOKEN_TTL_MS,
  });
}

async function validateSession(token: string): Promise<boolean> {
  if (!token) return false;
  const session = await kv.get(`${ADMIN_TOKEN_PREFIX}${token}`);
  if (!session) return false;
  if (Date.now() > session.expiresAt) {
    await kv.del(`${ADMIN_TOKEN_PREFIX}${token}`);
    return false;
  }
  return true;
}

async function destroySession(token: string): Promise<void> {
  await kv.del(`${ADMIN_TOKEN_PREFIX}${token}`);
}

function extractAdminToken(c: any): string {
  const authHeader = c.req.header("X-Admin-Token") || "";
  return authHeader;
}

// Input validation helpers
const MAX_NAME_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_URL_LENGTH = 2048;
const MAX_CATEGORY_LENGTH = 100;
const MAX_TAG_LENGTH = 50;
const MAX_TAGS_COUNT = 20;
const MAX_COMMENT_LENGTH = 1000;
const ALLOWED_URL_PROTOCOLS = ["https:", "http:"];

function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_URL_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
}

function sanitizeString(str: string, maxLength: number): string {
  return String(str).trim().slice(0, maxLength);
}

// ── CORS configuration ──────────────────────────────────────────────────

const allowedOrigins = Deno.env.get("CORS_ALLOWED_ORIGINS");
const corsOrigin = allowedOrigins
  ? allowedOrigins.split(",").map((o: string) => o.trim())
  : [
      `https://abjgklbrcywkieakkxoq.supabase.co`,
      "http://localhost:5173",
      "http://localhost:3000",
    ];

app.use("*", logger(console.log));
app.use(
  "*",
  cors({
    origin: corsOrigin,
    allowHeaders: ["Content-Type", "Authorization", "X-Admin-Token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

// ── Admin auth middleware ────────────────────────────────────────────────

async function requireAdmin(c: any, next: () => Promise<void>) {
  const token = extractAdminToken(c);
  if (!token) {
    return c.json({ error: "Authentication required" }, 401);
  }
  const valid = await validateSession(token);
  if (!valid) {
    return c.json({ error: "Invalid or expired session" }, 401);
  }
  await next();
}

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// ── Websites ────────────────────────────────────────────────────────────

// ── Reorder websites (admin only, must be before :id routes) ─────────
app.put("/websites/reorder", requireAdmin, async (c) => {
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
  } catch {
    return c.json({ error: "Failed to reorder websites" }, 500);
  }
});

app.get("/websites", async (c) => {
  try {
    const websites = (await kv.get("websites:all")) || [];
    return c.json(websites);
  } catch {
    return c.json({ error: "Failed to fetch websites" }, 500);
  }
});

app.get("/websites/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const website = await kv.get(`website:${id}`);
    if (!website) return c.json({ error: "Website not found" }, 404);
    return c.json(website);
  } catch {
    return c.json({ error: "Failed to fetch website" }, 500);
  }
});

app.post("/websites", requireAdmin, async (c) => {
  try {
    const body = await c.req.json();
    const { name, description, url, category, tags, icon } = body;

    if (!name || !description || !url || !category) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const cleanName = sanitizeString(name, MAX_NAME_LENGTH);
    const cleanDesc = sanitizeString(description, MAX_DESCRIPTION_LENGTH);
    const cleanUrl = sanitizeString(url, MAX_URL_LENGTH);
    const cleanCategory = sanitizeString(category, MAX_CATEGORY_LENGTH);

    if (!validateUrl(cleanUrl)) {
      return c.json({ error: "Invalid URL. Only http and https protocols are allowed." }, 400);
    }

    const cleanTags = Array.isArray(tags)
      ? tags.slice(0, MAX_TAGS_COUNT).map((t: string) => sanitizeString(t, MAX_TAG_LENGTH))
      : [];

    const websites = (await kv.get("websites:all")) || [];
    const id = crypto.randomUUID();

    const newWebsite = {
      id,
      name: cleanName,
      description: cleanDesc,
      url: cleanUrl,
      category: cleanCategory,
      tags: cleanTags,
      icon: icon ? sanitizeString(icon, 4) : "🌐",
      votes: { up: 0, down: 0 },
      ratings: [],
      averageRating: 0,
      createdAt: new Date().toISOString(),
    };

    websites.push(newWebsite);
    await kv.set("websites:all", websites);
    await kv.set(`website:${id}`, newWebsite);

    return c.json(newWebsite, 201);
  } catch {
    return c.json({ error: "Failed to create website" }, 500);
  }
});

app.put("/websites/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    const websites = (await kv.get("websites:all")) || [];
    const idx = websites.findIndex((w: any) => w.id === id);

    if (idx === -1) return c.json({ error: "Website not found" }, 404);

    // Validate URL if provided
    if (body.url) {
      const cleanUrl = sanitizeString(body.url, MAX_URL_LENGTH);
      if (!validateUrl(cleanUrl)) {
        return c.json({ error: "Invalid URL. Only http and https protocols are allowed." }, 400);
      }
      body.url = cleanUrl;
    }

    // Sanitize fields if provided
    if (body.name) body.name = sanitizeString(body.name, MAX_NAME_LENGTH);
    if (body.description) body.description = sanitizeString(body.description, MAX_DESCRIPTION_LENGTH);
    if (body.category) body.category = sanitizeString(body.category, MAX_CATEGORY_LENGTH);
    if (body.tags && Array.isArray(body.tags)) {
      body.tags = body.tags.slice(0, MAX_TAGS_COUNT).map((t: string) => sanitizeString(t, MAX_TAG_LENGTH));
    }

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
  } catch {
    return c.json({ error: "Failed to update website" }, 500);
  }
});

app.delete("/websites/:id", requireAdmin, async (c) => {
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
  } catch {
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
  } catch {
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

    const cleanComment = comment
      ? sanitizeString(comment, MAX_COMMENT_LENGTH)
      : "";

    const websites = (await kv.get("websites:all")) || [];
    const idx = websites.findIndex((w: any) => w.id === id);

    if (idx === -1) return c.json({ error: "Website not found" }, 404);

    if (!websites[idx].ratings) websites[idx].ratings = [];

    websites[idx].ratings.push({
      rating,
      comment: cleanComment,
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
  } catch {
    return c.json({ error: "Failed to rate website" }, 500);
  }
});

// ── Favorites ───────────────────────────────────────────────────────────

app.get("/favorites", async (c) => {
  try {
    const userId = c.req.query("userId") || "default-user";
    const favorites = (await kv.get(`favorites:${userId}`)) || [];
    return c.json(favorites);
  } catch {
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
  } catch {
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
  } catch {
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
  } catch {
    return c.json({ error: "Failed to initialize data" }, 500);
  }
});

// ── About Page Content ──────────────────────────────────────────────────

app.get("/about", async (c) => {
  try {
    const content = await kv.get("about:content");
    return c.json(content || null);
  } catch {
    return c.json({ error: "Failed to fetch about content" }, 500);
  }
});

app.put("/about", requireAdmin, async (c) => {
  try {
    const body = await c.req.json();
    await kv.set("about:content", body);
    return c.json(body);
  } catch {
    return c.json({ error: "Failed to update about content" }, 500);
  }
});

// ── Admin Auth ──────────────────────────────────────────────────────────

async function getStoredPasswordHash(): Promise<string | null> {
  return await kv.get("admin:password_hash");
}

app.post("/admin/login", async (c) => {
  try {
    const { password } = await c.req.json();
    if (!password) {
      return c.json({ error: "Password is required" }, 400);
    }

    const storedHash = await getStoredPasswordHash();

    if (!storedHash) {
      // No password has been set yet — require initial setup via /admin/setup
      return c.json({
        success: false,
        error: "Admin account not set up. Use the setup endpoint first.",
      }, 403);
    }

    const isMatch = await compare(password, storedHash);
    if (isMatch) {
      const token = generateToken();
      await createSession(token);
      return c.json({ success: true, message: "Login successful", token });
    } else {
      return c.json({ success: false, error: "Incorrect password" }, 401);
    }
  } catch {
    return c.json({ error: "Login failed" }, 500);
  }
});

app.post("/admin/logout", async (c) => {
  try {
    const token = extractAdminToken(c);
    if (token) {
      await destroySession(token);
    }
    return c.json({ success: true, message: "Logged out successfully" });
  } catch {
    return c.json({ error: "Logout failed" }, 500);
  }
});

app.post("/admin/setup", async (c) => {
  try {
    const existingHash = await getStoredPasswordHash();
    if (existingHash) {
      return c.json({ error: "Admin account already set up. Use change-password to update." }, 409);
    }

    const { password } = await c.req.json();
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      return c.json({
        error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      }, 400);
    }

    const hashed = await hash(password, 10);
    await kv.set("admin:password_hash", hashed);

    const token = generateToken();
    await createSession(token);

    return c.json({ success: true, message: "Admin account created", token });
  } catch {
    return c.json({ error: "Failed to set up admin account" }, 500);
  }
});

app.put("/admin/change-password", requireAdmin, async (c) => {
  try {
    const { currentPassword, newPassword } = await c.req.json();

    if (!currentPassword || !newPassword) {
      return c.json({ error: "Current and new passwords are required" }, 400);
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return c.json({
        error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      }, 400);
    }

    const storedHash = await getStoredPasswordHash();
    if (!storedHash) {
      return c.json({ error: "No password set" }, 400);
    }

    const isMatch = await compare(currentPassword, storedHash);
    if (!isMatch) {
      return c.json({ success: false, error: "Current password is incorrect" }, 401);
    }

    const newHash = await hash(newPassword, 10);
    await kv.set("admin:password_hash", newHash);

    return c.json({ success: true, message: "Password changed successfully" });
  } catch {
    return c.json({ error: "Failed to change password" }, 500);
  }
});

app.get("/admin/verify", async (c) => {
  try {
    const token = extractAdminToken(c);
    const valid = await validateSession(token);
    return c.json({ valid });
  } catch {
    return c.json({ valid: false });
  }
});

// ── Categories (admin only for mutations) ───────────────────────────────

app.get("/categories", async (c) => {
  try {
    const customCategories = (await kv.get("categories:custom")) || [];
    return c.json(customCategories);
  } catch {
    return c.json({ error: "Failed to fetch categories" }, 500);
  }
});

app.post("/categories", requireAdmin, async (c) => {
  try {
    const { name } = await c.req.json();
    if (!name || !name.trim()) {
      return c.json({ error: "Category name is required" }, 400);
    }

    const trimmed = sanitizeString(name, MAX_CATEGORY_LENGTH);
    const customCategories = (await kv.get("categories:custom")) || [];

    if (customCategories.includes(trimmed)) {
      return c.json({ error: "Category already exists" }, 409);
    }

    customCategories.push(trimmed);
    await kv.set("categories:custom", customCategories);

    return c.json({ categories: customCategories }, 201);
  } catch {
    return c.json({ error: "Failed to add category" }, 500);
  }
});

app.delete("/categories/:name", requireAdmin, async (c) => {
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
  } catch {
    return c.json({ error: "Failed to delete category" }, 500);
  }
});

app.put("/categories/rename", requireAdmin, async (c) => {
  try {
    const { oldName, newName } = await c.req.json();
    if (!oldName || !newName || !newName.trim()) {
      return c.json({ error: "Both old and new names are required" }, 400);
    }

    const trimmedNew = sanitizeString(newName, MAX_CATEGORY_LENGTH);
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
  } catch {
    return c.json({ error: "Failed to rename category" }, 500);
  }
});

Deno.serve(app.fetch);
