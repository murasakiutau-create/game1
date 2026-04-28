// Recipes — input materials → output item with quality.
// `category` drives shop demand. `tier` 1-5 affects price and rep gain.
// `unlocked: true` means available from start; others come via research.

export const ITEMS = {
  // Potions / consumables
  herb_potion:    { id: "herb_potion",    name: "薬草ポーション",   cat: "potion",  basePrice: 32,  blurb: "傷を癒す基礎の調合。" },
  healing_potion: { id: "healing_potion", name: "治癒の薬",         cat: "potion",  basePrice: 75,  blurb: "出血を素早く止める処方。" },
  greater_potion: { id: "greater_potion", name: "上級治癒薬",       cat: "potion",  basePrice: 180, blurb: "再生の種を含む高位回復薬。" },
  mana_draught:   { id: "mana_draught",   name: "魔力の杯",         cat: "potion",  basePrice: 110, blurb: "詠唱者の喉を潤す霊液。" },
  antidote:       { id: "antidote",       name: "解毒水",           cat: "potion",  basePrice: 60,  blurb: "胞子と蛇毒に効く。" },
  ether_phial:    { id: "ether_phial",    name: "霊液の小瓶",       cat: "potion",  basePrice: 240, blurb: "薄められた純粋霊液。" },
  legend_elixir:  { id: "legend_elixir",  name: "伝説のエリクサ",   cat: "potion",  basePrice: 1400,blurb: "万病を祓うとされる霊薬。" },

  // Equipment crafting (these write into player inventory as `eq:` ids in saves)
  iron_sword_item:    { id: "iron_sword_item",    name: "鉄の剣",     cat: "weapon", basePrice: 220,  blurb: "汎用の鉄剣。", grantsEquip: "iron_sword" },
  silver_sword_item:  { id: "silver_sword_item",  name: "銀の長剣",   cat: "weapon", basePrice: 620,  blurb: "魔を退ける鈍い輝き。", grantsEquip: "silver_sword" },
  battle_axe_item:    { id: "battle_axe_item",    name: "戦斧",       cat: "weapon", basePrice: 280,  blurb: "重く頼もしい両手斧。", grantsEquip: "battle_axe" },
  rune_staff_item:    { id: "rune_staff_item",    name: "刻印の杖",   cat: "weapon", basePrice: 680,  blurb: "杖頭に符を刻んだ魔導具。", grantsEquip: "rune_staff" },
  silvered_dagger_item:{id:"silvered_dagger_item",name: "銀めっき短剣", cat: "weapon", basePrice: 540, blurb: "銀を被せた静かな刃。", grantsEquip: "silvered_dagger" },
  hunting_bow_item:   { id: "hunting_bow_item",   name: "狩人弓",     cat: "weapon", basePrice: 380,  blurb: "弓手のための鍛えた長弓。", grantsEquip: "hunting_bow" },
  woodaxe_item:       { id: "woodaxe_item",       name: "杣の斧",     cat: "weapon", basePrice: 240,  blurb: "枝も幹も切り倒す杣斧。", grantsEquip: "woodaxe" },
  pickaxe_item:       { id: "pickaxe_item",       name: "ツルハシ",   cat: "weapon", basePrice: 180,  blurb: "鉱脈を砕く実用品。", grantsEquip: "pickaxe" },
  master_pickaxe_item:{ id: "master_pickaxe_item",name: "鋼のツルハシ", cat:"weapon", basePrice: 520,  blurb: "鋼鉄を打って作った高級品。", grantsEquip: "master_pickaxe" },
  steel_plate_item:   { id: "steel_plate_item",   name: "鋼の胸甲",   cat: "armor",  basePrice: 580,  blurb: "重く堅牢な胸当て。", grantsEquip: "steel_plate" },
  iron_mail_item:     { id: "iron_mail_item",     name: "鉄の鎖帷子", cat: "armor",  basePrice: 320,  blurb: "鎖を密に編んだ防具。", grantsEquip: "iron_mail" },
  leather_vest_item:  { id: "leather_vest_item",  name: "革のベスト", cat: "armor",  basePrice: 140,  blurb: "軽く動きやすい革。", grantsEquip: "leather_vest" },
  cloth_robe_item:    { id: "cloth_robe_item",    name: "亜麻のローブ", cat:"armor", basePrice: 80,   blurb: "飾り気のない実用着。", grantsEquip: "cloth_robe" },
  lucky_charm_item:   { id: "lucky_charm_item",   name: "兎の足のお守り", cat:"trinket", basePrice: 95, blurb: "幸運のお守り。", grantsEquip: "lucky_charm" },
  miners_lamp_item:   { id: "miners_lamp_item",   name: "坑夫の角灯",  cat: "trinket", basePrice: 130, blurb: "鉱脈を照らす灯。", grantsEquip: "miners_lamp" },
  crystal_pendant_item:{ id:"crystal_pendant_item",name:"結晶の首飾り", cat: "trinket", basePrice: 240, blurb: "魔力を整える結晶。", grantsEquip: "crystal_pendant" },

  // Spellbooks (item which when consumed teaches spell)
  book_holy_seal:    { id: "book_holy_seal",    name: "頁・聖印",      cat: "tome",  basePrice: 240, blurb: "光で傷を塞ぐ騎士の祈り。", grantsSpell: "holy_seal" },
  book_light_smite:  { id: "book_light_smite",  name: "頁・光輝の刃",  cat: "tome",  basePrice: 320, blurb: "光属性の高威力一撃。", grantsSpell: "light_smite" },
  book_divine_ward:  { id: "book_divine_ward",  name: "頁・聖域の祈り", cat:"tome",  basePrice: 280, blurb: "結界による被害軽減。", grantsSpell: "divine_ward" },
  book_fire_lance:   { id: "book_fire_lance",   name: "頁・焔の槍",    cat: "tome",  basePrice: 380, blurb: "高位の火属性魔法。", grantsSpell: "fire_lance" },
  book_gale_cutter:  { id: "book_gale_cutter",  name: "頁・風刃",      cat: "tome",  basePrice: 280, blurb: "風刃で敵を裂く。", grantsSpell: "gale_cutter" },
  book_night_blade:  { id: "book_night_blade",  name: "頁・夜の刃",    cat: "tome",  basePrice: 320, blurb: "闇属性の鋭い斬撃。", grantsSpell: "night_blade" },
  book_cure_chant:   { id: "book_cure_chant",   name: "頁・癒しの詠唱", cat:"tome",  basePrice: 320, blurb: "光で広く癒す詠唱。", grantsSpell: "cure_chant" },
  book_self_mend:    { id: "book_self_mend",    name: "頁・自己手当",  cat: "tome",  basePrice: 180, blurb: "自身を癒す秘伝。", grantsSpell: "self_mend" },
  book_battle_aura:  { id: "book_battle_aura",  name: "頁・闘気",      cat: "tome",  basePrice: 220, blurb: "気を昂ぶらせる呪文。", grantsSpell: "battle_aura" },
  book_iron_skin:    { id: "book_iron_skin",    name: "頁・鉄壁",      cat: "tome",  basePrice: 240, blurb: "皮膚を硬化させる呪文。", grantsSpell: "iron_skin" },
  book_spark:        { id: "book_spark",        name: "頁・火花",      cat: "tome",  basePrice: 200, blurb: "炎を撒く初歩の呪文。", grantsSpell: "spark" },
  book_frost_bolt:   { id: "book_frost_bolt",   name: "頁・氷の矢",    cat: "tome",  basePrice: 360, blurb: "凍れる矢の中位魔法。", grantsSpell: "frost_bolt" },
  book_arcane_pulse: { id: "book_arcane_pulse", name: "頁・魔導の波",  cat: "tome",  basePrice: 320, blurb: "魔力の脈動。", grantsSpell: "arcane_pulse" },
  book_thorn_balm:   { id: "book_thorn_balm",   name: "頁・茨の癒し",  cat: "tome",  basePrice: 260, blurb: "薬草に宿る癒しの言葉。", grantsSpell: "thorn_balm" },
  book_rebirth_seed: { id: "book_rebirth_seed", name: "頁・再生の種",  cat: "tome",  basePrice: 540, blurb: "命を繋ぐ秘術。", grantsSpell: "rebirth_seed" },
  book_shadow_step:  { id: "book_shadow_step",  name: "頁・闇隠れ",    cat: "tome",  basePrice: 240, blurb: "影に紛れる技。", grantsSpell: "shadow_step" },
  book_smoke_veil:   { id: "book_smoke_veil",   name: "頁・煙幕",      cat: "tome",  basePrice: 180, blurb: "煙の幕で目を眩ませる。", grantsSpell: "smoke_veil" },
  book_bramble_call: { id: "book_bramble_call", name: "頁・茨蔓の呼び", cat:"tome",  basePrice: 280, blurb: "蔓に語りかけ操る。", grantsSpell: "bramble_call" },
  book_prospect_wind:{ id: "book_prospect_wind",name: "頁・採掘の風",   cat:"tome",  basePrice: 220, blurb: "鉱脈を探る風の呪文。", grantsSpell: "prospect_wind" },

  // ── 上位（評判解禁素材を使う高位レシピ）
  spirit_potion:    { id: "spirit_potion",    name: "水霊の薬",       cat: "potion",  basePrice: 380,  blurb: "水精の力で深い傷を癒す。" },
  moonlight_robe_item:{id:"moonlight_robe_item",name:"月光のローブ",   cat: "armor",   basePrice: 720,  blurb: "月光珊瑚を織り込んだ防具。", grantsEquip: "moonlight_robe" },
  moonlight_staff_item:{id:"moonlight_staff_item",name:"月光の杖",     cat: "weapon",  basePrice: 920,  blurb: "月光石を頂に据えた魔導の杖。", grantsEquip: "moonlight_staff" },
  starlit_amulet_item:{id:"starlit_amulet_item",name:"星辰のお守り",   cat: "trinket", basePrice: 480,  blurb: "星の欠片を埋め込んだ護符。", grantsEquip: "starlit_amulet" },
  book_phantom_clone:{id:"book_phantom_clone",name:"頁・朧分身",       cat: "tome",    basePrice: 540,  blurb: "影に分かれて敵を惑わす技。", grantsSpell: "phantom_clone" },
  dragon_scale_mail_item:{id:"dragon_scale_mail_item",name:"古竜の鱗鎧", cat:"armor",  basePrice: 1480, blurb: "古竜の鱗を縫い込んだ最高位の鎧。", grantsEquip: "dragon_scale_mail" },
  dragon_elixir:    { id: "dragon_elixir",    name: "龍息のエリクサ", cat: "potion",  basePrice: 2200, blurb: "全傷癒しと一時的な無敵を授ける。" },
  book_dragon_breath:{id:"book_dragon_breath",name:"頁・龍息",         cat: "tome",    basePrice: 980,  blurb: "龍の息吹を再現する超高位呪文。", grantsSpell: "dragon_breath_spell" },
};

