// Turn-based encounter resolution. Driven by adventurer strategy rules.
// Returns a structured combat log + outcome { result, lootDelta, hp }.

import { state, effectiveStats, gainExp } from "../state.js";
import { CLASSES } from "../data/adventurers.js";
import { SPELLS } from "../data/spells.js";
import { MONSTERS } from "../data/monsters.js";
import { EQUIPMENT, isAxe, isBow } from "../data/equipment.js";
import { STRATEGY_PRESETS } from "../data/strategies.js";
import { elementMult, elementLabel } from "../data/elements.js";
import { PASSIVES } from "../data/passives.js";
import { applyItemEffect, consumeHeldItem } from "./itemEffects.js";

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

function strategyFor(adv) {
  const slot = state.strategies[adv.id] || { preset: "standard", custom: [] };
  const preset = STRATEGY_PRESETS[slot.preset];
  if (slot.preset === "custom") return slot.custom || [];
  return preset?.rules || STRATEGY_PRESETS.standard.rules;
}

function gearStats(adv) {
  const g = state.equippedGear[adv.id] || {};
  let atk = 0, def = 0, luk = 0, gather = 0, qty = 0, rarity = 0, mat = 1;
  let oreBonus = 0;
  for (const slot of ["weapon", "armor", "trinket"]) {
    const id = g[slot];
    if (!id) continue;
    const eq = EQUIPMENT[id];
    if (!eq) continue;
    atk += eq.atk || 0;
    def += eq.def || 0;
    luk += eq.luk || 0;
    gather += eq.gather || 0;
    qty += eq.qty || 0;
    rarity += eq.rarity || 0;
    if (eq.mat) mat *= eq.mat;
    if (eq.oreBonus) oreBonus += eq.oreBonus;
  }
  return { atk, def, luk, gather, qty, rarity, mat, oreBonus };
}

function hasSchoolReady(adv, school, used) {
  const equipped = state.equippedSpells[adv.id] || [];
  for (const sid of equipped) {
    if (used.has(sid)) continue;
    const s = SPELLS[sid];
    if (s && s.school === school) return s;
  }
  return null;
}

function pickSpellInSlot(adv, school) {
  const equipped = state.equippedSpells[adv.id] || [];
  for (const sid of equipped) {
    const s = SPELLS[sid];
    if (s && s.school === school) return s;
  }
  return null;
}

function ruleMatches(rule, ctx) {
  switch (rule.trigger) {
    case "always": return true;
    case "hpPctLT": return (ctx.adv.hp / ctx.adv.maxHp) * 100 < rule.value;
    case "turnEq":  return ctx.turn === rule.value;
    case "everyN":  return ctx.turn % (rule.value || 2) === 0;
    default: return false;
  }
}

// Apply chosen action; returns { kind, line, dmg?, healed?, fled? }
function executeAction(rule, ctx, log) {
  const { adv, mob, advStats, mobStats, rng, buffs } = ctx;
  if (rule.action === "flee") {
    log.push({ tag: "verdict", text: `${adv.name}は撤退を選んだ。` });
    return { kind: "flee" };
  }
  if (rule.action === "castSchool") {
    const s = pickSpellInSlot(adv, rule.school);
    if (!s) return null; // try next rule
    return castSpell(s, ctx, log);
  }
  if (rule.action === "useItem") {
    const slots = state.heldItems[adv.id] || [];
    let slotIdx = -1;
    if (rule.itemId) {
      slotIdx = slots.findIndex(h => h && h.itemId === rule.itemId);
    } else if (slots.length > 0) {
      slotIdx = 0;
    }
    if (slotIdx < 0) return null; // no matching item carried — try next rule
    const ok = applyItemEffect(adv, slots[slotIdx], ctx, log);
    if (!ok) return null;
    consumeHeldItem(adv, slotIdx);
    return { kind: "useItem" };
  }
  // attack
  const baseAtk = advStats.atk + buffs.atkAdd + (buffs.atkMult ? Math.floor(advStats.atk * buffs.atkMult) : 0);
  const wmult = buffs.weaponMult || 1;
  const isCrit = (buffs.critRate || 0) > 0 && rng.chance(buffs.critRate);
  let dmg = Math.max(1, Math.floor(baseAtk * wmult) - mobStats.def + rng.int(0, 2));
  if (isCrit) dmg = Math.floor(dmg * 1.5);
  ctx.mob.hp -= dmg;
  log.push({ tag: isCrit ? "crit" : "turn", text: `${adv.name}の攻撃 → ${ctx.mob.name}に ${dmg} ダメージ。${isCrit ? " 急所!" : ""}` });
  return { kind: "attack", dmg };
}

