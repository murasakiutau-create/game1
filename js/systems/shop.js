// Shop simulation. At end of day, generates customers per reputation tier.
// Each customer wants a category at min quality, picks the cheapest matching
// item from the shelf, buys it. Sale gives gold + reputation.

import { state, repTier, removeItem, rng } from "../state.js";
import { ITEMS, priceForItem, CATEGORY_LABELS } from "../data/recipes.js";
import { CUSTOMER_TYPES, POOL_BY_TIER, CUSTOMERS_PER_DAY_BY_TIER } from "../data/customers.js";
import { QUALITY_LABEL } from "../data/materials.js";
import { pushLog } from "./log.js";

// Place an item from inventory onto the shelf with a posted price.
export function listOnShelf(itemId, quality, count = 1, askPrice = null) {
  const item = ITEMS[itemId];
  if (!item) return false;
  const ex = state.shelf.find(s => s.itemId === itemId && s.quality === quality);
  const defaultPrice = priceForItem(itemId, quality);
  const price = askPrice == null ? defaultPrice : Math.max(1, askPrice | 0);
  if (ex) { ex.count += count; ex.askPrice = price; }
  else state.shelf.push({ itemId, quality, count, askPrice: price });
  return true;
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

export function runShopSimulation() {
  const tier = repTier();
  const tierIdx = tier.index;
  const totalCust = CUSTOMERS_PER_DAY_BY_TIER[tierIdx] || 4;
  // small jitter
  const visits = totalCust + rng.int(-1, 1);

  let earnings = 0;
  let sales = 0;
  const events = [];

  for (let i = 0; i < visits; i++) {
    const cust = pickCustomerType(tierIdx);
    const wantCat = pickWantCategory(cust);
    const minQs = cust.quality;

    // Find shelf entries matching cat + acceptable quality, sorted by askPrice
    const matches = state.shelf
      .filter(s => {
        const item = ITEMS[s.itemId];
        return item && item.cat === wantCat && minQs.includes(s.quality) && s.count > 0;
      })
      .sort((a, b) => a.askPrice - b.askPrice);

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
    // Final paid price = askPrice * priceBias clamped to ceiling
    const paid = Math.min(pick.askPrice, Math.round(pick.askPrice * cust.priceBias));
    pick.count -= 1;
    if (pick.count <= 0) state.shelf = state.shelf.filter(s => s !== pick);
    earnings += paid;
    sales += 1;
    state.gold += paid;
    state.rep += cust.repBonus + (pick.quality === "fine" ? 3 : pick.quality === "good" ? 1 : 0);
    events.push({ type: "sale", cust: cust.name, item: item.name, q: QUALITY_LABEL[pick.quality], paid });
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
