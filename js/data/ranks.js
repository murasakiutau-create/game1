// Adventurer rank table (F → S).
// Rank is fixed at hire; only stats grow via level-up. Magic slot count is
// determined by class base + rank.slotBonus and never changes after hire.

// `passiveSlots` is the cap on equipped passive skills:
//   F:0  / E,D,C:1 / B,A:2 / S:3
export const RANKS = {
  F: { id: "F", label: "F", hireCost: 50,    dailyWage: 5,    statBonus: 0,  slotBonus: 0, passiveSlots: 0, repRequired: 0   },
  E: { id: "E", label: "E", hireCost: 150,   dailyWage: 12,   statBonus: 2,  slotBonus: 0, passiveSlots: 1, repRequired: 0   },
  D: { id: "D", label: "D", hireCost: 400,   dailyWage: 30,   statBonus: 5,  slotBonus: 1, passiveSlots: 1, repRequired: 0   },
  C: { id: "C", label: "C", hireCost: 1000,  dailyWage: 70,   statBonus: 9,  slotBonus: 1, passiveSlots: 1, repRequired: 50  },
  B: { id: "B", label: "B", hireCost: 2500,  dailyWage: 160,  statBonus: 14, slotBonus: 2, passiveSlots: 2, repRequired: 50  },
  A: { id: "A", label: "A", hireCost: 6000,  dailyWage: 350,  statBonus: 20, slotBonus: 2, passiveSlots: 2, repRequired: 200 },
  S: { id: "S", label: "S", hireCost: 15000, dailyWage: 800,  statBonus: 28, slotBonus: 3, passiveSlots: 3, repRequired: 600 },
};

export const RANK_ORDER = ["F", "E", "D", "C", "B", "A", "S"];

// Probability weights for the daily hire market by reputation tier.
// Index: 0=新参 1=中堅 2=有名 3=伝説
export const MARKET_WEIGHTS = {
  F: [50, 30, 14, 6],
  E: [35, 35, 22, 12],
  D: [12, 25, 28, 18],
  C: [3,  8,  20, 22],
  B: [0,  2,  10, 18],
  A: [0,  0,  5,  14],
  S: [0,  0,  1,  10],
};

export function rankRequirementMet(rankId, repTierIndex) {
  return repTierIndex >= [0,0,0,0,0,2,3]["FEDCBAS".indexOf(rankId)];
}
