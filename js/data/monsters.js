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
};