export const RECIPES = {
  herb_potion: {
    id: "herb_potion", name: "薬草ポーション", out: "herb_potion", tier: 1, unlocked: true,
    inputs: [ { mat: "herb", n: 2 }, { mat: "pure_water", n: 1 } ],
    research: 0,
  },
  healing_potion: {
    id: "healing_potion", name: "治癒の薬", out: "healing_potion", tier: 2, unlocked: true,
    inputs: [ { mat: "herb", n: 2 }, { mat: "fragrant", n: 1 }, { mat: "spring_dew", n: 1 } ],
    research: 0,
  },
  antidote: {
    id: "antidote", name: "解毒水", out: "antidote", tier: 2, unlocked: true,
    inputs: [ { mat: "ashroot", n: 1 }, { mat: "spore", n: 1 }, { mat: "pure_water", n: 1 } ],
    research: 0,
  },
  greater_potion: {
    id: "greater_potion", name: "上級治癒薬", out: "greater_potion", tier: 3, unlocked: false,
    inputs: [ { mat: "moonleaf", n: 1 }, { mat: "fragrant", n: 2 }, { mat: "spring_dew", n: 1 } ],
    research: 80,
  },
  mana_draught: {
    id: "mana_draught", name: "魔力の杯", out: "mana_draught", tier: 3, unlocked: false,
    inputs: [ { mat: "weak_magicite", n: 1 }, { mat: "spring_dew", n: 1 }, { mat: "rune_shard", n: 1 } ],
    research: 60,
  },
  ether_phial: {
    id: "ether_phial", name: "霊液の小瓶", out: "ether_phial", tier: 4, unlocked: false,
    inputs: [ { mat: "ether", n: 1 }, { mat: "spirit_glass", n: 1 } ],
    research: 200,
  },
  legend_elixir: {
    id: "legend_elixir", name: "伝説のエリクサ", out: "legend_elixir", tier: 5, unlocked: false,
    inputs: [ { mat: "legend_petal", n: 1 }, { mat: "ether", n: 1 }, { mat: "ancient_rune", n: 1 }, { mat: "spirit_glass", n: 1 } ],
    research: 600,
  },

  iron_sword: {
    id: "iron_sword", name: "鉄の剣", out: "iron_sword_item", tier: 2, unlocked: true,
    inputs: [ { mat: "iron_ore", n: 3 }, { mat: "oakwood", n: 1 } ],
    research: 0,
  },
  silver_sword: {
    id: "silver_sword", name: "銀の長剣", out: "silver_sword_item", tier: 4, unlocked: false,
    inputs: [ { mat: "silver_ore", n: 3 }, { mat: "oakwood", n: 1 }, { mat: "rune_shard", n: 1 } ],
    research: 220,
  },
  battle_axe: {
    id: "battle_axe", name: "戦斧", out: "battle_axe_item", tier: 2, unlocked: false,
    inputs: [ { mat: "iron_ore", n: 4 }, { mat: "oakwood", n: 2 } ],
    research: 60,
  },
  rune_staff: {
    id: "rune_staff", name: "刻印の杖", out: "rune_staff_item", tier: 3, unlocked: false,
    inputs: [ { mat: "oakwood", n: 1 }, { mat: "rune_shard", n: 2 }, { mat: "magicite", n: 1 } ],
    research: 140,
  },
  silvered_dagger: {
    id: "silvered_dagger", name: "銀めっき短剣", out: "silvered_dagger_item", tier: 3, unlocked: false,
    inputs: [ { mat: "silver_ore", n: 2 }, { mat: "obsidian", n: 1 } ],
    research: 100,
  },
  hunting_bow: {
    id: "hunting_bow", name: "狩人弓", out: "hunting_bow_item", tier: 2, unlocked: false,
    inputs: [ { mat: "oakwood", n: 2 }, { mat: "silkstrand", n: 2 }, { mat: "fang", n: 1 } ],
    research: 80,
  },
  woodaxe: {
    id: "woodaxe", name: "杣の斧", out: "woodaxe_item", tier: 1, unlocked: true,
    inputs: [ { mat: "iron_ore", n: 2 }, { mat: "oakwood", n: 1 } ],
    research: 0,
  },
  pickaxe: {
    id: "pickaxe", name: "ツルハシ", out: "pickaxe_item", tier: 1, unlocked: true,
    inputs: [ { mat: "iron_ore", n: 2 }, { mat: "oakwood", n: 1 }, { mat: "rough_stone", n: 1 } ],
    research: 0,
  },
  master_pickaxe: {
    id: "master_pickaxe", name: "鋼のツルハシ", out: "master_pickaxe_item", tier: 3, unlocked: false,
    inputs: [ { mat: "iron_ore", n: 4 }, { mat: "obsidian", n: 1 }, { mat: "sulfur", n: 1 }, { mat: "oakwood", n: 1 } ],
    research: 180,
  },

  iron_mail: {
    id: "iron_mail", name: "鉄の鎖帷子", out: "iron_mail_item", tier: 2, unlocked: true,
    inputs: [ { mat: "iron_ore", n: 4 } ],
    research: 0,
  },
  steel_plate: {
    id: "steel_plate", name: "鋼の胸甲", out: "steel_plate_item", tier: 4, unlocked: false,
    inputs: [ { mat: "iron_ore", n: 6 }, { mat: "obsidian", n: 1 }, { mat: "sulfur", n: 1 } ],
    research: 240,
  },
  leather_vest: {
    id: "leather_vest", name: "革のベスト", out: "leather_vest_item", tier: 1, unlocked: true,
    inputs: [ { mat: "pelt", n: 2 }, { mat: "silkstrand", n: 1 } ],
    research: 0,
  },
  cloth_robe: {
    id: "cloth_robe", name: "亜麻のローブ", out: "cloth_robe_item", tier: 1, unlocked: true,
    inputs: [ { mat: "silkstrand", n: 3 } ],
    research: 0,
  },

  lucky_charm: {
    id: "lucky_charm", name: "兎の足のお守り", out: "lucky_charm_item", tier: 2, unlocked: false,
    inputs: [ { mat: "pelt", n: 1 }, { mat: "fang", n: 1 }, { mat: "rune_shard", n: 1 } ],
    research: 80,
  },
  miners_lamp: {
    id: "miners_lamp", name: "坑夫の角灯", out: "miners_lamp_item", tier: 2, unlocked: false,
    inputs: [ { mat: "iron_ore", n: 1 }, { mat: "sulfur", n: 1 }, { mat: "oakwood", n: 1 } ],
    research: 90,
  },
  crystal_pendant: {
    id: "crystal_pendant", name: "結晶の首飾り", out: "crystal_pendant_item", tier: 3, unlocked: false,
    inputs: [ { mat: "magicite", n: 1 }, { mat: "silkstrand", n: 1 } ],
    research: 160,
  },

  // Spellbook recipes
  book_self_mend:    { id: "book_self_mend",    name: "頁・自己手当",  out: "book_self_mend",    tier: 2, unlocked: true,
                       inputs: [ { mat: "herb", n: 2 }, { mat: "silkstrand", n: 1 }, { mat: "rune_shard", n: 1 } ], research: 0 },
  book_battle_aura:  { id: "book_battle_aura",  name: "頁・闘気",      out: "book_battle_aura",  tier: 2, unlocked: false,
                       inputs: [ { mat: "fang", n: 1 }, { mat: "rune_shard", n: 1 }, { mat: "sulfur", n: 1 } ], research: 80 },
  book_iron_skin:    { id: "book_iron_skin",    name: "頁・鉄壁",      out: "book_iron_skin",    tier: 2, unlocked: false,
                       inputs: [ { mat: "iron_ore", n: 1 }, { mat: "rune_shard", n: 1 }, { mat: "silkstrand", n: 1 } ], research: 120 },
  book_spark:        { id: "book_spark",        name: "頁・火花",      out: "book_spark",        tier: 2, unlocked: true,
                       inputs: [ { mat: "sulfur", n: 1 }, { mat: "rune_shard", n: 1 }, { mat: "weak_magicite", n: 1 } ], research: 0 },
  book_frost_bolt:   { id: "book_frost_bolt",   name: "頁・氷の矢",    out: "book_frost_bolt",   tier: 3, unlocked: false,
                       inputs: [ { mat: "magicite", n: 1 }, { mat: "rune_shard", n: 2 }, { mat: "spring_dew", n: 1 } ], research: 180 },
  book_arcane_pulse: { id: "book_arcane_pulse", name: "頁・魔導の波",  out: "book_arcane_pulse", tier: 3, unlocked: false,
                       inputs: [ { mat: "magicite", n: 1 }, { mat: "rune_shard", n: 2 } ], research: 140 },
  book_thorn_balm:   { id: "book_thorn_balm",   name: "頁・茨の癒し",  out: "book_thorn_balm",   tier: 2, unlocked: true,
                       inputs: [ { mat: "bramble", n: 2 }, { mat: "fragrant", n: 1 }, { mat: "rune_shard", n: 1 } ], research: 0 },
  book_rebirth_seed: { id: "book_rebirth_seed", name: "頁・再生の種",  out: "book_rebirth_seed", tier: 4, unlocked: false,
                       inputs: [ { mat: "moonleaf", n: 1 }, { mat: "ether", n: 1 }, { mat: "rune_shard", n: 2 } ], research: 320 },
  book_shadow_step:  { id: "book_shadow_step",  name: "頁・闇隠れ",    out: "book_shadow_step",  tier: 2, unlocked: false,
                       inputs: [ { mat: "obsidian", n: 1 }, { mat: "silkstrand", n: 1 }, { mat: "rune_shard", n: 1 } ], research: 100 },
  book_smoke_veil:   { id: "book_smoke_veil",   name: "頁・煙幕",      out: "book_smoke_veil",   tier: 1, unlocked: true,
                       inputs: [ { mat: "sulfur", n: 1 }, { mat: "spore", n: 1 }, { mat: "rune_shard", n: 1 } ], research: 0 },
  book_bramble_call: { id: "book_bramble_call", name: "頁・茨蔓の呼び", out: "book_bramble_call", tier: 3, unlocked: false,
                       inputs: [ { mat: "bramble", n: 3 }, { mat: "rune_shard", n: 1 }, { mat: "magicite", n: 1 } ], research: 160 },
  book_prospect_wind:{ id: "book_prospect_wind",name: "頁・採掘の風",  out: "book_prospect_wind",tier: 2, unlocked: false,
                       inputs: [ { mat: "weak_magicite", n: 1 }, { mat: "rune_shard", n: 1 }, { mat: "twig", n: 2 } ], research: 100 },

  book_holy_seal: { id: "book_holy_seal", name: "頁・聖印", out: "book_holy_seal", tier: 3, unlocked: false,
                    inputs: [ { mat: "rune_shard", n: 2 }, { mat: "silver_ore", n: 1 }, { mat: "spring_dew", n: 1 } ], research: 160 },
  book_light_smite: { id: "book_light_smite", name: "頁・光輝の刃", out: "book_light_smite", tier: 4, unlocked: false,
                    inputs: [ { mat: "ancient_rune", n: 1 }, { mat: "silver_ore", n: 2 }, { mat: "spirit_glass", n: 1 } ], research: 280 },
  book_divine_ward: { id: "book_divine_ward", name: "頁・聖域の祈り", out: "book_divine_ward", tier: 3, unlocked: false,
                    inputs: [ { mat: "rune_shard", n: 2 }, { mat: "silkstrand", n: 1 }, { mat: "moonleaf", n: 1 } ], research: 200 },
  book_fire_lance: { id: "book_fire_lance", name: "頁・焔の槍", out: "book_fire_lance", tier: 4, unlocked: false,
                    inputs: [ { mat: "magicite", n: 2 }, { mat: "sulfur", n: 2 }, { mat: "rune_shard", n: 2 } ], research: 240 },
  book_gale_cutter: { id: "book_gale_cutter", name: "頁・風刃", out: "book_gale_cutter", tier: 3, unlocked: false,
                    inputs: [ { mat: "magicite", n: 1 }, { mat: "rune_shard", n: 2 }, { mat: "twig", n: 2 } ], research: 160 },
  book_night_blade: { id: "book_night_blade", name: "頁・夜の刃", out: "book_night_blade", tier: 3, unlocked: false,
                    inputs: [ { mat: "obsidian", n: 2 }, { mat: "magicite", n: 1 }, { mat: "rune_shard", n: 1 } ], research: 200 },
  book_cure_chant: { id: "book_cure_chant", name: "頁・癒しの詠唱", out: "book_cure_chant", tier: 3, unlocked: false,
                    inputs: [ { mat: "moonleaf", n: 1 }, { mat: "fragrant", n: 2 }, { mat: "spring_dew", n: 1 } ], research: 200 },

  // ── 上位レシピ（中堅以降の素材で作る）
  spirit_potion: { id: "spirit_potion", name: "水霊の薬", out: "spirit_potion", tier: 4, unlocked: false,
                   inputs: [ { mat: "water_tear", n: 1 }, { mat: "lotus_leaf", n: 2 }, { mat: "pure_water", n: 2 } ], research: 280 },
  moonlight_robe_item: { id: "moonlight_robe_item", name: "月光のローブ", out: "moonlight_robe_item", tier: 4, unlocked: false,
                   inputs: [ { mat: "moon_coral", n: 2 }, { mat: "silkstrand", n: 3 }, { mat: "spirit_glass", n: 1 } ], research: 320 },
  moonlight_staff_item: { id: "moonlight_staff_item", name: "月光の杖", out: "moonlight_staff_item", tier: 5, unlocked: false,
                   inputs: [ { mat: "moonstone", n: 2 }, { mat: "oakwood", n: 1 }, { mat: "magicite", n: 1 } ], research: 400 },
  starlit_amulet_item: { id: "starlit_amulet_item", name: "星辰のお守り", out: "starlit_amulet_item", tier: 5, unlocked: false,
                   inputs: [ { mat: "star_shard", n: 1 }, { mat: "silver_ore", n: 2 }, { mat: "rune_shard", n: 1 } ], research: 360 },
  book_phantom_clone: { id: "book_phantom_clone", name: "頁・朧分身", out: "book_phantom_clone", tier: 5, unlocked: false,
                   inputs: [ { mat: "phantom_stone", n: 1 }, { mat: "rune_shard", n: 2 }, { mat: "obsidian", n: 1 } ], research: 380 },
  dragon_scale_mail_item: { id: "dragon_scale_mail_item", name: "古竜の鱗鎧", out: "dragon_scale_mail_item", tier: 5, unlocked: false,
                   inputs: [ { mat: "dragon_scale", n: 3 }, { mat: "iron_ore", n: 2 }, { mat: "spirit_glass", n: 1 } ], research: 540 },
  dragon_elixir: { id: "dragon_elixir", name: "龍息のエリクサ", out: "dragon_elixir", tier: 5, unlocked: false,
                   inputs: [ { mat: "dragon_breath", n: 1 }, { mat: "legend_petal", n: 1 }, { mat: "ether", n: 2 } ], research: 600 },
  book_dragon_breath: { id: "book_dragon_breath", name: "頁・龍息", out: "book_dragon_breath", tier: 5, unlocked: false,
                   inputs: [ { mat: "primordial_rune", n: 1 }, { mat: "dragon_breath", n: 1 }, { mat: "ancient_rune", n: 1 } ], research: 560 },
};

export const CATEGORY_LABELS = { potion: "薬", weapon: "武器", armor: "防具", trinket: "装身具", tome: "魔法書" };

export function priceForItem(itemId, quality) {
  const it = ITEMS[itemId];
  if (!it) return 0;
  const mult = { poor: 0.6, norm: 1.0, good: 1.4, fine: 2.0 }[quality] || 1.0;
  return Math.max(1, Math.round(it.basePrice * mult));
}
