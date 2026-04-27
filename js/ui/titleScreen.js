// Title screen: 新規 / スロット読込 / コード読込 / 配布物について

import { h, clear, btn, modal, toast, confirmModal } from "./components.js";
import { newGame } from "../state.js";
import { exportSave, importSave } from "../save.js";
import { listSlots, loadSlot, deleteSlot, formatSavedAt } from "../saveSlots.js";

export function renderTitleScene(host, { onStart }) {
  clear(host);
  const root = h("div", { class: "title-screen" },
    h("section", { class: "panel title-card" },
      h("div", { class: "ornament-rule" }, "❦  ⚜  ❦"),
      h("h1", null, "錬金堂"),
      h("div", { class: "sub" }, "月影と硝子の調合室"),
      h("div", { class: "ornament-rule" }, "─── ✦ ───"),
      h("p", { class: "muted" }, "錬金術師として店を営む。冒険者を派遣し、素材を集め、調合し、客を待つ。"),
      h("div", { class: "actions" },
        btn("新しく始める", () => {
          confirmIfSlotsExist(() => { newGame(); onStart(); });
        }, { primary: true }),
        btn("セーブから続ける", () => openSlotsDialog(onStart), { ghost: true }),
        btn("コードから読み込む", () => importDialog(onStart), { ghost: true, small: true }),
      ),
      h("div", { class: "credit" }, "フォント混植：Oradano明朝GSRR（仮名／内田明氏）＋ 源界明朝 Genkai Mincho（漢字／SIL OFL 1.1）"),
    )
  );
  host.appendChild(root);
}

function confirmIfSlotsExist(go) {
  const slots = listSlots().filter(s => s.data);
  if (slots.length === 0) { go(); return; }
  confirmModal({
    title: "新しく始める",
    message: `セーブスロット ${slots.length} 件は残ったまま、新規ゲームを開始します。よろしいですか？`,
    confirmLabel: "開始する",
    onConfirm: go,
  });
}

function openSlotsDialog(onStart) {
  const body = h("div", { class: "stack" });
  function rerender() {
    body.innerHTML = "";
    body.appendChild(h("p", { class: "muted" }, "このブラウザに保存された記録から続けます。"));
    const grid = h("div", { class: "card-grid" });
    for (const { id, data } of listSlots()) {
      const meta = data?.meta;
      grid.appendChild(h("div", { class: "parchment-card" + (meta ? "" : " disabled") },
        h("div", { class: "row between" },
          h("strong", null, `スロット ${id}`),
          meta ? h("span", { class: "tag gold" }, `第${meta.day}日　${meta.gold} G`) : h("span", { class: "tag" }, "空き"),
        ),
        meta ? h("div", { class: "muted" },
          h("div", null, `評判：${meta.repLabel || "—"}`),
          h("div", null, `保存：${formatSavedAt(meta.savedAt)}`),
          h("div", null, `仲間：${(meta.partyNames || []).join("、") || "—"}`),
        ) : h("div", { class: "muted" }, "未使用"),
        h("div", { class: "row", style: { marginTop: "0.5rem" } },
          btn(meta ? "ここから続ける" : "未使用",
            async () => {
              if (!meta) return;
              try {
                await loadSlot(id);
                toast(`スロット ${id} を読み込みました。`);
                m.close();
                onStart();
              } catch (e) {
                toast(e.message || "読込に失敗しました。", { error: true, ms: 3500 });
              }
            },
            { primary: !!meta, disabled: !meta, small: true }),
          meta ? btn("削除", () => {
            confirmModal({
              title: `スロット ${id} を削除`,
              message: "この記録を削除します。元に戻せません。",
              confirmLabel: "削除する",
              danger: true,
              onConfirm: () => { deleteSlot(id); toast(`スロット ${id} を削除しました。`); rerender(); },
            });
          }, { ghost: true, small: true }) : null,
        ),
      ));
    }
    body.appendChild(grid);
  }
  rerender();
  const m = modal(body, { title: "セーブから続ける" });
}

function importDialog(onStart) {
  const ta = h("textarea", { rows: 8, placeholder: "ここに記録コードを貼り付け…" });
  const ok = btn("読み込む", async () => {
    try {
      await importSave(ta.value);
      toast("記録を読み込みました。", {});
      m.close();
      onStart();
    } catch (e) {
      toast(e.message || "読込に失敗しました。", { error: true, ms: 3500 });
    }
  }, { primary: true });
  const m = modal(
    h("div", null,
      h("p", null, "他端末などで保存した記録コードを貼り付けると、続きから始められます。"),
      ta,
      h("p", { class: "muted" }, "改竄されたコードは弾かれます。")
    ),
    { title: "記録を読み込む", foot: [ok] }
  );
}

function showCode(code) {
  const ta = h("textarea", { rows: 8, readonly: true });
  ta.value = code;
  modal(
    h("div", null,
      h("p", null, "下のテキストをコピーして保管してください。次回はこのコードを貼り付ければ続きから始められます。"),
      ta,
    ),
    { title: "セーブコード", foot: [btn("コピー", () => { ta.select(); document.execCommand && document.execCommand("copy"); toast("コピーしました。"); }, { primary: true })] }
  );
  setTimeout(() => { ta.select(); }, 80);
}
