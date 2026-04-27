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
};

export const LOCATION_ORDER = ["forest", "cave", "marsh", "ruins", "mountain"];

// Pure water always ambient (no roll required) — small chance everywhere.
export const AMBIENT_DROP = { mat: "pure_water", w: 18 };

// Quality bias defaults if a location doesn't specify.
export const DEFAULT_Q_BIAS = { poor: 2, norm: 6, good: 1.5, fine: 0.4 };
