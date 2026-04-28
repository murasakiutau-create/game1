import type { PlayerState } from '../game/state';
import type { SlotIndex } from '../game/save';
import { saveToSlot } from '../game/save';
import { renderTitle } from './title';
import { renderTown } from './town';
import { renderWorkshop } from './workshop';
import { renderShop } from './shop';
import { renderLoadout } from './loadout';
import { renderInventory } from './inventory';
import { renderSaveMenu } from './saveMenu';
import { renderDungeon } from './dungeon';
import { renderBattle } from './battle';

export type Screen =
  | { kind: 'title' }
  | { kind: 'town' }
  | { kind: 'workshop' }
  | { kind: 'shop' }
  | { kind: 'loadout' }
  | { kind: 'inventory' }
  | { kind: 'saveMenu' }
  | { kind: 'dungeon' }
  | { kind: 'battle' };

export interface AppContext {
  root: HTMLElement;
  player: PlayerState | null;
  slot: SlotIndex | null;
  goto: (s: Screen) => void;
  startGame: (player: PlayerState, slot: SlotIndex) => void;
  saveCurrent: () => Promise<void>;
}

export function createApp(root: HTMLElement): AppContext {
  const ctx: AppContext = {
    root,
    player: null,
    slot: null,
    goto: (_s: Screen) => { /* set below */ },
    startGame: (player, slot) => {
      ctx.player = player;
      ctx.slot = slot;
      ctx.goto({ kind: 'town' });
    },
    saveCurrent: async () => {
      if (ctx.player && ctx.slot) {
        await saveToSlot(ctx.slot, ctx.player);
      }
    },
  };

  ctx.goto = (s: Screen) => {
    void render(ctx, s);
  };

  // 初回はタイトル画面
  void render(ctx, { kind: 'title' });

  return ctx;
}

async function render(ctx: AppContext, screen: Screen): Promise<void> {
  switch (screen.kind) {
    case 'title':
      await renderTitle(ctx);
      break;
    case 'town':
      // 拠点に来たら自動セーブ
      await ctx.saveCurrent();
      renderTown(ctx);
      break;
    case 'workshop':
      renderWorkshop(ctx);
      break;
    case 'shop':
      renderShop(ctx);
      break;
    case 'loadout':
      renderLoadout(ctx);
      break;
    case 'inventory':
      renderInventory(ctx);
      break;
    case 'saveMenu':
      await renderSaveMenu(ctx);
      break;
    case 'dungeon':
      renderDungeon(ctx);
      break;
    case 'battle':
      renderBattle(ctx);
      break;
  }
}
