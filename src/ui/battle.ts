import { ENEMIES } from '../data/enemies';
import { ELEMENT_LABEL } from '../data/elements';
import { MATERIALS } from '../data/materials';
import { SKILLS, STATUS_GLYPH, STATUS_LABEL, type SkillId } from '../data/skills';
import { advanceFloor, applyVictory, isAtBossFloor, returnToTown, rollEncounter } from '../game/dungeon';
import { flee, playerAct, startBattle, type BattleState } from '../game/battle';
import { effectiveStats } from '../game/state';
import { MAX_FLOOR } from '../data/dungeons';
import type { AppContext } from './app';
import { button, clear, el, panel } from './components';

let active: BattleState | null = null;

export function renderBattle(ctx: AppContext): void {
  if (!active || active.ended) {
    // 新規エンカウント
    const p = ctx.player!;
    const enc = rollEncounter(p);
    active = startBattle(p, enc.enemy);
  }
  drawBattle(ctx);
}

function drawBattle(ctx: AppContext): void {
  clear(ctx.root);
  const p = ctx.player!;
  const state = active!;
  const main = el('div', { className: 'screen screen-battle' });

  // 敵側
  const enemyBox = el('div', { className: 'enemy-area' });
  enemyBox.appendChild(el('h2', { text: state.enemy.name, className: 'enemy-name' }));
  enemyBox.appendChild(el('pre', { className: 'enemy-art', text: state.enemy.source.asciiArt }));
  enemyBox.appendChild(hpBar(state.enemy.hp, state.enemy.maxHp));
  if (state.enemy.element) {
    enemyBox.appendChild(el('div', { className: 'enemy-meta', text: `属性: ${ELEMENT_LABEL[state.enemy.element]}` }));
  }
  enemyBox.appendChild(statusLine(state.enemy.statuses));
  main.appendChild(enemyBox);

  // ログ
  const logBox = el('div', { className: 'battle-log' });
  for (const line of state.log.slice(-12)) logBox.appendChild(el('div', { text: line }));
  main.appendChild(panel(`ターン ${state.turn}`, logBox));

  // 自分側
  const eff = effectiveStats(p);
  const playerBox = el('div', { className: 'player-area' });
  playerBox.appendChild(el('div', { text: `冒険者  ATK ${state.player.atk} / DEF ${state.player.def}` }));
  playerBox.appendChild(hpBar(state.player.hp, state.player.maxHp));
  playerBox.appendChild(statusLine(state.player.statuses));
  main.appendChild(playerBox);

  if (state.ended) {
    main.appendChild(renderResult(ctx, state));
    ctx.root.appendChild(main);
    return;
  }

  // 行動：5スキル + 逃げる
  const actions = el('div', { className: 'skill-buttons' });
  for (let i = 0; i < 5; i++) {
    const sid = p.equippedSkills[i];
    if (!sid) {
      actions.appendChild(button('〔空〕', () => {}, { disabled: true, className: 'skill-btn empty' }));
      continue;
    }
    const cd = state.player.cooldowns[sid] ?? 0;
    const s = SKILLS[sid];
    const btn = button(`${s.glyph} ${s.name}${cd > 0 ? `（CD${cd}）` : ''}`, () => {
      playerAct(state, p, sid);
      // 戦闘終了処理は drawBattle で
      drawBattle(ctx);
    }, { className: 'skill-btn' + (cd > 0 ? ' on-cd' : ''), disabled: cd > 0 });
    btn.title = s.description;
    actions.appendChild(btn);
  }
  actions.appendChild(button('🏃 逃げる', () => {
    flee(state);
    drawBattle(ctx);
  }, { className: 'flee' }));

  main.appendChild(panel('行動を選ぶ', actions));

  ctx.root.appendChild(main);
}

function hpBar(hp: number, maxHp: number): HTMLElement {
  const ratio = Math.max(0, Math.min(1, hp / maxHp));
  const w = Math.round(ratio * 20);
  const bar = '█'.repeat(w) + '░'.repeat(20 - w);
  return el('div', { className: 'hp-bar', text: `❤ ${hp}/${maxHp}  [${bar}]` });
}

