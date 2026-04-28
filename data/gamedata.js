// ============================================================
//  ヴィンテージ・メモリア  ―  ゲームデータ定義 v2.0
//  画像は assets/images/ 以下の相対パスで差し替え可能
// ============================================================

const GAMEDATA = {

  // ──────────────────────────────────────────────
  //  職業定義
  // ──────────────────────────────────────────────
  jobs: [
    {
      id: "antique_dealer",
      name: "骨董商",
      description: "古物を目利きする旅人。毎ターン開始時にMP+1を得る。",
      trait: "毎ターン開始時にMP+1",
      traitKey: "mpRegen",
      image: "assets/images/ui/job_antique_dealer.png",
      starterDeck: [
        "watch_support", "watch_support", "watch_support",
        "ink_support", "ink_support",
        "ink_attack", "ink_attack",
        "watch_defense", "watch_defense"
      ],
      levelStats: { hpGain: 8, mpGain: 2 }
    },
    {
      id: "trapper",
      name: "罠師",
      description: "罠を仕掛けて獲物を追い詰める狩人。毎ターン開始時に敵全体へ1ダメージを与える。",
      trait: "毎ターン開始時に敵全体へ1ダメージ",
      traitKey: "turnStartTrap",
      image: "assets/images/ui/job_trapper.png",
      starterDeck: [
        "watch_attack", "watch_attack", "watch_attack",
        "ink_attack", "ink_attack",
        "watch_defense", "watch_defense",
        "watch_support", "watch_support"
      ],
      levelStats: { hpGain: 7, mpGain: 1 }
    },
    {
      id: "mnemonist",
      name: "記憶術師",
      description: "膨大な知識を記憶する術者。手札の上限が1枚増え、最大六枚まで持てる。",
      trait: "手札上限+1（最大6枚）",
      traitKey: "extraHandSlot",
      image: "assets/images/ui/job_mnemonist.png",
      starterDeck: [
        "watch_support", "watch_support", "watch_support",
        "ink_support", "ink_support",
        "ink_attack", "ink_attack",
        "watch_defense", "watch_defense"
      ],
      levelStats: { hpGain: 6, mpGain: 3 }
    },
    {
      id: "detective",
      name: "探偵",
      description: "状況を読み解く洞察の達人。戦闘開始の最初のターンは敵が行動しない。",
      trait: "戦闘開始1ターン目は敵が行動しない",
      traitKey: "firstTurnImmune",
      image: "assets/images/ui/job_detective.png",
      starterDeck: [
        "watch_attack", "watch_attack",
        "ink_attack", "ink_attack",
        "watch_defense", "watch_defense",
        "ink_defense", "ink_defense",
        "watch_support"
      ],
      levelStats: { hpGain: 8, mpGain: 2 }
    },
    {
      id: "repairman",
      name: "修繕屋",
      description: "壊れたものを直す職人。ターン終了時にガード値の30%が次ターンに持ち越される。",
      trait: "ターン終了時ガード値30%持ち越し",
      traitKey: "guardCarryover",
      image: "assets/images/ui/job_repairman.png",
      starterDeck: [
        "watch_defense", "watch_defense", "watch_defense",
        "ink_defense", "ink_defense",
        "watch_attack", "watch_attack",
        "watch_support", "watch_support"
      ],
      levelStats: { hpGain: 12, mpGain: 1 }
    }
  ],

  // ──────────────────────────────────────────────
  //  素材一覧（クラフト専用）
  // ──────────────────────────────────────────────
  materials: [
    {
      id: "rusty_screw",
      name: "錆びたネジ",
      sellPrice: 15
    },
    {
      id: "thick_cloth",
      name: "厚手の布切れ",
      sellPrice: 15
    },
    {
      id: "dried_herb",
      name: "乾燥ハーブ",
      sellPrice: 20
    },
    {
      id: "glass_shard",
      name: "ガラスの破片",
      sellPrice: 20
    },
    {
      id: "velvet_ribbon",
      name: "ベルベットのリボン",
      sellPrice: 25
    },
    {
      id: "old_ink",
      name: "古いインク",
      sellPrice: 25
    },
    {
      id: "bronze_gear",
      name: "真鍮の歯車",
      sellPrice: 40
    },
    {
      id: "faded_leather",
      name: "色褪せた革",
      sellPrice: 35
    },
    {
      id: "stone_fragment",
      name: "石像の欠片",
      sellPrice: 30
    },
    {
      id: "cursed_cloth",
      name: "呪いの布",
      sellPrice: 25
    },
    {
      id: "old_bone",
      name: "古い骨",
      sellPrice: 30
    },
    {
      id: "ectoplasm",
      name: "霊体物質",
      sellPrice: 35
    },
    {
      id: "silk_thread",
      name: "絹の糸",
      sellPrice: 40
    },
    {
      id: "amber_shard",
      name: "琥珀の欠片",
      sellPrice: 45
    },
    // ── 新ステージ用素材 ──
    { id: "sea_glass", name: "シーグラス", sellPrice: 18 },
    { id: "smuggler_coin", name: "密輸業者の銀貨", sellPrice: 22 },
    { id: "scrap_metal", name: "スクラップメタル", sellPrice: 20 },
    { id: "toxic_oil", name: "有毒なオイル", sellPrice: 25 },
    { id: "cursed_thorn", name: "呪われた茨", sellPrice: 22 },
    { id: "blood_rose", name: "血の薔薇", sellPrice: 28 },
    { id: "phantom_gold", name: "幻影の金貨", sellPrice: 30 },
    { id: "deep_sea_pearl", name: "深海の真珠", sellPrice: 35 },
    { id: "star_sand", name: "星の砂", sellPrice: 32 },
    { id: "golden_gear", name: "黄金の歯車", sellPrice: 40 },
    { id: "royal_seal", name: "王家の印章", sellPrice: 50 },
    { id: "memory_crystal", name: "記憶の結晶", sellPrice: 60 }
  ],

  // ──────────────────────────────────────────────
  //  装備クラフトレシピ
  //  type: "weapon"（攻撃値UP）| "armor"（最大HP UP）
  // ──────────────────────────────────────────────
  craftRecipes: [
    // ── 武器（攻撃値UP）──
    {
      id: "iron_watch_sword",
      name: "時計仕掛けの剣",
      type: "weapon",
      weaponType: "sword",
      description: "懐中時計の部品を組み合わせた刃。物理攻撃値+5。",
      image: "assets/images/equipment/sword.jpg",
      attackBonus: 0,
      physicalBonus: 5,
      magicBonus: 0,
      hpBonus: 0,
      materials: { rusty_screw: 3, bronze_gear: 1 },
      sellPrice: 80
    },
    {
      id: "ink_wand",
      name: "インクの杖",
      type: "weapon",
      weaponType: "staff",
      description: "古いインク瓶を芯に作った杖。魔法攻撃値+5。",
      image: "assets/images/equipment/staff.jpg",
      attackBonus: 0,
      physicalBonus: 0,
      magicBonus: 5,
      hpBonus: 0,
      materials: { old_ink: 3, dried_herb: 1 },
      sellPrice: 80
    },
    {
      id: "mirror_blade",
      name: "鏡の短剣",
      type: "weapon",
      weaponType: "sword",
      description: "手鏡の破片を研ぎ澄ませた短剣。物理攻撃値+8。",
      image: "assets/images/equipment/sword.jpg",
      attackBonus: 0,
      physicalBonus: 8,
      magicBonus: 0,
      hpBonus: 0,
      materials: { glass_shard: 3, rusty_screw: 2 },
      sellPrice: 130
    },
    {
      id: "lantern_staff",
      name: "ランタンの杖",
      type: "weapon",
      weaponType: "staff",
      description: "古びたランタンを先端に据えた杖。魔法攻撃値+8。",
      image: "assets/images/equipment/staff.jpg",
      attackBonus: 0,
      physicalBonus: 0,
      magicBonus: 8,
      hpBonus: 0,
      materials: { bronze_gear: 2, dried_herb: 2 },
      sellPrice: 130
    },
    // ── 防具（最大HP UP）──
    {
      id: "cloth_coat",
      name: "布製コート",
      type: "armor",
      description: "厚手の布で仕立てたコート。最大HP+15。",
      image: "assets/images/equipment/armor.jpg",
      attackBonus: 0,
      hpBonus: 15,
      materials: { thick_cloth: 3, velvet_ribbon: 1 },
      sellPrice: 80
    },
    {
      id: "leather_vest",
      name: "革のベスト",
      type: "armor",
      description: "色褪せた革で作ったベスト。最大HP+20。",
      image: "assets/images/equipment/armor.jpg",
      attackBonus: 0,
      hpBonus: 20,
      materials: { faded_leather: 2, thick_cloth: 2 },
      sellPrice: 110
    },
    {
      id: "vintage_coat",
      name: "ヴィンテージコート",
      type: "armor",
      description: "上質な革と布で仕立てた一品。最大HP+30。",
      image: "assets/images/equipment/armor.jpg",
      attackBonus: 0,
      hpBonus: 30,
      materials: { faded_leather: 3, velvet_ribbon: 2, bronze_gear: 1 },
      sellPrice: 180
    },
    // ── 新ステージ対応装備（新旧素材組み合わせ）──
    {
      id: "cursed_chain_sword",
      name: "呪縛の鎖剣",
      type: "weapon",
      weaponType: "sword",
      description: "廃墟の石像の欠片と錆びたネジで作った剣。呪いの力を帯び、物理攻撃値+10。",
      image: "assets/images/equipment/sword.jpg",
      attackBonus: 0,
      physicalBonus: 10,
      magicBonus: 0,
      hpBonus: 0,
      materials: { stone_fragment: 2, rusty_screw: 2 },
      sellPrice: 160
    },
    {
      id: "spirit_staff",
      name: "霊光の杖",
      type: "weapon",
      weaponType: "staff",
      description: "霊体物質を古いインクで封じ込めた杖。魔法攻撃値+10。",
      image: "assets/images/equipment/staff.jpg",
      attackBonus: 0,
      physicalBonus: 0,
      magicBonus: 10,
      hpBonus: 0,
      materials: { ectoplasm: 2, old_ink: 2 },
      sellPrice: 160
    },
    {
      id: "amber_cloak",
      name: "琥珀の外套",
      type: "armor",
      description: "琥珀の欠片を縫い込んだ外套。幻想的な光を放つ。最大HP+25。",
      image: "assets/images/equipment/armor.jpg",
      attackBonus: 0,
      hpBonus: 25,
      materials: { amber_shard: 2, faded_leather: 2 },
      sellPrice: 150
    },
    {
      id: "silk_vestment",
      name: "絹の礼拝服",
      type: "armor",
      description: "絹糸と呪いの布で仕立てた礼拝服。商いの力が身を守る。最大HP+35。",
      image: "assets/images/equipment/armor.jpg",
      attackBonus: 0,
      hpBonus: 35,
      materials: { silk_thread: 3, velvet_ribbon: 1, cursed_cloth: 1 },
      sellPrice: 220
    },
    {
      id: "antique_dagger",
      name: "骨董商の懐剣",
      type: "weapon",
      weaponType: "sword",
      description: "古い骨とガラスの破片で作った短剣。鋭い切れ味を持つ。物理攻撃値+13。",
      image: "assets/images/equipment/sword.jpg",
      attackBonus: 0,
      physicalBonus: 13,
      magicBonus: 0,
      hpBonus: 0,
      materials: { old_bone: 2, glass_shard: 2, bronze_gear: 1 },
      sellPrice: 210
    },
    // ── 新ステージ対応装備 ──
    {
      id: "pirate_cutlass",
      name: "海賊のカットラス",
      type: "weapon",
      weaponType: "sword",
      description: "霧の港で手に入れた海賊の剣。切れ味が鋭い。物理攻撃値+8。",
      image: "assets/images/equipment/sword.jpg",
      attackBonus: 0,
      physicalBonus: 8,
      magicBonus: 0,
      hpBonus: 0,
      materials: { sea_glass: 2, smuggler_coin: 2 },
      sellPrice: 120
    },
    {
      id: "toxic_mask",
      name: "防毒マスク",
      type: "armor",
      description: "廃工場の毒ガスを防ぐマスク。防御力を高める。最大HP+15。",
      image: "assets/images/equipment/armor.jpg",
      attackBonus: 0,
      hpBonus: 15,
      materials: { scrap_metal: 2, toxic_oil: 2 },
      sellPrice: 130
    },
    {
      id: "thorn_whip",
      name: "茨の杖",
      type: "weapon",
      weaponType: "staff",
      description: "呪われた庭園の茨で作った杖。魔法攻撃値+10。",
      image: "assets/images/equipment/staff.jpg",
      attackBonus: 0,
      physicalBonus: 0,
      magicBonus: 10,
      hpBonus: 0,
      materials: { cursed_thorn: 2, blood_rose: 2 },
      sellPrice: 140
    },
    {
      id: "deep_sea_pendant",
      name: "深海のペンダント",
      type: "armor",
      description: "幽霊船の深海真珠で作ったペンダント。HPを大幅に高める。最大HP+25。",
      image: "assets/images/equipment/armor.jpg",
      attackBonus: 0,
      hpBonus: 25,
      materials: { phantom_gold: 2, deep_sea_pearl: 2 },
      sellPrice: 160
    },
    {
      id: "star_staff",
      name: "星詠みの杖",
      type: "weapon",
      weaponType: "staff",
      description: "時計塔の星の砂で作った杖。魔法攻撃値を大幅に高める。魔法攻撃値+14。",
      image: "assets/images/equipment/staff.jpg",
      attackBonus: 0,
      physicalBonus: 0,
      magicBonus: 14,
      hpBonus: 0,
      materials: { star_sand: 2, golden_gear: 2 },
      sellPrice: 180
    },
    {
      id: "royal_cloak",
      name: "王家の外套",
      type: "armor",
      description: "骨董王の印章で作った外套。高い防御力を誇る。最大HP+30。",
      image: "assets/images/equipment/armor.jpg",
      attackBonus: 0,
      hpBonus: 30,
      materials: { royal_seal: 2, memory_crystal: 2 },
      sellPrice: 220
    },
    {
      id: "time_sword",
      name: "時空の剣",
      type: "weapon",
      weaponType: "sword",
      description: "黄金の歯車と記憶の結晶で作った剣。物理攻撃値が最強クラス。物理攻撃値+16。",
      image: "assets/images/equipment/sword.jpg",
      attackBonus: 0,
      physicalBonus: 16,
      magicBonus: 4,
      hpBonus: 0,
      materials: { golden_gear: 2, memory_crystal: 2 },
      sellPrice: 250
    },
    {
      id: "antique_king_crown",
      name: "骨董王の王冠",
      type: "armor",
      description: "骨董王が所持していた伝説の王冠。究極の防具。最大HP+40。",
      image: "assets/images/equipment/armor.jpg",
      attackBonus: 0,
      hpBonus: 40,
      materials: { royal_seal: 2, golden_gear: 2, phantom_gold: 1 },
      sellPrice: 350
    }
  ],

  // ──────────────────────────────────────────────
  //  カードマスター定義
  //  baseValue: カードの基本効果値（強化で上昇）
  //  maxLevel: 強化上限（5段階）
  //  upgradeCost: 各段階の強化費用
  // ──────────────────────────────────────────────
  cards: [

    // ── 錆びた懐中時計（物理系）──
    {
      id: "watch_attack",
      sourceId: "watch",
      name: "懐中時計の打撃",
      type: "attack",
      affinity: "physical",
      mpCost: 2,
      description: "重い懐中時計を振り下ろす。確実な一撃。",
      baseValue: 10,
      effect: { damage: 10 },
      image: "assets/images/cards/watch_attack.jpg",
      sellPrice: 30,
      setEffect: { count: 3, description: "毎ターン開始時にガード+3", key: "watchSetGuard" }
    },
    {
      id: "watch_defense",
      sourceId: "watch",
      name: "時間鈍化",
      type: "defense",
      affinity: "physical",
      mpCost: 2,
      description: "時計の針を逆に回し、敵の行動を遅らせる。ガードを得る。",
      baseValue: 10,
      effect: { shield: 10 },
      image: "assets/images/cards/watch_defense.jpg",
      sellPrice: 30,
      setEffect: { count: 3, description: "毎ターン開始時にガード+3", key: "watchSetGuard" }
    },
    {
      id: "watch_support",
      sourceId: "watch",
      name: "ゼンマイ巻き",
      type: "support",
      affinity: "physical",
      mpCost: 1,
      description: "ゼンマイを丁寧に巻き直す。MPを回復する。",
      baseValue: 3,
      effect: { mpRestore: 3 },
      image: "assets/images/cards/watch_support.jpg",
      sellPrice: 30,
      setEffect: { count: 3, description: "毎ターン開始時にガード+3", key: "watchSetGuard" }
    },

    // ── 色褪せたインク瓶（魔法系）──
    {
      id: "ink_attack",
      sourceId: "ink",
      name: "インク飛ばし",
      type: "attack",
      affinity: "magic",
      mpCost: 2,
      description: "インクを勢いよく飛ばす。魔法ダメージを与える。",
      baseValue: 8,
      effect: { damage: 8 },
      image: "assets/images/cards/ink_attack.jpg",
      sellPrice: 30,
      setEffect: { count: 3, description: "魔法ダメージ+3（全魔法カード）", key: "inkSetMagicBonus" }
    },
    {
      id: "ink_defense",
      sourceId: "ink",
      name: "目眩まし",
      type: "defense",
      affinity: "magic",
      mpCost: 3,
      description: "インクを顔に浴びせ、敵の次の攻撃を1回無効化する。",
      baseValue: 1,
      effect: { blockNextAttack: 1 },
      image: "assets/images/cards/ink_defense.jpg",
      sellPrice: 30,
      setEffect: { count: 3, description: "魔法ダメージ+3（全魔法カード）", key: "inkSetMagicBonus" }
    },
    {
      id: "ink_support",
      sourceId: "ink",
      name: "記録",
      type: "support",
      affinity: "magic",
      mpCost: 1,
      description: "知識をインクで書き留める。次に使う魔法攻撃カードのダメージ+50%。",
      baseValue: 1.5,
      effect: { nextMagicDamageBonus: 1.5 },
      image: "assets/images/cards/ink_support.jpg",
      sellPrice: 30,
      setEffect: { count: 3, description: "魔法ダメージ+3（全魔法カード）", key: "inkSetMagicBonus" }
    },

    // ── 割れた手鏡（物理系）──
    {
      id: "mirror_attack",
      sourceId: "mirror",
      name: "反射光",
      type: "attack",
      affinity: "physical",
      mpCost: 3,
      description: "鏡の破片で光を集め、全ての敵にダメージを与える。",
      baseValue: 10,
      effect: { damage: 10, allEnemies: true },
      image: "assets/images/cards/mirror_attack.jpg",
      sellPrice: 45,
      setEffect: { count: 3, description: "反射光が敵のガードを無視する", key: "mirrorSetIgnoreShield" }
    },
    {
      id: "mirror_defense",
      sourceId: "mirror",
      name: "鏡の壁",
      type: "defense",
      affinity: "physical",
      mpCost: 3,
      description: "鏡を盾にする。ガードを得て、次に受けるダメージの40%を敵に反射する。",
      baseValue: 8,
      effect: { shield: 8, reflectDamageRatio: 0.4 },
      image: "assets/images/cards/mirror_defense.jpg",
      sellPrice: 45,
      setEffect: { count: 3, description: "反射光が敵のガードを無視する", key: "mirrorSetIgnoreShield" }
    },
    {
      id: "mirror_support",
      sourceId: "mirror",
      name: "弱点露出",
      type: "support",
      affinity: "physical",
      mpCost: 2,
      description: "鏡で真実を映し出す。敵の防御力を2ターン低下させる。",
      baseValue: 0.5,
      effect: { debuff: { type: "defenseDown", value: 0.5, duration: 2 } },
      image: "assets/images/cards/mirror_support.jpg",
      sellPrice: 45,
      setEffect: { count: 3, description: "反射光が敵のガードを無視する", key: "mirrorSetIgnoreShield" }
    },

    // ── 古びたランタン（物理系）──
    {
      id: "lantern_attack",
      sourceId: "lantern",
      name: "熱波",
      type: "attack",
      affinity: "physical",
      mpCost: 2,
      description: "ランタンの炎を向ける。ダメージ＋「燻し」状態（毎ターン小ダメージ）を付与。",
      baseValue: 7,
      effect: { damage: 7, statusEffect: { type: "burn", damagePerTurn: 3, duration: 3 } },
      image: "assets/images/cards/lantern_attack.jpg",
      sellPrice: 40,
      setEffect: { count: 3, description: "燻し状態のダメージ+2/ターン", key: "lanternSetBurnBonus" }
    },
    {
      id: "lantern_defense",
      sourceId: "lantern",
      name: "煙幕",
      type: "defense",
      affinity: "physical",
      mpCost: 2,
      description: "ランタンを消してガードを張り、敵に「燻し」状態を付与する。",
      baseValue: 8,
      effect: { shield: 8, statusEffect: { type: "burn", damagePerTurn: 2, duration: 2 } },
      image: "assets/images/cards/lantern_defense.jpg",
      sellPrice: 40,
      setEffect: { count: 3, description: "燻し状態のダメージ+2/ターン", key: "lanternSetBurnBonus" }
    },
    {
      id: "lantern_support",
      sourceId: "lantern",
      name: "灯火",
      type: "support",
      affinity: "physical",
      mpCost: 1,
      description: "ランタンを高く掲げ視界を開く。このターン追加で1枚ドローする。",
      baseValue: 1,
      effect: { drawCards: 1 },
      image: "assets/images/cards/lantern_support.jpg",
      sellPrice: 40,
      setEffect: { count: 3, description: "燻し状態のダメージ+2/ターン", key: "lanternSetBurnBonus" }
    },

    // ── 革張りの古書（魔法系）──
    {
      id: "book_attack",
      sourceId: "book",
      name: "知識の刃",
      type: "attack",
      affinity: "magic",
      mpCost: 3,
      description: "古書に秘められた知識を刃として放つ。高い魔法ダメージ。",
      baseValue: 14,
      effect: { damage: 14 },
      image: "assets/images/cards/book_attack.jpg",
      sellPrice: 50,
      setEffect: { count: 3, description: "戦闘開始最初のターン、魔法カードのMP消費-1", key: "bookSetMpDiscount" }
    },
    {
      id: "book_defense",
      sourceId: "book",
      name: "表紙の盾",
      type: "defense",
      affinity: "magic",
      mpCost: 2,
      description: "分厚い古書を盾にする。大きなガードを得る。",
      baseValue: 14,
      effect: { shield: 14 },
      image: "assets/images/cards/book_defense.jpg",
      sellPrice: 50,
      setEffect: { count: 3, description: "戦闘開始最初のターン、魔法カードのMP消費-1", key: "bookSetMpDiscount" }
    },
    {
      id: "book_support",
      sourceId: "book",
      name: "朗読",
      type: "support",
      affinity: "magic",
      mpCost: 1,
      description: "古書を朗読する。次のターン中、魔法カードのMP消費を1減らす。",
      baseValue: 1,
      effect: { buff: { type: "magicCostDown", value: 1, duration: 1 } },
      image: "assets/images/cards/book_support.jpg",
      sellPrice: 50,
      setEffect: { count: 3, description: "戦闘開始最初のターン、魔法カードのMP消費-1", key: "bookSetMpDiscount" }
    },
    // ―― 壊れたオルゴール（魔法系）――─
    {
      id: "music_attack",
      sourceId: "music",
      name: "不協和音",
      type: "attack",
      affinity: "magic",
      mpCost: 3,
      description: "不協和な旋律を奏でる。ダメージ＋敵を「混乱」状態にする（1ターン行動不能）。",
      baseValue: 8,
      effect: { damage: 8, statusEffect: { type: "confuse", duration: 1 } },
      image: "assets/images/cards/music_attack.jpg",
      sellPrice: 50,
      setEffect: { count: 3, description: "混乱状態の敵へのダメージ+50%", key: "musicSetConfuseBonus" }
    },
    {
      id: "music_defense",
      sourceId: "music",
      name: "子守唄",
      type: "defense",
      affinity: "magic",
      mpCost: 2,
      description: "優しい旋律でHPを回復する。",
      baseValue: 10,
      effect: { healHp: 10 },
      image: "assets/images/cards/music_defense.jpg",
      sellPrice: 50,
      setEffect: { count: 3, description: "混乱状態の敵へのダメージ+50%", key: "musicSetConfuseBonus" }
    },
    {
      id: "music_support",
      sourceId: "music",
      name: "旋律",
      type: "support",
      affinity: "magic",
      mpCost: 0,
      description: "心地よい旋律を奏でる。次に使うカードのMP消費を半減する。",
      baseValue: 0.5,
      effect: { buff: { type: "nextCardCostHalf", duration: 1 } },
      image: "assets/images/cards/music_support.jpg",
      sellPrice: 50,
      setEffect: { count: 3, description: "混乱状態の敵へのダメージ+50%", key: "musicSetConfuseBonus" }
    },

    // ── 古びたコンパス（物理系）──
    {
      id: "compass_attack",
      sourceId: "compass",
      name: "方位の刃",
      type: "attack",
      affinity: "physical",
      mpCost: 2,
      description: "コンパスの針を鋭く振り下ろす。確実な物理攻撃。",
      baseValue: 11,
      effect: { damage: 11 },
      image: "assets/images/cards/compass_attack.jpg",
      sellPrice: 45,
      setEffect: { count: 3, description: "方位の刃が敵全体を攻撃する", key: "compassSetAllAttack" }
    },
    {
      id: "compass_defense",
      sourceId: "compass",
      name: "磁力の盾",
      type: "defense",
      affinity: "physical",
      mpCost: 2,
      description: "磁力でガードを張り、次に受ける攻撃を1回無効化する。",
      baseValue: 6,
      effect: { shield: 6, blockNextAttack: 1 },
      image: "assets/images/cards/compass_defense.jpg",
      sellPrice: 45,
      setEffect: { count: 3, description: "方位の刃が敵全体を攻撃する", key: "compassSetAllAttack" }
    },
    {
      id: "compass_support",
      sourceId: "compass",
      name: "道標",
      type: "support",
      affinity: "physical",
      mpCost: 1,
      description: "コンパスで道を示す。追加で2枚ドローする。",
      baseValue: 2,
      effect: { drawCards: 2 },
      image: "assets/images/cards/compass_support.jpg",
      sellPrice: 45,
      setEffect: { count: 3, description: "方位の刃が敵全体を攻撃する", key: "compassSetAllAttack" }
    },

    // ── 錆びた鍵束（物理系）──
    {
      id: "keyring_attack",
      sourceId: "keyring",
      name: "鍵束の一撃",
      type: "attack",
      affinity: "physical",
      mpCost: 2,
      description: "重い鍵束を叩きつける。ダメージ＋敵を「混乱」状態にする確率がある。",
      baseValue: 9,
      effect: { damage: 9, statusEffect: { type: "confuse", duration: 1 } },
      image: "assets/images/cards/keyring_attack.jpg",
      sellPrice: 45,
      setEffect: { count: 3, description: "鍵束の一撃の混乱付与が必中になる", key: "keyringSetConfuseGuarantee" }
    },
    {
      id: "keyring_defense",
      sourceId: "keyring",
      name: "施錠",
      type: "defense",
      affinity: "physical",
      mpCost: 3,
      description: "鍵でガードを固める。大きなガードを得る。",
      baseValue: 15,
      effect: { shield: 15 },
      image: "assets/images/cards/keyring_defense.jpg",
      sellPrice: 45,
      setEffect: { count: 3, description: "鍵束の一撃の混乱付与が必中になる", key: "keyringSetConfuseGuarantee" }
    },
    {
      id: "keyring_support",
      sourceId: "keyring",
      name: "開錠",
      type: "support",
      affinity: "physical",
      mpCost: 0,
      description: "鍵を開けてMPを大きく回復する。",
      baseValue: 5,
      effect: { mpRestore: 5 },
      image: "assets/images/cards/keyring_support.jpg",
      sellPrice: 45,
      setEffect: { count: 3, description: "鍵束の一撃の混乱付与が必中になる", key: "keyringSetConfuseGuarantee" }
    },

    // ── 褪せた蝋燭（物理系・燻し）──
    {
      id: "candle_attack",
      sourceId: "candle",
      name: "溶蝋",
      type: "attack",
      affinity: "physical",
      mpCost: 2,
      description: "熱い蝋を浴びせる。ダメージ＋「燻し」状態を付与する。",
      baseValue: 7,
      effect: { damage: 7, statusEffect: { type: "burn", damagePerTurn: 3, duration: 3 } },
      image: "assets/images/cards/candle_attack.jpg",
      sellPrice: 45,
      setEffect: { count: 3, description: "燻し状態の敵へのダメージ+3", key: "candleSetBurnBonus" }
    },
    {
      id: "candle_defense",
      sourceId: "candle",
      name: "蝋の鎧",
      type: "defense",
      affinity: "physical",
      mpCost: 2,
      description: "蝋でガードを固め、攻撃してきた敵に「燻し」を返す。",
      baseValue: 9,
      effect: { shield: 9, statusEffect: { type: "burn", damagePerTurn: 2, duration: 2 } },
      image: "assets/images/cards/candle_defense.jpg",
      sellPrice: 45,
      setEffect: { count: 3, description: "燻し状態の敵へのダメージ+3", key: "candleSetBurnBonus" }
    },
    {
      id: "candle_support",
      sourceId: "candle",
      name: "灯火の加護",
      type: "support",
      affinity: "physical",
      mpCost: 1,
      description: "蝋燭の炎が加護を与える。次のターン、全カードのMP消費を1減らす。",
      baseValue: 1,
      effect: { buff: { type: "allCostDown", value: 1, duration: 1 } },
      image: "assets/images/cards/candle_support.jpg",
      sellPrice: 45,
      setEffect: { count: 3, description: "燻し状態の敵へのダメージ+3", key: "candleSetBurnBonus" }
    },

    // ── 割れた砂時計（魔法系）──
    {
      id: "hourglass_attack",
      sourceId: "hourglass",
      name: "時砂の刃",
      type: "attack",
      affinity: "magic",
      mpCost: 3,
      description: "砂時計の砂を刃として放つ。高い魔法ダメージ。",
      baseValue: 13,
      effect: { damage: 13 },
      image: "assets/images/cards/hourglass_attack.jpg",
      sellPrice: 55,
      setEffect: { count: 3, description: "砂時計セット：毎ターン開始時にMP+2", key: "hourglassSetMpRegen" }
    },
    {
      id: "hourglass_defense",
      sourceId: "hourglass",
      name: "時砂の壁",
      type: "defense",
      affinity: "magic",
      mpCost: 2,
      description: "砂時計の砂で壁を作る。大きなガードを得る。",
      baseValue: 13,
      effect: { shield: 13 },
      image: "assets/images/cards/hourglass_defense.jpg",
      sellPrice: 55,
      setEffect: { count: 3, description: "砂時計セット：毎ターン開始時にMP+2", key: "hourglassSetMpRegen" }
    },
    {
      id: "hourglass_support",
      sourceId: "hourglass",
      name: "砂時計を裏返す",
      type: "support",
      affinity: "magic",
      mpCost: 1,
      description: "砂時計を裏返す。HPを少し回復し、次のターンMP+3を得る。",
      baseValue: 8,
      effect: { healHp: 8, buff: { type: "nextTurnMpBonus", value: 3, duration: 1 } },
      image: "assets/images/cards/hourglass_support.jpg",
      sellPrice: 55,
      setEffect: { count: 3, description: "砂時計セット：毎ターン開始時にMP+2", key: "hourglassSetMpRegen" }
    },

    // ── 古びた望遠鏡（物理系） ──
    {
      id: "telescope_attack",
      sourceId: "telescope",
      name: "狙撃",
      type: "attack",
      affinity: "physical",
      mpCost: 3,
      description: "望遠鏡で弱点を見定め、高火力の一撃を放つ。",
      baseValue: 16,
      effect: { damage: 16 },
      image: "assets/images/cards/telescope_attack.jpg",
      sellPrice: 55,
      setEffect: { count: 3, description: "狙撃が全体攻撃になる", key: "telescopeSetAllSnipe" }
    },
    {
      id: "telescope_defense",
      sourceId: "telescope",
      name: "見切り",
      type: "defense",
      affinity: "physical",
      mpCost: 2,
      description: "敵の動きを見切り、ガードを得る。次の攻撃を1回無効化する。",
      baseValue: 7,
      effect: { shield: 7, blockNextAttack: 1 },
      image: "assets/images/cards/telescope_defense.jpg",
      sellPrice: 55,
      setEffect: { count: 3, description: "狙撃が全体攻撃になる", key: "telescopeSetAllSnipe" }
    },
    {
      id: "telescope_support",
      sourceId: "telescope",
      name: "未来視",
      type: "support",
      affinity: "physical",
      mpCost: 1,
      description: "望遠鏡で遠くを見渡す。追加で2枚ドローする。",
      baseValue: 2,
      effect: { drawCards: 2 },
      image: "assets/images/cards/telescope_support.jpg",
      sellPrice: 55,
      setEffect: { count: 3, description: "狙撃が全体攻撃になる", key: "telescopeSetAllSnipe" }
    },

    // ── 錆びた注射器（魔法系・毒） ──
    {
      id: "syringe_attack",
      sourceId: "syringe",
      name: "毒注入",
      type: "attack",
      affinity: "magic",
      mpCost: 3,
      description: "毒液を注入する。ダメージ＋「燻し」状態（毒ダメージ）を付与する。",
      baseValue: 9,
      effect: { damage: 9, statusEffect: { type: "burn", damagePerTurn: 4, duration: 3 } },
      image: "assets/images/cards/syringe_attack.jpg",
      sellPrice: 60,
      setEffect: { count: 3, description: "燻し状態の敵へのダメージ+4", key: "syringeSetPoisonBonus" }
    },
    {
      id: "syringe_defense",
      sourceId: "syringe",
      name: "麻酔",
      type: "defense",
      affinity: "magic",
      mpCost: 2,
      description: "麻酔薬でガードを得て、敵の防御力を低下させる。",
      baseValue: 10,
      effect: { shield: 10, debuff: { type: "defenseDown", value: 0.5, duration: 2 } },
      image: "assets/images/cards/syringe_defense.jpg",
      sellPrice: 60,
      setEffect: { count: 3, description: "燻し状態の敵へのダメージ+4", key: "syringeSetPoisonBonus" }
    },
    {
      id: "syringe_support",
      sourceId: "syringe",
      name: "強化剤",
      type: "support",
      affinity: "magic",
      mpCost: 2,
      description: "強化剤を注入する。HPを回復し、次のターンMP+3を得る。",
      baseValue: 12,
      effect: { healHp: 12, buff: { type: "nextTurnMpBonus", value: 3, duration: 1 } },
      image: "assets/images/cards/syringe_support.jpg",
      sellPrice: 60,
      setEffect: { count: 3, description: "燻し状態の敵へのダメージ+4", key: "syringeSetPoisonBonus" }
    },

    // ── 壊れたラジオ（魔法系） ──
    {
      id: "radio_attack",
      sourceId: "radio",
      name: "雑音の射撃",
      type: "attack",
      affinity: "magic",
      mpCost: 3,
      description: "壊れたラジオから漏れ出る雑音を武器にする。全ての敵に魔法ダメージを与える。",
      baseValue: 11,
      effect: { damage: 11, allEnemies: true },
      image: "assets/images/cards/radio_attack.jpg",
      sellPrice: 60,
      setEffect: { count: 3, description: "雑音の射撃が敵のガードを無視する", key: "radioSetIgnoreShield" }
    },
    {
      id: "radio_defense",
      sourceId: "radio",
      name: "雑音の防壁",
      type: "defense",
      affinity: "magic",
      mpCost: 3,
      description: "ラジオの雑音で敵の感覚を麻痺させる。ガードを得て、次に受けるダメージの50%を反射する。",
      baseValue: 9,
      effect: { shield: 9, reflectDamageRatio: 0.5 },
      image: "assets/images/cards/radio_defense.jpg",
      sellPrice: 60,
      setEffect: { count: 3, description: "雑音の射撃が敵のガードを無視する", key: "radioSetIgnoreShield" }
    },
    {
      id: "radio_support",
      sourceId: "radio",
      name: "インターフェア",
      type: "support",
      affinity: "magic",
      mpCost: 2,
      description: "ラジオの雑音で敵の思考を乱す。敵の防御力を2ターン低下させる。",
      baseValue: 0.5,
      effect: { debuff: { type: "defenseDown", value: 0.5, duration: 2 } },
      image: "assets/images/cards/radio_support.jpg",
      sellPrice: 60,
      setEffect: { count: 3, description: "雑音の射撃が敵のガードを無視する", key: "radioSetIgnoreShield" }
    },

    // ── 古びた地球儀（物理系） ──
    {
      id: "globe_attack",
      sourceId: "globe",
      name: "大地を走る者",
      type: "attack",
      affinity: "physical",
      mpCost: 4,
      description: "地球儀に刻まれた大地の力を解き放つ。全ての敵に強力な物理ダメージを与える。",
      baseValue: 13,
      effect: { damage: 13, allEnemies: true },
      image: "assets/images/cards/globe_attack.jpg",
      sellPrice: 70,
      setEffect: { count: 3, description: "大地セット：毎ターン開始時にMP+3", key: "globeSetMpRegen" }
    },
    {
      id: "globe_defense",
      sourceId: "globe",
      name: "大地の盾",
      type: "defense",
      affinity: "physical",
      mpCost: 3,
      description: "地球儀に刻まれた大地の壁を呼び起こす。大きなガードを得て、次の攻撃を1回無効化する。",
      baseValue: 12,
      effect: { shield: 12, blockNextAttack: 1 },
      image: "assets/images/cards/globe_defense.jpg",
      sellPrice: 70,
      setEffect: { count: 3, description: "大地セット：毎ターン開始時にMP+3", key: "globeSetMpRegen" }
    },
    {
      id: "globe_support",
      sourceId: "globe",
      name: "大地の息吹",
      type: "support",
      affinity: "physical",
      mpCost: 3,
      description: "地球儀に刻まれた大地の息吹で強化する。HPを大きく回復する。",
      baseValue: 20,
      effect: { healHp: 20 },
      image: "assets/images/cards/globe_support.jpg",
      sellPrice: 70,
      setEffect: { count: 3, description: "大地セット：毎ターン開始時にMP+3", key: "globeSetMpRegen" }
    },

    // ── 王のチェス駒（物理系） ──
    {
      id: "chess_piece_attack",
      sourceId: "chess_piece",
      name: "チェックメイト",
      type: "attack",
      affinity: "physical",
      mpCost: 4,
      description: "王の一手を放つ。高い物理ダメージを与える。",
      baseValue: 20,
      effect: { damage: 20 },
      image: "assets/images/cards/chess_piece_attack.jpg",
      sellPrice: 70,
      setEffect: { count: 3, description: "チェックメイトが全体攻撃になる", key: "chessPieceSetAllAttack" }
    },
    {
      id: "chess_piece_defense",
      sourceId: "chess_piece",
      name: "キャスリング",
      type: "defense",
      affinity: "physical",
      mpCost: 3,
      description: "王の守りを固める。大きなガードを得て、ダメージを反射する。",
      baseValue: 14,
      effect: { shield: 14, reflectDamageRatio: 0.3 },
      image: "assets/images/cards/chess_piece_defense.jpg",
      sellPrice: 70,
      setEffect: { count: 3, description: "チェックメイトが全体攻撃になる", key: "chessPieceSetAllAttack" }
    },
    {
      id: "chess_piece_support",
      sourceId: "chess_piece",
      name: "王の威光",
      type: "support",
      affinity: "physical",
      mpCost: 2,
      description: "王の威光で敵全体を弱体化させる。全敵に「弱体」を付与する。",
      baseValue: 0.7,
      effect: { debuff: { type: "defenseDown", value: 0.5, duration: 2 }, allEnemies: true },
      image: "assets/images/cards/chess_piece_support.jpg",
      sellPrice: 70,
      setEffect: { count: 3, description: "チェックメイトが全体攻撃になる", key: "chessPieceSetAllAttack" }
    }
  ],

  // ──────────────────────────────────────────────
  //  カード強化コスト（5段階）
  // ──────────────────────────────────────────────
  cardUpgradeCost: [100, 250, 500, 900, 1500],

  // ──────────────────────────────────────────────
  //  敵データ
  // ──────────────────────────────────────────────
  enemies: [
    // ── 通常敵 ──
    {
      id: "dusty_bear",
      weakness: "magic",
      name: "埃まみれのクマ",
      description: "屋根裏に眠っていたぬいぐるみ。色褪せた目が光る。",
      image: "assets/images/enemies/dusty_bear.png",
      hp: 35, maxHp: 35,
      shield: 0,
      expReward: 20,
      goldReward: 15,
      dropCards: ["watch", "ink"],
      dropMaterials: ["rusty_screw", "thick_cloth"],
      dropRate: { card: 0.2, material: 0.7 },
      actions: [
        { type: "attack", label: "引っかき", damage: 7, intent: "attack" },
        { type: "attack", label: "体当たり", damage: 12, intent: "heavy_attack" },
        { type: "defense", label: "毛並みを整える", shield: 8, intent: "defense" }
      ],
      actionPattern: [0, 1, 0, 2]
    },
    {
      id: "cracked_doll",
      weakness: "magic",
      name: "ひび割れた人形",
      description: "古い棚に飾られていた磁器の人形。ひびから何かが滲み出ている。",
      image: "assets/images/enemies/cracked_doll.png",
      hp: 30, maxHp: 30,
      shield: 0,
      expReward: 18,
      goldReward: 12,
      dropCards: ["mirror", "music"],
      dropMaterials: ["glass_shard", "velvet_ribbon"],
      dropRate: { card: 0.2, material: 0.7 },
      actions: [
        { type: "attack", label: "陶器の爪", damage: 8, intent: "attack" },
        { type: "attack", label: "呪いの視線", damage: 5, statusEffect: { type: "defenseDown", value: 0.5, duration: 2 }, intent: "debuff" },
        { type: "defense", label: "ひびを塞ぐ", shield: 3, intent: "defense" }
      ],
      actionPattern: [0, 2, 1, 0, 1]
    },
    {
      id: "faded_rabbit",
      weakness: "physical",
      name: "色褪せたウサギ",
      description: "マジシャンの帽子から飛び出した古いウサギのぬいぐるみ。素早い。",
      image: "assets/images/enemies/faded_rabbit.png",
      hp: 25, maxHp: 25,
      shield: 0,
      expReward: 15,
      goldReward: 10,
      dropCards: ["lantern", "book"],
      dropMaterials: ["dried_herb", "old_ink"],
      dropRate: { card: 0.2, material: 0.7 },
      actions: [
        { type: "attack", label: "素早い一蹴り", damage: 6, intent: "attack" },
        { type: "attack", label: "連続噛みつき", damage: 4, hits: 2, intent: "attack" },
        { type: "defense", label: "耳を立てる", shield: 5, intent: "defense" }
      ],
      actionPattern: [0, 1, 0, 2, 1]
    },
    {
      id: "rusted_knight",
      weakness: "magic",
      name: "錆びた騎士像",
      description: "古い図書館の入口を守っていた鎧の置き物。ゆっくりだが重い。",
      image: "assets/images/enemies/rusted_knight.png",
      hp: 50, maxHp: 50,
      shield: 0,
      expReward: 30,
      goldReward: 25,
      dropCards: ["mirror", "watch"],
      dropMaterials: ["rusty_screw", "bronze_gear"],
      dropRate: { card: 0.25, material: 0.75 },
      actions: [
        { type: "attack", label: "錆びた剣撃", damage: 14, intent: "heavy_attack" },
        { type: "defense", label: "盾を構える", shield: 12, intent: "defense" },
        { type: "attack", label: "踏みつけ", damage: 9, intent: "attack" }
      ],
      actionPattern: [1, 0, 2, 1, 0]
    },
    {
      id: "ink_specter",
      weakness: "physical",
      name: "インクの亡霊",
      description: "古書から滲み出した黒いインクが形を成した存在。",
      image: "assets/images/enemies/ink_specter.png",
      hp: 32, maxHp: 32,
      shield: 0,
      expReward: 22,
      goldReward: 18,
      dropCards: ["ink", "book"],
      dropMaterials: ["old_ink", "faded_leather"],
      dropRate: { card: 0.2, material: 0.7 },
      actions: [
        { type: "attack", label: "インクの波", damage: 10, affinity: "magic", intent: "attack" },
        { type: "attack", label: "記憶の侵食", damage: 6, statusEffect: { type: "burn", damagePerTurn: 2, duration: 3 }, intent: "debuff" },
        { type: "defense", label: "インクに溶ける", shield: 8, intent: "defense" }
      ],
      actionPattern: [0, 2, 1, 0, 0]
    },

    // ── ボス敵 ──
    {
      id: "boss_clockwork",
      weakness: "magic",
      name: "大時計の守護者",
      description: "屋根裏部屋の奥に鎮座する巨大な時計仕掛けの番人。時を操る力を持つ。",
      image: "assets/images/enemies/boss_clockwork.png",
      hp: 90, maxHp: 90,
      shield: 0,
      isBoss: true,
      expReward: 80,
      goldReward: 80,
      dropCards: ["watch", "lantern", "mirror"],
      dropMaterials: ["bronze_gear", "glass_shard", "velvet_ribbon"],
      dropRate: { card: 0.5, material: 1.0 },
      actions: [
        { type: "attack", label: "時計の針", damage: 16, intent: "heavy_attack" },
        { type: "support", label: "時間を巻き戻す", healSelf: 14, intent: "heal" },
        { type: "attack", label: "時間停止", damage: 6, statusEffect: { type: "mpDrain", amount: 3 }, intent: "debuff" },
        { type: "attack", label: "歯車の嵐", damage: 11, intent: "attack" }
      ],
      actionPattern: [0, 3, 1, 2, 0, 3]
    },
    {
      id: "boss_librarian",
      name: "古書館の亡霊司書",
      description: "古い図書館に取り憑いた司書の亡霊。知識の力で攻撃してくる。",
      image: "assets/images/enemies/boss_librarian.png",
      hp: 100, maxHp: 100,
      shield: 0,
      isBoss: true,
      expReward: 100,
      goldReward: 100,
      dropCards: ["book", "ink", "music"],
      dropMaterials: ["old_ink", "faded_leather", "velvet_ribbon"],
      dropRate: { card: 0.5, material: 1.0 },
      actions: [
        { type: "attack", label: "禁断の知識", damage: 14, affinity: "magic", intent: "heavy_attack" },
        { type: "defense", label: "魔法の結界", shield: 6, intent: "defense" },
        { type: "attack", label: "記憶の侵食", damage: 8, statusEffect: { type: "burn", damagePerTurn: 2, duration: 2 }, intent: "debuff" },
        { type: "support", label: "古書から力を得る", healSelf: 15, intent: "heal" }
      ],
      actionPattern: [0, 1, 2, 3, 0, 1]
    },

    // ── 取り巻き ──
    {
      id: "minion_gear",
      weakness: "magic",
      name: "迷子の歯車",
      description: "大時計から外れた小さな歯車。くるくると回りながら攻撃してくる。",
      image: "assets/images/enemies/minion_gear.png",
      hp: 22, maxHp: 22,
      shield: 0,
      isMinion: true,
      expReward: 10,
      goldReward: 8,
      dropCards: [],
      dropMaterials: ["rusty_screw", "bronze_gear"],
      dropRate: { card: 0.0, material: 0.6 },
      actions: [
        { type: "attack", label: "歯車の一撃", damage: 6, intent: "attack" },
        { type: "defense", label: "高速回転", shield: 5, intent: "defense" }
      ],
      actionPattern: [0, 1, 0, 0]
    },

    // ── 廃墟の礼拝堂 通常敵 ──
    {
      id: "cursed_statue",
      weakness: "magic",
      name: "呪われた聖像",
      description: "礼拝堂に安置された石像。呪いの力で動き出し、触れる者を蝕む。",
      image: "assets/images/enemies/cursed_statue.png",
      hp: 42, maxHp: 42,
      shield: 0,
      expReward: 26,
      goldReward: 20,
      dropCards: ["compass", "keyring"],
      dropMaterials: ["stone_fragment", "cursed_cloth"],
      dropRate: { card: 0.2, material: 0.7 },
      actions: [
        { type: "attack", label: "呪いの一撃", damage: 10, statusEffect: { type: "defenseDown", value: 0.5, duration: 2 }, intent: "debuff" },
        { type: "attack", label: "石の拳", damage: 14, intent: "heavy_attack" },
        { type: "defense", label: "石化の皮膚", shield: 10, intent: "defense" }
      ],
      actionPattern: [0, 2, 1, 0, 2]
    },
    {
      id: "rotting_monk",
      weakness: "physical",
      name: "腐った修道士",
      description: "礼拝堂に縛られた修道士の亡骸。呪いの祈りで攻撃してくる。",
      image: "assets/images/enemies/rotting_monk.png",
      hp: 38, maxHp: 38,
      shield: 0,
      expReward: 24,
      goldReward: 18,
      dropCards: ["candle", "hourglass"],
      dropMaterials: ["cursed_cloth", "old_bone"],
      dropRate: { card: 0.2, material: 0.7 },
      actions: [
        { type: "attack", label: "呪いの祈り", damage: 8, affinity: "magic", statusEffect: { type: "burn", damagePerTurn: 2, duration: 2 }, intent: "debuff" },
        { type: "attack", label: "腐敗の手", damage: 11, intent: "attack" },
        { type: "defense", label: "死の加護", shield: 7, intent: "defense" }
      ],
      actionPattern: [0, 1, 2, 0, 1]
    },
    {
      id: "wailing_ghost",
      weakness: "physical",
      name: "嘆きの亡霊",
      description: "礼拝堂に漂う嘆き声の亡霊。防御を無視して精神を攻撃する。",
      image: "assets/images/enemies/wailing_ghost.png",
      hp: 30, maxHp: 30,
      shield: 0,
      expReward: 22,
      goldReward: 16,
      dropCards: ["candle", "compass"],
      dropMaterials: ["ectoplasm", "cursed_cloth"],
      dropRate: { card: 0.2, material: 0.7 },
      actions: [
        { type: "attack", label: "嘆きの叫び", damage: 9, affinity: "magic", intent: "attack" },
        { type: "attack", label: "魂の侵食", damage: 6, statusEffect: { type: "confuse", duration: 1 }, intent: "debuff" },
        { type: "defense", label: "霊体化", shield: 6, intent: "defense" }
      ],
      actionPattern: [0, 1, 0, 2, 0]
    },

    // ── 深夜の骨董市 通常敵 ──
    {
      id: "masked_merchant",
      name: "仮面の商人",
      description: "夜市に現れる怪しい商人。仮面の下に何を隠しているのか。",
      image: "assets/images/enemies/masked_merchant.png",
      hp: 44, maxHp: 44,
      shield: 0,
      expReward: 28,
      goldReward: 30,
      dropCards: ["keyring", "hourglass"],
      dropMaterials: ["silk_thread", "amber_shard"],
      dropRate: { card: 0.2, material: 0.7 },
      actions: [
        { type: "attack", label: "秘密の一刺し", damage: 12, intent: "attack" },
        { type: "attack", label: "幻惑の商品", damage: 7, statusEffect: { type: "confuse", duration: 1 }, intent: "debuff" },
        { type: "defense", label: "取引の盾", shield: 9, intent: "defense" }
      ],
      actionPattern: [0, 2, 1, 0, 0]
    },
    {
      id: "broken_marionette",
      weakness: "physical",
      name: "壊れたマリオネット",
      description: "夜市の露店に飾られていた操り人形。糸が切れても動き続ける。",
      image: "assets/images/enemies/broken_marionette.png",
      hp: 36, maxHp: 36,
      shield: 0,
      expReward: 23,
      goldReward: 17,
      dropCards: ["compass", "candle"],
      dropMaterials: ["silk_thread", "amber_shard"],
      dropRate: { card: 0.2, material: 0.7 },
      actions: [
        { type: "attack", label: "糸の鞭", damage: 8, hits: 2, intent: "attack" },
        { type: "attack", label: "人形の踊り", damage: 13, intent: "heavy_attack" },
        { type: "defense", label: "糸で縛る", shield: 8, intent: "defense" }
      ],
      actionPattern: [0, 2, 1, 0, 2]
    },
    {
      id: "night_wisp",
      weakness: "physical",
      name: "夜光虫の群れ",
      description: "夜市に漂う光の虫の群れ。小さいが数が多く、素早い。",
      image: "assets/images/enemies/night_wisp.png",
      hp: 28, maxHp: 28,
      shield: 0,
      expReward: 20,
      goldReward: 14,
      dropCards: ["candle", "hourglass"],
      dropMaterials: ["amber_shard", "ectoplasm"],
      dropRate: { card: 0.2, material: 0.7 },
      actions: [
        { type: "attack", label: "光の乱舞", damage: 5, hits: 2, intent: "attack" },
        { type: "attack", label: "幻光の閃き", damage: 9, statusEffect: { type: "defenseDown", value: 0.5, duration: 1 }, intent: "debuff" },
        { type: "defense", label: "光の霧", shield: 5, intent: "defense" }
      ],
      actionPattern: [0, 1, 0, 2, 0]
    },

    // ── 新ボス ──
    {
      id: "boss_cathedral_priest",
      weakness: "magic",
      name: "嘆きの大聖堂神父",
      description: "廃墟の礼拝堂に封じられた神父の亡霊。呪いと嘆きの力を操る。",
      image: "assets/images/enemies/boss_cathedral_priest.png",
      hp: 110, maxHp: 110,
      shield: 0,
      isBoss: true,
      expReward: 120,
      goldReward: 110,
      dropCards: ["candle", "compass", "hourglass"],
      dropMaterials: ["cursed_cloth", "old_bone", "ectoplasm"],
      dropRate: { card: 0.5, material: 1.0 },
      actions: [
        { type: "attack", label: "呪いの聖典", damage: 16, affinity: "magic", statusEffect: { type: "burn", damagePerTurn: 3, duration: 2 }, intent: "debuff" },
        { type: "defense", label: "嘆きの結界", shield: 10, intent: "defense" },
        { type: "attack", label: "死の宣告", damage: 20, intent: "heavy_attack" },
        { type: "support", label: "亡者を呼ぶ", healSelf: 18, intent: "heal" }
      ],
      actionPattern: [0, 2, 1, 3, 0, 2]
    },
    {
      id: "boss_night_illusionist",
      weakness: "physical",
      name: "夜市の幻術師",
      description: "深夜の骨董市を仕切る幻術師。幻と現実の境を操り、翻弄してくる。",
      image: "assets/images/enemies/boss_night_illusionist.png",
      hp: 105, maxHp: 105,
      shield: 0,
      isBoss: true,
      expReward: 115,
      goldReward: 120,
      dropCards: ["keyring", "hourglass", "compass"],
      dropMaterials: ["silk_thread", "amber_shard", "ectoplasm"],
      dropRate: { card: 0.5, material: 1.0 },
      actions: [
        { type: "attack", label: "幻惑の一撃", damage: 14, statusEffect: { type: "confuse", duration: 2 }, intent: "debuff" },
        { type: "defense", label: "幻の分身", shield: 12, intent: "defense" },
        { type: "attack", label: "夜市の嵐", damage: 10, hits: 2, intent: "attack" },
        { type: "support", label: "幻術の回復", healSelf: 16, intent: "heal" }
      ],
      actionPattern: [0, 2, 1, 3, 2, 0]
    },

    // ── 取り巻き（新ステージ用）──
    {
      id: "minion_ghost",
      weakness: "physical",
      name: "迷子の亡霊",
      description: "礼拝堂に迷い込んだ小さな亡霊。弱いが呪いを纏っている。",
      image: "assets/images/enemies/minion_ghost.png",
      hp: 20, maxHp: 20,
      shield: 0,
      isMinion: true,
      expReward: 10,
      goldReward: 8,
      dropCards: [],
      dropMaterials: ["ectoplasm", "cursed_cloth"],
      dropRate: { card: 0.0, material: 0.6 },
      actions: [
        { type: "attack", label: "呪いの爪", damage: 5, statusEffect: { type: "burn", damagePerTurn: 1, duration: 2 }, intent: "debuff" },
        { type: "defense", label: "霊体化", shield: 4, intent: "defense" }
      ],
      actionPattern: [0, 1, 0, 0]
    },
    {
      id: "minion_wisp",
      weakness: "physical",
      name: "迷子の光虫",
      description: "夜市に迷い込んだ光の虫。幻惑の光を放つ。",
      image: "assets/images/enemies/minion_wisp.png",
      hp: 18, maxHp: 18,
      shield: 0,
      isMinion: true,
      expReward: 9,
      goldReward: 7,
      dropCards: [],
      dropMaterials: ["amber_shard"],
      dropRate: { card: 0.0, material: 0.6 },
      actions: [
        { type: "attack", label: "幻光の閃き", damage: 5, intent: "attack" },
        { type: "defense", label: "光の霧", shield: 3, intent: "defense" }
      ],
      actionPattern: [0, 0, 1, 0]
    },

    // ── 新ステージ用敵キャラクター ──
// ── 霧の港倉庫 通常敵 ──
    {
      id: "fog_smuggler",
      name: "霧の密輸業者",
      description: "霧の港で活動する密輸業者。素早い動きで翻弄してくる。",
      image: "assets/images/enemies/fog_smuggler.png",
      hp: 52, maxHp: 52,
      shield: 0,
      expReward: 32,
      goldReward: 35,
      dropCards: ["telescope", "compass"],
      dropMaterials: ["sea_glass", "smuggler_coin"],
      dropRate: { card: 0.2, material: 0.7 },
      actions: [
        { type: "attack", label: "素早い一刺し", damage: 12, intent: "attack" },
        { type: "attack", label: "霧の中の奇襲", damage: 16, intent: "heavy_attack" },
        { type: "defense", label: "霧に紛れる", shield: 10, intent: "defense" }
      ],
      actionPattern: [0, 2, 1, 0, 0]
    },
    {
      id: "barnacle_crab",
      weakness: "magic",
      name: "フジツボ蟹",
      description: "港の岸壁に住み着いた巨大な蟹。硬い甲羅で守られている。",
      image: "assets/images/enemies/barnacle_crab.png",
      hp: 58, maxHp: 58,
      shield: 0,
      expReward: 34,
      goldReward: 28,
      dropCards: ["telescope", "keyring"],
      dropMaterials: ["sea_glass", "scrap_metal"],
      dropRate: { card: 0.2, material: 0.7 },
      actions: [
        { type: "attack", label: "ハサミの一撃", damage: 15, intent: "heavy_attack" },
        { type: "defense", label: "甲羅を固める", shield: 14, intent: "defense" },
        { type: "attack", label: "泡の連撃", damage: 8, hits: 2, intent: "attack" }
      ],
      actionPattern: [1, 0, 2, 1, 0]
    },
    {
      id: "drowned_sailor",
      weakness: "physical",
      name: "水死した水夫",
      description: "霧の港で溺れた水夫の亡霊。冷たい水の力で攻撃してくる。",
      image: "assets/images/enemies/drowned_sailor.png",
      hp: 44, maxHp: 44,
      shield: 0,
      expReward: 28,
      goldReward: 22,
      dropCards: ["syringe", "candle"],
      dropMaterials: ["smuggler_coin", "sea_glass"],
      dropRate: { card: 0.2, material: 0.7 },
      actions: [
        { type: "attack", label: "冷たい抱擁", damage: 10, affinity: "magic", statusEffect: { type: "defenseDown", value: 0.5, duration: 2 }, intent: "debuff" },
        { type: "attack", label: "波の一撃", damage: 13, intent: "attack" },
        { type: "defense", label: "水の盾", shield: 8, intent: "defense" }
      ],
      actionPattern: [0, 1, 2, 0, 1]
    },
    {
      id: "boss_mist_captain",
      name: "霧の海賊船長",
      description: "霧の港を支配する海賊船長の亡霊。霧を操り、敵を翻弄する。",
      image: "assets/images/enemies/boss_mist_captain.png",
      hp: 130, maxHp: 130,
      shield: 0,
      isBoss: true,
      expReward: 140,
      goldReward: 150,
      dropCards: ["telescope", "syringe", "compass"],
      dropMaterials: ["sea_glass", "smuggler_coin", "deep_sea_pearl"],
      dropRate: { card: 0.5, material: 1.0 },
      actions: [
        { type: "attack", label: "霧の剣閃", damage: 18, intent: "heavy_attack" },
        { type: "defense", label: "霧の外套", shield: 14, intent: "defense" },
        { type: "attack", label: "嵐の号令", damage: 12, hits: 2, intent: "attack" },
        { type: "support", label: "霧の回復", healSelf: 20, intent: "heal" }
      ],
      actionPattern: [0, 2, 1, 3, 0, 2]
    },
    {
      id: "minion_fog",
      weakness: "physical",
      name: "霧の幻影",
      description: "霧の港に漂う幻影。実体がなく、触れると冷たい。",
      image: "assets/images/enemies/minion_fog.png",
      hp: 22, maxHp: 22,
      shield: 0,
      isMinion: true,
      expReward: 11,
      goldReward: 9,
      dropCards: [],
      dropMaterials: ["sea_glass"],
      dropRate: { card: 0.0, material: 0.6 },
      actions: [
        { type: "attack", label: "霧の爪", damage: 7, intent: "attack" },
        { type: "defense", label: "霧に溶ける", shield: 5, intent: "defense" }
      ],
      actionPattern: [0, 0, 1, 0]
    },

    // ── 廃工場の地下 通常敵 ──
    {
      id: "scrap_golem",
      weakness: "magic",
      name: "スクラップゴーレム",
      description: "廃工場の金属くずが集まって形成されたゴーレム。重い一撃が脅威。",
      image: "assets/images/enemies/scrap_golem.png",
      hp: 65, maxHp: 65,
      shield: 0,
      expReward: 38,
      goldReward: 32,
      dropCards: ["telescope", "chess_piece"],
      dropMaterials: ["scrap_metal", "smuggler_coin"],
      dropRate: { card: 0.2, material: 0.7 },
      actions: [
        { type: "attack", label: "鉄拳", damage: 18, intent: "heavy_attack" },
        { type: "defense", label: "鉄の皮膚", shield: 16, intent: "defense" },
        { type: "attack", label: "スクラップ投げ", damage: 11, intent: "attack" }
      ],
      actionPattern: [1, 0, 2, 1, 0]
    },
    {
      id: "toxic_slime",
      weakness: "magic",
      name: "猛毒スライム",
      description: "廃工場の廃液から生まれたスライム。触れると毒を受ける。",
      image: "assets/images/enemies/toxic_slime.png",
      hp: 48, maxHp: 48,
      shield: 0,
      expReward: 30,
      goldReward: 25,
      dropCards: ["syringe", "hand_mirror"],
      dropMaterials: ["toxic_oil", "scrap_metal"],
      dropRate: { card: 0.2, material: 0.7 },
      actions: [
        { type: "attack", label: "毒液噴射", damage: 9, affinity: "magic", statusEffect: { type: "burn", damagePerTurn: 3, duration: 3 }, intent: "debuff" },
        { type: "attack", label: "体当たり", damage: 13, intent: "attack" },
        { type: "defense", label: "毒の膜", shield: 9, intent: "defense" }
      ],
      actionPattern: [0, 1, 2, 0, 0]
    },
    {
      id: "rusty_drone",
      weakness: "magic",
      name: "錆びたドローン",
      description: "廃工場で稼働し続ける古いドローン。素早い動きで攻撃してくる。",
      image: "assets/images/enemies/rusty_drone.png",
      hp: 40, maxHp: 40,
      shield: 0,
      expReward: 26,
      goldReward: 20,
      dropCards: ["telescope", "syringe"],
      dropMaterials: ["scrap_metal", "toxic_oil"],
      dropRate: { card: 0.2, material: 0.7 },
      actions: [
        { type: "attack", label: "ドリル攻撃", damage: 11, hits: 2, intent: "attack" },
        { type: "attack", label: "電撃放射", damage: 14, affinity: "magic", intent: "heavy_attack" },
        { type: "defense", label: "回転防御", shield: 8, intent: "defense" }
      ],
      actionPattern: [0, 2, 1, 0, 2]
    },
    {
      id: "boss_furnace_core",
      weakness: "magic",
      name: "暴走する炉心",
      description: "廃工場の中枢に鎮座する暴走した炉心。熱と毒で周囲を汚染する。",
      image: "assets/images/enemies/boss_furnace_core.png",
      hp: 145, maxHp: 145,
      shield: 0,
      isBoss: true,
      expReward: 160,
      goldReward: 165,
      dropCards: ["syringe", "chess_piece", "telescope"],
      dropMaterials: ["scrap_metal", "toxic_oil", "golden_gear"],
      dropRate: { card: 0.5, material: 1.0 },
      actions: [
        { type: "attack", label: "炎の爆発", damage: 20, statusEffect: { type: "burn", damagePerTurn: 3, duration: 3 }, intent: "debuff" },
        { type: "defense", label: "鉄壁の防御", shield: 18, intent: "defense" },
        { type: "attack", label: "毒ガス噴出", damage: 14, affinity: "magic", statusEffect: { type: "burn", damagePerTurn: 4, duration: 2 }, intent: "debuff" },
        { type: "support", label: "炉心の再起動", healSelf: 22, intent: "heal" }
      ],
      actionPattern: [0, 2, 1, 3, 0, 2]
    },
    {
      id: "minion_spark",
      weakness: "physical",
      name: "漏電スパーク",
      description: "廃工場の電気系統から生まれた電撃の塊。素早く動き回る。",
      image: "assets/images/enemies/minion_spark.png",
      hp: 24, maxHp: 24,
      shield: 0,
      isMinion: true,
      expReward: 12,
      goldReward: 10,
      dropCards: [],
      dropMaterials: ["scrap_metal"],
      dropRate: { card: 0.0, material: 0.6 },
      actions: [
        { type: "attack", label: "電撃", damage: 8, affinity: "magic", intent: "attack" },
        { type: "defense", label: "電磁バリア", shield: 6, intent: "defense" }
      ],
      actionPattern: [0, 0, 1, 0]
    },

    // ── 呪われた庭園 通常敵 ──
    {
      id: "thorn_creeper",
      weakness: "magic",
      name: "茨の這う者",
      description: "呪われた庭園に生い茂る茨が意志を持った存在。触れると呪いが移る。",
      image: "assets/images/enemies/thorn_creeper.png",
      hp: 55, maxHp: 55,
      shield: 0,
      expReward: 35,
      goldReward: 30,
      dropCards: ["hand_mirror", "syringe"],
      dropMaterials: ["cursed_thorn", "blood_rose"],
      dropRate: { card: 0.2, material: 0.7 },
      actions: [
        { type: "attack", label: "茨の鞭", damage: 12, statusEffect: { type: "burn", damagePerTurn: 2, duration: 3 }, intent: "debuff" },
        { type: "attack", label: "絡みつき", damage: 15, intent: "heavy_attack" },
        { type: "defense", label: "茨の盾", shield: 12, intent: "defense" }
      ],
      actionPattern: [0, 2, 1, 0, 2]
    },
    {
      id: "man_eating_plant",
      weakness: "magic",
      name: "人食い植物",
      description: "呪われた庭園に育つ巨大な食虫植物。強力な酸で攻撃してくる。",
      image: "assets/images/enemies/man_eating_plant.png",
      hp: 62, maxHp: 62,
      shield: 0,
      expReward: 38,
      goldReward: 32,
      dropCards: ["syringe", "chess_piece"],
      dropMaterials: ["blood_rose", "cursed_thorn"],
      dropRate: { card: 0.2, material: 0.7 },
      actions: [
        { type: "attack", label: "酸の飛沫", damage: 13, affinity: "magic", statusEffect: { type: "defenseDown", value: 0.5, duration: 2 }, intent: "debuff" },
        { type: "attack", label: "丸呑み", damage: 19, intent: "heavy_attack" },
        { type: "defense", label: "葉の防壁", shield: 13, intent: "defense" }
      ],
      actionPattern: [0, 2, 1, 0, 1]
    },
    {
      id: "poison_butterfly",
      weakness: "physical",
      name: "猛毒の蝶",
      description: "呪われた庭園を舞う美しい蝶。鱗粉に猛毒を含む。",
      image: "assets/images/enemies/poison_butterfly.png",
      hp: 38, maxHp: 38,
      shield: 0,
      expReward: 26,
      goldReward: 22,
      dropCards: ["hand_mirror", "telescope"],
      dropMaterials: ["blood_rose", "cursed_thorn"],
      dropRate: { card: 0.2, material: 0.7 },
      actions: [
        { type: "attack", label: "毒の鱗粉", damage: 8, affinity: "magic", statusEffect: { type: "burn", damagePerTurn: 4, duration: 3 }, intent: "debuff" },
        { type: "attack", label: "羽の一撃", damage: 11, intent: "attack" },
        { type: "defense", label: "羽ばたき", shield: 7, intent: "defense" }
      ],
      actionPattern: [0, 1, 0, 2, 0]
    },
    {
      id: "boss_rose_queen",
      weakness: "magic",
      name: "血塗られた薔薇の女王",
      description: "呪われた庭園を支配する薔薇の女王。血と呪いの力を操る。",
      image: "assets/images/enemies/boss_rose_queen.png",
      hp: 155, maxHp: 155,
      shield: 0,
      isBoss: true,
      expReward: 175,
      goldReward: 180,
      dropCards: ["hand_mirror", "syringe", "chess_piece"],
      dropMaterials: ["cursed_thorn", "blood_rose", "memory_crystal"],
      dropRate: { card: 0.5, material: 1.0 },
      actions: [
        { type: "attack", label: "血の薔薇", damage: 18, affinity: "magic", statusEffect: { type: "burn", damagePerTurn: 4, duration: 3 }, intent: "debuff" },
        { type: "defense", label: "茨の王冠", shield: 16, intent: "defense" },
        { type: "attack", label: "呪いの嵐", damage: 22, statusEffect: { type: "defenseDown", value: 0.5, duration: 2 }, intent: "heavy_attack" },
        { type: "support", label: "庭園の再生", healSelf: 25, intent: "heal" }
      ],
      actionPattern: [0, 2, 1, 3, 0, 2]
    },
    {
      id: "minion_petal",
      weakness: "magic",
      name: "呪いの花びら",
      description: "薔薇の女王が放つ呪われた花びら。触れると毒を受ける。",
      image: "assets/images/enemies/minion_petal.png",
      hp: 20, maxHp: 20,
      shield: 0,
      isMinion: true,
      expReward: 10,
      goldReward: 8,
      dropCards: [],
      dropMaterials: ["blood_rose"],
      dropRate: { card: 0.0, material: 0.6 },
      actions: [
        { type: "attack", label: "毒の花粉", damage: 6, statusEffect: { type: "burn", damagePerTurn: 2, duration: 2 }, intent: "debuff" },
        { type: "defense", label: "花びらの盾", shield: 4, intent: "defense" }
      ],
      actionPattern: [0, 1, 0, 0]
    },

    // ── 幽霊船の船倉 通常敵 ──
    {
      id: "phantom_pirate",
      weakness: "physical",
      name: "幻影の海賊",
      description: "幽霊船に漂う海賊の亡霊。生前の武器を今も持ち続ける。",
      image: "assets/images/enemies/phantom_pirate.png",
      hp: 60, maxHp: 60,
      shield: 0,
      expReward: 40,
      goldReward: 38,
      dropCards: ["chess_piece", "telescope"],
      dropMaterials: ["phantom_gold", "deep_sea_pearl"],
      dropRate: { card: 0.2, material: 0.7 },
      actions: [
        { type: "attack", label: "幽霊剣", damage: 14, affinity: "magic", intent: "attack" },
        { type: "attack", label: "海賊の一撃", damage: 18, intent: "heavy_attack" },
        { type: "defense", label: "幽体化", shield: 11, intent: "defense" }
      ],
      actionPattern: [0, 2, 1, 0, 0]
    },
    {
      id: "cursed_treasure",
      weakness: "magic",
      name: "呪われた財宝箱",
      description: "幽霊船の船倉に眠る財宝箱。開けようとすると呪いで反撃してくる。",
      image: "assets/images/enemies/cursed_treasure.png",
      hp: 70, maxHp: 70,
      shield: 0,
      expReward: 42,
      goldReward: 50,
      dropCards: ["chess_piece", "star_hourglass"],
      dropMaterials: ["phantom_gold", "deep_sea_pearl"],
      dropRate: { card: 0.25, material: 0.75 },
      actions: [
        { type: "attack", label: "呪いの反撃", damage: 13, statusEffect: { type: "defenseDown", value: 0.5, duration: 2 }, intent: "debuff" },
        { type: "defense", label: "錠前を固める", shield: 18, intent: "defense" },
        { type: "attack", label: "財宝の爆発", damage: 20, intent: "heavy_attack" }
      ],
      actionPattern: [1, 0, 2, 1, 0]
    },
    {
      id: "bone_shark",
      weakness: "magic",
      name: "白骨鮫",
      description: "幽霊船の周りを泳ぐ白骨化した鮫。素早く鋭い牙が脅威。",
      image: "assets/images/enemies/bone_shark.png",
      hp: 50, maxHp: 50,
      shield: 0,
      expReward: 34,
      goldReward: 28,
      dropCards: ["telescope", "hand_mirror"],
      dropMaterials: ["deep_sea_pearl", "phantom_gold"],
      dropRate: { card: 0.2, material: 0.7 },
      actions: [
        { type: "attack", label: "骨の牙", damage: 15, hits: 2, intent: "attack" },
        { type: "attack", label: "突進", damage: 20, intent: "heavy_attack" },
        { type: "defense", label: "骨の鎧", shield: 10, intent: "defense" }
      ],
      actionPattern: [0, 2, 1, 0, 2]
    },
    {
      id: "boss_davy_jones",
      weakness: "magic",
      name: "深海の支配者",
      description: "幽霊船の船倉に封じられた深海の支配者。海の呪いを操る。",
      image: "assets/images/enemies/boss_davy_jones.png",
      hp: 165, maxHp: 165,
      shield: 0,
      isBoss: true,
      expReward: 190,
      goldReward: 200,
      dropCards: ["chess_piece", "star_hourglass", "telescope"],
      dropMaterials: ["phantom_gold", "deep_sea_pearl", "royal_seal"],
      dropRate: { card: 0.5, material: 1.0 },
      actions: [
        { type: "attack", label: "深海の呪い", damage: 20, affinity: "magic", statusEffect: { type: "defenseDown", value: 0.5, duration: 3 }, intent: "debuff" },
        { type: "defense", label: "海の防壁", shield: 20, intent: "defense" },
        { type: "attack", label: "嵐の一撃", damage: 25, intent: "heavy_attack" },
        { type: "support", label: "深海の再生", healSelf: 28, intent: "heal" }
      ],
      actionPattern: [0, 2, 1, 3, 0, 2]
    },
    {
      id: "minion_tentacle",
      weakness: "physical",
      name: "深海の触手",
      description: "深海の支配者が操る巨大な触手。絡みついて動きを封じる。",
      image: "assets/images/enemies/minion_tentacle.png",
      hp: 28, maxHp: 28,
      shield: 0,
      isMinion: true,
      expReward: 13,
      goldReward: 11,
      dropCards: [],
      dropMaterials: ["deep_sea_pearl"],
      dropRate: { card: 0.0, material: 0.6 },
      actions: [
        { type: "attack", label: "絡みつき", damage: 9, statusEffect: { type: "defenseDown", value: 0.5, duration: 1 }, intent: "debuff" },
        { type: "defense", label: "水の盾", shield: 7, intent: "defense" }
      ],
      actionPattern: [0, 1, 0, 0]
    },

    // ── 忘れられた時計塔 通常敵 ──
    {
      id: "star_watcher",
      weakness: "physical",
      name: "星見の魔術師",
      description: "時計塔の頂上で星を観測し続ける魔術師の亡霊。星の力を操る。",
      image: "assets/images/enemies/star_watcher.png",
      hp: 56, maxHp: 56,
      shield: 0,
      expReward: 38,
      goldReward: 35,
      dropCards: ["star_hourglass", "hand_mirror"],
      dropMaterials: ["star_sand", "golden_gear"],
      dropRate: { card: 0.2, material: 0.7 },
      actions: [
        { type: "attack", label: "星の矢", damage: 14, affinity: "magic", intent: "attack" },
        { type: "attack", label: "流星群", damage: 10, affinity: "magic", hits: 2, intent: "attack" },
        { type: "defense", label: "星の加護", shield: 12, intent: "defense" }
      ],
      actionPattern: [0, 2, 1, 0, 0]
    },
    {
      id: "pendulum_knight",
      weakness: "magic",
      name: "振り子の騎士",
      description: "時計塔の振り子に乗って動く騎士の像。規則的だが強力な攻撃をしてくる。",
      image: "assets/images/enemies/pendulum_knight.png",
      hp: 68, maxHp: 68,
      shield: 0,
      expReward: 42,
      goldReward: 38,
      dropCards: ["chess_piece", "telescope"],
      dropMaterials: ["golden_gear", "star_sand"],
      dropRate: { card: 0.2, material: 0.7 },
      actions: [
        { type: "attack", label: "振り子の一撃", damage: 17, intent: "heavy_attack" },
        { type: "defense", label: "鉄の盾", shield: 16, intent: "defense" },
        { type: "attack", label: "連続斬り", damage: 10, hits: 2, intent: "attack" }
      ],
      actionPattern: [1, 0, 2, 1, 0]
    },
    {
      id: "time_swallower",
      name: "時間を喰う者",
      description: "時計塔に棲む時間を喰う怪物。攻撃するたびにMPを奪ってくる。",
      image: "assets/images/enemies/time_swallower.png",
      hp: 50, maxHp: 50,
      shield: 0,
      expReward: 34,
      goldReward: 28,
      dropCards: ["star_hourglass", "syringe"],
      dropMaterials: ["star_sand", "golden_gear"],
      dropRate: { card: 0.2, material: 0.7 },
      actions: [
        { type: "attack", label: "時間喰い", damage: 10, statusEffect: { type: "mpDrain", amount: 3 }, intent: "debuff" },
        { type: "attack", label: "時の爪", damage: 14, intent: "attack" },
        { type: "defense", label: "時の盾", shield: 10, intent: "defense" }
      ],
      actionPattern: [0, 1, 2, 0, 0]
    },
    {
      id: "boss_time_weaver",
      name: "時を紡ぐ者",
      description: "時計塔の最深部に封じられた時間の番人。過去と未来を操る。",
      image: "assets/images/enemies/boss_time_weaver.png",
      hp: 175, maxHp: 175,
      shield: 0,
      isBoss: true,
      expReward: 200,
      goldReward: 210,
      dropCards: ["star_hourglass", "chess_piece", "telescope"],
      dropMaterials: ["star_sand", "golden_gear", "memory_crystal"],
      dropRate: { card: 0.5, material: 1.0 },
      actions: [
        { type: "attack", label: "時の断絶", damage: 22, statusEffect: { type: "mpDrain", amount: 4 }, intent: "debuff" },
        { type: "defense", label: "時の結界", shield: 22, intent: "defense" },
        { type: "attack", label: "時空の嵐", damage: 18, hits: 2, intent: "attack" },
        { type: "support", label: "時の巻き戻し", healSelf: 30, intent: "heal" }
      ],
      actionPattern: [0, 2, 1, 3, 0, 2]
    },
    {
      id: "minion_sand",
      weakness: "physical",
      name: "時の砂",
      description: "時計塔から溢れ出た時の砂が意志を持った存在。触れると時間が歪む。",
      image: "assets/images/enemies/minion_sand.png",
      hp: 26, maxHp: 26,
      shield: 0,
      isMinion: true,
      expReward: 12,
      goldReward: 10,
      dropCards: [],
      dropMaterials: ["star_sand"],
      dropRate: { card: 0.0, material: 0.6 },
      actions: [
        { type: "attack", label: "時の侵食", damage: 7, statusEffect: { type: "mpDrain", amount: 2 }, intent: "debuff" },
        { type: "defense", label: "砂の盾", shield: 6, intent: "defense" }
      ],
      actionPattern: [0, 1, 0, 0]
    },

    // ── 骨董王の秘密部屋 通常敵 ──
    {
      id: "royal_guard",
      weakness: "magic",
      name: "王家の近衛兵",
      description: "骨董王の秘密部屋を守る精鋭の近衛兵。最高の訓練を受けている。",
      image: "assets/images/enemies/royal_guard.png",
      hp: 75, maxHp: 75,
      shield: 0,
      expReward: 50,
      goldReward: 50,
      dropCards: ["chess_piece", "star_hourglass"],
      dropMaterials: ["royal_seal", "golden_gear"],
      dropRate: { card: 0.25, material: 0.75 },
      actions: [
        { type: "attack", label: "王家の剣", damage: 20, intent: "heavy_attack" },
        { type: "defense", label: "王家の盾", shield: 20, intent: "defense" },
        { type: "attack", label: "連続突き", damage: 12, hits: 2, intent: "attack" }
      ],
      actionPattern: [1, 0, 2, 1, 0]
    },
    {
      id: "mimic_antique",
      name: "擬態する古物",
      description: "骨董品に擬態した怪物。近づくと突然牙をむく。",
      image: "assets/images/enemies/mimic_antique.png",
      hp: 65, maxHp: 65,
      shield: 0,
      expReward: 45,
      goldReward: 60,
      dropCards: ["chess_piece", "hand_mirror"],
      dropMaterials: ["memory_crystal", "royal_seal"],
      dropRate: { card: 0.3, material: 0.7 },
      actions: [
        { type: "attack", label: "奇襲", damage: 22, intent: "heavy_attack" },
        { type: "attack", label: "呪いの噛みつき", damage: 14, statusEffect: { type: "defenseDown", value: 0.5, duration: 2 }, intent: "debuff" },
        { type: "defense", label: "擬態", shield: 14, intent: "defense" }
      ],
      actionPattern: [0, 2, 1, 0, 0]
    },
    {
      id: "boss_antique_king",
      name: "骨董王",
      description: "骨董の世界を支配する骨董王。無数の古物の力を操る最強の敵。",
      image: "assets/images/enemies/boss_antique_king.png",
      hp: 220, maxHp: 220,
      shield: 0,
      isBoss: true,
      expReward: 300,
      goldReward: 500,
      dropCards: ["chess_piece", "star_hourglass", "hand_mirror", "telescope"],
      dropMaterials: ["royal_seal", "memory_crystal", "golden_gear"],
      dropRate: { card: 0.7, material: 1.0 },
      actions: [
        { type: "attack", label: "王の裁き", damage: 28, intent: "heavy_attack" },
        { type: "defense", label: "王家の結界", shield: 25, intent: "defense" },
        { type: "attack", label: "古物の嵐", damage: 18, hits: 2, statusEffect: { type: "defenseDown", value: 0.5, duration: 2 }, intent: "debuff" },
        { type: "support", label: "王の復活", healSelf: 35, intent: "heal" },
        { type: "attack", label: "記憶の消滅", damage: 22, statusEffect: { type: "mpDrain", amount: 5 }, intent: "debuff" }
      ],
      actionPattern: [0, 2, 1, 3, 4, 0, 2]
    },

// ── 新ステージ6つ ──
  ],

  // ──────────────────────────────────────────────
  //  ステージ（探索場所）定義
  // ──────────────────────────────────────────────
  stages: [
    {
      id: "attic",
      name: "屋根裏部屋",
      description: "埃と記憶が積もる場所。古いおもちゃや家具が眠っている。",
      image: "assets/images/ui/stage_attic.jpg",
      enemies: ["dusty_bear", "cracked_doll", "faded_rabbit"],
      boss: "boss_clockwork",
      bossMinions: ["minion_gear"],
      multiEnemyChance: 0.25,
      bossMultiEnemyChance: 0.7,
      maxFloor: 10,
      // 移動テキスト（ランダムに選択）
      moveTexts: [
        "埃っぽい廊下を抜けると、古い玩具が散らばる部屋に出た。",
        "軋む床板を踏みしめながら、薄暗い通路を進む。",
        "古いカーテンの向こうに、何かが動く気配がした。",
        "積み重なった箱の隙間を縫うように進む。埃が舞い上がる。",
        "壊れたオルゴールの音が、どこからか聞こえてくる。",
        "色褪せた写真立てが並ぶ棚の前を通り過ぎた。"
      ]
    },
    {
      id: "library",
      name: "古い図書館",
      description: "無数の古書が並ぶ薄暗い図書館。インクの匂いが漂う。",
      image: "assets/images/ui/stage_library.jpg",
      enemies: ["rusted_knight", "ink_specter", "cracked_doll"],
      boss: "boss_librarian",
      bossMinions: ["ink_specter"],
      multiEnemyChance: 0.3,
      bossMultiEnemyChance: 0.8,
      maxFloor: 10,
      moveTexts: [
        "インクの匂いが漂う通路を進む。古書が壁を埋め尽くしている。",
        "薄暗い書架の間を歩く。どこかでページをめくる音がした。",
        "羊皮紙の地図が落ちていた。拾い上げると、文字が滲んでいる。",
        "古い蝋燭の灯りが揺れる。影が本棚の間で踊っている。",
        "床に散らばった本を踏まないよう、慎重に歩を進める。",
        "奥に続く扉を見つけた。取っ手は錆びているが、まだ開く。"
      ]
    },
    {
      id: "cathedral",
      name: "廃墟の礼拝堂",
      description: "呪いに包まれた古い礼拝堂。嘆き声と小さな灯火が漂う薄暗い空間。",
      image: "assets/images/ui/stage_cathedral.jpg",
      enemies: ["cursed_statue", "rotting_monk", "wailing_ghost"],
      boss: "boss_cathedral_priest",
      bossMinions: ["minion_ghost"],
      multiEnemyChance: 0.3,
      bossMultiEnemyChance: 0.75,
      maxFloor: 12,
      moveTexts: [
        "崩れた石畳を踏み越える。嘆き声が辺り一面に漂っている。",
        "山積みの聖典の間を臆せずに進む。ページが風もないのにめくれる。",
        "小さな灯火が一つ、暗闇の中で揺れている。",
        "廃墟のステンドグラスから月光が漏れている。",
        "湿った石畳の上を慎重に歩く。足音が高い天井に響き渡る。",
        "崩れた祭壇の影から、何かがこちらを見ている気がする。"
      ]
    },
    {
      id: "night_market",
      name: "深夜の骨董市",
      description: "深夜に開かれる幻の骨董市。怪しげな光と商人たちが集っている。",
      image: "assets/images/ui/stage_night_market.jpg",
      enemies: ["masked_merchant", "broken_marionette", "night_wisp"],
      boss: "boss_night_illusionist",
      bossMinions: ["minion_wisp"],
      multiEnemyChance: 0.35,
      bossMultiEnemyChance: 0.8,
      maxFloor: 12,
      moveTexts: [
        "怪しげな光の露店が並ぶ通りを進む。商人たちの視線が刺さる。",
        "古い道具が山積みになった露店の前を通り過ぎる。",
        "光虫が舞うように辺りを浮かぶ。美しいが危うい。",
        "幻想的な音楽がどこからか流れてくる。足が止まりそうになる。",
        "山積みの骨董品の間を抜けるように進む。安いものは一つもない。",
        "幻と現実の境界が曖昧な夜市。奇妙な光が路を照らす。"
      ]
    },

    // ── 新ステージ ──
    {
      id: "port",
      name: "霧の港倉庫",
      description: "濃い霧に包まれた廃港の倉庫。密輸品と亡霊が眠る場所。",
      image: "assets/images/ui/stage_port.jpg",
      enemies: ["fog_smuggler", "barnacle_crab", "drowned_sailor"],
      boss: "boss_mist_captain",
      bossMinions: ["minion_fog"],
      multiEnemyChance: 0.35,
      bossMultiEnemyChance: 0.8,
      maxFloor: 12,
      moveTexts: [
        "濃い霧の中を進む。足元が見えず、慎重に歩を進める。",
        "廃れた倉庫の扉が軋む。中から何かの気配がする。",
        "波の音が遠くから聞こえる。霧の向こうに船影が見える。",
        "錆びた鎖が床に転がっている。かつて何かを縛っていたのだろうか。",
        "古い木箱が積み重なっている。中身は何だろう。",
        "霧の中で光が揺れる。誰かがランタンを持って歩いているようだ。"
      ]
    },
    {
      id: "factory",
      name: "廃工場の地下",
      description: "稼働を止めた廃工場の地下。毒ガスと錆びた機械が充満する。",
      image: "assets/images/ui/stage_factory.jpg",
      enemies: ["scrap_golem", "toxic_slime", "rusty_drone"],
      boss: "boss_furnace_core",
      bossMinions: ["minion_spark"],
      multiEnemyChance: 0.35,
      bossMultiEnemyChance: 0.8,
      maxFloor: 14,
      moveTexts: [
        "錆びたパイプの間を縫うように進む。毒ガスの臭いが漂う。",
        "古い機械が今も動き続けている。何かに動かされているようだ。",
        "床に油が溜まっている。滑らないよう慎重に歩く。",
        "遠くから金属音が聞こえる。何かが動いている。",
        "壊れた計器が並ぶ壁の前を通り過ぎる。数字は読めない。",
        "地下深くに続く階段を見つけた。底は暗くて見えない。"
      ]
    },
    {
      id: "garden",
      name: "呪われた庭園",
      description: "呪いに包まれた古い庭園。茨と毒の花が生い茂る危険な場所。",
      image: "assets/images/ui/stage_garden.jpg",
      enemies: ["thorn_creeper", "man_eating_plant", "poison_butterfly"],
      boss: "boss_rose_queen",
      bossMinions: ["minion_petal"],
      multiEnemyChance: 0.35,
      bossMultiEnemyChance: 0.8,
      maxFloor: 14,
      moveTexts: [
        "茨が道を塞いでいる。慎重に掻き分けながら進む。",
        "美しい花が咲いているが、近づくと毒の臭いがする。",
        "蝶が舞っている。美しいが、近づくと危険そうだ。",
        "古い噴水が枯れている。かつては美しい庭園だったのだろう。",
        "薔薇の香りが漂う。しかし、その甘さには毒が混じっている。",
        "石畳の間から茨が伸びている。庭園全体が生きているようだ。"
      ]
    },
    {
      id: "ghost_ship",
      name: "幽霊船の船倉",
      description: "霧の海に漂う幽霊船の船倉。海賊の亡霊と呪われた財宝が眠る。",
      image: "assets/images/ui/stage_ghost_ship.jpg",
      enemies: ["phantom_pirate", "cursed_treasure", "bone_shark"],
      boss: "boss_davy_jones",
      bossMinions: ["minion_tentacle"],
      multiEnemyChance: 0.4,
      bossMultiEnemyChance: 0.85,
      maxFloor: 15,
      moveTexts: [
        "船の軋む音が響く。波に揺られながら、暗い船倉を進む。",
        "古い財宝箱が並んでいる。開けるのは危険そうだ。",
        "海賊の旗が風もないのに揺れている。",
        "船底から水が染み込んでいる。足元が濡れている。",
        "骨が転がっている。かつての船員のものだろうか。",
        "遠くから海の音が聞こえる。しかし、ここは船の中のはずだ。"
      ]
    },
    {
      id: "clock_tower",
      name: "忘れられた時計塔",
      description: "時が止まった古い時計塔。星と時間の力が渦巻く神秘的な場所。",
      image: "assets/images/ui/stage_clock_tower.jpg",
      enemies: ["star_watcher", "pendulum_knight", "time_swallower"],
      boss: "boss_time_weaver",
      bossMinions: ["minion_sand"],
      multiEnemyChance: 0.4,
      bossMultiEnemyChance: 0.85,
      maxFloor: 15,
      moveTexts: [
        "巨大な振り子が今も揺れている。時間が歪んでいるようだ。",
        "星図が壁に描かれている。複雑な模様が光を放っている。",
        "時計の針が逆回転している。時間が逆流しているのか。",
        "砂時計が無数に並んでいる。砂の流れが全て逆だ。",
        "塔の頂上から星が見える。しかし、昼間のはずだ。",
        "古い時計が突然鳴り出した。何かが目覚めたようだ。"
      ]
    },
    {
      id: "king_room",
      name: "骨董王の秘密部屋",
      description: "骨董の世界を支配する骨董王が住む秘密の部屋。最強の敵が待ち受ける。",
      image: "assets/images/ui/stage_king_room.jpg",
      enemies: ["royal_guard", "mimic_antique"],
      boss: "boss_antique_king",
      bossMinions: ["royal_guard"],
      multiEnemyChance: 0.45,
      bossMultiEnemyChance: 0.9,
      maxFloor: 20,
      moveTexts: [
        "豪華な装飾が施された廊下を進む。全てが本物の骨董品だ。",
        "近衛兵の視線が刺さる。一歩一歩が命がけだ。",
        "無数の骨董品が並んでいる。どれが本物でどれが擬態かわからない。",
        "王の玉座が見えてくる。その前に立つ者は誰もいない。",
        "古い肖像画が並んでいる。全ての目がこちらを向いている。",
        "扉の向こうから重厚な気配がする。骨董王がそこにいる。"
      ]
    }
  ],

  // ──────────────────────────────────────────────
  //  プレイヤー初期値
  // ──────────────────────────────────────────────
  playerBase: {
    hp: 60,
    maxHp: 60,
    mp: 10,
    maxMp: 10,
    attackBonus: 0,   // 装備による攻撃値ボーナス
    level: 1,
    exp: 0,
    expToNext: 50,
    gold: 0,
    image: "assets/images/ui/player.png"
  },

  // ──────────────────────────────────────────────
  //  レベルアップ設定（職業ごとのhpGain/mpGainはjobsで定義）
  // ──────────────────────────────────────────────
  levelUp: {
    expMultiplier: 1.5
  }
};