function applyElement(rawDmg, attackElem, defenderElem, log, srcName, mobName, magicMult = 1) {
  const m = elementMult(attackElem, defenderElem);
  if (m > 1.05) log.push({ tag: "magic", text: `属性相性 効果はばつぐん。(×${m.toFixed(1)})` });
  else if (m < 0.95) log.push({ tag: "magic", text: `属性相性 効果はいまひとつ。(×${m.toFixed(1)})` });
  return Math.max(1, Math.floor(rawDmg * m * (magicMult || 1)));
}

function castSpell(s, ctx, log) {
  const { adv, mob, advStats, mobStats, rng, buffs } = ctx;
  // Mark used in buffs.usedSpells
  buffs.usedSpells.add(s.id);
  const elemTag = s.element && s.element !== "none" ? `（${elementLabel(s.element)}）` : "";
  log.push({ tag: "magic", text: `${adv.name}は『${s.name}』${elemTag}を唱えた。` });

  const dealElem = (raw) => applyElement(raw, s.element, mob.element, log, adv.name, mob.name, buffs.magicDmgMult);

  switch (s.id) {
    case "self_mend": {
      const heal = Math.max(1, Math.floor(adv.maxHp * s.power));
      adv.hp = Math.min(adv.maxHp, adv.hp + heal);
      log.push({ tag: "heal", text: `HPを ${heal} 回復した。(${adv.hp}/${adv.maxHp})` });
      return { kind: "heal" };
    }
    case "battle_aura": {
      buffs.atkMult = (buffs.atkMult || 0) + 0.30;
      buffs.battleAuraTurns = (buffs.battleAuraTurns || 0) + 3;
      log.push({ tag: "magic", text: `攻撃力が上がった。` });
      return { kind: "buff" };
    }
    case "iron_skin": {
      buffs.guardOnce = true;
      log.push({ tag: "magic", text: `次の被弾を半減する。` });
      return { kind: "buff" };
    }

    // Knight / holy
    case "holy_seal": {
      const heal = Math.max(2, Math.floor(adv.maxHp * 0.30));
      adv.hp = Math.min(adv.maxHp, adv.hp + heal);
      log.push({ tag: "heal", text: `光がHPを ${heal} 回復。(${adv.hp}/${adv.maxHp})` });
      // small light damage if mob is dark
      const dmg = dealElem(rng.int(3, 7));
      mob.hp -= dmg;
      log.push({ tag: "turn", text: `聖印の余波が ${mob.name} に ${dmg} ダメージ。` });
      return { kind: "heal" };
    }
    case "light_smite": {
      const dmg = dealElem(rng.int(7, 14));
      mob.hp -= dmg;
      log.push({ tag: "turn", text: `光輝の刃が ${mob.name} を裂いた。${dmg} ダメージ。` });
      return { kind: "magic", dmg };
    }
    case "divine_ward": {
      buffs.divineWardTurns = 2;
      buffs.divineWardCut = 0.40;
      log.push({ tag: "magic", text: `聖域の祈り。次2ターンの被ダメ4割軽減。` });
      return { kind: "buff" };
    }

    // Mage element
    case "spark": {
      const dmg = dealElem(rng.int(5, 11));
      mob.hp -= dmg;
      log.push({ tag: "turn", text: `炎が ${mob.name} を焼いた。${dmg} ダメージ。` });
      return { kind: "magic", dmg };
    }
    case "fire_lance": {
      const dmg = dealElem(rng.int(9, 18));
      mob.hp -= dmg;
      log.push({ tag: "turn", text: `焔の槍が ${mob.name} を貫く。${dmg} ダメージ。` });
      return { kind: "magic", dmg };
    }
    case "frost_bolt": {
      const dmg = dealElem(rng.int(7, 16));
      mob.hp -= dmg;
      buffs.mobStunTurns = (buffs.mobStunTurns || 0) + 1;
      log.push({ tag: "turn", text: `氷の矢が ${mob.name} を貫く。${dmg} ダメージ。動きを阻害。` });
      return { kind: "magic", dmg };
    }
    case "gale_cutter": {
      const dmg = dealElem(rng.int(6, 13));
      mob.hp -= dmg;
      buffs.oreBonus = (buffs.oreBonus || 0) + 0.10;
      log.push({ tag: "turn", text: `風刃が ${mob.name} を斬った。${dmg} ダメージ。` });
      return { kind: "magic", dmg };
    }
    case "arcane_pulse": {
      const dmg = Math.max(1, rng.int(7, 13) + Math.floor(advStats.atk * 0.3));
      mob.hp -= dmg;
      log.push({ tag: "turn", text: `魔導の波が ${mob.name} を打つ。${dmg} ダメージ。` });
      return { kind: "magic", dmg };
    }
    case "hex_ward": {
      buffs.magicWard = (buffs.magicWard || 0) + 0.4;
      log.push({ tag: "magic", text: `魔法ダメージを4割軽減する膜。` });
      return { kind: "buff" };
    }

    // Thief stealth/shadow
    case "shadow_step": {
      buffs.fleeSafe = true;
      buffs.rarityBoost = (buffs.rarityBoost || 0) + 0.05;
      log.push({ tag: "magic", text: `影に紛れた。` });
      return { kind: "buff" };
    }
    case "pilfer": {
      buffs.pilferEnd = true;
      const dmg = dealElem(rng.int(2, 5));
      mob.hp -= dmg;
      log.push({ tag: "turn", text: `懐を狙った一撃。${dmg} ダメージ。` });
      return { kind: "magic", dmg };
    }
    case "smoke_veil": {
      buffs.mobAccDown = (buffs.mobAccDown || 0) + 0.20;
      log.push({ tag: "magic", text: `煙幕で敵の命中を下げた。` });
      return { kind: "buff" };
    }
    case "night_blade": {
      const dmg = dealElem(rng.int(5, 12));
      mob.hp -= dmg;
      log.push({ tag: "turn", text: `夜の刃が ${mob.name} を裂いた。${dmg} ダメージ。` });
      return { kind: "magic", dmg };
    }

    // Herbalist heal/plant
    case "thorn_balm": {
      buffs.herbQualityBoost = (buffs.herbQualityBoost || 0) + 1;
      const heal = Math.max(2, Math.floor(adv.maxHp * 0.10));
      adv.hp = Math.min(adv.maxHp, adv.hp + heal);
      log.push({ tag: "heal", text: `茨の癒し。HPを ${heal} 回復。薬草の品質が上がる。` });
      return { kind: "heal" };
    }
    case "rebirth_seed": {
      buffs.rebirth = true;
      log.push({ tag: "magic", text: `再生の種が宿った。倒れても一度だけ蘇る。` });
      return { kind: "buff" };
    }
    case "bramble_call": {
      const dmg = dealElem(rng.int(4, 8));
      mob.hp -= dmg;
      buffs.gatherQtyBonus = (buffs.gatherQtyBonus || 0) + 1;
      log.push({ tag: "turn", text: `蔓の鞭が ${mob.name} を打った。${dmg} ダメージ。` });
      return { kind: "magic", dmg };
    }
    case "spore_haze": {
      buffs.mobDmgDown = (buffs.mobDmgDown || 0) + 0.30;
      log.push({ tag: "magic", text: `胞子の靄で敵の攻撃が弱まる。` });
      return { kind: "buff" };
    }
    case "cure_chant": {
      const heal = Math.max(2, Math.floor(adv.maxHp * 0.35));
      adv.hp = Math.min(adv.maxHp, adv.hp + heal);
      log.push({ tag: "heal", text: `癒しの詠唱。HPを ${heal} 回復。(${adv.hp}/${adv.maxHp})` });
      const dmg = dealElem(rng.int(2, 5));
      mob.hp -= dmg;
      log.push({ tag: "turn", text: `余波が ${mob.name} に ${dmg} ダメージ。` });
      return { kind: "heal" };
    }

    // Utility element
    case "prospect_wind": {
      buffs.oreBonus = (buffs.oreBonus || 0) + 0.20;
      const dmg = dealElem(rng.int(2, 6));
      mob.hp -= dmg;
      log.push({ tag: "turn", text: `風が鉱脈を示し、${mob.name} を ${dmg} 弾いた。` });
      return { kind: "magic", dmg };
    }
    case "phantom_clone": {
      buffs.divineWardTurns = Math.max(buffs.divineWardTurns || 0, 1);
      buffs.divineWardCut = Math.max(buffs.divineWardCut || 0, 0.5);
      const dmg = dealElem(rng.int(4, 9));
      mob.hp -= dmg;
      log.push({ tag: "magic", text: `影の分身が ${mob.name} に ${dmg} ダメージ。次の被弾を半減。` });
      return { kind: "magic", dmg };
    }
    case "dragon_breath_spell": {
      const dmg = dealElem(rng.int(15, 30));
      mob.hp -= dmg;
      log.push({ tag: "turn", text: `龍の息吹が ${mob.name} を焼き払った。${dmg} ダメージ。` });
      return { kind: "magic", dmg };
    }
    default: return { kind: "noop" };
  }
}

