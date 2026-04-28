// Shop shelf capacity. Each shelf holds SHELF_TYPES_PER_SHELF distinct
// (itemId, quality) entries; the player buys more shelves to display a
// wider selection. Reputation tier caps how many shelves you can own.

import { state, repTier } from "../state.js";

export const SHELF_TYPES_PER_SHELF = 3;

// Max shelves by rep tier (0=新参 1=中堅 2=有名 3=伝説).
export const MAX_SHELVES_BY_TIER = [3, 5, 7, 10];

// Cost to buy the Nth shelf (1-indexed; index 0 unused). Scales steeply
// so adding capacity is a meaningful goal at each tier.
export const SHELF_COSTS = [
  0,        // shelf 1 (free, default)
  0,        // already-owned base shelf
  300,      // 2nd shelf
  900,      // 3rd
  2400,     // 4th
  6000,     // 5th
  14000,    // 6th
  32000,    // 7th
  70000,    // 8th
  150000,   // 9th
  320000,   // 10th
];

export function ensureShopShelves() {
  if (typeof state.shopShelves !== "number" || state.shopShelves < 1) {
    state.shopShelves = 1;
  }
}

export function shelfTypesMax() {
  ensureShopShelves();
  return state.shopShelves * SHELF_TYPES_PER_SHELF;
}

export function shelfTypesUsed() {
  return (state.shelf || []).length;
}

export function maxShelvesAllowed() {
  const tier = repTier().index;
  return MAX_SHELVES_BY_TIER[Math.min(tier, MAX_SHELVES_BY_TIER.length - 1)];
}

export function nextShelfCost() {
  ensureShopShelves();
  const next = state.shopShelves + 1;
  return SHELF_COSTS[next] ?? null;
}

export function canBuyShelf() {
  ensureShopShelves();
  if (state.shopShelves >= maxShelvesAllowed()) return { ok: false, reason: "tier" };
  const cost = nextShelfCost();
  if (cost == null) return { ok: false, reason: "max" };
  if (state.gold < cost) return { ok: false, reason: "gold", cost };
  return { ok: true, cost };
}

export function buyShelf() {
  const check = canBuyShelf();
  if (!check.ok) return check;
  state.gold -= check.cost;
  state.shopShelves += 1;
  return { ok: true, shelves: state.shopShelves, cost: check.cost };
}
