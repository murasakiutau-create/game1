// Shop shelf capacity. Each shelf holds SHELF_TYPES_PER_SHELF distinct
// (itemId, quality) entries.
//
// Reputation auto-grants a baseline number of shelves per tier:
//   新参 3 / 中堅 5 / 有名 7 / 伝説 10  → 9 / 15 / 21 / 30 types.
//
// On top of that, the player can pay to add up to MAX_EXTRA_SHELVES
// (=10) further shelves. So at 伝説 with full expansion you can stock
// 60 types; at 新参 with full expansion, 39 types. state.shopShelves
// stores the number of EXTRA shelves purchased on top of the auto
// baseline.

import { state, repTier } from "../state.js";

export const SHELF_TYPES_PER_SHELF = 3;
export const MAX_EXTRA_SHELVES = 10; // up to +30 types

// Auto-granted shelves by rep tier (0=新参 1=中堅 2=有名 3=伝説).
export const MAX_SHELVES_BY_TIER = [3, 5, 7, 10];

// Cost for the Nth EXTRA shelf (1-indexed; index 0 unused). Scales
// steeply so adding capacity is a meaningful long-term goal.
export const SHELF_COSTS = [
  0,        // unused
  500,      // +1
  1500,     // +2
  4000,     // +3
  10000,    // +4
  24000,    // +5
  56000,    // +6
  130000,   // +7
  300000,   // +8
  680000,   // +9
  1500000,  // +10
];

export function ensureShopShelves() {
  if (typeof state.shopShelves !== "number" || state.shopShelves < 0) {
    state.shopShelves = 0;
  }
  if (state.shopShelves > MAX_EXTRA_SHELVES) state.shopShelves = MAX_EXTRA_SHELVES;
}

export function tierBaselineShelves() {
  const tier = repTier().index;
  return MAX_SHELVES_BY_TIER[Math.min(tier, MAX_SHELVES_BY_TIER.length - 1)];
}

export function extraShelves() {
  ensureShopShelves();
  return state.shopShelves;
}

// Effective shelves = tier baseline + purchased extras. Auto-rises with
// reputation, never decreases.
export function effectiveShelves() {
  return tierBaselineShelves() + extraShelves();
}

// Backwards-compat alias used by callers that just want the current cap.
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
  const ex = extraShelves();
  if (ex >= MAX_EXTRA_SHELVES) return null;
  return SHELF_COSTS[ex + 1] ?? null;
}

export function canBuyShelf() {
  const ex = extraShelves();
  if (ex >= MAX_EXTRA_SHELVES) return { ok: false, reason: "max" };
  const cost = SHELF_COSTS[ex + 1];
  if (cost == null) return { ok: false, reason: "max" };
  if (state.gold < cost) return { ok: false, reason: "gold", cost };
  return { ok: true, cost };
}

export function buyShelf() {
  const check = canBuyShelf();
  if (!check.ok) return check;
  state.gold -= check.cost;
  state.shopShelves = extraShelves() + 1;
  return {
    ok: true,
    extra: state.shopShelves,
    effective: effectiveShelves(),
    cost: check.cost,
  };
}