// Build per-adventurer combat context (stats / buffs / weapon mult).
function buildAdvCtx(adv) {
  const advStats = effectiveStats(adv);
  const gear = gearStats(adv);
  const passive = passiveEffects(adv);
  advStats.atk += gear.atk + (passive.atkBonus || 0);
  advStats.def += gear.def + (passive.defBonus || 0);
  advStats.luk += gear.luk;
  const weaponId = (state.equippedGear[adv.id] || {}).weapon;
  let weaponMult = 1.0;
  if (weaponId && isBow(weaponId) && passive.bowAtkBoost > 0) weaponMult += passive.bowAtkBoost;
  if (weaponId && isAxe(weaponId) && passive.axeAtkBoost > 0) weaponMult += passive.axeAtkBoost;
  const buffs = {
    atkMult: 0, atkAdd: 0, magicWard: 0,
    mobAccDown: passive.mobAccDown || 0,
    mobDmgDown: 0, mobStunTurns: 0,
    guardOnce: false,
    fleeSafe: !!passive.fleeSafe,
    rebirth: false, pilferEnd: false,
    rarityBoost: 0, oreBonus: 0, herbQualityBoost: 0, gatherQtyBonus: 0,
    battleAuraTurns: 0,
    divineWardTurns: 0, divineWardCut: 0,
    weaponMult,
    critRate: passive.critRate || 0,
    magicDmgMult: passive.magicDmgMult || 1,
    damageReduce: passive.damageReduce || 0,
    expMult: passive.expMult || 1,
    usedSpells: new Set(),
  };
  return { adv, advStats, passive, buffs, fled: false };
}

