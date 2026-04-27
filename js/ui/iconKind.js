// Decide which category chip icon to show for a given item or spell.
//
// Items (ITEMS[id].cat):
//   weapon  → cat-weapon.png  (sword)
//   armor   → cat-armor.png   (hooded coat)
//   else    → cat-item.png    (potion bottle, used for potion/trinket/tome)
//
// Spells:
//   self-heal / heal / holy_seal → cat-heal.png  (cross)
//   anything else dealing damage → cat-attack.png (sun burst)
//   pure self-buffs (e.g. iron_skin, battle_aura) → null (no icon)

import { h } from "./components.js";

export function itemIconKind(item) {
  if (!item) return "item";
  if (item.cat === "weapon") return "weapon";
  if (item.cat === "armor") return "armor";
  return "item";
}

const HEAL_IDS = new Set(["self_mend", "holy_seal", "thorn_balm", "rebirth_seed", "cure_chant"]);
const PURE_BUFF_SCHOOLS = new Set(["self-buff", "support", "support-weak", "stealth"]);

export function spellIconKind(spell) {
  if (!spell) return null;
  if (HEAL_IDS.has(spell.id) || spell.school === "self-heal" || spell.school === "heal") return "heal";
  if (PURE_BUFF_SCHOOLS.has(spell.school) && typeof spell.power === "number" && spell.power < 1) return null;
  return "attack";
}

export function iconChip(kind, opts = {}) {
  if (!kind) return null;
  const cls = `card-icon icon-${kind}` + (opts.small ? " small" : "") + (opts.large ? " large" : "");
  return h("span", { class: cls, "aria-hidden": "true" });
}
