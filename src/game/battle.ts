import type { Element } from '../data/elements';
import { elementMultiplier } from '../data/elements';
import type { Enemy } from '../data/enemies';
import { EQUIPMENTS } from '../data/equipment';
import type { Skill, SkillId, StatusKind } from '../data/skills';
import { SKILLS, STATUS_LABEL } from '../data/skills';
import { rng } from './rng';
import { effectiveStats, type PlayerState } from './state';

export interface StatusInstance {
  kind: StatusKind;
  turns: number;
  power: number;
}

export interface CombatActor {
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  element?: Element;
  statuses: StatusInstance[];
  cooldowns: Partial<Record<SkillId, number>>;
}

export interface BattleState {
  player: CombatActor;
  enemy: CombatActor & { source: Enemy };
  turn: number;
  log: string[];
  ended: boolean;
  result?: 'win' | 'lose' | 'flee';
}

export function makePlayerActor(p: PlayerState): CombatActor {
  const eff = effectiveStats(p);
  const cd: Partial<Record<SkillId, number>> = {};
  for (const s of p.equippedSkills) if (s) cd[s] = 0;
  return {
    name: '冒険者',
    hp: Math.min(p.hp, eff.maxHp),
    maxHp: eff.maxHp,
    atk: eff.atk,
    def: eff.def,
    statuses: [],
    cooldowns: cd,
  };
}

export function makeEnemyActor(e: Enemy): CombatActor & { source: Enemy } {
  return {
    name: e.name,
    hp: e.hp,
    maxHp: e.hp,
    atk: e.atk,
    def: e.def,
    element: e.element,
    statuses: [],
    cooldowns: {},
    source: e,
  };
}

export function startBattle(p: PlayerState, e: Enemy): BattleState {
  return {
    player: makePlayerActor(p),
    enemy: makeEnemyActor(e),
    turn: 1,
    log: [`${e.name}が現れた！`],
    ended: false,
  };
}

function findStatus(actor: CombatActor, kind: StatusKind): StatusInstance | undefined {
  return actor.statuses.find((s) => s.kind === kind);
}

function addStatus(actor: CombatActor, kind: StatusKind, turns: number, power: number): boolean {
  const existing = findStatus(actor, kind);
  if (existing) {
    // 上書き：強い方を残す
    existing.turns = Math.max(existing.turns, turns);
    existing.power = Math.max(existing.power, power);
    return false;
  }
  actor.statuses.push({ kind, turns, power });
  return true;
}

function damage(target: CombatActor, raw: number, log: string[]): void {
  const def = findStatus(target, 'shield') ? Math.floor(target.def + 6) : target.def;
  let dealt = Math.max(1, raw - def);
  if (findStatus(target, 'shield')) dealt = Math.floor(dealt * 0.5);
  target.hp = Math.max(0, target.hp - dealt);
  log.push(`→ ${target.name}に${dealt}ダメージ`);
}

// プレイヤーがスキル使用
export function playerAct(
  state: BattleState,
  player: PlayerState,
  skillId: SkillId,
): void {
  if (state.ended) return;

  const skill = SKILLS[skillId];
  const actor = state.player;
  const target = state.enemy;

  // 気絶チェック
  if (findStatus(actor, 'stun')) {
    state.log.push(`【${actor.name}】気絶していて動けない！`);
    advanceAfterPlayer(state, player);
    return;
  }

  // CDチェック
  const cd = actor.cooldowns[skillId] ?? 0;
  if (cd > 0) {
    state.log.push(`${skill.name}はあと${cd}ターン待つ必要がある（基本攻撃に置換）`);
    return playerAct(state, player, 'basic_strike');
  }

  state.log.push(`【${actor.name}】${skill.glyph} ${skill.name}！`);
  applySkill(state, actor, target, skill, player);
  if (skill.cooldown > 0) actor.cooldowns[skillId] = skill.cooldown + 1; // 自分のターンで-1されるので+1

  if (target.hp <= 0) {
    state.log.push(`${target.name}を倒した！`);
    state.ended = true;
    state.result = 'win';
    return;
  }

  advanceAfterPlayer(state, player);
}

function advanceAfterPlayer(state: BattleState, player: PlayerState): void {
  // 状態異常ティック（プレイヤー → 敵）
  tickStatuses(state.player, state.log);
  if (state.player.hp <= 0) {
    state.ended = true;
    state.result = 'lose';
    return;
  }
  enemyAct(state);
  if (state.player.hp <= 0) {
    state.ended = true;
    state.result = 'lose';
    return;
  }
  tickStatuses(state.enemy, state.log);
  if (state.enemy.hp <= 0) {
    state.ended = true;
    state.result = 'win';
    return;
  }
  // CD消費
  for (const k of Object.keys(state.player.cooldowns) as SkillId[]) {
    const v = state.player.cooldowns[k] ?? 0;
    if (v > 0) state.player.cooldowns[k] = v - 1;
  }
  state.turn += 1;
}

