import { effectiveStats, fullHeal } from '../game/state';
import { MAX_FLOOR } from '../data/dungeons';
import type { AppContext } from './app';
import { button, clear, el, panel } from './components';

export function renderTown(ctx: AppContext): void {
  clear(ctx.root);
  const p = ctx.player!;
  // 拠点に来たので全回復
  fullHeal(p);

  const eff = effectiveStats(p);
  const main = el('div', { className: 'screen screen-town' });

  main.appendChild(
    el('div', { className: 'hero' }, [
      el('h1', { text: '拠点：忘れ物の研究室', className: 'screen-title' }),
      el('pre', {
        className: 'ascii-bg',
        text: `
   |~~~~~~~|       _____
   |  釜  |        |     |
   |     |        | 寝台 |
   |_____|        |_____|
   ~~~~~~~~~~~~~~~~~~~~~~`,
      }),
      el('p', { text: '湯気がかすかに立ち上る。HPは全回復した。' }),
    ]),
  );

  const status = el('div', { className: 'status-bar' }, [
    el('div', { text: `❤ HP ${p.hp}/${eff.maxHp}` }),
    el('div', { text: `⚔ ATK ${eff.atk}` }),
    el('div', { text: `🛡 DEF ${eff.def}` }),
    el('div', { text: `💰 ${p.gold} gold` }),
    el('div', { text: `📜 レシピ ${p.knownRecipes.length}` }),
    el('div', { text: `🗺 進行階 ${p.currentFloor} / ${MAX_FLOOR}` }),
  ]);
  main.appendChild(status);

  const actions = el('div', { className: 'town-actions' }, [
    button('🧪 調合する', () => ctx.goto({ kind: 'workshop' }), { className: 'btn-primary big' }),
    button('🛒 ショップ', () => ctx.goto({ kind: 'shop' }), { className: 'big' }),
    button('🎒 持ち物', () => ctx.goto({ kind: 'inventory' }), { className: 'big' }),
    button('⚔ ロードアウト', () => ctx.goto({ kind: 'loadout' }), { className: 'big' }),
    button('💾 セーブメニュー', () => ctx.goto({ kind: 'saveMenu' }), { className: 'big' }),
    button(p.bossDefeated ? '🗡 廃都へ（再挑戦）' : '🗡 廃都へ', () => ctx.goto({ kind: 'dungeon' }), { className: 'btn-primary big' }),
  ]);
  main.appendChild(panel('行動を選ぶ', actions));

  if (p.bossDefeated) {
    main.appendChild(panel('称号', el('div', { text: '👑 廃都の主を討伐した者' })));
  }

  ctx.root.appendChild(main);
}
