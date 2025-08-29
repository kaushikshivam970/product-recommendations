import { getData } from "./dataStoreHelper.mjs";

/**
 * Compare tags between two products.
 * Returns a value between 0 and 1.
 * Example: tagsA = ["running","men"], tagsB = ["running","unisex"]
 * Overlap = 1 common tag / 3 total unique = 0.33
 */
function tagOverlap(tagsA = [], tagsB = []) {
  let common = 0;
  for (const t of tagsA) {
    if (tagsB.includes(t)) common++;
  }
  const totalUnique = new Set([...tagsA, ...tagsB]).size || 1;
  return common / totalUnique;
}

/**
 * Compare prices between two products.
 * Closer prices = higher similarity (0..1).
 */
function priceSimilarity(a, b) {
  const diff = Math.abs(a.price - b.price);
  const denom = (a.price || 1) + 1;
  let sim = 1 - diff / denom;
  if (sim < 0) sim = 0;
  if (sim > 1) sim = 1;
  return sim;
}

/**
 * Compute a "base score" for how similar two products are.
 * - Same category = +3
 * - Same brand = +1
 * - Frequently bought together = +0.5 × co-purchase count
 * - Similar price = +0.5 × priceSimilarity
 * - Tag overlap = +1.5 × tagOverlap
 */
function baseScore(current, candidate, coPurchase) {
  let score = 0;

  if (candidate.category === current.category) score += 3;
  if (candidate.brand === current.brand) score += 1;

  const coCount =
    (coPurchase[current.id] && coPurchase[current.id][candidate.id]) || 0;
  score += 0.5 * coCount;

  score += 0.5 * priceSimilarity(current, candidate);

  score += 1.5 * tagOverlap(current.tags, candidate.tags);

  return { score, co: coCount };
}

// Weights to control how much user preferences matter
const USER_WEIGHTS = {
  category: 1.2,
  brand: 0.8,
  tags: 1.0,
  novelty: 0.5, // bonus if product is not already owned
};

/**
 * Add a "user boost" based on what the user usually buys.
 * Looks at category, brand, and tags preferences from history.
 */
function userBoost(candidate, userProf) {
  if (!userProf) return 0;

  let boost = 0;

  boost += USER_WEIGHTS.category * (userProf.catPref[candidate.category] || 0);
  boost += USER_WEIGHTS.brand * (userProf.brandPref[candidate.brand] || 0);

  const tags = candidate.tags || [];
  if (tags.length > 0) {
    let total = 0;
    for (const t of tags) {
      total += userProf.tagPref[t] || 0;
    }
    boost += USER_WEIGHTS.tags * (total / tags.length);
  }

  if (userProf.owned && !userProf.owned[candidate.id]) {
    boost += USER_WEIGHTS.novelty;
  }

  return boost;
}

/**
 * Main recommendation function.
 * - productId: the product being viewed
 * - topN: how many recommendations to return (default 5)
 * - userId: optional, for personalization
 * - excludeOwned: if true, do not recommend items the user already owns
 */
export async function recommend(
  productId,
  topN = 5,
  userId = null,
  { excludeOwned = true } = {}
) {
  const { products, byId, coPurchase, userProfiles } = await getData();
  const current = byId[productId];
  if (!current) throw new Error("Unknown productId");

  const userProf = userId ? userProfiles[userId] : null;

  const scored = [];
  for (const p of products) {
    if (p.id === productId) continue; // skip current product
    if (excludeOwned && userProf?.owned?.[p.id]) continue; // skip owned

    const { score: base, co } = baseScore(current, p, coPurchase);
    const boost = userBoost(p, userProf);
    const total = base + boost;

    scored.push({
      product: p,
      score: total,
      base,
      boost,
      co,
    });
  }

  // Sort by total score, then by co-purchase, then by price closeness
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.co !== a.co) return b.co - a.co;
    const diffA = Math.abs(a.product.price - current.price);
    const diffB = Math.abs(b.product.price - current.price);
    return diffA - diffB;
  });

  // Return top N with scores included
  return scored.slice(0, topN).map((x) => ({
    ...x.product,
    _score: Number(x.score.toFixed(2)),
    _base: Number(x.base.toFixed(2)),
    _userBoost: Number(x.boost.toFixed(2)),
  }));
}

export async function getAllProducts() {
  const { products } = await getData();
  return products;
}

export async function getAllUsers() {
  const { purchases } = await getData();
  return purchases.map((p) => ({ id: p.userId }));
}
