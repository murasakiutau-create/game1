// Decide which category chip icon to show for a given item or spell.
//
// Items (ITEMS[id].cat):
//   weapon  → cat-weapon.png  (sword)
//   armor   → cat-armor.png   (hooded coat)
//   trinket → cat-trinket.png (ring pendant)
//   tome    → spell icon if grantsSpell is known, else cat-item.png
//   else    → cat-item.png    (potion bottle — potions)
//
// Spells:
//   heal-flavored                → cat-heal.png   (cross)
//   damaging or pure buff/debuff → cat-attack.png (sun burst)

import { h } from "./components.js";
import { SPELLS } from "../data/spells.js";

const HEAL_IDS = new Set(["self_mend", "holy_seal", "thorn_balm", "rebirth_seed", "cure_chant"]);

export function spellIconKind(spell) {
  if (!spell) return null;
  if (HEAL_IDS.has(spell.id) || spell.school === "self-heal" || spell.school === "heal") return "heal";
  return "attack";
}

export function itemIconKind(item) {
  if (!item) return "item";
  if (item.cat === "weapon") return "weapon";
  if (item.cat === "armor") return "armor";
  if (item.cat === "trinket") return "trinket";
  if (item.cat === "tome" && item.grantsSpell) {
    const k = spellIconKind(SPELLS[item.grantsSpell]);
    if (k) return k;
  }
  return "item";
}

export function iconChip(kind, opts = {}) {
  if (!kind) return null;
  const cls = `card-icon icon-${kind}` + (opts.small ? " small" : "") + (opts.large ? " large" : "");
  return h("span", { class: cls, "aria-hidden": "true" });
}
