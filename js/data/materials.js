// Materials — gathered from locations during dispatch. Quality applies to all.
// Quality keys: poor / norm / good / fine. Multiplier 0.6 / 1.0 / 1.3 / 1.6.

export const QUALITY_LEVELS = ["poor", "norm", "good", "fine"];
export const QUALITY_LABEL  = { poor: "粗悪", norm: "普通", good: "良質", fine: "極上" };
export const QUALITY_MULT   = { poor: 0.6, norm: 1.0, good: 1.3, fine: 1.6 };

export const MATERIALS = {
  // Plant
  herb:        { id: "herb",        name: "薬草",         tags: ["plant", "common"],   basePrice: 6 },
  fragrant:    { id: "fragrant",    name: "芳香草",       tags: ["plant"],             basePrice: 14 },
  moonleaf:    { id: "moonleaf",    name: "月花の葉",     tags: ["plant", "rare"],     basePrice: 38 },
  bramble:     { id: "bramble",     name: "茨の蔓",       tags: ["plant"],             basePrice: 10 },
  spore:       { id: "spore",       name: "胞子の塊",     tags: ["plant", "fungal"],   basePrice: 18 },
  ashroot:     { id: "ashroot",     name: "灰の根",       tags: ["plant", "fungal"],   basePrice: 22 },

  // Wood / fiber
  twig:        { id: "twig",        name: "枯れ枝",       tags: ["wood", "common"],    basePrice: 3 },
  oakwood:     { id: "oakwood",     name: "樫の幹",       tags: ["wood"],              basePrice: 12 },
  silkstrand:  { id: "silkstrand",  name: "森蜘蛛の糸",   tags: ["fiber"],             basePrice: 16 },

  // Mineral
  rough_stone: { id: "rough_stone", name: "礫",           tags: ["mineral", "common"], basePrice: 2 },
  iron_ore:    { id: "iron_ore",    name: "鉄鉱石",       tags: ["mineral"],           basePrice: 10 },
  silver_ore:  { id: "silver_ore",  name: "銀鉱石",       tags: ["mineral", "rare"],   basePrice: 30 },
  gold_dust:   { id: "gold_dust",   name: "砂金",         tags: ["mineral", "rare"],   basePrice: 45 },
  obsidian:    { id: "obsidian",    name: "黒曜石",       tags: ["mineral"],           basePrice: 22 },
  sulfur:      { id: "sulfur",      name: "硫黄",         tags: ["mineral"],           basePrice: 12 },

  // Magic
  weak_magicite:{id: "weak_magicite",name: "弱い魔石",   tags: ["magic"],             basePrice: 24 },
  magicite:    { id: "magicite",    name: "魔石",         tags: ["magic"],             basePrice: 60 },
  spirit_glass:{ id: "spirit_glass",name: "精霊硝子",     tags: ["magic", "rare"],     basePrice: 110 },
  rune_shard:  { id: "rune_shard",  name: "符の欠片",     tags: ["magic"],             basePrice: 35 },

  // Animal / monster
  pelt:        { id: "pelt",        name: "毛皮",         tags: ["animal"],            basePrice: 10 },
  fang:        { id: "fang",        name: "牙",           tags: ["animal"],            basePrice: 14 },
  bone:        { id: "bone",        name: "骨片",         tags: ["animal"],            basePrice: 8 },
  goblin_ear:  { id: "goblin_ear",  name: "鬼の耳",       tags: ["monster"],           basePrice: 18 },
  beast_horn:  { id: "beast_horn",  name: "獣の角",       tags: ["monster"],           basePrice: 32 },
  ice_scale:   { id: "ice_scale",   name: "氷竜の鱗",     tags: ["monster", "rare"],   basePrice: 95 },

  // Liquid / refined
  pure_water:  { id: "pure_water",  name: "清水",         tags: ["liquid", "common"],  basePrice: 4 },
  spring_dew:  { id: "spring_dew",  name: "泉の雫",       tags: ["liquid"],            basePrice: 16 },
  ether:       { id: "ether",       name: "霊液",         tags: ["liquid", "rare"],    basePrice: 65 },

  // Special
  ancient_rune:{ id: "ancient_rune",name: "古代の符",     tags: ["magic", "ruin"],     basePrice: 80 },
  legend_petal:{ id: "legend_petal",name: "伝説の花弁",   tags: ["plant", "legend"],   basePrice: 220 },

  // ── 中堅解禁：水霊の祠
  water_tear:  { id: "water_tear",  name: "水精の涙",     tags: ["liquid", "rare"],     basePrice: 95 },
  moon_coral:  { id: "moon_coral",  name: "月光珊瑚",     tags: ["mineral", "rare"],    basePrice: 120 },
  lotus_leaf:  { id: "lotus_leaf",  name: "蓮の葉",       tags: ["plant", "rare"],      basePrice: 70 },

  // ── 有名解禁：月影の塔
  moonstone:   { id: "moonstone",   name: "月光石",       tags: ["mineral", "rare"],    basePrice: 160 },
  star_shard:  { id: "star_shard",  name: "星の欠片",     tags: ["magic", "rare"],      basePrice: 200 },
  phantom_stone:{id:"phantom_stone",name: "朧霊石",       tags: ["magic", "rare"],      basePrice: 230 },

  // ── 伝説解禁：古竜の谷
  dragon_scale:{ id: "dragon_scale",name: "古竜の鱗",     tags: ["monster", "legend"],  basePrice: 380 },
  dragon_breath:{id:"dragon_breath",name: "龍息晶",       tags: ["magic", "legend"],    basePrice: 420 },
  primordial_rune:{id:"primordial_rune",name:"太古の符", tags: ["magic", "legend"],    basePrice: 450 },

  // ── ボス固有
  swamp_lord_pearl:{id:"swamp_lord_pearl",name:"沼の主の真珠", tags: ["monster","legend"], basePrice: 600 },
  phantom_essence:{id:"phantom_essence",name: "幻影の精髄", tags: ["magic","legend"],  basePrice: 700 },
  elder_dragon_horn:{id:"elder_dragon_horn",name:"古竜の角", tags: ["monster","legend"], basePrice: 1200 },
};

export function priceFor(materialId, quality) {
  const m = MATERIALS[materialId];
  if (!m) return 0;
  return Math.round(m.basePrice * (QUALITY_MULT[quality] || 1));
}

export function avgQuality(qualities) {
  if (!qualities.length) return "norm";
  const avg = qualities.reduce((s, q) => s + (QUALITY_MULT[q] || 1), 0) / qualities.length;
  if (avg < 0.8) return "poor";
  if (avg < 1.15) return "norm";
  if (avg < 1.45) return "good";
  return "fine";
}
