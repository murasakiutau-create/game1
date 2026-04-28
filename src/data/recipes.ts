import type { Element } from './elements';
import type { MaterialId } from './materials';
import type { SkillId } from './skills';

export interface Recipe {
  materialA: MaterialId;
  materialB: MaterialId;
  element: Element;
  skillId: SkillId;
}

// 順序非依存で照合する。属性は厳密一致。
export const RECIPES: Recipe[] = [
  // 攻撃寄り
  { materialA: 'venom_gland', materialB: 'sharp_ore', element: 'dark', skillId: 'poison_blade' },
  { materialA: 'venom_gland', materialB: 'dark_spore', element: 'dark', skillId: 'venom_cloud' },
  { materialA: 'sharp_ore', materialB: 'fire_core', element: 'fire', skillId: 'flame_burst' },
  { materialA: 'fire_core', materialB: 'wind_feather', element: 'fire', skillId: 'spark_shot' },
  { materialA: 'wind_feather', materialB: 'sharp_ore', element: 'wind', skillId: 'wind_slash' },
  { materialA: 'wind_feather', materialB: 'fire_core', element: 'wind', skillId: 'lightning_lance' },
  { materialA: 'glowstone', materialB: 'sharp_ore', element: 'light', skillId: 'holy_light' },
  { materialA: 'dark_spore', materialB: 'sharp_ore', element: 'dark', skillId: 'shadow_pierce' },
  { materialA: 'pure_water', materialB: 'sharp_ore', element: 'water', skillId: 'frost_bind' },

  // 防御寄り
  { materialA: 'hard_carapace', materialB: 'pure_water', element: 'water', skillId: 'water_shield' },
  { materialA: 'hard_carapace', materialB: 'hard_carapace', element: 'light', skillId: 'stone_armor' },
  { materialA: 'wind_feather', materialB: 'wind_feather', element: 'wind', skillId: 'gale_strike' },

  // 補助・回復
  { materialA: 'pure_water', materialB: 'glowstone', element: 'water', skillId: 'heal_mist' },
  { materialA: 'glowstone', materialB: 'pure_water', element: 'light', skillId: 'cleansing_ray' },

  // 呪詛
  { materialA: 'dark_spore', materialB: 'hard_carapace', element: 'dark', skillId: 'dark_curse' },

  // 風×光、火×水（属性ミスマッチで覚えにくい）
  { materialA: 'glowstone', materialB: 'wind_feather', element: 'light', skillId: 'cleansing_ray' },
  { materialA: 'fire_core', materialB: 'pure_water', element: 'water', skillId: 'frost_bind' },
];

// (a,b,element) を順不同で照合する正規化キー
export function recipeKey(a: MaterialId, b: MaterialId, element: Element): string {
  const [x, y] = a < b ? [a, b] : [b, a];
  return `${x}|${y}|${element}`;
}

const RECIPE_INDEX = new Map<string, SkillId>();
for (const r of RECIPES) {
  RECIPE_INDEX.set(recipeKey(r.materialA, r.materialB, r.element), r.skillId);
}

export function findRecipe(a: MaterialId, b: MaterialId, element: Element): SkillId | undefined {
  return RECIPE_INDEX.get(recipeKey(a, b, element));
}
