// Equipment definitions. `cat` matches CLASSES[*].eqCats.
// Effects are additive deltas applied during dispatch/encounter.

export const EQUIPMENT = {
  // Weapons
  rusted_sword:    { id: "rusted_sword",    name: "錆びた剣",       cat: "weapon:sword",  atk: 2, mat: 1.0, gather: 0,    qty: 0, rarity: 0 },
  iron_sword:      { id: "iron_sword",      name: "鉄の剣",         cat: "weapon:sword",  atk: 4, mat: 1.0, gather: 0,    qty: 0, rarity: 0 },
  silver_sword:    { id: "silver_sword",    name: "銀の長剣",       cat: "weapon:sword",  atk: 7, mat: 1.05, gather: 0,   qty: 0, rarity: 0 },
  hand_axe:        { id: "hand_axe",        name: "手斧",           cat: "weapon:axe",    atk: 3, mat: 1.0, gather: 1,   qty: 0, rarity: 0 },
  battle_axe:      { id: "battle_axe",      name: "戦斧",           cat: "weapon:axe",    atk: 6, mat: 1.0, gather: 1,   qty: 0, rarity: 0 },
  apprentice_staff:{ id: "apprentice_staff",name: "見習いの杖",     cat: "weapon:staff",  atk: 2, mat: 1.05, gather: 0,  qty: 0, rarity: 0 },
  oak_staff:       { id: "oak_staff",       name: "樫の杖",         cat: "weapon:staff",  atk: 3, mat: 1.10, gather: 0,  qty: 0, rarity: 0 },
  rune_staff:      { id: "rune_staff",      name: "刻印の杖",       cat: "weapon:staff",  atk: 5, mat: 1.15, gather: 0,  qty: 0, rarity: 1 },
  thieves_dagger:  { id: "thieves_dagger",  name: "盗人の短剣",     cat: "weapon:dagger", atk: 3, mat: 1.0, gather: 0,   qty: 1, rarity: 1 },
  silvered_dagger: { id: "silvered_dagger", name: "銀めっき短剣",   cat: "weapon:dagger", atk: 5, mat: 1.0, gather: 0,   qty: 1, rarity: 2 },
  short_bow:       { id: "short_bow",       name: "短弓",           cat: "weapon:bow",    atk: 4, mat: 1.0, gather: 1,   qty: 0, rarity: 1 },
  hunting_bow:     { id: "hunting_bow",     name: "狩人弓",         cat: "weapon:bow",    atk: 6, mat: 1.0, gather: 1,   qty: 1, rarity: 1 },
  woodaxe:         { id: "woodaxe",         name: "杣の斧",         cat: "weapon:axe",    atk: 4, mat: 1.05, gather: 2,  qty: 1, rarity: 0 },
  pickaxe:         { id: "pickaxe",         name: "ツルハシ",       cat: "weapon:pickaxe",atk: 3, mat: 1.0, gather: 2,   qty: 1, rarity: 0, oreBonus: 0.20 },
  master_pickaxe:  { id: "master_pickaxe",  name: "鋼のツルハシ",   cat: "weapon:pickaxe",atk: 5, mat: 1.0, gather: 2,   qty: 1, rarity: 1, oreBonus: 0.30 },

  // Armor
  cloth_robe:      { id: "cloth_robe",      name: "亜麻のローブ",    cat: "armor:light", def: 2, mat: 1.0, gather: 0, qty: 0, rarity: 0 },
  leather_vest:    { id: "leather_vest",    name: "革のベスト",      cat: "armor:light", def: 4, mat: 1.0, gather: 0, qty: 0, rarity: 0 },
  iron_mail:       { id: "iron_mail",       name: "鉄の鎖帷子",      cat: "armor:heavy", def: 7, mat: 1.0, gather: 0, qty: 0, rarity: 0 },
  steel_plate:     { id: "steel_plate",     name: "鋼の胸甲",        cat: "armor:heavy", def: 10, mat: 1.0, gather: 0, qty: 0, rarity: 0 },

  // Trinkets
  lucky_charm:     { id: "lucky_charm",     name: "兎の足のお守り", cat: "trinket", luk: 2, mat: 1.0, gather: 0, qty: 0, rarity: 1 },
  herbalists_pouch:{ id: "herbalists_pouch",name: "薬師の小袋",      cat: "trinket", luk: 1, mat: 1.0, gather: 1, qty: 1, rarity: 0 },
  miners_lamp:     { id: "miners_lamp",     name: "坑夫の角灯",      cat: "trinket", luk: 0, mat: 1.0, gather: 1, qty: 1, rarity: 0, oreBonus: 0.15 },
  crystal_pendant: { id: "crystal_pendant", name: "結晶の首飾り",    cat: "trinket", luk: 1, mat: 1.05, gather: 0, qty: 0, rarity: 1 },

  // ── 上位（評判解禁素材で作る）
  moonlight_robe:  { id: "moonlight_robe",  name: "月光のローブ",    cat: "armor:light", def: 8,  mat: 1.10, gather: 0, qty: 0, rarity: 2 },
  moonlight_staff: { id: "moonlight_staff", name: "月光の杖",        cat: "weapon:staff",atk: 8,  mat: 1.20, gather: 0, qty: 0, rarity: 2 },
  starlit_amulet:  { id: "starlit_amulet",  name: "星辰のお守り",    cat: "trinket",     luk: 4,  mat: 1.10, gather: 0, qty: 0, rarity: 2 },
  dragon_scale_mail:{ id: "dragon_scale_mail",name: "古竜の鱗鎧",    cat: "armor:heavy", def: 14, mat: 1.10, gather: 0, qty: 0, rarity: 3 },
};

// Mapping label for category display.
export const CAT_LABELS = {
  "weapon:sword": "剣",
  "weapon:axe":   "斧",
  "weapon:staff": "杖",
  "weapon:dagger":"短剣",
  "weapon:bow":   "弓",
  "weapon:pickaxe":"ツルハシ",
  "armor:light":  "軽防具",
  "armor:heavy":  "重防具",
  "trinket":      "装身具",
};

export function isEquipAllowed(equipId, cls) {
  const eq = EQUIPMENT[equipId];
  if (!eq || !cls) return false;
  return cls.eqCats.includes(eq.cat);
}

// Slot kind a piece occupies: weapon / armor / trinket
export function slotKind(equipId) {
  const eq = EQUIPMENT[equipId];
  if (!eq) return null;
  if (eq.cat.startsWith("weapon")) return "weapon";
  if (eq.cat.startsWith("armor")) return "armor";
  return "trinket";
}

export function isAxe(eqId)  { return EQUIPMENT[eqId]?.cat === "weapon:axe"; }
export function isBow(eqId)  { return EQUIPMENT[eqId]?.cat === "weapon:bow"; }
export function isPick(eqId) { return EQUIPMENT[eqId]?.cat === "weapon:pickaxe"; }
