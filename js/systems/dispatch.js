// Dispatch resolution: gather rolls + 0..3 encounters + log assembly.
// Result is stored on state.dispatchResults until the evening scene presents it.

import { state, addMat, rng, repTier } from "../state.js";
import { CLASSES, expForLevel } from "../data/adventurers.js";
import { LOCATIONS, AMBIENT_DROP, DEFAULT_Q_BIAS } from "../data/locations.js";
import { MATERIALS, QUALITY_LEVELS } from "../data/materials.js";
import { EQUIPMENT } from "../data/equipment.js";
import { PASSIVES } from "../data/passives.js";
import { runEncounter, runPartyEncounter } from "./encounter.js";
import { pushLog } from "./log.js";

function passiveEffects(adv) {
  const ids = state.passives[adv.id] || [];
  const acc = {
    plantGather: 0, oreGather: 0, mobDrop: 0,
    extraRolls: 0, rareBoost: 0, expMult: 1.0,
    hpBonus: 0, atkBonus: 0, defBonus: 0,
    critRate: 0, mobAccDown: 0, fleeSafe: false,
    bowAtkBoost: 0, axeAtkBoost: 0, magicDmgMult: 1.0, damageReduce: 0,
  };
  for (const pid of ids) {
    const e = PASSIVES[pid]?.effect;
    if (!e) continue;
    for (const [k, v] of Object.entries(e)) {
      if (typeof v === "number") acc[k] = (acc[k] || 0) + v;
      else acc[k] = v;
    }
  }
  return acc;
}
export { passiveEffects };

function rollQuality(qBias, rng_, qBoostSteps = 0) {
  const bias = { ...(DEFAULT_Q_BIAS), ...(qBias || {}) };
  // qBoostSteps shifts weight up the ladder (e.g. herbalist thorn_balm)
  if (qBoostSteps > 0) {
    bias.fine = (bias.fine || 0) + qBoostSteps * 1.4;
    bias.good = (bias.good || 0) + qBoostSteps * 0.8;
    bias.poor = Math.max(0, (bias.poor || 0) - qBoostSteps);
  }
  const total = Object.values(bias).reduce((s, v) => s + v, 0);
  let r = rng_.next() * total;
  for (const q of QUALITY_LEVELS) {
    r -= bias[q] || 0;
    if (r <= 0) return q;
  }
  return "norm";
}

function gatherFor(loc, advClassId, gearBonus, buffs, passive) {
  const baseRolls = 4 + Math.floor(rng.int(0, 3))
    + (gearBonus.gather || 0)
    + (buffs?.gatherQtyBonus || 0)
    + (passive?.extraRolls || 0);
  const drops = [];
  const tableRows = loc.gather.map(g => {
    const boost = (g.classBoost && g.classBoost[advClassId]) || 0;
    return { mat: g.mat, w: g.w + boost, qBias: g.qBias };
  });
  tableRows.push({ mat: AMBIENT_DROP.mat, w: AMBIENT_DROP.w });

  const totalW = tableRows.reduce((s, r) => s + r.w, 0);

  for (let i = 0; i < baseRolls; i++) {
    let r = rng.next() * totalW;
    let pick = tableRows[0];
    for (const row of tableRows) {
      r -= row.w;
      if (r <= 0) { pick = row; break; }
    }
    const matId = pick.mat;
    const mat = MATERIALS[matId];
    if (!mat) continue;
    const isOre  = mat.tags?.includes("mineral");
    const isHerb = mat.tags?.includes("plant");
    const isWood = mat.tags?.includes("wood");
    const isFiber = mat.tags?.includes("fiber");
    const naturalLike = isHerb || isWood || isFiber;
    const qBoost = isHerb ? (buffs?.herbQualityBoost || 0) : 0;
    const q = rollQuality(pick.qBias, rng, qBoost);
    let n = 1 + Math.floor(rng.next() * 1.5);
    if (isOre && (gearBonus.oreBonus || 0) > 0 && rng.chance(gearBonus.oreBonus + (buffs?.oreBonus || 0))) n += 1;
    if (mat.tags?.includes("rare") && (gearBonus.rarity || 0) > 0 && rng.chance(0.05 * gearBonus.rarity)) n += 1;
    // Passive specialty: ore / plant gather bonus
    if (isOre && passive?.oreGather > 0 && rng.chance(passive.oreGather)) n += 1 + (rng.chance(passive.oreGather) ? 1 : 0);
    if (naturalLike && passive?.plantGather > 0 && rng.chance(passive.plantGather)) n += 1 + (rng.chance(passive.plantGather) ? 1 : 0);
    if (mat.tags?.includes("rare") && passive?.rareBoost > 0 && rng.chance(passive.rareBoost)) n += 1;
    drops.push({ matId, q, n });
  }
  return drops;
}

