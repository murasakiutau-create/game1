export type Element = 'fire' | 'water' | 'wind' | 'light' | 'dark';

export const ELEMENTS: readonly Element[] = ['fire', 'water', 'wind', 'light', 'dark'] as const;

export const ELEMENT_LABEL: Record<Element, string> = {
  fire: '火',
  water: '水',
  wind: '風',
  light: '光',
  dark: '闇',
};

export const ELEMENT_GLYPH: Record<Element, string> = {
  fire: '🔥',
  water: '💧',
  wind: '🌪',
  light: '✨',
  dark: '🌑',
};

// 弱点関係：attacker → defender に強い
export const ELEMENT_STRONG_AGAINST: Record<Element, Element> = {
  fire: 'wind',
  wind: 'water',
  water: 'fire',
  light: 'dark',
  dark: 'light',
};

export function elementMultiplier(attacker: Element | undefined, defender: Element | undefined): number {
  if (!attacker || !defender) return 1;
  if (attacker === defender) return 0.5;
  if (ELEMENT_STRONG_AGAINST[attacker] === defender) return 1.5;
  if (ELEMENT_STRONG_AGAINST[defender] === attacker) return 0.75;
  return 1;
}