export function runEncounter(adv, mobId, rng) {
  const cls = CLASSES[adv.classId];
  const advStats = effectiveStats(adv);
  const gear = gearStats(adv);
  const passive = passiveEffects(adv);
  advStats.atk += gear.atk + (passive.atkBonus || 0);
  advStats.def += gear.def + (passive.defBonus || 0);
  advStats.luk += gear.luk;
  // Bow / axe weapon-tied passives
  const weaponId = (state.equippedGear[adv.id] || {}).weapon;
  let weaponMult = 1.0;
  if (weaponId && isBow(weaponId) && passive.bowAtkBoost > 0) weaponMult += passive.bowAtkBoost;
  if (weaponId && isAxe(weaponId) && passive.axeAtkBoost > 0) weaponMult += passive.axeAtkBoost;

  const mobDef = MONSTERS[mobId];
  if (!mobDef) return null;
  const mob = { ...mobDef, hp: mobDef.hp, name: mobDef.name };
  const log = [];
  log.push({ tag: "head", text: `${mob.name} と遭遇。` });

  const buffs = {
    atkMult: 0, atkAdd: 0, magicWard: 0,
    mobAccDown: passive.mobAccDown || 0,
    mobDmgDown: 0, mobStunTurns: 0,
    guardOnce: false,
    fleeSafe: !!passive.fleeSafe,
    rebirth: false, pilferEnd: false,
    rarityBoost: 0, oreBonus: 0, herbQualityBoost: 0, gatherQtyBonus: 0,
    battleAuraTurns: 0,
    divineWardTurns: 0, divineWardCut: 0,
    weaponMult,
    critRate: passive.critRate || 0,
    magicDmgMult: passive.magicDmgMult || 1,
    damageReduce: passive.damageReduce || 0,
    expMult: passive.expMult || 1,
    usedSpells: new Set(),
  };

  const rules = strategyFor(adv);
  let turn = 0;
  let result = "win";
  while (turn < 12) {
    turn += 1;
    if (mob.hp <= 0) break;
    if (adv.hp <= 0) break;

    // Adventurer turn
    let acted = null;
    for (const r of rules) {
      if (!ruleMatches(r, { adv, turn })) continue;
      const out = executeAction(r, { adv, mob, advStats, mobStats: mob, rng, buffs }, log);
      if (out) { acted = out; break; }
    }
    if (!acted) {
      // fallback: attack
      const dmg = Math.max(1, advStats.atk - mob.def);
      mob.hp -= dmg;
      log.push({ tag: "turn", text: `${adv.name}は様子見の一撃。${dmg} ダメージ。` });
    }
    if (acted && acted.kind === "flee") {
      result = buffs.fleeSafe ? "win-flee" : "flee";
      break;
    }
    if (mob.hp <= 0) {
      log.push({ tag: "verdict win", text: `${adv.name}の勝利。` });
      result = "win";
      break;
    }

    // Mob turn (skip if stunned)
    if (buffs.mobStunTurns > 0) {
      buffs.mobStunTurns -= 1;
      log.push({ tag: "turn", text: `${mob.name}は怯んで動けない。` });
    } else {
      // accuracy roll vs mobAccDown
      const hit = rng.next() > buffs.mobAccDown;
      if (!hit) {
        log.push({ tag: "turn", text: `${mob.name}の攻撃は逸れた。` });
      } else {
        let raw = mob.atk + rng.int(0, 2);
        if (buffs.mobDmgDown) raw = Math.floor(raw * (1 - buffs.mobDmgDown));
        let dmg = Math.max(1, raw - advStats.def);
        if (buffs.guardOnce) {
          dmg = Math.max(1, Math.floor(dmg / 2));
          buffs.guardOnce = false;
          log.push({ tag: "magic", text: `鉄壁が衝撃を受け止めた。` });
        }
        if (buffs.divineWardTurns > 0 && buffs.divineWardCut > 0) {
          dmg = Math.max(1, Math.floor(dmg * (1 - buffs.divineWardCut)));
          log.push({ tag: "magic", text: `聖域の祈りが衝撃を和らげた。` });
        }
        if (buffs.damageReduce > 0) {
          dmg = Math.max(1, Math.floor(dmg * (1 - buffs.damageReduce)));
        }
        adv.hp -= dmg;
        log.push({ tag: "turn", text: `${mob.name}の攻撃 → ${adv.name}に ${dmg} ダメージ。(${Math.max(0, adv.hp)}/${adv.maxHp})` });
      }
    }

    // tick buffs
    if (buffs.battleAuraTurns > 0) {
      buffs.battleAuraTurns -= 1;
      if (buffs.battleAuraTurns === 0) {
        buffs.atkMult = Math.max(0, buffs.atkMult - 0.30);
        log.push({ tag: "turn", text: `闘気が薄れた。` });
      }
    }
    if (buffs.divineWardTurns > 0) {
      buffs.divineWardTurns -= 1;
      if (buffs.divineWardTurns === 0) {
        buffs.divineWardCut = 0;
        log.push({ tag: "turn", text: `聖域の祈りが解けた。` });
      }
    }

    if (adv.hp <= 0) {
      if (buffs.rebirth) {
        adv.hp = 1;
        buffs.rebirth = false;
        log.push({ tag: "heal", text: `『再生の種』が芽吹き、${adv.name}は立ち上がった。` });
      } else {
        log.push({ tag: "verdict injured", text: `${adv.name}は倒れ、辛うじて連れ戻された。` });
        result = "injured";
        break;
      }
    }
  }

  if (turn >= 12 && mob.hp > 0 && adv.hp > 0) {
    log.push({ tag: "verdict flee", text: `${adv.name}は退き上がった。` });
    result = buffs.fleeSafe ? "win-flee" : "flee";
  }

  // Compute drops
  const drops = [];
  if (result === "win" || result === "win-flee") {
    for (const d of (mobDef.drops || [])) {
      if (rng.chance(d.p + (buffs.rarityBoost || 0))) {
        drops.push(d.mat);
      }
    }
    if (buffs.pilferEnd && (mobDef.drops || []).length) {
      const extra = rng.pick(mobDef.drops);
      drops.push(extra.mat);
      log.push({ tag: "magic", text: `掠め取り — 追加で素材を手にした。` });
    }
    const expGain = Math.floor((mobDef.exp || 0) * (buffs.expMult || 1));
    gainExp(adv, expGain);
    log.push({ tag: "verdict win", text: `経験値 +${expGain}` });
  }

  return { result, log, drops, buffs };
}