function gearBonus(adv) {
  const g = state.equippedGear[adv.id] || {};
  let gather = 0, qty = 0, rarity = 0, mat = 1, oreBonus = 0;
  for (const slot of ["weapon", "armor", "trinket"]) {
    const id = g[slot];
    if (!id) continue;
    const eq = EQUIPMENT[id];
    if (!eq) continue;
    gather += eq.gather || 0;
    qty += eq.qty || 0;
    rarity += eq.rarity || 0;
    if (eq.mat) mat *= eq.mat;
    if (eq.oreBonus) oreBonus += eq.oreBonus;
  }
  return { gather, qty, rarity, mat, oreBonus };
}

function pickEncounters(loc) {
  // Boss-gated entries (e.g. {mob: "swamp_lord", w: 12, bossGate: 2}) only
  // become eligible once the player's reputation tier reaches bossGate.
  const tierIdx = repTier().index;
  const eligible = loc.encounters.filter(e => (e.bossGate || 0) <= tierIdx);
  const totalW = eligible.reduce((s, e) => s + e.w, 0);
  const picks = [];
  let attempts = 1 + Math.floor(loc.danger / 2);
  for (let i = 0; i < attempts; i++) {
    if (!rng.chance(loc.encounterRate)) continue;
    let r = rng.next() * totalW;
    for (const e of eligible) {
      r -= e.w;
      if (r <= 0) { picks.push(e.mob); break; }
    }
  }
  return picks.slice(0, 3);
}

export function resolveDispatch(advId, locId) {
  const adv = state.party.find(a => a.id === advId);
  const loc = LOCATIONS[locId];
  if (!adv || !loc) return null;

  const cls = CLASSES[adv.classId];
  const gear = gearBonus(adv);
  const passive = passiveEffects(adv);

  // Run encounters first; their buffs feed gather quality
  const mobs = pickEncounters(loc);
  const encounters = [];
  let aggregateBuffs = { rarityBoost: 0, oreBonus: 0, herbQualityBoost: 0, gatherQtyBonus: 0 };
  let outcome = "safe";
  for (const mobId of mobs) {
    if (adv.hp <= 0) break;
    const enc = runEncounter(adv, mobId, rng);
    encounters.push({ mobId, ...enc });
    aggregateBuffs.rarityBoost += enc.buffs.rarityBoost || 0;
    aggregateBuffs.oreBonus    += enc.buffs.oreBonus || 0;
    aggregateBuffs.herbQualityBoost += enc.buffs.herbQualityBoost || 0;
    aggregateBuffs.gatherQtyBonus   += enc.buffs.gatherQtyBonus || 0;
    if (enc.result === "injured") { outcome = "injured"; break; }
    if (enc.result === "flee")    { outcome = "flee"; }
    // Monster drops — Hunter passive boosts probability
    const dropMult = 1 + (passive.mobDrop || 0);
    for (const matId of enc.drops) {
      addMat(matId, "norm", 1);
    }
    // Bonus extra roll for hunter
    if (passive.mobDrop > 0 && rng.chance(passive.mobDrop)) {
      const drops = (enc.drops || []);
      if (drops.length) addMat(drops[0], "norm", 1);
    }
  }

  let drops = [];
  if (outcome !== "injured") {
    drops = gatherFor(loc, adv.classId, gear, aggregateBuffs, passive);
    for (const d of drops) addMat(d.matId, d.q, d.n);
  }

  if (outcome === "injured") adv.injured = true;
  // restore hp partially after dispatch (regardless of outcome)
  adv.hp = Math.max(1, Math.min(adv.maxHp, adv.hp + Math.floor(adv.maxHp * 0.5)));

  const result = {
    advId, locId,
    advName: adv.name,
    locName: loc.name,
    encounters,
    drops,
    outcome,
  };

  pushLog({
    kind: "dispatch",
    advId,
    summary: `${adv.name}（${cls.label}）— ${loc.name}：${outcome === "injured" ? "重傷で帰還" : `素材 ${drops.reduce((s,d)=>s+d.n,0)}点`}`,
    detail: result,
  });
  for (const enc of encounters) {
    pushLog({
      kind: "encounter",
      advId,
      summary: `${adv.name} vs ${enc.log[0]?.text || ""}`,
      detail: { ...enc, locName: loc.name, advName: adv.name },
    });
  }
  return result;
}

