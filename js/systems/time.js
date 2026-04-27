// Day cycle: morning → day → evening → night → next morning.
// Side effects (refresh market, run shop sim, drain wages, etc.) attach here.

import { state, rng, syncRng, repTier, ensureRecipeMap, generateAdventurer } from "../state.js";
import { resolveDispatch, resolvePartyDispatch } from "./dispatch.js";
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

export function payWagesForParty(advIds) {
  let total = 0;
  for (const advId of advIds) {
    const adv = state.party.find(a => a.id === advId);
    if (!adv) continue;
    total += RANKS[adv.rankId].dailyWage;
  }
  state.gold = Math.max(0, state.gold - total);
  if (total > 0) {
    pushLog({ kind: "system", summary: `派遣手当 ${total} G を支払った（${advIds.length}名）。` });
  }
  return total;
}

// Advance to next phase. The next phase's setup runs synchronously where it
// can; UI is responsible for prompting/animating where it can't.
export function advancePhase(opts = {}) {
  const order = ["morning", "day", "evening", "night"];
  const i = order.indexOf(state.phase);

  if (state.phase === "morning") {
    // Charge wages for everyone being sent today, then move parties from
    // "pending" to "out". They will return next morning.
    for (const p of state.pendingDispatch) {
      if (!p.advIds || p.advIds.length === 0) continue;
      payWagesForParty(p.advIds);
      state.outOnDispatch.push(p);
    }
    state.pendingDispatch = [];
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
    // Dispatched advs are still away — they return next morning.
    state.phase = "night";
    return;
  }

  if (state.phase === "night") {
    // Roll forward a day
    state.day += 1;
    state.phase = "morning";
    state.pendingDispatch = [];
    state.bookkeeping = { soldToday: 0, earnedToday: 0, customerLogToday: [] };
    state.researchedToday = 0;

    // Heal advs who STAYED home (rest day)
    const awayIds = new Set();
    for (const p of state.outOnDispatch) for (const id of p.advIds || []) awayIds.add(id);
    for (const adv of state.party) {
      if (awayIds.has(adv.id)) continue; // resolution will adjust their HP
      if (adv.injured) {
        adv.injured = false;
        adv.hp = Math.max(adv.hp, Math.floor(adv.maxHp * 0.6));
        pushLog({ kind: "system", advId: adv.id, summary: `${adv.name}は傷を癒し、再出勤可能。` });
      } else {
        adv.hp = Math.min(adv.maxHp, adv.hp + Math.floor(adv.maxHp * 0.4));
      }
    }

    // Resolve parties that were out — fill dispatchResults for the morning recap
    state.dispatchResults = [];
    for (const p of state.outOnDispatch) {
      const party = p.advIds ? p : { id: "legacy", locId: p.locId, advIds: [p.advId] };
      const r = resolvePartyDispatch(party);
      if (r) state.dispatchResults.push(r);
    }
    state.outOnDispatch = [];

    refreshMarket();
    return;
  }
}
