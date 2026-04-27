// Evening: present dispatch results + sale digest.

import { h, clear, btn, panel, modal } from "./components.js";
import { state } from "../state.js";
import { LOCATIONS } from "../data/locations.js";
import { MATERIALS, QUALITY_LABEL } from "../data/materials.js";
import { CLASSES } from "../data/adventurers.js";
import { ITEMS } from "../data/recipes.js";

export function renderEveningScene(host, { onAdvance, refresh }) {
  clear(host);
  const wrap = h("section", { class: "stack" });

  wrap.appendChild(panel("夕　— 帰還報告と売上",
    h("p", { class: "muted" }, "派遣した冒険者の帰還と昼の売上をご報告します。")
  ));

  // Dispatch results — party-grouped
  const dispatched = state.dispatchResults || [];
  const drBody = h("div", { class: "stack" });
  if (dispatched.length === 0) drBody.appendChild(h("p", { class: "muted" }, "今日は誰も派遣しませんでした。"));
  for (const r of dispatched) {
    // Backwards-compat: legacy single-adv result
    const isParty = Array.isArray(r.members);
    const titleLeft = isParty
      ? `パーティ（${r.members.length}名） — ${r.locName}`
      : `${r.advName}（${CLASSES[state.party.find(a => a.id === r.advId)?.classId]?.label || ""}） — ${r.locName}`;
    const memberRow = isParty
      ? h("div", { class: "row", style: { flexWrap: "wrap", gap: "0.3em", marginTop: "0.3em" } },
          ...r.members.map(m => h("span", { class: "tag" + (m.injured ? " wax" : "") },
            `${m.advName}（${CLASSES[m.classId]?.label || ""}）`,
            m.injured ? " 重傷" : ` HP ${m.hp}/${m.maxHp}`)))
      : null;
    drBody.appendChild(h("div", { class: "parchment-card" },
      h("div", { class: "row between" },
        h("strong", null, titleLeft),
        h("span", { class: "tag " + (r.outcome === "injured" ? "wax" : r.outcome === "flee" ? "" : "gold") },
          r.outcome === "injured" ? "重傷者あり" : r.outcome === "flee" ? "敗走" : "無事帰還"),
      ),
      memberRow,
      r.encounters && r.encounters.length > 0
        ? h("p", { class: "muted" }, `戦闘 ${r.encounters.length} 件 ── `, btn("ログを見る", () => showCombatLogs(r), { ghost: true, small: true }))
        : h("p", { class: "muted" }, "戦闘なし。"),
      h("p", null, "採取：",
        r.drops.length === 0
          ? h("span", { class: "muted" }, "（成果なし）")
          : r.drops.map(d => h("span", { class: "tag", style: { marginRight: "0.3em" } },
              `${MATERIALS[d.matId]?.name || d.matId} ${QUALITY_LABEL[d.q]} ×${d.n}`)),
      ),
    ));
  }
  wrap.appendChild(panel("派遣の結果", drBody, "✦"));

  // Sale digest
  const bk = state.bookkeeping;
  const saleBody = h("div", { class: "stack" });
  saleBody.appendChild(h("div", { class: "row between" },
    h("strong", null, `本日の売上 ${bk.earnedToday} G`),
    h("span", { class: "muted" }, `販売 ${bk.soldToday} 件`),
  ));
  const eventList = h("ul", null);
  for (const ev of (bk.customerLogToday || []).slice(0, 12)) {
    if (ev.type === "sale") eventList.appendChild(h("li", null, `${ev.cust}：『${ev.item}』(${ev.q}) を ${ev.paid} G で購入。`));
    else if (ev.type === "miss") eventList.appendChild(h("li", { class: "muted" }, `${ev.cust}は ${ev.want} を探していたが、棚になく帰った。`));
    else if (ev.type === "too-expensive") eventList.appendChild(h("li", { class: "muted" }, `${ev.cust}は『${ev.item}』を高すぎる（${ev.ask} G）と感じた。許容 ${ev.ceiling} G。`));
  }
  saleBody.appendChild(eventList);
  wrap.appendChild(panel("店頭の出来事", saleBody, "❦"));

  wrap.appendChild(panel("",
    h("div", { class: "stack" },
      btn("夜の作業へ", () => onAdvance(), { primary: true, block: true }),
    ), "❦"));

  host.appendChild(wrap);
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
