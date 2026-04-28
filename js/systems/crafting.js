// Crafting: select recipe, consume materials (best-quality first), produce
// item with quality determined by avg material quality + slight randomness.

import { state, addItem, consumeMatBest, getMat, totalMat, rng } from "../state.js";
import { RECIPES, ITEMS, priceForItem } from "../data/recipes.js";
import { QUALITY_LEVELS, QUALITY_MULT, QUALITY_LABEL, avgQuality } from "../data/materials.js";
import { pushLog } from "../systems/log.js";

export function canCraft(recipeId) {
  const r = RECIPES[recipeId];
  if (!r) return false;
  if (!state.recipes[r.id]?.unlocked) return false;
  for (const inp of r.inputs) {
    if (totalMat(inp.mat) < inp.n) return false;
  }
  return true;
}

// Predict the quality this recipe would produce *right now* using the
// best-quality-first consumption rule. Returns null if not craftable.
// RNG nudges (10% up / 5% down) are not modeled — this is the central
// "expected" outcome that the player sees in the UI.
export function predictCraftQuality(recipeId) {
  const r = RECIPES[recipeId];
  if (!r) return null;
  const allQ = [];
  for (const inp of r.inputs) {
    let need = inp.n;
    const stock = state.inventory.mats[inp.mat] || { fine: 0, good: 0, norm: 0, poor: 0 };
    for (const q of ["fine", "good", "norm", "poor"]) {
      const take = Math.min(need, stock[q] || 0);
      for (let i = 0; i < take; i++) allQ.push(q);
      need -= take;
      if (need <= 0) break;
    }
    if (need > 0) return null;
  }
  return avgQuality(allQ);
}

export function craft(recipeId) {
  const r = RECIPES[recipeId];
  if (!r) return { ok: false, reason: "未知のレシピ" };
  if (!canCraft(recipeId)) return { ok: false, reason: "素材が足りません" };

  const consumed = [];
  for (const inp of r.inputs) {
    const taken = consumeMatBest(inp.mat, inp.n);
    if (!taken) {
      // rollback prior consumes
      for (const c of consumed) {
        const { mat, qList } = c;
        for (const q of qList) addMatBack(mat, q);
      }
      return { ok: false, reason: "素材が足りません" };
    }
    consumed.push({ mat: inp.mat, qList: taken });
  }

  // Compute quality from all consumed qualities
  const allQ = consumed.flatMap(c => c.qList);
  const quality = avgQuality(allQ);

  // Slight RNG nudge: 10% chance to bump up one tier, 5% down
  let outQ = quality;
  if (rng.next() < 0.10 && quality !== "fine") outQ = bumpUp(quality);
  else if (rng.next() < 0.05 && quality !== "poor") outQ = bumpDown(quality);

  const itemId = r.out;
  addItem(itemId, outQ, 1);
  const item = ITEMS[itemId];
  const value = priceForItem(itemId, outQ);

  pushLog({
    kind: "craft",
    summary: `${item.name}（${QUALITY_LABEL[outQ]}）を1個調合した。`,
    detail: { recipeId, itemId, quality: outQ, value, materialsUsed: consumed },
  });

  return { ok: true, itemId, quality: outQ, value };
}

function bumpUp(q) {
  const order = QUALITY_LEVELS;
  const i = order.indexOf(q);
  return order[Math.min(order.length - 1, i + 1)];
}
function bumpDown(q) {
  const order = QUALITY_LEVELS;
  const i = order.indexOf(q);
  return order[Math.max(0, i - 1)];
}

// re-add helper used in rollback
import { addMat as _addMat } from "../state.js";
function addMatBack(mat, q) { _addMat(mat, q, 1); }