// =====================================================================
// Party-aware dispatch resolution
// =====================================================================

function gatherForParty(loc, party, gearList, buffs, passiveList) {
  // Sum gather rolls: base + 2 per extra member + each member's gear/passive bonus.
  const memberCount = party.length;
  const partySizeBonus = (memberCount - 1) * 2;
  const gearGather = gearList.reduce((s, g) => s + (g.gather || 0), 0);
  const extraRolls = passiveList.reduce((s, p) => s + (p.extraRolls || 0), 0);
  const baseRolls = 4 + Math.floor(rng.int(0, 3))
    + gearGather + partySizeBonus + extraRolls
    + (buffs?.gatherQtyBonus || 0);

  // Aggregate ore/rarity bonuses (max across members so the best gear/passive wins)
  const oreBonus = Math.max(0, ...gearList.map(g => g.oreBonus || 0)) + (buffs?.oreBonus || 0);
  const rarityBonus = Math.max(0, ...gearList.map(g => g.rarity || 0));
  const orePassive = Math.max(0, ...passiveList.map(p => p.oreGather || 0));
  const plantPassive = Math.max(0, ...passiveList.map(p => p.plantGather || 0));
  const rarePassive = Math.max(0, ...passiveList.map(p => p.rareBoost || 0));

  // Class-boost: take MAX class bonus across members (party "covers" all expertises)
  const classIds = party.map(a => a.classId);
  const tableRows = loc.gather.map(g => {
    let boost = 0;
    if (g.classBoost) {
      for (const cid of classIds) boost = Math.max(boost, g.classBoost[cid] || 0);
    }
    return { mat: g.mat, w: g.w + boost, qBias: g.qBias };
  });
  tableRows.push({ mat: AMBIENT_DROP.mat, w: AMBIENT_DROP.w });

  const totalW = tableRows.reduce((s, r) => s + r.w, 0);
  const drops = [];
  for (let i = 0; i < baseRolls; i++) {
    let r = rng.next() * totalW;
    let pick = tableRows[0];
    for (const row of tableRows) { r -= row.w; if (r <= 0) { pick = row; break; } }
    const matId = pick.mat;
    const mat = MATERIALS[matId];
    if (!mat) continue;
    const isOre  = mat.tags?.includes("mineral");
    const isHerb = mat.tags?.includes("plant");
    const isWood = mat.tags?.includes("wood");
    const isFiber = mat.tags?.includes("fiber");
    const naturalLike = isHerb || isWood || isFiber;
    const qBoost = isHerb ? (buffs?.herbQualityBoost || 0) : 0;
    const q = rollQuality(pick.qBias, rng, qBoost);
    let n = 1 + Math.floor(rng.next() * 1.5);
    if (isOre && oreBonus > 0 && rng.chance(oreBonus)) n += 1;
    if (mat.tags?.includes("rare") && rarityBonus > 0 && rng.chance(0.05 * rarityBonus)) n += 1;
    if (isOre && orePassive > 0 && rng.chance(orePassive)) n += 1;
    if (naturalLike && plantPassive > 0 && rng.chance(plantPassive)) n += 1;
    if (mat.tags?.includes("rare") && rarePassive > 0 && rng.chance(rarePassive)) n += 1;
    drops.push({ matId, q, n });
  }
  return drops;
}

