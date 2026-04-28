import type { EnemyId } from './enemies';

export interface DungeonFloor {
  floor: number;
  name: string;
  description: string;
  encounters: EnemyId[]; // この階で出るかもしれない敵
  isBoss?: boolean;
}

export const DUNGEON: DungeonFloor[] = [
  {
    floor: 1,
    name: '廃都・崩れた門',
    description: '蔦に呑まれた石門。スライムが這いずる。',
    encounters: ['venom_slime', 'venom_slime', 'shell_crab'],
  },
  {
    floor: 2,
    name: '廃都・苔の街路',
    description: '緑色の靄が漂う通り。',
    encounters: ['venom_slime', 'shell_crab', 'spore_wraith'],
  },
  {
    floor: 3,
    name: '廃都・崩落広場',
    description: '崩れた塔の影で、亡霊が囁く。',
    encounters: ['shell_crab', 'spore_wraith', 'spore_wraith'],
  },
  {
    floor: 4,
    name: '廃都・残火の路地',
    description: '消えぬ火がそこかしこに灯る。',
    encounters: ['spore_wraith', 'ember_imp', 'ember_imp'],
  },
  {
    floor: 5,
    name: '廃都・嵐の塔跡',
    description: '吹き上がる風が螺旋を描く。',
    encounters: ['ember_imp', 'wind_serpent', 'wind_serpent'],
  },
  {
    floor: 6,
    name: '廃都・最奥の祭壇',
    description: '主が眠る場所。',
    encounters: ['boss_chimera'],
    isBoss: true,
  },
];

export const MAX_FLOOR = DUNGEON.length;
