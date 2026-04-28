import { DUNGEON, MAX_FLOOR } from '../data/dungeons';
import { effectiveStats } from '../game/state';
import { rollEncounter, returnToTown } from '../game/dungeon';
import type { AppContext } from './app';
import { button, clear, el, panel } from './components';

export function renderDungeon(ctx: AppContext): void {
  clear(ctx.root);
  const p = ctx.player!;
  const floor = DUNGEON[p.currentFloor - 1];
  const eff = effectiveStats(p);

  const main = el('div', { className: 'screen screen-dungeon' });
  main.appendChild(el('div', { className: 'breadcrumb' }, [
    button('🏠 拠点に戻る（HP全回復）', async () => {
      returnToTown(p);
      await ctx.saveCurrent();
      ctx.goto({ kind: 'town' });
    }),
    el('h1', { text: `🗺 ${floor.name}（${p.currentFloor}/${MAX_FLOOR}階）`, className: 'screen-title' }),
  ]));

  main.appendChild(el('div', { className: 'status-bar' }, [
    el('div', { text: `❤ ${p.hp}/${eff.maxHp}` }),
    el('div', { text: `⚔ ${eff.atk}` }),
    el('div', { text: `🛡 ${eff.def}` }),
    el('div', { text: `💰 ${p.gold}` }),
  ]));

  main.appendChild(el('pre', { className: 'ascii-bg', text: bgArt(p.currentFloor) }));
  main.appendChild(panel('場所', el('p', { text: floor.description })));

  const equippedCount = p.equippedSkills.filter((s) => s !== null).length;

  const actions = el('div', { className: 'town-actions' });
  if (floor.isBoss) {
    actions.appendChild(el('p', { text: '⚠ ここはボス階。万全の準備で挑め。' }));
    actions.appendChild(button('🩸 ボスに挑む', () => {
      // 戦闘へ
      ctx.goto({ kind: 'battle' });
    }, { className: 'btn-primary big', disabled: equippedCount === 0 }));
  } else {
    actions.appendChild(button('🔍 探索する（敵と遭遇）', () => {
      ctx.goto({ kind: 'battle' });
    }, { className: 'btn-primary big', disabled: equippedCount === 0 }));
  }
  if (equippedCount === 0) {
    actions.appendChild(el('p', { text: 'スキルが1つも装備されていない。ロードアウトを確認しよう。', className: 'warn-text' }));
  }

  main.appendChild(panel('行動', actions));

  // 出現候補
  const enemList = el('div', { className: 'enemy-preview' });
  const seen = new Set<string>();
  for (const eid of floor.encounters) {
    if (seen.has(eid)) continue;
    seen.add(eid);
    enemList.appendChild(el('div', { text: `• ${eid}`, className: 'muted' }));
  }
  // ※idのみ表示（テキスト寄り。詳細はバトル画面で）
  main.appendChild(panel('出現する敵', enemList));

  ctx.root.appendChild(main);
}

function bgArt(floor: number): string {
  const arts = [
    `   |||  ✦   |||
   ▓▓▓▓▓▓▓▓▓▓▓▓
   崩れた門が口を開く`,
    `  〜〜  胞子が舞う  〜〜
   🟢   🟢     🟢
   苔生した街路`,
    `   ▲▲  廃塔の影  ▲▲
   ▓▓▓▓▓▓▓▓▓▓▓▓
   崩落した広場`,
    `  🔥   残火が揺れる  🔥
   ▓▓▓▓▓▓▓▓▓▓▓▓
   薄暗い路地`,
    `   〜〜〜  渦巻く風  〜〜〜
   ▓▓▓▓▓▓▓▓▓▓▓▓
   塔跡の最上層`,
    `   ☠   血色の祭壇   ☠
   ▓▓▓▓▓▓▓▓▓▓▓▓
   主が眠る場所`,
  ];
  return arts[Math.min(floor, arts.length) - 1];
}
