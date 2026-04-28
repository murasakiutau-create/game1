// Quest board — generates daily contracts the player can accept, then ticks
// progress when sales / dispatch results come in. Rewards are paid out on
// completion; expired quests dock a small reputation penalty.

import { state, rng, repTier } from "../state.js";
import { QUEST_TEMPLATES } from "../data/questTemplates.js";
import { ITEMS } from "../data/recipes.js";
import { QUALITY_LEVELS } from "../data/materials.js";
import { pushLog } from "./log.js";

let questCounter = 1;
function newQuestId() { return "q_" + (questCounter++).toString(36) + "_" + Math.floor(Math.random() * 1e6).toString(36); }

function ensureShape() {
  if (!state.quests || typeof state.quests !== "object") {
    state.quests = { available: [], active: [], history: [] };
  }
  for (const k of ["available", "active", "history"]) {
    if (!Array.isArray(state.quests[k])) state.quests[k] = [];
  }
}

// Roll 2-3 fresh contracts for today, replacing any that weren't accepted.
export function refreshQuests() {
  ensureShape();
  const tier = repTier().index;
  const eligible = QUEST_TEMPLATES.filter(t => (t.minTier || 0) <= tier);
  if (eligible.length === 0) {
    state.quests.available = [];
    return;
  }
  const count = 2 + (tier >= 1 ? 1 : 0);
  const picked = [];
  const used = new Set();
  for (let i = 0; i < count && picked.length < eligible.length; i++) {
    let attempts = 0;
    let pick;
    do {
      pick = rng.pick(eligible);
      attempts++;
    } while (used.has(pick.id) && attempts < 20);
    used.add(pick.id);
    picked.push({
      id: newQuestId(),
      templateId: pick.id,
      kind: pick.kind,
      title: pick.title(),
      desc:  pick.desc(),
      spec:  pick.spec,
      duration: pick.duration,
      gold: pick.gold,
      rep:  pick.rep,
      issuedDay: state.day,
    });
  }
  state.quests.available = picked;
}

// Accept a quest: move it from available to active, record deadline.
export function acceptQuest(qid) {
  ensureShape();
  const idx = state.quests.available.findIndex(q => q.id === qid);
  if (idx < 0) return false;
  const q = state.quests.available[idx];
  state.quests.available.splice(idx, 1);
  state.quests.active.push({
    ...q,
    progress: 0,
    deadline: state.day + (q.duration || 3),
  });
  pushLog({ kind: "system", summary: `依頼「${q.title}」を受託した。` });
  return true;
}

export function cancelQuest(qid) {
  ensureShape();
  const idx = state.quests.active.findIndex(q => q.id === qid);
  if (idx < 0) return false;
  const q = state.quests.active[idx];
  state.quests.active.splice(idx, 1);
  state.quests.history.unshift({ ...q, status: "cancelled", day: state.day });
  pushLog({ kind: "system", summary: `依頼「${q.title}」を辞退した。` });
  return true;
}

// Helper: does a sale event match a deliver-type quest?
function saleSatisfies(q, ev) {
  if (q.kind !== "deliver" && q.kind !== "specialty") return 0;
  if (ev.type !== "sale") return 0;
  // ev has { item, q, paid, cust } where ev.item is the display name. We need
  // the itemId/category — re-derive from ITEMS by name match (cheap because
  // the sale event was just produced from the same shelf entry).
  const item = Object.values(ITEMS).find(it => it.name === ev.item);
  if (!item) return 0;
  const spec = q.spec;
  if (spec.itemId && spec.itemId !== item.id) return 0;
  if (spec.category && spec.category !== item.cat) return 0;
  if (spec.minQuality) {
    const idx = QUALITY_LEVELS.indexOf(ev.qualityKey || "norm");
    if (idx < QUALITY_LEVELS.indexOf(spec.minQuality)) return 0;
  }
  return 1;
}

// Called whenever shop.runShopSimulation produces a "sale" event.
export function onSale(ev) {
  ensureShape();
  for (const q of state.quests.active) {
    const inc = saleSatisfies(q, ev);
    if (inc > 0) q.progress = Math.min((q.spec.count || 1), q.progress + inc);
  }
  checkCompletions();
}

// Called from dispatch.js once a party result is built. Walks the encounter
// list and gather drops to update hunt/gather progress.
export function onDispatchResolved(result) {
  ensureShape();
  for (const q of state.quests.active) {
    if (q.kind === "hunt") {
      let kills = 0;
      for (const enc of result.encounters || []) {
        if ((enc.result === "win" || enc.result === "win-flee") && enc.mobId === q.spec.mobId) kills++;
      }
      if (kills > 0) q.progress = Math.min(q.spec.count, q.progress + kills);
    } else if (q.kind === "gather") {
      let gain = 0;
      for (const d of result.drops || []) {
        if (d.matId === q.spec.matId) gain += d.n;
      }
      if (gain > 0) q.progress = Math.min(q.spec.count, q.progress + gain);
    }
  }
  checkCompletions();
}

function checkCompletions() {
  const finished = [];
  state.quests.active = state.quests.active.filter(q => {
    if (q.progress >= (q.spec.count || 1)) {
      finished.push(q);
      return false;
    }
    return true;
  });
  for (const q of finished) {
    state.gold += q.gold;
    state.rep  += q.rep;
    state.quests.history.unshift({ ...q, status: "done", day: state.day });
    pushLog({
      kind: "system",
      summary: `依頼「${q.title}」を達成。報酬 ${q.gold} G・名声+${q.rep}。`,
    });
  }
}

// Called at the start of each new morning (after day++) to punt expired quests.
export function tickQuestDeadlines() {
  ensureShape();
  const expired = [];
  state.quests.active = state.quests.active.filter(q => {
    if (state.day > q.deadline) {
      expired.push(q);
      return false;
    }
    return true;
  });
  for (const q of expired) {
    state.rep = Math.max(0, state.rep - 2);
    state.quests.history.unshift({ ...q, status: "expired", day: state.day });
    pushLog({
      kind: "system",
      summary: `依頼「${q.title}」が期限切れ。名声 -2。`,
    });
  }
}
