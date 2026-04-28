import { ELEMENTS, ELEMENT_GLYPH, ELEMENT_LABEL, type Element } from '../data/elements';
import { MATERIALS, MATERIAL_IDS, type MaterialId } from '../data/materials';
import { SKILLS } from '../data/skills';
import { craft } from '../game/crafting';
import type { AppContext } from './app';
import { button, clear, el, flashMessage, panel } from './components';

interface WorkshopUiState {
  selA: MaterialId | null;
  selB: MaterialId | null;
  element: Element | null;
  log: string[];
}

const ui: WorkshopUiState = { selA: null, selB: null, element: null, log: [] };

export function renderWorkshop(ctx: AppContext): void {
  clear(ctx.root);
  const p = ctx.player!;
  const main = el('div', { className: 'screen screen-workshop' });

  main.appendChild(el('div', { className: 'breadcrumb' }, [
    button('← 拠点に戻る', () => ctx.goto({ kind: 'town' })),
    el('h1', { text: '🧪 調合', className: 'screen-title' }),
  ]));

  // 選択スロット
  const slotsBox = el('div', { className: 'craft-slots' }, [
    matSlot('素材A', ui.selA, () => { ui.selA = null; renderWorkshop(ctx); }),
    el('div', { text: '＋', className: 'craft-plus' }),
    matSlot('素材B', ui.selB, () => { ui.selB = null; renderWorkshop(ctx); }),
    el('div', { text: '＋', className: 'craft-plus' }),
    elementSlot(ui.element, () => { ui.element = null; renderWorkshop(ctx); }),
  ]);
  main.appendChild(panel('調合スロット', slotsBox));

  // 実行ボタン
  const canCraft = ui.selA && ui.selB && ui.element;
  const execRow = el('div', { className: 'row' }, [
    button('🧪 調合する', async () => {
      if (!canCraft) return;
      const r = craft(p, ui.selA!, ui.selB!, ui.element!);
      if ('error' in r) {
        flashMessage(main, r.error, 'err');
        return;
      }
      handleResult(ctx, main, r);
      ui.selA = null; ui.selB = null; ui.element = null;
      await ctx.saveCurrent();
      renderWorkshop(ctx);
    }, { disabled: !canCraft, className: 'btn-primary big' }),
  ]);
  main.appendChild(execRow);

  // 素材リスト
  const matsBox = el('div', { className: 'mat-grid' });
  for (const id of MATERIAL_IDS) {
    const qty = p.materials[id] ?? 0;
    const m = MATERIALS[id];
    const card = el('button', {
      className: 'mat-card' + (qty <= 0 ? ' disabled' : ''),
      onClick: () => {
        if (qty <= 0) return;
        if (ui.selA === null) ui.selA = id;
        else if (ui.selB === null) ui.selB = id;
        else ui.selA = id;
        renderWorkshop(ctx);
      },
    });
    card.appendChild(el('div', { className: 'mat-glyph', text: m.glyph }));
    card.appendChild(el('div', { className: 'mat-name', text: m.name }));
    card.appendChild(el('div', { className: 'mat-qty', text: `× ${qty}` }));
    card.appendChild(el('div', { className: 'mat-tags', text: m.tags.join(', ') }));
    matsBox.appendChild(card);
  }
  main.appendChild(panel('素材を選ぶ（タップで上から順にセット）', matsBox));

  // 属性選択
  const elBox = el('div', { className: 'el-row' });
  for (const e of ELEMENTS) {
    elBox.appendChild(button(`${ELEMENT_GLYPH[e]} ${ELEMENT_LABEL[e]}`, () => {
      ui.element = e;
      renderWorkshop(ctx);
    }, { className: ui.element === e ? 'btn-primary' : '' }));
  }
  main.appendChild(panel('属性を選ぶ', elBox));

  // 既知レシピ図鑑
  const learned = el('div', { className: 'recipe-list' });
  if (p.knownRecipes.length === 0) {
    learned.appendChild(el('p', { text: 'まだレシピを発見していない。試行錯誤しよう。', className: 'muted' }));
  } else {
    for (const skillId of p.knownRecipes) {
      const s = SKILLS[skillId];
      learned.appendChild(el('div', { className: 'recipe-row', text: `${s.glyph} ${s.name} — ${s.description}` }));
    }
  }
  main.appendChild(panel('発見したレシピ', learned));

  // 直近ログ
  if (ui.log.length > 0) {
    const logBox = el('div', { className: 'craft-log' });
    for (const l of ui.log.slice(-6)) logBox.appendChild(el('div', { text: l }));
    main.appendChild(panel('調合ログ', logBox));
  }

  ctx.root.appendChild(main);
}

function matSlot(label: string, id: MaterialId | null, onClear: () => void): HTMLElement {
  const box = el('div', { className: 'craft-slot' });
  box.appendChild(el('div', { className: 'craft-slot-label', text: label }));
  if (id) {
    const m = MATERIALS[id];
    box.appendChild(el('div', { className: 'craft-slot-glyph', text: m.glyph }));
    box.appendChild(el('div', { text: m.name }));
    box.appendChild(button('外す', onClear, { className: 'small' }));
  } else {
    box.appendChild(el('div', { className: 'craft-slot-empty', text: '〔未選択〕' }));
  }
  return box;
}

function elementSlot(e: Element | null, onClear: () => void): HTMLElement {
  const box = el('div', { className: 'craft-slot' });
  box.appendChild(el('div', { className: 'craft-slot-label', text: '属性' }));
  if (e) {
    box.appendChild(el('div', { className: 'craft-slot-glyph', text: ELEMENT_GLYPH[e] }));
    box.appendChild(el('div', { text: ELEMENT_LABEL[e] }));
    box.appendChild(button('外す', onClear, { className: 'small' }));
  } else {
    box.appendChild(el('div', { className: 'craft-slot-empty', text: '〔未選択〕' }));
  }
  return box;
}

function handleResult(_ctx: AppContext, main: HTMLElement, r: ReturnType<typeof craft> & object): void {
  if ('error' in r) return;
  const o = (r as Exclude<typeof r, { error: string }>).outcome;
  switch (o.kind) {
    case 'success_new': {
      const s = SKILLS[o.skillId];
      flashMessage(main, `🎉 新スキル『${s.name}』を発見！`, 'ok');
      ui.log.push(`発見: ${s.name}`);
      break;
    }
    case 'success_known': {
      const s = SKILLS[o.skillId];
      flashMessage(main, `${s.name}を再調合（既知）`, 'ok');
      ui.log.push(`既知: ${s.name}`);
      break;
    }
    case 'failure_gold': {
      flashMessage(main, `失敗→換金品 +${o.gold} gold`, 'warn');
      ui.log.push(`失敗→換金品 +${o.gold}g`);
      break;
    }
    case 'failure_stat': {
      const label = o.stat === 'maxHp' ? '最大HP' : o.stat === 'atk' ? '攻撃' : '防御';
      flashMessage(main, `失敗→謎の液体！${label}が永続的に+${o.amount}`, 'warn');
      ui.log.push(`永久強化: ${label}+${o.amount}`);
      break;
    }
    case 'failure_mutation': {
      const s = SKILLS[o.skillId];
      flashMessage(main, `❗ 突然変異！『${s.name}』を獲得！`, 'ok');
      ui.log.push(`【突然変異】${s.name}`);
      break;
    }
  }
}
