// Read-only market modal. Available from the bottom-tab "雇用" in any phase.
// During morning, hiring is allowed; otherwise candidates are shown but
// hiring waits for next morning to keep daily-market semantics.

import { h, btn, modal, toast } from "./components.js";
import { state } from "../state.js";
import { CLASSES } from "../data/adventurers.js";
import { RANKS } from "../data/ranks.js";
import { advSummary } from "./advCard.js";

export function openMarketViewer(refresh) {
  const body = h("div", { class: "stack" });
  function rerender() {
    body.innerHTML = "";
    const isMorning = state.phase === "morning";
    if (!isMorning) {
      body.appendChild(h("p", { class: "muted" },
        "雇用契約は朝の時間帯にのみ結べます。明朝、市場が更新された後に再度ご検討ください。"));
    }
    if (!state.market || state.market.length === 0) {
      body.appendChild(h("p", { class: "muted" }, "本日の応募者はおりません。"));
      return;
    }
    const grid = h("div", { class: "card-grid" });
    for (const cand of state.market) {
      const rank = RANKS[cand.rankId];
      const canAfford = state.gold >= rank.hireCost;
      const allowHire = isMorning && canAfford;
      grid.appendChild(h("div", { class: "parchment-card" + (allowHire ? "" : " disabled") },
        advSummary(cand),
        h("div", { class: "row between", style: { marginTop: "0.5rem" } },
          h("span", { class: "tag gold" }, `雇用金 ${rank.hireCost} G`),
          isMorning
            ? btn(canAfford ? "雇う" : "金貨不足", () => hire(cand, () => { rerender(); refresh(); }),
                  { primary: canAfford, disabled: !canAfford, small: true })
            : btn("朝に雇用可", () => {}, { ghost: true, small: true, disabled: true }),
        ),
      ));
    }
    body.appendChild(grid);
  }
  rerender();
  const m = modal(body, { title: `雇用市場（${state.market?.length || 0}名）` });
}

function hire(cand, after) {
  const rank = RANKS[cand.rankId];
  if (state.gold < rank.hireCost) { toast("金貨が足りません。", { error: true }); return; }
  state.gold -= rank.hireCost;
  state.party.push(cand);
  state.market = state.market.filter(c => c.id !== cand.id);
  state.equippedGear[cand.id] = { weapon: null, armor: null, trinket: null };
  state.equippedSpells[cand.id] = [];
  state.learnedSpells[cand.id] = [];
  state.strategies[cand.id] = { preset: "standard", custom: [] };
  state.passives[cand.id] = [];
  state.heldItems[cand.id] = [];
  toast(`${cand.name}（ランク${cand.rankId}）を雇用しました。`);
  after();
}
