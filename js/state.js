// Single mutable game state + observers. Plain object mutations + emit().
// Save/load reads/writes this directly via JSON.

import { CLASSES, NAMES, expForLevel } from "./data/adventurers.js";
import { RANKS } from "./data/ranks.js";
import { RECIPES } from "./data/recipes.js";
import { MATERIALS, QUALITY_LEVELS } from "./data/materials.js";
import { makeRng } from "./rng.js";

export const VERSION = "ALC1";

export const REP_TIERS = [
  { id: "newcomer", label: "新参",   min: 0,   max: 49,   stars: 1 },
  { id: "midguard", label: "中堅",   min: 50,  max: 199,  stars: 2 },
  { id: "famed",    label: "有名",   min: 200, max: 599,  stars: 3 },
  { id: "legend",   label: "伝説",   min: 600, max: 9999, stars: 4 },
];

export const PHASES = ["morning", "day", "evening", "night"];
export const PHASE_LABEL = { morning: "朝", day: "昼", evening: "夕", night: "夜" };

let listeners = [];

export const state = {
  version: VERSION,
  day: 1,
  phase: "morning",
  gold: 200,
  rep: 0,
  seed: 1,
  rngState: 1,
  party: [],            // owned adventurers
  market: [],           // hire candidates today
  inventory: {
    mats: {},           // matId -> { poor, norm, good, fine }
    items: [],          // { itemId, quality, count }
  },
  shelf: [],            // { itemId, quality, count, askPrice }
  learnedSpells: {},    // advId -> [spellId]
  equippedSpells: {},   // advId -> [spellId] (<=slot count)
  equippedGear: {},     // advId -> { weapon, armor, trinket }
  passives: {},         // advId -> [passiveId] (<=rank.passiveSlots)
  pendingDispatch: [],  // [{ id, locId, advIds:[...] }] — parties planned for today
  outOnDispatch: [],    // [{ id, locId, advIds:[...] }] — parties currently away (return next morning)
  dispatchResults: [],  // populated next morning (per-party)
  lastDispatch: [],     // snapshot of yesterday's dispatch (advIds + locId), for "redo last party"
  recipes: {},          // recipeId -> { unlocked, points }
  strategies: {},       // advId -> { preset: "standard", custom: [...] }
  logs: [],             // newest-first; capped to ~30 days
  researchedToday: 0,
  bookkeeping: {
    soldToday: 0,
    earnedToday: 0,
    customerLogToday: [],
  },
  flags: {
    introSeen: false,
  },
};

// ----- emitter -----
export function subscribe(fn) { listeners.push(fn); return () => { listeners = listeners.filter(x => x !== fn); }; }
export function emit() { for (const fn of listeners) fn(state); }

// ----- helpers -----
export const rng = makeRng(state.rngState);

export function syncRng() { state.rngState = rng.state(); }
export function reseedRngFromState() { rng.setState(state.rngState); }

export function repTier() {
  for (let i = REP_TIERS.length - 1; i >= 0; i--) {
    if (state.rep >= REP_TIERS[i].min) return { ...REP_TIERS[i], index: i };
  }
  return { ...REP_TIERS[0], index: 0 };
}

export function getMat(matId, q) {
  const m = state.inventory.mats[matId];
  if (!m) return 0;
  return m[q] || 0;
}

export function addMat(matId, q, n) {
  if (!state.inventory.mats[matId]) state.inventory.mats[matId] = { poor: 0, norm: 0, good: 0, fine: 0 };
  state.inventory.mats[matId][q] = (state.inventory.mats[matId][q] || 0) + n;
}

export function consumeMat(matId, q, n) {
  if (getMat(matId, q) < n) return false;
  state.inventory.mats[matId][q] -= n;
  return true;
}

// Try to consume `need` units of material, drawing best-quality first; returns
// the array of qualities actually consumed (length === need on success).
export function consumeMatBest(matId, need) {
  const order = ["fine", "good", "norm", "poor"];
  const taken = [];
  for (const q of order) {
    while (taken.length < need && getMat(matId, q) > 0) {
      state.inventory.mats[matId][q] -= 1;
      taken.push(q);
    }
    if (taken.length >= need) break;
  }
  if (taken.length < need) {
    // rollback
    for (const q of taken) addMat(matId, q, 1);
    return null;
  }
  return taken;
}

export function totalMat(matId) {
  const m = state.inventory.mats[matId];
  if (!m) return 0;
  return m.poor + m.norm + m.good + m.fine;
}

export function addItem(itemId, quality, n = 1) {
  const ex = state.inventory.items.find(it => it.itemId === itemId && it.quality === quality);
  if (ex) ex.count += n;
  else state.inventory.items.push({ itemId, quality, count: n });
}

export function removeItem(itemId, quality, n = 1) {
  const ex = state.inventory.items.find(it => it.itemId === itemId && it.quality === quality);
  if (!ex || ex.count < n) return false;
  ex.count -= n;
  if (ex.count <= 0) state.inventory.items = state.inventory.items.filter(it => it !== ex);
  return true;
}

// ----- adventurer factory -----
let advIdCounter = 1;
export function newAdvId() { return "adv_" + (advIdCounter++).toString(36) + "_" + Math.floor(Math.random() * 1e6).toString(36); }

// ----- party helpers -----
export const PARTY_MAX = 5;
let partyIdCounter = 1;
export function newPartyId() { return "pt_" + (partyIdCounter++).toString(36) + "_" + Math.floor(Math.random() * 1e6).toString(36); }

