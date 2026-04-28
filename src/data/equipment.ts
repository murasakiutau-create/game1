import type { Element } from './elements';

export type EquipSlot = 'weapon' | 'armor' | 'accessory';

export type EquipmentId =
  | 'rusty_dagger'
  | 'iron_blade'
  | 'cinder_edge'
  | 'storm_lance'
  | 'leather_vest'
  | 'plated_mail'
  | 'mossy_robe'
  | 'aegis_carapace'
  | 'amulet_ember'
  | 'amulet_tide'
  | 'amulet_zephyr'
  | 'amulet_dawn';

export interface Equipment {
  id: EquipmentId;
  slot: EquipSlot;
  name: string;
  glyph: string;
  stats: {
    atk?: number;
    def?: number;
    maxHp?: number;
    element?: Element;
    elementBonus?: number; // 該当属性スキル時の倍率（例：0.2なら+20%）
  };
  price: number;
  unlockAfterBoss?: boolean; // ボス撃破でショップに並ぶ
  description: string;
}

export const EQUIPMENTS: Record<EquipmentId, Equipment> = {
  // 武器
  rusty_dagger: {
    id: 'rusty_dagger',
    slot: 'weapon',
    name: '錆びた短剣',
    glyph: '🗡',
    stats: { atk: 2 },
    price: 30,
    description: '廃都の入り口で拾える程度の武器。',
  },
  iron_blade: {
    id: 'iron_blade',
    slot: 'weapon',
    name: '鉄の刃',
    glyph: '⚔',
    stats: { atk: 5 },
    price: 120,
    description: '安定した威力の量産品。',
  },
  cinder_edge: {
    id: 'cinder_edge',
    slot: 'weapon',
    name: '炎刃カインダー',
    glyph: '🔥',
    stats: { atk: 4, element: 'fire', elementBonus: 0.25 },
    price: 220,
    description: '火属性スキル時+25%。属性特化武器。',
  },
  storm_lance: {
    id: 'storm_lance',
    slot: 'weapon',
    name: '嵐の槍',
    glyph: '⚡',
    stats: { atk: 8, element: 'wind', elementBonus: 0.20 },
    price: 480,
    unlockAfterBoss: true,
    description: 'ボス撃破後解禁。風属性スキル時+20%。',
  },

  // 防具
  leather_vest: {
    id: 'leather_vest',
    slot: 'armor',
    name: '革のベスト',
    glyph: '🧥',
    stats: { def: 2, maxHp: 10 },
    price: 40,
    description: '最低限の守り。',
  },
  plated_mail: {
    id: 'plated_mail',
    slot: 'armor',
    name: '板金鎧',
    glyph: '🛡',
    stats: { def: 6, maxHp: 20 },
    price: 180,
    description: '重いが頼れる。',
  },
  mossy_robe: {
    id: 'mossy_robe',
    slot: 'armor',
    name: '苔生したローブ',
    glyph: '🌿',
    stats: { def: 3, maxHp: 30 },
    price: 200,
    description: 'HP重視の不気味なローブ。',
  },
  aegis_carapace: {
    id: 'aegis_carapace',
    slot: 'armor',
    name: '重甲アイギス',
    glyph: '🛡',
    stats: { def: 10, maxHp: 40 },
    price: 520,
    unlockAfterBoss: true,
    description: 'ボス撃破後解禁。最硬の鎧。',
  },

  // 装飾
  amulet_ember: {
    id: 'amulet_ember',
    slot: 'accessory',
    name: '残灯のアミュレット',
    glyph: '🟠',
    stats: { element: 'fire', elementBonus: 0.30, atk: 1 },
    price: 150,
    description: '火属性ダメージを+30%。',
  },
  amulet_tide: {
    id: 'amulet_tide',
    slot: 'accessory',
    name: '潮鳴のアミュレット',
    glyph: '🔵',
    stats: { element: 'water', elementBonus: 0.30, maxHp: 15 },
    price: 150,
    description: '水属性ダメージ/回復を+30%。',
  },
  amulet_zephyr: {
    id: 'amulet_zephyr',
    slot: 'accessory',
    name: '風渡りのアミュレット',
    glyph: '🟢',
    stats: { element: 'wind', elementBonus: 0.30, atk: 2 },
    price: 150,
    description: '風属性ダメージを+30%。',
  },
  amulet_dawn: {
    id: 'amulet_dawn',
    slot: 'accessory',
    name: '黎明のアミュレット',
    glyph: '🟡',
    stats: { element: 'light', elementBonus: 0.40, maxHp: 25 },
    price: 360,
    unlockAfterBoss: true,
    description: 'ボス撃破後解禁。光属性+40%。',
  },
};

export const EQUIPMENT_IDS: EquipmentId[] = Object.keys(EQUIPMENTS) as EquipmentId[];
