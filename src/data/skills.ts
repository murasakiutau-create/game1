import type { Element } from './elements';

export type SkillId =
  | 'poison_blade'
  | 'flame_burst'
  | 'water_shield'
  | 'wind_slash'
  | 'holy_light'
  | 'dark_curse'
  | 'heal_mist'
  | 'venom_cloud'
  | 'stone_armor'
  | 'spark_shot'
  | 'lightning_lance'
  | 'frost_bind'
  | 'gale_strike'
  | 'shadow_pierce'
  | 'cleansing_ray'
  | 'mutation_chaos'
  | 'mutation_revive'
  | 'mutation_doom'
  | 'mutation_eclipse'
  | 'basic_strike';

export type StatusKind = 'poison' | 'burn' | 'shield' | 'haste' | 'stun' | 'curse';

export interface Skill {
  id: SkillId;
  name: string;
  glyph: string;
  kind: 'attack' | 'heal' | 'buff' | 'debuff' | 'status_attack';
  element?: Element;
  power: number;          // ダメージ倍率の係数（atk * power）または回復量基準
  cooldown: number;       // 0なら毎ターン使用可
  description: string;
  effect?: {
    status?: StatusKind;
    statusChance?: number;  // 0..1
    statusTurns?: number;
    statusPower?: number;   // 毒のティックダメージなど
    selfTarget?: boolean;
    bonusVsStatus?: StatusKind;  // この状態異常の敵に追加ダメージ
    bonusMul?: number;
  };
}

