// Title screen: 新規 / 続きから (import code) / 配布物について

import { h, clear, btn, modal, toast } from "./components.js";
import { newGame } from "../state.js";
import { exportSave, importSave } from "../save.js";

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
          newGame();
          onStart();
        }, { primary: true }),
        btn("記録を読み込む", () => importDialog(onStart), { ghost: true }),
        btn("セーブをエクスポート", async () => {
          const code = await exportSave().catch(() => null);
          if (!code) { toast("記録の出力に失敗しました。", { error: true }); return; }
          showCode(code);
        }, { ghost: true, small: true }),
      ),
      h("div", { class: "credit" }, "フォント協力：Oradano明朝GSRRフォント（内田明氏）。再配布自由。"),
    )
  );
  host.appendChild(root);
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
