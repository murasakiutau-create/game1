// Passive skills. Each adventurer can equip up to N depending on rank
// (F:0, E-C:1, B-A:2, S:3). Some passives are class-locked specialties
// (hunter:monster-drop, woodcutter:plant, miner:ore); the rest are universal.

export const PASSIVES = {
  // ---- Class-locked specialties ----
  hunter_drop:    { id: "hunter_drop",    name: "狩人の眼",       blurb: "モンスタードロップ確率 +25%。", classLock: "hunter",     effect: { mobDrop: 0.25 } },
  hunter_aim:     { id: "hunter_aim",     name: "弓手の構え",     blurb: "通常攻撃ダメージ +25%（弓限定）。", classLock: "hunter",  effect: { bowAtkBoost: 0.25 } },
  woodcut_plant:  { id: "woodcut_plant",  name: "森の知恵",       blurb: "自然素材（木・葉・花・茨）採取数 +1〜2。", classLock: "woodcutter", effect: { plantGather: 0.5 } },
  woodcut_axes:   { id: "woodcut_axes",   name: "斧の友",         blurb: "斧装備時、通常攻撃力 +20%。", classLock: "woodcutter",  effect: { axeAtkBoost: 0.20 } },
  miner_ore:      { id: "miner_ore",      name: "鉱脈の感",       blurb: "鉱石（鉄・銀・砂金など）採取数 +1〜2。", classLock: "miner",  effect: { oreGather: 0.5 } },
  miner_endure:   { id: "miner_endure",   name: "坑夫の体躯",     blurb: "最大HP +8、被ダメ -10%。", classLock: "miner",       effect: { hpBonus: 8, damageReduce: 0.10 } },

  // ---- Universal ----
  rare_finder:    { id: "rare_finder",    name: "目敏い鼻",       blurb: "レア素材出現率 +6%。",                 effect: { rareBoost: 0.06 } },
  gather_extra:   { id: "gather_extra",   name: "袋持ち",         blurb: "採取の総回数 +2。",                    effect: { extraRolls: 2 } },
  exp_up:         { id: "exp_up",         name: "学びの旅",       blurb: "獲得経験値 +30%。",                    effect: { expMult: 1.30 } },
  hp_up:          { id: "hp_up",          name: "頑強",           blurb: "最大HP +10。",                          effect: { hpBonus: 10 } },
  atk_up:         { id: "atk_up",         name: "鍛錬",           blurb: "攻撃力 +3。",                           effect: { atkBonus: 3 } },
  def_up:         { id: "def_up",         name: "受けの巧み",     blurb: "守備力 +3。",                           effect: { defBonus: 3 } },
  crit:           { id: "crit",           name: "急所狙い",       blurb: "通常攻撃クリティカル率 +15%（ダメ1.5倍）。", effect: { critRate: 0.15 } },
  evade:          { id: "evade",          name: "身軽",           blurb: "敵の命中 -10%。",                       effect: { mobAccDown: 0.10 } },
  flee_safe:      { id: "flee_safe",      name: "逃げ足",         blurb: "敗走時のペナルティ無効。",              effect: { fleeSafe: true } },
  magic_aff:      { id: "magic_aff",      name: "魔の気質",       blurb: "魔法ダメージ +15%。",                   effect: { magicDmgMult: 1.15 } },
};

export const PASSIVE_ORDER = [
  "rare_finder", "gather_extra", "exp_up", "hp_up", "atk_up", "def_up", "crit", "evade", "flee_safe", "magic_aff",
  "hunter_drop", "hunter_aim", "woodcut_plant", "woodcut_axes", "miner_ore", "miner_endure",
];

export function passivesAllowedForClass(classId) {
  return PASSIVE_ORDER
    .map(id => PASSIVES[id])
    .filter(p => !p.classLock || p.classLock === classId);
}

// rank -> max passive slot count
export function passiveSlotsForRank(rankId) {
  if (rankId === "S") return 3;
  if (rankId === "A" || rankId === "B") return 2;
  if (rankId === "C" || rankId === "D" || rankId === "E") return 1;
  return 0; // F
}