export function partyForAdv(advId) {
  for (const p of state.pendingDispatch) {
    if (p && Array.isArray(p.advIds) && p.advIds.includes(advId)) return p;
  }
  return null;
}

export function removeAdvFromParties(advId) {
  for (const p of state.pendingDispatch) {
    p.advIds = (p.advIds || []).filter(id => id !== advId);
  }
  state.pendingDispatch = state.pendingDispatch.filter(p => (p.advIds || []).length > 0);
  const adv = state.party.find(a => a.id === advId);
  if (adv) adv.busy = false;
}

export function generateAdventurer(classId, rankId, rng_) {
  const cls = CLASSES[classId];
  const rank = RANKS[rankId];
  const namePool = NAMES[classId];
  const name = rng_ ? rng_.pick(namePool) : namePool[Math.floor(Math.random() * namePool.length)];
  const id = newAdvId();
  const slots = cls.baseSlots + rank.slotBonus;
  const adv = {
    id,
    name,
    classId,
    rankId,
    level: 1,
    exp: 0,
    statBonusFromRank: rank.statBonus,
    base: { ...cls.base },
    extra: { hp: 0, atk: 0, def: 0, luk: 0 }, // grown via leveling
    maxHp: cls.base.hp + rank.statBonus,
    hp: cls.base.hp + rank.statBonus,
    slots, // fixed for life
    busy: false,
    injured: false,
    daysSinceWage: 0,
  };
  return adv;
}

export function effectiveStats(adv) {
  // returns { hp, atk, def, luk, maxHp }
  const lvBonus = (adv.level - 1);
  const r = adv.statBonusFromRank;
  return {
    maxHp: adv.maxHp,
    atk: adv.base.atk + adv.extra.atk + Math.floor(r * 0.5) + Math.floor(lvBonus * 0.5),
    def: adv.base.def + adv.extra.def + Math.floor(r * 0.4) + Math.floor(lvBonus * 0.35),
    luk: adv.base.luk + adv.extra.luk + Math.floor(r * 0.3) + Math.floor(lvBonus * 0.25),
  };
}

export function gainExp(adv, n) {
  adv.exp += n;
  let leveled = 0;
  while (adv.exp >= expForLevel(adv.level + 1)) {
    adv.level += 1;
    // gain stats; rank, slots, wage UNCHANGED.
    adv.extra.hp += 4;
    adv.extra.atk += 1;
    adv.extra.def += 1;
    if (adv.level % 2 === 0) adv.extra.luk += 1;
    adv.maxHp += 4;
    adv.hp = Math.min(adv.maxHp, adv.hp + 4);
    leveled += 1;
  }
  return leveled;
}

// ----- recipe state -----
export function ensureRecipeMap() {
  for (const r of Object.values(RECIPES)) {
    if (!state.recipes[r.id]) {
      state.recipes[r.id] = { unlocked: !!r.unlocked, points: 0 };
    }
  }
}

export function recipeUnlocked(rid) {
  return state.recipes[rid]?.unlocked === true;
}

// ----- shelf -----
export function shelfPriceFor(itemId, quality) {
  // separate from auto-pricing — we let player set; default = priceForItem
  return null;
}

// ----- new game -----
export function newGame() {
  // reset
  state.version = VERSION;
  state.day = 1;
  state.phase = "morning";
  state.gold = 200;
  state.rep = 0;
  state.seed = (Date.now() & 0xffffffff) >>> 0;
  state.rngState = state.seed || 1;
  rng.setState(state.rngState);
  state.party = [];
  state.market = [];
  state.inventory = { mats: {}, items: [] };
  state.shelf = [];
  state.learnedSpells = {};
  state.equippedSpells = {};
  state.equippedGear = {};
  state.passives = {};
  state.pendingDispatch = [];
  state.outOnDispatch = [];
  state.dispatchResults = [];
  state.lastDispatch = [];
  state.recipes = {};
  ensureRecipeMap();
  state.strategies = {};
  state.logs = [];
  state.researchedToday = 0;
  state.bookkeeping = { soldToday: 0, earnedToday: 0, customerLogToday: [] };
  state.flags = { introSeen: false };

  // Starter adventurer: a free F-rank warrior to get going.
  const starter = generateAdventurer("warrior", "F", rng);
  starter.name = "リカルド";
  state.party.push(starter);
  state.strategies[starter.id] = { preset: "standard", custom: [] };
  state.equippedGear[starter.id] = { weapon: null, armor: null, trinket: null };
  state.equippedSpells[starter.id] = [];
  state.learnedSpells[starter.id] = [];
  state.passives[starter.id] = [];

  // Starting materials so player can craft on day 1
  addMat("herb", "norm", 4);
  addMat("pure_water", "norm", 3);
  addMat("twig", "norm", 4);
  addMat("rune_shard", "norm", 2);
  addMat("silkstrand", "norm", 2);

  // Starter inventory items: nothing.

  syncRng();
}

export function loadFromObject(obj) {
  Object.assign(state, obj);
  state.rngState = obj.rngState || obj.seed || 1;
  rng.setState(state.rngState);
  ensureRecipeMap();
  // Migration: introduced state.outOnDispatch
  if (!Array.isArray(state.outOnDispatch)) state.outOnDispatch = [];
  // Migration: introduced state.lastDispatch (redo-last-party feature)
  if (!Array.isArray(state.lastDispatch)) state.lastDispatch = [];
}

export function snapshot() {
  syncRng();
  return JSON.parse(JSON.stringify(state));
}
