// Shop simulation. At end of day, generates customers per reputation tier.
// Each customer wants a category at min quality, picks the cheapest matching
// item from the shelf, buys it. Sale gives gold + reputation.

import { state, repTier, removeItem, rng } from "../state.js";
import { ITEMS, priceForItem, CATEGORY_LABELS } from "../data/recipes.js";
import { CUSTOMER_TYPES, POOL_BY_TIER, CUSTOMERS_PER_DAY_BY_TIER } from "../data/customers.js";
import { QUALITY_LABEL, QUALITY_LEVELS } from "../data/materials.js";
import { pushLog } from "./log.js";
import { onSale as questsOnSale } from "./quests.js";
import { shelfTypesMax } from "./shopExpansion.js";

// Place an item from inventory onto the shelf with a posted price.
// Returns { ok, reason? }. New (itemId, quality) entries respect the
// shelf-types cap (state.shopShelves * SHELF_TYPES_PER_SHELF).
export function listOnShelf(itemId, quality, count = 1, askPrice = null) {
  const item = ITEMS[itemId];
  if (!item) return { ok: false, reason: "unknown" };
  const ex = state.shelf.find(s => s.itemId === itemId && s.quality === quality);
  const defaultPrice = priceForItem(itemId, quality);
  const price = askPrice == null ? defaultPrice : Math.max(1, askPrice | 0);
  if (ex) { ex.count += count; ex.askPrice = price; return { ok: true }; }
  if (state.shelf.length >= shelfTypesMax()) {
    return { ok: false, reason: "shelf-full" };
  }
  state.shelf.push({ itemId, quality, count, askPrice: price });
  return { ok: true };
}

export function unlistFromShelf(itemId, quality, count = 1) {
  const ex = state.shelf.find(s => s.itemId === itemId && s.quality === quality);
  if (!ex || ex.count < count) return false;
  ex.count -= count;
  if (ex.count <= 0) state.shelf = state.shelf.filter(s => s !== ex);
  return true;
}

function pickCustomerType(tierIdx) {
  const pool = POOL_BY_TIER[tierIdx] || POOL_BY_TIER[0];
  const entries = Object.entries(pool);
  const sum = entries.reduce((s, [, w]) => s + w, 0);
  let r = rng.next() * sum;
  for (const [id, w] of entries) {
    r -= w;
    if (r <= 0) return CUSTOMER_TYPES[id];
  }
  return CUSTOMER_TYPES[entries[0][0]];
}

function pickWantCategory(cust) {
  const entries = Object.entries(cust.wants);
  const sum = entries.reduce((s, [, w]) => s + w, 0);
  let r = rng.next() * sum;
  for (const [cat, w] of entries) {
    r -= w;
    if (r <= 0) return cat;
  }
  return entries[0][0];
}

// Customer-count caps so visits don't blow up unboundedly with a huge shelf.
const VISIT_CAP_BY_TIER = [16, 24, 32, 40];

function shelfCount() {
  return (state.shelf || []).reduce((s, x) => s + (x.count || 0), 0);
}

function findCategoryMatches(cat, minIdx) {
  return state.shelf
    .filter(s => {
      const item = ITEMS[s.itemId];
      if (!item || item.cat !== cat || s.count <= 0) return false;
      return QUALITY_LEVELS.indexOf(s.quality) >= minIdx;
    })
    .sort((a, b) => a.askPrice - b.askPrice);
}

export function runShopSimulation() {
  const tier = repTier();
  const tierIdx = tier.index;
  const baseCust = CUSTOMERS_PER_DAY_BY_TIER[tierIdx] || 4;
  // Scale visits with shelf size: aim to clear ~70% of stock when the shelf
  // is well-supplied, but never go below the base tier customer count.
  const stock = shelfCount();
  const targetSales = Math.ceil(stock * 0.7);
  const wantedVisits = Math.ceil(targetSales / 0.85); // assume ~85% of visitors buy
  const visitCap = VISIT_CAP_BY_TIER[tierIdx] || 40;
  let visits = Math.max(baseCust, wantedVisits);
  visits = Math.min(visits, visitCap);
  visits += rng.int(-1, 1); // small jitter
  if (visits < 1) visits = 1;

  let earnings = 0;
  let sales = 0;
  const events = [];

  for (let i = 0; i < visits; i++) {
    const cust = pickCustomerType(tierIdx);
    const wantCat = pickWantCategory(cust);
    const minQ = (cust.quality && cust.quality[0]) || "norm";
    const minIdx = QUALITY_LEVELS.indexOf(minQ);

    let matches = findCategoryMatches(wantCat, minIdx);

    // If the preferred category isn't on the shelf, give the customer a 60%
    // chance to wander over to another category they're interested in. They
    // pick from `wants` weights, skipping the one they already missed.
    if (matches.length === 0 && rng.chance(0.6)) {
      const altEntries = Object.entries(cust.wants).filter(([c]) => c !== wantCat);
      const totalW = altEntries.reduce((s, [, w]) => s + w, 0);
      if (totalW > 0) {
        let r = rng.next() * totalW;
        let altCat = altEntries[0][0];
        for (const [c, w] of altEntries) {
          r -= w;
          if (r <= 0) { altCat = c; break; }
        }
        matches = findCategoryMatches(altCat, minIdx);
      }
    }

    if (matches.length === 0) {
      events.push({ type: "miss", cust: cust.name, want: CATEGORY_LABELS[wantCat] });
      continue;
    }

    const pick = matches[0];
    const item = ITEMS[pick.itemId];
    // Customer's price tolerance: <= 1.4x base * priceBias
    const ceiling = priceForItem(pick.itemId, pick.quality) * 1.4 * cust.priceBias;
    if (pick.askPrice > ceiling) {
      events.push({ type: "too-expensive", cust: cust.name, item: item.name, ask: pick.askPrice, ceiling: Math.floor(ceiling) });
      continue;
    }
    // Customer either accepts the asking price or walks away — they don't haggle.
    const paid = pick.askPrice;
    pick.count -= 1;
    if (pick.count <= 0) state.shelf = state.shelf.filter(s => s !== pick);
    earnings += paid;
    sales += 1;
    state.gold += paid;
    state.rep += cust.repBonus + (pick.quality === "fine" ? 3 : pick.quality === "good" ? 1 : 0);
    const ev = { type: "sale", cust: cust.name, item: item.name, q: QUALITY_LABEL[pick.quality], qualityKey: pick.quality, paid };
    events.push(ev);
    questsOnSale(ev);
  }

  state.bookkeeping.soldToday = sales;
  state.bookkeeping.earnedToday = earnings;
  state.bookkeeping.customerLogToday = events;
  pushLog({
    kind: "sale",
    summary: `本日 ${sales} 件販売、売上 ${earnings} G。`,
    detail: { events, sales, earnings },
  });
  return { sales, earnings, events };
}
