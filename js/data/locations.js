// Gathering locations. `gather` is the rolling table; `encounters` is the
// monster encounter pool. Class affinities boost gather chance for that class.

export const LOCATIONS = {
  forest: {
    id: "forest",
    name: "北の森",
    blurb: "穏やかな森。薬草と木の実が豊富、ときどき小鬼が出る。",
    danger: 1,
    encounterRate: 0.5,
    classAffinity: { herbalist: 1.30, thief: 1.10 },
    gather: [
      { mat: "herb",       w: 60, classBoost: { herbalist: 30 }, qBias: { norm: 4, good: 2 } },
      { mat: "twig",       w: 50, qBias: { norm: 5 } },
      { mat: "fragrant",   w: 22, classBoost: { herbalist: 18 } },
      { mat: "bramble",    w: 25 },
      { mat: "silkstrand", w: 18, classBoost: { thief: 14 } },
      { mat: "weak_magicite", w: 15, classBoost: { mage: 18 } },
      { mat: "pelt",       w: 18, classBoost: { warrior: 8 } },
      { mat: "moonleaf",   w: 4,  classBoost: { herbalist: 6 }, qBias: { good: 3, fine: 1 } },
    ],
    encounters: [
      { mob: "forest_wolf", w: 40 },
      { mob: "goblin",      w: 35 },
      { mob: "giant_spider",w: 25 },
    ],
  },

  cave: {
    id: "cave",
    name: "鉱の洞窟",
    blurb: "鉱脈と魔石の溜まり。ゴブリンや蝙蝠が巣食う。",
    danger: 2,
    encounterRate: 0.7,
    classAffinity: { warrior: 1.15 },
    gather: [
      { mat: "rough_stone", w: 70, qBias: { norm: 5 } },
      { mat: "iron_ore",   w: 45, classBoost: { warrior: 18 } },
      { mat: "silver_ore", w: 18, classBoost: { thief: 8 } },
      { mat: "obsidian",   w: 20 },
      { mat: "weak_magicite", w: 30, classBoost: { mage: 22 } },
      { mat: "magicite",   w: 10, classBoost: { mage: 15 } },
      { mat: "bone",       w: 15 },
      { mat: "fang",       w: 12 },
      { mat: "gold_dust",  w: 5,  qBias: { good: 2, fine: 1 } },
    ],
    encounters: [
      { mob: "goblin",     w: 35 },
      { mob: "cave_bat",   w: 35 },
      { mob: "rock_imp",   w: 30 },
    ],
  },

  ruins: {
    id: "ruins",
    name: "忘れ去られた遺跡",
    blurb: "符と古の硝子が眠る場所。亡霊と魔像が徘徊する。",
    danger: 3,
    encounterRate: 0.85,
    classAffinity: { mage: 1.25, thief: 1.10 },
    gather: [
      { mat: "rough_stone",  w: 35 },
      { mat: "rune_shard",   w: 35, classBoost: { mage: 20 } },
      { mat: "ancient_rune", w: 12, classBoost: { mage: 12 } },
      { mat: "spirit_glass", w: 6,  classBoost: { mage: 10 } },
      { mat: "bone",         w: 25 },
      { mat: "obsidian",     w: 20 },
      { mat: "magicite",     w: 18 },
    ],
    encounters: [
      { mob: "wraith",       w: 40 },
      { mob: "stone_golem",  w: 30 },
      { mob: "rune_imp",     w: 30 },
    ],
  },

  marsh: {
    id: "marsh",
    name: "霧の湿原",
    blurb: "胞子と霊液が漂う。蛇と毒蛙が獲物を狙う。",
    danger: 2,
    encounterRate: 0.6,
    classAffinity: { herbalist: 1.20 },
    gather: [
      { mat: "spore",     w: 55, classBoost: { herbalist: 22 } },
      { mat: "ashroot",   w: 35 },
      { mat: "bramble",   w: 30 },
      { mat: "spring_dew",w: 32, classBoost: { herbalist: 14 } },
      { mat: "ether",     w: 12, classBoost: { herbalist: 8 } },
      { mat: "silkstrand",w: 20 },
      { mat: "fang",      w: 15 },
      { mat: "sulfur",    w: 18 },
    ],
    encounters: [
      { mob: "marsh_serpent", w: 45 },
      { mob: "poison_frog",   w: 35 },
      { mob: "swamp_wraith",  w: 20 },
    ],
  },

  mountain: {
    id: "mountain",
    name: "雪の高峰",
    blurb: "氷と硫黄、伝説の花弁が眠る危険な山。",
    danger: 4,
    encounterRate: 0.95,
    classAffinity: { warrior: 1.10, mage: 1.10 },
    gather: [
      { mat: "rough_stone", w: 30 },
      { mat: "iron_ore",    w: 25 },
      { mat: "silver_ore",  w: 22 },
      { mat: "gold_dust",   w: 15 },
      { mat: "sulfur",      w: 30 },
      { mat: "ice_scale",   w: 14, qBias: { good: 3, fine: 2 } },
      { mat: "beast_horn",  w: 25 },
      { mat: "moonleaf",    w: 12 },
      { mat: "legend_petal",w: 3,  qBias: { fine: 4 } },
      { mat: "ether",       w: 10 },
    ],
    encounters: [
      { mob: "ice_wolf",    w: 35 },
      { mob: "frost_imp",   w: 30 },
      { mob: "yeti_youngling", w: 20 },
      { mob: "wyvern_kit",  w: 15 },
    ],
  },

  // ── 中堅で解禁
  spirit_shrine: {
    id: "spirit_shrine",
    name: "水霊の祠",
    blurb: "水精と月光珊瑚が眠る霊地。水霊と月光殻の蟹が棲む。",
    danger: 3,
    encounterRate: 0.8,
    unlockTier: 1,
    classAffinity: { herbalist: 1.20, mage: 1.15 },
    gather: [
      { mat: "water_tear",   w: 25, classBoost: { herbalist: 18, mage: 12 }, qBias: { good: 3, fine: 1 } },
      { mat: "moon_coral",   w: 18, classBoost: { thief: 10 } },
      { mat: "lotus_leaf",   w: 30, classBoost: { herbalist: 16 } },
      { mat: "spring_dew",   w: 35 },
      { mat: "ether",        w: 20 },
      { mat: "rune_shard",   w: 18 },
      { mat: "moonleaf",     w: 12, qBias: { good: 3, fine: 1 } },
    ],
    encounters: [
      { mob: "water_sprite",   w: 38 },
      { mob: "moonshell_crab", w: 32 },
      { mob: "marsh_serpent",  w: 18 },
      { mob: "swamp_lord",     w: 12, bossGate: 2 }, // 評判 有名(2)+ で出現可能
    ],
  },

  // ── 有名で解禁
  moon_tower: {
    id: "moon_tower",
    name: "月影の塔",
    blurb: "幻影と星の欠片が舞う古塔。亡霊と星詠みの蛇が回廊を巡る。",
    danger: 4,
    encounterRate: 0.9,
    unlockTier: 2,
    classAffinity: { mage: 1.30, thief: 1.10 },
    gather: [
      { mat: "moonstone",      w: 22, classBoost: { mage: 14 }, qBias: { good: 2, fine: 1 } },
      { mat: "star_shard",     w: 15, classBoost: { mage: 18 } },
      { mat: "phantom_stone",  w: 12, classBoost: { mage: 18 } },
      { mat: "ancient_rune",   w: 18 },
      { mat: "spirit_glass",   w: 12 },
      { mat: "magicite",       w: 22 },
      { mat: "ether",          w: 14 },
      { mat: "silver_ore",     w: 14 },
    ],
    encounters: [
      { mob: "tower_specter", w: 35 },
      { mob: "star_serpent",  w: 30 },
      { mob: "wraith",        w: 20 },
      { mob: "rune_imp",      w: 15 },
      { mob: "phantom_warden",w: 8, bossGate: 3 }, // 伝説 で出現可能
    ],
  },

  // ── 伝説で解禁
  dragon_vale: {
    id: "dragon_vale",
    name: "古竜の谷",
    blurb: "若竜と符竜が舞い、太古の符が岩肌に焼き付く伝説の地。",
    danger: 5,
    encounterRate: 0.95,
    unlockTier: 3,
    classAffinity: { warrior: 1.15, mage: 1.20 },
    gather: [
      { mat: "dragon_scale",     w: 18, qBias: { good: 3, fine: 2 } },
      { mat: "dragon_breath",    w: 12, qBias: { good: 2, fine: 2 } },
      { mat: "primordial_rune",  w: 14 },
      { mat: "ancient_rune",     w: 18 },
      { mat: "magicite",         w: 18 },
      { mat: "ether",            w: 14 },
      { mat: "ice_scale",        w: 12 },
      { mat: "legend_petal",     w: 8,  qBias: { fine: 4 } },
    ],
    encounters: [
      { mob: "young_dragon", w: 35 },
      { mob: "rune_drake",   w: 35 },
      { mob: "wyvern_kit",   w: 20 },
      { mob: "elder_dragon", w: 10, bossGate: 3 }, // 伝説 で出現可能
    ],
  },
};

export const LOCATION_ORDER = ["forest", "cave", "marsh", "ruins", "mountain", "spirit_shrine", "moon_tower", "dragon_vale"];

// Pure water always ambient (no roll required) — small chance everywhere.
export const AMBIENT_DROP = { mat: "pure_water", w: 18 };

// Quality bias defaults if a location doesn't specify.
export const DEFAULT_Q_BIAS = { poor: 2, norm: 6, good: 1.5, fine: 0.4 };
