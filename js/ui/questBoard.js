// Morning-scene panel + modal for the daily quest board. Lets the player
// browse 2-3 contracts, accept them, view active progress, and cancel if
// they want a slot back.

import { h, btn, modal, panel, confirmModal, toast } from "./components.js";
import { state } from "../state.js";
import { acceptQuest, cancelQuest } from "../systems/quests.js";
import { MONSTERS } from "../data/monsters.js";
import { MATERIALS, QUALITY_LABEL } from "../data/materials.js";
import { ITEMS, CATEGORY_LABELS } from "../data/recipes.js";

function describeSpec(q) {
  const s = q.spec || {};
  const cnt = s.count || 1;
  switch (q.kind) {
    case "deliver": {
      if (s.itemId) return `${ITEMS[s.itemId]?.name || s.itemId} ×${cnt}`;
      if (s.category) return `${CATEGORY_LABELS[s.category] || s.category} ×${cnt}`;
      return `アイテム ×${cnt}`;
    }
    case "specialty": {
      const item = ITEMS[s.itemId];
      const q = s.minQuality ? `（${QUALITY_LABEL[s.minQuality]}以上）` : "";
      return `${item?.name || s.itemId} ×${cnt}${q}`;
    }
    case "hunt": {
      const m = MONSTERS[s.mobId];
      return `${m?.name || s.mobId} ×${cnt}`;
    }
    case "gather": {
      const m = MATERIALS[s.matId];
      return `${m?.name || s.matId} ×${cnt}`;
    }
    default: return "—";
  }
}

function questCard(q, opts) {
  const { kind, isActive } = opts;
  const remain = isActive ? Math.max(0, q.deadline - state.day) : q.duration;
  const progress = isActive ? `${q.progress || 0} / ${q.spec.count || 1}` : `0 / ${q.spec.count || 1}`;
  const card = h("div", { class: "parchment-card" },
    h("div", { class: "row between" },
      h("strong", null, q.title),
      h("span", { class: "tag gold" }, `報酬 ${q.gold} G・名声+${q.rep}`),
    ),
    h("p", { class: "muted" }, q.desc),
    h("div", { class: "muted" },
      h("div", null, `内容：${describeSpec(q)}`),
      h("div", null, isActive ? `進捗 ${progress}　／　残り ${remain} 日` : `期限：${q.duration} 日以内`),
    ),
    opts.actions ? h("div", { class: "row", style: { marginTop: "0.5rem" } }, ...opts.actions) : null,
  );
  return card;
}

export function openQuestBoard(refresh) {
  const body = h("div", { class: "stack" });
  function rerender() {
    body.innerHTML = "";
    const active = state.quests?.active || [];
    const available = state.quests?.available || [];
    body.appendChild(h("p", { class: "muted" }, "受託すると進捗が自動で記録されます。期限切れは名声 -2。"));
    if (active.length > 0) {
      const sec = h("div", { class: "stack" });
      for (const q of active) {
        sec.appendChild(questCard(q, {
          isActive: true,
          actions: [
            btn("辞退", () => {
              confirmModal({
                title: "依頼の辞退",
                message: `「${q.title}」を辞退します。`,
                confirmLabel: "辞退する",
                danger: true,
                onConfirm: () => { cancelQuest(q.id); rerender(); refresh && refresh(); },
              });
            }, { ghost: true, small: true }),
          ],
        }));
      }
      body.appendChild(panel(`受託中（${active.length}件）`, sec, "✦"));
    }
    if (available.length > 0) {
      const sec = h("div", { class: "stack" });
      for (const q of available) {
        sec.appendChild(questCard(q, {
          isActive: false,
          actions: [
            btn("受託する", () => {
              acceptQuest(q.id);
              toast(`「${q.title}」を受託しました。`);
              rerender();
              refresh && refresh();
            }, { primary: true, small: true }),
          ],
        }));
      }
      body.appendChild(panel(`本日の依頼（${available.length}件）`, sec, "❦"));
    }
    if (active.length === 0 && available.length === 0) {
      body.appendChild(h("p", { class: "muted" }, "本日掲示中の依頼はありません。"));
    }
  }
  rerender();
  modal(body, { title: "依頼掲示板" });
}

export function renderQuestBoardSummary(refresh) {
  const active = state.quests?.active?.length || 0;
  const available = state.quests?.available?.length || 0;
  const body = h("div", { class: "stack" },
    h("p", { class: "muted" },
      active > 0
        ? `受託中 ${active} 件／本日新規 ${available} 件。`
        : `本日 ${available} 件の依頼が掲示されています。`),
    btn("依頼掲示板を開く", () => openQuestBoard(refresh), { primary: true, block: true }),
  );
  return panel("依頼掲示板", body, "❦");
}
