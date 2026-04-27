// Day cycle: morning → day → evening → night → next morning.
// Side effects (refresh market, run shop sim, drain wages, etc.) attach here.

import { state, rng, syncRng, repTier, ensureRecipeMap, generateAdventurer } from "../state.js";
import { resolveDispatch } from "./dispatch.js";
import { runShopSimulation } from "./shop.js";
import { pushLog } from "./log.js";
import { RANK_ORDER, RANKS, MARKET_WEIGHTS, rankRequirementMet } from "../data/ranks.js";
import { CLASS_ORDER } from "../data/adventurers.js";

export function refreshMarket() {
  const tier = repTier().index;
  const candidates = [];
  // 3-5 candidates depending on rep tier
  const n = 3 + (tier >= 1 ? 1 : 0) + (tier >= 2 ? 1 : 0);
  for (let i = 0; i < n; i++) {
    const rankPick = pickRank(tier);
    const classPick = rng.pick(CLASS_ORDER);
    const adv = generateAdventurer(classPick, rankPick, rng);
    candidates.push(adv);
  }
  state.market = candidates;
  syncRng();
}

function pickRank(tier) {
  const totals = {};
  let sum = 0;
  for (const r of RANK_ORDER) {
    const w = (MARKET_WEIGHTS[r] || [0])[tier] || 0;
    if (!rankRequirementMet(r, tier)) continue;
    totals[r] = w;
    sum += w;
  }
  if (sum <= 0) return "F";
  let pick = rng.next() * sum;
  for (const r of RANK_ORDER) {
    pick -= totals[r] || 0;
    if (pick <= 0) return r;
  }
  return "F";
}

export function payWages() {
  let total = 0;
  for (const adv of state.party) {
    const wage = RANKS[adv.rankId].dailyWage;
    total += wage;
  }
  state.gold = Math.max(0, state.gold - total);
  if (total > 0) {
    pushLog({ kind: "system", summary: `日給 ${total} G を支払った。` });
  }
  return total;
}

// Advance to next phase. The next phase's setup runs synchronously where it
// can; UI is responsible for prompting/animating where it can't.
export function advancePhase(opts = {}) {
  const order = ["morning", "day", "evening", "night"];
  const i = order.indexOf(state.phase);

  if (state.phase === "morning") {
    // dispatched adventurers actually leave; resolution happens at evening.
    state.phase = "day";
    return;
  }

  if (state.phase === "day") {
    // Run shop simulation now to produce sales
    runShopSimulation();
    state.phase = "evening";
    return;
  }

  if (state.phase === "evening") {
    // Resolve dispatches if not resolved yet
    if (state.dispatchResults.length === 0 && state.pendingDispatch.length > 0) {
      for (const p of state.pendingDispatch) {
        const r = resolveDispatch(p.advId, p.locId);
        if (r) state.dispatchResults.push(r);
      }
      // Clear busy flag on adventurers (they're back home now)
      for (const adv of state.party) {
        if (state.pendingDispatch.find(p => p.advId === adv.id)) adv.busy = false;
      }
    }
    state.phase = "night";
    return;
  }

  if (state.phase === "night") {
    // Roll forward a day
    payWages();
    state.day += 1;
    state.phase = "morning";
    state.pendingDispatch = [];
    state.dispatchResults = [];
    state.bookkeeping = { soldToday: 0, earnedToday: 0, customerLogToday: [] };
    state.researchedToday = 0;
    // Heal lightly + clear injury after a full rest day
    for (const adv of state.party) {
      if (adv.injured) {
        adv.injured = false;
        adv.hp = Math.max(adv.hp, Math.floor(adv.maxHp * 0.6));
        pushLog({ kind: "system", advId: adv.id, summary: `${adv.name}は傷を癒し、明朝から再出勤可能。` });
      } else {
        adv.hp = Math.min(adv.maxHp, adv.hp + Math.floor(adv.maxHp * 0.4));
      }
    }
    refreshMarket();
    return;
  }
}
