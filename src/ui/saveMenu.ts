import {
  exportSlot,
  importToSlot,
  loadFromSlot,
  readSlotMeta,
  saveToSlot,
  type SlotIndex,
} from '../game/save';
import type { AppContext } from './app';
import { button, clear, el, flashMessage, panel } from './components';

export async function renderSaveMenu(ctx: AppContext): Promise<void> {
  clear(ctx.root);
  const main = el('div', { className: 'screen screen-save' });

  main.appendChild(el('div', { className: 'breadcrumb' }, [
    button('← 拠点に戻る', () => ctx.goto({ kind: 'town' })),
    el('h1', { text: '💾 セーブメニュー', className: 'screen-title' }),
  ]));

  // 現在のスロットへ手動セーブ
  if (ctx.slot) {
    const row = el('div', { className: 'row' }, [
      el('div', { text: `現在のスロット: ${ctx.slot}` }),
      button('このスロットに上書きセーブ', async () => {
        await ctx.saveCurrent();
        flashMessage(main, `スロット${ctx.slot}にセーブしました`, 'ok');
        await renderSaveMenu(ctx);
      }, { className: 'btn-primary' }),
    ]);
    main.appendChild(panel('クイックセーブ', row));
  }

  // 各スロットへ任意セーブ／ロード／エクスポート
  for (let i = 1; i <= 3; i++) {
    main.appendChild(slotPanel(ctx, main, i as SlotIndex));
  }

  // インポート（プレイ中でも別スロットにインポート可）
  const importBox = el('div', {});
  const ta = el('textarea', { className: 'export-area', attrs: { rows: '4', placeholder: 'GAME1-...' } });
  const targetSel = el('select') as HTMLSelectElement;
  for (let i = 1; i <= 3; i++) targetSel.appendChild(el('option', { text: `スロット${i}に保存`, attrs: { value: String(i) } }));
  const importBtn = button('インポート', async () => {
    const target = parseInt(targetSel.value, 10) as SlotIndex;
    const r = await importToSlot(target, ta.value);
    if (r.ok) {
      flashMessage(main, `スロット${target}にインポートしました`, 'ok');
      await renderSaveMenu(ctx);
    } else {
      flashMessage(main, `失敗: ${r.reason}`, 'err');
    }
  }, { className: 'btn-primary' });
  importBox.appendChild(ta);
  importBox.appendChild(el('div', { className: 'row' }, [targetSel, importBtn]));
  main.appendChild(panel('インポート（コピペで取り込み）', importBox));

  ctx.root.appendChild(main);
}

function slotPanel(ctx: AppContext, main: HTMLElement, i: SlotIndex): HTMLElement {
  const meta = readSlotMeta(i);
  const inner = el('div', {});
  if (meta) {
    inner.appendChild(el('div', { className: 'slot-summary' }, [
      el('div', { text: `階層 ${meta.summary.floor} ・ gold ${meta.summary.gold} ・ HP ${meta.summary.hp}/${meta.summary.maxHp}` }),
      el('div', { text: `レシピ ${meta.summary.recipesKnown} ・ 撃破 ${meta.summary.totalKills}` }),
      el('div', { text: `保存 ${new Date(meta.savedAt).toLocaleString()}`, className: 'slot-meta' }),
    ]));
  } else {
    inner.appendChild(el('div', { text: '〔空き〕', className: 'slot-empty' }));
  }

  const row = el('div', { className: 'row' });
  row.appendChild(button('現在の状態をここにセーブ', async () => {
    if (!ctx.player) return;
    await saveToSlot(i, ctx.player);
    ctx.slot = i;
    flashMessage(main, `スロット${i}に保存しました`, 'ok');
    await renderSaveMenu(ctx);
  }, { className: 'btn-primary' }));

  if (meta) {
    row.appendChild(button('ロード', async () => {
      if (!confirm(`スロット${i}をロードしますか？（現在の進行状況は失われます）`)) return;
      const r = await loadFromSlot(i);
      if (!r.ok) {
        flashMessage(main, r.reason, 'err');
        return;
      }
      ctx.player = r.player;
      ctx.slot = i;
      flashMessage(main, `スロット${i}をロードしました`, 'ok');
      ctx.goto({ kind: 'town' });
    }));

    row.appendChild(button('エクスポート文字列を表示', async () => {
      const s = await exportSlot(i);
      if (!s) {
        flashMessage(main, '空のスロットです', 'warn');
        return;
      }
      showExport(main, i, s);
    }));

    row.appendChild(button('削除', () => {
      if (!confirm(`スロット${i}を削除しますか？`)) return;
      localStorage.removeItem(`game1:slot:${i}`);
      void renderSaveMenu(ctx);
    }, { className: 'btn-danger' }));
  }
  inner.appendChild(row);

  return panel(`スロット ${i}`, inner);
}

function showExport(main: HTMLElement, i: SlotIndex, text: string): void {
  const overlay = el('div', { className: 'modal-overlay' });
  const box = el('div', { className: 'modal' });
  box.appendChild(el('h3', { text: `スロット${i} のエクスポート文字列` }));
  box.appendChild(el('p', { text: '以下の文字列をコピーして安全な場所に保存してください。署名付きで改竄されたら拒否されます。' }));
  const ta = el('textarea', { attrs: { rows: '8', readonly: 'readonly' }, className: 'export-area' });
  ta.value = text;
  box.appendChild(ta);
  const row = el('div', { className: 'modal-buttons' });
  row.appendChild(button('クリップボードにコピー', async () => {
    try {
      await navigator.clipboard.writeText(text);
      flashMessage(main, 'コピーしました', 'ok');
    } catch {
      ta.select();
      document.execCommand('copy');
      flashMessage(main, 'コピー（フォールバック）', 'ok');
    }
  }, { className: 'btn-primary' }));
  row.appendChild(button('閉じる', () => document.body.removeChild(overlay)));
  box.appendChild(row);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}
