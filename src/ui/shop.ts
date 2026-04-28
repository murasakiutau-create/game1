import { EQUIPMENTS, type EquipmentId } from '../data/equipment';
import { MATERIALS, MATERIAL_IDS, type MaterialId } from '../data/materials';
import { ELEMENT_LABEL } from '../data/elements';
import { buyEquipment, sellMaterials, shopInventory } from '../game/shop';
import type { AppContext } from './app';
import { button, clear, el, flashMessage, panel } from './components';

export function renderShop(ctx: AppContext): void {
  clear(ctx.root);
  const p = ctx.player!;
  const main = el('div', { className: 'screen screen-shop' });

  main.appendChild(el('div', { className: 'breadcrumb' }, [
    button('← 拠点に戻る', () => ctx.goto({ kind: 'town' })),
    el('h1', { text: '🛒 ショップ「夜霧の露店」', className: 'screen-title' }),
    el('div', { text: `💰 ${p.gold} gold`, className: 'gold-badge' }),
  ]));

  // 装備一覧
  const list = el('div', { className: 'eq-list' });
  const stock = shopInventory(p);
  if (stock.length === 0) {
    list.appendChild(el('p', { text: '今は売る装備がない。' }));
  }
  for (const id of stock) {
    list.appendChild(equipmentCard(ctx, main, id));
  }
  main.appendChild(panel('装備', list));

  // 既購入
  if (p.ownedEquipment.length > 0) {
    const owned = el('div', { className: 'eq-list' });
    for (const id of p.ownedEquipment) {
      const eq = EQUIPMENTS[id];
      owned.appendChild(el('div', { className: 'eq-card owned', text: `${eq.glyph} ${eq.name}（所持）` }));
    }
    main.appendChild(panel('所持装備', owned));
  }

  // 換金まとめ売り
  main.appendChild(panel('素材まとめ売り', sellAllUI(ctx, main)));

  ctx.root.appendChild(main);
}

function equipmentCard(ctx: AppContext, main: HTMLElement, id: EquipmentId): HTMLElement {
  const eq = EQUIPMENTS[id];
  const p = ctx.player!;
  const card = el('div', { className: 'eq-card' });
  card.appendChild(el('div', { className: 'eq-name', text: `${eq.glyph} ${eq.name}` }));
  card.appendChild(el('div', { className: 'eq-slot', text: slotLabel(eq.slot) }));
  card.appendChild(el('div', { className: 'eq-stats', text: statsLine(eq.stats) }));
  card.appendChild(el('div', { className: 'eq-desc', text: eq.description }));
  card.appendChild(el('div', { className: 'eq-price', text: `${eq.price} gold` }));
  const buy = button('購入', async () => {
    const r = buyEquipment(p, id);
    if (r.ok) {
      flashMessage(main, `『${eq.name}』を購入！`, 'ok');
      await ctx.saveCurrent();
      renderShop(ctx);
    } else {
      flashMessage(main, r.reason, 'err');
    }
  }, { className: 'btn-primary', disabled: p.gold < eq.price });
  card.appendChild(buy);
  return card;
}

function slotLabel(slot: 'weapon' | 'armor' | 'accessory'): string {
  return slot === 'weapon' ? '武器' : slot === 'armor' ? '防具' : '装飾';
}

function statsLine(stats: { atk?: number; def?: number; maxHp?: number; element?: string; elementBonus?: number }): string {
  const parts: string[] = [];
  if (stats.atk) parts.push(`ATK+${stats.atk}`);
  if (stats.def) parts.push(`DEF+${stats.def}`);
  if (stats.maxHp) parts.push(`HP+${stats.maxHp}`);
  if (stats.element && stats.elementBonus) {
    const elName = ELEMENT_LABEL[stats.element as keyof typeof ELEMENT_LABEL];
    parts.push(`${elName}属性+${Math.round(stats.elementBonus * 100)}%`);
  }
  return parts.join(' / ');
}

function sellAllUI(ctx: AppContext, main: HTMLElement): HTMLElement {
  const p = ctx.player!;
  const grid = el('div', { className: 'sell-grid' });
  const inputs: { id: MaterialId; input: HTMLInputElement }[] = [];

  let estimatedTotal = 0;

  function recompute() {
    estimatedTotal = 0;
    for (const { id, input } of inputs) {
      const v = parseInt(input.value, 10) || 0;
      estimatedTotal += MATERIALS[id].sellPrice * Math.min(v, p.materials[id] ?? 0);
    }
    totalLabel.textContent = `合計: ${estimatedTotal} gold`;
  }

  for (const id of MATERIAL_IDS) {
    const have = p.materials[id] ?? 0;
    if (have <= 0) continue;
    const m = MATERIALS[id];
    const row = el('div', { className: 'sell-row' });
    row.appendChild(el('div', { text: `${m.glyph} ${m.name}（× ${have} ・ ${m.sellPrice}g/個）` }));
    const input = el('input', {
      attrs: { type: 'number', min: '0', max: String(have), value: '0', step: '1' },
    }) as HTMLInputElement;
    input.addEventListener('input', recompute);
    inputs.push({ id, input });
    const allBtn = button('全部', () => { input.value = String(have); recompute(); }, { className: 'small' });
    row.appendChild(input);
    row.appendChild(allBtn);
    grid.appendChild(row);
  }

  if (inputs.length === 0) {
    grid.appendChild(el('p', { text: '売れる素材がない。' }));
  }

  const totalLabel = el('div', { className: 'sell-total', text: '合計: 0 gold' });

  const sellBtn = button('まとめて売却', async () => {
    const amounts: Partial<Record<MaterialId, number>> = {};
    for (const { id, input } of inputs) {
      const v = parseInt(input.value, 10) || 0;
      if (v > 0) amounts[id] = v;
    }
    const got = sellMaterials(ctx.player!, amounts);
    if (got > 0) {
      flashMessage(main, `${got} gold 入手`, 'ok');
      await ctx.saveCurrent();
      renderShop(ctx);
    } else {
      flashMessage(main, '売却数を指定してください', 'warn');
    }
  }, { className: 'btn-primary' });

  return el('div', {}, [grid, totalLabel, sellBtn]);
}