// ============================================================
// Party-aware encounter — multiple adventurers vs one mob.
// ============================================================

function partySelectAction(ctx, mob, turn, rng, log) {
  const rules = strategyFor(ctx.adv);
  for (const r of rules) {
    if (!ruleMatches(r, { adv: ctx.adv, turn })) continue;
    const out = executeAction(r, {
      adv: ctx.adv, mob, advStats: ctx.advStats, mobStats: mob, rng, buffs: ctx.buffs,
    }, log);
    if (out) return out;
  }
  // Fallback: plain attack
  const dmg = Math.max(1, ctx.advStats.atk - mob.def);
  mob.hp -= dmg;
  log.push({ tag: "turn", text: `${ctx.adv.name}は様子見の一撃。${dmg} ダメージ。` });
  return { kind: "attack", dmg };
}

function pickMobTarget(ctxs, rng) {
  const alive = ctxs.filter(c => c.adv.hp > 0 && !c.fled);
  if (alive.length === 0) return null;
  // Bias toward lower HP%, with some randomness
  const weighted = alive.map(c => ({ c, w: 1.5 - (c.adv.hp / Math.max(1, c.adv.maxHp)) }));
  const total = weighted.reduce((s, x) => s + Math.max(0.1, x.w), 0);
  let r = rng.next() * total;
  for (const x of weighted) {
    r -= Math.max(0.1, x.w);
    if (r <= 0) return x.c;
  }
  return alive[0];
}

