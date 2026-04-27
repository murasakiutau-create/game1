// Read-only-ish party roster modal. Available from the bottom-tab "冒険者"
// in any phase. Tapping a card opens the full adventurer sheet (gear/spells/
// passives/strategy). Does NOT mutate state.phase.

import { h, btn, modal } from "./components.js";
import { state } from "../state.js";
import { advSummary } from "./advCard.js";
import { openAdventurerSheet } from "./morningScene.js";
import { LOCATIONS } from "../data/locations.js";

export function openPartyViewer(refresh) {
  const body = h("div", { class: "stack" });
  function rerender() {
    body.innerHTML = "";
    if (state.party.length === 0) {
      body.appendChild(h("p", { class: "muted" }, "まだ仲間がいません。朝の雇用市場で冒険者を雇いましょう。"));
      return;
    }
    body.appendChild(h("p", { class: "muted" },
      "冒険者の装備・魔法・特性・戦略はここから確認・編集できます。派遣の編成は朝のシーンから行います。"));
    const grid = h("div", { class: "card-grid" });
    for (const adv of state.party) {
      const partyAt = findPartyOf(adv.id);
      grid.appendChild(h("div", { class: "parchment-card" + (adv.injured ? " disabled" : "") },
        advSummary(adv),
        h("div", { class: "muted", style: { marginTop: "0.4rem" } },
          partyAt ? `→ ${LOCATIONS[partyAt.locId]?.name || "—"} へ派遣予定（${partyAt.advIds.length}名パーティ）` :
          adv.injured ? "本日は休養（重傷）" :
          adv.busy ? "出征中" : "待機中"),
        h("div", { class: "row", style: { marginTop: "0.5rem" } },
          btn("詳細", () => {
            m.close();
            openAdventurerSheet(adv, () => { refresh(); openPartyViewer(refresh); });
          }, { primary: true, small: true }),
        ),
      ));
    }
    body.appendChild(grid);
  }
  rerender();
  const m = modal(body, { title: `冒険者一覧（${state.party.length}名）` });
}

function findPartyOf(advId) {
  if (!Array.isArray(state.pendingDispatch)) return null;
  for (const p of state.pendingDispatch) {
    if (p && Array.isArray(p.advIds) && p.advIds.includes(advId)) return p;
  }
  return null;
}
