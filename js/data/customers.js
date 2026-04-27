// Customer archetypes — different preferences by reputation tier.
// `wants` lists item categories with weights; `quality` is min acceptable.
// `repBonus` = reputation gained per successful sale.
// `priceBias` is multiplier applied on top of computed price.

export const CUSTOMER_TYPES = {
  villager:    { id: "villager",    name: "村人",       wants: { potion: 60, trinket: 15 },                      quality: ["poor","norm"],                     repBonus: 1, priceBias: 0.85 },
  apprentice:  { id: "apprentice",  name: "駆け出し冒険者", wants: { potion: 40, weapon: 25, armor: 20, tome: 10 }, quality: ["norm"],                            repBonus: 2, priceBias: 0.95 },
  veteran:     { id: "veteran",     name: "熟練冒険者",  wants: { potion: 30, weapon: 25, armor: 25, tome: 20, trinket: 10 }, quality: ["norm","good"],          repBonus: 3, priceBias: 1.05 },
  merchant:    { id: "merchant",    name: "行商人",     wants: { potion: 30, tome: 30, trinket: 25, weapon: 10, armor: 10 }, quality: ["norm","good"],            repBonus: 3, priceBias: 1.10 },
  noble:       { id: "noble",       name: "貴族",       wants: { tome: 30, trinket: 35, potion: 20, weapon: 15, armor: 10 }, quality: ["good","fine"],            repBonus: 6, priceBias: 1.35 },
  archmage:    { id: "archmage",    name: "大魔導士",   wants: { tome: 50, potion: 30, trinket: 20 },             quality: ["good","fine"],                     repBonus: 8, priceBias: 1.45 },
};

// Pool weights by reputation tier index (0-3).
export const POOL_BY_TIER = [
  { villager: 70, apprentice: 30 },                                   // 新参
  { villager: 40, apprentice: 35, veteran: 20, merchant: 5 },         // 中堅
  { villager: 15, apprentice: 25, veteran: 35, merchant: 18, noble: 7 }, // 有名
  { apprentice: 10, veteran: 28, merchant: 22, noble: 28, archmage: 12 } // 伝説
];

// Number of customers per day, by tier.
export const CUSTOMERS_PER_DAY_BY_TIER = [4, 6, 8, 10];
