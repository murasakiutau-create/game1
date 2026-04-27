// Adventurer card — used in party list and market.

import { h, btn } from "./components.js";
import { CLASSES } from "../data/adventurers.js";
import { RANKS } from "../data/ranks.js";
import { effectiveStats } from "../state.js";
import { state } from "../state.js";

export function rankSeal(rankId) {
  return h("span", { class: "rank-seal rank-" + rankId, title: `ランク${rankId}` }, rankId);
}

export function advSummary(adv) {
  const cls = CLASSES[adv.classId];
  const rank = RANKS[adv.rankId];
  const st = effectiveStats(adv);
  const equippedSpells = (state.equippedSpells[adv.id] || []).length;
  return h("div", { class: "adv-card" + (adv.busy ? " busy" : "") + (adv.injured ? " injured" : "") },
    h("div", { class: "head" },
      h("h3", null, adv.name, " ", rankSeal(adv.rankId)),
      h("span", { class: "tag" }, cls.label),
    ),
    h("div", { class: "muted" }, `Lv ${adv.level}　経験値 ${adv.exp}`),
    h("div", { class: "stats" },
      h("span", null, `HP ${adv.hp}/${adv.maxHp}`),
      h("span", null, `攻 ${st.atk}`),
      h("span", null, `守 ${st.def}`),
      h("span", null, `運 ${st.luk}`),
    ),
    h("div", { class: "muted" }, `日給 ${rank.dailyWage} G　魔法スロット ${equippedSpells}/${adv.slots}`),
  );
}

export function advCardWithActions(adv, actions) {
  const card = advSummary(adv);
  if (actions && actions.length) {
    const row = h("div", { class: "row", style: { marginTop: "0.5rem" } });
    for (const a of actions) row.appendChild(a);
    card.appendChild(row);
  }
  return h("div", { class: "parchment-card" }, card);
}
