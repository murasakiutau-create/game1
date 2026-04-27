// 3-slot localStorage save system. Each slot stores:
//   { code: "ALC1.<base64>.<hash12>", meta: { day, gold, savedAt, repLabel, partyNames } }
// The `code` itself is the same tamper-checked string emitted by save.js.
// On load we still call importSave() which re-verifies the checksum, so
// editing localStorage by hand still produces a clean rejection.

import { exportSave, importSave } from "./save.js";
import { state, repTier } from "./state.js";

const KEY = (n) => `alc_save_slot_${n}`;
export const SLOT_IDS = [1, 2, 3];

function buildMeta() {
  return {
    day: state.day,
    gold: state.gold,
    savedAt: new Date().toISOString(),
    repLabel: repTier().label,
    partyNames: state.party.map(a => `${a.name}(${a.rankId})`).slice(0, 4),
  };
}

export function readSlot(n) {
  try {
    const raw = localStorage.getItem(KEY(n));
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || typeof obj.code !== "string") return null;
    return obj;
  } catch (_) {
    return null;
  }
}

export function listSlots() {
  return SLOT_IDS.map(id => ({ id, data: readSlot(id) }));
}

export async function writeSlot(n) {
  const code = await exportSave();
  const payload = { code, meta: buildMeta() };
  localStorage.setItem(KEY(n), JSON.stringify(payload));
  return payload;
}

export async function loadSlot(n) {
  const slot = readSlot(n);
  if (!slot) throw new Error("そのスロットには記録がありません。");
  await importSave(slot.code); // validates checksum, throws on tamper
  return slot.meta;
}

export function deleteSlot(n) {
  localStorage.removeItem(KEY(n));
}

export function formatSavedAt(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const pad = (x) => String(x).padStart(2, "0");
    return `${d.getFullYear()}/${pad(d.getMonth()+1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch (_) { return iso; }
}