export function resolvePartyDispatch(party_) {
  const party = (party_.advIds || []).map(id => state.party.find(a => a.id === id)).filter(Boolean);
  const loc = LOCATIONS[party_.locId];
  if (party.length === 0 || !loc) return null;

  const gearList = party.map(gearBonus);
  const passiveList = party.map(passiveEffects);

  // Encounters — collect drops on the side; final inventory deposit happens
  // after we know the outcome so we can scale by the survival multiplier.
  const mobs = pickEncounters(loc);
  const encounters = [];
  const pendingMobDrops = []; // [matId, ...]
  let aggregateBuffs = { rarityBoost: 0, oreBonus: 0, herbQualityBoost: 0, gatherQtyBonus: 0 };
  let outcome = "safe";
  const downedIds = new Set();
  for (const mobId of mobs) {
    const stillStanding = party.filter(a => a.hp > 0 && !downedIds.has(a.id));
    if (stillStanding.length === 0) break;
    const enc = runPartyEncounter(stillStanding, mobId, rng);
    encounters.push({ mobId, ...enc });
    aggregateBuffs.rarityBoost += enc.buffs.rarityBoost || 0;
    aggregateBuffs.oreBonus    += enc.buffs.oreBonus || 0;
    aggregateBuffs.herbQualityBoost += enc.buffs.herbQualityBoost || 0;
    aggregateBuffs.gatherQtyBonus   += enc.buffs.gatherQtyBonus || 0;
    for (const id of (enc.injured || [])) downedIds.add(id);
    for (const matId of enc.drops || []) pendingMobDrops.push(matId);
    if (enc.result === "injured") { outcome = "injured"; break; }
    if (enc.result === "flee")    { outcome = "flee"; }
  }

  // Gather — even on a wipe the party still scrapes back what they can.
  let gatherDrops = gatherForParty(loc, party, gearList, aggregateBuffs, passiveList);

  // Apply outcome multiplier: safe = 1.0, flee = 0.7, injured = 0.5.
  const mult = outcome === "injured" ? 0.5 : outcome === "flee" ? 0.7 : 1.0;
  const drops = [];
  for (const d of gatherDrops) {
    const scaled = Math.floor(d.n * mult);
    if (scaled > 0) drops.push({ matId: d.matId, q: d.q, n: scaled });
  }
  for (const d of drops) addMat(d.matId, d.q, d.n);
  // Mob drops scale too — half/70% of one drop rounds to 0/1, so we use chance.
  for (const matId of pendingMobDrops) {
    if (mult >= 1 || rng.chance(mult)) addMat(matId, "norm", 1);
  }

  // Update adv state — everyone returns home, no permadeath, no injury flag.
  // HP is left at whatever combat ended at; the morning recovery pass restores
  // them to full so the player isn't penalized for a bad run.
  for (const adv of party) {
    adv.busy = false;
    adv.injured = false;
  }

  const members = party.map(a => ({
    advId: a.id, advName: a.name, classId: a.classId,
    hp: a.hp, maxHp: a.maxHp, injured: !!a.injured,
  }));

  const result = {
    partyId: party_.id, locId: party_.locId,
    locName: loc.name,
    members,
    encounters,
    drops,
    outcome,
  };

  const totalDrops = drops.reduce((s, d) => s + d.n, 0);
  const tail = outcome === "injured" ? `敗走（持ち帰り半減）／素材 ${totalDrops}点`
             : outcome === "flee"    ? `撤退（持ち帰り 7 割）／素材 ${totalDrops}点`
             : `素材 ${totalDrops}点`;
  pushLog({
    kind: "dispatch",
    summary: `パーティ（${members.map(m => m.advName).join("、")}）— ${loc.name}：${tail}`,
    detail: result,
  });
  for (const enc of encounters) {
    const memberNames = members.map(m => m.advName).join("、");
    pushLog({
      kind: "encounter",
      summary: `${memberNames} vs ${enc.log?.[0]?.text || ""}`,
      detail: { ...enc, locName: loc.name, partyNames: memberNames },
    });
  }
  return result;
}
