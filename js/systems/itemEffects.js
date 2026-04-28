// Combat use of carried potions. Mutates the adv's hp / buffs and emits log lines.
// Returns true if the item produced a meaningful effect (so the action counts
// as the adventurer's turn and the consumable should be removed).

import { state } from "../state.js";
import { ITEMS } from "../data/recipes.js";
import { QUALITY_LABEL } from "../data/materials.js";

// Quality multiplier for heal-style items so a "good" potion heals more than
// a "norm" one. Mirrors QUALITY_MULT in materials.js but kept local to avoid
// import cycles.
const Q_MULT = { poor: 0.7, norm: 1.0, good: 1.25, fine: 1.5 };

function announce(log, adv, item, q) {
  log.push({ tag: "magic", text: `${adv.name}は『${item.name}（${QUALITY_LABEL[q] || q}）』を使った。` });
}

// Apply the effect of `held` (a held-item slot) to `ctx` (the adventurer's
// combat context, see encounter.js). Returns true on success.
export function applyItemEffect(adv, held, ctx, log) {
  const item = ITEMS[held.itemId];
  if (!item || item.cat !== "potion") return false;
  const q = held.quality || "norm";
  const qm = Q_MULT[q] || 1.0;
  const buffs = ctx.buffs;

  switch (held.itemId) {
    case "herb_potion": {
      announce(log, adv, item, q);
      const heal = Math.max(1, Math.floor(adv.maxHp * 0.25 * qm));
      adv.hp = Math.min(adv.maxHp, adv.hp + heal);
      log.push({ tag: "heal", text: `HPを ${heal} 回復した。(${adv.hp}/${adv.maxHp})` });
      return true;
    }
    case "healing_potion": {
      announce(log, adv, item, q);
      const heal = Math.max(1, Math.floor(adv.maxHp * 0.50 * qm));
      adv.hp = Math.min(adv.maxHp, adv.hp + heal);
      log.push({ tag: "heal", text: `HPを ${heal} 回復した。(${adv.hp}/${adv.maxHp})` });
      return true;
    }
    case "greater_potion": {
      announce(log, adv, item, q);
      const heal = Math.max(1, Math.floor(adv.maxHp * 0.90 * qm));
      adv.hp = Math.min(adv.maxHp, adv.hp + heal);
      log.push({ tag: "heal", text: `HPを ${heal} 回復した。(${adv.hp}/${adv.maxHp})` });
      return true;
    }
    case "mana_draught": {
      announce(log, adv, item, q);
      buffs.magicDmgMult = Math.max(buffs.magicDmgMult || 1, 1.5);
      log.push({ tag: "magic", text: "次の魔法の威力が増した。" });
      return true;
    }
    case "antidote": {
      announce(log, adv, item, q);
      buffs.mobAccDown = 0;
      buffs.mobDmgDown = 0;
      const heal = Math.max(1, Math.floor(adv.maxHp * 0.10 * qm));
      adv.hp = Math.min(adv.maxHp, adv.hp + heal);
      log.push({ tag: "heal", text: `デバフを払いHPを ${heal} 回復。(${adv.hp}/${adv.maxHp})` });
      return true;
    }
    case "ether_phial": {
      announce(log, adv, item, q);
      if (buffs.usedSpells && typeof buffs.usedSpells.clear === "function") buffs.usedSpells.clear();
      log.push({ tag: "magic", text: "唱えた魔法を再び唱えられるようになった。" });
      return true;
    }
    case "legend_elixir": {
      announce(log, adv, item, q);
      adv.hp = adv.maxHp;
      buffs.divineWardTurns = Math.max(buffs.divineWardTurns || 0, 1);
      buffs.divineWardCut = Math.max(buffs.divineWardCut || 0, 1.0);
      log.push({ tag: "heal", text: `HPが完全に回復し、次のターン無敵になった。` });
      return true;
    }
    default:
      return false;
  }
}

// Pull a held item out of state. Called by encounter when a useItem action
// fires, after applyItemEffect succeeds.
export function consumeHeldItem(adv, slotIdx) {
  const slots = state.heldItems[adv.id];
  if (!Array.isArray(slots)) return;
  slots.splice(slotIdx, 1);
}

export const HELD_ITEM_LIMIT = 2;
