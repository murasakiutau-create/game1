// Research: spend gold to advance progress on locked recipes.
// 1 gold => 1 progress point (configurable). When progress reaches recipe.research,
// the recipe unlocks.

import { state, ensureRecipeMap } from "../state.js";
import { RECIPES } from "../data/recipes.js";
import { pushLog } from "./log.js";

export const POINTS_PER_GOLD = 1;
export const PER_DAY_LIMIT = 600;

export function lockedRecipes() {
  ensureRecipeMap();
  return Object.values(RECIPES).filter(r => r.research > 0 && !state.recipes[r.id].unlocked);
}

export function invest(recipeId, gold) {
  const r = RECIPES[recipeId];
  if (!r) return { ok: false, reason: "未知のレシピ" };
  if (state.recipes[r.id]?.unlocked) return { ok: false, reason: "解禁済み" };
  if (state.researchedToday + gold > PER_DAY_LIMIT) {
    gold = Math.max(0, PER_DAY_LIMIT - state.researchedToday);
    if (gold <= 0) return { ok: false, reason: "本日の研究上限に達しました" };
  }
  if (state.gold < gold) return { ok: false, reason: "金貨が足りません" };
  state.gold -= gold;
  state.researchedToday += gold;
  state.recipes[r.id].points = (state.recipes[r.id].points || 0) + gold * POINTS_PER_GOLD;
  let unlocked = false;
  if (state.recipes[r.id].points >= r.research) {
    state.recipes[r.id].unlocked = true;
    unlocked = true;
    pushLog({ kind: "research", summary: `新たな調合『${r.name}』を解読した。` });
  } else {
    pushLog({ kind: "research", summary: `${r.name}：${state.recipes[r.id].points}/${r.research}` });
  }
  return { ok: true, unlocked, points: state.recipes[r.id].points, needed: r.research };
}
