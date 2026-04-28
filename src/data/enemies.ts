import type { Element } from './elements';
import type { MaterialId } from './materials';

export type EnemyId =
  | 'venom_slime'
  | 'shell_crab'
  | 'spore_wraith'
  | 'ember_imp'
  | 'wind_serpent'
  | 'boss_chimera';

export interface Enemy {
  id: EnemyId;
  name: string;
  hp: number;
  atk: number;
  def: number;
  element?: Element;
  asciiArt: string;
  goldDrop: [number, number]; // [min, max]
  drops: { material: MaterialId; chance: number }[];
  isBoss?: boolean;
}

export const ENEMIES: Record<EnemyId, Enemy> = {
  venom_slime: {
    id: 'venom_slime',
    name: '毒スライム',
    hp: 28,
    atk: 5,
    def: 0,
    element: 'dark',
    asciiArt:
`     .-""-.
    /  o o \\
   |  ~~~~  |
    \\______/`,
    goldDrop: [4, 8],
    drops: [{ material: 'venom_gland', chance: 0.85 }],
  },
  shell_crab: {
    id: 'shell_crab',
    name: '岩甲蟹',
    hp: 42,
    atk: 6,
    def: 4,
    asciiArt:
`   __    __
  (  \\__/  )
   \\(••••)/
    /vvvv\\`,
    goldDrop: [6, 12],
    drops: [{ material: 'hard_carapace', chance: 0.80 }, { material: 'sharp_ore', chance: 0.30 }],
  },
  spore_wraith: {
    id: 'spore_wraith',
    name: '胞子の亡霊',
    hp: 36,
    atk: 8,
    def: 1,
    element: 'dark',
    asciiArt:
`    .---.
   ( ^_^ )
   /  o  \\
   '--v--' `,
    goldDrop: [10, 18],
    drops: [{ material: 'dark_spore', chance: 0.60 }, { material: 'pure_water', chance: 0.20 }],
  },
  ember_imp: {
    id: 'ember_imp',
    name: '残火の小鬼',
    hp: 50,
    atk: 10,
    def: 2,
    element: 'fire',
    asciiArt:
`    /\\^^/\\
   ( o  o )
    \\ <> /
     ~~~~`,
    goldDrop: [14, 22],
    drops: [{ material: 'fire_core', chance: 0.55 }, { material: 'sharp_ore', chance: 0.25 }],
  },
  wind_serpent: {
    id: 'wind_serpent',
    name: '風蛇',
    hp: 58,
    atk: 11,
    def: 2,
    element: 'wind',
    asciiArt:
`   ~~~~~~~
  /  ●●   \\
  \\__~~~__/
       ~~~~`,
    goldDrop: [16, 26],
    drops: [{ material: 'wind_feather', chance: 0.65 }, { material: 'glowstone', chance: 0.20 }],
  },
  boss_chimera: {
    id: 'boss_chimera',
    name: '【廃都の主】融合キマイラ',
    hp: 220,
    atk: 14,
    def: 5,
    element: 'dark',
    isBoss: true,
    asciiArt:
`     ▄▄▄▄▄▄▄
   ▄█ ◉  ◉ █▄
  ██   ▼▼   ██
   ▀█▀▀▀▀▀█▀
    /│   │\\
   ╱ │   │ ╲
      ▓▓▓
   全てを呑む者`,
    goldDrop: [80, 120],
    drops: [
      { material: 'dark_spore', chance: 1.0 },
      { material: 'fire_core', chance: 1.0 },
      { material: 'glowstone', chance: 1.0 },
      { material: 'wind_feather', chance: 1.0 },
    ],
  },
};
