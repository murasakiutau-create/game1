export type MaterialId =
  | 'venom_gland'
  | 'hard_carapace'
  | 'dark_spore'
  | 'sharp_ore'
  | 'pure_water'
  | 'glowstone'
  | 'fire_core'
  | 'wind_feather';

export interface Material {
  id: MaterialId;
  name: string;
  glyph: string;
  tags: string[];
  rarity: 1 | 2 | 3;
  sellPrice: number;
  description: string;
}

export const MATERIALS: Record<MaterialId, Material> = {
  venom_gland: {
    id: 'venom_gland',
    name: '毒液腺',
    glyph: '🟢',
    tags: ['poison', 'organic'],
    rarity: 1,
    sellPrice: 8,
    description: '猛毒を分泌する小さな腺。調合の触媒に。',
  },
  hard_carapace: {
    id: 'hard_carapace',
    name: '硬い甲殻',
    glyph: '🛡',
    tags: ['defense', 'organic'],
    rarity: 1,
    sellPrice: 10,
    description: '頑丈な甲殻のかけら。守りに通じる。',
  },
  dark_spore: {
    id: 'dark_spore',
    name: '闇の胞子',
    glyph: '🟣',
    tags: ['dark', 'curse', 'organic'],
    rarity: 2,
    sellPrice: 18,
    description: '触れた者の心を蝕む不気味な胞子。',
  },
  sharp_ore: {
    id: 'sharp_ore',
    name: '鋭利な鉱石',
    glyph: '⛏',
    tags: ['attack', 'mineral'],
    rarity: 1,
    sellPrice: 12,
    description: '刃のように尖った鉱石。攻撃調合の核。',
  },
  pure_water: {
    id: 'pure_water',
    name: '清き水',
    glyph: '💧',
    tags: ['water', 'heal'],
    rarity: 1,
    sellPrice: 6,
    description: '汚染を逃れた澄んだ水。癒しの素。',
  },
  glowstone: {
    id: 'glowstone',
    name: '輝石',
    glyph: '💎',
    tags: ['light', 'mineral'],
    rarity: 2,
    sellPrice: 20,
    description: '内に光を宿す石。聖なる調合に。',
  },
  fire_core: {
    id: 'fire_core',
    name: '火の核',
    glyph: '🔴',
    tags: ['fire', 'attack'],
    rarity: 2,
    sellPrice: 22,
    description: '燃え続ける小さな核。爆ぜる素材。',
  },
  wind_feather: {
    id: 'wind_feather',
    name: '風の羽根',
    glyph: '🪶',
    tags: ['wind', 'speed'],
    rarity: 2,
    sellPrice: 16,
    description: '触れると軽く浮く不思議な羽根。',
  },
};

export const MATERIAL_IDS: MaterialId[] = Object.keys(MATERIALS) as MaterialId[];
