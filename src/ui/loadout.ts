import { EQUIPMENTS, type EquipmentId, type EquipSlot } from '../data/equipment';
import { ELEMENT_LABEL } from '../data/elements';
import { SKILLS, type SkillId } from '../data/skills';
import { equipItem, unequipSlot } from '../game/shop';
import { effectiveStats } from '../game/state';
import type { AppContext } from './app';
import { button, clear, el, flashMessage, panel } from './components';

export function renderLoadout(ctx: AppContext): void {
  clear(ctx.root);
  const p = ctx.player!;
  const main = el('div', { className: 'screen screen-loadout' });

  main.appendChild(el('div', { className: 'breadcrumb' }, [
    button('← 拠点に戻る', () => ctx.goto({ kind: 'town' })),
    el('h1', { text: '⚔ ロードアウト', className: 'screen-title' }),
  ]));

  const eff = effectiveStats(p);
  main.appendChild(el('div', { className: 'status-bar' }, [
    el('div', { text: `❤ HP ${p.hp}/${eff.maxHp}` }),
    el('div', { text: `⚔ ATK ${eff.atk}` }),
    el('div', { text: `🛡 DEF ${eff.def}` }),
  ]));

  // ── スキルロードアウト ─────
  const skillSlotsBox = el('div', { className: 'skill-slots' });
  for (let i = 0; i < 5; i++) {
    skillSlotsBox.appendChild(skillSlotCell(ctx, main, i));
  }
  main.appendChild(panel('スキル装備（5枠）', skillSlotsBox));

  // 所有スキル一覧（装備していないものをタップで装備）
  const ownedBox = el('div', { className: 'skill-pool' });
  for (const sid of p.ownedSkills) {
    const s = SKILLS[sid];
    const equipped = p.equippedSkills.includes(sid);
    const card = el('button', { className: 'skill-card' + (equipped ? ' equipped' : '') });
    card.appendChild(el('div', { text: `${s.glyph} ${s.name}`, className: 'skill-name' }));
    card.appendChild(el('div', { text: skillStatLine(s), className: 'skill-stat' }));
    card.appendChild(el('div', { text: s.description, className: 'skill-desc' }));
    card.addEventListener('click', () => {
      if (equipped) {
        // 外す
        const idx = p.equippedSkills.indexOf(sid);
        if (idx >= 0) p.equippedSkills[idx] = null;
      } else {
        // 空きに入れる
        const empty = p.equippedSkills.findIndex((x) => x === null);
        if (empty >= 0) p.equippedSkills[empty] = sid;
        else flashMessage(main, '装備枠がいっぱい。先に外してください', 'warn');
      }
      renderLoadout(ctx);
    });
    ownedBox.appendChild(card);
  }
  main.appendChild(panel('所有スキル', ownedBox));

  // ── 装備（武器・防具・装飾） ─────
  const gearBox = el('div', { className: 'gear-grid' });
  for (const slot of ['weapon', 'armor', 'accessory'] as EquipSlot[]) {
    gearBox.appendChild(gearSlotCell(ctx, main, slot));
  }
  main.appendChild(panel('装備（武器・防具・装飾）', gearBox));

  ctx.root.appendChild(main);
}

function skillSlotCell(ctx: AppContext, main: HTMLElement, idx: number): HTMLElement {
  const p = ctx.player!;
  const sid = p.equippedSkills[idx];
  const cell = el('div', { className: 'skill-slot' });
  cell.appendChild(el('div', { text: `Slot ${idx + 1}`, className: 'skill-slot-label' }));
  if (sid) {
    const s = SKILLS[sid];
    cell.appendChild(el('div', { text: `${s.glyph} ${s.name}`, className: 'skill-slot-name' }));
    cell.appendChild(el('div', { text: skillStatLine(s), className: 'skill-stat' }));
    cell.appendChild(button('外す', () => {
      p.equippedSkills[idx] = null;
      renderLoadout(ctx);
    }, { className: 'small' }));
  } else {
    cell.appendChild(el('div', { text: '〔空〕', className: 'skill-slot-empty' }));
  }
  return cell;
}

function gearSlotCell(ctx: AppContext, main: HTMLElement, slot: EquipSlot): HTMLElement {
  const p = ctx.player!;
  const equippedId = p.equippedGear[slot];
  const cell = el('div', { className: 'gear-slot' });
  cell.appendChild(el('div', { text: slotLabel(slot), className: 'gear-slot-label' }));
  if (equippedId) {
    const eq = EQUIPMENTS[equippedId];
    cell.appendChild(el('div', { text: `${eq.glyph} ${eq.name}`, className: 'gear-slot-name' }));
    cell.appendChild(el('div', { text: gearStatLine(eq.stats), className: 'gear-stat' }));
    cell.appendChild(button('外す', () => {
      unequipSlot(p, slot);
      renderLoadout(ctx);
    }, { className: 'small' }));
  } else {
    cell.appendChild(el('div', { text: '〔素手／無防備〕', className: 'gear-slot-empty' }));
  }
  // 候補
  const cands = p.ownedEquipment
    .map((id) => EQUIPMENTS[id])
    .filter((e) => e.slot === slot && p.equippedGear[slot] !== e.id);
  if (cands.length === 0) {
    cell.appendChild(el('div', { text: '（装着可能な装備なし）', className: 'muted' }));
  } else {
    const list = el('div', { className: 'gear-candidates' });
    for (const eq of cands) {
      list.appendChild(button(`${eq.glyph} ${eq.name} ${gearStatLine(eq.stats)}`, () => {
        equipItem(p, eq.id);
        renderLoadout(ctx);
      }, { className: 'small' }));
    }
    cell.appendChild(list);
  }
  return cell;
}

function slotLabel(slot: EquipSlot): string {
  return slot === 'weapon' ? '🗡 武器' : slot === 'armor' ? '🛡 防具' : '🟡 装飾';
}

function skillStatLine(s: ReturnType<typeof getSkill>): string {
  const parts: string[] = [];
  parts.push(`pow ${s.power}`);
  if (s.cooldown > 0) parts.push(`CD ${s.cooldown}`);
  if (s.element) parts.push(ELEMENT_LABEL[s.element]);
  parts.push(s.kind);
  return parts.join(' / ');
}

function getSkill(id: SkillId) { return SKILLS[id]; }

function gearStatLine(stats: { atk?: number; def?: number; maxHp?: number; element?: string; elementBonus?: number }): string {
  const parts: string[] = [];
  if (stats.atk) parts.push(`ATK+${stats.atk}`);
  if (stats.def) parts.push(`DEF+${stats.def}`);
  if (stats.maxHp) parts.push(`HP+${stats.maxHp}`);
  if (stats.element && stats.elementBonus) {
    const elName = ELEMENT_LABEL[stats.element as keyof typeof ELEMENT_LABEL];
    parts.push(`${elName}+${Math.round(stats.elementBonus * 100)}%`);
  }
  return parts.length === 0 ? '' : `(${parts.join(', ')})`;
}
