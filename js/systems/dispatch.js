// Dispatch resolution: gather rolls + 0..3 encounters + log assembly.
// Result is stored on state.dispatchResults until the evening scene presents it.

import { state, addMat, rng } from "../state.js";
import { CLASSES, expForLevel } from "../data/adventurers.js";
import { LOCATIONS, AMBIENT_DROP, DEFAULT_Q_BIAS } from "../data/locations.js";
import { MATERIALS, QUALITY_LEVELS } from "../data/materials.js";
import { EQUIPMENT } from "../data/equipment.js";
import { PASSIVES } from "../data/passives.js";
import { runEncounter } from "./encounter.js";
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
  const totalW = loc.encounters.reduce((s, e) => s + e.w, 0);
  const picks = [];
  // 0 to (danger-1) base + chance roll for an extra
  let attempts = 1 + Math.floor(loc.danger / 2);
  for (let i = 0; i < attempts; i++) {
    if (!rng.chance(loc.encounterRate)) continue;
    let r = rng.next() * totalW;
    for (const e of loc.encounters) {
      r -= e.w;
      if (r <= 0) { picks.push(e.mob); break; }
    }
  }
  // Cap at 3
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
