// Spells learnable from spellbooks. `school` matches a class's spellSchools.
// `element` is one of: fire / water / wind / light / dark / none.
// Most offensive/healing spells have an element; pure self-buffs may be `none`.
// Effects always include at least one combat-relevant action (damage, healing,
// buff, debuff, revive). Some also confer a gather-side bonus, but never gather-only.

export const SPELLS = {
  // Self-tier (warrior, knight, others)
  self_mend:    { id: "self_mend",    name: "自己手当",   school: "self-heal", element: "none",  power: 0.20, mp: 4, blurb: "戦闘中、自身のHPを20%回復する。" },
  battle_aura:  { id: "battle_aura",  name: "闘気",       school: "self-buff", element: "none",  power: 1.30, mp: 3, blurb: "数ターンの間、攻撃力が3割上昇。" },
  iron_skin:    { id: "iron_skin",    name: "鉄壁",       school: "self-buff", element: "none",  power: 0.50, mp: 3, blurb: "次の被弾を半減する。" },

  // Knight (holy, light element)
  holy_seal:    { id: "holy_seal",    name: "聖印",       school: "holy",      element: "light", power: 0.30, mp: 4, blurb: "光が傷を塞ぎHPを30%回復、闇属性敵に小ダメージ。" },
  light_smite:  { id: "light_smite",  name: "光輝の刃",   school: "holy",      element: "light", power: 11,   mp: 4, blurb: "聖なる光で7〜14ダメージ。闇属性に強い。" },
  divine_ward:  { id: "divine_ward",  name: "聖域の祈り", school: "holy",      element: "light", power: 0.40, mp: 4, blurb: "次2ターン、被ダメージを4割軽減。" },

  // Mage attack/element
  spark:        { id: "spark",        name: "火花",       school: "elemental", element: "fire",  power: 8,    mp: 2, blurb: "炎で5〜11ダメージ。風属性に強い。" },
  fire_lance:   { id: "fire_lance",   name: "焔の槍",     school: "elemental", element: "fire",  power: 14,   mp: 4, blurb: "焔の槍で9〜18ダメージ。" },
  frost_bolt:   { id: "frost_bolt",   name: "氷の矢",     school: "elemental", element: "water", power: 12,   mp: 4, blurb: "氷で7〜16ダメージ。命中時に行動阻害。火属性に強い。" },
  gale_cutter:  { id: "gale_cutter",  name: "風刃",       school: "elemental", element: "wind",  power: 10,   mp: 3, blurb: "風で6〜13ダメージ。鉱石採取数+1。水属性に強い。" },
  arcane_pulse: { id: "arcane_pulse", name: "魔導の波",   school: "attack",    element: "none",  power: 10,   mp: 3, blurb: "魔力で7〜13ダメージ。属性中立。" },
  hex_ward:     { id: "hex_ward",     name: "呪文の盾",   school: "support",   element: "none",  power: 0.40, mp: 4, blurb: "魔法ダメージを4割軽減する膜。" },

  // Thief stealth/shadow (dark element)
  shadow_step:  { id: "shadow_step",  name: "闇隠れ",     school: "stealth",   element: "dark",  power: 0.20, mp: 3, blurb: "敗走時のペナルティ無効化、レア素材+5%。" },
  pilfer:       { id: "pilfer",       name: "掠め取り",   school: "stealth",   element: "dark",  power: 4,    mp: 2, blurb: "2〜5ダメージ＋戦闘終了時に追加素材1点。" },
  smoke_veil:   { id: "smoke_veil",   name: "煙幕",       school: "support-weak", element: "none", power: 0.20, mp: 3, blurb: "敵の命中を2割下げる。" },
  night_blade:  { id: "night_blade",  name: "夜の刃",     school: "shadow",    element: "dark",  power: 9,    mp: 3, blurb: "闇で5〜12ダメージ。光属性に強い。" },

  // Herbalist heal/plant
  thorn_balm:   { id: "thorn_balm",   name: "茨の癒し",   school: "heal",      element: "none",  power: 0.10, mp: 3, blurb: "薬草の品質期待値+1段、HPを軽く回復。" },
  rebirth_seed: { id: "rebirth_seed", name: "再生の種",   school: "heal",      element: "light", power: 1,    mp: 6, blurb: "戦闘不能時、1回だけHP1で蘇生。" },
  bramble_call: { id: "bramble_call", name: "茨蔓の呼び", school: "plant",     element: "wind",  power: 6,    mp: 3, blurb: "蔦の鞭で4〜8ダメージ＋採取数+1。" },
  spore_haze:   { id: "spore_haze",   name: "胞子の靄",   school: "support",   element: "dark",  power: 0.30, mp: 3, blurb: "敵の攻撃を3割軽減。" },
  cure_chant:   { id: "cure_chant",   name: "癒しの詠唱", school: "heal",      element: "light", power: 0.35, mp: 4, blurb: "HPを35%回復、闇属性敵に小ダメージ。" },

  // Universal-ish / utility
  prospect_wind:{ id: "prospect_wind",name: "採掘の風",   school: "elemental", element: "wind",  power: 4,    mp: 2, blurb: "風で2〜6ダメージ＋鉱石採取+20%。" },
};

export function spellsAllowedForClass(cls) {
  if (!cls) return [];
  return Object.values(SPELLS).filter(s => cls.spellSchools.includes(s.school));
}

export function isSpellAllowed(spellId, cls) {
  const s = SPELLS[spellId];
  if (!s || !cls) return false;
  return cls.spellSchools.includes(s.school);
}
