import { createInitialPlayer, type PlayerState } from '../game/state';
import {
  importString,
  importToSlot,
  loadFromSlot,
  readSlotMeta,
  saveToSlot,
  type SaveSlot,
  type SlotIndex,
} from '../game/save';
import type { AppContext } from './app';
import { button, clear, el, flashMessage, panel } from './components';

export async function renderTitle(ctx: AppContext): Promise<void> {
  clear(ctx.root);

  const main = el('div', { className: 'screen screen-title' });

  main.appendChild(
    el('div', { className: 'hero' }, [
      el('h1', { text: 'ミステリアス・スペシメン', className: 'title-main' }),
      el('p', { text: '〜 廃都の調合師 〜', className: 'title-sub' }),
      el('pre', {
        className: 'title-art',
        text: `
        ╭───────────╮
        │  🜲  🝳  🜍  │
        │   調合の釜    │
        ╰───────────╯`,
      }),
    ]),
  );

  const slotPanel = el('div', { className: 'slots' });
  for (let i = 1 as SlotIndex; i <= 3; i = (i + 1) as SlotIndex) {
    slotPanel.appendChild(renderSlotCard(ctx, i));
  }
  main.appendChild(panel('セーブスロット', slotPanel));

  const importPanel = el('div', { className: 'import-panel' }, [
    el('p', { text: 'エクスポート文字列を貼り付けてインポート：' }),
    (() => {
      const ta = el('textarea', { className: 'export-area', attrs: { rows: '4', placeholder: 'GAME1-...' } });
      const targetSel = el('select') as HTMLSelectElement;
      for (let i = 1; i <= 3; i++) {
        const o = el('option', { text: `スロット${i}に保存`, attrs: { value: String(i) } });
        targetSel.appendChild(o);
      }
      const btn = button('インポート実行', async () => {
        const target = parseInt(targetSel.value, 10) as SlotIndex;
        const r = await importToSlot(target, ta.value);
        if (r.ok) {
          flashMessage(main, `スロット${target}にインポート成功`, 'ok');
          await renderTitle(ctx);
        } else {
          flashMessage(main, `インポート失敗: ${r.reason}`, 'err');
        }
      }, { className: 'btn-primary' });
      const verifyBtn = button('検証のみ', async () => {
        const r = await importString(ta.value);
        if (r.ok) {
          flashMessage(main, '署名OK：このセーブは有効です', 'ok');
        } else {
          flashMessage(main, `検証失敗: ${r.reason}`, 'err');
        }
      });
      return el('div', {}, [ta, el('div', { className: 'row' }, [targetSel, btn, verifyBtn])]);
    })(),
  ]);
  main.appendChild(panel('インポート', importPanel));

  ctx.root.appendChild(main);
}

function renderSlotCard(ctx: AppContext, i: SlotIndex): HTMLElement {
  const meta = readSlotMeta(i);
  const card = el('div', { className: 'slot-card' });
  card.appendChild(el('h3', { text: `スロット ${i}`, className: 'slot-title' }));

  if (!meta) {
    card.appendChild(el('p', { text: '〔空き〕', className: 'slot-empty' }));
    card.appendChild(button('新規開始', async () => {
      const newPlayer = createInitialPlayer();
      await saveToSlot(i, newPlayer);
      ctx.startGame(newPlayer, i);
    }, { className: 'btn-primary' }));
    return card;
  }

  card.appendChild(slotSummaryDom(meta));

  const row = el('div', { className: 'row' });
  row.appendChild(button('続きから', async () => {
    const r = await loadFromSlot(i);
    if (!r.ok) {
      alert(`ロード失敗: ${r.reason}`);
      return;
    }
    ctx.startGame(r.player, i);
  }, { className: 'btn-primary' }));
  row.appendChild(button('上書きで新規', async () => {
    if (!confirm(`スロット${i}を新規データで上書きしますか？`)) return;
    const newPlayer = createInitialPlayer();
    await saveToSlot(i, newPlayer);
    ctx.startGame(newPlayer, i);
  }));
  row.appendChild(button('削除', () => {
    if (!confirm(`スロット${i}を削除しますか？`)) return;
    localStorage.removeItem(`game1:slot:${i}`);
    void renderTitle(ctx);
  }, { className: 'btn-danger' }));
  card.appendChild(row);

  return card;
}

function slotSummaryDom(slot: SaveSlot): HTMLElement {
  const s = slot.summary;
  return el('div', { className: 'slot-summary' }, [
    el('div', { text: `階層: ${s.floor} / 6  ${s.bossDefeated ? '👑' : ''}` }),
    el('div', { text: `gold: ${s.gold}` }),
    el('div', { text: `HP: ${s.hp} / ${s.maxHp}（装備込みは未計算）` }),
    el('div', { text: `レシピ: ${s.recipesKnown}　所有スキル: ${s.ownedSkills}` }),
    el('div', { text: `撃破: ${s.totalKills} 体　調合: ${s.totalCrafts} 回` }),
    el('div', { text: `保存: ${new Date(slot.savedAt).toLocaleString()}`, className: 'slot-meta' }),
  ]);
}
