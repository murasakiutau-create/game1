// Night: research, save/export, advance to next day.

import { h, clear, btn, panel, modal, toast, confirmModal } from "./components.js";
import { state } from "../state.js";
import { lockedRecipes, invest, PER_DAY_LIMIT } from "../systems/research.js";
import { exportSave } from "../save.js";
import { listSlots, writeSlot, deleteSlot, formatSavedAt, SLOT_IDS } from "../saveSlots.js";
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

  // Save slots
  wrap.appendChild(panel("記録の保存（3スロット）", renderSlotPicker(refresh), "❦"));

  // Export code (advanced — for cross-device transfer)
  wrap.appendChild(panel("コードでエクスポート（端末間引継ぎ用）", h("div", { class: "stack" },
    h("p", { class: "muted" }, "他端末へ引き継ぐときは、この記録コードをコピーして持ち運んでください。改竄防止チェックサム付き。"),
    h("div", { class: "row" },
      btn("セーブコードを表示", async () => {
        const code = await exportSave().catch(() => null);
        if (!code) { toast("出力に失敗しました。", { error: true }); return; }
        showSaveModal(code);
      }, { dark: true }),
    ),
  ), "❖"));

  // Advance
  wrap.appendChild(panel("",
    h("div", { class: "stack" },
      h("p", { class: "muted" }, "翌日へ進むと給与が支払われ、市場が更新されます。"),
      btn("翌日（朝）へ", () => onAdvance(), { primary: true, block: true }),
    ), "❦"));

  host.appendChild(wrap);
}

function renderSlotPicker(refresh) {
  const wrap = h("div", { class: "stack" });
  wrap.appendChild(h("p", { class: "muted" },
    "「セーブする」を押すと、このブラウザのローカルストレージに記録されます。3つのスロットに使い分け可能。"));
  const grid = h("div", { class: "card-grid" });
  for (const { id, data } of listSlots()) {
    grid.appendChild(renderSlotCard(id, data, refresh));
  }
  wrap.appendChild(grid);
  return wrap;
}

function renderSlotCard(id, data, refresh) {
  const meta = data?.meta;
  const card = h("div", { class: "parchment-card" },
    h("div", { class: "row between" },
      h("strong", null, `スロット ${id}`),
      meta ? h("span", { class: "tag gold" }, `第${meta.day}日　${meta.gold} G`)
           : h("span", { class: "tag" }, "空き"),
    ),
    meta ? h("div", { class: "muted" },
      h("div", null, `評判：${meta.repLabel || "—"}`),
      h("div", null, `保存：${formatSavedAt(meta.savedAt)}`),
      h("div", null, `仲間：${(meta.partyNames || []).join("、") || "—"}`),
    ) : h("div", { class: "muted" }, "未使用"),
    h("div", { class: "row", style: { marginTop: "0.5rem", flexWrap: "wrap" } },
      btn(meta ? "上書きセーブ" : "セーブする",
        () => {
          if (meta) {
            confirmModal({
              title: `スロット ${id} を上書き`,
              message: `第${meta.day}日（${formatSavedAt(meta.savedAt)}）の記録を上書きします。よろしいですか？`,
              confirmLabel: "上書きする",
              onConfirm: async () => {
                await writeSlot(id);
                toast(`スロット ${id} に保存しました。`);
                refresh();
              }
            });
          } else {
            writeSlot(id).then(() => {
              toast(`スロット ${id} に保存しました。`);
              refresh();
            }).catch(() => toast("保存に失敗しました。", { error: true }));
          }
        },
        { primary: true, small: true }),
      meta ? btn("削除", () => {
        confirmModal({
          title: `スロット ${id} を削除`,
          message: "この記録を削除します。元に戻せません。",
          confirmLabel: "削除する",
          danger: true,
          onConfirm: () => { deleteSlot(id); toast(`スロット ${id} を削除しました。`); refresh(); },
        });
      }, { ghost: true, small: true }) : null,
    ),
  );
  return card;
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
