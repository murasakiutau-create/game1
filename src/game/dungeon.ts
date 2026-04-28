import { DUNGEON, MAX_FLOOR, type DungeonFloor } from '../data/dungeons';
import { ENEMIES, type Enemy } from '../data/enemies';
import type { MaterialId } from '../data/materials';
import { rng } from './rng';
import { fullHeal, type PlayerState } from './state';

export interface FloorEncounter {
  floor: DungeonFloor;
  enemy: Enemy;
}

export function rollEncounter(p: PlayerState): FloorEncounter {
  const floor = DUNGEON[p.currentFloor - 1];
  const enemyId = rng.pick(floor.encounters);
  return { floor, enemy: ENEMIES[enemyId] };
}

export function applyVictory(
  p: PlayerState,
  enemy: Enemy,
): {
  gold: number;
  drops: { material: MaterialId; qty: number }[];
  bossCleared: boolean;
} {
  // ゴールド
  const gold = rng.range(enemy.goldDrop[0], enemy.goldDrop[1]);
  p.gold += gold;
  // ドロップ
  const drops: { material: MaterialId; qty: number }[] = [];
  for (const d of enemy.drops) {
    if (enemy.isBoss) {
      // ボスは確定で2個ずつ
      p.materials[d.material] = (p.materials[d.material] ?? 0) + 2;
      drops.push({ material: d.material, qty: 2 });
    } else if (rng.chance(d.chance)) {
      const qty = 1;
      p.materials[d.material] = (p.materials[d.material] ?? 0) + qty;
      drops.push({ material: d.material, qty });
    }
  }
  p.totalKills += 1;
  let bossCleared = false;
  if (enemy.isBoss) {
    p.bossDefeated = true;
    bossCleared = true;
  }
  return { gold, drops, bossCleared };
}

export function advanceFloor(p: PlayerState): boolean {
  if (p.currentFloor >= MAX_FLOOR) return false;
  p.currentFloor += 1;
  return true;
}

export function returnToTown(p: PlayerState): void {
  p.currentFloor = 1;
  fullHeal(p);
}

export function isAtBossFloor(p: PlayerState): boolean {
  return DUNGEON[p.currentFloor - 1]?.isBoss === true;
}
