// Shop shelf capacity. Each shelf holds SHELF_TYPES_PER_SHELF distinct
// (itemId, quality) entries. The player gets a free baseline of shelves
// at each reputation tier and can pay to expand further, up to a hard
// cap of HARD_MAX_SHELVES (= 30 types).

import { state, repTier } from "../state.js";

export const SHELF_TYPES_PER_SHELF = 3;
export const HARD_MAX_SHELVES = 10; // 10 × 3 = 30 types

// Free baseline shelves by rep tier (0=新参 1=中堅 2=有名 3=伝説).
export const MAX_SHELVES_BY_TIER = [3, 5, 7, 10];

// Cost to buy the Nth shelf (1-indexed; index 0 unused). Scales steeply
// so adding capacity is a meaningful goal beyond the tier baseline.
export const SHELF_COSTS = [
  0,        // shelf 1 (always free)
  0,        // 1st baseline
  300,      // 2nd
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

export function tierBaselineShelves() {
  const tier = repTier().index;
  return MAX_SHELVES_BY_TIER[Math.min(tier, MAX_SHELVES_BY_TIER.length - 1)];
}

// Effective shelves = max(purchased, tier baseline). Capacity therefore
// auto-rises when the player ranks up, and additional purchases stack on
// top of that floor.
export function effectiveShelves() {
  ensureShopShelves();
  return Math.max(state.shopShelves, tierBaselineShelves());
}

// Backwards-compat alias used by older UI; same value as effectiveShelves.
export function maxShelvesAllowed() {
  return effectiveShelves();
}

export function shelfTypesMax() {
  return effectiveShelves() * SHELF_TYPES_PER_SHELF;
}

export function shelfTypesUsed() {
  return (state.shelf || []).length;
}

export function nextShelfCost() {
  const next = effectiveShelves() + 1;
  if (next > HARD_MAX_SHELVES) return null;
  return SHELF_COSTS[next] ?? null;
}

export function canBuyShelf() {
  const eff = effectiveShelves();
  if (eff >= HARD_MAX_SHELVES) return { ok: false, reason: "max" };
  const cost = SHELF_COSTS[eff + 1];
  if (cost == null) return { ok: false, reason: "max" };
  if (state.gold < cost) return { ok: false, reason: "gold", cost };
  return { ok: true, cost };
}

export function buyShelf() {
  const check = canBuyShelf();
  if (!check.ok) return check;
  const eff = effectiveShelves();
  state.gold -= check.cost;
  // Bake the auto-floor in so future purchases keep climbing past it.
  state.shopShelves = eff + 1;
  return { ok: true, shelves: state.shopShelves, cost: check.cost };
}
