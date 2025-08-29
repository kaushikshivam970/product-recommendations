import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// helper to load a JSON file
async function loadJSON(relPath) {
  const abs = path.join(__dirname, "..", "..", relPath);
  const raw = await fs.readFile(abs, "utf8");
  return JSON.parse(raw);
}

// Build co-purchase counts: co[a][b] = how many times A and B are in same basket
function buildCoPurchase(purchases) {
  const co = {};
  for (const row of purchases) {
    const basket = Array.isArray(row.products) ? row.products : [];
    for (let i = 0; i < basket.length; i++) {
      const a = basket[i];
      co[a] ||= {};
      for (let j = 0; j < basket.length; j++) {
        const b = basket[j];
        if (a === b) continue;
        co[a][b] = (co[a][b] || 0) + 1;
      }
    }
  }
  return co;
}

// Build user profiles: what they own + preferences for category/brand/tags
function buildUserProfiles(purchases, byId) {
  const profiles = {};

  for (const row of purchases) {
    const userId = row.userId;
    const basket = Array.isArray(row.products) ? row.products : [];
    if (!userId) continue;

    if (!profiles[userId]) {
      profiles[userId] = {
        owned: {},
        catCount: {},
        brandCount: {},
        tagCount: {},
        total: 0,
      };
    }
    const p = profiles[userId];

    for (const pid of basket) {
      const prod = byId[pid];
      if (!prod) continue;

      p.owned[pid] = true;
      p.total++;

      p.catCount[prod.category] = (p.catCount[prod.category] || 0) + 1;
      p.brandCount[prod.brand] = (p.brandCount[prod.brand] || 0) + 1;

      for (const t of prod.tags || []) {
        p.tagCount[t] = (p.tagCount[t] || 0) + 1;
      }
    }
  }

  // normalize to preferences (0..1)
  for (const userId in profiles) {
    const p = profiles[userId];
    const denom = Math.max(1, p.total);

    function normalize(obj) {
      const out = {};
      for (const k in obj) out[k] = obj[k] / denom;
      return out;
    }

    p.catPref = normalize(p.catCount);
    p.brandPref = normalize(p.brandCount);
    p.tagPref = normalize(p.tagCount);

    delete p.catCount;
    delete p.brandCount;
    delete p.tagCount;
  }

  return profiles;
}

// MAIN: load data fresh every time
export async function getData() {
  const products = await loadJSON("data/products.json");
  const purchases = await loadJSON("data/purchases.json");

  const byId = {};
  for (const prod of products) byId[prod.id] = prod;

  const coPurchase = buildCoPurchase(purchases);
  const userProfiles = buildUserProfiles(purchases, byId);

  return { products, purchases, byId, coPurchase, userProfiles };
}
