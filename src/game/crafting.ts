import type { Element } from '../data/elements';
import type { MaterialId } from '../data/materials';
import { MATERIALS } from '../data/materials';
import { findRecipe } from '../data/recipes';
import { MUTATION_SKILL_IDS, type SkillId } from '../data/skills';
import { rng } from './rng';
import type { PlayerState } from './state';

export type CraftOutcome =
  | { kind: 'success_new'; skillId: SkillId }
  | { kind: 'success_known'; skillId: SkillId }
  | { kind: 'failure_gold'; gold: number }
  | { kind: 'failure_stat'; stat: 'atk' | 'def' | 'maxHp'; amount: number }
  | { kind: 'failure_mutation'; skillId: SkillId };

export interface CraftResult {
  outcome: CraftOutcome;
  consumed: { a: MaterialId; b: MaterialId; element: Element };
}

export function craft(
  player: PlayerState,
  a: MaterialId,
  b: MaterialId,
  element: Element,
): CraftResult | { error: string } {
  // 同一素材の場合、所持数2以上必要
  if (a === b) {
    if ((player.materials[a] ?? 0) < 2) {
      return { error: '同じ素材を2つ使う調合は、その素材を2個以上持っている必要があります' };
    }
  } else {
    if ((player.materials[a] ?? 0) < 1) return { error: `${MATERIALS[a].name}が足りません` };
    if ((player.materials[b] ?? 0) < 1) return { error: `${MATERIALS[b].name}が足りません` };
  }

  // 素材消費
  player.materials[a] = (player.materials[a] ?? 0) - 1;
  player.materials[b] = (player.materials[b] ?? 0) - 1;
  player.totalCrafts += 1;

  const recipeSkill = findRecipe(a, b, element);
  if (recipeSkill) {
    const isNew = !player.knownRecipes.includes(recipeSkill);
    if (isNew) {
      player.knownRecipes.push(recipeSkill);
      if (!player.ownedSkills.includes(recipeSkill)) player.ownedSkills.push(recipeSkill);
      return { outcome: { kind: 'success_new', skillId: recipeSkill }, consumed: { a, b, element } };
    } else {
      return { outcome: { kind: 'success_known', skillId: recipeSkill }, consumed: { a, b, element } };
    }
  }

  // 失敗テーブル：70% gold / 25% stat / 5% mutation
  const roll = rng.next();
  if (roll < 0.05) {
    // 既に所有しているmutationを除外
    const pool = MUTATION_SKILL_IDS.filter((id) => !player.ownedSkills.includes(id));
    if (pool.length === 0) {
      // すべて所有済みなら gold で代用
      const gold = (MATERIALS[a].sellPrice + MATERIALS[b].sellPrice) * 2;
      player.gold += gold;
      return { outcome: { kind: 'failure_gold', gold }, consumed: { a, b, element } };
    }
    const skillId = rng.pick(pool);
    player.ownedSkills.push(skillId);
    return { outcome: { kind: 'failure_mutation', skillId }, consumed: { a, b, element } };
  } else if (roll < 0.30) {
    const stats: Array<'atk' | 'def' | 'maxHp'> = ['atk', 'def', 'maxHp'];
    const stat = rng.pick(stats);
    const amount = stat === 'maxHp' ? rng.range(2, 5) : 1;
    player.permanentBonuses[stat] += amount;
    return { outcome: { kind: 'failure_stat', stat, amount }, consumed: { a, b, element } };
  } else {
    const baseGold = MATERIALS[a].sellPrice + MATERIALS[b].sellPrice;
    const gold = Math.max(3, Math.floor(baseGold * (0.6 + rng.next() * 0.6)));
    player.gold += gold;
    return { outcome: { kind: 'failure_gold', gold }, consumed: { a, b, element } };
  }
}
