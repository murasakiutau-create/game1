// 簡易動作確認：ビルド済みdist内を読むのではなく、tsx的にtsconfigを使って
// game/* と data/* をimportしてコアロジックをsmoke testする。
//
// Node 22 + ESM。crypto.subtle, btoa, atob, TextEncoder, localStorage shim。
//
// 実行: node --experimental-strip-types scripts/smoke.mjs

import { strict as assert } from 'node:assert';

// localStorage shim
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};

// __SAVE_KEY__ shim
globalThis.__SAVE_KEY__ = 'smoke-test-key';

const { createInitialPlayer, effectiveStats, fullHeal } = await import('../src/game/state.ts');
const { craft } = await import('../src/game/crafting.ts');
const {
  saveToSlot,
  loadFromSlot,
  exportSlot,
  importString,
  importToSlot,
  readSlotMeta,
} = await import('../src/game/save.ts');
const { startBattle, playerAct } = await import('../src/game/battle.ts');
const { ENEMIES } = await import('../src/data/enemies.ts');
const { buyEquipment, equipItem } = await import('../src/game/shop.ts');
const { applyVictory, advanceFloor } = await import('../src/game/dungeon.ts');

function header(s) { console.log(`\n── ${s} ──`); }

header('1. 初期プレイヤー');
let p = createInitialPlayer();
console.log('hp/maxHp:', p.hp, p.baseMaxHp);
console.log('atk/def:', p.baseAtk, p.baseDef);
console.log('gold:', p.gold);
console.log('materials:', Object.entries(p.materials).filter(([,v]) => v > 0));

header('2. 調合：成功（毒液腺+鋭利な鉱石+闇 → 毒の刃）');
const r1 = craft(p, 'venom_gland', 'sharp_ore', 'dark');
console.log(JSON.stringify(r1));
assert.equal(r1.outcome.kind, 'success_new');
assert.equal(r1.outcome.skillId, 'poison_blade');

header('3. 調合：失敗をたくさん試して3種出るか');
const outcomes = { success: 0, fail_gold: 0, fail_stat: 0, fail_mut: 0 };
for (let i = 0; i < 200; i++) {
  // 強制的に大量素材を補充
  p.materials.venom_gland += 1;
  p.materials.hard_carapace += 1;
  // (venom_gland, hard_carapace, fire) は未定義レシピのはず
  const r = craft(p, 'venom_gland', 'hard_carapace', 'fire');
  if ('error' in r) continue;
  switch (r.outcome.kind) {
    case 'success_new': case 'success_known': outcomes.success++; break;
    case 'failure_gold': outcomes.fail_gold++; break;
    case 'failure_stat': outcomes.fail_stat++; break;
    case 'failure_mutation': outcomes.fail_mut++; break;
  }
}
console.log('200試行の内訳:', outcomes);
assert(outcomes.fail_gold > 0, 'gold失敗が一度も出ていない');
assert(outcomes.fail_stat > 0, 'stat失敗が一度も出ていない');

header('4. 装備購入と装備ステータス反映');
p.gold = 1000;
const buyResult = buyEquipment(p, 'iron_blade');
console.log('購入:', buyResult);
equipItem(p, 'iron_blade');
const eff = effectiveStats(p);
console.log('装備後ATK:', eff.atk, '（基本6 + 鉄の刃5 + 永久ボーナス）');
assert(eff.atk >= 11);

header('5. セーブ → ロード（HMAC検証）');
await saveToSlot(1, p);
const loaded = await loadFromSlot(1);
console.log('ロード成功:', loaded.ok);
assert(loaded.ok);
assert.equal(loaded.player.gold, p.gold);

header('6. 改竄検出：localStorage直接書換');
const raw = localStorage.getItem('game1:slot:1');
const parsed = JSON.parse(raw);
parsed.payload.gold = 999999; // 改竄！
localStorage.setItem('game1:slot:1', JSON.stringify(parsed));
const tampered = await loadFromSlot(1);
console.log('改竄ロード結果:', tampered);
assert.equal(tampered.ok, false);

header('7. エクスポート → インポート（往復）');
// クリーンに保存し直し
p.gold = 12345;
await saveToSlot(2, p);
const exported = await exportSlot(2);
console.log('エクスポート文字列の先頭40文字:', exported.slice(0, 40));
assert(exported.startsWith('GAME1-'));
const imp = await importString(exported);
assert(imp.ok, 'インポート失敗');
assert.equal(imp.slot.payload.gold, 12345);

header('8. インポート文字列を1文字書き換えると拒否');
const broken = exported.slice(0, exported.length - 5) + 'XXXXX';
const impBroken = await importString(broken);
console.log('破損インポート結果:', impBroken);
assert.equal(impBroken.ok, false);

header('9. 戦闘：スライム1体撃破');
p.equippedSkills = ['poison_blade', 'basic_strike', null, null, null];
const slime = ENEMIES.venom_slime;
const battle = startBattle(p, slime);
let safety = 0;
while (!battle.ended && safety++ < 30) {
  playerAct(battle, p, 'poison_blade');
}
console.log('結果:', battle.result, '残ターン:', battle.turn, 'log末尾:', battle.log.slice(-3));
assert.equal(battle.result, 'win');

header('10. 勝利報酬適用');
const v = applyVictory(p, slime);
console.log('報酬:', v);

console.log('\n✅ すべてのスモークテストが通過');
