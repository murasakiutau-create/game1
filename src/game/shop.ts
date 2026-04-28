import { EQUIPMENTS, EQUIPMENT_IDS, type EquipmentId, type EquipSlot } from '../data/equipment';
import { MATERIALS, type MaterialId } from '../data/materials';
import { effectiveStats, clampHp, type PlayerState } from './state';

export function shopInventory(player: PlayerState): EquipmentId[] {
  return EQUIPMENT_IDS.filter((id) => {
    const eq = EQUIPMENTS[id];
    if (eq.unlockAfterBoss && !player.bossDefeated) return false;
    if (player.ownedEquipment.includes(id)) return false;
    return true;
  });
}

export function buyEquipment(
  player: PlayerState,
  id: EquipmentId,
): { ok: true } | { ok: false; reason: string } {
  const eq = EQUIPMENTS[id];
  if (!eq) return { ok: false, reason: '装備が存在しません' };
  if (player.ownedEquipment.includes(id)) return { ok: false, reason: '既に所持しています' };
  if (eq.unlockAfterBoss && !player.bossDefeated) return { ok: false, reason: 'まだ解禁されていません' };
  if (player.gold < eq.price) return { ok: false, reason: 'goldが足りません' };
  player.gold -= eq.price;
  player.ownedEquipment.push(id);
  return { ok: true };
}

export function equipItem(player: PlayerState, id: EquipmentId): void {
  const eq = EQUIPMENTS[id];
  if (!player.ownedEquipment.includes(id)) return;
  const slot = eq.slot as EquipSlot;
  player.equippedGear[slot] = id;
  // maxHp 上限変動に追従。HPは増えない（拠点で全回復するので）
  clampHp(player);
}

export function unequipSlot(player: PlayerState, slot: EquipSlot): void {
  player.equippedGear[slot] = null;
  clampHp(player);
}

// 換金品（=素材）を一括売却。引数で素材ごとの売却数を渡す
export function sellMaterials(
  player: PlayerState,
  amounts: Partial<Record<MaterialId, number>>,
): number {
  let total = 0;
  for (const [matId, qty] of Object.entries(amounts) as [MaterialId, number][]) {
    if (!qty || qty <= 0) continue;
    const have = player.materials[matId] ?? 0;
    const take = Math.min(have, qty);
    if (take <= 0) continue;
    const price = MATERIALS[matId].sellPrice;
    total += price * take;
    player.materials[matId] = have - take;
  }
  player.gold += total;
  return total;
}

// 装備の最終ステータス確認用（UIで表示）
export function gearSummary(player: PlayerState): {
  slot: EquipSlot;
  id: EquipmentId | null;
}[] {
  return (['weapon', 'armor', 'accessory'] as EquipSlot[]).map((slot) => ({
    slot,
    id: player.equippedGear[slot],
  }));
}

export { effectiveStats };
