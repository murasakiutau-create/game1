// Night: research, save/export, advance to next day.

import { h, clear, btn, panel, modal, toast } from "./components.js";
import { state } from "../state.js";
import { lockedRecipes, invest, PER_DAY_LIMIT } from "../systems/research.js";
import { exportSave } from "../save.js";
import { MATERIALS } from "../data/materials.js";

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

  // Save
  wrap.appendChild(panel("記録の保存", h("div", { class: "stack" },
    h("p", { class: "muted" }, "ボタンを押すとセーブコードが表示されます。改竄防止チェックサム付き。"),
    h("div", { class: "row" },
      btn("セーブコードを表示", async () => {
        const code = await exportSave().catch(() => null);
        if (!code) { toast("出力に失敗しました。", { error: true }); return; }
        showSaveModal(code);
      }, { primary: true }),
    ),
  ), "❦"));

  // Advance
  wrap.appendChild(panel("",
    h("div", { class: "stack" },
      h("p", { class: "muted" }, "翌日へ進むと給与が支払われ、市場が更新されます。"),
      btn("翌日（朝）へ", () => onAdvance(), { primary: true, block: true }),
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

function showSaveModal(code) {
  const ta = h("textarea", { rows: 8, readonly: true });
  ta.value = code;
  modal(
    h("div", null,
      h("p", null, "下のテキストをコピーして安全な場所に保管してください。次回はタイトル画面の「記録を読み込む」で復元できます。"),
      ta,
    ),
    { title: "セーブコード", foot: [
      btn("クリップボードへコピー", () => { ta.select(); document.execCommand && document.execCommand("copy"); toast("コピーしました。"); }, { primary: true }),
    ]}
  );
  setTimeout(() => { ta.select(); }, 80);
}
