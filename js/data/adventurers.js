// Adventurer classes — base stats, equipment categories, magic schools.

export const CLASSES = {
  warrior: {
    id: "warrior",
    label: "戦士",
    blurb: "攻め重視の前衛。剣と斧、重防具を扱う。",
    base: { hp: 28, atk: 6, def: 5, luk: 2 },
    eqCats: ["weapon:sword", "weapon:axe", "armor:heavy", "trinket"],
    spellSchools: ["self-buff", "self-heal"],
    baseSlots: 1,
  },
  knight: {
    id: "knight",
    label: "騎士",
    blurb: "誓いを立て光を宿す護り手。重防御と聖印で味方を守る。",
    base: { hp: 32, atk: 5, def: 6, luk: 2 },
    eqCats: ["weapon:sword", "armor:heavy", "armor:light", "trinket"],
    spellSchools: ["self-buff", "self-heal", "holy"],
    baseSlots: 1,
  },
  mage: {
    id: "mage",
    label: "魔法使い",
    blurb: "魔石と元素を操る詠唱者。火水風の三相に長ける。",
    base: { hp: 18, atk: 3, def: 2, luk: 4 },
    eqCats: ["weapon:staff", "armor:light", "trinket"],
    spellSchools: ["attack", "support", "elemental"],
    baseSlots: 3,
  },
  thief: {
    id: "thief",
    label: "盗賊",
    blurb: "影と俊敏で稼ぐ。闇に紛れレア素材を狙う。",
    base: { hp: 20, atk: 4, def: 3, luk: 6 },
    eqCats: ["weapon:dagger", "weapon:bow", "armor:light", "trinket"],
    spellSchools: ["stealth", "support-weak", "shadow"],
    baseSlots: 1,
  },
  herbalist: {
    id: "herbalist",
    label: "薬師",
    blurb: "薬草と植物を見極める癒し手。素材品質補正に強い。",
    base: { hp: 22, atk: 3, def: 3, luk: 5 },
    eqCats: ["weapon:staff", "weapon:dagger", "armor:light", "trinket"],
    spellSchools: ["heal", "support", "plant"],
    baseSlots: 2,
  },
  hunter: {
    id: "hunter",
    label: "狩人",
    blurb: "弓と毛皮の達人。獣のドロップに精通する追跡者。",
    base: { hp: 22, atk: 5, def: 2, luk: 5 },
    eqCats: ["weapon:bow", "weapon:dagger", "armor:light", "trinket"],
    spellSchools: ["stealth", "support-weak", "self-buff"],
    baseSlots: 1,
  },
  woodcutter: {
    id: "woodcutter",
    label: "木こり",
    blurb: "森を読み、自然の素材を効率よく集める熟練者。",
    base: { hp: 28, atk: 5, def: 4, luk: 3 },
    eqCats: ["weapon:axe", "armor:heavy", "armor:light", "trinket"],
    spellSchools: ["self-buff", "self-heal"],
    baseSlots: 1,
  },
  miner: {
    id: "miner",
    label: "採掘師",
    blurb: "鉱脈と鉱石を見極めるツルハシの匠。坑道の奥深くにも臆さない。",
    base: { hp: 28, atk: 4, def: 5, luk: 3 },
    eqCats: ["weapon:axe", "weapon:pickaxe", "armor:heavy", "trinket"],
    spellSchools: ["self-buff", "self-heal"],
    baseSlots: 1,
  },
};

export const CLASS_ORDER = ["warrior", "knight", "mage", "thief", "herbalist", "hunter", "woodcutter", "miner"];

export const NAMES = {
  warrior: ["リカルド", "ブライス", "ガイル", "オルフェ", "ハンス", "ヴィルマ", "テオドラ", "クレム"],
  knight:  ["ガレス", "アルテ", "ラインハルト", "ルセリア", "イーディス", "ヴィンセント", "シャルル", "アゾラ"],
  mage:    ["シルヴィア", "アルベリク", "セレネ", "ノエラ", "ロルフ", "イサーク", "ミラベル", "コーリン"],
  thief:   ["ジェラ", "クォート", "ニコロ", "メルル", "サキ", "ドミニク", "ゼフィル", "リューン"],
  herbalist:["ミレイユ", "アンナ", "ヤスミン", "ティル", "リーリエ", "アマンダ", "ファビオ", "ベッカ"],
  hunter:  ["グレン", "シエラ", "ロディ", "テオン", "ナナ", "カイ", "リオラ", "ジン"],
  woodcutter:["ウルバン", "マーロ", "ジョルジオ", "ハーゼ", "アグネス", "ボリス", "ティム", "アロワ"],
  miner:   ["ドルブ", "クレイ", "サイモン", "オッター", "ヘルガ", "バーン", "リッター", "ゾラ"],
};

export const EXP_TABLE = [0, 30, 80, 160, 280, 450, 680, 980, 1360, 1830, 2400];

export function expForLevel(lv) {
  if (lv <= 1) return 0;
  if (lv >= EXP_TABLE.length) return EXP_TABLE[EXP_TABLE.length - 1] + (lv - EXP_TABLE.length + 1) * 800;
  return EXP_TABLE[lv - 1];
}
