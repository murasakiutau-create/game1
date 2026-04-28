import { MATERIALS, MATERIAL_IDS } from '../data/materials';
import { SKILLS } from '../data/skills';
import { EQUIPMENTS } from '../data/equipment';
import type { AppContext } from './app';
import { button, clear, el, panel } from './components';

export function renderInventory(ctx: AppContext): void {
  clear(ctx.root);
  const p = ctx.player!;
  const main = el('div', { className: 'screen screen-inventory' });

  main.appendChild(el('div', { className: 'breadcrumb' }, [
    button('← 拠点に戻る', () => ctx.goto({ kind: 'town' })),
    el('h1', { text: '🎒 持ち物', className: 'screen-title' }),
  ]));

  // 素材
  const matsBox = el('div', { className: 'mat-grid' });
  let any = false;
  for (const id of MATERIAL_IDS) {
    const qty = p.materials[id] ?? 0;
    if (qty <= 0) continue;
    any = true;
    const m = MATERIALS[id];
    const card = el('div', { className: 'mat-card readonly' });
    card.appendChild(el('div', { className: 'mat-glyph', text: m.glyph }));
    card.appendChild(el('div', { className: 'mat-name', text: m.name }));
    card.appendChild(el('div', { className: 'mat-qty', text: `× ${qty}` }));
    card.appendChild(el('div', { className: 'mat-tags', text: m.tags.join(', ') }));
    card.appendChild(el('div', { className: 'mat-desc', text: m.description }));
    matsBox.appendChild(card);
  }
  if (!any) matsBox.appendChild(el('p', { text: '素材を持っていない。', className: 'muted' }));
  main.appendChild(panel('素材', matsBox));

  // スキル
  const skillsBox = el('div', { className: 'skill-pool' });
  if (p.ownedSkills.length === 0) {
    skillsBox.appendChild(el('p', { text: 'スキル未所持' }));
  } else {
    for (const sid of p.ownedSkills) {
      const s = SKILLS[sid];
      const card = el('div', { className: 'skill-card readonly' });
      card.appendChild(el('div', { text: `${s.glyph} ${s.name}`, className: 'skill-name' }));
      card.appendChild(el('div', { text: s.description, className: 'skill-desc' }));
      skillsBox.appendChild(card);
    }
  }
  main.appendChild(panel('所有スキル', skillsBox));

  // 装備
  const eqBox = el('div', { className: 'eq-list' });
  if (p.ownedEquipment.length === 0) {
    eqBox.appendChild(el('p', { text: '装備未所持' }));
  } else {
    for (const id of p.ownedEquipment) {
      const eq = EQUIPMENTS[id];
      const card = el('div', { className: 'eq-card' });
      card.appendChild(el('div', { className: 'eq-name', text: `${eq.glyph} ${eq.name}` }));
      card.appendChild(el('div', { className: 'eq-desc', text: eq.description }));
      eqBox.appendChild(card);
    }
  }
  main.appendChild(panel('所有装備', eqBox));

  // 永久強化
  main.appendChild(panel('永久ボーナス（調合失敗の蓄積）', el('div', {}, [
    el('div', { text: `ATK +${p.permanentBonuses.atk}` }),
    el('div', { text: `DEF +${p.permanentBonuses.def}` }),
    el('div', { text: `MaxHP +${p.permanentBonuses.maxHp}` }),
  ])));

  ctx.root.appendChild(main);
}
