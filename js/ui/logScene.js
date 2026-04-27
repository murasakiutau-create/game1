// Log viewer modal: filter by day, kind, adventurer.

import { h, btn, modal, panel } from "./components.js";
import { state } from "../state.js";
import { getLogs } from "../systems/log.js";
import { CLASSES } from "../data/adventurers.js";

const KIND_LABELS = {
  dispatch: "派遣",
  encounter: "戦闘",
  sale: "販売",
  craft: "調合",
  research: "研究",
  hire: "雇用",
  system: "記録",
};

let filter = { day: null, kind: null, advId: null };

export function openLogViewer() {
  let body = h("div", { class: "stack" });
  function rerender() {
    body.innerHTML = "";

    const dayOptions = [...new Set(state.logs.map(l => l.day))].sort((a, b) => b - a);

    const ctrls = h("div", { class: "row" },
      h("label", null, "日 "),
      selectFromList(["all", ...dayOptions], (v) => v === "all" ? "すべて" : `第${v}日`, filter.day == null ? "all" : filter.day, (v) => { filter.day = v === "all" ? null : +v; rerender(); }),
      h("label", null, "種類 "),
      selectFromList(["all", "dispatch", "encounter", "sale", "craft", "research", "hire", "system"], (v) => v === "all" ? "すべて" : KIND_LABELS[v], filter.kind || "all", (v) => { filter.kind = v === "all" ? null : v; rerender(); }),
      h("label", null, "冒険者 "),
      selectFromList(["all", ...state.party.map(a => a.id)], (v) => v === "all" ? "すべて" : (state.party.find(a => a.id === v)?.name || v), filter.advId || "all", (v) => { filter.advId = v === "all" ? null : v; rerender(); }),
    );

    const logs = getLogs({
      day: filter.day,
      kinds: filter.kind ? [filter.kind] : null,
      advId: filter.advId,
    });

    const list = h("div", { class: "stack" });
    if (logs.length === 0) list.appendChild(h("p", { class: "muted" }, "該当する記録がありません。"));
    for (const l of logs.slice(0, 200)) {
      const card = h("div", { class: "log-entry" },
        h("div", { class: "row between" },
          h("strong", null, `第${l.day}日 ${KIND_LABELS[l.kind] || l.kind}`),
          h("span", { class: "muted" }, ""),
        ),
        h("div", null, l.summary || ""),
      );
      // expand: encounter detail
      if (l.kind === "encounter" && l.detail?.log) {
        const det = h("details", null,
          h("summary", { class: "muted" }, "戦闘の詳細"),
          h("div", { class: "combat-log" },
            ...(l.detail.log).map(line => h("div", { class: line.tag || "" }, line.text))
          )
        );
        card.appendChild(det);
      }
      if (l.kind === "dispatch" && l.detail?.drops?.length) {
        const det = h("details", null,
          h("summary", { class: "muted" }, "採取の詳細"),
          h("ul", null, ...l.detail.drops.map(d => h("li", null, `${d.matId} ${d.q} ×${d.n}`))),
        );
        card.appendChild(det);
      }
      list.appendChild(card);
    }

    body.appendChild(panel("📜 記録（直近30日分）", h("div", { class: "stack" }, ctrls, h("div", { class: "divider" }), list), "❦"));
  }
  rerender();
  modal(body, { title: "記録" });
}

function selectFromList(values, label, current, onChange) {
  const sel = document.createElement("select");
  for (const v of values) {
    const o = document.createElement("option");
    o.value = String(v);
    o.textContent = label(v);
    if (String(v) === String(current)) o.selected = true;
    sel.appendChild(o);
  }
  sel.addEventListener("change", () => onChange(sel.value));
  return sel;
}
