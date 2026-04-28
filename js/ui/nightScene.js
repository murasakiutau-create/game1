// Night: research, save/export, advance to next day.

import { h, clear, btn, panel, toast } from "./components.js";
import { state } from "../state.js";
import { lockedRecipes, invest, PER_DAY_LIMIT } from "../systems/research.js";
import { MATERIALS } from "../data/materials.js";
import { renderSaveSlots, renderSaveCodeExport } from "./saveSlotsUI.js";

export function renderNightScene(host, { onAdvance, refresh }) {
  clear(host);
  const wrap = h("section", { class: "stack" });

  wrap.appendChild(panel("夜　— 研究と翌日への支度",
    h("p", { class: "muted" }, "金貨を投じて新しいレシピを解読、必要なら記録をエクスポート。")
  ));

  // Research
  const rsBody = h("div", { class: "stack" });
  const locked = lockedRecipes();
  rsBody.appendChild(h("p", { class: "muted" },
    `本日の研究投資：${state.researchedToday} / ${PER_DAY_LIMIT} G`
  ));
  if (locked.length === 0) {
    rsBody.appendChild(h("p", null, "全レシピ解禁済みです。"));
  } else {
    const grid = h("div", { class: "card-grid" });
    for (const r of locked) {
      const pts = state.recipes[r.id]?.points || 0;
      grid.appendChild(h("div", { class: "parchment-card" },
        h("div", { class: "row between" },
          h("strong", null, r.name),
          h("span", { class: "tag" }, "Tier " + r.tier),
        ),
        h("div", { class: "muted" },
          h("ul", null, ...r.inputs.map(i => h("li", null, `${MATERIALS[i.mat]?.name || i.mat} ×${i.n}`)))
        ),
        h("div", null, `進捗 ${pts}/${r.research}`),
        h("div", { class: "row" },
          btn("+50 G 投資", () => doInvest(r.id, 50, refresh), { small: true }),
          btn("+200 G 投資", () => doInvest(r.id, 200, refresh), { small: true }),
        ),
      ));
    }
    rsBody.appendChild(grid);
  }
  wrap.appendChild(panel("レシピ研究", rsBody, "✦"));

  // Save slots
  wrap.appendChild(panel("記録の保存（3スロット）", renderSaveSlots(refresh), "❦"));

  // Export code (advanced — for cross-device transfer)
  wrap.appendChild(panel("コードでエクスポート（端末間引継ぎ用）", renderSaveCodeExport(), "❖"));

  // Advance
  wrap.appendChild(panel("",
    h("div", { class: "stack" },
      h("p", { class: "muted" }, "翌日へ進むと給与が支払われ、市場が更新されます。"),
      btn("翌日（朝）へ", () => onAdvance(), { primary: true, block: true, sfx: "primary" }),
    ), "❦"));

  host.appendChild(wrap);
}

function doInvest(rid, n, refresh) {
  const res = invest(rid, n);
  if (!res.ok) { toast(res.reason, { error: true }); return; }
  if (res.unlocked) toast("新たなレシピを解読しました!");
  else toast(`研究 +${n} G。進捗 ${res.points}/${res.needed}`);
  refresh();
}
