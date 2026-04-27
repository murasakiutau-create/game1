// Magic elements + affinity table.
//   火 → 風 (×1.5), 水 (×0.7)
//   水 → 火 (×1.5), 風 (×0.7)
//   風 → 水 (×1.5), 火 (×0.7)
//   光 ↔ 闇 are mutual weaknesses (×1.5 both ways)
//   無属性 (none) is always ×1.0
//
// Defending side reverses the relationship: a 火 attack hitting a 火 mob does
// ×1.0 (same element neutral), and a 風 mob takes ×1.5 from 火.

export const ELEMENTS = {
  fire:    { id: "fire",    label: "火",   color: "#c84a2a", glyph: "🜂" },
  water:   { id: "water",   label: "水",   color: "#3a6fa8", glyph: "🜄" },
  wind:    { id: "wind",    label: "風",   color: "#6a8c4a", glyph: "🜁" },
  light:   { id: "light",   label: "光",   color: "#cfa84e", glyph: "☼" },
  dark:    { id: "dark",    label: "闇",   color: "#5a3a78", glyph: "☾" },
  none:    { id: "none",    label: "無",   color: "#7a6248", glyph: "·" },
};

const STRONG = {
  fire:  "wind",
  wind:  "water",
  water: "fire",
  light: "dark",
  dark:  "light",
};
const WEAK = {
  fire:  "water",
  wind:  "fire",
  water: "wind",
};

export function elementMult(attackElem, defenderElem) {
  if (!attackElem || !defenderElem || attackElem === "none" || defenderElem === "none") return 1.0;
  if (STRONG[attackElem] === defenderElem) return 1.5;
  if (WEAK[attackElem] === defenderElem) return 0.7;
  return 1.0;
}

export function elementLabel(id) {
  return ELEMENTS[id]?.label || "—";
}
