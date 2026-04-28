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

export function maxShelvesAllowed() {
  const tier = repTier().index;
  return MAX_SHELVES_BY_TIER[Math.min(tier, MAX_SHELVES_BY_TIER.length - 1)];
}

// Capacity auto-scales with reputation tier — the player doesn't have to
// pay to unlock the per-tier max. (Old saves used to track state.shopShelves
// for manual expansion; the field is preserved for migration but no longer
// gates capacity.)
export function shelfTypesMax() {
  ensureShopShelves();
  return maxShelvesAllowed() * SHELF_TYPES_PER_SHELF;
}

export function shelfTypesUsed() {
  return (state.shelf || []).length;
}