export function runPartyEncounter(party, mobId, rng) {
  const mobDef = MONSTERS[mobId];
  if (!mobDef) return null;
  const mob = { ...mobDef, hp: mobDef.hp, name: mobDef.name };
  const log = [];
  log.push({ tag: "head", text: `${mob.name} と遭遇。` });
  const memberNames = party.map(a => a.name).join("、");
  log.push({ tag: "head", text: `パーティ：${memberNames}` });

  // One context per adventurer, sorted by luk desc for turn order
  const ctxs = party.map(buildAdvCtx);
  ctxs.sort((a, b) => b.advStats.luk - a.advStats.luk);

  let turn = 0;
  let result = "win"; // win | flee | injured | win-flee | wipe
  while (turn < 14) {
    turn += 1;
    if (mob.hp <= 0) break;

    // Each conscious, non-fled adventurer acts in luk order
    for (const ctx of ctxs) {
      if (ctx.adv.hp <= 0 || ctx.fled) continue;
      if (mob.hp <= 0) break;
      const out = partySelectAction(ctx, mob, turn, rng, log);
      if (out && out.kind === "flee") {
        ctx.fled = true;
      }
    }

    if (mob.hp <= 0) {
      log.push({ tag: "verdict win", text: "敵を打ち倒した。" });
      result = "win";
      break;
    }

    // Are there any combatants left?
    const stillFighting = ctxs.filter(c => c.adv.hp > 0 && !c.fled);
    if (stillFighting.length === 0) {
      const anyAlive = ctxs.some(c => c.adv.hp > 0);
      if (anyAlive) {
        const allFleeSafe = ctxs.every(c => c.adv.hp <= 0 || c.fled === false || c.buffs.fleeSafe);
        result = allFleeSafe ? "win-flee" : "flee";
        log.push({ tag: "verdict flee", text: "パーティは戦域を離脱した。" });
      } else {
        result = "injured";
        log.push({ tag: "verdict injured", text: "パーティは退却を強いられた。" });
      }
      break;
    }

    // Mob attacks one alive non-fled member
    const target = pickMobTarget(ctxs, rng);
    if (!target) break;
    if (target.buffs.mobStunTurns > 0) {
      target.buffs.mobStunTurns -= 1;
      log.push({ tag: "turn", text: `${mob.name}は怯んで動けない。` });
    } else {
      const hit = rng.next() > target.buffs.mobAccDown;
      if (!hit) {
        log.push({ tag: "turn", text: `${mob.name}の攻撃は ${target.adv.name} を逸れた。` });
      } else {
        let raw = mob.atk + rng.int(0, 2);
        if (target.buffs.mobDmgDown) raw = Math.floor(raw * (1 - target.buffs.mobDmgDown));
        let dmg = Math.max(1, raw - target.advStats.def);
        if (target.buffs.guardOnce) {
          dmg = Math.max(1, Math.floor(dmg / 2));
          target.buffs.guardOnce = false;
          log.push({ tag: "magic", text: `鉄壁が衝撃を受け止めた。` });
        }
        if (target.buffs.divineWardTurns > 0 && target.buffs.divineWardCut > 0) {
          dmg = Math.max(1, Math.floor(dmg * (1 - target.buffs.divineWardCut)));
          log.push({ tag: "magic", text: `聖域の祈りが衝撃を和らげた。` });
        }
        if (target.buffs.damageReduce > 0) {
          dmg = Math.max(1, Math.floor(dmg * (1 - target.buffs.damageReduce)));
        }
        target.adv.hp -= dmg;
        log.push({ tag: "turn", text: `${mob.name}の攻撃 → ${target.adv.name}に ${dmg} ダメージ。(${Math.max(0, target.adv.hp)}/${target.adv.maxHp})` });
      }
    }

    // Tick buffs / handle KO + rebirth per ctx
    for (const ctx of ctxs) {
      if (ctx.buffs.battleAuraTurns > 0) {
        ctx.buffs.battleAuraTurns -= 1;
        if (ctx.buffs.battleAuraTurns === 0) {
          ctx.buffs.atkMult = Math.max(0, ctx.buffs.atkMult - 0.30);
          log.push({ tag: "turn", text: `${ctx.adv.name}の闘気が薄れた。` });
        }
      }
      if (ctx.buffs.divineWardTurns > 0) {
        ctx.buffs.divineWardTurns -= 1;
        if (ctx.buffs.divineWardTurns === 0) {
          ctx.buffs.divineWardCut = 0;
        }
      }
      if (ctx.adv.hp <= 0 && !ctx.fled) {
        if (ctx.buffs.rebirth) {
          ctx.adv.hp = 1;
          ctx.buffs.rebirth = false;
          log.push({ tag: "heal", text: `『再生の種』が芽吹き、${ctx.adv.name}は立ち上がった。` });
        } else {
          log.push({ tag: "verdict injured", text: `${ctx.adv.name}は倒れた。` });
        }
      }
    }
  }

  if (turn >= 14 && mob.hp > 0) {
    const anyAlive = ctxs.some(c => c.adv.hp > 0);
    if (!anyAlive) result = "injured";
    else result = "flee";
    log.push({ tag: "verdict flee", text: "持久戦の末、パーティは退いた。" });
  }

  // Aggregate buffs that influence post-combat gather/drops
  const aggBuffs = {
    rarityBoost: 0, oreBonus: 0, herbQualityBoost: 0, gatherQtyBonus: 0,
  };
  for (const ctx of ctxs) {
    aggBuffs.rarityBoost += ctx.buffs.rarityBoost || 0;
    aggBuffs.oreBonus += ctx.buffs.oreBonus || 0;
    aggBuffs.herbQualityBoost += ctx.buffs.herbQualityBoost || 0;
    aggBuffs.gatherQtyBonus += ctx.buffs.gatherQtyBonus || 0;
  }

  // Drops + exp
  const drops = [];
  if (result === "win" || result === "win-flee") {
    for (const d of (mobDef.drops || [])) {
      if (rng.chance(d.p + (aggBuffs.rarityBoost || 0))) drops.push(d.mat);
    }
    // Pilfer extra
    if (ctxs.some(c => c.buffs.pilferEnd) && (mobDef.drops || []).length) {
      const extra = rng.pick(mobDef.drops);
      drops.push(extra.mat);
      log.push({ tag: "magic", text: `掠め取り — 追加で素材を手にした。` });
    }
    // Exp split among participants who survived (or were knocked out by mob)
    const participants = ctxs.filter(c => c.adv.hp > 0 || true); // include even injured (they fought)
    const baseExp = Math.floor((mobDef.exp || 0) * 0.6); // group share
    for (const ctx of participants) {
      const personal = Math.max(1, Math.floor(baseExp * (ctx.buffs.expMult || 1)));
      gainExp(ctx.adv, personal);
      log.push({ tag: "verdict win", text: `${ctx.adv.name} 経験値 +${personal}` });
    }
  }

  // Mark members who hit 0 HP at end of combat as injured-prone
  const injured = ctxs.filter(c => c.adv.hp <= 0).map(c => c.adv.id);

  return { result, log, drops, buffs: aggBuffs, injured };
}