export const SKILLS: Record<SkillId, Skill> = {
  basic_strike: {
    id: 'basic_strike',
    name: '通常攻撃',
    glyph: '🗡',
    kind: 'attack',
    power: 1.0,
    cooldown: 0,
    description: 'スキルがCD中の時の保険。素手で殴る。',
  },
  poison_blade: {
    id: 'poison_blade',
    name: '毒の刃',
    glyph: '🟢',
    kind: 'status_attack',
    element: 'dark',
    power: 1.1,
    cooldown: 1,
    description: '毒を纏った一撃。攻撃時60%で毒付与。',
    effect: { status: 'poison', statusChance: 0.6, statusTurns: 3, statusPower: 4 },
  },
  venom_cloud: {
    id: 'venom_cloud',
    name: '毒霧',
    glyph: '☁',
    kind: 'debuff',
    element: 'dark',
    power: 0.5,
    cooldown: 2,
    description: '毒の霧で確実に毒付与。微小ダメージ。',
    effect: { status: 'poison', statusChance: 1.0, statusTurns: 4, statusPower: 5 },
  },
  flame_burst: {
    id: 'flame_burst',
    name: '炎裂破',
    glyph: '🔥',
    kind: 'status_attack',
    element: 'fire',
    power: 1.6,
    cooldown: 2,
    description: '高威力の火炎攻撃。30%で火傷。',
    effect: { status: 'burn', statusChance: 0.3, statusTurns: 2, statusPower: 5 },
  },
  spark_shot: {
    id: 'spark_shot',
    name: '火花弾',
    glyph: '✦',
    kind: 'attack',
    element: 'fire',
    power: 1.2,
    cooldown: 0,
    description: '小さな炎の弾。CDなしで連発可。',
  },
  lightning_lance: {
    id: 'lightning_lance',
    name: '雷光槍',
    glyph: '⚡',
    kind: 'attack',
    element: 'wind',
    power: 1.8,
    cooldown: 3,
    description: '雷を纏った渾身の槍突き。',
  },
  water_shield: {
    id: 'water_shield',
    name: '水の盾',
    glyph: '🛡',
    kind: 'buff',
    element: 'water',
    power: 0,
    cooldown: 3,
    description: '3ターン被ダメージ-50%。',
    effect: { status: 'shield', statusChance: 1.0, statusTurns: 3, selfTarget: true },
  },
  stone_armor: {
    id: 'stone_armor',
    name: '岩の鎧',
    glyph: '🗿',
    kind: 'buff',
    power: 0,
    cooldown: 4,
    description: '4ターンの間、防御力+大幅。',
    effect: { status: 'shield', statusChance: 1.0, statusTurns: 4, selfTarget: true },
  },
  wind_slash: {
    id: 'wind_slash',
    name: '風刃',
    glyph: '🌪',
    kind: 'attack',
    element: 'wind',
    power: 1.3,
    cooldown: 1,
    description: '素早い風の斬撃。',
  },
  gale_strike: {
    id: 'gale_strike',
    name: '疾風撃',
    glyph: '💨',
    kind: 'buff',
    element: 'wind',
    power: 0,
    cooldown: 3,
    description: '3ターン攻撃力+30%。',
    effect: { status: 'haste', statusChance: 1.0, statusTurns: 3, selfTarget: true },
  },
  holy_light: {
    id: 'holy_light',
    name: '聖光',
    glyph: '✨',
    kind: 'attack',
    element: 'light',
    power: 1.5,
    cooldown: 2,
    description: '光属性の攻撃。闇の敵に特効。',
  },
  cleansing_ray: {
    id: 'cleansing_ray',
    name: '浄化光線',
    glyph: '🌟',
    kind: 'heal',
    element: 'light',
    power: 30,
    cooldown: 3,
    description: 'HPを30回復し、自身の状態異常を解除。',
    effect: { selfTarget: true },
  },
  dark_curse: {
    id: 'dark_curse',
    name: '呪詛',
    glyph: '🌑',
    kind: 'debuff',
    element: 'dark',
    power: 0.8,
    cooldown: 2,
    description: '敵に呪い付与。3ターン毎ターン6ダメージ。',
    effect: { status: 'curse', statusChance: 1.0, statusTurns: 3, statusPower: 6 },
  },
  shadow_pierce: {
    id: 'shadow_pierce',
    name: '影貫き',
    glyph: '🗡',
    kind: 'attack',
    element: 'dark',
    power: 1.4,
    cooldown: 2,
    description: '毒/呪い状態の敵に1.8倍ダメージ。',
    effect: { bonusVsStatus: 'poison', bonusMul: 1.8 },
  },
  heal_mist: {
    id: 'heal_mist',
    name: '癒しの霧',
    glyph: '💧',
    kind: 'heal',
    element: 'water',
    power: 25,
    cooldown: 2,
    description: 'HPを25回復する。',
    effect: { selfTarget: true },
  },
  frost_bind: {
    id: 'frost_bind',
    name: '氷結縛',
    glyph: '❄',
    kind: 'status_attack',
    element: 'water',
    power: 0.9,
    cooldown: 3,
    description: '50%で1ターン気絶させる。',
    effect: { status: 'stun', statusChance: 0.5, statusTurns: 1 },
  },
  mutation_chaos: {
    id: 'mutation_chaos',
    name: '【突】混沌の渦',
    glyph: '💀',
    kind: 'attack',
    power: 2.5,
    cooldown: 4,
    description: '突然変異。属性無視の超ダメージ。',
  },
  mutation_revive: {
    id: 'mutation_revive',
    name: '【突】不死の業',
    glyph: '💀',
    kind: 'heal',
    power: 60,
    cooldown: 5,
    description: '突然変異。HPを60回復し、シールド付与。',
    effect: { status: 'shield', statusChance: 1.0, statusTurns: 2, selfTarget: true },
  },
  mutation_doom: {
    id: 'mutation_doom',
    name: '【突】終焉の指',
    glyph: '💀',
    kind: 'status_attack',
    element: 'dark',
    power: 0.5,
    cooldown: 5,
    description: '突然変異。確定で呪い+毒+火傷の3重複合。',
    effect: { status: 'curse', statusChance: 1.0, statusTurns: 4, statusPower: 8 },
  },
  mutation_eclipse: {
    id: 'mutation_eclipse',
    name: '【突】皆既の刻',
    glyph: '💀',
    kind: 'attack',
    element: 'dark',
    power: 2.0,
    cooldown: 3,
    description: '突然変異。光属性敵に3倍。',
  },
};

export const MUTATION_SKILL_IDS: SkillId[] = [
  'mutation_chaos',
  'mutation_revive',
  'mutation_doom',
  'mutation_eclipse',
];

export const STATUS_LABEL: Record<StatusKind, string> = {
  poison: '毒',
  burn: '火傷',
  shield: '守護',
  haste: '加速',
  stun: '気絶',
  curse: '呪い',
};

export const STATUS_GLYPH: Record<StatusKind, string> = {
  poison: '🟢',
  burn: '🔥',
  shield: '🛡',
  haste: '💨',
  stun: '💫',
  curse: '🌑',
};