function statusLine(statuses: { kind: string; turns: number; power: number }[]): HTMLElement {
  if (statuses.length === 0) return el('div', { className: 'status-line muted', text: '異常なし' });
  const parts: string[] = [];
  for (const s of statuses) {
    parts.push(`${STATUS_GLYPH[s.kind as keyof typeof STATUS_GLYPH]} ${STATUS_LABEL[s.kind as keyof typeof STATUS_LABEL]}(${s.turns}t)`);
  }
  return el('div', { className: 'status-line', text: parts.join(' ') });
}

function renderResult(ctx: AppContext, state: BattleState): HTMLElement {
  const p = ctx.player!;
  const box = el('div', { className: 'battle-result' });

  if (state.result === 'win') {
    box.appendChild(el('h2', { text: '勝利！', className: 'result-win' }));
    const enemy = state.enemy.source;
    const v = applyVictory(p, enemy);
    box.appendChild(el('div', { text: `+ ${v.gold} gold` }));
    if (v.drops.length > 0) {
      const list = el('ul', {});
      for (const d of v.drops) {
        list.appendChild(el('li', { text: `${MATERIALS[d.material].glyph} ${MATERIALS[d.material].name} × ${d.qty}` }));
      }
      box.appendChild(list);
    }
    // HPは戦闘終了時の値を反映
    p.hp = state.player.hp;

    if (v.bossCleared) {
      box.appendChild(el('div', { className: 'ending-card' }, [
        el('h2', { text: '👑 廃都の主を撃破！', className: 'result-win' }),
        el('pre', { className: 'ascii-bg', text:
`     ╭───────────╮
     │  廃都に    │
     │  夜明けが   │
     │  訪れる …  │
     ╰───────────╯` }),
        el('p', { text: '深い闇に光が差し込む。新たな装備が「夜霧の露店」に並んだ。' }),
        el('p', { text: '冒険はまだ続く。さらなる調合の探求を。' }),
      ]));
      box.appendChild(button('🏠 拠点に戻る', async () => {
        returnToTown(p);
        active = null;
        await ctx.saveCurrent();
        ctx.goto({ kind: 'town' });
      }, { className: 'btn-primary big' }));
    } else {
      const row = el('div', { className: 'row' });
      const isBossNext = isAtBossFloor(p) || (p.currentFloor + 1 === MAX_FLOOR);
      row.appendChild(button(`⏩ 次の階へ（${p.currentFloor + 1}階）`, async () => {
        const ok = advanceFloor(p);
        active = null;
        await ctx.saveCurrent();
        if (!ok) {
          // すでに最深部
          ctx.goto({ kind: 'dungeon' });
        } else {
          ctx.goto({ kind: 'dungeon' });
        }
      }, { className: 'btn-primary' }));
      row.appendChild(button('🏠 拠点に戻る（HP全回復）', async () => {
        returnToTown(p);
        active = null;
        await ctx.saveCurrent();
        ctx.goto({ kind: 'town' });
      }));
      box.appendChild(row);
    }
  } else if (state.result === 'flee') {
    box.appendChild(el('h2', { text: '逃走成功' }));
    box.appendChild(el('p', { text: '今回の戦いは見送った。HPは戦闘中の値のまま。' }));
    p.hp = state.player.hp;
    box.appendChild(button('🏠 拠点に戻る', async () => {
      returnToTown(p);
      active = null;
      await ctx.saveCurrent();
      ctx.goto({ kind: 'town' });
    }, { className: 'btn-primary big' }));
  } else {
    // lose
    box.appendChild(el('h2', { text: '気を失った…', className: 'result-lose' }));
    box.appendChild(el('p', { text: '誰かに拾われ、拠点に運ばれた。素材と装備は無事だ。' }));
    p.hp = 1; // 最低限の保険
    box.appendChild(button('🏠 拠点に戻る（HP全回復）', async () => {
      returnToTown(p);
      active = null;
      await ctx.saveCurrent();
      ctx.goto({ kind: 'town' });
    }, { className: 'btn-primary big' }));
  }

  return box;
}