function applySkill(
  state: BattleState,
  attacker: CombatActor,
  defender: CombatActor,
  skill: Skill,
  player?: PlayerState,
): void {
  // 自分対象（バフ・回復）
  if (skill.effect?.selfTarget || skill.kind === 'heal' || skill.kind === 'buff') {
    if (skill.kind === 'heal') {
      const heal = computeHealAmount(skill, attacker, player);
      attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal);
      state.log.push(`→ ${attacker.name}のHPが${heal}回復`);
      // cleansing_ray は状態異常解除
      if (skill.id === 'cleansing_ray') {
        attacker.statuses = attacker.statuses.filter((s) => s.kind === 'shield' || s.kind === 'haste');
        state.log.push(`→ 状態異常を浄化した`);
      }
    }
    if (skill.effect?.status && skill.effect.selfTarget) {
      addStatus(attacker, skill.effect.status, skill.effect.statusTurns ?? 2, skill.effect.statusPower ?? 0);
      state.log.push(`→ ${attacker.name}に${STATUS_LABEL[skill.effect.status]}付与`);
    }
    return;
  }

  // 攻撃系
  if (skill.kind === 'attack' || skill.kind === 'status_attack' || skill.kind === 'debuff') {
    let dmg = computeAttackDamage(skill, attacker, defender, player);
    damage(defender, dmg, state.log);
    if (skill.effect?.status && skill.effect.statusChance && skill.effect.statusChance > 0) {
      if (rng.chance(skill.effect.statusChance)) {
        const added = addStatus(
          defender,
          skill.effect.status,
          skill.effect.statusTurns ?? 2,
          skill.effect.statusPower ?? 0,
        );
        state.log.push(`→ ${defender.name}に${STATUS_LABEL[skill.effect.status]}付与！`);
      }
    }
  }
}

function computeAttackDamage(
  skill: Skill,
  attacker: CombatActor,
  defender: CombatActor,
  player?: PlayerState,
): number {
  let base = attacker.atk * skill.power;
  if (findStatus(attacker, 'haste')) base *= 1.3;
  // 装備の属性ボーナス（プレイヤー攻撃のみ）
  if (player && skill.element) {
    for (const slot of ['weapon', 'armor', 'accessory'] as const) {
      const id = player.equippedGear[slot];
      if (!id) continue;
      const eq = EQUIPMENTS[id];
      if (eq.stats.element === skill.element && eq.stats.elementBonus) {
        base *= 1 + eq.stats.elementBonus;
      }
    }
  }
  // 属性相性（攻撃属性 vs 防御者属性）
  base *= elementMultiplier(skill.element, defender.element);
  // 状態異常特効
  if (skill.effect?.bonusVsStatus && findStatus(defender, skill.effect.bonusVsStatus)) {
    base *= skill.effect.bonusMul ?? 1.5;
  }
  return Math.floor(base);
}

function computeHealAmount(skill: Skill, actor: CombatActor, player?: PlayerState): number {
  let amount = skill.power;
  if (player && skill.element) {
    for (const slot of ['accessory', 'armor', 'weapon'] as const) {
      const id = player.equippedGear[slot];
      if (!id) continue;
      const eq = EQUIPMENTS[id];
      if (eq.stats.element === skill.element && eq.stats.elementBonus) {
        amount *= 1 + eq.stats.elementBonus;
      }
    }
  }
  return Math.floor(amount);
}

function tickStatuses(actor: CombatActor, log: string[]): void {
  for (const s of actor.statuses) {
    if (s.kind === 'poison' || s.kind === 'curse' || s.kind === 'burn') {
      const dmg = s.power;
      actor.hp = Math.max(0, actor.hp - dmg);
      log.push(`【${actor.name}】${STATUS_LABEL[s.kind]}で${dmg}ダメージ`);
    }
    s.turns -= 1;
  }
  actor.statuses = actor.statuses.filter((s) => s.turns > 0);
}

function enemyAct(state: BattleState): void {
  const enemy = state.enemy;
  if (findStatus(enemy, 'stun')) {
    state.log.push(`【${enemy.name}】気絶している…`);
    return;
  }
  const e = enemy.source;
  const skillRoll = rng.next();
  // ボスは強めの行動
  if (e.isBoss && skillRoll < 0.35) {
    state.log.push(`【${enemy.name}】闇の咆哮！`);
    damage(state.player, Math.floor(enemy.atk * 1.5), state.log);
    if (rng.chance(0.4)) {
      addStatus(state.player, 'curse', 2, 5);
      state.log.push(`→ 冒険者に呪い付与`);
    }
    return;
  }
  if (skillRoll < 0.25 && e.element) {
    state.log.push(`【${enemy.name}】属性の一撃！`);
    let dmg = Math.floor(enemy.atk * 1.2);
    damage(state.player, dmg, state.log);
    return;
  }
  state.log.push(`【${enemy.name}】の通常攻撃`);
  damage(state.player, enemy.atk, state.log);
}

export function flee(state: BattleState): boolean {
  if (state.ended) return false;
  if (state.enemy.source.isBoss) {
    state.log.push('ボス戦からは逃げられない！');
    return false;
  }
  if (rng.chance(0.7)) {
    state.log.push('うまく逃げ出した！');
    state.ended = true;
    state.result = 'flee';
    return true;
  }
  state.log.push('逃げ出せなかった！');
  return false;
}
