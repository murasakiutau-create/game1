// Return modal — shown on the morning after a dispatch. Lists each party
// that came back, their final HP, the materials gathered, and a button to
// review combat logs per encounter.

import { h, btn, modal } from "./components.js";
import { state } from "../state.js";
import { CLASSES } from "../data/adventurers.js";
import { MATERIALS, QUALITY_LABEL } from "../data/materials.js";

export function openReturnModal(onClose) {
  const results = state.dispatchResults || [];
  const body = h("div", { class: "stack" });

  if (results.length === 0) {
    body.appendChild(h("p", { class: "muted" }, "今朝の帰還報告はありません。"));
  } else {
    body.appendChild(h("p", null, `昨日派遣した冒険者が帰ってきました（${results.length}組）。`));
  }

  for (const r of results) {
    const isParty = Array.isArray(r.members);
    const memberPills = isParty ? h("div", { class: "row", style: { flexWrap: "wrap", gap: "0.3em", marginTop: "0.3em" } },
      ...r.members.map(m => h("span", { class: "tag" + (m.injured ? " wax" : "") },
        `${m.advName}（${CLASSES[m.classId]?.label || ""}）`,
        m.injured ? " 重傷" : ` HP ${m.hp}/${m.maxHp}`))) : null;
    body.appendChild(h("div", { class: "parchment-card" },
      h("div", { class: "row between" },
        h("strong", null, isParty ? `パーティ（${r.members.length}名）` : r.advName, " — ", r.locName),
        h("span", { class: "tag " + (r.outcome === "injured" ? "wax" : r.outcome === "flee" ? "" : "gold") },
          r.outcome === "injured" ? "重傷者あり" : r.outcome === "flee" ? "敗走" : "無事帰還"),
      ),
      memberPills,
      h("p", { class: "muted", style: { marginTop: "0.4rem" } },
        r.encounters && r.encounters.length > 0
          ? [`戦闘 ${r.encounters.length} 件 ── `, btn("ログを見る", () => showCombatLogs(r), { ghost: true, small: true })]
          : "戦闘なし。"
      ),
      h("p", null, "受け取り：",
        (!r.drops || r.drops.length === 0)
          ? h("span", { class: "muted" }, "（成果なし）")
          : r.drops.map(d => h("span", { class: "tag", style: { marginRight: "0.3em" } },
              `${MATERIALS[d.matId]?.name || d.matId} ${QUALITY_LABEL[d.q]} ×${d.n}`)),
      ),
    ));
  }

  const footer = btn("確認した", () => { m.close(); }, { primary: true });

  const m = modal(body, {
    title: "帰還報告",
    foot: footer,
    onClose: () => {
      // Clear after viewing so the modal doesn't auto-reopen on subsequent renders.
      state.dispatchResults = [];
      if (onClose) onClose();
    },
  });
}

function showCombatLogs(result) {
  const body = h("div", { class: "stack" });
  for (const enc of result.encounters || []) {
    body.appendChild(h("div", { class: "log-entry" },
      h("strong", null, `vs ${enc.log[0]?.text || "敵"}`),
      h("div", { class: "combat-log" },
        ...(enc.log || []).map(line => h("div", { class: line.tag }, line.text))
      ),
    ));
  }
  const titleSubject = Array.isArray(result.members)
    ? `パーティ（${result.members.map(m => m.advName).join("、")}）`
    : result.advName;
  modal(body, { title: `${titleSubject} の戦闘記録 — ${result.locName}` });
}
