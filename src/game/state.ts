import type { MaterialId } from '../data/materials';
import { MATERIAL_IDS } from '../data/materials';
import type { SkillId } from '../data/skills';
import type { EquipmentId, EquipSlot } from '../data/equipment';
import { EQUIPMENTS } from '../data/equipment';

export interface PlayerState {
  hp: number;                   // 現在HP（ダンジョン中減る、拠点でmax回復）
  baseMaxHp: number;            // 初期60 + 永久ボーナス
  baseAtk: number;              // 初期6
  baseDef: number;              // 初期2
  gold: number;
  materials: Record<MaterialId, number>;
  knownRecipes: SkillId[];      // 既知のレシピで作れるスキル
  ownedSkills: SkillId[];       // 所有スキル（突然変異含む）
  equippedSkills: (SkillId | null)[]; // 長さ5
  ownedEquipment: EquipmentId[];
  equippedGear: Record<EquipSlot, EquipmentId | null>;
  permanentBonuses: { atk: number; def: number; maxHp: number };
  bossDefeated: boolean;
  currentFloor: number;
  totalCrafts: number;
  totalKills: number;
  createdAt: string;
}

export function createInitialPlayer(): PlayerState {
  const mats: Record<MaterialId, number> = {} as Record<MaterialId, number>;
  for (const id of MATERIAL_IDS) mats[id] = 0;
  mats.venom_gland = 2;
  mats.sharp_ore = 2;
  mats.hard_carapace = 1;
  mats.pure_water = 1;

  return {
    hp: 60,
    baseMaxHp: 60,
    baseAtk: 6,
    baseDef: 2,
    gold: 30,
    materials: mats,
    knownRecipes: [],
    ownedSkills: ['basic_strike'],
    equippedSkills: ['basic_strike', null, null, null, null],
    ownedEquipment: [],
    equippedGear: { weapon: null, armor: null, accessory: null },
    permanentBonuses: { atk: 0, def: 0, maxHp: 0 },
    bossDefeated: false,
    currentFloor: 1,
    totalCrafts: 0,
    totalKills: 0,
    createdAt: new Date().toISOString(),
  };
}

export interface EffectiveStats {
  maxHp: number;
  atk: number;
  def: number;
}

export function effectiveStats(p: PlayerState): EffectiveStats {
  let maxHp = p.baseMaxHp + p.permanentBonuses.maxHp;
  let atk = p.baseAtk + p.permanentBonuses.atk;
  let def = p.baseDef + p.permanentBonuses.def;
  for (const slot of ['weapon', 'armor', 'accessory'] as EquipSlot[]) {
    const id = p.equippedGear[slot];
    if (!id) continue;
    const eq = EQUIPMENTS[id];
    atk += eq.stats.atk ?? 0;
    def += eq.stats.def ?? 0;
    maxHp += eq.stats.maxHp ?? 0;
  }
  return { maxHp, atk, def };
}

export function clampHp(p: PlayerState): void {
  const max = effectiveStats(p).maxHp;
  if (p.hp > max) p.hp = max;
  if (p.hp < 0) p.hp = 0;
}

export function fullHeal(p: PlayerState): void {
  p.hp = effectiveStats(p).maxHp;
}
