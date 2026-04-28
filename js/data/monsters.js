// Monster definitions for encounters during dispatch.
// `element` defines what attribute they take damage *as if of*. Spells with
// the right element apply ×1.5 (or ×0.7 if weak) per data/elements.js.

export const MONSTERS = {
  forest_wolf:    { id: "forest_wolf",    name: "森狼",         element: "wind",  hp: 16, atk: 4, def: 1, exp: 12, drops: [{ mat: "fang", p: 0.45 }, { mat: "pelt", p: 0.55 }] },
  goblin:         { id: "goblin",         name: "ゴブリン",     element: "none",  hp: 14, atk: 3, def: 1, exp: 10, drops: [{ mat: "goblin_ear", p: 0.55 }, { mat: "twig", p: 0.4 }] },
  giant_spider:   { id: "giant_spider",   name: "大蜘蛛",       element: "dark",  hp: 18, atk: 4, def: 1, exp: 14, drops: [{ mat: "silkstrand", p: 0.60 }, { mat: "fang", p: 0.30 }] },

  cave_bat:       { id: "cave_bat",       name: "洞窟蝙蝠",     element: "dark",  hp: 12, atk: 3, def: 0, exp: 9,  drops: [{ mat: "fang", p: 0.40 }, { mat: "bone", p: 0.40 }] },
  rock_imp:       { id: "rock_imp",       name: "岩の小鬼",     element: "fire",  hp: 22, atk: 5, def: 3, exp: 18, drops: [{ mat: "rough_stone", p: 0.6 }, { mat: "weak_magicite", p: 0.30 }] },

  marsh_serpent:  { id: "marsh_serpent",  name: "湿原の蛇",     element: "water", hp: 24, atk: 5, def: 2, exp: 18, drops: [{ mat: "fang", p: 0.55 }, { mat: "spring_dew", p: 0.35 }] },
  poison_frog:    { id: "poison_frog",    name: "毒蛙",         element: "water", hp: 18, atk: 4, def: 1, exp: 14, drops: [{ mat: "spore", p: 0.55 }, { mat: "sulfur", p: 0.35 }] },
  swamp_wraith:   { id: "swamp_wraith",   name: "湿原の亡霊",   element: "dark",  hp: 30, atk: 6, def: 2, exp: 26, drops: [{ mat: "ether", p: 0.30 }, { mat: "rune_shard", p: 0.30 }] },

  wraith:         { id: "wraith",         name: "亡霊",         element: "dark",  hp: 28, atk: 6, def: 2, exp: 24, drops: [{ mat: "rune_shard", p: 0.45 }, { mat: "ether", p: 0.25 }] },
  stone_golem:    { id: "stone_golem",    name: "石の魔像",     element: "none",  hp: 42, atk: 5, def: 6, exp: 32, drops: [{ mat: "rough_stone", p: 0.7 }, { mat: "ancient_rune", p: 0.30 }, { mat: "spirit_glass", p: 0.10 }] },
  rune_imp:       { id: "rune_imp",       name: "符の小鬼",     element: "light", hp: 22, atk: 6, def: 2, exp: 22, drops: [{ mat: "rune_shard", p: 0.6 }, { mat: "magicite", p: 0.25 }] },

  ice_wolf:       { id: "ice_wolf",       name: "氷狼",         element: "water", hp: 30, atk: 7, def: 2, exp: 30, drops: [{ mat: "fang", p: 0.55 }, { mat: "pelt", p: 0.55 }] },
  frost_imp:      { id: "frost_imp",      name: "氷の小鬼",     element: "water", hp: 26, atk: 6, def: 3, exp: 28, drops: [{ mat: "ice_scale", p: 0.20 }, { mat: "magicite", p: 0.30 }] },
  yeti_youngling: { id: "yeti_youngling", name: "雪人の仔",     element: "wind",  hp: 44, atk: 8, def: 4, exp: 44, drops: [{ mat: "pelt", p: 0.65 }, { mat: "beast_horn", p: 0.40 }] },
  wyvern_kit:     { id: "wyvern_kit",     name: "幼飛竜",       element: "fire",  hp: 50, atk: 9, def: 5, exp: 60, drops: [{ mat: "ice_scale", p: 0.55 }, { mat: "beast_horn", p: 0.45 }, { mat: "magicite", p: 0.30 }] },

  // ── 水霊の祠（中堅）
  water_sprite:   { id: "water_sprite",   name: "水霊",         element: "water", hp: 28, atk: 6, def: 2, exp: 26, drops: [{ mat: "water_tear", p: 0.45 }, { mat: "spring_dew", p: 0.5 }] },
  moonshell_crab: { id: "moonshell_crab", name: "月光殻の蟹",   element: "water", hp: 36, atk: 6, def: 5, exp: 30, drops: [{ mat: "moon_coral", p: 0.40 }, { mat: "rough_stone", p: 0.5 }] },
  swamp_lord:     { id: "swamp_lord",     name: "沼の主・大蛙", element: "water", hp: 110, atk: 12, def: 6, exp: 200, boss: true, drops: [{ mat: "swamp_lord_pearl", p: 1.0 }, { mat: "water_tear", p: 0.8 }, { mat: "moon_coral", p: 0.6 }] },

  // ── 月影の塔（有名）
  tower_specter:  { id: "tower_specter",  name: "塔の亡霊",     element: "dark",  hp: 45, atk: 9, def: 3, exp: 50, drops: [{ mat: "phantom_stone", p: 0.30 }, { mat: "rune_shard", p: 0.55 }] },
  star_serpent:   { id: "star_serpent",   name: "星詠みの蛇",   element: "light", hp: 50, atk: 10, def: 4, exp: 60, drops: [{ mat: "star_shard", p: 0.30 }, { mat: "moonstone", p: 0.40 }] },
  phantom_warden: { id: "phantom_warden", name: "塔の主・幻影使い", element: "dark", hp: 160, atk: 14, def: 8, exp: 320, boss: true, drops: [{ mat: "phantom_essence", p: 1.0 }, { mat: "phantom_stone", p: 0.9 }, { mat: "star_shard", p: 0.7 }] },

  // ── 古竜の谷（伝説）
  young_dragon:   { id: "young_dragon",   name: "若竜",         element: "fire",  hp: 90, atk: 13, def: 7, exp: 140, drops: [{ mat: "dragon_scale", p: 0.45 }, { mat: "ice_scale", p: 0.4 }] },
  rune_drake:     { id: "rune_drake",     name: "符竜",         element: "light", hp: 80, atk: 12, def: 6, exp: 130, drops: [{ mat: "primordial_rune", p: 0.30 }, { mat: "ancient_rune", p: 0.55 }] },
  elder_dragon:   { id: "elder_dragon",   name: "古竜",         element: "fire",  hp: 240, atk: 18, def: 10, exp: 600, boss: true, drops: [{ mat: "elder_dragon_horn", p: 1.0 }, { mat: "dragon_breath", p: 0.9 }, { mat: "dragon_scale", p: 1.0 }] },
};
