// Strategy presets — control how an adventurer behaves in encounters.
// Custom strategies are arrays of {trigger, value, action, school?, spellId?}.

export const STRATEGY_PRESETS = {
  standard: {
    id: "standard",
    label: "標準",
    blurb: "攻撃魔法→通常攻撃。HP30%以下で治癒。",
    rules: [
      { trigger: "hpPctLT", value: 30, action: "castSchool", school: "heal" },
      { trigger: "hpPctLT", value: 30, action: "castSchool", school: "self-heal" },
      { trigger: "always",  action: "castSchool", school: "attack" },
      { trigger: "always",  action: "castSchool", school: "elemental" },
      { trigger: "always",  action: "attack" },
    ],
  },
  aggressive: {
    id: "aggressive",
    label: "攻撃優先",
    blurb: "毎ターン攻撃魔法を優先。治癒は40%以下から。",
    rules: [
      { trigger: "hpPctLT", value: 40, action: "castSchool", school: "heal" },
      { trigger: "hpPctLT", value: 40, action: "castSchool", school: "self-heal" },
      { trigger: "always",  action: "castSchool", school: "elemental" },
      { trigger: "always",  action: "castSchool", school: "attack" },
      { trigger: "always",  action: "castSchool", school: "plant" },
      { trigger: "always",  action: "attack" },
    ],
  },
  defensive: {
    id: "defensive",
    label: "回復優先",
    blurb: "HP60%以下で即治癒。攻撃魔法は2ターンに1回。",
    rules: [
      { trigger: "hpPctLT", value: 60, action: "castSchool", school: "heal" },
      { trigger: "hpPctLT", value: 60, action: "castSchool", school: "self-heal" },
      { trigger: "everyN",  value: 2,  action: "castSchool", school: "attack" },
      { trigger: "everyN",  value: 2,  action: "castSchool", school: "elemental" },
      { trigger: "always",  action: "castSchool", school: "support" },
      { trigger: "always",  action: "castSchool", school: "self-buff" },
      { trigger: "always",  action: "attack" },
    ],
  },
  conservative: {
    id: "conservative",
    label: "温存",
    blurb: "通常攻撃中心。魔法は危機時のみ。",
    rules: [
      { trigger: "hpPctLT", value: 25, action: "castSchool", school: "heal" },
      { trigger: "hpPctLT", value: 25, action: "castSchool", school: "self-heal" },
      { trigger: "hpPctLT", value: 40, action: "castSchool", school: "self-buff" },
      { trigger: "always",  action: "attack" },
    ],
  },
  blitz: {
    id: "blitz",
    label: "速攻",
    blurb: "隠密／速度系を初手で発動、短期決戦狙い。",
    rules: [
      { trigger: "turnEq",  value: 1, action: "castSchool", school: "stealth" },
      { trigger: "turnEq",  value: 1, action: "castSchool", school: "self-buff" },
      { trigger: "always",  action: "castSchool", school: "elemental" },
      { trigger: "always",  action: "castSchool", school: "attack" },
      { trigger: "always",  action: "attack" },
    ],
  },
  custom: {
    id: "custom",
    label: "カスタム",
    blurb: "条件と動作を1〜3つまで自分で設定。",
    rules: [], // populated per-adventurer in state.customStrategy
  },
};

export const STRATEGY_ORDER = ["standard", "aggressive", "defensive", "conservative", "blitz", "custom"];

// Action + trigger options for the custom builder UI
export const TRIGGER_OPTIONS = [
  { id: "always",  label: "毎ターン" },
  { id: "hpPctLT", label: "HP◯%以下", needsValue: true, defaultValue: 50 },
  { id: "turnEq",  label: "◯ターン目", needsValue: true, defaultValue: 1 },
  { id: "everyN",  label: "◯ターン毎", needsValue: true, defaultValue: 2 },
];

export const ACTION_OPTIONS = [
  { id: "attack", label: "通常攻撃", needsSchool: false },
  { id: "castSchool", label: "魔法を使う（系統）", needsSchool: true },
  { id: "useItem", label: "アイテムを使う", needsItem: true },
  { id: "flee", label: "敗走", needsSchool: false },
];

export const SCHOOL_OPTIONS = [
  { id: "self-heal", label: "自己治癒" },
  { id: "self-buff", label: "自己強化" },
  { id: "heal", label: "治癒" },
  { id: "support", label: "補助" },
  { id: "support-weak", label: "補助(弱)" },
  { id: "attack", label: "攻撃" },
  { id: "elemental", label: "元素" },
  { id: "stealth", label: "隠密" },
  { id: "plant", label: "植物" },
];
