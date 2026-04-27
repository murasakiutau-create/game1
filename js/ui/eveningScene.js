// Evening: present dispatch results + sale digest.

import { h, clear, btn, panel, modal } from "./components.js";
import { state } from "../state.js";
import { LOCATIONS } from "../data/locations.js";
import { MATERIALS, QUALITY_LABEL } from "../data/materials.js";
import { CLASSES } from "../data/adventurers.js";
import { ITEMS } from "../data/recipes.js";

function LOCATIONS_BY_ID(id) { return LOCATIONS[id]?.name; }

export function renderEveningScene(host, { onAdvance, refresh }) {
  clear(host);
  const wrap = h("section", { class: "stack" });

  wrap.appendChild(panel("夕　— 売上のまとめ",
    h("p", { class: "muted" }, "昼の売上を確認します。派遣した冒険者は明朝に帰還します。")
  ));

  // Adventurers still away
  const out = state.outOnDispatch || [];
  if (out.length > 0) {
    const awayBody = h("div", { class: "stack" });
    for (const p of out) {
      const memberNames = (p.advIds || [])
        .map(id => state.party.find(a => a.id === id)?.name).filter(Boolean).join("、");
      awayBody.appendChild(h("div", { class: "parchment-card" },
        h("div", { class: "row between" },
          h("strong", null, LOCATIONS_BY_ID(p.locId) || p.locId),
          h("span", { class: "tag" }, `${p.advIds?.length || 0}名`),
        ),
        h("div", { class: "muted" }, memberNames || "—"),
        h("div", { class: "muted", style: { marginTop: "0.3rem" } }, "明朝の帰還を待ちます。"),
      ));
    }
    wrap.appendChild(panel("派遣中の冒険者", awayBody, "✦"));
  }

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
