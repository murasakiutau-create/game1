// Shared save-slot UI: 3 slots + save-code export. Reused by the night
// scene and by the 記録 viewer's セーブ tab.

import { h, btn, modal, toast, confirmModal } from "./components.js";
import { listSlots, writeSlot, deleteSlot, formatSavedAt } from "../saveSlots.js";
import { exportSave } from "../save.js";

export function renderSaveSlots(refresh) {
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
  return h("div", { class: "parchment-card" },
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
              confirmSfx: "primary",
              onConfirm: async () => {
                await writeSlot(id);
                toast(`スロット ${id} に保存しました。`);
                refresh && refresh();
              }
            });
          } else {
            writeSlot(id).then(() => {
              toast(`スロット ${id} に保存しました。`);
              refresh && refresh();
            }).catch(() => toast("保存に失敗しました。", { error: true }));
          }
        },
        { primary: true, small: true, sfx: "primary" }),
      meta ? btn("削除", () => {
        confirmModal({
          title: `スロット ${id} を削除`,
          message: "この記録を削除します。元に戻せません。",
          confirmLabel: "削除する",
          danger: true,
          onConfirm: () => { deleteSlot(id); toast(`スロット ${id} を削除しました。`); refresh && refresh(); },
        });
      }, { ghost: true, small: true }) : null,
    ),
  );
}

export function renderSaveCodeExport() {
  return h("div", { class: "stack" },
    h("p", { class: "muted" },
      "他端末へ引き継ぐときは、この記録コードをコピーして持ち運んでください。改竄防止チェックサム付き。"),
    h("div", { class: "row" },
      btn("セーブコードを表示", async () => {
        const code = await exportSave().catch(() => null);
        if (!code) { toast("出力に失敗しました。", { error: true }); return; }
        showSaveCodeModal(code);
      }, { dark: true }),
    ),
  );
}

function showSaveCodeModal(code) {
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
